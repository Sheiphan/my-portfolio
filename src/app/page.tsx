"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] px-4 sm:px-6">
      <section className="text-center max-w-3xl w-full">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-gray-100 leading-tight"
        >
          Hi, I&apos;m Sheiphan Joseph
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed"
        >
          Innovative AI Engineer specializing in agentic AI and foundation models like GPT-4o, Gemini, and Deepseek.
          I build multimodal, autonomous AI systems and orchestrate complex multi-agent workflows with LangChain and LangGraph.
          Passionate about leveraging AI agents for autonomous problem-solving, self-healing pipelines, and scalable production-ready solutions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link href="/projects">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:scale-105 focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-neutral-900 text-base sm:text-lg"
              aria-label="Navigate to projects page"
            >
              View My Projects
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
