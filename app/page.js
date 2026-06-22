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
  FileCheck,
  Beaker,
  Check,
  X
} from 'lucide-react';

import BEPCalculator from '../components/BEPCalculator';
import WTPChart from '../components/WTPChart';
import GanttChartGenerator from '../components/GanttChartGenerator';
import SDGsPillarMapper from '../components/SDGsPillarMapper';

// Helper function to normalize evaluation scores if the AI returns them out of scale
const normalizeEvaluationScores = (data) => {
  if (!data) return data;
  
  const cloned = JSON.parse(JSON.stringify(data)); // Deep clone to avoid mutating nested objects
  
  const weights = {
    mvp: 30,
    market: 25,
    finance: 25,
    implementation: 20
  };
  
  let hasChanges = false;
  
  for (const key of ['mvp', 'market', 'finance', 'implementation']) {
    if (cloned[key] && typeof cloned[key].score === 'number') {
      const maxScore = weights[key];
      if (cloned[key].score > maxScore) {
        cloned[key].score = Math.round((cloned[key].score * maxScore) / 100);
        hasChanges = true;
      }
    }
  }
  
  if (hasChanges && cloned.mvp && cloned.market && cloned.finance && cloned.implementation) {
    cloned.overallScore = 
      (cloned.mvp.score || 0) + 
      (cloned.market.score || 0) + 
      (cloned.finance.score || 0) + 
      (cloned.implementation.score || 0);
      
    if (cloned.overallScore >= 85) {
      cloned.status = "SIAP JUARA";
    } else if (cloned.overallScore >= 75) {
      cloned.status = "DIPERLUKAN PERBAIKAN";
    } else {
      cloned.status = "KURANG";
    }
  }
  
  return cloned;
};

