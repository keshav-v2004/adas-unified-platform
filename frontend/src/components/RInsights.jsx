import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const RInsights = () => {
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/adas/analytics/r-insights`)
      .then((res) => setInsights(res.data))
      .catch(() => setInsights(null));
  }, []);

  const latestSession = insights?.latestSession;

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card">
        <div className="card-title">R Workspace Analysis</div>
        <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.7', marginBottom: '12px' }}>
          The R feature engineering pipeline computes per-frame risk metrics and status labels used by Spark inference.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          <div className="kpi info"><div className="kpi-label">Frames In Mongo</div><div className="kpi-val" style={{fontSize:'14px'}}>{insights?.totalFramesStored ?? 0}</div></div>
          <div className="kpi safe"><div className="kpi-label">Avg Aggression</div><div className="kpi-val" style={{fontSize:'14px'}}>{latestSession?.avgAggressionScore?.toFixed(2) ?? '0.00'}</div></div>
          <div className="kpi warn"><div className="kpi-label">Avg Rear Threat</div><div className="kpi-val" style={{fontSize:'14px'}}>{latestSession?.avgRearThreat?.toFixed(2) ?? '0.00'}</div></div>
        </div>

        <div style={{ marginTop: '16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px' }}>
          <div className="card-title" style={{ marginBottom: '8px' }}>Top Engineered Status Labels</div>
          {insights?.topStatuses?.length ? (
            insights.topStatuses.map((statusRow) => (
              <div key={statusRow._id || 'unknown'} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--muted)' }}>{statusRow._id || 'UNKNOWN'}</span>
                <span style={{ color: 'var(--text)', fontFamily: 'var(--mono)' }}>{statusRow.count}</span>
              </div>
            ))
          ) : (
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '12px' }}>No engineered statuses yet. Run a Live Feed session to generate R outputs.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RInsights;