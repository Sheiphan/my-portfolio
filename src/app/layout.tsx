import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Permanent_Marker } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Flock from "@/components/sketch/Flock";
import ThemeLab from "@/components/sketch/ThemeLab";

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const marker = Permanent_Marker({
  variable: "--font-permanent-marker",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
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
  },
  twitter: {
    card: "summary_large_image",
    title: "Sheiphan Joseph - AI Engineer",
    description: "AI Engineer specializing in agentic AI, foundation models, and MLOps",
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

// Runs before first paint so the page never flashes the wrong theme.
const themeScript = `try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t;if(localStorage.getItem('flock')==='off'){document.documentElement.dataset.flock='off'}}catch(e){}`;

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
    <html lang="en" className={`${atkinson.variable} ${marker.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <Flock />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <NavBar />
        <main id="main-content" className="mx-auto w-full max-w-[1440px] flex-1 px-4 sm:px-8 lg:px-14">
          {children}
        </main>
        <Footer />
        {process.env.NODE_ENV !== "production" && <ThemeLab />}
      </body>
    </html>
  );
}
