# Read the raw session data collected by Node.js
data <- read.csv("session_raw.csv")

# 1. Convert frontend string types to numeric so math doesn't fail
data$Rel_Speed <- as.numeric(as.character(data$Rel_Speed))
data$FL <- as.numeric(data$FL)
data$FR <- as.numeric(data$FR)
data$BL <- as.numeric(data$BL)
data$BR <- as.numeric(data$BR)

# 2. Derive Min_Dist dynamically from the sensor array
data$Min_Dist <- pmin(data$FL, data$FR, data$BL, data$BR, na.rm = TRUE)

# 3. Calculate Combined Rear Threat factor
data$Rear_Threat <- (data$BL + data$BR) / 2

# 4. Derive Aggression_Score (OVERWRITING the string sent from React)
# CRITICAL: This must be named Aggression_Score to match PySpark
data$Aggression_Score <- ifelse(data$Min_Dist > 0 & !is.na(data$Rel_Speed), 
                               (data$Rel_Speed / data$Min_Dist) * 100, 
                               0)

# 5. Create Categorical Status
data$Engineered_Status <- ifelse(data$Aggression_Score > 50, "CRITICAL RISK",
                          ifelse(data$Aggression_Score > 20, "WARNING", "SAFE"))

# Write the engineered dataset back for PySpark to consume
write.csv(data, "session_engineered.csv", row.names = FALSE)
cat("Feature engineering complete.\n")