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
  const metrics = insights?.metrics;

  const formatNum = (value, digits = 2) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return '0.00';
    return numeric.toFixed(digits);
  };

  const formatPct = (value) => `${formatNum(value, 1)}%`;

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card">
        <div className="card-title">R Workspace Analysis</div>
        <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.7', marginBottom: '12px' }}>
          These metrics summarize engineered R features into session-level safety, proximity, and maneuver quality indicators.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '10px' }}>
          <div className="kpi info"><div className="kpi-label">Frames In Mongo</div><div className="kpi-val" style={{fontSize:'14px'}}>{insights?.totalFramesStored ?? 0}</div></div>
          <div className="kpi safe"><div className="kpi-label">Session Safety</div><div className="kpi-val" style={{fontSize:'14px'}}>{formatPct(metrics?.sessionSafetyPct)}</div></div>
          <div className="kpi warn"><div className="kpi-label">Critical Frame Rate</div><div className="kpi-val" style={{fontSize:'14px'}}>{formatPct(metrics?.criticalFrameRate)}</div></div>
          <div className="kpi info"><div className="kpi-label">Model Alert Rate</div><div className="kpi-val" style={{fontSize:'14px'}}>{formatPct(metrics?.modelAlertRate)}</div></div>
          <div className="kpi safe"><div className="kpi-label">Avg Rear Distance</div><div className="kpi-val" style={{fontSize:'14px'}}>{formatNum(metrics?.avgRearDistanceCm)} cm</div></div>
          <div className="kpi warn"><div className="kpi-label">Hard Maneuver Rate</div><div className="kpi-val" style={{fontSize:'14px'}}>{formatPct(metrics?.hardManeuverRate)}</div></div>
          <div className="kpi danger"><div className="kpi-label">Avg Aggression Index</div><div className="kpi-val" style={{fontSize:'14px'}}>{formatNum(metrics?.avgAggressionScore)}</div></div>
          <div className="kpi info"><div className="kpi-label">Dominant Status</div><div className="kpi-val" style={{fontSize:'14px'}}>{metrics?.topStatusLabel || 'UNKNOWN'}</div></div>
        </div>

        <div style={{ marginTop: '16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px' }}>
          <div className="card-title" style={{ marginBottom: '8px' }}>Top Engineered Status Labels</div>
          {latestSession && (
            <p style={{ marginBottom: '10px', color: 'var(--muted)', fontSize: '12px', lineHeight: '1.6' }}>
              Latest session analyzed <span style={{ color: 'var(--text)' }}>{metrics?.totalFrames || latestSession.totalFrames || 0}</span> frames.
              Dominant engineered state: <span style={{ color: 'var(--text)' }}>{metrics?.topStatusLabel || 'UNKNOWN'}</span>
              {' '}({metrics?.topStatusCount || 0} frames).
            </p>
          )}
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