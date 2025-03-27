import type { Metadata } from "next";
import "./globals.css";

export const metadata = {
  title: "Kamus Bahasa Rejang",
  description: "Terjemahkan bahaso daerah kito!",

  // SEO Keywords
  keywords: [
    "Rejangpedia",
    "Budaya Rejang",
    "Sejarah Rejang",
    "Warisan budaya Rejang",
    "Ensiklopedia Rejang",
    "Bahasa Rejang",
    "Artikel sejarah Indonesia",
    "Rejang Bengkulu",
    "Kamus",
    "Kamus Bahasa Rejang"
  ],

  // Open Graph (OG) Meta Tags for better social media previews
  openGraph: {
    title: "Kamus Bahasa Rejang",
    type: "website",
    url: "https://kamusrejang.vercel.app", // Update if this changes
    description: "Terjemahkan bahaso daerah kito!",
    images: [
      {
        url: "https://cdn.glitch.global/453b0d20-b8fc-4202-841d-a49bccee5c1e/a.png?v=1712387524665", // Featured image for OG (should be at least 1200x630 for best results)
        alt: "Kamus Bahasa Rejang Logo",
      },
    ],
  },

  // Twitter Card meta tags for optimized sharing on Twitter
  twitter: {
    card: "summary_large_image",
    site: "@kamusbahasarejang", // Optional: Twitter handle (if available)
    title: "Kamus Bahasa Rejang",
    description: "Terjemahkan bahaso daerah kito!",
    images: ["https://cdn.glitch.global/453b0d20-b8fc-4202-841d-a49bccee5c1e/a.png?v=1712387524665"],
  },

  // Optional - favicon/logo setup
  icons: {
    icon: "https://cdn.glitch.global/453b0d20-b8fc-4202-841d-a49bccee5c1e/a.png?v=1712387524665",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
