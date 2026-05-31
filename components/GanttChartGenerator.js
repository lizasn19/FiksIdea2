import React, { useState, useEffect } from 'react';

export default function GanttChartGenerator({ initialData }) {
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Coding & Desain MVP', member: 'Budi (Developer)', startWeek: 1, endWeek: 3, progress: 80, color: '#3b82f6' },
    { id: 2, name: 'Survei Validasi Pasar', member: 'Siti (Marketing)', startWeek: 2, endWeek: 4, progress: 100, color: '#10b981' },
    { id: 3, name: 'Sinergi & Rapat Mitra', member: 'Budi & Siti', startWeek: 4, endWeek: 5, progress: 40, color: '#f59e0b' },
    { id: 4, name: 'Konten Promosi Medsos', member: 'Siti (Marketing)', startWeek: 3, endWeek: 6, progress: 20, color: '#ec4899' },
    { id: 5, name: 'Evaluasi & Finalisasi', member: 'Semua Anggota', startWeek: 5, endWeek: 6, progress: 0, color: '#8b5cf6' }
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

  const [newTaskName, setNewTaskName] = useState('');
  const [newMember, setNewMember] = useState('Ketua Tim');
  const [newStart, setNewStart] = useState(1);
  const [newEnd, setNewEnd] = useState(3);
  const [newColor, setNewColor] = useState('#3b82f6');

  const addTask = (e) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    const newTask = {
      id: Date.now(),
      name: newTaskName,
      member: newMember,
      startWeek: Math.min(newStart, newEnd),
      endWeek: Math.max(newStart, newEnd),
      progress: 0,
      color: newColor
    };
    setTasks([...tasks, newTask]);
    setNewTaskName('');
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const updateProgress = (id, progressVal) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, progress: Math.min(100, Math.max(0, progressVal)) } : t));
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: '800' }}>
          📅 Generator Gantt Chart & Pembagian Tugas (Job Desk)
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: '500' }}>
          Susun rencana kerja mingguan dan pembagian tugas yang teratur agar tidak berbenturan dengan waktu belajar sekolah.
        </p>
      </div>

      {/* Task List and Visual Gantt Chart */}
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
          const duration = t.endWeek - t.startWeek + 1;
          
          return (
            <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '160px 120px repeat(6, 1fr)', gap: '10px', minWidth: '650px', alignItems: 'center', fontSize: '0.82rem', padding: '4px 0' }}>
              <span style={{ fontWeight: '800', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.name}>{t.name}</span>
              <span style={{ color: 'var(--text-secondary)', fontWeight: '700' }}>👤 {t.member}</span>
              
              {/* Gantt Bar spanning specific columns */}
              <div style={{ 
                gridColumn: `${startCol} / span ${duration}`,
                background: `linear-gradient(90deg, ${t.color} ${t.progress}%, rgba(255,255,255,0.4) ${t.progress}%)`,
                border: `1.5px solid ${t.color}`,
                borderRadius: '8px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 8px',
                fontSize: '9px',
                fontWeight: '900',
                color: 'white',
                boxShadow: `0 4px 10px rgba(0,0,0,0.05)`,
                textShadow: '0px 1px 2px rgba(0,0,0,0.2)'
              }}>
                <span style={{ fontSize: '9px', opacity: 0.95 }}>{t.progress}%</span>
                <button 
                  onClick={() => deleteTask(t.id)} 
                  style={{ background: 'rgba(255,255,255,0.25)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '10px', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', transition: 'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.45)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Controls to update progress and add tasks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(245px, 1fr))', gap: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
        
        {/* Progress Adjuster */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--accent-blue)' }}>📈 Update Progress Kerja Mandiri</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto', paddingRight: '6px' }}>
            {tasks.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', fontSize: '0.78rem', backgroundColor: 'white', padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '700', color: 'var(--text-primary)' }} title={t.name}>{t.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="range" min="0" max="100" value={t.progress} onChange={e => updateProgress(t.id, parseInt(e.target.value))} style={{ width: '70px', accentColor: t.color, height: '4px' }} />
                  <span style={{ fontWeight: '800', width: '35px', textAlign: 'right', color: t.color }}>{t.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Form */}
        <form onSubmit={addTask} style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: 'rgba(16, 185, 129, 0.02)', padding: '16px', borderRadius: '14px', border: '1px dashed var(--accent-green)' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--accent-green)' }}>➕ Tambah Rencana Kerja Baru</span>
          <input type="text" placeholder="Nama tugas (contoh: Uji Coba Lapangan)..." className="custom-input" value={newTaskName} onChange={e => setNewTaskName(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '8px' }} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Mulai Minggu</label>
              <select className="custom-select" value={newStart} onChange={e => setNewStart(parseInt(e.target.value))} style={{ padding: '6px 10px', fontSize: '0.8rem', borderRadius: '8px' }}>
                {[1,2,3,4,5,6].map(w => <option key={w} value={w}>Minggu {w}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Akhir Minggu</label>
              <select className="custom-select" value={newEnd} onChange={e => setNewEnd(parseInt(e.target.value))} style={{ padding: '6px 10px', fontSize: '0.8rem', borderRadius: '8px' }}>
                {[1,2,3,4,5,6].map(w => <option key={w} value={w}>Minggu {w}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
            <input type="text" placeholder="PJ Tugas (Nama Anggota)..." className="custom-input" value={newMember} onChange={e => setNewMember(e.target.value)} style={{ padding: '8px 12px', fontSize: '0.8rem', borderRadius: '8px' }} />
            <select className="custom-select" value={newColor} onChange={e => setNewColor(e.target.value)} style={{ padding: '6px 10px', fontSize: '0.8rem', borderRadius: '8px' }}>
              <option value="#3b82f6">Biru (Teknis)</option>
              <option value="#10b981">Hijau (Marketing)</option>
              <option value="#f59e0b">Kuning (Mitra)</option>
              <option value="#ec4899">Pink (Sosial)</option>
              <option value="#8b5cf6">Ungu (Evaluasi)</option>
            </select>
          </div>

          <button type="submit" className="glow-button-green" style={{ padding: '10px 20px', fontSize: '0.85rem', alignSelf: 'flex-start', marginTop: '6px', borderRadius: '10px' }}>
            + Tambah Rencana
          </button>
        </form>
      </div>

      <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '6px', borderLeft: '4px solid var(--accent-gold)', paddingLeft: '16px', justifyContent: 'center' }}>
        <p style={{ fontWeight: '800', color: 'var(--accent-gold)' }}>💡 Analisis Jadwal & Sinergi Tim:</p>
        <p style={{ lineHeight: '1.5', fontWeight: '500' }}>
          Pembagian tugas yang logis (Job Desk terpisah antara developer, marketer, dan operasional) membuktikan kompetensi internal tim Anda di mata juri. Pengerjaan koding di sabtu-minggu dan medsos sepulang sekolah menunjukkan komitmen belajar yang tetap utama!
        </p>
      </div>
    </div>
  );
}
