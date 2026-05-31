'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Upload, 
  RefreshCw, 
  Activity, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Leaf, 
  Sliders, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Eye,
  ArrowRight,
  FileCheck
} from 'lucide-react';

import BEPCalculator from '../components/BEPCalculator';
import WTPChart from '../components/WTPChart';
import GanttChartGenerator from '../components/GanttChartGenerator';
import SDGsPillarMapper from '../components/SDGsPillarMapper';

export default function Home() {
  const [pdfFile, setPdfFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // Steps: 1 (Input), 2 (MVP), 3 (Pasar), 4 (Finansial), 5 (Implementasi), 6 (Ringkasan)
  const [alertMsg, setAlertMsg] = useState('');
  const [showGuide, setShowGuide] = useState(false);

  const handleEvaluate = async () => {
    if (!pdfFile) {
      alert('Silakan unggah file PDF proposal Anda terlebih dahulu.');
      return;
    }

    setLoading(true);
    setEvaluation(null);

    try {
      // Evaluate using uploaded PDF file (multipart/form-data)
      const formData = new FormData();
      formData.append('file', pdfFile);

      const response = await fetch('/api/evaluate', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Terjadi kesalahan sistem.');
      }

      const result = await response.json();
      setEvaluation(result);
      setCurrentStep(2); // Automatically advance to Step 2 (MVP analysis) once evaluated
    } catch (error) {
      console.error(error);
      alert(`Gagal menganalisis: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const stepTitles = [
    "1. Input Draf Proposal",
    "2. Evaluasi Purwarupa (MVP)",
    "3. Uji Validasi Pasar",
    "4. Kelayakan Finansial",
    "5. Rencana Operasional",
    "6. Ringkasan & HAKI"
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header Navbar */}
      <header className="glass-panel" style={{ margin: '20px 20px 10px 20px', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px', borderBottom: '3px solid var(--accent-blue)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--accent-blue) 0%, #a855f7 50%, var(--accent-green) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)' }}>
            <Award size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: '800', letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
              FIKS-Idea <span className="gradient-text" style={{ fontSize: '0.9rem', verticalAlign: 'super', fontWeight: '800' }}>2026</span>
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>🚀 AI Guided Proposal Coach</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right', display: 'none', md: 'block', marginRight: '10px' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Deadline Lomba FIKSI</span>
            <p style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--accent-gold)' }}>⏳ 10 Juli 2026 (Submit Online)</p>
          </div>
          <button 
            onClick={() => setShowGuide(!showGuide)} 
            className="tab-button" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '10px 14px', 
              borderRadius: '10px', 
              border: '1.5px solid var(--accent-gold)', 
              backgroundColor: showGuide ? 'var(--accent-gold-glow)' : 'transparent', 
              color: 'var(--text-primary)', 
              transition: 'all 0.2s ease', 
              fontWeight: '800',
              boxShadow: '0 4px 10px rgba(245, 158, 11, 0.05)'
            }}
          >
            <Info size={16} color="var(--accent-gold)" />
            <span style={{ fontSize: '0.8rem' }}>💡 Panduan & Tips Juara</span>
          </button>
        </div>
      </header>

      {/* Guidelines Panel Accordion */}
      {showGuide && (
        <div className="glass-panel" style={{ margin: '0 20px 20px 20px', padding: '24px', borderRadius: '16px', borderLeft: '6px solid var(--accent-gold)', background: 'linear-gradient(to right, rgba(245, 158, 11, 0.05), #ffffff)', animation: 'fadeIn 0.3s ease' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
            💡 Panduan Sukses & Kriteria Penilaian FIKSI 2026
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.5' }}>
            Ikuti petunjuk dan strategi rahasia berikut agar proposal wirausaha tim Anda mendapatkan penilaian tinggi dari juri nasional!
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
            
            {/* Column 1: Syarat Berkas */}
            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 10px rgba(0,0,0,0.01)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--accent-blue)', display: 'block', marginBottom: '6px' }}>
                📋 Persyaratan Berkas Proposal
              </span>
              <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '16px', lineHeight: '1.6' }}>
                <li>Wajib berformat <b>PDF (.pdf)</b> dengan ukuran maksimal 10MB.</li>
                <li>Dokumen harus berupa <b>teks asli</b> (bukan hasil scan/gambar) agar AI kami dapat membaca dan mengekstrak isinya.</li>
                <li>Bab terpenting yang wajib ada: Desain Purwarupa (MVP), Hasil Uji Validasi Pasar, Model Kelayakan Keuangan, dan Rencana Kerja Tim.</li>
              </ul>
            </div>

            {/* Column 2: Bobot Penilaian */}
            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 10px rgba(0,0,0,0.01)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--accent-green)', display: 'block', marginBottom: '6px' }}>
                📊 Bobot Penilaian Juri Nasional
              </span>
              <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '16px', lineHeight: '1.6' }}>
                <li><b>Purwarupa MVP (30%)</b>: Desain UI/UX digital riil, flowchart navigasi sistem, dan link demo video.</li>
                <li><b>Validasi Pasar (25%)</b>: Pengujian minimal ke 15-30 responden luar, feedback tabel Sebelum vs Sesudah, dan riset harga WTP.</li>
                <li><b>Kelayakan Usaha (25%)</b>: Rincian biaya server, internet, penyusutan laptop, perhitungan BEP, dan arus kas 6 bulan.</li>
                <li><b>Rencana & Tema (20%)</b>: Pembagian tugas (Job Desk) mingguan, rantai pasok logis, promosi visual, dan keselarasan SDGs PBB.</li>
              </ul>
            </div>

            {/* Column 3: Trik Rahasia Juara */}
            <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 10px rgba(0,0,0,0.01)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--accent-gold)', display: 'block', marginBottom: '6px' }}>
                🌟 Trik Rahasia Menembus Final
              </span>
              <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '16px', lineHeight: '1.6' }}>
                <li><b>Jangan Klaim Rp0</b>: Menghitung biaya internet/laptop sebagai Rp0 karena milik pribadi adalah kesalahan juri. Juri menyukai transparansi finansial profesional.</li>
                <li><b>Buktikan Kemitraan</b>: Selalu lampirkan screenshot chat dengan penyuplai bahan baku atau foto rapat bersama mitra lapangan sebagai bukti komitmen bisnis nyata.</li>
                <li><b>Fokus SDGs</b>: Hubungkan bisnis Anda dengan minimal 1 dari 17 pilar SDGs PBB secara tertulis dan visual di halaman awal.</li>
              </ul>
            </div>

          </div>

          <button 
            className="glow-button" 
            onClick={() => setShowGuide(false)} 
            style={{ marginTop: '20px', padding: '8px 20px', fontSize: '0.8rem', background: 'linear-gradient(135deg, var(--accent-gold) 0%, #ea580c 100%)', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)' }}
          >
            Tutup Panduan
          </button>
        </div>
      )}

      {/* Alert Notification */}
      {alertMsg && (
        <div style={{ margin: '0 20px 16px 20px', padding: '14px 18px', backgroundColor: 'var(--accent-blue-glow)', border: '1px solid var(--accent-blue)', color: 'var(--text-primary)', borderRadius: '12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.05)' }}>
          <Info size={18} color="var(--accent-blue)" />
          <span style={{ fontWeight: '600' }}>{alertMsg}</span>
        </div>
      )}

      {/* Wizard Progress Steps Bar Indicator */}
      <div className="glass-panel" style={{ margin: '0 20px 24px 20px', padding: '18px 24px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.95)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          {stepTitles.map((title, idx) => {
            const stepNum = idx + 1;
            const isCompleted = evaluation && currentStep > stepNum;
            const isActive = currentStep === stepNum;
            const isDisabled = !evaluation && stepNum > 1;

            return (
              <button
                key={idx}
                disabled={isDisabled}
                onClick={() => setCurrentStep(stepNum)}
                style={{
                  background: 'none',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.35 : 1,
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  transform: isActive ? 'scale(1.03)' : 'scale(1)'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: '800',
                  background: isActive 
                    ? 'linear-gradient(135deg, var(--accent-blue) 0%, #8b5cf6 100%)' 
                    : isCompleted 
                    ? 'linear-gradient(135deg, var(--accent-green) 0%, #059669 100%)'
                    : 'rgba(99, 102, 241, 0.05)',
                  color: (isActive || isCompleted) 
                    ? 'white' 
                    : 'var(--text-muted)',
                  border: `2px solid ${isActive ? 'var(--accent-blue)' : isCompleted ? 'var(--accent-green)' : 'var(--border-color)'}`,
                  boxShadow: isActive 
                    ? '0 4px 12px rgba(99, 102, 241, 0.3)' 
                    : isCompleted 
                    ? '0 4px 12px rgba(16, 185, 129, 0.2)' 
                    : 'none'
                }}>
                  {isCompleted ? '✓' : stepNum}
                </div>
                <span style={{ 
                  fontSize: '0.8rem', 
                  fontWeight: isActive ? '800' : '600', 
                  color: isActive ? 'var(--accent-blue)' : isCompleted ? 'var(--accent-green)' : 'var(--text-secondary)',
                  display: 'none',
                  md: 'inline'
                }}>
                  {title.split('. ')[1]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Content Area */}
      <main style={{ flex: 1, padding: '0 20px 30px 20px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        
        {/* STEP 1: Input & PDF Upload */}
        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Onboarding Welcome Banner Card */}
            <div className="glass-panel" style={{ 
              padding: '28px', 
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(244, 63, 94, 0.06) 100%)',
              borderLeft: '6px solid var(--accent-blue)', 
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap'
            }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #6366f1 0%, #f43f5e 100%)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 8px 20px rgba(99, 102, 241, 0.3)'
              }}>
                <Award size={30} color="white" />
              </div>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', fontWeight: '800' }}>
                  Halo Calon Juara FIKSI 2026! 🚀
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '6px', lineHeight: '1.5', opacity: 0.85 }}>
                  Selamat datang di <b>FIKS-Idea Reviewer</b>. Siap menyulap ide wirausaha hebatmu menjadi proposal matang siap juara tingkat nasional? 
                  Silakan unggah file PDF proposal tim Anda pada area di bawah untuk mendapatkan analisis bimbingan AI interaktif secara instan.
                </p>
              </div>
            </div>

            {/* PDF Uploader Zone Card */}
            <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(255, 255, 255, 0.9)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Upload size={20} color="var(--accent-blue)" /> Unggah Berkas Proposal Bisnis
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', backgroundColor: 'var(--bg-tertiary)', padding: '4px 10px', borderRadius: '20px' }}>Format File Wajib: PDF (.pdf)</span>
              </div>

              {/* Drag and Drop Zone */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files[0];
                  if (file && file.type === 'application/pdf') {
                    setPdfFile(file);
                  } else {
                    alert('Hanya mendukung berkas berformat PDF.');
                  }
                }}
                style={{
                  border: `2px dashed ${isDragging ? 'var(--accent-blue)' : '#818cf8'}`,
                  background: isDragging ? 'var(--accent-blue-glow)' : 'rgba(99, 102, 241, 0.02)',
                  borderRadius: '16px',
                  padding: '45px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  boxShadow: 'inset 0 2px 8px rgba(99, 102, 241, 0.02)'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-blue)'}
                onMouseLeave={e => { if(!isDragging) e.currentTarget.style.borderColor = '#818cf8'; }}
              >
                <input 
                  type="file" 
                  id="pdf-file-input" 
                  accept=".pdf" 
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setPdfFile(file);
                  }}
                  style={{ display: 'none' }} 
                />
                
                <label htmlFor="pdf-file-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--border-color)', boxShadow: '0 6px 15px rgba(99, 102, 241, 0.05)' }}>
                    <Upload size={26} color="var(--accent-blue)" />
                  </div>
                  
                  <div>
                    <span style={{ fontSize: '0.9rem', fontWeight: '800', display: 'block', color: 'var(--text-primary)' }}>
                      Seret & lepas berkas PDF proposal di sini
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '6px', display: 'block' }}>
                      atau <span style={{ color: 'var(--accent-blue)', textDecoration: 'underline', fontWeight: 'bold' }}>klik untuk cari berkas</span> dari komputer Anda
                    </span>
                  </div>
                </label>
              </div>

              {/* Selected PDF file summary card */}
              {pdfFile && (
                <div style={{ padding: '14px 18px', backgroundColor: 'var(--accent-blue-glow)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
                      <FileCheck size={20} color="var(--accent-green)" />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.85rem', fontWeight: '800', display: 'block', color: 'var(--text-primary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={pdfFile.name}>
                        {pdfFile.name}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                        Ukuran: {(pdfFile.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setPdfFile(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '800', padding: '6px 12px', borderRadius: '8px', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-red-glow)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Hapus File
                  </button>
                </div>
              )}

              <button 
                className="glow-button-green" 
                onClick={handleEvaluate} 
                disabled={loading} 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', alignSelf: 'flex-start', padding: '14px 28px', fontSize: '0.9rem', borderRadius: '12px' }}
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    <span>Mengekstraksi & Menganalisis PDF...</span>
                  </>
                ) : (
                  <>
                    <Activity size={18} />
                    <span>Mulai Analisis Proposal</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: MVP Evaluation & SDGs Mapping */}
        {currentStep === 2 && evaluation && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* AI Review Scoreboard Card */}
            <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--accent-blue)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Aspek 1 / 4 Penilaian Juri</span>
                  <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: '4px' }}>Purwarupa Produk / MVP (Bobot 30%)</h2>
                </div>
                <span className={`status-badge ${evaluation.mvp.status.includes('BAGUS') ? 'juara' : 'ditolak'}`}>
                  {evaluation.mvp.status}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', fontSize: '0.8rem' }}>
                <p><b>🔍 Kondisi Realita di Proposal Anda:</b><br />
                  <span style={{ color: 'var(--text-secondary)' }}>{evaluation.mvp.realita}</span>
                </p>
                <p><b>💡 Kondisi Ideal Juri:</b><br />
                  <span style={{ color: 'var(--text-muted)' }}>{evaluation.mvp.ideal}</span>
                </p>
                <div style={{ padding: '12px', backgroundColor: 'var(--accent-blue-glow)', borderRadius: '8px', borderLeft: '3px solid var(--accent-blue)', marginTop: '8px' }}>
                  <span style={{ color: 'var(--accent-blue)', fontWeight: 'bold' }}>Langkah Perbaikan Juri:</span>
                  <p style={{ color: 'var(--text-primary)', marginTop: '4px', lineHeight: '1.4' }}>{evaluation.mvp.rekomendasi}</p>
                </div>
              </div>
            </div>

            {/* Corresponding Interactive Component: SDGs / Pillar Mapper */}
            <SDGsPillarMapper initialData={evaluation.extractedSDGs} />

          </div>
        )}

        {/* STEP 3: Market Validation & WTP Price Curve */}
        {currentStep === 3 && evaluation && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--accent-blue)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Aspek 2 / 4 Penilaian Juri</span>
                  <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: '4px' }}>Validasi Pasar & Kepuasan Pengguna (Bobot 25%)</h2>
                </div>
                <span className={`status-badge ${evaluation.market.status.includes('BAGUS') ? 'juara' : 'ditolak'}`}>
                  {evaluation.market.status}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', fontSize: '0.8rem' }}>
                <p><b>🔍 Kondisi Realita di Proposal Anda:</b><br />
                  <span style={{ color: 'var(--text-secondary)' }}>{evaluation.market.realita}</span>
                </p>
                <p><b>💡 Kondisi Ideal Juri:</b><br />
                  <span style={{ color: 'var(--text-muted)' }}>{evaluation.market.ideal}</span>
                </p>
                <div style={{ padding: '12px', backgroundColor: 'var(--accent-blue-glow)', borderRadius: '8px', borderLeft: '3px solid var(--accent-blue)', marginTop: '8px' }}>
                  <span style={{ color: 'var(--accent-blue)', fontWeight: 'bold' }}>Langkah Perbaikan Juri:</span>
                  <p style={{ color: 'var(--text-primary)', marginTop: '4px', lineHeight: '1.4' }}>{evaluation.market.rekomendasi}</p>
                </div>
              </div>
            </div>

            {/* Corresponding Interactive Component: WTP Curve */}
            <WTPChart initialData={evaluation.extractedWTP} />

          </div>
        )}

        {/* STEP 4: Financial Feasibility & BEP Calculator */}
        {currentStep === 4 && evaluation && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--accent-blue)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Aspek 3 / 4 Penilaian Juri</span>
                  <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: '4px' }}>Kelayakan Finansial & Proyeksi BEP (Bobot 25%)</h2>
                </div>
                <span className={`status-badge ${evaluation.finance.status.includes('BAGUS') ? 'juara' : 'ditolak'}`}>
                  {evaluation.finance.status}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', fontSize: '0.8rem' }}>
                <p><b>🔍 Kondisi Realita di Proposal Anda:</b><br />
                  <span style={{ color: 'var(--text-secondary)' }}>{evaluation.finance.realita}</span>
                </p>
                <p><b>💡 Kondisi Ideal Juri:</b><br />
                  <span style={{ color: 'var(--text-muted)' }}>{evaluation.finance.ideal}</span>
                </p>
                <div style={{ padding: '12px', backgroundColor: 'var(--accent-blue-glow)', borderRadius: '8px', borderLeft: '3px solid var(--accent-blue)', marginTop: '8px' }}>
                  <span style={{ color: 'var(--accent-blue)', fontWeight: 'bold' }}>Langkah Perbaikan Juri:</span>
                  <p style={{ color: 'var(--text-primary)', marginTop: '4px', lineHeight: '1.4' }}>{evaluation.finance.rekomendasi}</p>
                </div>
              </div>
            </div>

            {/* Corresponding Interactive Component: BEP Calculator */}
            <BEPCalculator initialData={evaluation.extractedFinance} />

          </div>
        )}

        {/* STEP 5: Implementation Schedule & Gantt Chart */}
        {currentStep === 5 && evaluation && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--accent-blue)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Aspek 4 / 4 Penilaian Juri</span>
                  <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginTop: '4px' }}>Rencana Implementasi, Jadwal & Kemitraan (Bobot 20%)</h2>
                </div>
                <span className={`status-badge ${evaluation.implementation.status.includes('BAGUS') ? 'juara' : 'ditolak'}`}>
                  {evaluation.implementation.status}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px', fontSize: '0.8rem' }}>
                <p><b>🔍 Kondisi Realita di Proposal Anda:</b><br />
                  <span style={{ color: 'var(--text-secondary)' }}>{evaluation.implementation.realita}</span>
                </p>
                <p><b>💡 Kondisi Ideal Juri:</b><br />
                  <span style={{ color: 'var(--text-muted)' }}>{evaluation.implementation.ideal}</span>
                </p>
                <div style={{ padding: '12px', backgroundColor: 'var(--accent-blue-glow)', borderRadius: '8px', borderLeft: '3px solid var(--accent-blue)', marginTop: '8px' }}>
                  <span style={{ color: 'var(--accent-blue)', fontWeight: 'bold' }}>Langkah Perbaikan Juri:</span>
                  <p style={{ color: 'var(--text-primary)', marginTop: '4px', lineHeight: '1.4' }}>{evaluation.implementation.rekomendasi}</p>
                </div>
              </div>
            </div>

            {/* Corresponding Interactive Component: Gantt Chart */}
            <GanttChartGenerator initialData={evaluation.extractedGantt} />

          </div>
        )}

        {/* STEP 6: Overall Score & Final Checklist Report */}
        {currentStep === 6 && evaluation && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Main Score Banner */}
            <div className="glass-panel" style={{ padding: '30px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap', borderLeft: `6px solid ${evaluation.overallScore >= 85 ? 'var(--accent-green)' : 'var(--accent-gold)'}` }}>
              {/* Score Circle */}
              <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="90" height="90">
                  <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="6" />
                  <circle 
                    cx="45" 
                    cy="45" 
                    r="38" 
                    fill="none" 
                    stroke={evaluation.overallScore >= 85 ? 'var(--accent-green)' : 'var(--accent-gold)'} 
                    strokeWidth="6" 
                    strokeDasharray={`${2 * Math.PI * 38}`}
                    strokeDashoffset={`${2 * Math.PI * 38 * (1 - evaluation.overallScore / 100)}`}
                    strokeLinecap="round"
                    transform="rotate(-90 45 45)"
                  />
                </svg>
                <span style={{ position: 'absolute', fontSize: '1.4rem', fontWeight: 'bold' }}>{evaluation.overallScore}%</span>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Skor Total Keseluruhan</span>
                  <span className={`status-badge ${evaluation.overallScore >= 85 ? 'juara' : 'netral'}`}>
                    {evaluation.status}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', marginTop: '6px', color: 'var(--text-primary)' }}>
                  {evaluation.summaryAdvice}
                </h3>
              </div>
            </div>

            {/* Sustainability, SDGs & Risk Mitigation Advice Card */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Leaf size={18} /> Keberlanjutan & Mitigasi Risiko FIKSI 2026
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem' }}>
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>1. Pilar Ekonomi & Tema FIKSI</span>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{evaluation.sustainability.pillarMatch}</p>
                </div>
                
                <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>2. Integrasi SDGs PBB</span>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{evaluation.sustainability.sdgAdvice}</p>
                </div>

                <div>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>3. Mitigasi Risiko & Roadmap HAKI</span>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{evaluation.sustainability.riskMitigation}</p>
                </div>
              </div>
            </div>

            {/* Restart Button */}
            <button 
              className="glow-button" 
              onClick={() => {
                setEvaluation(null);
                setCurrentStep(1);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'center', marginTop: '10px' }}
            >
              <RefreshCw size={16} />
              <span>Analisis Proposal Baru</span>
            </button>

          </div>
        )}

        {/* Navigation Buttons Row at bottom */}
        {evaluation && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            <button 
              className="tab-button" 
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: currentStep === 1 ? 0.3 : 1 }}
            >
              <ChevronLeft size={16} />
              <span>Kembali</span>
            </button>

            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', alignSelf: 'center' }}>
              Halaman {currentStep} dari 6
            </span>

            <button 
              className="glow-button" 
              onClick={handleNextStep}
              disabled={currentStep === 6}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: currentStep === 6 ? 0.3 : 1 }}
            >
              <span>Lanjut</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}

      </main>

      {/* Page Footer */}
      <footer className="glass-panel" style={{ margin: '16px', padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', borderRadius: '12px' }}>
        <p>FIKS-Idea Reviewer 2026 © Kategori Perencanaan Usaha - Rumpun Digital, Game, Media & Kewirausahaan Sosial</p>
        <p style={{ marginTop: '4px' }}>Dibimbing secara bertahap oleh AI Gemma untuk meloloskan proposal bisnis Anda ke tingkat nasional.</p>
      </footer>

    </div>
  );
}
