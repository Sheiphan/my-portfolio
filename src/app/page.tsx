import Link from "next/link";
import HeroAgent from "@/components/sketch/HeroAgent";
import ScrollDoodle from "@/components/sketch/ScrollDoodle";
import DrawOnView from "@/components/sketch/DrawOnView";
import ProjectCard from "@/components/ProjectCard";
import ExperienceTimeline from "@/components/ExperienceTimeline";
import SocialLinks from "@/components/SocialLinks";
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
            I&apos;m a software engineer who mostly lives on the backend side of AI. At Flexera I build and run the MCP
            servers and agent services that let LLMs work with real cloud-cost data, plus the auth, tests and Kubernetes
            plumbing nobody sees but everything needs. I don&apos;t just wire models up, though. I like building them too:
            I&apos;ve fine-tuned Qwen for work, and for fun I wrote a mixture-of-experts LLM from scratch, trained it on an
            H100 and kept running ablations until I knew why things worked (or didn&apos;t). Before Flexera I shipped RAG
            systems and research agents.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Link href="/projects" className="btn-sticker" data-mascot="grin">
              View My Projects
            </Link>
            <Link href="/experience" className="btn-outline">
              My Experience
            </Link>
          </div>
          <SocialLinks variant="icons" className="mt-6" />
        </div>

        <HeroAgent />
      </div>
    </section>

    <ScrollDoodle className="ml-[8%] -mt-4" />

    <section aria-labelledby="home-experience" className="mt-6">
      <DrawOnView className="section-head">
        <h2 id="home-experience" className="section-title">
          <span className="highlight">Experience</span>
        </h2>
        <Link href="/experience" className="text-link">
          See what I built at each role
        </Link>
      </DrawOnView>
      <div className="mt-6">
        <ExperienceTimeline variant="compact" headingLevel="h3" />
      </div>
    </section>

    <section aria-labelledby="home-projects" className="mt-24 lg:mt-32">
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
