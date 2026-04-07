from pyspark.sql import SparkSession
from pyspark.ml.feature import VectorAssembler
from pyspark.ml.classification import RandomForestClassifier
import os

print("Booting PySpark Training Pipeline...")

spark = SparkSession.builder.appName("ADAS_Historical_Trainer").getOrCreate()

# 1. Load the massive historical dataset
df = spark.read.csv("ADAS FINAL ANALYSIS LAST (1).csv", header=True, inferSchema=True)

# 2. Assemble the features. 
# CRITICAL: These must exactly match the columns your live R script produces
assembler = VectorAssembler(
    inputCols=["FL", "FR", "BL", "BR", "Steering_Angle", "Aggression_Score"], 
    outputCol="features",
    handleInvalid="skip" # Skips rows with missing data
)
data = assembler.transform(df)

# 3. Train the Model
print("Training Random Forest on Historical Data...")
rf = RandomForestClassifier(labelCol="Danger", featuresCol="features", numTrees=20, maxDepth=10)
model = rf.fit(data)

# 4. Save the compiled model (Overwrite if it already exists)
model_path = "saved_models/adas_rf_model"
model.write().overwrite().save(model_path)

print(f"Model successfully saved to {model_path}")
spark.stop()