export default function Home() {
  const [pdfFile, setPdfFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // Steps: 1 (Input), 2 (MVP), 3 (Pasar), 4 (Finansial), 5 (Implementasi), 6 (Ringkasan)
  const [activePage, setActivePage] = useState(1); // Pages: 1 (MVP), 2 (Pasar), 3 (Finansial), 4 (Implementasi), 5 (Ringkasan)
  const [selectedPillar, setSelectedPillar] = useState('hijau'); // Selected pillar for SDGs map
  
  const [alertMsg, setAlertMsg] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('');

  const handleEvaluate = async () => {
    if (!pdfFile) {
      alert('Silakan unggah file PDF proposal kamu terlebih dahulu.');
      return;
    }
    
    // Check file size (Vercel serverless functions have a 4.5MB payload limit)
    if (pdfFile.size > 4.5 * 1024 * 1024) {
      alert('Ukuran file proposal terlalu besar (maksimal 4.5 MB). Silakan kompres file PDF kamu terlebih dahulu.');
      return;
    }

    setLoading(true);
    setEvaluation(null);
    setProgress(0);
    setLoadingStatus('Mengekstrak teks dari berkas PDF...');

    // Progress Simulation Interval
    let currentProgress = 0;
    const interval = setInterval(() => {
      if (currentProgress < 15) {
        currentProgress += 5;
        setLoadingStatus('Mengekstrak teks dari berkas PDF...');
      } else if (currentProgress < 40) {
        currentProgress += 3;
        setLoadingStatus('Mengirim teks proposal ke AI ...');
      } else if (currentProgress < 75) {
        currentProgress += 1.5;
        setLoadingStatus('Model AI sedang menganalisis dan memberikan penilaian...');
      } else if (currentProgress < 90) {
        currentProgress += 1;
        setLoadingStatus('AI sedang mengevaluasi Purwarupa (MVP) & Uji Validasi Pasar...');
      } else if (currentProgress < 98) {
        currentProgress += 0.5;
        setLoadingStatus('Menghitung kelayakan finansial & memetakan pilar SDGs...');
      } else {
        setLoadingStatus('Hampir selesai! Sedang memformat laporan penilaian model AI...');
      }
      setProgress(Math.min(currentProgress, 99));
    }, 450);

    try {
      // Evaluate using uploaded PDF file (multipart/form-data)
      const formData = new FormData();
      formData.append('file', pdfFile);

      const response = await fetch('/api/evaluate', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          const detailsStr = errorData.details ? `\nDetail: ${errorData.details}` : '';
          throw new Error((errorData.error || 'Terjadi kesalahan sistem.') + detailsStr);
        } else {
          const errorText = await response.text();
          if (response.status === 413 || errorText.includes('Request Entity Too Large')) {
            throw new Error('Ukuran file terlalu besar untuk diproses oleh server (Maksimal 4.5 MB). Silakan kompres PDF kamu.');
          }
          throw new Error(`Terjadi kesalahan server (${response.status}). Coba lagi nanti.`);
        }
      }

      const result = await response.json();
      setProgress(100);
      setLoadingStatus('Analisis selesai!');

      // Delay step transition slightly so the user sees 100% completion
      setTimeout(() => {
        setEvaluation(normalizeEvaluationScores(result));
        setActivePage(1);
        setCurrentStep(2); // Automatically advance to Step 2 (MVP analysis) once evaluated
      }, 600);
    } catch (error) {
      console.error(error);
      alert(`Gagal menganalisis: ${error.message}`);
    } finally {
      clearInterval(interval);
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
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)' }}>
            <Award size={24} color="#fbbf24" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: '800', letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
              {evaluation ? "FIKSI IdeaHub 2026 2.0" : <>FIKSI IdeaHub <span className="gradient-text" style={{ fontSize: '0.9rem', verticalAlign: 'super', fontWeight: '800' }}>2026 2.0</span></>}
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
              {evaluation ? "Hasil Analisis Proposal" : "🚀 AI Guided Proposal Coach"}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {evaluation ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px 16px', backgroundColor: '#f1f5f9', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '800', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid #cbd5e1' }}>
                <span>📄</span>
                <span>{pdfFile ? pdfFile.name.toUpperCase() : "PROPOSAL.PDF"}</span>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </header>

      {/* Guidelines Panel Accordion */}
      {showGuide && (
        <div className="glass-panel" style={{ margin: '0 20px 20px 20px', padding: '24px', borderRadius: '16px', borderLeft: '6px solid var(--accent-gold)', background: 'linear-gradient(to right, rgba(245, 158, 11, 0.05), #ffffff)', animation: 'fadeIn 0.3s ease' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
            💡 Panduan Sukses & Kriteria Penilaian FIKSI 2026
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.5' }}>
            Ikuti petunjuk dan strategi rahasia berikut agar proposal wirausaha tim kamu mendapatkan penilaian tinggi dari model AI!
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
                📊 Bobot Penilaian Model AI
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
                <li><b>Jangan Klaim Rp0</b>: Menghitung biaya internet/laptop sebagai Rp0 karena milik pribadi adalah kesalahan. Model AI menyukai transparansi finansial profesional.</li>
                <li><b>Buktikan Kemitraan</b>: Selalu lampirkan screenshot chat dengan penyuplai bahan baku atau foto rapat bersama mitra lapangan sebagai bukti komitmen bisnis nyata.</li>
                <li><b>Fokus SDGs</b>: Hubungkan bisnismu dengan minimal 1 dari 17 pilar SDGs PBB secara tertulis dan visual di halaman awal.</li>
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
      {evaluation && (
        <div className="glass-panel" style={{ margin: '0 20px 24px 20px', padding: '24px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.95)', border: '1px solid var(--border-color)', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.02)' }}>
          <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#64748b', fontWeight: '600', marginBottom: '24px' }}>
            Rekap Penilaian Tahap 2 — Validasi Konsep & Kesiapan Implementasi
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', width: '100%', overflowX: 'auto', gap: '16px' }}>
            {/* Background connecting line */}
            <div style={{
              position: 'absolute',
              top: '25px',
              left: '50px',
              right: '50px',
              height: '3px',
              backgroundColor: '#e2e8f0',
              zIndex: 1
            }} />
            
            {/* Active green connecting line */}
            <div style={{
              position: 'absolute',
              top: '25px',
              left: '50px',
              width: `${((activePage - 1) / 4) * 82}%`,
              maxHeight: '3px',
              height: '3px',
              backgroundColor: 'var(--accent-green)',
              zIndex: 1,
              transition: 'width 0.4s ease'
            }} />

            {(() => {
              const steps = [
                { id: 1, name: 'Purwarupa Produk/Jasa', key: 'mvp', maxScore: 30, weight: 30, icon: Beaker },
                { id: 2, name: 'Validasi Pasar', key: 'market', maxScore: 25, weight: 25, icon: FileText },
                { id: 3, name: 'Analisis Kelayakan Usaha', key: 'finance', maxScore: 25, weight: 25, icon: TrendingUp },
                { id: 4, name: 'Rencana Implementasi', key: 'implementation', maxScore: 20, weight: 20, icon: Calendar },
                { id: 5, name: 'Ringkasan', key: 'summary', maxScore: 100, weight: 100, icon: Award }
              ];

              return steps.map((step, idx) => {
                const StepIcon = step.icon;
                const isCompleted = activePage > step.id;
                const isActive = activePage === step.id;
                const isFuture = activePage < step.id;
                
                // Get evaluation values
                let scoreVal = 0;
                let statusVal = "";
                
                if (step.key === 'mvp') {
                  scoreVal = evaluation.mvp.score;
                  statusVal = evaluation.mvp.status;
                } else if (step.key === 'market') {
                  scoreVal = evaluation.market.score;
                  statusVal = evaluation.market.status;
                } else if (step.key === 'finance') {
                  scoreVal = evaluation.finance.score;
                  statusVal = evaluation.finance.status;
                } else if (step.key === 'implementation') {
                  scoreVal = evaluation.implementation.score;
                  statusVal = evaluation.implementation.status;
                } else {
                  scoreVal = evaluation.overallScore;
                  statusVal = evaluation.status;
                }
                
                // Color badge details based on status
                let badgeBg = '#f1f5f9';
                let badgeColor = '#64748b';
                let badgeBorder = '1px solid #e2e8f0';
                
                if (!isFuture && step.key !== 'summary') {
                  if (statusVal.includes('KURANG') || statusVal === 'KURANG') {
                    badgeBg = '#fef2f2';
                    badgeColor = '#ef4444';
                    badgeBorder = '1px solid #fecaca';
                  } else if (statusVal.includes('CUKUP') || statusVal === 'CUKUP') {
                    badgeBg = '#fffbeb';
                    badgeColor = '#d97706';
                    badgeBorder = '1px solid #fef3c7';
                  } else if (statusVal.includes('BAGUS') || statusVal === 'BAGUS' || statusVal.includes('JUARA') || statusVal.includes('LAYAK')) {
                    badgeBg = '#ecfdf5';
                    badgeColor = '#10b981';
                    badgeBorder = '1px solid #a7f3d0';
                  }
                } else if (step.key === 'summary' && !isFuture) {
                  badgeBg = '#f5f3ff';
                  badgeColor = '#7c3aed';
                  badgeBorder = '1px solid #ddd6fe';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setActivePage(step.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      zIndex: 2,
                      flex: 1,
                      minWidth: '120px',
                      textAlign: 'center'
                    }}
                  >
                    {/* Circle Node */}
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      backgroundColor: isCompleted ? 'var(--accent-green)' : isActive ? '#7c3aed' : 'white',
                      border: `3.5px solid ${isCompleted ? 'var(--accent-green)' : isActive ? '#7c3aed' : '#cbd5e1'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isCompleted || isActive ? 'white' : '#64748b',
                      boxShadow: isActive ? '0 0 15px rgba(124, 58, 237, 0.4)' : 'none',
                      transition: 'all 0.3s ease',
                      marginBottom: '10px'
                    }}>
                      {isCompleted ? (
                        <Check size={22} strokeWidth={3} />
                      ) : (
                        <StepIcon size={20} />
                      )}
                    </div>

                    {/* Label */}
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      color: isCompleted ? 'var(--accent-green)' : isActive ? '#7c3aed' : '#64748b',
                      transition: 'color 0.3s ease',
                      marginBottom: '4px'
                    }}>
                      {step.name}
                    </span>

                    {/* Score Badge */}
                    <div style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      backgroundColor: badgeBg,
                      color: badgeColor,
                      border: badgeBorder,
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px',
                      display: 'inline-flex',
                      alignItems: 'center'
                    }}>
                      {scoreVal}/{step.maxScore}
                      {!isFuture && step.key !== 'summary' && ` • ${statusVal}`}
                    </div>
                  </button>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* Main Wizard Content Area */}
      <main style={{ flex: 1, padding: '0 20px 30px 20px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>

        {/* STEP 1: Input & PDF Upload */}
        {!evaluation && (
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
                  Selamat datang di <b>FIKSI IdeaHub 2026 2.0</b>. Siap menyulap ide wirausaha hebatmu menjadi proposal matang siap juara tingkat nasional?
                  Silakan unggah file PDF proposal tim kamu pada area di bawah untuk mendapatkan analisis bimbingan AI interaktif secara instan.
                </p>
              </div>
            </div>

            {/* PDF Uploader Zone Card / Loading Progress */}
            {loading ? (
              <div className="glass-panel" style={{ padding: '40px 28px', display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 255, 255, 0.95)', minHeight: '320px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(99, 102, 241, 0.08)' }}>
                <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', border: '4px solid rgba(99, 102, 241, 0.1)', borderTop: '4px solid var(--accent-blue)', animation: 'spin 1.5s linear infinite' }} />
                  <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue) 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 2s infinite ease-in-out' }}>
                    <RefreshCw size={30} color="white" className="animate-spin" style={{ animationDuration: '3s' }} />
                  </div>
                </div>

                <div style={{ textAlign: 'center', width: '100%', maxWidth: '550px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {loadingStatus}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                    Model: <span style={{ fontWeight: 'bold', color: 'var(--accent-blue)' }}>Model AI</span>
                  </p>

                  {/* Progress Bar */}
                  <div style={{ width: '100%', height: '12px', backgroundColor: 'rgba(99, 102, 241, 0.08)', borderRadius: '6px', overflow: 'hidden', position: 'relative', border: '1px solid var(--border-color)' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-blue) 0%, #a855f7 50%, var(--accent-green) 100%)', borderRadius: '6px', transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.78rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                    <span>Proses: {Math.round(progress)}%</span>
                    <span>Estimasi total: ~30-45 detik</span>
                  </div>
                </div>

                {/* Informative Tip */}
                <div style={{ marginTop: '10px', padding: '14px 18px', backgroundColor: 'var(--accent-gold-glow)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px', maxWidth: '550px', fontSize: '0.78rem', color: 'var(--text-primary)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.1rem' }}>💡</span>
                  <p style={{ lineHeight: '1.5', textAlign: 'left', margin: 0 }}>
                    <b>Mengapa memakan waktu?</b> Model AI mengevaluasi draf proposal kamu secara mendalam menggunakan peninjauan multi-aspek (MVP, Kelayakan Finansial, Validasi Pasar, Keselarasan SDGs). Proses berpikir AI memerlukan waktu beberapa saat demi memberikan feedback kritis dan nilai akurat.
                  </p>
                </div>
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(255, 255, 255, 0.9)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Upload size={20} color="var(--accent-blue)" /> Unggah Berkas Proposal Bisnis
                  </span>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', backgroundColor: 'var(--bg-tertiary)', padding: '4px 10px', borderRadius: '20px' }}>Format: PDF (.pdf)</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 'bold', backgroundColor: 'var(--accent-gold-glow)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>Maksimal: 4.5 MB</span>
                  </div>
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
                  onMouseLeave={e => { if (!isDragging) e.currentTarget.style.borderColor = '#818cf8'; }}
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
                        atau <span style={{ color: 'var(--accent-blue)', textDecoration: 'underline', fontWeight: 'bold' }}>klik untuk cari berkas</span> dari komputermu
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', marginTop: '8px', display: 'block', fontWeight: '700' }}>
                        ⚠️ Ukuran berkas tidak boleh lebih dari 4.5 MB
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
                  <Activity size={18} />
                  <span>Mulai Analisis Proposal</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Wizard step evaluation screens */}
        {evaluation && activePage >= 1 && activePage <= 4 && (() => {
          const steps = [
            { id: 1, name: 'Purwarupa Produk/Jasa', key: 'mvp', maxScore: 30, weight: 30, subtitle: 'Bukti konsep (video/foto)' },
            { id: 2, name: 'Validasi Pasar', key: 'market', maxScore: 25, weight: 25, subtitle: 'Survei, wawancara pelanggan awal, bukti kebutuhan' },
            { id: 3, name: 'Analisis Kelayakan Usaha', key: 'finance', maxScore: 25, weight: 25, subtitle: 'Finansial, operasional, risiko, keberlanjutan' },
            { id: 4, name: 'Rencana Implementasi', key: 'implementation', maxScore: 20, weight: 20, subtitle: 'Timeline, strategi pemasaran, kolaborasi' }
          ];

          const checklistItems = {
            mvp: [
              "Foto atau video produk nyata / prototipe fisik",
              "Mockup atau wireframe interaktif (Figma/Canva)",
              "Hasil uji coba awal atau percobaan produk",
              "Testimoni atau feedback calon pengguna (early adopter)",
              "Blueprint atau ilustrasi teknis cara kerja produk"
            ],
            market: [
              "Survei terstruktur kepada minimal 30 responden target pasar",
              "Wawancara mendalam dengan calon pelanggan potensial",
              "Bukti kebutuhan nyata: data masalah yang tervalidasi",
              "Analisis kompetitor langsung & tidak langsung",
              "Bukti demand: pre-order, waiting list, atau minat nyata"
            ],
            finance: [
              "Proyeksi keuangan realistis minimal 12 bulan ke depan",
              "Analisis Break-Even Point (BEP) yang akurat dan lengkap",
              "Identifikasi risiko bisnis + strategi mitigasi per risiko",
              "Model keberlanjutan bisnis jangka panjang (1-3 tahun)",
              "Struktur biaya lengkap: tetap, variabel, dan biaya awal"
            ],
            implementation: [
              "Gantt Chart detail per minggu untuk minimal 6 bulan ke depan",
              "Strategi pemasaran digital yang konkret, terukur, dan bertahap",
              "Rencana kolaborasi dengan mitra eksternal (komunitas/UKM/lembaga)",
              "KPI dan target jelas per milestone (bukan hanya per bulan)",
              "Pembagian tugas tim: spesifik, realistis, sesuai kompetensi"
            ]
          };

          const activeStep = steps[activePage - 1];
          const aspectKey = activeStep.key;
          const aspectData = evaluation[aspectKey];
          
          const checklist = aspectData.checklist || [false, false, false, false, false];
          const bagus = aspectData.bagus || [];
          const perbaiki = aspectData.perbaiki || [];
          const rekomendasi = aspectData.rekomendasi || "";
          
          const criteria = checklistItems[aspectKey] || [];
          
          // Set color styles based on status
          let statusColor = '#ef4444';
          let statusBgGlow = '#fef2f2';
          let statusBorderColor = '#fecaca';
          let statusText = aspectData.status || "KURANG";
          
          if (statusText.includes('CUKUP') || statusText === 'CUKUP') {
            statusColor = '#d97706';
            statusBgGlow = '#fffbeb';
            statusBorderColor = '#fef3c7';
          } else if (statusText.includes('BAGUS') || statusText === 'BAGUS' || statusText.includes('JUARA') || statusText.includes('LAYAK')) {
            statusColor = '#10b981';
            statusBgGlow = '#ecfdf5';
            statusBorderColor = '#a7f3d0';
          }
          
          return (
            <div className="glass-panel" style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.03)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Aspect Card Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.1fr 1.9fr',
                backgroundColor: '#ffffff'
              }}>
                {/* Left Header */}
                <div style={{
                  padding: '24px 28px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  borderBottom: `4px solid ${statusColor}`
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: '#7c3aed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '800',
                    fontSize: '1.3rem',
                    flexShrink: 0
                  }}>
                    {activePage}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: '800', margin: 0, lineHeight: 1.2 }}>
                      {activeStep.name}
                    </h2>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', margin: 0 }}>
                      {activeStep.subtitle}
                    </p>
                  </div>
                </div>
                
                {/* Right Header */}
                <div style={{
                  padding: '24px 28px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                      <span style={{ fontSize: '1.8rem', fontWeight: '800', color: statusColor, lineHeight: 1 }}>
                        {aspectData.score}
                      </span>
                      <span style={{ fontSize: '0.95rem', color: '#64748b', fontWeight: '600' }}>/{activeStep.maxScore}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'bold' }}>Bobot {activeStep.weight}%</span>
                  </div>
                  <span style={{
                    backgroundColor: statusBgGlow,
                    color: statusColor,
                    border: `1.5px solid ${statusBorderColor}`,
                    padding: '6px 14px',
                    borderRadius: '16px',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {statusText}
                  </span>
                </div>
              </div>

              {/* Grid Split Content */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.1fr 1.9fr',
                backgroundColor: '#ffffff'
              }}>
                {/* Left Column Checklist (Grey Panel) */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <div>
                    <h3 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '800', marginBottom: '6px' }}>
                      📋 KRITERIA PENILAIAN MODEL AI
                    </h3>
                    <p style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '20px' }}>
                      {activeStep.subtitle}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {criteria.map((item, idx) => {
                      const isChecked = checklist[idx];
                      return (
                        <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '0.8rem', opacity: isChecked ? 1 : 0.65 }}>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '6px',
                            border: `2px solid ${isChecked ? 'var(--accent-blue)' : '#cbd5e1'}`,
                            backgroundColor: isChecked ? 'rgba(99, 102, 241, 0.05)' : 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: '1px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                          }}>
                            {isChecked && <Check size={13} color="var(--accent-blue)" strokeWidth={3} />}
                          </div>
                          <span style={{ color: isChecked ? 'var(--text-primary)' : '#475569', fontWeight: isChecked ? '700' : '400', lineHeight: '1.4' }}>
                            {item}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Column Content */}
                <div style={{
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px'
                }}>
                  {/* Kondisi Sudah Bagus */}
                  <div>
                    <h3 style={{ fontSize: '0.88rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', marginBottom: '12px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--accent-green-glow)', color: 'var(--accent-green)' }}>✓</span> Kondisi Sudah Bagus
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {bagus.length > 0 ? bagus.map((item, idx) => (
                        <div key={idx} style={{ padding: '10px 14px', backgroundColor: 'var(--accent-green-glow)', borderRadius: '10px', fontSize: '0.82rem', color: 'var(--text-primary)', display: 'flex', gap: '10px', alignItems: 'flex-start', borderLeft: '3.5px solid var(--accent-green)' }}>
                          <span style={{ color: 'var(--accent-green)', fontWeight: 'bold', marginTop: '1px' }}>✓</span>
                          <span style={{ lineHeight: '1.4' }}>{item}</span>
                        </div>
                      )) : (
                        <p style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic' }}>Belum ada kriteria yang teridentifikasi sangat bagus.</p>
                      )}
                    </div>
                  </div>

                  {/* Harus Diperbaiki */}
                  <div>
                    <h3 style={{ fontSize: '0.88rem', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', marginBottom: '12px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--accent-red-glow)', color: 'var(--accent-red)' }}>✗</span> Harus Diperbaiki
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {perbaiki.length > 0 ? perbaiki.map((item, idx) => (
                        <div key={idx} style={{ padding: '10px 14px', backgroundColor: 'var(--accent-red-glow)', borderRadius: '10px', fontSize: '0.82rem', color: 'var(--text-primary)', display: 'flex', gap: '10px', alignItems: 'flex-start', borderLeft: '3.5px solid var(--accent-red)' }}>
                          <span style={{ color: 'var(--accent-red)', fontWeight: 'bold', marginTop: '1px' }}>✗</span>
                          <span style={{ lineHeight: '1.4' }}>{item}</span>
                        </div>
                      )) : (
                        <div style={{ padding: '10px 14px', backgroundColor: 'var(--accent-green-glow)', borderRadius: '10px', fontSize: '0.82rem', color: 'var(--text-primary)', display: 'flex', gap: '10px', alignItems: 'center', borderLeft: '3.5px solid var(--accent-green)' }}>
                          <span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>✓</span>
                          <span>Luar biasa! Tidak ada kelemahan kritis yang perlu diperbaiki segera.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Langkah Perbaikan */}
                  <div style={{
                    padding: '16px 20px',
                    backgroundColor: '#f5f3ff',
                    border: '1.5px solid #c084fc',
                    borderRadius: '12px',
                    marginTop: '8px'
                  }}>
                    <h4 style={{ fontSize: '0.85rem', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      🚀 LANGKAH PERBAIKAN
                    </h4>
                    <p style={{ color: 'var(--text-primary)', fontSize: '0.8rem', marginTop: '8px', lineHeight: '1.6' }}>
                      {rekomendasi}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* STEP 5: Summary Report & SDGs Mapping */}
        {evaluation && activePage === 5 && (() => {
          // Let's get SDGs details
          const pilarDetails = {
            hijau: {
              name: "Ekonomi Hijau (Green Economy)",
              desc: "Fokus pada pembangunan berkelanjutan, pengurangan emisi karbon, efisiensi sumber daya, dan keadilan sosial. Diwujudkan melalui upcycling, energi terbarukan, atau pemberdayaan komunitas lokal.",
              sdgs: [
                { id: 7, name: "SDG 7 — Energi Bersih", status: "active" },
                { id: 9, name: "SDG 9 — Industri & Inovasi", status: "active" },
                { id: 11, name: "SDG 11 — Kota Berkelanjutan", status: "inactive" },
                { id: 12, name: "SDG 12 ⚡ — Konsumsi Bertanggung Jawab", status: "highlight" },
                { id: 13, name: "SDG 13 — Penanganan Iklim", status: "active" },
                { id: 15, name: "SDG 15 — Ekosistem Darat", status: "inactive" }
              ],
              analogi: "SDG 12 (Konsumsi dan Produksi yang Bertanggung Jawab) paling relevan. Ide bisnis berpotensi mengurangi limbah kain/cangkang/plastik melalui konsep sirkular ekonomi, namun deskripsi rantai pasok dan persentase daur ulang perlu dipertegas.",
              konkret: "Tambahkan bagian 'Dampak Lingkungan': estimasi volume limbah tereduksi per bulan, jenis bahan ramah lingkungan yang digunakan, dan rancangan kemasan biodegradable serta kolaborasi daur ulang dengan mitra lokal."
            },
            kreatif: {
              name: "Ekonomi Kreatif (Creative Economy)",
              desc: "Fokus pada pemanfaatan kearifan lokal (Local Wisdom), kerajinan seni (kriya), kulinari daerah, fesyen nusantara, atau produk budaya lokal dengan sentuhan inovasi modern.",
              sdgs: [
                { id: 8, name: "SDG 8 ⚡ — Pekerjaan Layak & Pertumbuhan", status: "highlight" },
                { id: 9, name: "SDG 9 — Industri & Inovasi", status: "active" },
                { id: 12, name: "SDG 12 — Konsumsi Bertanggung Jawab", status: "inactive" }
              ],
              analogi: "SDG 8 (Pekerjaan Layak dan Pertumbuhan Ekonomi) paling relevan. Produk mengangkat motif kearifan lokal kriya dan kulinari khas nusantara untuk memberdayakan pengrajin daerah, namun hak paten/HAKI perlu didaftarkan.",
              konkret: "Tambahkan kajian budaya: dokumentasikan narasi sejarah kearifan lokal di proposal, rancang MoU kemitraan bagi hasil (royalty) dengan pengrajin lokal, dan buat rencana pendaftaran merek dagang."
            },
            digital: {
              name: "Ekonomi Digital (Digital Economy)",
              desc: "Fokus pada pemanfaatan platform online, sensor IoT, kecerdasan buatan (AI), otomatisasi sistem, e-commerce, atau game edukasi untuk memecahkan masalah pasar secara terukur.",
              sdgs: [
                { id: 9, name: "SDG 9 ⚡ — Industri, Inovasi & Infrastruktur", status: "highlight" },
                { id: 8, name: "SDG 8 — Pekerjaan Layak & Pertumbuhan", status: "active" },
                { id: 12, name: "SDG 12 — Konsumsi Bertanggung Jawab", status: "inactive" }
              ],
              analogi: "SDG 9 (Industri, Inovasi dan Infrastruktur) paling relevan. Solusi berbasis aplikasi/sensor IoT/game untuk digitalisasi pasar terpencil, namun kestabilan infrastruktur server dan keamanan data perlu dirancang.",
              konkret: "Tambahkan rancangan teknis: arsitektur sistem cloud/server gratisan, rencana beta-testing ke 50 pengguna awal, dan visual flowchart navigasi dari menu pendaftaran hingga transaksi."
            }
          };
          
          const currentPillar = pilarDetails[selectedPillar] || pilarDetails.hijau;
          
          // Set up score ring styling
          const score = evaluation.overallScore;
          const isJuara = score >= 85;
          const isCukup = score >= 75 && score < 85;
          const statusColor = isJuara ? 'var(--accent-green)' : isCukup ? 'var(--accent-gold)' : 'var(--accent-red)';
          const statusText = evaluation.status || (isJuara ? "SIAP JUARA" : isCukup ? "DIPERLUKAN PERBAIKAN" : "TOLAK / PERBAIKAN DULU");
          
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* 1. Pemetaan SDGs Card */}
              <div className="glass-panel" style={{ padding: '28px', backgroundColor: '#ffffff', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800' }}>
                  <Leaf size={18} /> Pemetaan SDGs & 3 Pilar FIKSI 2026
                </h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                  Kontribusi ide bisnis terhadap tema pembangunan berkelanjutan dan pilar ekonomi nasional.
                </p>
                
                {/* Pillar Pill Selectors */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  {['hijau', 'kreatif', 'digital'].map((pill) => {
                    const isActive = selectedPillar === pill;
                    
                    return (
                      <button
                        key={pill}
                        onClick={() => setSelectedPillar(pill)}
                        style={{
                          padding: '8px 18px',
                          borderRadius: '20px',
                          border: `1.5px solid ${isActive ? 'var(--accent-green)' : '#cbd5e1'}`,
                          backgroundColor: isActive ? 'var(--accent-green)' : '#f1f5f9',
                          color: isActive ? 'white' : '#475569',
                          fontSize: '0.75rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.2s'
                        }}
                      >
                        {pill === 'hijau' ? 'Ekonomi Hijau' : pill === 'kreatif' ? 'Ekonomi Kreatif' : 'Ekonomi Digital'}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Pillar Content */}
                <div style={{ marginTop: '20px', padding: '16px 20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    {currentPillar.name}
                  </h4>
                  <p style={{ fontSize: '0.78rem', color: '#475569', marginTop: '6px', lineHeight: '1.5' }}>
                    {currentPillar.desc}
                  </p>
                  
                  {/* SDGs Goal Chips */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' }}>
                    {currentPillar.sdgs.map((sdg) => {
                      const isMatched = evaluation.extractedSDGs.selectedSDGId === sdg.id;
                      let status = sdg.status || 'inactive';
                      if (isMatched) {
                        status = 'highlight';
                      } else if (status === 'highlight') {
                        status = 'active';
                      }
                      
                      let bg = '#f1f5f9';
                      let border = '1px solid #cbd5e1';
                      let textCol = '#64748b';
                      
                      if (status === 'highlight') {
                        bg = 'var(--accent-gold-glow)';
                        border = '1.5px solid var(--accent-gold)';
                        textCol = 'var(--accent-gold)';
                      } else if (status === 'active') {
                        bg = 'var(--accent-green-glow)';
                        border = '1px dashed var(--accent-green)';
                        textCol = 'var(--accent-green)';
                      }
                      
                      return (
                        <div
                          key={sdg.id}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '12px',
                            backgroundColor: bg,
                            border: border,
                            color: textCol,
                            fontSize: '0.72rem',
                            fontWeight: '800',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {sdg.name}
                        </div>
                      );
                    })}
                  </div>

                  {/* Analogi & Konkret Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '18px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-primary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Analogi ke Proposal:
                      </span>
                      <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '6px', lineHeight: '1.5', borderLeft: '3px solid #cbd5e1', paddingLeft: '8px' }}>
                        {currentPillar.analogi}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-primary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Langkah Konkret:
                      </span>
                      <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '6px', lineHeight: '1.5', borderLeft: '3px solid var(--accent-green)', paddingLeft: '8px' }}>
                        {currentPillar.konkret}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Keputusan Model AI Card (Main Container Card) */}
              <div className="glass-panel" style={{
                padding: '28px',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }}>
                {/* Score Alert Box */}
                <div style={{
                  padding: '20px 24px',
                  backgroundColor: isJuara ? 'var(--accent-green-glow)' : isCukup ? 'var(--accent-gold-glow)' : 'var(--accent-red-glow)',
                  border: `1.5px solid ${isJuara ? 'rgba(16,185,129,0.2)' : isCukup ? 'rgba(245,158,11,0.2)' : 'rgba(244,63,94,0.2)'}`,
                  borderRadius: '12px',
                  display: 'flex',
                  gap: '24px',
                  alignItems: 'center'
                }}>
                  {/* Circle Score Ring */}
                  <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="80" height="80">
                      <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="6" />
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        fill="none"
                        stroke={statusColor}
                        strokeWidth="6"
                        strokeDasharray={`${2 * Math.PI * 34}`}
                        strokeDashoffset={`${2 * Math.PI * 34 * (1 - score / 100)}`}
                        strokeLinecap="round"
                        transform="rotate(-90 40 40)"
                        style={{ transition: 'stroke-dashoffset 1s ease' }}
                      />
                    </svg>
                    <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--text-primary)' }}>{score}%</span>
                    </div>
                  </div>

                  {/* Status Texts */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: statusColor, fontWeight: '800', letterSpacing: '0.5px' }}>Keputusan Model AI</span>
                    <span style={{
                      color: statusColor,
                      fontSize: '1.25rem',
                      fontWeight: '800',
                      textTransform: 'uppercase'
                    }}>
                      {statusText}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600' }}>
                      Total skor: {evaluation.mvp.score} + {evaluation.market.score} + {evaluation.finance.score} + {evaluation.implementation.score} = {score}/100
                    </span>
                  </div>
                </div>

                {/* Paragraph Description */}
                <p style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  lineHeight: '1.6',
                  margin: '0 4px',
                  fontWeight: '500'
                }}>
                  {evaluation.summaryAdvice}
                </p>

                {/* 3. Keberhasilan & Mitigasi Risiko */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                  <h3 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', marginBottom: '20px' }}>
                    🏆 Keberhasilan & Mitigasi Risiko FIKSI 2026
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Item 1 */}
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#e0e7ff', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '800', flexShrink: 0, marginTop: '2px' }}>
                        1
                      </div>
                      <div>
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-primary)', display: 'block' }}>
                          Plan Ekonomi & Teknis FIKSI
                        </span>
                        <p style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px', lineHeight: '1.5' }}>
                          {evaluation.sustainability.pillarMatch}
                        </p>
                      </div>
                    </div>

                    {/* Item 2 */}
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#e0e7ff', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '800', flexShrink: 0, marginTop: '2px' }}>
                        2
                      </div>
                      <div>
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-primary)', display: 'block' }}>
                          Integrasi SDGs PIBs
                        </span>
                        <p style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px', lineHeight: '1.5' }}>
                          {evaluation.sustainability.sdgAdvice}
                        </p>
                      </div>
                    </div>

                    {/* Item 3 */}
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#e0e7ff', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '800', flexShrink: 0, marginTop: '2px' }}>
                        3
                      </div>
                      <div>
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-primary)', display: 'block' }}>
                          Mitigasi Risiko & Roadmap IMV
                        </span>
                        <p style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px', lineHeight: '1.5' }}>
                          {evaluation.sustainability.riskMitigation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Action Button inside Card */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                  <button
                    className="glow-button-green"
                    onClick={() => {
                      setEvaluation(null);
                      setCurrentStep(1);
                      setPdfFile(null);
                      setActivePage(1);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '14px 28px',
                      fontSize: '0.88rem',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
                      width: '100%',
                      justifyContent: 'center',
                      fontWeight: '800'
                    }}
                  >
                    <RefreshCw size={16} />
                    <span>Analisis Proposal Baru</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Wizard Step Navigation Buttons */}
        {evaluation && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', borderTop: '1px solid #cbd5e1', paddingTop: '20px' }}>
            <button
              onClick={() => { if (activePage > 1) setActivePage(activePage - 1); }}
              disabled={activePage === 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                fontSize: '0.85rem',
                fontWeight: '700',
                borderRadius: '12px',
                border: 'none',
                cursor: activePage === 1 ? 'not-allowed' : 'pointer',
                backgroundColor: activePage === 1 ? '#f1f5f9' : '#f3e8ff',
                color: activePage === 1 ? '#94a3b8' : '#7c3aed',
                opacity: activePage === 1 ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => {
                if (activePage > 1) {
                  e.currentTarget.style.backgroundColor = '#7c3aed';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={e => {
                if (activePage > 1) {
                  e.currentTarget.style.backgroundColor = '#f3e8ff';
                  e.currentTarget.style.color = '#7c3aed';
                }
              }}
            >
              <ChevronLeft size={16} />
              <span>Sebelumnya</span>
            </button>

            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#64748b' }}>
              {activePage} / 5
            </span>

            {activePage < 5 ? (
              <button
                onClick={() => { if (activePage < 5) setActivePage(activePage + 1); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  fontSize: '0.85rem',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  fontWeight: '700',
                  boxShadow: '0 4px 14px rgba(124, 58, 237, 0.25)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#6d28d9'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#7c3aed'; }}
              >
                <span>Selanjutnya</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => {
                  setEvaluation(null);
                  setCurrentStep(1);
                  setPdfFile(null);
                  setActivePage(1);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  fontSize: '0.85rem',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  fontWeight: '700',
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.25)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#047857'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#059669'; }}
              >
                <RefreshCw size={14} />
                <span>Analisis Proposal Baru</span>
              </button>
            )}
          </div>
        )}

      </main>

      {/* Page Footer */}
      <footer className="glass-panel" style={{ margin: '16px', padding: '16px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', borderRadius: '12px' }}>
        <p>FIKSI IdeaHub 2026 2.0 © Kategori Perencanaan Usaha - Rumpun Digital, Game, Media & Kewirausahaan Sosial</p>
        <p style={{ marginTop: '4px' }}>Dibimbing secara bertahap oleh model AI untuk meloloskan proposal bisnismu ke tingkat nasional.</p>
      </footer>

    </div>
  );
}
