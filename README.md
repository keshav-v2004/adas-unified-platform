# ADAS Unified Platform

End-to-end ADAS simulation platform built with a MERN-style architecture plus an R + PySpark ML pipeline.

The system simulates multi-sensor vehicle data in real time, performs post-session feature engineering and ML inference, stores frame/session analytics in MongoDB, and visualizes insights through a React dashboard.

## 1. Project Goals

- Simulate Advanced Driver Assistance System (ADAS) telemetry using four ultrasonic zones (FL, FR, BL, BR).
- Capture a session as time-series frames from the UI.
- Engineer additional features using R.
- Run PySpark Random Forest inference for high-risk prediction.
- Persist frame-level and session-level analytics in MongoDB.
- Display operational and analytical views in separate dashboard tabs.

## 2. High-Level Architecture

```text
React (frontend)
   |
   | 1) /session/start, /session/record, /session/stop
   v
Node/Express API (backend)
   |
   | 2) POST /process-session
   v
Flask ML Engine (ml-engine)
   |--- Rscript feature_engineering.R
   |--- python spark_model.py (PySpark inference)
   v
session_final_spark.csv
   |
   | 3) response.results -> backend
   v
MongoDB
   |--- adasdatas (frame-level)
   |--- sessionsummaries (session-level)
   v
React tabs (Analytics, R Insights, Spark Insights)
```

## 3. Technology Stack

### Frontend
- React 19
- Vite
- Axios
- Chart.js + react-chartjs-2

### Backend
- Node.js + Express
- Mongoose
- Axios (backend-to-ML service calls)
- CORS + dotenv

### ML/Feature Layer
- Flask
- Pandas
- PySpark MLlib
- R (feature engineering)
- Java Runtime (required for Spark)

### Data
- MongoDB (containerized)
- CSV artifacts for pipeline handoff in ml-engine

### DevOps
- Docker + Docker Compose

## 4. Repository Structure

```text
adas-unified-platform/
  docker-compose.yml
  README.md
  backend/
    Dockerfile
    package.json
    server.js
    seed.js
    seed_summaries.js
    models/
      AdasData.js
      SessionSummary.js
    routes/
      adasRoutes.js
  frontend/
    Dockerfile
    package.json
    vite.config.js
    src/
      App.jsx
      main.jsx
      index.css
      App.css
      components/
        LiveFeed.jsx
        Analytics.jsx
        RInsights.jsx
        SparkInsights.jsx
        Hardware.jsx
  ml-engine/
    Dockerfile
    requirements.txt
    app.py
    feature_engineering.R
    train_historical.py
    spark_model.py
    ADAS FINAL ANALYSIS LAST (1).csv
```

## 5. Docker Services

Defined in docker-compose.yml:

- `mongo`
  - Image: `mongo:latest`
  - Port: `27017`
  - Volume: `mongo_data:/data/db`

- `ml-engine`
  - Build context: `./ml-engine`
  - Port: `5001`
  - Runs Flask API and invokes R + Spark scripts

- `backend`
  - Build context: `./backend`
  - Port: `5000`
  - Environment:
    - `MONGO_URI=mongodb://mongo:27017/adas_db`
    - `ML_SERVICE_URL=http://ml-engine:5001`

- `frontend`
  - Build context: `./frontend`
  - Port: `5173`
  - Environment:
    - `VITE_API_URL=http://localhost:5000/api`

## 6. Frontend Module Deep Dive

## 6.1 App Shell and Navigation

File: `frontend/src/App.jsx`

- Top navigation tabs:
  - Live Feed
  - BI Analytics
  - R Insights
  - PySpark ML
  - TinyML
- Renders one component tab at a time.
- Uses global styles from `index.css`.

## 6.2 LiveFeed Component

File: `frontend/src/components/LiveFeed.jsx`

Purpose:
- Simulates 120 frames per run.
- Sends each frame to backend while playing.
- Displays operational telemetry in three-pane layout.

Main responsibilities:
- Session lifecycle:
  - `startSession()` -> POST `/adas/session/start`
  - periodic frame generation -> POST `/adas/session/record`
  - `stopSession()` -> POST `/adas/session/stop`
- Sensor simulation:
  - Synthetic FL/FR/BL/BR trajectories using piecewise function.
- Derived operational values:
  - danger level, safety %, TTC, steering angle, event log.
- Visuals:
  - left panel: danger ring, sensor bars, steering, TTC
  - center panel: KPIs, radar, timeline, playback controls
  - right panel: zone proximity, alerts, PySpark metadata panel
