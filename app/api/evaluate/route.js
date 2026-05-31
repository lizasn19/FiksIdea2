import { GoogleGenerativeAI } from '@google/generative-ai';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Custom system prompt with strict FIKSI 2026 guidelines
const SYSTEM_INSTRUCTIONS = `
Anda adalah seorang wirausahawan ahli dan juri nasional kompetisi FIKSI 2026 (Festival Inovasi dan Kewirausahaan Siswa Indonesia).
Tugas Anda adalah meninjau proposal bisnis yang ditulis oleh siswa SMA dan memberikan evaluasi detail.
Format keluaran Anda harus berupa JSON yang terstruktur rapi sesuai skema di bawah.
Bahasa tanggapan harus dalam Bahasa Indonesia yang edukatif, memotivasi, namun tegas dan kritis layaknya juri nasional.

Evaluasi dilakukan berdasarkan 4 Komponen Utama dengan kriteria spesifik:
1. Purwarupa Produk/Jasa (MVP) (Bobot 30%):
   - Harus memuat visualisasi nyata (UI/UX Mockup rapi, fungsional). Jika hanya coretan kasar/logo saja = JELEK (DITOLAK).
   - Logika Alur Kerja (Flowchart logis, error handling). Jika flowchart malas (3 kotak) = JELEK (DITOLAK).
   - Demo interaktif (Link video screencast real-time 1-2 menit di GDrive). Jika slide PPT statis/link dikunci = JELEK (DITOLAK).

2. Validasi Pasar (Bobot 25%):
   - Pengujian target pengguna (Minimal 15-30 target user riil). Jika hanya ke 5 teman/keluarga = JELEK (DITOLAK).
   - Siklus Perbaikan/Feedback Loop (Tabel Sebelum vs Sesudah konkret). Jika mengklaim langsung sempurna tanpa eror = JELEK (DITOLAK).
   - Analisis Willingness to Pay (WTP) (Harga ditentukan rasional berdasarkan survei WTP). Jika asal-asalan/terlalu mahal = JELEK (DITOLAK).

3. Kelayakan Usaha (Bobot 25%):
   - Model Bisnis/Aliran Pendapatan (Lebih dari satu aliran pendapatan logis). Jika hanya pasang AdSense = JELEK (DITOLAK).
   - Struktur Pengeluaran (Sewa server riil, internet, penyusutan laptop). Jika Rp0 karena wifi sekolah/laptop pribadi = JELEK (DITOLAK).
   - Target Balik Modal/BEP (Grafik proyeksi 6 bulan naik realistis). Jika untung fantastis di bulan kedua tanpa dasar = JELEK (DITOLAK).

4. Rencana Implementasi & Tema (Bobot 20%):
   - Waktu Kerja (Jadwal mingguan/Gantt Chart realistis agar tidak tabrakan sekolah, Job Desk terbagi). Jika semua dikerjakan ketua = JELEK (DITOLAK).
   - Rantai Pasok/Supply Chain (Bukti chat/komunikasi dua arah dengan penyuplai/komunitas). Jika klaim sepihak tanpa bukti = JELEK (DITOLAK).
   - Sinergi Mitra Lapangan (Bukti foto rapat/uji coba dengan mitra lokal). Jika hanya teks tanpa foto = JELEK (DITOLAK).
   - Promosi (Medsos, target komunitas spesifik, draf konten visual). Jika hanya kalimat klise mulut ke mulut = JELEK (DITOLAK).
   - Linearitas Tema FIKSI 2026 (Ekonomi Hijau/Upcycling, Ekonomi Kreatif, Ekonomi Digital, SDGs). Jika tidak ramah lingkungan/kearifan lokal = JELEK (DITOLAK).
   - Mitigasi Risiko & Roadmap (Roadmap 6 bulan ke depan, matriks risiko teknis, rencana daftar HAKI/Merk). Jika klaim tidak ada risiko = JELEK (DITOLAK).

Format Skema Keluaran JSON:
{
  "overallScore": number,
  "status": string,
  "mvp": {
    "score": number,
    "status": string,
    "realita": string,
    "ideal": string,
    "rekomendasi": string
  },
  "market": {
    "score": number,
    "status": string,
    "realita": string,
    "ideal": string,
    "rekomendasi": string
  },
  "finance": {
    "score": number,
    "status": string,
    "realita": string,
    "ideal": string,
    "rekomendasi": string
  },
  "implementation": {
    "score": number,
    "status": string,
    "realita": string,
    "ideal": string,
    "rekomendasi": string
  },
  "sustainability": {
    "pillarMatch": string,
    "sdgAdvice": string,
    "riskMitigation": string
  },
  "summaryAdvice": string,
  "extractedFinance": {
    "serverCost": number (sewa server bulanan),
    "internetCost": number (internet tim),
    "softwareCost": number (lisensi software),
    "depreciationCost": number (penyusutan laptop/alat),
    "rawMaterials": number (bahan baku per unit),
    "transportCost": number (biaya kirim per unit),
    "marketingCost": number (biaya promosi per unit),
    "sellingPrice": number (harga jual per unit),
    "prodQty": number (target produksi bulanan)
  },
  "extractedWTP": {
    "tier1": number (jumlah responden rela bayar Rp 25.000, max 30),
    "tier2": number (jumlah responden rela bayar Rp 35.000, max 30),
    "tier3": number (jumlah responden rela bayar Rp 50.000, max 30),
    "tier4": number (jumlah responden rela bayar Rp 75.000, max 30),
    "tier5": number (jumlah responden rela bayar Rp 100.000, max 30)
  },
  "extractedGantt": [
    {
      "name": string (nama tugas),
      "member": string (pj tugas),
      "startWeek": number (1-6),
      "endWeek": number (1-6),
      "progress": number (0-100),
      "color": string (hex color: #3b82f6, #10b981, #f59e0b, #ec4899, #8b5cf6)
    }
  ],
  "extractedSDGs": {
    "pillar": string ("hijau" | "kreatif" | "digital"),
    "selectedSDGId": number (8 | 9 | 12 | 13 | 15)
  }
}
`;

