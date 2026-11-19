import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Permanent_Marker } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import Flock from "@/components/sketch/Flock";
import SpaceSky from "@/components/sketch/SpaceSky";
import ThemeLab from "@/components/sketch/ThemeLab";
import { SOCIAL_LINKS } from "@/lib/social";

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
    default: "Sheiphan Joseph - Software Engineer, AI/ML",
    template: "%s | Sheiphan Joseph",
  },
  description: "Sheiphan Joseph is a software engineer in Bengaluru who builds the backend side of AI: MCP servers, LLM agents and ML services running in production, with the auth, access control, testing and infrastructure they need. Also builds and trains models from scratch.",
  keywords: ["Sheiphan Joseph", "Software Engineer", "Backend Engineer", "AI Engineer", "MCP", "Model Context Protocol", "LLM Agents", "Python", "Kubernetes", "AWS", "Terraform", "RAG", "PyTorch", "Mixture of Experts", "Machine Learning"],
  authors: [{ name: "Sheiphan Joseph" }],
  creator: "Sheiphan Joseph",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yoursite.com",
    siteName: "Sheiphan Joseph",
    title: "Sheiphan Joseph - Software Engineer, AI/ML",
    description: "Software engineer building MCP servers, LLM agents and ML services that run in production.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sheiphan Joseph - Software Engineer, AI/ML",
    description: "Software engineer building MCP servers, LLM agents and ML services that run in production.",
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
    jobTitle: "Software Engineer - AI/ML",
    worksFor: { "@type": "Organization", name: "Flexera" },
    description: "Software engineer who builds the backend side of AI: MCP servers, LLM agents and ML services running in production.",
    url: "https://yoursite.com",
    email: "sheiphanshaijan@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bengaluru",
      addressCountry: "IN"
    },
    sameAs: SOCIAL_LINKS.map((link) => link.href),
    knowsAbout: [
      "Backend Engineering",
      "Model Context Protocol (MCP)",
      "LLM Agents",
      "Python",
      "Kubernetes",
      "Terraform",
      "OAuth and JWT",
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
        <SpaceSky />
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
