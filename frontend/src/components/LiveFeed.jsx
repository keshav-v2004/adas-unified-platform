// import React, { useState, useRef, useEffect } from 'react';
// import axios from 'axios';

// const LiveFeed = () => {
//   // Default starting frame state matching the dashboard
//   const [frameData, setFrameData] = useState({
//     FL: 250, FR: 250, BL: 250, BR: 250,
//     Danger: 0, Safety_Pct: 100, Rel_Speed: 0, Aggression_Score: 0, 
//     Front_Avg: 250, TTC_Seconds: 0, Steering_Angle: 0, 
//     Status_Label: 'CRUISING', Acceleration: 0
//   });

//   const [isRecording, setIsRecording] = useState(false);
//   const recordingInterval = useRef(null);

//   const startSimulation = async () => {
//     try {
//       await axios.post('http://localhost:5000/api/adas/session/start');
//       setIsRecording(true);
      
//       recordingInterval.current = setInterval(async () => {
//         // Simulating data changing over time
//         const newFL = Math.max(10, Math.floor(Math.random() * 300));
//         const newFR = Math.max(10, Math.floor(Math.random() * 300));
//         const newDanger = Math.random() > 0.8 ? 4 : Math.random() > 0.5 ? 3 : 0;
//         const newStatus = newDanger === 4 ? 'COLLISION WARNING' : newDanger === 3 ? 'HARD TURN' : 'CRUISING';
        
//         const simFrame = {
//             FL: newFL, FR: newFR,
//             BL: Math.max(10, Math.floor(Math.random() * 300)), 
//             BR: Math.max(10, Math.floor(Math.random() * 300)),
//             Front_Avg: (newFL + newFR) / 2,
//             Min_Dist: Math.min(newFL, newFR), 
//             Rel_Speed: (Math.random() * 10).toFixed(1),
//             Safety_Pct: newDanger === 4 ? 16.5 : newDanger === 3 ? 27.7 : 98.6, 
//             Aggression_Score: newDanger > 0 ? (Math.random() * 20).toFixed(1) : 0,
//             Steering_Angle: Math.floor(Math.random() * 90) - 45,
//             Status_Label: newStatus,
//             Acceleration: (Math.random() * 2 - 1).toFixed(2)
//         };
//         setFrameData(simFrame);
//         await axios.post('http://localhost:5000/api/adas/session/record', simFrame);
//       }, 1000);
//     } catch (err) { console.error("Start error", err); }
//   };

//   const stopSimulation = async () => {
//     setIsRecording(false);
//     clearInterval(recordingInterval.current);
//     alert("Simulation Stopped. Running R Feature Engineering Pipeline...");
//     try {
//       await axios.post('http://localhost:5000/api/adas/session/stop');
//       alert("R Feature Engineering Complete! Switch to the BI Analytics Tab.");
//     } catch (err) { console.error("Stop error", err); }
//   };

//   // Helper to determine color based on Danger level
//   const getDangerColor = (level) => {
//     if (level >= 4) return 'var(--c4)'; // Critical (Red)
//     if (level === 3) return 'var(--c2)'; // Warning (Yellow)
//     if (level >= 1) return 'var(--c1)'; // Caution (Light Green)
//     return 'var(--c0)'; // Safe (Green)
//   };

//   const dangerColor = getDangerColor(frameData.Danger);

//   return (
//     <div style={{ display: 'contents' }}>
//       {/* ================= LEFT PANEL (Sensors) ================= */}
//       <div className="panel" style={{ width: '320px', minWidth: '320px' }}>
//         <div className="panel-label">Sensor Array</div>
        
//         {/* Danger Level */}
//         <div className="card">
//           <div className="card-title">Danger Level</div>
//           <div className="danger-display">
//             <div className="danger-ring" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', border: `8px solid ${dangerColor}`, borderRadius: '50%', width: '100px', height: '100px' }}>
//               <div className="danger-ring-val" style={{ textAlign: 'center' }}>
//                 <span className="danger-num" style={{ color: dangerColor, fontSize: '36px' }}>{frameData.Danger}</span>
//               </div>
//             </div>
//             <div style={{ fontSize: '11px', marginTop: '10px', fontWeight: 'bold', padding: '6px 16px', borderRadius: '20px', border: `1px solid ${dangerColor}`, color: dangerColor, letterSpacing: '1px' }}>
//               {frameData.Status_Label}
//             </div>
//           </div>
//         </div>

//         {/* Distance Readings Bar Chart */}
//         <div className="card">
//           <div className="card-title">Distance Readings (CM)</div>
//           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
//             {['FL', 'FR', 'BL', 'BR'].map(sensor => (
//               <div key={sensor} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
//                 <span style={{ width: '20px', color: 'var(--muted)' }}>{sensor}</span>
//                 <div style={{ flex: 1, height: '12px', background: 'var(--bg)', borderRadius: '6px', overflow: 'hidden' }}>
//                   <div style={{ width: `${(frameData[sensor] / 400) * 100}%`, height: '100%', background: 'var(--c0)', transition: 'width 0.3s ease' }}></div>
//                 </div>
//                 <span style={{ width: '30px', textAlign: 'right', fontFamily: 'var(--mono)' }}>{Math.floor(frameData[sensor])}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Steering Angle */}
//         <div className="card">
//           <div className="card-title">Steering Angle</div>
//           <div style={{ position: 'relative', height: '80px', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', paddingBottom: '10px' }}>
//             {/* SVG Half Circle */}
//             <svg width="140" height="70" viewBox="0 0 140 70">
//               <path d="M 10 70 A 60 60 0 0 1 130 70" fill="none" stroke="var(--border2)" strokeWidth="4" strokeDasharray="4 4" />
//               <line x1="70" y1="70" x2="70" y2="20" stroke="var(--scan)" strokeWidth="2" style={{ transformOrigin: '70px 70px', transform: `rotate(${frameData.Steering_Angle}deg)`, transition: 'transform 0.3s ease' }} />
//               <circle cx="70" cy="70" r="6" fill="var(--scan)" />
//             </svg>
//             <div style={{ position: 'absolute', bottom: '-5px', fontSize: '14px', fontFamily: 'var(--mono)', color: 'var(--text)' }}>
//               {frameData.Steering_Angle}°
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ================= CENTER PANEL (Radar & KPIs) ================= */}
//       <div className="center">
//         {/* Top KPIs */}
//         <div className="center-top">
//           <div className="kpi" style={{ borderTop: `2px solid ${dangerColor}` }}>
//             <div className="kpi-label">Safety</div>
//             <div className="kpi-val" style={{ color: dangerColor }}>{frameData.Safety_Pct}%</div>
//             <div className="kpi-sub">session avg</div>
//           </div>
//           <div className="kpi info" style={{ borderTop: '2px solid var(--scan)' }}>
//             <div className="kpi-label">Rel. Speed</div>
//             <div className="kpi-val">{frameData.Rel_Speed}</div>
//             <div className="kpi-sub">cm/s (relative to object)</div>
//           </div>
//           <div className="kpi warn" style={{ borderTop: '2px solid var(--c2)' }}>
//             <div className="kpi-label">Aggression</div>
//             <div className="kpi-val">{frameData.Aggression_Score}</div>
//             <div className="kpi-sub">score</div>
//           </div>
//           <div className="kpi danger" style={{ borderTop: '2px solid var(--blue)' }}>
//             <div className="kpi-label">Front Avg</div>
//             <div className="kpi-val">{Math.floor(frameData.Front_Avg)}</div>
//             <div className="kpi-sub">FL + FR mean (cm)</div>
//           </div>
//         </div>

