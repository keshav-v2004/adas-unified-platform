import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SparkInsights = () => {
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    // Fetch the data that was generated after the user clicked 'Stop' on the Live Feed
    axios.get(`${API_BASE}/adas/analytics/session`)
      .then(res => setSessionData(res.data))
      .catch(() => console.log("No session data yet"));
  }, []);

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card">
        <div className="card-title">Distributed Machine Learning (PySpark)</div>
        <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.7', marginBottom: '20px' }}>
          This module uses Apache Spark's MLlib to run a distributed <code>RandomForestClassifier</code> on the edge-recorded data. It predicts high-severity anomaly frames (Danger Level {'>='} 3) based on the combined sensor matrix.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="kpi info">
            <div className="kpi-label">Algorithm</div>
            <div className="kpi-val" style={{fontSize:'18px'}}>Random Forest</div>
          </div>
          <div className="kpi warn">
            <div className="kpi-label">Trees Configured</div>
            <div className="kpi-val" style={{fontSize:'18px'}}>10 Trees</div>
          </div>
        </div>

        {sessionData ? (
           <div style={{ marginTop: '20px', background: 'var(--bg)', padding: '20px', borderRadius: '8px', border: '1px solid var(--c4)' }}>
              <div className="card-title" style={{ color: 'var(--c4)' }}>Live Session Predictions</div>
              <div style={{ fontSize: '2em', color: 'var(--text)' }}>
                {sessionData.sparkPredictedAnomalies} <span style={{fontSize: '14px', color: 'var(--muted)'}}>High-Risk Frames Detected</span>
              </div>
           </div>
        ) : (
           <div style={{ marginTop: '20px', padding: '20px', border: '1px dashed var(--border2)', color: 'var(--muted)' }}>
              Run the Live Feed simulation and click "Stop" to generate Spark ML predictions.
           </div>
        )}
      </div>
    </div>
  );
};

export default SparkInsights;