function extractJSON(text) {
  // 1. Try to extract from ```json ... ``` or ``` ... ```
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)```/g;
  let match;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    try {
      return JSON.parse(match[1].trim());
    } catch (e) {
      // Continue
    }
  }

  // 2. Try to find JSON object starting with {"overallScore" or similar
  const overallScoreIndex = text.lastIndexOf('"overallScore"');
  if (overallScoreIndex !== -1) {
    const openBraceIndex = text.lastIndexOf('{', overallScoreIndex);
    if (openBraceIndex !== -1) {
      for (let i = text.length; i > openBraceIndex; i--) {
        const candidate = text.substring(openBraceIndex, i);
        try {
          return JSON.parse(candidate.trim());
        } catch (e) {
          // Continue
        }
      }
    }
  }

  // 3. Fallback: find any valid JSON object from the end of the text
  let braceIndex = text.lastIndexOf('{');
  while (braceIndex !== -1) {
    for (let i = text.length; i > braceIndex; i--) {
      const candidate = text.substring(braceIndex, i);
      try {
        return JSON.parse(candidate.trim());
      } catch (e) {
        // Continue
      }
    }
    braceIndex = text.lastIndexOf('{', braceIndex - 1);
  }

  throw new Error("Tidak dapat mem-parse output sebagai JSON yang valid.");
}

export async function POST(req) {
  try {
    let proposalText = '';
    let userApiKey = '';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await req.formData();
      const file = formData.get('file');
      userApiKey = formData.get('userApiKey') || '';

      if (!file) {
        return new Response(JSON.stringify({ error: 'File proposal tidak ditemukan dalam unggahan.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Convert file into a Buffer and extract text using pdf-parse
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const pdf = require('pdf-parse');
      const pdfData = await pdf(buffer);
      proposalText = pdfData.text;

    } else {

      // Handle JSON body (fallback compatibility for templates)
      const body = await req.json();
      proposalText = body.proposalText;
      userApiKey = body.userApiKey || '';
    }


    if (!proposalText || proposalText.trim().length < 10) {
      return new Response(JSON.stringify({ error: 'Gagal mengekstrak teks proposal. Pastikan PDF berisi teks (bukan hasil scan gambar) dan tidak kosong.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate custom API key format if provided
    if (userApiKey) {
      const cleanKey = userApiKey.trim();
      if (!cleanKey.startsWith('AIzaSy') || cleanKey.length < 30) {
        return new Response(JSON.stringify({ 
          error: 'Format API Key Google Gemini tidak valid. Kunci harus diawali dengan "AIzaSy" dan biasanya berjumlah 39 karakter.' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Determine which API key to use
    const apiKey = userApiKey ? userApiKey.trim() : process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // If no API Key, return mock data simulated analysis based on input keywords
      const mockResult = generateMockAnalysis(proposalText);
      return new Response(JSON.stringify(mockResult), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Call real Gemini API
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({
      model: 'gemma-4-31b-it',
      systemInstruction: SYSTEM_INSTRUCTIONS
    });



    const prompt = `Berikut adalah proposal bisnis dari siswa:
----------------------------------------
${proposalText}
----------------------------------------
Analisis proposal ini secara objektif dan detail. Kembalikan tanggapan hanya dalam format JSON sesuai skema.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = result.response.text();
    let jsonResult;
    try {
      jsonResult = extractJSON(responseText);
    } catch (err) {
      throw new Error(`Output JSON gagal di-parse: ${err.message}. Raw output: ${responseText}`);
    }


    return new Response(JSON.stringify(jsonResult), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });


  } catch (error) {
    console.error('Error in evaluate route:', error);
    
    // Sanitize error message to ensure no API key info is leaked
    let safeMessage = error.message || 'Terjadi kesalahan internal.';
    if (safeMessage.includes('AIzaSy')) {
      safeMessage = 'Autentikasi gagal. Pastikan API Key Google Gemini yang Anda masukkan sudah benar.';
    }
    
    return new Response(JSON.stringify({ 
      error: 'Gagal menganalisis proposal.', 
      details: safeMessage 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Function to generate high-quality mock evaluation responses if API key is not supplied
function generateMockAnalysis(text) {
  const lowercase = text.toLowerCase();
  
  // Custom mock values based on templates or keywords in the text
  let isRiceDetector = lowercase.includes('gabah') || lowercase.includes('padi') || lowercase.includes('rice') || lowercase.includes('sensor');
  let isUpcycle = lowercase.includes('cangkang') || lowercase.includes('udang') || lowercase.includes('limbah') || lowercase.includes('upcycle') || lowercase.includes('plastik');
  let isGame = lowercase.includes('game') || lowercase.includes('permainan') || lowercase.includes('sejarah') || lowercase.includes('budaya');

  let title = "Ide Bisnis Kustom";
  let score = 74;
  let status = "DIPERLUKAN PERBAIKAN";

  if (isRiceDetector) {
    title = "Sensor Pendeteksi Kualitas Gabah Berbasis IoT (RiceGuard)";
    score = 88;
    status = "SIAP JUARA";
  } else if (isUpcycle) {
    title = "Upcycling Cangkang Udang Menjadi Bioplastik Organik (EcoShell)";
    score = 92;
    status = "SIAP JUARA";
  } else if (isGame) {
    title = "Game Edukasi Sejarah & Budaya Nusantara (Garuda Saga)";
    score = 78;
    status = "DIPERLUKAN PERBAIKAN";
  }

  const result = {
    overallScore: score,
    status: status,
    mvp: {
      score: score > 80 ? 85 : 60,
      status: score > 80 ? "🟢 BAGUS (JUARA)" : "🔴 JELEK (DITOLAK)",
      realita: isRiceDetector 
        ? "Sudah melampirkan screenshot desain sirkuit sensor dan mockup antarmuka web monitoring." 
        : isGame 
        ? "Hanya menampilkan gambar coretan karakter di kertas buram dan logo rancangan game tanpa alur."
        : "Menjelaskan konsep ide digital secara tekstual, namun visualisasi purwarupa atau screenshoot sistem belum terlampir secara rapi.",
      ideal: "Menampilkan desain antarmuka (UI/UX Mockup) yang rapi, modern, konsisten dalam warna/tipografi, fungsional, dilengkapi bagan alir (flowchart) navigasi pengguna serta video rekaman layar (screencast) demonstrasi berdurasi 1-2 menit di GDrive.",
      rekomendasi: isGame
        ? "Gunakan alat desainer antarmuka seperti Figma untuk menggambar mockup menu utama dan antarmuka permainan secara digital. Buat bagan navigasi flowchart dari menu mulai hingga akhir permainan."
        : "Buat rekaman layar (screencast) berdurasi 1 menit menggunakan OBS/Loom yang memperlihatkan alur sistem bekerja real-time, lalu bagikan tautannya di GDrive dengan akses dibuka publik."
    },
    market: {
      score: score > 85 ? 90 : 65,
      status: score > 85 ? "🟢 BAGUS (JUARA)" : "🔴 JELEK (DITOLAK)",
      realita: isUpcycle
        ? "Telah menguji produk bioplastik ke 25 pengrajin lokal dan melampirkan grafik kepuasan serta hasil survei WTP harga jual."
        : "Menyatakan telah melakukan pengujian produk ke beberapa keluarga terdekat dan teman sekelas tanpa melampirkan grafik umpan balik kuantitatif.",
      ideal: "Pengujian langsung ke minimal 15-30 orang target pengguna riil secara objektif, menyajikan tabel feedback loop (Sebelum vs Sesudah perbaikan konkret), serta menetapkan harga jual rasional berbasis kurva Willingness to Pay (WTP).",
      rekomendasi: "Sebarkan kuesioner ke minimal 20 calon pelanggan di luar lingkaran pertemanan dekat. Rangkum masukannya dalam tabel Sebelum vs Sesudah. Jalankan kalkulator WTP di dashboard ini untuk merasionalkan harga jual Anda."
    },
    finance: {
      score: score > 80 ? 85 : 55,
      status: score > 80 ? "🟢 BAGUS (JUARA)" : "🔴 JELEK (DITOLAK)",
      realita: lowercase.includes('keuangan') || lowercase.includes('bep')
        ? "Mencantumkan perhitungan modal dasar, tetapi mengabaikan biaya sewa server bulanan, internet tim, dan penyusutan aset laptop kerja."
        : "Menyebutkan biaya operasional Rp0 karena menggunakan laptop pribadi dan wifi sekolah, serta proyeksi keuntungan naik 500% di bulan kedua.",
      ideal: "Menyusun struktur paket harga langganan atau produk yang logis, memaparkan rincian biaya operasional bulanan riil (server, internet, transportasi, penyusutan laptop), dan menghitung Break-Even Point (BEP Unit & BEP Rupiah) dengan grafik proyeksi 6 bulan yang realistis.",
      rekomendasi: "Jalankan simulasi finansial menggunakan Kalkulator BEP di bawah. Masukkan biaya penyusutan laptop (misal Rp100.000/bulan) dan sewa hosting server web bulanan agar keuntungan bersih dihitung jujur di mata juri."
    },
    implementation: {
      score: score > 80 ? 88 : 70,
      status: score > 80 ? "🟢 BAGUS (JUARA)" : "🔴 JELEK (DITOLAK)",
      realita: isRiceDetector
        ? "Melampirkan Gantt Chart pembagian tugas mingguan dan bukti komunikasi WhatsApp awal dengan koperasi petani gabah lokal."
        : "Menjelaskan rencana promosi klise 'mulut ke mulut dan lewat medsos', tanpa melampirkan pembagian jadwal kerja mingguan (Gantt chart) atau bukti kemitraan riil.",
      ideal: "Gantt Chart mingguan yang memisahkan jam sekolah dengan kerja bisnis, pembagian job desk personal tim, draf poster promosi visual medsos spesifik target, bukti dokumentasi/chat dengan penyuplai bahan baku, dan foto kolaborasi lapangan dengan mitra lokal.",
      rekomendasi: "Gunakan generator jadwal Gantt Chart untuk membagi tugas mingguan. Lampirkan tangkapan layar (screenshot) chat pemesanan aset atau foto bersama perwakilan pedagang pasar / petani setempat sebagai bukti sinergi operasional lapangan."
    },
    sustainability: {
      pillarMatch: isUpcycle 
        ? "Sangat kuat di pilar Ekonomi Hijau (upcycling limbah cangkang udang) dan Ekonomi Digital (sistem e-commerce pasokan)."
        : isRiceDetector
        ? "Linear dengan pilar Ekonomi Digital (sensor IoT) dan Ekonomi Hijau (mengurangi gagal panen padi sehingga menekan food waste)."
        : "Cocok dengan Ekonomi Kreatif (game budaya) dan Ekonomi Digital, namun kontribusi terhadap Ekonomi Hijau (keberlanjutan lingkungan) masih lemah.",
      sdgAdvice: isUpcycle
        ? "Mendukung penuh SDG 12 (Konsumsi & Produksi Bertanggung Jawab) dan SDG 14 (Menjaga Ekosistem Laut dengan mengurangi sampah cangkang). Tonjolkan logo SDGs ini di halaman awal proposal."
        : "Sesuai dengan SDG 9 (Inovasi Industri) dan SDG 2 (Tanpa Kelaparan / Ketahanan Pangan). Sebutkan secara tertulis kontribusi ini pada Bab Pendahuluan proposal.",
      riskMitigation: "Rencana mitigasi risiko teknis (misal cadangan server mati, kegagalan sensor) harus dituliskan dalam tabel matriks risiko. Jadwalkan juga rencana pendaftaran Hak Cipta (HAKI) atau merk dagang pada roadmap bulan ke-4 setelah kompetisi."
    },
    summaryAdvice: isRiceDetector || isUpcycle
      ? `Ide bisnis "${title}" sangat berpotensi. Fokus perbaikan Anda saat ini adalah melengkapi visualisasi bukti sinergi mitra lapangan berupa foto dokumentasi fisik kegiatan, serta merinci roadmap perlindungan HAKI produk.`
      : `Proposal "${title}" memerlukan penguatan di bagian visual purwarupa digital (mockup figma), survei pasar yang lebih objektif (>15 orang), dan pembagian waktu operasional siswa agar tidak mengabaikan sekolah. Gunakan alat simulasi di bawah untuk memperbaikinya.`,
    extractedFinance: isRiceDetector ? {
      serverCost: 150000,
      internetCost: 100000,
      softwareCost: 50000,
      depreciationCost: 100000,
      rawMaterials: 25000,
      transportCost: 5000,
      marketingCost: 5000,
      sellingPrice: 75000,
      prodQty: 45
    } : isUpcycle ? {
      serverCost: 0,
      internetCost: 50000,
      softwareCost: 0,
      depreciationCost: 80000,
      rawMaterials: 1000,
      transportCost: 500,
      marketingCost: 500,
      sellingPrice: 2500,
      prodQty: 400
    } : {
      serverCost: 0,
      internetCost: 0,
      softwareCost: 0,
      depreciationCost: 0,
      rawMaterials: 0,
      transportCost: 0,
      marketingCost: 0,
      sellingPrice: 150000,
      prodQty: 10
    },
    extractedWTP: isRiceDetector ? {
      tier1: 30,
      tier2: 28,
      tier3: 20,
      tier4: 10,
      tier5: 3
    } : isUpcycle ? {
      tier1: 30,
      tier2: 30,
      tier3: 25,
      tier4: 15,
      tier5: 5
    } : {
      tier1: 5,
      tier2: 3,
      tier3: 1,
      tier4: 0,
      tier5: 0
    },
    extractedGantt: isRiceDetector ? [
      { name: 'Coding & Desain MVP', member: 'Budi (Developer)', startWeek: 1, endWeek: 3, progress: 80, color: '#3b82f6' },
      { name: 'Survei Validasi Pasar', member: 'Siti (Marketing)', startWeek: 2, endWeek: 4, progress: 100, color: '#10b981' },
      { name: 'Sinergi & Rapat Mitra', member: 'Budi & Siti', startWeek: 4, endWeek: 5, progress: 40, color: '#f59e0b' }
    ] : isUpcycle ? [
      { name: 'Ekstraksi Cangkang', member: 'Tim Kimia', startWeek: 1, endWeek: 4, progress: 90, color: '#ec4899' },
      { name: 'Uji Validasi Kemasan', member: 'Tim Marketing', startWeek: 3, endWeek: 5, progress: 80, color: '#10b981' }
    ] : [
      { name: 'Coding Game', member: 'Ketua Tim', startWeek: 1, endWeek: 6, progress: 20, color: '#3b82f6' }
    ],
    extractedSDGs: isRiceDetector ? {
      pillar: 'digital',
      selectedSDGId: 9
    } : isUpcycle ? {
      pillar: 'hijau',
      selectedSDGId: 12
    } : {
      pillar: 'kreatif',
      selectedSDGId: 8
    }
  };

  return result;
}