//         {/* Central Radar Visualization */}
//         <div className="radar-area" style={{ background: 'radial-gradient(circle at center, rgba(0, 212, 255, 0.05) 0%, transparent 60%)' }}>
//           <div style={{ position: 'relative', width: '300px', height: '300px' }}>
//              {/* Radar Rings */}
//              <div style={{ position: 'absolute', inset: 0, border: '1px dashed var(--border2)', borderRadius: '50%' }}></div>
//              <div style={{ position: 'absolute', inset: '50px', border: '1px dashed var(--border2)', borderRadius: '50%' }}></div>
//              <div style={{ position: 'absolute', inset: '100px', border: '1px dashed var(--border2)', borderRadius: '50%' }}></div>
             
//              {/* Crosshairs */}
//              <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: '1px', background: 'var(--border2)' }}></div>
//              <div style={{ position: 'absolute', top: '50%', right: 0, left: 0, height: '1px', background: 'var(--border2)' }}></div>

//              {/* Dynamic Distance Lines (Simulating radar returns) */}
//              <div style={{ position: 'absolute', top: '50%', left: '50%', width: `${frameData.FR / 2}px`, height: '2px', background: 'var(--c4)', transformOrigin: '0 0', transform: 'rotate(-45deg)' }}></div>
//              <div style={{ position: 'absolute', top: '50%', left: '50%', width: `${frameData.FL / 2}px`, height: '2px', background: 'var(--c0)', transformOrigin: '0 0', transform: 'rotate(-135deg)' }}></div>
             
//              {/* The Car SVG Icon */}
//              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
//                <svg width="40" height="60" viewBox="0 0 40 60">
//                  <rect x="5" y="5" width="30" height="50" rx="8" fill="var(--scan)" opacity="0.8" />
//                  <rect x="8" y="15" width="24" height="12" rx="2" fill="#000" />
//                  <rect x="8" y="35" width="24" height="15" rx="2" fill="#000" />
//                </svg>
//              </div>
//           </div>
//         </div>

//         {/* Bottom Playback Controls */}
//         <div style={{ padding: '16px', borderTop: '1px solid var(--border)', background: 'var(--bg2)', display: 'flex', alignItems: 'center', gap: '20px' }}>
//           {isRecording ? (
//              <button onClick={stopSimulation} style={{ background: 'var(--c4)', color: 'white', padding: '8px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>■ STOP</button>
//           ) : (
//              <button onClick={startSimulation} style={{ background: 'var(--c0)', color: 'black', padding: '8px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>▶ START</button>
//           )}
          
//           <button style={{ background: 'transparent', color: 'var(--muted)', border: '1px solid var(--border2)', padding: '7px 15px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>↺ RESET</button>
          
//           {/* Mock Timeline bar */}
//           <div style={{ flex: 1, height: '6px', background: 'var(--bg)', borderRadius: '3px', position: 'relative' }}>
//              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: isRecording ? '40%' : '0%', background: 'var(--scan)', borderRadius: '3px', transition: 'width 1s linear' }}></div>
//           </div>
//           <div style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--muted)' }}>Frame: 45 / 3000</div>
//         </div>
//       </div>
      
//       {/* ================= RIGHT PANEL (Threats & Events) ================= */}
//       <div className="panel" style={{ width: '280px', minWidth: '280px' }}>
//          <div className="panel-label">Threat Map</div>
         
//          {/* Zone Proximity Grid */}
//          <div className="card">
//            <div className="card-title">Zone Proximity</div>
//            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
//               <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '15px 0', textAlign: 'center', borderRadius: '6px' }}>
//                 <div style={{ color: 'var(--muted)', fontSize: '10px', marginBottom: '5px' }}>FL</div>
//                 <div style={{ fontFamily: 'var(--mono)', fontSize: '20px', color: 'var(--text)' }}>{Math.floor(frameData.FL)}</div>
//               </div>
//               <div style={{ background: frameData.FR < 100 ? 'rgba(239,68,68,0.1)' : 'var(--bg)', border: `1px solid ${frameData.FR < 100 ? 'var(--c4)' : 'var(--border)'}`, padding: '15px 0', textAlign: 'center', borderRadius: '6px' }}>
//                 <div style={{ color: 'var(--muted)', fontSize: '10px', marginBottom: '5px' }}>FR</div>
//                 <div style={{ fontFamily: 'var(--mono)', fontSize: '20px', color: frameData.FR < 100 ? 'var(--c4)' : 'var(--text)' }}>{Math.floor(frameData.FR)}</div>
//               </div>
//               <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '15px 0', textAlign: 'center', borderRadius: '6px' }}>
//                 <div style={{ color: 'var(--muted)', fontSize: '10px', marginBottom: '5px' }}>BL</div>
//                 <div style={{ fontFamily: 'var(--mono)', fontSize: '20px', color: 'var(--text)' }}>{Math.floor(frameData.BL)}</div>
//               </div>
//               <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '15px 0', textAlign: 'center', borderRadius: '6px' }}>
//                 <div style={{ color: 'var(--muted)', fontSize: '10px', marginBottom: '5px' }}>BR</div>
//                 <div style={{ fontFamily: 'var(--mono)', fontSize: '20px', color: 'var(--text)' }}>{Math.floor(frameData.BR)}</div>
//               </div>
//            </div>
//          </div>

//          <div className="panel-label" style={{ marginTop: '10px' }}>Alerts</div>
         
//          {/* Event Log */}
//          <div className="card" style={{ flex: 1 }}>
//            <div className="card-title">Event Log</div>
//            <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--mono)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
//               {frameData.Danger > 0 && (
//                  <div style={{ padding: '6px', background: `rgba(234, 179, 8, 0.1)`, borderLeft: `3px solid var(--c2)`, color: 'var(--text)' }}>
//                     [SYS] {frameData.Status_Label} Detected
//                  </div>
//               )}
//               <div style={{ padding: '6px', borderLeft: '3px solid var(--dim)' }}>
//                  [SYS] Telemetry stream active...
//               </div>
//            </div>
//          </div>

//          {/* Accel Sparkline */}
//          <div className="card">
//            <div className="card-title">Accel Sparkline</div>
//            <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//              <svg width="100%" height="40">
//                <polyline points="0,20 20,25 40,15 60,35 80,10 100,20" fill="none" stroke="var(--scan)" strokeWidth="2" />
//              </svg>
//            </div>
//          </div>
//       </div>
//     </div>
//   );
// };

// export default LiveFeed; 
// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';

// const LiveFeed = () => {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [frame, setFrame] = useState(1);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [backendError, setBackendError] = useState(null);
  
//   // Updated to 120 frames (30 frames per sensor)
//   const totalFrames = 120;

//   const [activeTab, setActiveTab] = useState('DISTANCE');
//   const [steeringAngle, setSteeringAngle] = useState(0);

