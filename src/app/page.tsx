import Link from "next/link";
import HeroAgent from "@/components/sketch/HeroAgent";
import ScrollDoodle from "@/components/sketch/ScrollDoodle";
import DrawOnView from "@/components/sketch/DrawOnView";
import ProjectCard from "@/components/ProjectCard";
import UpdateItem from "@/components/UpdateItem";
import { getAllProjects, getAllUpdates } from "@/lib/content";

export default function Home() {
  const projects = getAllProjects().slice(0, 2);
  const updates = getAllUpdates().slice(0, 2);

  return (
    <>
    <section className="hero" aria-labelledby="hero-title">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,38rem)] xl:grid-cols-[minmax(0,1fr)_minmax(0,42rem)] xl:gap-12">
        <div className="draw-load">
          <h1 id="hero-title">
            <span className="hero-hello">Hi, I&apos;m</span>
            <span className="hero-name mt-2">
              <span className="highlight" style={{ "--swipe-delay": "350ms" } as React.CSSProperties}>
                <span data-flock-text="">Sheiphan</span>
              </span>
            </span>
            <span className="hero-name">
              <span data-flock-text="">Joseph</span>
            </span>
          </h1>

          <p className="hero-intro mt-8">
            Innovative AI Engineer specializing in agentic AI and foundation models like GPT-4o, Gemini, and Deepseek.
            I build multimodal, autonomous AI systems and orchestrate complex multi-agent workflows with LangChain and LangGraph.
            Passionate about leveraging AI agents for autonomous problem-solving, self-healing pipelines, and scalable production-ready solutions.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-5">
            <a href="mailto:sheiphanshaijan@gmail.com" className="btn-sticker" data-mascot="grin">
              Email me
            </a>
            <Link href="/projects" className="btn-outline">
              View My Projects
            </Link>
          </div>
        </div>

        <HeroAgent />
      </div>
    </section>

    <ScrollDoodle className="ml-[8%] -mt-4" />

    <section aria-labelledby="home-projects" className="mt-6">
      <DrawOnView className="section-head">
        <h2 id="home-projects" className="section-title">
          <span className="highlight">Projects</span>
        </h2>
        <Link href="/projects" className="text-link">
          View My Projects
        </Link>
      </DrawOnView>
      <div className="mt-10 grid gap-x-12 gap-y-20 md:grid-cols-2">
        {projects.map((project, index) => (
          <ProjectCard key={project.slug} project={project} index={index} headingLevel="h3" />
        ))}
      </div>
    </section>

    <section aria-labelledby="home-updates" className="mt-28 lg:mt-36">
      <DrawOnView className="section-head">
        <h2 id="home-updates" className="section-title">
          <span className="highlight">Updates</span>
        </h2>
        <Link href="/updates" className="text-link">
          Read all updates
        </Link>
      </DrawOnView>
      <div className="mt-6">
        {updates.map((update) => (
          <UpdateItem key={update.slug} update={update} headingLevel="h3" />
        ))}
      </div>
    </section>
    </>
  );
}
