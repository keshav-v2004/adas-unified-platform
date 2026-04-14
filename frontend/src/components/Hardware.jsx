import React from 'react';

const Hardware = () => {
  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="card">
        <div className="card-title">Tinkercad circuit — sensor wiring diagram</div>
        <div style={{ background: '#050a10', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
          <svg viewBox="0 0 540 260" width="100%" style={{ maxHeight: '240px' }}>
            <rect x="200" y="80" width="140" height="100" rx="6" fill="#1a2e1a" stroke="#22c55e" strokeWidth="1.2" />
            <text x="270" y="130" textAnchor="middle" fontFamily="DM Mono,monospace" fontSize="10" fill="#22c55e">Arduino UNO</text>
            <text x="270" y="144" textAnchor="middle" fontFamily="DM Mono,monospace" fontSize="9" fill="#4ade80">+ TFLite Model</text>

            <rect x="196" y="94" width="6" height="4" fill="#4ade80" rx="1" />
            <rect x="196" y="104" width="6" height="4" fill="#4ade80" rx="1" />
            <rect x="196" y="114" width="6" height="4" fill="#4ade80" rx="1" />
            <rect x="196" y="124" width="6" height="4" fill="#4ade80" rx="1" />
            <rect x="338" y="94" width="6" height="4" fill="#60a5fa" rx="1" />
            <rect x="338" y="114" width="6" height="4" fill="#60a5fa" rx="1" />

            <rect x="60" y="50" width="80" height="50" rx="5" fill="#0d1f3d" stroke="#3b82f6" strokeWidth="1" />
            <text x="100" y="72" textAnchor="middle" fontFamily="DM Mono,monospace" fontSize="9" fill="#60a5fa">HC-SR04</text>
            <text x="100" y="85" textAnchor="middle" fontFamily="DM Mono,monospace" fontSize="9" fill="#60a5fa">FL</text>
            <line x1="140" y1="68" x2="196" y2="96" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 2" />

            <rect x="400" y="50" width="80" height="50" rx="5" fill="#0d1f3d" stroke="#3b82f6" strokeWidth="1" />
            <text x="440" y="72" textAnchor="middle" fontFamily="DM Mono,monospace" fontSize="9" fill="#60a5fa">HC-SR04</text>
            <text x="440" y="85" textAnchor="middle" fontFamily="DM Mono,monospace" fontSize="9" fill="#60a5fa">FR</text>
            <line x1="400" y1="68" x2="344" y2="96" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 2" />

            <rect x="60" y="170" width="80" height="50" rx="5" fill="#0d1f3d" stroke="#3b82f6" strokeWidth="1" />
            <text x="100" y="192" textAnchor="middle" fontFamily="DM Mono,monospace" fontSize="9" fill="#60a5fa">HC-SR04</text>
            <text x="100" y="205" textAnchor="middle" fontFamily="DM Mono,monospace" fontSize="9" fill="#60a5fa">BL</text>
            <line x1="140" y1="185" x2="196" y2="118" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 2" />

            <rect x="400" y="170" width="80" height="50" rx="5" fill="#0d1f3d" stroke="#3b82f6" strokeWidth="1" />
            <text x="440" y="192" textAnchor="middle" fontFamily="DM Mono,monospace" fontSize="9" fill="#60a5fa">HC-SR04</text>
            <text x="440" y="205" textAnchor="middle" fontFamily="DM Mono,monospace" fontSize="9" fill="#60a5fa">BR</text>
            <line x1="400" y1="185" x2="344" y2="118" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3 2" />

            <rect x="210" y="196" width="120" height="30" rx="4" fill="#001a00" stroke="#22c55e" strokeWidth="0.8" />
            <text x="270" y="214" textAnchor="middle" fontFamily="DM Mono,monospace" fontSize="8" fill="#22c55e">LCD 16x2 - Status</text>
            <line x1="270" y1="196" x2="270" y2="180" stroke="#22c55e" strokeWidth="0.8" strokeDasharray="2 2" />

            <circle cx="380" cy="155" r="14" fill="#1a0f00" stroke="#f97316" strokeWidth="1" />
            <text x="380" y="159" textAnchor="middle" fontFamily="DM Mono,monospace" fontSize="8" fill="#f97316">BZR</text>
            <line x1="344" y1="126" x2="366" y2="148" stroke="#f97316" strokeWidth="0.8" strokeDasharray="2 2" />

            <text x="270" y="248" textAnchor="middle" fontFamily="DM Mono,monospace" fontSize="9" fill="#6b7f96">tinkercad.com/things/0xnFpSY8IhN - sharecode: YGpp...</text>
          </svg>
        </div>
        <a
          href="https://www.tinkercad.com/things/0xnFpSY8IhN-shivam/editel?returnTo=https%3A%2F%2Fwww.tinkercad.com%2Fdashboard%2Fdesigns%2Fcircuits&sharecode=YGppsbX-zY9JsZ2pEOSZbG2CP5tvQ_m6jinBT_vthxM"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '12px',
            fontSize: '12px',
            color: 'var(--teal)',
            textDecoration: 'none',
            border: '1px solid var(--teal)',
            borderRadius: '6px',
            padding: '6px 14px'
          }}
        >
          Open in Tinkercad
        </a>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
        <div className="card">
          <div className="card-title">Bill of materials</div>
          <table style={{ width: '100%', fontFamily: 'var(--mono)', fontSize: '12px', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: 'var(--muted)' }}>
                <th style={{ textAlign: 'left', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>Component</th>
                <th style={{ borderBottom: '1px solid var(--border)' }}>Qty</th>
                <th style={{ borderBottom: '1px solid var(--border)' }}>Pin</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '5px 0' }}>HC-SR04 Ultrasonic</td>
                <td style={{ textAlign: 'center' }}>4</td>
                <td style={{ textAlign: 'center', color: 'var(--teal)' }}>D2-D9</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 0' }}>Arduino UNO R3</td>
                <td style={{ textAlign: 'center' }}>1</td>
                <td style={{ textAlign: 'center', color: 'var(--teal)' }}>-</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 0' }}>LCD 16x2 (I2C)</td>
                <td style={{ textAlign: 'center' }}>1</td>
                <td style={{ textAlign: 'center', color: 'var(--teal)' }}>A4/A5</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 0' }}>Buzzer (passive)</td>
                <td style={{ textAlign: 'center' }}>1</td>
                <td style={{ textAlign: 'center', color: 'var(--teal)' }}>D10</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 0' }}>LED (RGB)</td>
                <td style={{ textAlign: 'center' }}>3</td>
                <td style={{ textAlign: 'center', color: 'var(--teal)' }}>D11-D13</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-title">TinyML pipeline</div>
          <div style={{ fontSize: '12px', lineHeight: '1.9', color: 'var(--muted)' }}>
            <div>1. Colab notebook - Keras model (4-32-16-5)</div>
            <div>2. tf.lite.TFLiteConverter - .tflite</div>
            <div>3. INT8 quantization (size approx. 4 KB)</div>
            <div>4. xxd hex dump - C byte array</div>
            <div>5. Flash to Arduino via EloquentTinyML</div>
            <div>6. Real-time inference at ~50ms/frame</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hardware;