//   const [sensorData, setSensorData] = useState({
//     Danger: 0, Status_Label: 'CRUISING', Safety_Pct: 100.0, Rel_Speed: '0.0', Aggression_Score: '0.0', Steering_Angle: 0, TTC: '∞',
//     FL: 350.0, FR: 350.0, BL: 350.0, BR: 350.0
//   });

//   const [eventLog, setEventLog] = useState([]);
//   const [history, setHistory] = useState([]);
//   const intervalRef = useRef(null);

//   const startSession = async () => {
//     setBackendError(null);
//     try {
//       await axios.post('http://localhost:5000/api/adas/session/start');
//       setIsPlaying(true);
//       if (frame >= totalFrames) setFrame(1);
//       setEventLog([]);
//       setHistory([]);
//     } catch (err) {
//       console.error("Backend Connection Error:", err);
//       setBackendError("BACKEND NOT CONNECTED. Please ensure Node.js server is running on port 5000.");
//       setTimeout(() => setBackendError(null), 5000);
//     }
//   };

//   const stopSession = async () => {
//     setIsPlaying(false);
//     setIsProcessing(true);
//     clearInterval(intervalRef.current);
//     try {
//       await axios.post('http://localhost:5000/api/adas/session/stop');
//       alert("Session saved! Pipelines finished successfully.");
//     } catch (err) { console.error(err); }
//     finally { setIsProcessing(false); }
//   };

//   const resetSession = () => {
//     setIsPlaying(false);
//     setFrame(1);
//     setEventLog([]);
//     setHistory([]);
//     setSteeringAngle(0);
//     setSensorData({ Danger: 0, Status_Label: 'CRUISING', Safety_Pct: 100.0, Rel_Speed: '0.0', Aggression_Score: '0.0', Steering_Angle: 0, TTC: '∞', FL: 350.0, FR: 350.0, BL: 350.0, BR: 350.0 });
//   };

//   useEffect(() => {
//     if (isPlaying && frame <= totalFrames) {
//       intervalRef.current = setInterval(async () => {
        
//         // Helper function for 30-frame animation sequences (15 shrink, 15 grow)
//         const calcDist = (f, start, end) => {
//           if (f < start || f > end) return 345 + Math.random() * 5; // Idle jitter
//           const mid = (start + end) / 2;
//           if (f <= mid) return 350 - (250 * ((f - start) / (mid - start))); // Shrink to 100cm
//           return 100 + (250 * ((f - mid) / (end - mid))); // Grow back to 350cm
//         };

//         // 30 Frames each: FL (1-30) -> FR (31-60) -> BL (61-90) -> BR (91-120)
//         const newFL = calcDist(frame, 1, 30);
//         const newFR = calcDist(frame, 31, 60);
//         const newBL = calcDist(frame, 61, 90);
//         const newBR = calcDist(frame, 91, 120);

//         const minDist = Math.min(newFL, newFR, newBL, newBR);
        
//         // Smooth dynamic steering based on which zone is active
//         let newSteering = 0;
//         if (minDist < 300) {
//             const percent = 1 - ((minDist - 100) / 200); 
//             const angleMag = 45 * Math.pow(percent, 1.3); // Smooth curve to 45 degrees
            
//             if (frame <= 30) newSteering = -angleMag; // FL threat -> Steer Right (-)
//             else if (frame <= 60) newSteering = angleMag; // FR threat -> Steer Left (+)
//             else if (frame <= 90) newSteering = -(angleMag * 0.5); // BL threat -> Slight Right
//             else if (frame <= 120) newSteering = (angleMag * 0.5); // BR threat -> Slight Left
//         }
//         setSteeringAngle(newSteering);

//         const newStatus = minDist < 120 ? 'EVASIVE MANEUVER' : (minDist < 200 ? 'OBSTACLE DETECTED' : 'CRUISING');
//         const newDanger = minDist < 120 ? 3 : (minDist < 200 ? 1 : 0);
//         const newSafety = minDist < 150 ? 60.8 : 98.5;
//         const newTTC = minDist < 150 ? (minDist / 25).toFixed(1) : '∞';

//         const currentData = {
//           Frame_ID: frame, Timestamp: new Date().toISOString(),
//           FL: newFL.toFixed(1), FR: newFR.toFixed(1), BL: newBL.toFixed(1), BR: newBR.toFixed(1),
//           Steering_Angle: newSteering.toFixed(0), Status_Label: newStatus, Danger: newDanger, Safety_Pct: newSafety,
//           Rel_Speed: (minDist < 300 ? (Math.random() * 5 + 2).toFixed(1) : '0.0'),
//           Aggression_Score: newStatus === 'EVASIVE MANEUVER' ? '8.5' : '0.0', TTC: newTTC
//         };

//         setSensorData(currentData);
//         setHistory(prev => [...prev, currentData]);

//         // Add to Event Log dynamically without spamming
//         if (minDist < 120) {
//           const zone = newFL < 120 ? 'FL' : (newFR < 120 ? 'FR' : (newBL < 120 ? 'BL' : 'BR'));
//           setEventLog(prev => {
//             if (prev.length === 0 || !prev[0].details.includes(zone)) {
//               return [{ status: 'EVASIVE MANEUVER', details: `${zone} zone • ${minDist.toFixed(1)} cm`, time: new Date().toLocaleTimeString() }, ...prev];
//             }
//             return prev;
//           });
//         }

//         try { await axios.post('http://localhost:5000/api/adas/session/record', currentData); } catch (err) {}
//         setFrame(prev => prev + 1);
//       }, 250); // Speed set to 250ms per frame for smooth playback
//     } else if (frame > totalFrames && isPlaying) {
//       stopSession();
//     }
//     return () => clearInterval(intervalRef.current);
//   }, [isPlaying, frame, eventLog]);

//   const getColor = (val) => val < 120 ? 'var(--c3)' : (val < 200 ? 'var(--c2)' : 'var(--c0)');

//   // Radar logic
//   const maxRadius = 140; 
//   const maxDist = 350.0; 
//   const getRadarPos = (dist, angleDeg) => {
//     const r = (dist / maxDist) * maxRadius;
//     const rad = (angleDeg * Math.PI) / 180;
//     return { x: 200 + r * Math.cos(rad), y: 200 + r * Math.sin(rad) };
//   };

//   const pFL = getRadarPos(sensorData.FL, 225);
//   const pFR = getRadarPos(sensorData.FR, 315);
//   const pBR = getRadarPos(sensorData.BR, 45);
//   const pBL = getRadarPos(sensorData.BL, 135);

//   const transitionStyle = { transition: 'all 0.25s linear' }; // Faster transition to match frame speed

//   return (
//     <>
//       {backendError && (
//         <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'var(--c4)', color: '#fff', textAlign: 'center', padding: '10px', zIndex: 99999, fontWeight: 'bold', letterSpacing: '1px', fontSize: '12px', fontFamily: 'var(--mono)' }}>
//           ⚠ {backendError}
//         </div>
//       )}

//       {/* ================= LEFT PANEL ================= */}
//       <div className="panel">
//         <div className="panel-label">Sensor Array</div>
        
