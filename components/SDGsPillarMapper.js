import React, { useState, useEffect } from 'react';

export default function SDGsPillarMapper({ initialData }) {
  const [selectedPillar, setSelectedPillar] = useState('hijau');
  const [selectedSDG, setSelectedSDG] = useState(null);

  // Synchronise with AI extracted data if available
  useEffect(() => {
    if (initialData) {
      setSelectedPillar(initialData.pillar ?? 'hijau');
      if (initialData.selectedSDGId) {
        const match = sdgs.find(s => s.id === initialData.selectedSDGId);
        if (match) {
          setSelectedSDG(match);
        }
      } else {
        setSelectedSDG(null);
      }
    }
  }, [initialData]);

  const pillars = {
    hijau: {
      title: 'Economic Hijau (Green Economy)',
      description: 'Fokus pada pembangunan berkelanjutan, pengurangan emisi karbon, efisiensi sumber daya, dan keadilan sosial. Hal ini diwujudkan dengan metode daur ulang (upcycling), penggunaan energi terbarukan, atau meminimalkan limbah (zero waste).',
      evidence: 'Infografis siklus daur ulang material, perhitungan emisi yang ditekan, sertifikat bahan ramah lingkungan, logo SDGs terkait.',
      juaraTips: 'Jelaskan secara terukur bagaimana bisnis Anda memanfaatkan limbah lokal (misal: cangkang udang, biji nangka) untuk diubah menjadi produk bernilai ekonomi tinggi.'
    },
    kreatif: {
      title: 'Ekonomi Kreatif (Creative Economy)',
      description: 'Memanfaatkan kreativitas, keterampilan, dan bakat individu untuk menciptakan kesejahteraan dan lapangan pekerjaan. Sangat lekat dengan kearifan lokal, seni pertunjukan, game, musik, dan desain grafis.',
      evidence: 'Desain visual karakter, storyboard alur game/aplikasi, draf kemasan dengan ornamen budaya lokal, hak cipta desain.',
      juaraTips: 'Integrasikan kearifan lokal daerah Anda (misal: daun sengkubak sebagai penyedap alami atau cerita rakyat setempat ke dalam game edukasi).'
    },
    digital: {
      title: 'Ekonomi Digital (Digital Economy)',
      description: 'Pemanfaatan teknologi digital untuk mentransformasi transaksi, pemasaran, operasional, dan nilai produk. Melibatkan perangkat lunak, IoT (Internet of Things), kecerdasan buatan (AI), atau platform online.',
      evidence: 'Mockup antarmuka aplikasi/game, diagram arsitektur cloud, database diagram, demonstrasi rekaman layar (screencast).',
      juaraTips: 'Buatlah rancangan MVP (Minimum Viable Product) digital yang rapi, fungsional, dan memiliki navigasi yang masuk akal bagi pengguna awam.'
    }
  };

  const sdgs = [
    { 
      id: 8, 
      title: 'Pekerjaan Layak & Pertumbuhan Ekonomi', 
      desc: 'Mendukung kewirausahaan dan kreativitas siswa untuk menciptakan lapangan kerja lokal bagi anak muda.',
      action: 'Tulis di proposal bagaimana bisnis Anda dapat mempekerjakan masyarakat sekitar (misal: ibu-ibu rumah tangga untuk merajut kemasan).'
    },
    { 
      id: 9, 
      title: 'Industri, Inovasi & Infrastruktur', 
      desc: 'Menciptakan teknologi baru atau solusi inovatif digital untuk memecahkan masalah infrastruktur lokal.',
      action: 'Fokuskan pada inovasi teknologi perangkat lunak/keras yang belum pernah ada di daerah Anda.'
    },
    { 
      id: 12, 
      title: 'Konsumsi & Produksi yang Bertanggung Jawab', 
      desc: 'Memastikan siklus produksi menggunakan bahan daur ulang (upcycling) dan mengurangi limbah operasional.',
      action: 'Sajikan bagan siklus bahan baku dari pemasok lokal hingga proses pengelolaan limbah produksinya.'
    },
    { 
      id: 13, 
      title: 'Penanganan Perubahan Iklim', 
      desc: 'Membantu menekan jejak karbon dengan mengurangi penggunaan plastik sekali pakai atau beralih ke digitalisasi dokumen.',
      action: 'Hitung estimasi pengurangan plastik atau kertas dari penggunaan produk digital/layanan Anda.'
    },
    { 
      id: 15, 
      title: 'Ekosistem Daratan (Life on Land)', 
      desc: 'Melestarikan hutan dan lahan dengan memanfaatkan bahan baku alternatif non-kayu secara bijaksana.',
      action: 'Jika menggunakan bahan alam lokal, pastikan itu berasal dari tanaman budidaya yang tidak merusak hutan lindung.'
    }
  ];

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
          🌱 Pemetaan SDGs & 3 Pilar FIKSI 2026
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Tunjukkan kontribusi nyata ide bisnis Anda terhadap tema besar pembangunan berkelanjutan dan pilar ekonomi nasional.
        </p>
      </div>

      {/* 3 Pillars Selector */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
        <button 
          onClick={() => setSelectedPillar('hijau')} 
          style={{
            background: selectedPillar === 'hijau' ? 'var(--accent-green-glow)' : 'transparent',
            color: selectedPillar === 'hijau' ? 'var(--accent-green)' : 'var(--text-secondary)',
            border: `2px solid ${selectedPillar === 'hijau' ? 'var(--accent-green)' : 'var(--border-color)'}`,
            padding: '10px 18px',
            borderRadius: '30px',
            fontSize: '0.85rem',
            fontWeight: '800',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            boxShadow: selectedPillar === 'hijau' ? '0 4px 12px var(--accent-green-glow)' : 'none'
          }}
        >
          🟢 Ekonomi Hijau
        </button>
        <button 
          onClick={() => setSelectedPillar('kreatif')} 
          style={{
            background: selectedPillar === 'kreatif' ? 'rgba(168, 85, 247, 0.08)' : 'transparent',
            color: selectedPillar === 'kreatif' ? '#8b5cf6' : 'var(--text-secondary)',
            border: `2px solid ${selectedPillar === 'kreatif' ? '#8b5cf6' : 'var(--border-color)'}`,
            padding: '10px 18px',
            borderRadius: '30px',
            fontSize: '0.85rem',
            fontWeight: '800',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            boxShadow: selectedPillar === 'kreatif' ? '0 4px 12px rgba(168, 85, 247, 0.15)' : 'none'
          }}
        >
          🎨 Ekonomi Kreatif
        </button>
        <button 
          onClick={() => setSelectedPillar('digital')} 
          style={{
            background: selectedPillar === 'digital' ? 'var(--accent-blue-glow)' : 'transparent',
            color: selectedPillar === 'digital' ? 'var(--accent-blue)' : 'var(--text-secondary)',
            border: `2px solid ${selectedPillar === 'digital' ? 'var(--accent-blue)' : 'var(--border-color)'}`,
            padding: '10px 18px',
            borderRadius: '30px',
            fontSize: '0.85rem',
            fontWeight: '800',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            boxShadow: selectedPillar === 'digital' ? '0 4px 12px var(--accent-blue-glow)' : 'none'
          }}
        >
          ⚡ Ekonomi Digital
        </button>
      </div>

      {/* Pillar details display */}
      <div style={{ 
        background: selectedPillar === 'hijau' ? 'var(--accent-green-glow)' : selectedPillar === 'kreatif' ? 'rgba(168, 85, 247, 0.03)' : 'var(--accent-blue-glow)',
        border: `1.5px solid ${selectedPillar === 'hijau' ? 'var(--accent-green)' : selectedPillar === 'kreatif' ? '#8b5cf6' : 'var(--accent-blue)'}`,
        borderRadius: '16px', 
        padding: '20px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.01)'
      }}>
        <h4 style={{ color: selectedPillar === 'hijau' ? 'var(--accent-green)' : selectedPillar === 'kreatif' ? '#8b5cf6' : 'var(--accent-blue)', fontSize: '1.05rem', fontWeight: '800' }}>
          {pillars[selectedPillar].title}
        </h4>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
          {pillars[selectedPillar].description}
        </p>
        <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: '800' }}>Bukti Fisik di Proposal:</span>
          <p style={{ color: 'var(--accent-blue)', marginTop: '2px', fontWeight: '600' }}>{pillars[selectedPillar].evidence}</p>
        </div>
        <div style={{ fontSize: '0.78rem', borderLeft: '3px solid var(--accent-green)', paddingLeft: '10px', marginTop: '4px' }}>
          <span style={{ color: 'var(--accent-green)', fontWeight: '800' }}>💡 Tips Lolos Final (Juara):</span>
          <p style={{ color: 'var(--text-primary)', marginTop: '2px', fontStyle: 'italic', lineHeight: '1.4' }}>{pillars[selectedPillar].juaraTips}</p>
        </div>
      </div>

      {/* SDGs click grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Pilih Goal SDGs yang Didukung Ide Bisnis Anda:</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
          {sdgs.map(sdg => {
            const isSelected = selectedSDG?.id === sdg.id;
            return (
              <button 
                key={sdg.id} 
                onClick={() => setSelectedSDG(isSelected ? null : sdg)}
                style={{
                  background: isSelected ? 'var(--accent-gold-glow)' : 'var(--bg-secondary)',
                  color: isSelected ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  border: `1px solid ${isSelected ? 'var(--accent-gold)' : 'var(--border-color)'}`,
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🇺🇳 SDG {sdg.id}</span>
                <span style={{ fontWeight: 'normal', fontSize: '0.7rem' }}>- {sdg.title}</span>
              </button>
            );
          })}
        </div>

        {/* SDG Description */}
        {selectedSDG && (
          <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.03)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', animation: 'fadeIn 0.3s ease' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>📌 Integrasi SDG {selectedSDG.id} ke Proposal:</span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{selectedSDG.desc}</p>
            <div style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-primary)', padding: '8px', borderRadius: '6px', borderLeft: '3px solid var(--accent-gold)', marginTop: '4px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>Langkah Tulis di Proposal:</span>
              <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{selectedSDG.action}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
