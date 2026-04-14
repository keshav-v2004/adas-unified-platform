import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SparkInsights = () => {
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/adas/insights`)
      .then((res) => setInsights(res.data))
      .catch(() => setInsights(null));
  }, []);

  const model = insights?.model;
  const liveSession = insights?.liveSession;

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card">
        <div className="card-title">Distributed Machine Learning (PySpark)</div>
        <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.7', marginBottom: '20px' }}>
          Spark MLlib runs RandomForest inference on engineered session frames and flags high-risk events from the model output.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
          <div className="kpi info">
            <div className="kpi-label">Algorithm</div>
            <div className="kpi-val" style={{ fontSize: '16px' }}>{model?.name || 'RandomForestClassifier'}</div>
          </div>
          <div className="kpi warn">
            <div className="kpi-label">Trees Configured</div>
            <div className="kpi-val" style={{ fontSize: '16px' }}>{model?.trainingConfig?.numTrees ?? 20} Trees</div>
          </div>
          <div className="kpi safe">
            <div className="kpi-label">Max Depth</div>
            <div className="kpi-val" style={{ fontSize: '16px' }}>{model?.trainingConfig?.maxDepth ?? 10}</div>
          </div>
          <div className="kpi info">
            <div className="kpi-label">Features Used</div>
            <div className="kpi-val" style={{ fontSize: '16px' }}>{model?.featuresUsed?.length ?? 6}</div>
          </div>
        </div>

        <div style={{ marginTop: '16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px' }}>
          <div className="card-title" style={{ marginBottom: '6px' }}>Model Inputs</div>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)', lineHeight: '1.7' }}>
            {model?.featuresUsed?.join(', ') || 'FL, FR, BL, BR, Steering_Angle, Aggression_Score'}
          </p>
          <p style={{ marginTop: '8px', marginBottom: 0, fontSize: '12px', color: 'var(--muted)' }}>
            High-risk decision rule: <span style={{ color: 'var(--text)', fontFamily: 'var(--mono)' }}>{model?.trainingConfig?.highRiskRule || 'prediction >= 3'}</span>
          </p>
        </div>

        {liveSession?.available ? (
          <div style={{ marginTop: '16px', background: 'var(--bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--c4)' }}>
            <div className="card-title" style={{ color: 'var(--c4)', marginBottom: '10px' }}>Live Session Predictions</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              <div className="kpi danger">
                <div className="kpi-label">High-Risk Frames</div>
                <div className="kpi-val" style={{ fontSize: '15px' }}>{liveSession.highRiskFrames}</div>
              </div>
              <div className="kpi warn">
                <div className="kpi-label">High-Risk Rate</div>
                <div className="kpi-val" style={{ fontSize: '15px' }}>{liveSession.highRiskRatePct?.toFixed(2)}%</div>
              </div>
              <div className="kpi info">
                <div className="kpi-label">Critical Frame Rate</div>
                <div className="kpi-val" style={{ fontSize: '15px' }}>{liveSession.criticalRatePct?.toFixed(2)}%</div>
              </div>
              <div className="kpi safe">
                <div className="kpi-label">Avg Safety</div>
                <div className="kpi-val" style={{ fontSize: '15px' }}>{liveSession.avgSafetyPct?.toFixed(2)}%</div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ marginTop: '16px', padding: '16px', border: '1px dashed var(--border2)', color: 'var(--muted)' }}>
            No session inference available yet. Run Live Feed and click Stop to generate Spark predictions for this panel.
          </div>
        )}
      </div>
    </div>
  );
};

export default SparkInsights;