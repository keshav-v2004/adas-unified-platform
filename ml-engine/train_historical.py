from pyspark.sql import SparkSession
from pyspark.ml.feature import VectorAssembler
from pyspark.ml.classification import RandomForestClassifier
from pyspark.sql.types import DoubleType
import os

print("Booting PySpark Training Pipeline...")

spark = SparkSession.builder.appName("ADAS_Historical_Trainer").getOrCreate()

# 1. Load the massive historical dataset
df = spark.read.csv("ADAS FINAL ANALYSIS LAST (1).csv", header=True, inferSchema=True)

# 2. CLEAN THE DATA: Force cast all feature columns and the label to Double/Numeric
feature_cols = ["FL", "FR", "BL", "BR", "Steering_Angle", "Aggression_Score"]

for col_name in feature_cols + ["Danger"]:
    # This converts strings to numbers. If it hits text like "N/A", it turns it into a Null.
    df = df.withColumn(col_name, df[col_name].cast(DoubleType()))

# Drop any rows where the casting failed (removes garbage data)
df = df.dropna(subset=feature_cols + ["Danger"])

# 3. Assemble the features
assembler = VectorAssembler(
    inputCols=feature_cols, 
    outputCol="features",
    handleInvalid="skip"
)
data = assembler.transform(df)

# 4. Train the Model
print("Training Random Forest on Historical Data...")
rf = RandomForestClassifier(labelCol="Danger", featuresCol="features", numTrees=20, maxDepth=10)
model = rf.fit(data)

# 5. Save the compiled model (Overwrite if it already exists)
model_path = "saved_models/adas_rf_model"
model.write().overwrite().save(model_path)

print(f"Model successfully saved to {model_path}")
spark.stop()