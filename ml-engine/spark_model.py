from pyspark.sql import SparkSession
from pyspark.ml.feature import VectorAssembler
from pyspark.ml.classification import RandomForestClassificationModel
import pandas as pd
import sys

spark = SparkSession.builder.appName("ADAS_Live_Inference").getOrCreate()

try:
    # 1. Load the pre-trained historical model
    model = RandomForestClassificationModel.load("saved_models/adas_rf_model")
except Exception as e:
    print("Error: Model not found. Please run the training script first.")
    sys.exit(1)

# 2. Read the live session data from R
df = spark.read.csv("session_engineered.csv", header=True, inferSchema=True)

# 3. Assemble features (Must match the training script!)
assembler = VectorAssembler(
    inputCols=["FL", "FR", "BL", "BR", "Steering_Angle", "Aggression_Score"], 
    outputCol="features"
)
data = assembler.transform(df)

# 4. Predict using the historical model
print("Running Live Inference...")
predictions = model.transform(data)

# 5. Save results for Node/React
pred_df = predictions.toPandas()
pred_df.to_csv("session_final_spark.csv", index=False)

spark.stop()