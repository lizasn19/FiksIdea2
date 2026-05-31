import React, { useState, useMemo, useEffect } from 'react';

export default function WTPChart({ initialData }) {
  // Survey response counts for 5 price tiers
  const [tier1, setTier1] = useState(30); // Rp 25k
  const [tier2, setTier2] = useState(25); // Rp 35k
  const [tier3, setTier3] = useState(15); // Rp 50k
  const [tier4, setTier4] = useState(6);  // Rp 75k
  const [tier5, setTier5] = useState(2);  // Rp 100k

  // Synchronise with AI extracted data if available
  useEffect(() => {
    if (initialData) {
      setTier1(initialData.tier1 ?? 0);
      setTier2(initialData.tier2 ?? 0);
      setTier3(initialData.tier3 ?? 0);
      setTier4(initialData.tier4 ?? 0);
      setTier5(initialData.tier5 ?? 0);
    }
  }, [initialData]);

  const totalSurveyed = 30; // Static baseline representing maximum participants

  // Prices for each tier
  const prices = [25000, 35000, 50000, 75000, 100000];

  const dataPoints = useMemo(() => {
    const responses = [tier1, tier2, tier3, tier4, tier5];
    return prices.map((price, idx) => {
      const count = Math.min(responses[idx], totalSurveyed);
      const percentage = totalSurveyed > 0 ? (count / totalSurveyed) * 100 : 0;
      // Revenue calculation if priced at this tier: price * count
      const potentialRevenue = price * count;
      return {
        price,
        count,
        percentage: Math.round(percentage),
        potentialRevenue
      };
    });
  }, [tier1, tier2, tier3, tier4, tier5]);

  // Find the optimal price tier (maximizing potential revenue)
  const optimalTier = useMemo(() => {
    let maxRev = -1;
    let opt = dataPoints[0];
    dataPoints.forEach(d => {
      if (d.potentialRevenue > maxRev) {
        maxRev = d.potentialRevenue;
        opt = d;
      }
    });
    return opt;
  }, [dataPoints]);

  // SVG dimensions
  const svgDimensions = { width: 450, height: 220, padding: 40 };

  // Calculate SVG Paths & coordinates
  const svgData = useMemo(() => {
    const getX = (idx) => svgDimensions.padding + (idx / 4) * (svgDimensions.width - svgDimensions.padding * 2);
    const getY = (percent) => svgDimensions.height - svgDimensions.padding - (percent / 100) * (svgDimensions.height - svgDimensions.padding * 2);

    let curvePath = '';
    const points = [];

    dataPoints.forEach((d, idx) => {
      const x = getX(idx);
      const y = getY(d.percentage);
      points.push({ x, y, price: d.price, percentage: d.percentage });
      if (idx === 0) {
        curvePath = `M ${x} ${y}`;
      } else {
        curvePath += ` L ${x} ${y}`;
      }
    });

    return { curvePath, points };
  }, [dataPoints, svgDimensions.width, svgDimensions.height, svgDimensions.padding]);

  const formatRupiah = (val) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
          📈 Analisis Harga & Minat Beli (WTP)
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Simulasi grafik kesediaan membayar (Willingness to Pay) dari hasil survei pasar terhadap 30 responden.
        </p>
      </div>

      {/* Input sliders for the tiers */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: 'var(--accent-blue-glow)', padding: '20px', borderRadius: '16px', border: '1.5px solid var(--border-color)' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-primary)' }}>📊 Hasil Survei: Jumlah Responden Rela Membayar di Tiap Tingkat Harga</span>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: 'white', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span style={{ fontWeight: '600' }}>Rp 25.000 <span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>(Sangat Murah)</span></span>
              <span style={{ fontWeight: '800', color: 'var(--accent-blue)' }}>{tier1} Orang</span>
            </div>
            <input type="range" min="0" max="30" value={tier1} onChange={e => setTier1(parseInt(e.target.value))} style={{ accentColor: 'var(--accent-blue)', height: '6px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: 'white', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span style={{ fontWeight: '600' }}>Rp 35.000 <span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>(Murah)</span></span>
              <span style={{ fontWeight: '800', color: 'var(--accent-blue)' }}>{tier2} Orang</span>
            </div>
            <input type="range" min="0" max="30" value={tier2} onChange={e => setTier2(parseInt(e.target.value))} style={{ accentColor: 'var(--accent-blue)', height: '6px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: 'white', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span style={{ fontWeight: '600' }}>Rp 50.000 <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>(Wajar)</span></span>
              <span style={{ fontWeight: '800', color: 'var(--accent-blue)' }}>{tier3} Orang</span>
            </div>
            <input type="range" min="0" max="30" value={tier3} onChange={e => setTier3(parseInt(e.target.value))} style={{ accentColor: 'var(--accent-blue)', height: '6px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: 'white', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span style={{ fontWeight: '600' }}>Rp 75.000 <span style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>(Mahal)</span></span>
              <span style={{ fontWeight: '800', color: 'var(--accent-blue)' }}>{tier4} Orang</span>
            </div>
            <input type="range" min="0" max="30" value={tier4} onChange={e => setTier4(parseInt(e.target.value))} style={{ accentColor: 'var(--accent-blue)', height: '6px' }} />
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: 'white', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-color)', maxWidth: '320px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
            <span style={{ fontWeight: '600' }}>Rp 100.000 <span style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>(Sangat Mahal)</span></span>
            <span style={{ fontWeight: '800', color: 'var(--accent-blue)' }}>{tier5} Orang</span>
          </div>
          <input type="range" min="0" max="30" value={tier5} onChange={e => setTier5(parseInt(e.target.value))} style={{ accentColor: 'var(--accent-blue)', height: '6px' }} />
        </div>
      </div>

      {/* SVG graph */}
      <div style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto', background: 'linear-gradient(to bottom, #ffffff, #f7f9fc)', border: '1.5px solid var(--border-color)', borderRadius: '16px', padding: '16px', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.01)' }}>
        <svg width={svgDimensions.width} height={svgDimensions.height}>
          {/* Grid lines */}
          <line x1={svgDimensions.padding} y1={svgDimensions.height - svgDimensions.padding} x2={svgDimensions.width - svgDimensions.padding} y2={svgDimensions.height - svgDimensions.padding} stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1={svgDimensions.padding} y1={svgDimensions.padding} x2={svgDimensions.padding} y2={svgDimensions.height - svgDimensions.padding} stroke="#cbd5e1" strokeWidth="1.5" />

          {/* Grid Horizontal Guidelines */}
          {[25, 50, 75, 100].map(pct => {
            const y = svgDimensions.height - svgDimensions.padding - (pct / 100) * (svgDimensions.height - svgDimensions.padding * 2);
            return (
              <g key={pct}>
                <line x1={svgDimensions.padding} y1={y} x2={svgDimensions.width - svgDimensions.padding} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3,3" />
                <text x={svgDimensions.padding - 8} y={y + 4} fill="#64748b" fontSize="9px" fontWeight="bold" textAnchor="end">{pct}%</text>
              </g>
            );
          })}

          {/* WTP Curve Path */}
          {svgData.curvePath && <path d={svgData.curvePath} fill="none" stroke="var(--accent-blue)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0px 3px 6px rgba(99, 102, 241, 0.3))' }} />}

          {/* Points */}
          {svgData.points.map((pt, idx) => {
            const isOptimal = pt.price === optimalTier.price;
            return (
              <g key={idx}>
                <circle cx={pt.x} cy={pt.y} r={isOptimal ? 7 : 5} fill={isOptimal ? 'var(--accent-gold)' : 'var(--accent-blue)'} stroke="white" strokeWidth="2.5" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))' }} />
                <text x={pt.x} y={svgDimensions.height - svgDimensions.padding + 16} fill="#1e1b4b" fontSize="9px" fontWeight="bold" textAnchor="middle">
                  Rp{pt.price / 1000}k
                </text>
                <text x={pt.x} y={pt.y - 10} fill={isOptimal ? 'var(--accent-gold)' : 'var(--text-primary)'} fontSize="10px" fontWeight="800" textAnchor="middle">
                  {pt.percentage}%
                </text>
              </g>
            );
          })}

          {/* Title inside graph */}
          <text x={svgDimensions.width / 2} y={15} textAnchor="middle" fill="var(--text-secondary)" fontSize="10px" fontWeight="800" letterSpacing="0.5px">
            KURVA ELASTISITAS MINAT BELI RESPONDEN
          </text>
        </svg>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(249, 115, 22, 0.05) 100%)', 
          border: '1.5px solid var(--accent-gold)', 
          borderRadius: '16px', 
          padding: '16px',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.05)'
        }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🏆 Rekomendasi Harga Terbaik</span>
          <h4 style={{ fontSize: '1.4rem', color: 'var(--accent-gold)', marginTop: '6px', fontWeight: '900' }}>
            {formatRupiah(optimalTier.price)}
          </h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-primary)', marginTop: '4px', lineHeight: '1.4', fontWeight: '500' }}>
            Didukung oleh <b>{optimalTier.percentage}%</b> responden dengan estimasi omzet tertinggi: <b>{formatRupiah(optimalTier.potentialRevenue)}</b>.
          </p>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '6px', borderLeft: '4px solid var(--accent-blue)', paddingLeft: '16px', justifyContent: 'center' }}>
          <p style={{ fontWeight: '800', color: 'var(--accent-blue)' }}>💡 Tips Validasi Pasar FIKSI:</p>
          <p style={{ lineHeight: '1.5', fontWeight: '500' }}>
            Juri menyukai data riil. Grafik WTP ini membuktikan Anda tidak asal menentukan harga, melainkan berdasarkan kesanggupan bayar target konsumen digital Anda secara rasional.
          </p>
        </div>
      </div>
    </div>
  );
}