- ML insights compatibility:
  - accepts both old (`features_used`) and new (`model.featuresUsed`) API shapes.

## 6.3 BI Analytics Component

File: `frontend/src/components/Analytics.jsx`

Purpose:
- Dashboard replacement for BI-style insights with historical and session modes.

Data fetches:
- GET `/adas/analytics/kpis`
- GET `/adas/analytics/session`
- GET `/adas/analytics/frame-insights`

Visualizations:
- KPI cards (fleet safety, aggression, hard turns, critical brakes)
- Doughnut: danger distribution
- Bar: status frequency
- Bar: steering angle distribution
- Scatter: safety vs minimum distance
- Pie: threat source breakdown
- Line: aggression timeline

## 6.4 R Insights Component

File: `frontend/src/components/RInsights.jsx`

Purpose:
- Show R-engineered session health and risk rates with interpretable metrics.

Data source:
- GET `/adas/analytics/r-insights`

Displayed metrics:
- Frames in Mongo
- Session Safety %
- Critical Frame Rate %
- Model Alert Rate %
- Avg Rear Distance (cm)
- Hard Maneuver Rate %
- Avg Aggression Index
- Dominant status

## 6.5 Spark Insights Component

File: `frontend/src/components/SparkInsights.jsx`

Purpose:
- Show model configuration and latest live inference outcomes.

Data source:
- GET `/adas/insights`

Displayed sections:
- Model metadata (algorithm, trees, max depth, feature count)
- Model inputs and high-risk decision rule
- Live session prediction summary:
  - high-risk frames
  - high-risk rate
  - critical frame rate
  - average safety

## 6.6 Hardware Component

File: `frontend/src/components/Hardware.jsx`

Purpose:
- TinyML hardware documentation panel in UI.

Contains:
- SVG wiring diagram (Arduino + 4 ultrasonic sensors + LCD + buzzer)
- External Tinkercad link
- Bill of Materials table
- TinyML deployment pipeline steps

## 7. Backend Module Deep Dive

## 7.1 Server Entry

File: `backend/server.js`

Responsibilities:
- Initializes Express app
- Configures CORS for frontend origins
- Connects to MongoDB (`MONGO_URI`)
- Mounts routes at `/api/adas`
- Starts server on port 5000

## 7.2 Data Models

### AdasData Model
File: `backend/models/AdasData.js`

Stores frame-level records, including:
- raw sensors: FL, FR, BL, BR
- danger/safety: Danger, Safety_Pct, TTC_Seconds
- driving dynamics: Rel_Speed, Acceleration, Steering_Angle
- engineered fields: Aggression_Score, Threat_Source, Status_Label

### SessionSummary Model
File: `backend/models/SessionSummary.js`

Stores session-level KPIs, including:
- totalFrames
- avgSafetyPct
- sparkPredictedAnomalies
- totalCriticalRisk
- avgRearThreat (currently mean rear distance value)
- avgAggressionScore
- hardTurns
- criticalBrakes
- sessionDate

## 7.3 Route Controller

File: `backend/routes/adasRoutes.js`

### Live Session Ingestion
- `POST /session/start`
  - resets in-memory frame buffer
- `POST /session/record`
  - appends one frame to `currentSessionData`
- `POST /session/stop`
  - sends buffered frames to ML engine
  - receives inferred frames
  - computes session KPIs
  - persists frame docs to `adasdatas`
  - persists KPI summary to `sessionsummaries`

### Analytics APIs
- `GET /analytics/session`
  - latest session KPI payload
- `GET /analytics/kpis`
  - aggregated fleet KPIs across sessions
- `GET /analytics/frame-insights`
  - danger distribution
  - status frequency
  - steering histogram buckets
  - safety scatter points
  - inferred threat source breakdown
  - aggression timeline
- `GET /analytics/r-insights`
  - latest session + top statuses + derived rate metrics

### Spark Metadata/Session Insights API
- `GET /insights`
  - model metadata (RandomForest config + features)
  - latest session high-risk and critical rates

## 8. ML Engine Deep Dive

## 8.1 Flask Orchestrator

File: `ml-engine/app.py`

Endpoint: `POST /process-session`

Pipeline executed per session:
1. Convert incoming JSON frames to DataFrame.
2. Save `session_raw.csv`.
3. Append raw session to historical lake CSV (`ADAS FINAL ANALYSIS LAST (1).csv`).
4. Ensure Spark model exists; if absent, train via `train_historical.py`.
5. Run R feature engineering script.
6. Run PySpark inference script.
7. Return `session_final_spark.csv` as JSON records.

## 8.2 R Feature Engineering

File: `ml-engine/feature_engineering.R`

