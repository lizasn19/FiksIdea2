import React, { useState, useEffect } from 'react';

export default function GanttChartGenerator({ initialData, reviewData }) {
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Coding & Desain MVP', member: 'Budi (Developer)', startWeek: 1, endWeek: 3, progress: 80, color: '#3b82f6' },
    { id: 2, name: 'Survei Validasi Pasar', member: 'Siti (Marketing)', startWeek: 2, endWeek: 4, progress: 100, color: '#10b981' },
    { id: 3, name: 'Sinergi & Rapat Mitra', member: 'Budi & Siti', startWeek: 4, endWeek: 5, progress: 40, color: '#f59e0b' }
  ]);

  // Synchronise with AI extracted data if available
  useEffect(() => {
    if (initialData && Array.isArray(initialData)) {
      const mapped = initialData.map((t, idx) => ({
        id: idx + 1,
        name: t.name || 'Tugas Baru',
        member: t.member || 'Tim Kerja',
        startWeek: t.startWeek || 1,
        endWeek: t.endWeek || 2,
        progress: t.progress || 0,
        color: t.color || '#3b82f6'
      }));
      setTasks(mapped);
    }
  }, [initialData]);

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: '800' }}>
          📅 Generator Gantt Chart & Pembagian Tugas (Job Desk)
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '500' }}>
          Visualisasi jadwal kerja mingguan dan pembagian tugas yang diekstrak dari proposal Anda.
        </p>
      </div>

      {/* Task List and Visual Gantt Chart (Read-only) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: 'var(--accent-blue-glow)', padding: '20px', borderRadius: '16px', border: '1.5px solid var(--border-color)', overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '160px 120px repeat(6, 1fr)', gap: '10px', minWidth: '650px', borderBottom: '2.5px solid var(--border-color)', paddingBottom: '10px', fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          <span>Nama Tugas</span>
          <span>Penanggung Jawab</span>
          <span style={{ textAlign: 'center' }}>M1</span>
          <span style={{ textAlign: 'center' }}>M2</span>
          <span style={{ textAlign: 'center' }}>M3</span>
          <span style={{ textAlign: 'center' }}>M4</span>
          <span style={{ textAlign: 'center' }}>M5</span>
          <span style={{ textAlign: 'center' }}>M6</span>
        </div>

        {tasks.map(t => {
          const startCol = t.startWeek + 2; // Column span offsets
          const duration = Math.max(1, t.endWeek - t.startWeek + 1);
          
          return (
            <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '160px 120px repeat(6, 1fr)', gap: '10px', minWidth: '650px', alignItems: 'center', fontSize: '0.82rem', padding: '4px 0' }}>
              <span style={{ fontWeight: '800', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.name}>{t.name}</span>
              <span style={{ color: 'var(--text-secondary)', fontWeight: '700' }}>👤 {t.member}</span>
              
              {/* Gantt Bar spanning specific columns (No delete button, read-only) */}
              <div style={{ 
                gridColumn: `${startCol} / span ${duration}`,
                background: `linear-gradient(90deg, ${t.color} ${t.progress}%, rgba(255,255,255,0.4) ${t.progress}%)`,
                border: `1.5px solid ${t.color}`,
                borderRadius: '8px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 8px',
                fontSize: '9px',
                fontWeight: '900',
                color: 'white',
                boxShadow: `0 4px 10px rgba(0,0,0,0.05)`,
                textShadow: '0px 1px 2px rgba(0,0,0,0.2)'
              }}>
                <span style={{ fontSize: '9px', opacity: 0.95 }}>{t.progress}% Progress</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '6px', borderLeft: '4px solid var(--accent-gold)', paddingLeft: '16px', justifyContent: 'center' }}>
        <p style={{ fontWeight: '800', color: 'var(--accent-gold)' }}>💡 Analisis Pembagian Tugas:</p>
        <p style={{ lineHeight: '1.5', fontWeight: '500' }}>
          Pembagian tugas yang logis membuktikan kesiapan tim kerja Anda di mata juri. Pastikan tugas mingguan disinkronkan dengan baik agar jadwal sekolah anggota tim tetap berjalan lancar.
        </p>
      </div>

      {/* Detailed AI advice card for Implementation (inserted here!) */}
      {reviewData && (
        <div className="glass-panel" style={{ padding: '20px', background: 'linear-gradient(to right, rgba(245, 158, 11, 0.03), #ffffff)', borderLeft: '5px solid var(--accent-gold)', borderRadius: '12px', marginTop: '10px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            📋 Rekomendasi Juri: Rencana Operasional & Tim
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem' }}>
            <p><b>🔍 Keadaan di Proposal Anda (Realita):</b><br />
              <span style={{ color: 'var(--text-secondary)' }}>{reviewData.realita}</span>
            </p>
            <p><b>💡 Kondisi Ideal Lomba:</b><br />
              <span style={{ color: 'var(--text-muted)' }}>{reviewData.ideal}</span>
            </p>
            <div style={{ backgroundColor: 'var(--accent-gold-glow)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--accent-gold)', marginTop: '4px' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--accent-gold)' }}>Saran Perbaikan Detail:</span>
              <p style={{ color: 'var(--text-primary)', marginTop: '4px', lineHeight: '1.4' }}>{reviewData.rekomendasi}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
