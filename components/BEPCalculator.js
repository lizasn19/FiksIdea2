import React, { useState, useMemo, useEffect } from 'react';

export default function BEPCalculator({ initialData }) {
  // Fixed costs states
  const [serverCost, setServerCost] = useState(150000);
  const [internetCost, setInternetCost] = useState(100000);
  const [softwareCost, setSoftwareCost] = useState(50000);
  const [depreciationCost, setDepreciationCost] = useState(100000);

  // Variable costs states
  const [rawMaterials, setRawMaterials] = useState(10000);
  const [transportCost, setTransportCost] = useState(5000);
  const [marketingCost, setMarketingCost] = useState(5000);

  // Selling price & quantity
  const [sellingPrice, setSellingPrice] = useState(50000);
  const [prodQty, setProdQty] = useState(50);

  // Synchronise with AI extracted data if available
  useEffect(() => {
    if (initialData) {
      setServerCost(initialData.serverCost ?? 0);
      setInternetCost(initialData.internetCost ?? 0);
      setSoftwareCost(initialData.softwareCost ?? 0);
      setDepreciationCost(initialData.depreciationCost ?? 0);
      setRawMaterials(initialData.rawMaterials ?? 0);
      setTransportCost(initialData.transportCost ?? 0);
      setMarketingCost(initialData.marketingCost ?? 0);
      setSellingPrice(initialData.sellingPrice ?? 0);
      setProdQty(initialData.prodQty ?? 1);
    }
  }, [initialData]);

  // Calculations
  const calculations = useMemo(() => {
    const totalFixed = serverCost + internetCost + softwareCost + depreciationCost;
    const variablePerUnit = rawMaterials + transportCost + marketingCost;
    const marginPerUnit = sellingPrice - variablePerUnit;

    const bepUnit = marginPerUnit > 0 ? Math.ceil(totalFixed / marginPerUnit) : 0;
    const bepRupiah = bepUnit * sellingPrice;

    // Monthly breakdown for planned qty
    const totalVariable = variablePerUnit * prodQty;
    const totalCost = totalFixed + totalVariable;
    const totalRevenue = sellingPrice * prodQty;
    const netProfit = totalRevenue - totalCost;

    return {
      totalFixed,
      variablePerUnit,
      marginPerUnit,
      bepUnit,
      bepRupiah,
      totalCost,
      totalRevenue,
      netProfit
    };
  }, [
    serverCost, internetCost, softwareCost, depreciationCost,
    rawMaterials, transportCost, marketingCost,
    sellingPrice, prodQty
  ]);

  // Generate SVG graph data points
  const graphPoints = useMemo(() => {
    const maxQty = Math.max(calculations.bepUnit * 2, prodQty * 1.5, 20);
    const step = Math.ceil(maxQty / 10);
    const data = [];
    
    for (let q = 0; q <= maxQty; q += step) {
      const fixed = calculations.totalFixed;
      const totalCost = fixed + (calculations.variablePerUnit * q);
      const revenue = sellingPrice * q;
      data.push({ qty: q, fixed, totalCost, revenue });
    }
    
    // Add exact BEP point if valid
    if (calculations.bepUnit > 0 && calculations.bepUnit <= maxQty) {
      const q = calculations.bepUnit;
      const fixed = calculations.totalFixed;
      const totalCost = fixed + (calculations.variablePerUnit * q);
      const revenue = sellingPrice * q;
      data.push({ qty: q, fixed, totalCost, revenue });
      data.sort((a, b) => a.qty - b.qty);
    }

    return { data, maxQty };
  }, [calculations, sellingPrice, prodQty]);

  // Render SVG Path helper
  const svgDimensions = { width: 450, height: 250, padding: 40 };
  const svgPaths = useMemo(() => {
    const { data, maxQty } = graphPoints;
    if (data.length === 0) return { fixedPath: '', costPath: '', revPath: '', bepCoords: null };

    // Max values for scaling
    const maxCostRev = Math.max(...data.map(d => Math.max(d.totalCost, d.revenue)), 1000);
    
    const getX = (qty) => svgDimensions.padding + (qty / maxQty) * (svgDimensions.width - svgDimensions.padding * 2);
    const getY = (val) => svgDimensions.height - svgDimensions.padding - (val / maxCostRev) * (svgDimensions.height - svgDimensions.padding * 2);

    let fixedPath = '';
    let costPath = '';
    let revPath = '';

    data.forEach((d, idx) => {
      const x = getX(d.qty);
      const yF = getY(d.fixed);
      const yC = getY(d.totalCost);
      const yR = getY(d.revenue);

      if (idx === 0) {
        fixedPath = `M ${x} ${yF}`;
        costPath = `M ${x} ${yC}`;
        revPath = `M ${x} ${yR}`;
      } else {
        fixedPath += ` L ${x} ${yF}`;
        costPath += ` L ${x} ${yC}`;
        revPath += ` L ${x} ${yR}`;
      }
    });

    const bepCoords = calculations.bepUnit > 0 ? {
      x: getX(calculations.bepUnit),
      y: getY(calculations.bepRupiah)
    } : null;

    const prodCoords = {
      x: getX(prodQty),
      y: getY(calculations.totalRevenue),
      costY: getY(calculations.totalCost)
    };

    return { fixedPath, costPath, revPath, bepCoords, prodCoords, getX, getY, maxCostRev };
  }, [graphPoints, calculations, prodQty, svgDimensions.width, svgDimensions.height, svgDimensions.padding]);

  const formatRupiah = (val) => {
    return 'Rp ' + val.toLocaleString('id-ID');
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
          📊 Kalkulator BEP & Proyeksi Finansial
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Masukkan estimasi biaya operasional digital siswa SMA untuk simulasi bisnis yang realistis.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        {/* Cost Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>1. Biaya Tetap (Bulanan)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Server / Cloud Hosting</label>
            <input type="number" className="custom-input" value={serverCost} onChange={e => setServerCost(Math.max(0, parseInt(e.target.value) || 0))} style={{ padding: '8px 12px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Koneksi Internet Tim</label>
            <input type="number" className="custom-input" value={internetCost} onChange={e => setInternetCost(Math.max(0, parseInt(e.target.value) || 0))} style={{ padding: '8px 12px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Penyusutan Alat (Laptop/HP)</label>
            <input type="number" className="custom-input" value={depreciationCost} onChange={e => setDepreciationCost(Math.max(0, parseInt(e.target.value) || 0))} style={{ padding: '8px 12px' }} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--accent-blue)' }}>2. Biaya Variabel & Harga</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Bahan Baku / Lisensi Aset (per unit)</label>
            <input type="number" className="custom-input" value={rawMaterials} onChange={e => setRawMaterials(Math.max(0, parseInt(e.target.value) || 0))} style={{ padding: '8px 12px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Biaya Kirim / Transport (per unit)</label>
            <input type="number" className="custom-input" value={transportCost} onChange={e => setTransportCost(Math.max(0, parseInt(e.target.value) || 0))} style={{ padding: '8px 12px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Harga Jual Produk (per unit)</label>
            <input type="number" className="custom-input" value={sellingPrice} onChange={e => setSellingPrice(Math.max(0, parseInt(e.target.value) || 0))} style={{ padding: '8px 12px' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', backgroundColor: 'var(--accent-blue-glow)', padding: '20px', borderRadius: '16px', border: '1.5px solid var(--border-color)' }}>
        {/* Results */}
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 10px rgba(0,0,0,0.01)' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-gold)', fontWeight: '800', letterSpacing: '0.5px' }}>BEP Realistis</span>
          <h4 style={{ fontSize: '1.5rem', color: 'var(--accent-gold)', marginTop: '6px', fontWeight: '900' }}>
            {calculations.bepUnit} <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>Unit</span>
          </h4>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '600' }}>
            Setara dengan {formatRupiah(calculations.bepRupiah)}
          </p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 10px rgba(0,0,0,0.01)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--accent-blue)', fontWeight: '800', letterSpacing: '0.5px' }}>Volume Produksi Bulanan</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
            <input type="range" min="1" max="200" value={prodQty} onChange={e => setProdQty(parseInt(e.target.value))} style={{ flex: 1, accentColor: 'var(--accent-blue)', height: '6px' }} />
            <span style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--accent-blue)', width: '50px', textAlign: 'right' }}>{prodQty} U</span>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 10px rgba(0,0,0,0.01)' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: calculations.netProfit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: '800', letterSpacing: '0.5px' }}>Proyeksi Laba Bersih</span>
          <h4 style={{ fontSize: '1.5rem', color: calculations.netProfit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', marginTop: '6px', fontWeight: '900' }}>
            {formatRupiah(calculations.netProfit)}
          </h4>
          <span style={{ fontSize: '0.75rem', color: calculations.netProfit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: '800', display: 'inline-block', marginTop: '4px' }}>
            {calculations.netProfit >= 0 ? '🟢 Menguntungkan (Profit)' : '🔴 Merugi (Rugi)'}
          </span>
        </div>
      </div>

      {/* SVG Chart */}
      <div style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto', background: 'linear-gradient(to bottom, #ffffff, #f7f9fc)', border: '1.5px solid var(--border-color)', borderRadius: '16px', padding: '16px', boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.01)' }}>
        <svg width={svgDimensions.width} height={svgDimensions.height}>
          {/* Grid lines */}
          <line x1={svgDimensions.padding} y1={svgDimensions.height - svgDimensions.padding} x2={svgDimensions.width - svgDimensions.padding} y2={svgDimensions.height - svgDimensions.padding} stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1={svgDimensions.padding} y1={svgDimensions.padding} x2={svgDimensions.padding} y2={svgDimensions.height - svgDimensions.padding} stroke="#cbd5e1" strokeWidth="1.5" />
          
          {/* Paths */}
          {svgPaths.fixedPath && <path d={svgPaths.fixedPath} fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="5,5" />}
          {svgPaths.costPath && <path d={svgPaths.costPath} fill="none" stroke="var(--accent-red)" strokeWidth="3.5" strokeLinecap="round" />}
          {svgPaths.revPath && <path d={svgPaths.revPath} fill="none" stroke="var(--accent-green)" strokeWidth="3.5" strokeLinecap="round" />}

          {/* Legend */}
          <g transform={`translate(${svgDimensions.padding + 10}, 20)`} style={{ fontSize: '10px', fill: 'var(--text-primary)', fontWeight: 'bold' }}>
            <circle cx="5" cy="5" r="5" fill="var(--accent-green)" />
            <text x="16" y="9">Total Pendapatan</text>
            <circle cx="130" cy="5" r="5" fill="var(--accent-red)" />
            <text x="141" y="9">Total Biaya</text>
            <line x1="220" y1="5" x2="235" y2="5" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="3,3" />
            <text x="242" y="9">Biaya Tetap</text>
          </g>

          {/* Break Even Point Marker */}
          {svgPaths.bepCoords && (
            <g>
              <circle cx={svgPaths.bepCoords.x} cy={svgPaths.bepCoords.y} r="7" fill="var(--accent-gold)" stroke="white" strokeWidth="2.5" style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.15))' }} />
              <line x1={svgPaths.bepCoords.x} y1={svgPaths.bepCoords.y} x2={svgPaths.bepCoords.x} y2={svgDimensions.height - svgDimensions.padding} stroke="var(--accent-gold)" strokeWidth="1.5" strokeDasharray="3,3" />
              <text x={svgPaths.bepCoords.x + 10} y={svgPaths.bepCoords.y - 10} fill="var(--accent-gold)" fontSize="10px" fontWeight="900">
                BEP ({calculations.bepUnit} Unit)
              </text>
            </g>
          )}

          {/* Planned Production Volume Marker */}
          {svgPaths.prodCoords && (
            <g>
              <circle cx={svgPaths.prodCoords.x} cy={svgPaths.prodCoords.y} r="6" fill="var(--accent-blue)" stroke="white" strokeWidth="2" />
              <line x1={svgPaths.prodCoords.x} y1={svgPaths.prodCoords.y} x2={svgPaths.prodCoords.x} y2={svgDimensions.height - svgDimensions.padding} stroke="var(--accent-blue)" strokeWidth="1.5" strokeDasharray="3,3" />
              <text x={svgPaths.prodCoords.x - 20} y={svgDimensions.height - svgDimensions.padding + 16} fill="var(--accent-blue)" fontSize="10px" fontWeight="900">
                Target ({prodQty} U)
              </text>
            </g>
          )}

          {/* Axes Labels */}
          <text x={svgDimensions.width / 2} y={svgDimensions.height - 5} textAnchor="middle" fill="var(--text-secondary)" fontSize="9px" fontWeight="bold" letterSpacing="0.5px">
            VOLUME PRODUKSI / PENJUALAN (UNIT)
          </text>
          <text x={12} y={svgDimensions.height / 2} textAnchor="middle" fill="var(--text-secondary)" fontSize="9px" fontWeight="bold" transform={`rotate(-90 12 ${svgDimensions.height / 2})`} letterSpacing="0.5px">
            NILAI KEUANGAN (RUPIAH)
          </text>
        </svg>
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '6px', borderLeft: '4px solid var(--accent-green)', paddingLeft: '16px', justifyContent: 'center' }}>
        <p style={{ fontWeight: '800', color: 'var(--accent-green)' }}>💡 Analisis Kelayakan Bisnis Siswa:</p>
        <p style={{ lineHeight: '1.5', fontWeight: '500' }}>
          Jumlah biaya tetap bulanan Anda adalah <b>{formatRupiah(calculations.totalFixed)}</b>. 
          Dengan harga jual <b>{formatRupiah(sellingPrice)}</b> dan biaya variabel <b>{formatRupiah(calculations.variablePerUnit)}</b> per unit, margin keuntungan kotor Anda adalah <b>{formatRupiah(calculations.marginPerUnit)}</b> per unit. 
          Target penjualan <b>{calculations.bepUnit} unit</b> adalah angka yang realistis untuk dicapai oleh siswa SMA dalam lingkup pasar sekolah atau lokal.
        </p>
      </div>
    </div>
  );
}
