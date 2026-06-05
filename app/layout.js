import "./globals.css";

export const metadata = {
  title: "FIKSI IdeaHub 2026 2.0 - AI Business Proposal Coach",
  description: "Evaluasi proposal bisnis FIKSI 2026 secara detail dan instan menggunakan AI. Dapatkan skor, rekomendasi MVP, validasi pasar, BEP, SDGs, dan mitigasi risiko sesuai panduan model AI.",
  keywords: ["FIKSI 2026", "Proposal Bisnis", "Evaluator AI", "Kewirausahaan SMA", "Model AI", "Ekonomi Hijau"],
  authors: [{ name: "Antigravity Dev Expert" }],
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>{children}</body>
    </html>
  );
}
