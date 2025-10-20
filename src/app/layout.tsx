import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://yoursite.com'),
  title: {
    default: "AI Engineer Portfolio",
    template: "%s | AI Engineer Portfolio",
  },
  description: "Portfolio showcasing AI and machine learning projects by an experienced AI Engineer specializing in NLP, computer vision, and deep learning",
  keywords: ["AI", "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Portfolio", "AI Engineer", "Artificial Intelligence", "Neural Networks"],
  authors: [{ name: "AI Engineer" }],
  creator: "AI Engineer",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yoursite.com",
    siteName: "AI Engineer Portfolio",
    title: "AI Engineer Portfolio",
    description: "Portfolio showcasing AI and machine learning projects by an experienced AI Engineer specializing in NLP, computer vision, and deep learning",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI Engineer Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Engineer Portfolio",
    description: "Portfolio showcasing AI and machine learning projects by an experienced AI Engineer",
    images: ["/images/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD structured data for Person schema
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "AI Engineer",
    jobTitle: "AI Engineer",
    description: "Experienced AI Engineer specializing in machine learning, natural language processing, and computer vision",
    url: "https://yoursite.com",
    sameAs: [
      "https://github.com/yourusername",
      "https://linkedin.com/in/yourusername",
      "https://twitter.com/yourusername",
    ],
    knowsAbout: [
      "Artificial Intelligence",
      "Machine Learning",
      "Deep Learning",
      "Natural Language Processing",
      "Computer Vision",
      "Neural Networks",
      "Python",
      "TensorFlow",
      "PyTorch",
    ],
  };

  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-neutral-900 text-gray-200 min-h-screen flex flex-col`}
      >
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-500 focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-neutral-900"
        >
          Skip to main content
        </a>
        <NavBar />
        <main id="main-content" className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
