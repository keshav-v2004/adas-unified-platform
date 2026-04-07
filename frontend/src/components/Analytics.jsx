import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Analytics = () => {
  const [viewMode, setViewMode] = useState('historical'); // 'historical' or 'session'
  const [historicalData, setHistoricalData] = useState(null);
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {
    // 1. Fetch Historical PowerBI Replacement Data
    axios.get(`${API_BASE}/adas/analytics/kpis`)
      .then(res => setHistoricalData(res.data))
      .catch(err => console.log(err));

    // 2. Fetch Live Session Engineered Data
    axios.get(`${API_BASE}/adas/analytics/session`)
      .then(res => setSessionData(res.data))
      .catch(err => console.log("No session data yet"));
  }, [viewMode]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2>BI Analytics Dashboard</h2>
        <div style={{ display: 'flex', background: 'var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
          <button 
            onClick={() => setViewMode('historical')}
            style={{ padding: '10px 20px', border: 'none', background: viewMode === 'historical' ? 'var(--dim)' : 'transparent', color: 'white', cursor: 'pointer' }}>
            Historical (PowerBI) Data
          </button>
          <button 
            onClick={() => setViewMode('session')}
            style={{ padding: '10px 20px', border: 'none', background: viewMode === 'session' ? 'var(--c3)' : 'transparent', color: 'white', cursor: 'pointer' }}>
            Live Session Engineered Data
          </button>
        </div>
      </div>

      {viewMode === 'historical' ? (
        historicalData ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="card">
              <div className="card-title">Average Fleet Safety</div>
              <div style={{ fontSize: '2em', color: 'var(--c0)' }}>{historicalData.avgSafety?.toFixed(2)}%</div>
            </div>
            <div className="card">
              <div className="card-title">Average Aggression Score</div>
              <div style={{ fontSize: '2em', color: 'var(--c3)' }}>{historicalData.avgAggression?.toFixed(2)}</div>
            </div>
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <div className="card-title">Incident Breakdown (Hard Turns vs Brakes)</div>
              <div style={{ height: '300px' }}>
                <Bar 
                  data={{
                    labels: ['Hard Turns', 'Critical Brakes'],
                    datasets: [{
                      label: 'Incident Count',
                      data: [historicalData.totalHardTurns, historicalData.totalCriticalBrakes],
                      backgroundColor: ['rgba(234, 179, 8, 0.8)', 'rgba(249, 115, 22, 0.8)']
                    }]
                  }} 
                  options={{ responsive: true, maintainAspectRatio: false }}
                />
              </div>
            </div>
          </div>
        ) : <p>Loading historical MongoDB data...</p>
      ) : (
        sessionData ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="card">
              <div className="card-title">Engineered Critical Risks</div>
              <div style={{ fontSize: '2em', color: 'var(--c4)' }}>{sessionData.totalCriticalRisk}</div>
            </div>
            <div className="card">
              <div className="card-title">Engineered Rear Threat Avg</div>
              <div style={{ fontSize: '2em', color: 'var(--c2)' }}>{sessionData.avgRearThreat?.toFixed(2)}</div>
            </div>
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <p>This data was generated on-the-fly via the R script after you clicked "STOP" on the Live Feed tab.</p>
            </div>
          </div>
        ) : <p style={{color: 'var(--c3)'}}>No session recorded yet. Go to Live Feed, hit Start, wait a few seconds, and hit Stop to generate this data.</p>
      )}
    </div>
  );
};

export default Analytics;