//         <div className="card danger-display" style={{ marginBottom: '16px' }}>
//           <div className="panel-label" style={{ alignSelf: 'flex-start' }}>DANGER LEVEL</div>
//           <div className="danger-ring" style={{ marginTop: '10px' }}>
//             <svg width="110" height="110" viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)' }}>
//               <circle cx="55" cy="55" r="45" fill="none" stroke="var(--border)" strokeWidth="6" />
//               <circle cx="55" cy="55" r="45" fill="none" stroke={sensorData.Danger >= 3 ? 'var(--c3)' : (sensorData.Danger === 1 ? 'var(--c2)' : 'var(--c0)')} strokeWidth="6" strokeDasharray="282" strokeDashoffset={282 - (282 * (sensorData.Danger / 4))} style={{ transition: 'stroke-dashoffset 0.5s' }} />
//             </svg>
//             <div className="danger-ring-val">
//               <div className="danger-num">{sensorData.Danger}</div>
//               <div className="danger-lbl">/ 4</div>
//             </div>
//           </div>
//           <div style={{ border: `1px solid ${sensorData.Danger >= 3 ? 'var(--c3)' : (sensorData.Danger === 1 ? 'var(--c2)' : 'var(--c0)')}`, color: sensorData.Danger >= 3 ? 'var(--c3)' : (sensorData.Danger === 1 ? 'var(--c2)' : 'var(--c0)'), padding: '4px 16px', borderRadius: '20px', fontFamily: 'var(--mono)', fontSize: '11px', marginTop: '10px', fontWeight: 'bold' }}>
//             {sensorData.Status_Label}
//           </div>
//         </div>

//         <div className="card" style={{ marginBottom: '16px' }}>
//           <div className="panel-label">DISTANCE READINGS (CM)</div>
//           <div style={{ marginTop: '12px' }}>
//             {['FL', 'FR', 'BL', 'BR'].map((key) => (
//               <div className="progress-row" key={key}>
//                 <div className="progress-label">{key}</div>
//                 <div className="progress-bg">
//                   <div className="progress-fill" style={{ width: `${(sensorData[key] / 350) * 100}%`, background: getColor(sensorData[key]) }}></div>
//                 </div>
//                 <div className="progress-val">{Math.round(sensorData[key])}</div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="card" style={{ marginBottom: '16px' }}>
//           <div className="panel-label">STEERING ANGLE</div>
//           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0 8px 0' }}>
//             <svg width="60" height="60" viewBox="0 0 100 100" style={{ transform: `rotate(${-steeringAngle}deg)`, ...transitionStyle }}>
//               <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border)" strokeWidth="4"/>
//               <line x1="50" y1="50" x2="50" y2="90" stroke="var(--scan)" strokeWidth="3" strokeLinecap="round" />
//               <line x1="50" y1="50" x2="84.6" y2="30" stroke="var(--scan)" strokeWidth="3" strokeLinecap="round" />
//               <line x1="50" y1="50" x2="15.4" y2="30" stroke="var(--scan)" strokeWidth="3" strokeLinecap="round" />
//               <circle cx="50" cy="50" r="4" fill="var(--scan)" />
//             </svg>
//             <div style={{ marginTop: '10px', color: 'var(--scan)', fontFamily: 'var(--mono)', fontSize: '14px' }}>
//                 {Math.abs(steeringAngle).toFixed(0)}° {steeringAngle > 0 ? 'L' : (steeringAngle < 0 ? 'R' : '')}
//             </div>
//           </div>
//         </div>

//         <div className="card">
//           <div className="panel-label">TIME-TO-COLLISION</div>
//           <div style={{ marginTop: '8px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
//             <span style={{ fontSize: '24px', fontFamily: 'var(--mono)', color: sensorData.TTC !== '∞' ? 'var(--c3)' : 'var(--c0)', fontWeight: 'bold' }}>{sensorData.TTC}</span>
//             <span style={{ fontSize: '11px', color: 'var(--muted)' }}>seconds</span>
//           </div>
//         </div>
//       </div>

//       {/* ================= CENTER PANEL ================= */}
//       <div className="center">
//         <div className="center-top">
//           <div className={`kpi ${sensorData.Safety_Pct < 80 ? 'warn' : 'safe'}`}>
//             <div className="kpi-label">SAFETY</div>
//             <div className="kpi-val">{sensorData.Safety_Pct}%</div>
//             <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>session avg</div>
//           </div>
//           <div className={`kpi ${sensorData.Rel_Speed > 2 ? 'warn' : 'info'}`}>
//             <div className="kpi-label">REL. SPEED</div>
//             <div className="kpi-val">{sensorData.Rel_Speed} <span style={{fontSize:'12px'}}>cm/s</span></div>
//             <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>relative to object</div>
//           </div>
//           <div className={`kpi ${sensorData.Aggression_Score > 5 ? 'danger' : 'safe'}`} style={{ borderTop: '2px solid var(--c3)'}}>
//             <div className="kpi-label">AGGRESSION</div>
//             <div className="kpi-val">{sensorData.Aggression_Score}</div>
//             <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>score</div>
//           </div>
//           <div className="kpi info">
//             <div className="kpi-label">FRONT AVG</div>
//             <div className="kpi-val">{((parseFloat(sensorData.FL) + parseFloat(sensorData.FR)) / 2).toFixed(1)} <span style={{fontSize:'12px'}}>cm</span></div>
//             <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>FL + FR mean</div>
//           </div>
//         </div>

//         <div className="radar-area" style={{ flex: 1 }}>
//           <svg width="400" height="300" viewBox="0 0 400 400">
//             <circle cx="200" cy="200" r="60" fill="none" stroke="var(--border)" strokeWidth="1"/>
//             <circle cx="200" cy="200" r="100" fill="none" stroke="var(--border)" strokeWidth="1"/>
//             <circle cx="200" cy="200" r="140" fill="none" stroke="var(--border)" strokeWidth="1"/>
//             <circle cx="200" cy="200" r="180" fill="none" stroke="var(--border)" strokeWidth="1"/>
//             <line x1="20" y1="20" x2="380" y2="380" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
//             <line x1="20" y1="380" x2="380" y2="20" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />

//             <line x1="200" y1="200" x2={pFL.x} y2={pFL.y} stroke={getColor(sensorData.FL)} strokeWidth="4" strokeLinecap="round" style={transitionStyle} />
//             <circle cx={pFL.x} cy={pFL.y} r="5" fill={getColor(sensorData.FL)} style={transitionStyle} />
//             <text x={pFL.x - 10} y={pFL.y - 10} textAnchor="end" fill={getColor(sensorData.FL)} fontSize="12" fontFamily="var(--mono)" style={transitionStyle} fontWeight="bold">{Math.round(sensorData.FL)}cm</text>
            
//             <line x1="200" y1="200" x2={pFR.x} y2={pFR.y} stroke={getColor(sensorData.FR)} strokeWidth="4" strokeLinecap="round" style={transitionStyle} />
//             <circle cx={pFR.x} cy={pFR.y} r="5" fill={getColor(sensorData.FR)} style={transitionStyle} />
//             <text x={pFR.x + 10} y={pFR.y - 10} textAnchor="start" fill={getColor(sensorData.FR)} fontSize="12" fontFamily="var(--mono)" style={transitionStyle} fontWeight="bold">{Math.round(sensorData.FR)}cm</text>

