from flask import Flask, request, jsonify
import subprocess
import pandas as pd
import os
import sys

app = Flask(__name__)

MASTER_CSV_PATH = 'ADAS FINAL ANALYSIS LAST (1).csv'
MODEL_PATH = 'saved_models/adas_rf_model'


def ensure_spark_model():
    if os.path.isdir(MODEL_PATH):
        return

    train_result = subprocess.run([sys.executable, 'train_historical.py'], capture_output=True, text=True)
    if train_result.returncode != 0:
        raise RuntimeError(f"Model training failed: {train_result.stderr or train_result.stdout}")

@app.route('/process-session', methods=['POST'])
def process_session():
    payload = request.json
    raw_data = payload.get('data', [])

    if not raw_data:
        return jsonify({"error": "No data provided"}), 400

    # 1. Convert JSON to Pandas DataFrame
    df = pd.DataFrame(raw_data)
    
    # 2. Save temporary file for the R script
    df.to_csv('session_raw.csv', index=False)

    # 3. Append to the Master Data Lake CSV for historical retraining
    # (Writes headers only if the file doesn't exist yet)
    file_exists = os.path.isfile(MASTER_CSV_PATH)
    df.to_csv(MASTER_CSV_PATH, mode='a', header=not file_exists, index=False)
    print(f"Appended {len(df)} frames to Master Data Lake.")

    # 4. Ensure a trained model exists before live inference.
    try:
        ensure_spark_model()
    except Exception as e:
        return jsonify({"error": "Failed to prepare Spark model", "details": str(e)}), 500

    # 5. Trigger R Feature Engineering
    print("Running R Feature Engineering...")
    r_result = subprocess.run(['Rscript', 'feature_engineering.R'], capture_output=True, text=True)
    if r_result.returncode != 0:
        return jsonify({"error": "R script failed", "details": r_result.stderr}), 500

    # 6. Trigger PySpark Inference
    print("Running PySpark ML Pipeline...")
    spark_result = subprocess.run([sys.executable, 'spark_model.py'], capture_output=True, text=True)
    if spark_result.returncode != 0:
        return jsonify({"error": "Spark script failed", "details": spark_result.stderr or spark_result.stdout}), 500

    # 7. Read final output and return to Node
    try:
        final_df = pd.read_csv('session_final_spark.csv')
        final_df = final_df.where(pd.notnull(final_df), None)
        results = final_df.to_dict(orient='records')
        return jsonify({"results": results})
    except Exception as e:
        return jsonify({"error": "Failed to read final CSV", "details": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)