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
    default: "Sheiphan Joseph - AI Engineer & MLOps Specialist",
    template: "%s | Sheiphan Joseph",
  },
  description: "Portfolio of Sheiphan Joseph - AI Engineer specializing in agentic AI, foundation models (GPT-4o, Gemini, Deepseek), LangChain, LangGraph, and MLOps. Expert in building autonomous multi-agent systems and production ML pipelines.",
  keywords: ["Sheiphan Joseph", "AI Engineer", "MLOps", "Data Scientist", "Agentic AI", "LangChain", "LangGraph", "GPT-4", "Foundation Models", "RAG", "Multi-Agent Systems", "AWS", "Machine Learning", "Deep Learning", "NLP", "Computer Vision"],
  authors: [{ name: "Sheiphan Joseph" }],
  creator: "Sheiphan Joseph",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yoursite.com",
    siteName: "Sheiphan Joseph - AI Engineer",
    title: "Sheiphan Joseph - AI Engineer & MLOps Specialist",
    description: "Portfolio showcasing AI projects and expertise in agentic AI, foundation models, and production ML systems by Sheiphan Joseph",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sheiphan Joseph - AI Engineer Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sheiphan Joseph - AI Engineer",
    description: "AI Engineer specializing in agentic AI, foundation models, and MLOps",
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
    name: "Sheiphan Joseph",
    jobTitle: "Sr. AI Engineer | MLOps | Data Scientist",
    description: "Innovative AI Engineer at the forefront of foundation model research, specializing in agentic AI and next-generation LLMs. Expert in building multimodal, autonomous AI systems and orchestrating complex multi-agent workflows.",
    url: "https://yoursite.com",
    email: "sheiphanshaijan@gmail.com",
    telephone: "+919370896602",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bengaluru",
      addressCountry: "IN"
    },
    sameAs: [
      "https://github.com/yourusername",
      "https://linkedin.com/in/yourusername",
    ],
    knowsAbout: [
      "Agentic AI",
      "Foundation Models",
      "GPT-4",
      "Gemini",
      "Deepseek",
      "LangChain",
      "LangGraph",
      "Multi-Agent Systems",
      "RAG",
      "MLOps",
      "AWS",
      "Machine Learning",
      "Deep Learning",
      "Natural Language Processing",
      "Computer Vision",
      "PyTorch",
      "TensorFlow",
      "Fine-Tuning",
      "Vector Databases",
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
