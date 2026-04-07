import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut, Scatter, Pie, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Analytics = () => {
  const [viewMode, setViewMode] = useState('historical'); // 'historical' or 'session'
  const [historicalData, setHistoricalData] = useState(null);
  const [sessionData, setSessionData] = useState(null);
  const [frameInsights, setFrameInsights] = useState(null);

  useEffect(() => {
    // 1. Fetch Historical PowerBI Replacement Data
    axios.get(`${API_BASE}/adas/analytics/kpis`)
      .then(res => setHistoricalData(res.data))
      .catch(err => console.log(err));

    // 2. Fetch Live Session Engineered Data
    axios.get(`${API_BASE}/adas/analytics/session`)
      .then(res => setSessionData(res.data))
      .catch(err => console.log("No session data yet"));

    axios.get(`${API_BASE}/adas/analytics/frame-insights`)
      .then(res => setFrameInsights(res.data))
      .catch(() => console.log("No frame insights data yet"));
  }, [viewMode]);

  const chartBaseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#8fa5be',
          font: { family: 'DM Mono' }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: '#7991ab', font: { family: 'DM Mono' } },
        grid: { color: 'rgba(40,71,105,0.45)' }
      },
      y: {
        ticks: { color: '#7991ab', font: { family: 'DM Mono' } },
        grid: { color: 'rgba(40,71,105,0.45)' }
      }
    }
  };

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div className="card">
                <div className="card-title">Average Fleet Safety</div>
                <div style={{ fontSize: '2em', color: 'var(--c0)' }}>{historicalData.avgSafety?.toFixed(2)}%</div>
              </div>
              <div className="card">
                <div className="card-title">Average Aggression Score</div>
                <div style={{ fontSize: '2em', color: 'var(--c3)' }}>{historicalData.avgAggression?.toFixed(2)}</div>
              </div>
              <div className="card">
                <div className="card-title">Total Hard Turns</div>
                <div style={{ fontSize: '2em', color: 'var(--c2)' }}>{historicalData.totalHardTurns || 0}</div>
              </div>
              <div className="card">
                <div className="card-title">Total Critical Brakes</div>
                <div style={{ fontSize: '2em', color: 'var(--c4)' }}>{historicalData.totalCriticalBrakes || 0}</div>
              </div>
            </div>

            {frameInsights && frameInsights.totalFrames > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                <div className="card" style={{ minHeight: '260px' }}>
                  <div className="card-title">Danger Level Distribution</div>
                  <div style={{ height: '210px' }}>
                    <Doughnut
                      data={{
                        labels: frameInsights.dangerDistribution.map(d => d.label),
                        datasets: [{
                          data: frameInsights.dangerDistribution.map(d => d.count),
                          backgroundColor: ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'],
                          borderWidth: 0
                        }]
                      }}
                      options={{ ...chartBaseOptions, cutout: '62%', scales: undefined }}
                    />
                  </div>
                </div>

                <div className="card" style={{ minHeight: '260px' }}>
                  <div className="card-title">Status Label Frequency</div>
                  <div style={{ height: '210px' }}>
                    <Bar
                      data={{
                        labels: frameInsights.statusFrequency.map(d => d.label),
                        datasets: [{
                          label: 'Count',
                          data: frameInsights.statusFrequency.map(d => d.count),
                          backgroundColor: ['#22c55e', '#f97316', '#ef4444', '#3b82f6', '#14b8a6', '#eab308', '#8b5cf6', '#64748b']
                        }]
                      }}
                      options={{ ...chartBaseOptions, plugins: { legend: { display: false } } }}
                    />
                  </div>
                </div>

                <div className="card" style={{ minHeight: '260px' }}>
                  <div className="card-title">Steering Angle Distribution</div>
                  <div style={{ height: '210px' }}>
                    <Bar
                      data={{
                        labels: frameInsights.steeringDistribution.map(d => d.label),
                        datasets: [{
                          label: 'Frames',
                          data: frameInsights.steeringDistribution.map(d => d.count),
                          backgroundColor: '#3b82f6'
                        }]
                      }}
                      options={{ ...chartBaseOptions, plugins: { legend: { display: false } } }}
                    />
                  </div>
                </div>

                <div className="card" style={{ minHeight: '260px' }}>
                  <div className="card-title">Safety % vs Min Distance (Scatter)</div>
                  <div style={{ height: '210px' }}>
                    <Scatter
                      data={{
                        datasets: [{
                          label: 'Frames',
                          data: frameInsights.safetyScatter.map(p => ({ x: p.x, y: p.y })),
                          pointRadius: 3,
                          pointBackgroundColor: frameInsights.safetyScatter.map((p) => {
                            if (p.danger >= 3) return '#ef4444';
                            if (p.danger === 2) return '#f97316';
                            if (p.danger === 1) return '#eab308';
                            return '#22c55e';
                          })
                        }]
                      }}
                      options={{ ...chartBaseOptions, plugins: { legend: { display: false } } }}
                    />
                  </div>
                </div>

                <div className="card" style={{ minHeight: '260px' }}>
                  <div className="card-title">Threat Source Breakdown</div>
                  <div style={{ height: '210px' }}>
                    <Pie
                      data={{
                        labels: frameInsights.threatSourceBreakdown.map(d => d.label),
                        datasets: [{
                          data: frameInsights.threatSourceBreakdown.map(d => d.count),
                          backgroundColor: ['#3b82f6', '#14b8a6', '#a855f7', '#f59e0b']
                        }]
                      }}
                      options={{ ...chartBaseOptions, scales: undefined }}
                    />
                  </div>
                </div>

                <div className="card" style={{ minHeight: '260px' }}>
                  <div className="card-title">Aggression Score Timeline</div>
                  <div style={{ height: '210px' }}>
                    <Line
                      data={{
                        labels: frameInsights.aggressionTimeline.map(p => p.frame),
                        datasets: [{
                          label: 'Aggression Score',
                          data: frameInsights.aggressionTimeline.map(p => p.value),
                          borderColor: '#f97316',
                          pointRadius: 0,
                          borderWidth: 2,
                          tension: 0.25
                        }]
                      }}
                      options={{ ...chartBaseOptions, plugins: { legend: { display: false } } }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="card">
                <p style={{ color: 'var(--muted)' }}>No frame insights available yet. Run the Live Feed and click STOP to generate analytics visuals.</p>
              </div>
            )}
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