//             <line x1="200" y1="200" x2={pBL.x} y2={pBL.y} stroke={getColor(sensorData.BL)} strokeWidth="4" strokeLinecap="round" style={transitionStyle} />
//             <circle cx={pBL.x} cy={pBL.y} r="5" fill={getColor(sensorData.BL)} style={transitionStyle} />
//             <text x={pBL.x - 10} y={pBL.y + 20} textAnchor="end" fill={getColor(sensorData.BL)} fontSize="12" fontFamily="var(--mono)" style={transitionStyle} fontWeight="bold">{Math.round(sensorData.BL)}cm</text>

//             <line x1="200" y1="200" x2={pBR.x} y2={pBR.y} stroke={getColor(sensorData.BR)} strokeWidth="4" strokeLinecap="round" style={transitionStyle} />
//             <circle cx={pBR.x} cy={pBR.y} r="5" fill={getColor(sensorData.BR)} style={transitionStyle} />
//             <text x={pBR.x + 10} y={pBR.y + 20} textAnchor="start" fill={getColor(sensorData.BR)} fontSize="12" fontFamily="var(--mono)" style={transitionStyle} fontWeight="bold">{Math.round(sensorData.BR)}cm</text>

//             <rect x="180" y="160" width="40" height="80" rx="8" fill="var(--bg2)" stroke="var(--scan)" strokeWidth="2" />
//             <rect x="185" y="170" width="30" height="20" rx="4" fill="var(--blue)" opacity="0.5" />
//           </svg>
//         </div>

//         <div style={{ padding: '0 20px', display: 'flex', gap: '16px' }}>
//            {['DISTANCE', 'TTC', 'SAFETY %'].map(tab => (
//              <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: 'transparent', border: 'none', color: activeTab === tab ? '#fff' : 'var(--muted)', fontSize: '11px', fontWeight: 'bold', padding: '8px 12px', cursor: 'pointer', borderBottom: activeTab === tab ? '2px solid var(--text)' : '2px solid transparent' }}>
//                {tab}
//              </button>
//            ))}
//         </div>
//         <div style={{ height: '120px', background: 'var(--card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', margin: '0 16px', position: 'relative', overflow: 'hidden' }}>
//             <div style={{ position: 'absolute', top: '10px', left: '16px', fontSize: '10px', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>
//               {activeTab === 'DISTANCE' ? 'Active Sensor Distance Over Time' : `${activeTab} Over Time`}
//             </div>
//             <svg width="100%" height="100%" viewBox="0 0 500 100" preserveAspectRatio="none" style={{ marginTop: '20px' }}>
//                <line x1="0" y1="80" x2="500" y2="80" stroke="var(--border)" strokeWidth="1" />
//                <line x1="0" y1="50" x2="500" y2="50" stroke="var(--border)" strokeWidth="1" />
//                <line x1="0" y1="20" x2="500" y2="20" stroke="var(--border)" strokeWidth="1" />
//                {history.length > 1 && (
//                  <polyline 
//                     points={history.map((h, i) => {
//                       // Dynamically track the active sensor line based on frame chunks
//                       const currentDist = i < 30 ? h.FL : (i < 60 ? h.FR : (i < 90 ? h.BL : h.BR));
//                       return `${(i / totalFrames) * 500},${100 - (currentDist / 350) * 100}`;
//                     }).join(' ')} 
//                     fill="none" stroke="var(--c3)" strokeWidth="2" 
//                  />
//                )}
//             </svg>
//         </div>

//         <div className="playback-controls" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--bg2)', borderTop: '1px solid var(--border)' }}>
//           {!isPlaying ? (
//             <button onClick={startSession} disabled={isProcessing} style={{ background: 'var(--c0)', color: '#000', border: 'none', padding: '8px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: '12px' }}>
//               {isProcessing ? '⚙...' : '▶ PLAY'}
//             </button>
//           ) : (
//             <button onClick={stopSession} style={{ background: 'var(--c4)', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: '12px' }}>
//               ■ STOP
//             </button>
//           )}
          
//           <button onClick={resetSession} style={{ background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
//             ↺ RESET
//           </button>
          
//           <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '10px' }}>
//             <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Frame</span>
//             <input type="range" min="1" max={totalFrames} value={frame} readOnly style={{ flex: 1, height: '4px', accentColor: 'var(--scan)' }} />
//             <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{frame} / {totalFrames}</span>
//           </div>

//           <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
//              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Speed</span>
//              <select style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', padding: '4px', borderRadius: '4px', fontSize: '11px' }}>
//                <option>1x</option>
//                <option>2x</option>
//              </select>
//           </div>
//         </div>
//       </div>

//       {/* ================= RIGHT PANEL ================= */}
//       <div className="panel">
//         <div className="panel-label">Threat Map</div>
//         <div className="card" style={{ marginBottom: '16px' }}>
//           <div className="panel-label" style={{ marginBottom: '10px' }}>ZONE PROXIMITY</div>
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
//             {['FL', 'FR', 'BL', 'BR'].map(key => (
//               <div key={key} style={{ padding: '20px 10px', textAlign: 'center', border: `1px solid ${getColor(sensorData[key])}`, borderRadius: '6px', background: sensorData[key] < 120 ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg)', transition: 'all 0.25s linear' }}>
//                 <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px', fontWeight: 'bold' }}>{key}</div>
//                 <div style={{ fontSize: '20px', fontFamily: 'var(--mono)', color: getColor(sensorData[key]), fontWeight: 'bold' }}>{Math.round(sensorData[key])}</div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="panel-label">Alerts</div>
//         <div className="card" style={{ marginBottom: '16px', minHeight: '100px' }}>
//            <div className="panel-label" style={{ marginBottom: '10px' }}>EVENT LOG</div>
//           {eventLog.map((log, idx) => (
//             <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderLeft: '3px solid var(--c3)', paddingLeft: '10px', marginBottom: '10px' }}>
//               <div>
//                 <div style={{ color: 'var(--text)', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
//                   <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--c3)' }}></span>
//                   {log.status}
//                 </div>
//                 <div style={{ color: 'var(--c3)', fontSize: '10px', marginTop: '4px' }}>{log.details}</div>
//               </div>
//               <div style={{ color: 'var(--muted)', fontSize: '10px', fontFamily: 'var(--mono)' }}>{log.time}</div>
//             </div>
//           ))}
//           {eventLog.length === 0 && (
//             <div style={{ textAlign: 'center', color: 'var(--dim)', fontStyle: 'italic', fontSize: '12px', padding: '20px 0' }}>
//               No critical events.
//             </div>
//           )}
//         </div>

//         <div className="panel-label">Acceleration</div>
//         <div className="card" style={{ flex: 1 }}>
//            <div className="panel-label" style={{ marginBottom: '10px' }}>ACCEL • SPARKLINE</div>
//            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
//               {['Accel', 'Aggrsn', 'MinDst'].map((lbl, i) => (
//                 <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                    <div style={{ width: '40px', fontSize: '10px', color: 'var(--muted)' }}>{lbl}</div>
//                    <svg style={{ flex: 1, height: '20px' }}>
//                      <polyline points="0,10 20,5 40,15 60,8 80,18 100,2" fill="none" stroke={['var(--scan)', 'var(--c3)', 'var(--c0)'][i]} strokeWidth="1.5" />
//                    </svg>
//                 </div>
//               ))}
//            </div>
//         </div>
//       </div>

