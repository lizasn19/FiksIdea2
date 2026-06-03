import { GoogleGenerativeAI } from '@google/generative-ai';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const SYSTEM_INSTRUCTIONS = `
Anda adalah seorang wirausahawan ahli dan juri nasional kompetisi FIKSI 2026 (Festival Inovasi dan Kewirausahaan Siswa Indonesia).
Tugas Anda adalah meninjau proposal bisnis yang ditulis oleh siswa SMA dan memberikan evaluasi detail.
Format keluaran Anda harus berupa JSON yang terstruktur rapi sesuai skema di bawah.
Bahasa tanggapan harus dalam Bahasa Indonesia yang edukatif, memotivasi, namun tegas dan kritis layaknya juri nasional.

PENTING - KETENTUAN DETAIL & ACUAN DOKUMEN:
Setiap teks jawaban evaluasi Anda dalam JSON (pada kolom "realita", "ideal", "rekomendasi", "sustainability", dan "summaryAdvice") WAJIB ditulis dengan sangat detail, komprehensif, mendalam (minimal 4-6 kalimat panjang per bagian), dan memberikan contoh/saran konkret. Anda harus secara eksplisit mengacu pada panduan FIKSI Tahap 2 dan template proyeksi keuangan dari berkas yang diberikan (misalnya menyebutkan strategi Asset-Light secara nyata, rumus HPP/BEP yang presisi, audit konsistensi matematika tabel laba bersih bulanan vs total tahunan, visualisasi 3-Pilar Validasi Pasar: Fact, Insight, Action, dan batas penggunaan AI maksimal 30%). Jangan memberikan jawaban yang singkat, dangkal, atau sekadar template generik.

Evaluasi dilakukan berdasarkan 4 Komponen Utama dengan kriteria sangat spesifik sesuai Panduan FIKSI 2026:

1. Purwarupa Produk/Jasa (MVP) (Bobot 30%):
   - Kategori Produk/Jasa harus jelas bentuk MVP-nya:
     - Produk Fisik (Fashion/Kriya/Kuliner): Harus berupa Low-Fidelity prototype menggunakan bahan murah/upcycled (misal: kain blacu murah untuk pola baju, tanah liat biasa untuk cetakan kriya, atau peralatan dapur rumah sendiri untuk formula kuliner baru) dengan alur proses produksi yang jelas dan terdokumentasi (foto/render).
     - Produk Digital: Harus berupa Interactive Mockup menggunakan aplikasi desain gratisan seperti Figma atau Canva dengan alur navigasi tombol yang bisa diklik. Bukan sekadar coretan kertas kasar atau gambar logo saja.
     - Produk Jasa/Wisata: Harus berupa Service Blueprint yang memperlihatkan alur perjalanan konsumen (consumer journey) dari pemesanan, pelayanan, hingga selesai, dilengkapi brosur penawaran visual yang menarik.
   - Harus mencantumkan rincian biaya pembuatan prototipe awal (Prototype Cost).
   - Harus membuktikan fungsionalitas (apakah produk berfungsi baik).
   - Harus mencantumkan demo interaktif berupa video rekaman layar (screencast) demonstrasi berdurasi 1-2 menit di GDrive dengan akses publik dibagikan. Jika hanya melampirkan slide presentasi PPT statis atau link dikunci = JELEK (DITOLAK).

2. Validasi Pasar (Bobot 25%):
   - Pengujian target pengguna minimal ke 15-30 orang responden objektif. Jika 100% responden adalah teman sekelas atau keluarga sendiri, nilai validasi akan jatuh karena bias tinggi. Profil responden harus mewakili target demografi pasar nyata (BMC).
   - Penyusunan data validasi pasar di proposal WAJIB menggunakan "Struktur Penulisan 3 Pilar" di bawah setiap grafik/diagram:
     1. The Fact (Fakta): Apa angka kuantitatif yang tertera? (Misal: "78% dari 100 responden menyatakan...")
     2. The Insight (Makna): Apa arti angka itu bagi bisnis? Apakah membuktikan keresahan nyata target pasar atau menolak asumsi? (Misal: "Ini membuktikan masalah X bukan sekadar asumsi, melainkan keresahan nyata mayoritas target pasar.")
     3. The Action (Tindakan): Tindakan nyata atau arah balik (pivot) apa yang diambil tim berdasarkan data feedback tersebut? (Misal: "Berdasarkan feedback responden terhadap fitur A yang kurang diminati, kami memutuskan pivot mengembangkan fitur B.")
   - Harus memuat pengujian Willingness to Pay (WTP) dengan pertanyaan krusial: "Berapa harga yang rela Anda bayar untuk solusi ini?" untuk memvalidasi harga jual secara objektif.
   - Tunjukkan poin plus jika ada bukti otentik seperti waiting list, komitmen Pre-Order (PO), atau surat minat kerjasama (Letter of Intent - LoI) dari calon mitra/pembeli besar.
   - Peringatan Batas AI: Evaluasi konten teks proposal. Sesuai aturan FIKSI 2026, kandungan teks buatan AI (ChatGPT/Gemini dll) maksimal hanya boleh 30% dari keseluruhan proposal. Berikan saran jika teks terasa terlalu generik hasil generate AI.

3. Kelayakan Usaha & Finansial (Bobot 25%):
   - Strategi Operasional: Harus menerapkan "Asset-Light Strategy" agar realistis dijalankan anak SMA dengan modal minim. Contoh: sistem bagi hasil sewa dapur/maklon kuliner dengan katering lokal, maklon kosmetik, sistem borongan jahitan dengan penjahit/pengrajin lokal (tim membuat desain & pemasaran, mitra menjahit per unit), atau pemanfaatan ruang komputer/lab sekolah (dengan izin resmi kepala sekolah).
   - Struktur Biaya (Cost Structure) harus jujur dan rinci. Tidak boleh berasumsi Rp0 untuk aset seperti laptop pribadi atau koneksi Wi-Fi. Harus dihitung biaya penyusutan laptop (depreciationCost), biaya internet bulanan tim (internetCost), biaya sewa server/hosting (serverCost) jika berbasis aplikasi, dan biaya pengiriman (transportCost).
   - Rumus Perhitungan Finansial harus diterapkan secara konsisten dan benar:
     - HPP (Harga Pokok Produksi) per unit = (Total Biaya Bahan Baku + Biaya Operasional Sekali Pakai) / Total Unit yang Dihasilkan
     - Margin Kotor per Unit = Harga Jual - HPP
     - BEP (Break-Even Point) Unit = Total Biaya Tetap Alat-Alat di awal (Fixed Cost: mesin, sewa wadah, alat produksi, spanduk) / Margin Kotor per Unit
   - Proyeksi volume produksi/penjualan bulanan harus realistis (tidak melonjak fantastis di awal) dan sebaiknya menunjukkan peningkatan pertumbuhan (growth) yang masuk akal tiap bulannya.
   - PENTING: Lakukan pemeriksaan konsistensi matematika tabel keuangan proposal. Seringkali terjadi kesalahan perhitungan di mana jumlah laba bersih bulanan jika ditambahkan selama 12 bulan tidak cocok dengan total laba bersih tahunan (seperti kesalahan pada contoh data CNTH 1). Pastikan semua hitungan matematis di proposal konsisten.

4. Rencana Implementasi & Tema (Bobot 20%):
   - Jadwal kerja (Gantt Chart timeline) biasanya direncanakan untuk 3-6 bulan ke depan, harus terperinci mingguan/bulanan, berurutan logis (Bulan 1 evaluasi formula produk berdasarkan uji coba, Bulan 2 MoU dengan mitra, Bulan 3 launching & pre-order), membagi tugas secara adil antar anggota tim (maksimal 2 orang SMA), dan memisahkan jam sekolah dengan waktu operasional bisnis.
   - Harus memiliki korelasi kuat dengan Tema FIKSI 2026: Ekonomi Hijau (Green Economy) / Keberlanjutan Lingkungan (minim sampah, Zero Waste, circular economy, kemasan organik/biodegradable), Ekonomi Kreatif dengan Kearifan Lokal (Local Wisdom/budaya daerah), dan Ekonomi Digital.
   - Pemanfaatan Teknologi (Digital Integration): Usaha diakselerasi oleh teknologi digital (adopsi AI, otomatisasi pemasaran, efisiensi data, digital payment) untuk menekan biaya operasional.
   - Mitigasi Risiko: Harus mengidentifikasi risiko teknis dan risiko pasar, serta merancang rencana cadangan (Pivot/Contingency Plan) jika rencana utama gagal.
   - Roadmap HAKI: Harus menjadwalkan pendaftaran Hak Cipta (HAKI) atau merk dagang pada timeline roadmap bulan ke-4 atau ke-5.

Format Skema Keluaran JSON:
{
  "overallScore": number,
  "status": string,
  "mvp": {
    "score": number,
    "status": string,
    "realita": string,
    "ideal": string,
    "checklist": [boolean, boolean, boolean, boolean, boolean] (evaluasi terhadap 5 kriteria MVP sesuai checklist Kriteria Penilaian Juri di kiri screen),
    "bagus": [string] (list poin positif, minimal 2-3),
    "perbaiki": [string] (list poin perbaikan, minimal 2-3),
    "rekomendasi": string
  },
  "market": {
    "score": number,
    "status": string,
    "realita": string,
    "ideal": string,
    "checklist": [boolean, boolean, boolean, boolean, boolean] (evaluasi terhadap 5 kriteria pasar),
    "bagus": [string],
    "perbaiki": [string],
    "rekomendasi": string
  },
  "finance": {
    "score": number,
    "status": string,
    "realita": string,
    "ideal": string,
    "checklist": [boolean, boolean, boolean, boolean, boolean] (evaluasi terhadap 5 kriteria kelayakan),
    "bagus": [string],
    "perbaiki": [string],
    "rekomendasi": string
  },
  "implementation": {
    "score": number,
    "status": string,
    "realita": string,
    "ideal": string,
    "checklist": [boolean, boolean, boolean, boolean, boolean] (evaluasi terhadap 5 kriteria implementasi),
    "bagus": [string],
    "perbaiki": [string],
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
  let score = 42;
  let status = "TOLAK / PERBAIKAN DULU";

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
      score: score > 80 ? 25 : 10,
      status: score > 80 ? "BAGUS" : "KURANG",
      realita: isRiceDetector 
        ? "Sudah melampirkan screenshot desain sirkuit sensor dan mockup antarmuka web monitoring." 
        : isGame 
        ? "Hanya menampilkan gambar coretan karakter di kertas buram dan logo rancangan game tanpa alur."
        : "Menjelaskan konsep ide digital secara tekstual, namun visualisasi purwarupa atau screenshoot sistem belum terlampir secara rapi.",
      ideal: "Menampilkan desain antarmuka (UI/UX Mockup) yang rapi, modern, konsisten dalam warna/tipografi, fungsional, dilengkapi bagan alir (flowchart) navigasi pengguna serta video rekaman layar (screencast) demonstrasi berdurasi 1-2 menit di GDrive.",
      checklist: isRiceDetector ? [true, true, true, false, false] : isGame ? [true, false, false, false, false] : [false, false, false, false, false],
      bagus: [
        "Ide dan nama produk sudah terdefinisi dengan jelas",
        "Deskripsi fungsi produk mudah dipahami pembaca",
        "Target segmen pengguna sudah diidentifikasi"
      ],
      perbaiki: [
        "Tidak ada foto, video, atau visual produk nyata sama sekali",
        "Tidak ada prototipe fisik maupun mockup digital interaktif",
        "Tidak ada data hasil uji coba atau percobaan awal",
        "Tidak ada testimoni atau feedback dari calon pengguna",
        "Tidak ada blueprint atau diagram teknis cara kerja produk"
      ],
      rekomendasi: "Segera dokumentasikan bukti nyata: (1) Buat mockup di Figma/Canva dan lampirkan screenshot-nya. (2) Foto proses pembuatan produk, walau masih dalam tahap awal. (3) Hubungi minimal 5 calon pengguna dan minta feedback tertulis untuk dijadikan lampiran. (4) Buat halaman landing page sederhana dan lampirkan link-nya sebagai bukti validasi awal."
    },
    market: {
      score: score > 85 ? 20 : 11,
      status: score > 85 ? "BAGUS" : "CUKUP",
      realita: isUpcycle
        ? "Telah menguji produk bioplastik ke 25 pengrajin lokal dan melampirkan grafik kepuasan serta hasil survei WTP harga jual."
        : "Menyatakan telah melakukan pengujian produk ke beberapa keluarga terdekat dan teman sekelas tanpa melampirkan grafik umpan balik kuantitatif.",
      ideal: "Pengujian langsung ke minimal 15-30 orang target pengguna riil secara objektif, menyajikan tabel feedback loop (Sebelum vs Sesudah perbaikan konkret), serta menetapkan harga jual rasional berbasis kurva Willingness to Pay (WTP).",
      checklist: isUpcycle ? [true, true, true, true, false] : [false, false, false, false, false],
      bagus: [
        "Identifikasi segmen target pasar sudah ada dan spesifik",
        "Pemahaman masalah pelanggan cukup baik secara naratif",
        "Sudah ada survei awal (walau jumlah responden masih sedikit)"
      ],
      perbaiki: [
        "Survei hanya dilakukan kepada 10 responden (minimum juri: 30)",
        "Tidak ada wawancara mendalam (in-depth interview) yang terdokumentasi",
        "Analisis kompetitor tidak terstruktur — hanya menyebutkan nama tanpa komparasi fitur/harga",
        "Tidak ada bukti pre-order, waiting list, atau minat nyata dari calon pelanggan"
      ],
      rekomendasi: "Perkuat validasi pasar dengan: (1) Perluas survei ke minimal 30 responden target pasar dengan menggunakan Google Form — sertakan link dan data rekapitulasi di lampiran. (2) Lakukan dan rekam wawancara mendalam dengan 3–5 calon pelanggan potensial. (3) Buat tabel perbandingan kompetitor (nama, harga, fitur, kelebihan/kekurangan vs produk Anda). (4) Buka pre-order simbolis atau daftar waiting list untuk membuktikan demand nyata."
    },
    finance: {
      score: score > 80 ? 22 : 13,
      status: score > 80 ? "BAGUS" : "CUKUP",
      realita: lowercase.includes('keuangan') || lowercase.includes('bep')
        ? "Mencantumkan perhitungan modal dasar, tetapi mengabaikan biaya sewa server bulanan, internet tim, dan penyusutan aset laptop kerja."
        : "Menyebutkan biaya operasional Rp0 karena menggunakan laptop pribadi dan wifi sekolah, serta proyeksi keuntungan naik 500% di bulan kedua.",
      ideal: "Menyusun struktur paket harga langganan atau produk yang logis, memaparkan rincian biaya operasional bulanan riil (server, internet, transportasi, penyusutan laptop), dan menghitung Break-Even Point (BEP Unit & BEP Rupiah) dengan grafik proyeksi 6 bulan yang realistis.",
      checklist: [false, false, false, false, false],
      bagus: [
        "Harga jual produk sudah ditetapkan dengan angka yang spesifik",
        "Margin keuntungan per unit positif (revenue > COGS per unit)",
        "Sudah ada perhitungan BEP walaupun masih sederhana",
        "Target produksi bulanan sudah ditentukan"
      ],
      perbaiki: [
        "Biaya tetap (server, listrik, peralatan) tidak dicantumkan — BEP jadi tidak realistis",
        "Proyeksi keuangan hanya untuk 1 bulan, bukan 12 bulan",
        "Tidak ada analisis risiko — tidak ada matriks risiko maupun strategi mitigasi",
        "Tidak ada skenario keuangan alternatif (best-case / worst-case)"
      ],
      rekomendasi: "Perbaiki kelayakan finansial: (1) Inventarisasi SEMUA biaya awal dan operasional, termasuk packaging, listrik, transportasi, dan biaya promosi — masukkan sebagai biaya tetap amortisasi. (2) Buat proyeksi keuangan 12 bulan dengan asumsi pertumbuhan 10%/bulan. (3) Tambahkan matriks risiko dengan minimal 5 risiko utama beserta strategi mitigasinya. (4) Buat dua skenario: optimis (target tercapai 100%) dan pesimis (target hanya 50%)."
    },
    implementation: {
      score: score > 80 ? 18 : 8,
      status: score > 80 ? "BAGUS" : "KURANG",
      realita: isRiceDetector
        ? "Melampirkan Gantt Chart pembagian tugas mingguan dan bukti komunikasi WhatsApp awal dengan koperasi petani gabah lokal."
        : "Menjelaskan rencana promosi klise 'mulut ke mulut dan lewat medsos', tanpa melampirkan pembagian jadwal kerja mingguan (Gantt chart) atau bukti kemitraan riil.",
      ideal: "Gantt Chart mingguan yang memisahkan jam sekolah dengan kerja bisnis, pembagian job desk personal tim, draf poster promosi visual medsos spesifik target, bukti dokumentasi/chat dengan penyuplai bahan baku, dan foto kolaborasi lapangan dengan mitra lokal.",
      checklist: isRiceDetector ? [true, true, true, false, false] : [false, false, false, false, false],
      bagus: [
        "Struktur tim sudah disebutkan beserta nama masing-masing anggota",
        "Kegiatan-kegiatan utama sudah teridentifikasi secara umum",
        "Ada rencana penggunaan media sosial sebagai kanal pemasaran"
      ],
      perbaiki: [
        "Gantt Chart hanya per bulan (tidak per minggu) and tidak ada deliverable per milestone",
        "Strategi digital marketing hanya 'pakai Instagram/TikTok' tanpa rencana konten, target, atau anggaran",
        "Tidak ada rencana kolaborasi dengan pihak eksternal (mitra, sponsor, komunitas)",
        "Tidak ada KPI terukur — tidak ada target follower, konversi, atau revenue per periode",
        "Pembagian tugas tidak mencerminkan kompetensi spesifik anggota"
      ],
      rekomendasi: "Perkuat rencana implementasi: (1) Buat Gantt Chart per minggu dengan sub-task dan deliverable spesifik. (2) Rancang konten kalender media sosial untuk 3 bulan pertama beserta target engagement-nya. (3) Identifikasi dan hubungi minimal 2 calon mitra/kolaborator eksternal. (4) Tentukan KPI SMART (Specific, Measurable, Achievable, Relevant, Time-bound) per bulan."
    },
    sustainability: {
      pillarMatch: isUpcycle 
        ? "Sangat kuat di pilar Ekonomi Hijau (upcycling limbah cangkang udang) dan Ekonomi Digital (sistem e-commerce pasokan)."
        : isRiceDetector
        ? "Linear dengan pilar Ekonomi Digital (sensor IoT) dan Ekonomi Hijau (mengurangi gagal panen padi sehingga menekan food waste)."
        : "Target omzet Rp 900.000/bulan dari 6 unit masih sangat kecil dan tidak menunjukkan skalabilitas. Tidak ada rencana scale-up: bagaimana meningkatkan dari 6 ke 50 unit/bulan? Jelaskan strategi penetrasi pasar terukur dengan target market share realistis dalam 12 bulan.",
      sdgAdvice: isUpcycle
        ? "Mendukung penuh SDG 12 (Konsumsi & Produksi Bertanggung Jawab) dan SDG 14 (Menjaga Ekosistem Laut dengan mengurangi sampah cangkang). Tonjolkan logo SDGs ini di halaman awal proposal."
        : isRiceDetector
        ? "Sesuai dengan SDG 9 (Inovasi Industri) dan SDG 2 (Tanpa Kelaparan / Ketahanan Pangan). Sebutkan secara tertulis kontribusi ini pada Bab Pendahuluan proposal."
        : "Integrasi SDGs masih bersifat deklaratif — hanya menyebutkan 'mendukung SDG 12' tanpa indikator kuantitatif. Juri mengharapkan Theory of Change yang menghubungkan aktivitas bisnis dengan dampak SDGs secara logis: misal '500 kg limbah tekstil tereduksi/kuartal'.",
      riskMitigation: "Proposal tidak membahas risiko sama sekali. Buat matriks risiko sederhana dengan minimal 5 risiko utama dan strategi mitigasinya: risiko produk tidak laku (pivot strategy), bahan baku naik harga (supplier alternatif), kompetitor baru masuk (diferensiasi value proposition)."
    },
    summaryAdvice: isRiceDetector || isUpcycle
      ? `Ide bisnis "${title}" sangat berpotensi. Fokus perbaikan Anda saat ini adalah melengkapi visualisasi bukti sinergi mitra lapangan berupa foto dokumentasi fisik kegiatan, serta merinci roadmap perlindungan HAKI produk.`
      : `FIKSI 2026, dokumen ini masih berada pada level tugas sekolah biasa dan belum memenuhi standar kompetisi nasional. Kondisi ini terlihat dari ketiadaan validasi pasar berbasis data, absennya MVP yang fungsional, dan perencanaan implementasi yang masih sangat umum. Tim perlu bergeser dari sekadar 'berinovasi' menjadi 'membuktikan kelayakan bisnis dengan data nyata'.`,
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