Transformations:
- Numeric casting for key fields
- `Min_Dist = pmin(FL, FR, BL, BR)`
- `Rear_Threat = (BL + BR) / 2`
- Recompute `Aggression_Score = (Rel_Speed / Min_Dist) * 100` when valid
- `Engineered_Status` categorical labeling

Output:
- `session_engineered.csv`

## 8.3 PySpark Inference

File: `ml-engine/spark_model.py`

Steps:
- Load `RandomForestClassificationModel` from `saved_models/adas_rf_model`
- Read `session_engineered.csv`
- Assemble feature vector with:
  - FL, FR, BL, BR, Steering_Angle, Aggression_Score
- Predict using trained model
- Write predictions to `session_final_spark.csv`

## 8.4 PySpark Training

File: `ml-engine/train_historical.py`

Steps:
- Load historical CSV
- Cast feature + label columns to numeric (DoubleType)
- Drop invalid rows
- Vector assemble features
- Train `RandomForestClassifier` with:
  - `numTrees=20`
  - `maxDepth=10`
- Save model to `saved_models/adas_rf_model`

## 8.5 ML Container

File: `ml-engine/Dockerfile`

Includes:
- Python 3.10 slim
- Java runtime (Spark dependency)
- R base runtime
- Python dependencies from `requirements.txt`

## 9. Data Flow in One Session

1. User opens Live Feed and clicks Play.
2. Frontend starts session and streams synthetic frames to backend.
3. User clicks Stop.
4. Backend sends full frame batch to ML engine.
5. ML engine runs:
   - R feature engineering
   - Spark inference
6. ML engine returns enriched frames.
7. Backend stores:
   - frame-level documents in `adasdatas`
   - session summary in `sessionsummaries`
8. Frontend tabs fetch and render analytics from backend APIs.

## 10. API Reference

Base URL:
- Browser/client via Vite: `http://localhost:5000/api/adas`
- Inside Docker service network: backend calls ML engine via `http://ml-engine:5001`

### Session APIs

- `POST /session/start`
- `POST /session/record`
- `POST /session/stop`

### Analytics APIs

- `GET /analytics/session`
- `GET /analytics/kpis`
- `GET /analytics/frame-insights`
- `GET /analytics/r-insights`

### Spark Metadata API

- `GET /insights`

## 11. Run Instructions

## 11.1 Docker (Recommended)

From repository root:

```bash
docker compose up -d --build
```

Access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/adas
- ML Engine: http://localhost:5001
- MongoDB: mongodb://localhost:27017

Stop all:

```bash
docker compose down
```

Rebuild specific services:

```bash
docker compose up -d --build backend frontend
docker compose up -d --build ml-engine
```

## 11.2 Local (Without Docker)

Requirements:
- Node.js 18+
- Python 3.10+
- Java runtime
- R + Rscript
- MongoDB local instance

Start order:
1. MongoDB
2. ML engine (`python app.py` in `ml-engine`)
3. Backend (`npm start` in `backend`)
4. Frontend (`npm run dev` in `frontend`)

## 12. Seeding and Test Data

Backend includes seed scripts:
- `backend/seed.js`
- `backend/seed_summaries.js`

Purpose:
- insert synthetic session summaries into MongoDB to populate dashboards quickly.

## 13. Known Characteristics and Current Tradeoffs

- Session ingestion is in-memory inside backend route module.
- CSV files are used as handoff between Flask, R, and Spark scripts.
- Training can be triggered automatically when model path is missing.
- `avgRearThreat` currently stores average rear distance magnitude; UI labels this as distance in R Insights for clarity.

## 14. Suggested Next Engineering Improvements

- Replace CSV handoff with Parquet for schema integrity and speed.
- Move to job queue for non-blocking session post-processing.
- Add model/version metadata persistence (model version, feature version).
- Add automated tests for API contracts and R/Spark feature parity.
- Add authentication and role-based access for production usage.

## 15. Quick Troubleshooting

- Frontend cannot reach backend:
  - verify `VITE_API_URL` and backend container status.
- Backend cannot reach ML engine:
  - verify `ML_SERVICE_URL=http://ml-engine:5001` in compose.
- Spark errors in ML engine:
  - ensure Java is installed (already in Dockerfile).
- R script failure:
  - inspect ML engine logs for `feature_engineering.R` stderr.

Useful commands:

```bash
docker compose ps
docker compose logs -f backend
docker compose logs -f ml-engine
docker compose logs -f frontend
```

---

This README reflects the current implementation in the repository and documents all major modules, tabs, services, routes, and ML pipeline stages.