//       <style>{`
//         .panel { overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--scan) transparent; }
//         .panel::-webkit-scrollbar { width: 4px; }
//         .panel::-webkit-scrollbar-track { background: transparent; }
//         .panel::-webkit-scrollbar-thumb { background-color: var(--scan); border-radius: 10px; }
//       `}</style>
//     </>
//   );
// };

// export default LiveFeed;
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LiveFeed = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [frame, setFrame] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [backendError, setBackendError] = useState(null);
  
  const totalFrames = 120;

  const [activeTab, setActiveTab] = useState('DISTANCE');
  const [steeringAngle, setSteeringAngle] = useState(0);

  const [sensorData, setSensorData] = useState({
    Danger: 0, Status_Label: 'CRUISING', Safety_Pct: 100.0, Rel_Speed: '0.0', Aggression_Score: '0.0', Steering_Angle: 0, TTC: '∞',
    FL: 350.0, FR: 350.0, BL: 350.0, BR: 350.0
  });

  const [eventLog, setEventLog] = useState([]);
  const [history, setHistory] = useState([]);
  
  // NEW STATE FOR PYSPARK INSIGHTS
  const [mlInsights, setMlInsights] = useState(null);
  const intervalRef = useRef(null);

  // Fetch PySpark Insights on load
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await axios.get(`${API_BASE}/adas/insights`);
        setMlInsights(res.data);
      } catch (err) {
        console.log("No ML insights yet. Run spark_model.py in the backend.");
      }
    };
    fetchInsights();
  }, []);

  const startSession = async () => {
    setBackendError(null);
    try {
      await axios.post(`${API_BASE}/adas/session/start`);
      setIsPlaying(true);
      if (frame >= totalFrames) setFrame(1);
      setEventLog([]);
      setHistory([]);
    } catch (err) {
      console.error("Backend Connection Error:", err);
      setBackendError("BACKEND NOT CONNECTED. Please ensure Node.js server is running on port 5000.");
      setTimeout(() => setBackendError(null), 5000);
    }
  };

  const stopSession = async () => {
    setIsPlaying(false);
    setIsProcessing(true);
    clearInterval(intervalRef.current);
    try {
      await axios.post(`${API_BASE}/adas/session/stop`);
      alert("Session saved! Pipelines finished successfully.");
    } catch (err) { console.error(err); }
    finally { setIsProcessing(false); }
  };

  const resetSession = () => {
    setIsPlaying(false);
    setFrame(1);
    setEventLog([]);
    setHistory([]);
    setSteeringAngle(0);
    setSensorData({ Danger: 0, Status_Label: 'CRUISING', Safety_Pct: 100.0, Rel_Speed: '0.0', Aggression_Score: '0.0', Steering_Angle: 0, TTC: '∞', FL: 350.0, FR: 350.0, BL: 350.0, BR: 350.0 });
  };

  useEffect(() => {
    if (isPlaying && frame <= totalFrames) {
      intervalRef.current = setInterval(async () => {
        
        const calcDist = (f, start, end) => {
          if (f < start || f > end) return 345 + Math.random() * 5; 
          const mid = (start + end) / 2;
          if (f <= mid) return 350 - (250 * ((f - start) / (mid - start))); 
          return 100 + (250 * ((f - mid) / (end - mid))); 
        };

        const newFL = calcDist(frame, 1, 30);
        const newFR = calcDist(frame, 31, 60);
        const newBL = calcDist(frame, 61, 90);
        const newBR = calcDist(frame, 91, 120);

        const minDist = Math.min(newFL, newFR, newBL, newBR);
        
        let newSteering = 0;
        if (minDist < 300) {
            const percent = 1 - ((minDist - 100) / 200); 
            const angleMag = 45 * Math.pow(percent, 1.3); 
            
            if (frame <= 30) newSteering = -angleMag; 
            else if (frame <= 60) newSteering = angleMag; 
            else if (frame <= 90) newSteering = -(angleMag * 0.5); 
            else if (frame <= 120) newSteering = (angleMag * 0.5); 
        }
        setSteeringAngle(newSteering);

        const newStatus = minDist < 120 ? 'EVASIVE MANEUVER' : (minDist < 200 ? 'OBSTACLE DETECTED' : 'CRUISING');
        const newDanger = minDist < 120 ? 3 : (minDist < 200 ? 1 : 0);
        const newSafety = minDist < 150 ? 60.8 : 98.5;
        const newTTC = minDist < 150 ? (minDist / 25).toFixed(1) : '∞';

        const currentData = {
          Frame_ID: frame, Timestamp: new Date().toISOString(),
          FL: newFL.toFixed(1), FR: newFR.toFixed(1), BL: newBL.toFixed(1), BR: newBR.toFixed(1),
          Steering_Angle: newSteering.toFixed(0), Status_Label: newStatus, Danger: newDanger, Safety_Pct: newSafety,
          Rel_Speed: (minDist < 300 ? (Math.random() * 5 + 2).toFixed(1) : '0.0'),
          Aggression_Score: newStatus === 'EVASIVE MANEUVER' ? '8.5' : '0.0', TTC: newTTC
        };

        setSensorData(currentData);
        setHistory(prev => [...prev, currentData]);

        if (minDist < 120) {
          const zone = newFL < 120 ? 'FL' : (newFR < 120 ? 'FR' : (newBL < 120 ? 'BL' : 'BR'));
          setEventLog(prev => {
            if (prev.length === 0 || !prev[0].details.includes(zone)) {
              return [{ status: 'EVASIVE MANEUVER', details: `${zone} zone • ${minDist.toFixed(1)} cm`, time: new Date().toLocaleTimeString() }, ...prev];
            }
            return prev;
          });
        }

        try { await axios.post(`${API_BASE}/adas/session/record`, currentData); } catch (err) {}
        setFrame(prev => prev + 1);
      }, 250); 
    } else if (frame > totalFrames && isPlaying) {
      stopSession();
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, frame, eventLog]);

  const getColor = (val) => val < 120 ? 'var(--c3)' : (val < 200 ? 'var(--c2)' : 'var(--c0)');

  const maxRadius = 140; 
  const maxDist = 350.0; 
  const getRadarPos = (dist, angleDeg) => {
    const r = (dist / maxDist) * maxRadius;
    const rad = (angleDeg * Math.PI) / 180;
    return { x: 200 + r * Math.cos(rad), y: 200 + r * Math.sin(rad) };
  };

  const pFL = getRadarPos(sensorData.FL, 225);
  const pFR = getRadarPos(sensorData.FR, 315);
  const pBR = getRadarPos(sensorData.BR, 45);
  const pBL = getRadarPos(sensorData.BL, 135);

  const transitionStyle = { transition: 'all 0.25s linear' }; 

  return (
    <>
      {backendError && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, background: 'var(--c4)', color: '#fff', textAlign: 'center', padding: '10px', zIndex: 99999, fontWeight: 'bold', letterSpacing: '1px', fontSize: '12px', fontFamily: 'var(--mono)' }}>
          ⚠ {backendError}
        </div>
      )}

      {/* ================= LEFT PANEL ================= */}
      <div className="panel">
        <div className="panel-label">Sensor Array</div>
        
        <div className="card danger-display" style={{ marginBottom: '16px' }}>
          <div className="panel-label" style={{ alignSelf: 'flex-start' }}>DANGER LEVEL</div>
          <div className="danger-ring" style={{ marginTop: '10px' }}>
            <svg width="110" height="110" viewBox="0 0 110 110" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="55" cy="55" r="45" fill="none" stroke="var(--border)" strokeWidth="6" />
              <circle cx="55" cy="55" r="45" fill="none" stroke={sensorData.Danger >= 3 ? 'var(--c3)' : (sensorData.Danger === 1 ? 'var(--c2)' : 'var(--c0)')} strokeWidth="6" strokeDasharray="282" strokeDashoffset={282 - (282 * (sensorData.Danger / 4))} style={{ transition: 'stroke-dashoffset 0.5s' }} />
            </svg>
            <div className="danger-ring-val">
              <div className="danger-num">{sensorData.Danger}</div>
              <div className="danger-lbl">/ 4</div>
            </div>
          </div>
          <div style={{ border: `1px solid ${sensorData.Danger >= 3 ? 'var(--c3)' : (sensorData.Danger === 1 ? 'var(--c2)' : 'var(--c0)')}`, color: sensorData.Danger >= 3 ? 'var(--c3)' : (sensorData.Danger === 1 ? 'var(--c2)' : 'var(--c0)'), padding: '4px 16px', borderRadius: '20px', fontFamily: 'var(--mono)', fontSize: '11px', marginTop: '10px', fontWeight: 'bold' }}>
            {sensorData.Status_Label}
          </div>
        </div>

        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="panel-label">DISTANCE READINGS (CM)</div>
          <div style={{ marginTop: '12px' }}>
            {['FL', 'FR', 'BL', 'BR'].map((key) => (
              <div className="progress-row" key={key}>
                <div className="progress-label">{key}</div>
                <div className="progress-bg">
                  <div className="progress-fill" style={{ width: `${(sensorData[key] / 350) * 100}%`, background: getColor(sensorData[key]) }}></div>
                </div>
                <div className="progress-val">{Math.round(sensorData[key])}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="panel-label">STEERING ANGLE</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0 8px 0' }}>
            <svg width="60" height="60" viewBox="0 0 100 100" style={{ transform: `rotate(${-steeringAngle}deg)`, ...transitionStyle }}>
              <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border)" strokeWidth="4"/>
              <line x1="50" y1="50" x2="50" y2="90" stroke="var(--scan)" strokeWidth="3" strokeLinecap="round" />
              <line x1="50" y1="50" x2="84.6" y2="30" stroke="var(--scan)" strokeWidth="3" strokeLinecap="round" />
              <line x1="50" y1="50" x2="15.4" y2="30" stroke="var(--scan)" strokeWidth="3" strokeLinecap="round" />
              <circle cx="50" cy="50" r="4" fill="var(--scan)" />
            </svg>
            <div style={{ marginTop: '10px', color: 'var(--scan)', fontFamily: 'var(--mono)', fontSize: '14px' }}>
                {Math.abs(steeringAngle).toFixed(0)}° {steeringAngle > 0 ? 'L' : (steeringAngle < 0 ? 'R' : '')}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="panel-label">TIME-TO-COLLISION</div>
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '24px', fontFamily: 'var(--mono)', color: sensorData.TTC !== '∞' ? 'var(--c3)' : 'var(--c0)', fontWeight: 'bold' }}>{sensorData.TTC}</span>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>seconds</span>
          </div>
        </div>
      </div>

      {/* ================= CENTER PANEL ================= */}
      <div className="center">
        <div className="center-top">
          <div className={`kpi ${sensorData.Safety_Pct < 80 ? 'warn' : 'safe'}`}>
            <div className="kpi-label">SAFETY</div>
            <div className="kpi-val">{sensorData.Safety_Pct}%</div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>session avg</div>
          </div>
          <div className={`kpi ${sensorData.Rel_Speed > 2 ? 'warn' : 'info'}`}>
            <div className="kpi-label">REL. SPEED</div>
            <div className="kpi-val">{sensorData.Rel_Speed} <span style={{fontSize:'12px'}}>cm/s</span></div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>relative to object</div>
          </div>
          <div className={`kpi ${sensorData.Aggression_Score > 5 ? 'danger' : 'safe'}`} style={{ borderTop: '2px solid var(--c3)'}}>
            <div className="kpi-label">AGGRESSION</div>
            <div className="kpi-val">{sensorData.Aggression_Score}</div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>score</div>
          </div>
          <div className="kpi info">
            <div className="kpi-label">FRONT AVG</div>
            <div className="kpi-val">{((parseFloat(sensorData.FL) + parseFloat(sensorData.FR)) / 2).toFixed(1)} <span style={{fontSize:'12px'}}>cm</span></div>
            <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '4px' }}>FL + FR mean</div>
          </div>
        </div>

        <div className="radar-area" style={{ flex: 1 }}>
          <svg width="400" height="300" viewBox="0 0 400 400">
            <circle cx="200" cy="200" r="60" fill="none" stroke="var(--border)" strokeWidth="1"/>
            <circle cx="200" cy="200" r="100" fill="none" stroke="var(--border)" strokeWidth="1"/>
            <circle cx="200" cy="200" r="140" fill="none" stroke="var(--border)" strokeWidth="1"/>
            <circle cx="200" cy="200" r="180" fill="none" stroke="var(--border)" strokeWidth="1"/>
            <line x1="20" y1="20" x2="380" y2="380" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="20" y1="380" x2="380" y2="20" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />

            <line x1="200" y1="200" x2={pFL.x} y2={pFL.y} stroke={getColor(sensorData.FL)} strokeWidth="4" strokeLinecap="round" style={transitionStyle} />
            <circle cx={pFL.x} cy={pFL.y} r="5" fill={getColor(sensorData.FL)} style={transitionStyle} />
            <text x={pFL.x - 10} y={pFL.y - 10} textAnchor="end" fill={getColor(sensorData.FL)} fontSize="12" fontFamily="var(--mono)" style={transitionStyle} fontWeight="bold">{Math.round(sensorData.FL)}cm</text>
            
            <line x1="200" y1="200" x2={pFR.x} y2={pFR.y} stroke={getColor(sensorData.FR)} strokeWidth="4" strokeLinecap="round" style={transitionStyle} />
            <circle cx={pFR.x} cy={pFR.y} r="5" fill={getColor(sensorData.FR)} style={transitionStyle} />
            <text x={pFR.x + 10} y={pFR.y - 10} textAnchor="start" fill={getColor(sensorData.FR)} fontSize="12" fontFamily="var(--mono)" style={transitionStyle} fontWeight="bold">{Math.round(sensorData.FR)}cm</text>

            <line x1="200" y1="200" x2={pBL.x} y2={pBL.y} stroke={getColor(sensorData.BL)} strokeWidth="4" strokeLinecap="round" style={transitionStyle} />
            <circle cx={pBL.x} cy={pBL.y} r="5" fill={getColor(sensorData.BL)} style={transitionStyle} />
            <text x={pBL.x - 10} y={pBL.y + 20} textAnchor="end" fill={getColor(sensorData.BL)} fontSize="12" fontFamily="var(--mono)" style={transitionStyle} fontWeight="bold">{Math.round(sensorData.BL)}cm</text>

            <line x1="200" y1="200" x2={pBR.x} y2={pBR.y} stroke={getColor(sensorData.BR)} strokeWidth="4" strokeLinecap="round" style={transitionStyle} />
            <circle cx={pBR.x} cy={pBR.y} r="5" fill={getColor(sensorData.BR)} style={transitionStyle} />
            <text x={pBR.x + 10} y={pBR.y + 20} textAnchor="start" fill={getColor(sensorData.BR)} fontSize="12" fontFamily="var(--mono)" style={transitionStyle} fontWeight="bold">{Math.round(sensorData.BR)}cm</text>

            <rect x="180" y="160" width="40" height="80" rx="8" fill="var(--bg2)" stroke="var(--scan)" strokeWidth="2" />
            <rect x="185" y="170" width="30" height="20" rx="4" fill="var(--blue)" opacity="0.5" />
          </svg>
        </div>

        <div style={{ padding: '0 20px', display: 'flex', gap: '16px' }}>
           {['DISTANCE', 'TTC', 'SAFETY %'].map(tab => (
             <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: 'transparent', border: 'none', color: activeTab === tab ? '#fff' : 'var(--muted)', fontSize: '11px', fontWeight: 'bold', padding: '8px 12px', cursor: 'pointer', borderBottom: activeTab === tab ? '2px solid var(--text)' : '2px solid transparent' }}>
               {tab}
             </button>
           ))}
        </div>
        <div style={{ height: '120px', background: 'var(--card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', margin: '0 16px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '10px', left: '16px', fontSize: '10px', color: 'var(--muted)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>
              {activeTab === 'DISTANCE' ? 'Active Sensor Distance Over Time' : `${activeTab} Over Time`}
            </div>
            <svg width="100%" height="100%" viewBox="0 0 500 100" preserveAspectRatio="none" style={{ marginTop: '20px' }}>
               <line x1="0" y1="80" x2="500" y2="80" stroke="var(--border)" strokeWidth="1" />
               <line x1="0" y1="50" x2="500" y2="50" stroke="var(--border)" strokeWidth="1" />
               <line x1="0" y1="20" x2="500" y2="20" stroke="var(--border)" strokeWidth="1" />
               {history.length > 1 && (
                 <polyline 
                    points={history.map((h, i) => {
                      const currentDist = i < 30 ? h.FL : (i < 60 ? h.FR : (i < 90 ? h.BL : h.BR));
                      return `${(i / totalFrames) * 500},${100 - (currentDist / 350) * 100}`;
                    }).join(' ')} 
                    fill="none" stroke="var(--c3)" strokeWidth="2" 
                 />
               )}
            </svg>
        </div>

        <div className="playback-controls" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--bg2)', borderTop: '1px solid var(--border)' }}>
          {!isPlaying ? (
            <button onClick={startSession} disabled={isProcessing} style={{ background: 'var(--c0)', color: '#000', border: 'none', padding: '8px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: '12px' }}>
              {isProcessing ? '⚙...' : '▶ PLAY'}
            </button>
          ) : (
            <button onClick={stopSession} style={{ background: 'var(--c4)', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: '12px' }}>
              ■ STOP
            </button>
          )}
          
          <button onClick={resetSession} style={{ background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            ↺ RESET
          </button>
          
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '10px' }}>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Frame</span>
            <input type="range" min="1" max={totalFrames} value={frame} readOnly style={{ flex: 1, height: '4px', accentColor: 'var(--scan)' }} />
            <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{frame} / {totalFrames}</span>
          </div>
        </div>
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <div className="panel">
        <div className="panel-label">Threat Map</div>
        <div className="card" style={{ marginBottom: '16px' }}>
          <div className="panel-label" style={{ marginBottom: '10px' }}>ZONE PROXIMITY</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {['FL', 'FR', 'BL', 'BR'].map(key => (
              <div key={key} style={{ padding: '20px 10px', textAlign: 'center', border: `1px solid ${getColor(sensorData[key])}`, borderRadius: '6px', background: sensorData[key] < 120 ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg)', transition: 'all 0.25s linear' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '8px', fontWeight: 'bold' }}>{key}</div>
                <div style={{ fontSize: '20px', fontFamily: 'var(--mono)', color: getColor(sensorData[key]), fontWeight: 'bold' }}>{Math.round(sensorData[key])}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-label">Alerts</div>
        <div className="card" style={{ marginBottom: '16px', minHeight: '100px' }}>
           <div className="panel-label" style={{ marginBottom: '10px' }}>EVENT LOG</div>
          {eventLog.map((log, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderLeft: '3px solid var(--c3)', paddingLeft: '10px', marginBottom: '10px' }}>
              <div>
                <div style={{ color: 'var(--text)', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--c3)' }}></span>
                  {log.status}
                </div>
                <div style={{ color: 'var(--c3)', fontSize: '10px', marginTop: '4px' }}>{log.details}</div>
              </div>
              <div style={{ color: 'var(--muted)', fontSize: '10px', fontFamily: 'var(--mono)' }}>{log.time}</div>
            </div>
          ))}
          {eventLog.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--dim)', fontStyle: 'italic', fontSize: '12px', padding: '20px 0' }}>
              No critical events.
            </div>
          )}
        </div>

        {/* 🚀 NEW: PYSPARK ML INSIGHTS PANEL 🚀 */}
        <div className="panel-label">Machine Learning</div>
        <div className="card" style={{ marginBottom: '16px' }}>
           <div className="panel-label" style={{ marginBottom: '10px' }}>PYSPARK INSIGHTS</div>
           
           {mlInsights ? (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Model Type</span>
                 <span style={{ fontSize: '11px', color: 'var(--scan)', fontWeight: 'bold' }}>{mlInsights.model_type}</span>
               </div>
               
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Training Accuracy</span>
                 <span style={{ fontSize: '16px', color: 'var(--c2)', fontWeight: 'bold', fontFamily: 'var(--mono)' }}>{mlInsights.accuracy}%</span>
               </div>

               <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '4px' }}>
                 <div style={{ fontSize: '10px', color: 'var(--muted)', marginBottom: '6px', textTransform: 'uppercase' }}>Features Used</div>
                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                   {mlInsights.features_used.map(f => (
                     <span key={f} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', color: 'var(--text)' }}>{f}</span>
                   ))}
                 </div>
               </div>
             </div>
           ) : (
             <div style={{ textAlign: 'center', color: 'var(--dim)', fontStyle: 'italic', fontSize: '11px', padding: '10px 0' }}>
               No ML data loaded. Please run spark_model.py in your backend.
             </div>
           )}
        </div>

      </div>

      <style>{`
        .panel { overflow-y: auto; scrollbar-width: thin; scrollbar-color: var(--scan) transparent; }
        .panel::-webkit-scrollbar { width: 4px; }
        .panel::-webkit-scrollbar-track { background: transparent; }
        .panel::-webkit-scrollbar-thumb { background-color: var(--scan); border-radius: 10px; }
      `}</style>
    </>
  );
};

export default LiveFeed;