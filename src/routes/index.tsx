import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Download, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { PortfolioButton } from "@/components/portfolio-button";
import portrait from "@/assets/tariq-portrait.jpg";
import resumeAsset from "@/assets/TARIQ_S_Resume.pdf.asset.json";
import { caseSections, certifications, experiences, futureProjects, projects, skills } from "@/lib/portfolio-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tariq Al-Zubaidi | HR & Administrative Professional" },
      { name: "description", content: "Tariq Al-Zubaidi — HR & Administrative Professional specializing in HR operations, GOSI, Qiwa, Oracle HRIS, onboarding, compliance, and data-driven HR reporting." },
      { property: "og:title", content: "Tariq Al-Zubaidi | HR & Administrative Professional" },
      { property: "og:description", content: "HR operations, GOSI, Qiwa and Oracle HRIS experience in Saudi Arabia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700;800&family=Instrument+Sans:wght@400;500;600;700&display=swap" },
    ],
  }),
  component: Portfolio,
});

const navigation = ["home", "about", "experience", "education", "projects", "skills", "certifications", "contact"];

function SectionTitle({ title, lead }: { title: string; lead?: string }) {
  return <div className="section-heading reveal"><h2>{title}</h2>{lead && <p>{lead}</p>}</div>;
}

function Initials({ children, large = false }: { children: string; large?: boolean }) {
  return <span className={`initials ${large ? "initials-large" : ""}`}>{children}</span>;
}

function Portfolio() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [detail, setDetail] = useState<{ type: "project" | "experience"; slug: string } | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);

  useEffect(() => {
    if (detail) return;
    const items = document.querySelectorAll<HTMLElement>(".reveal");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px" });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [detail]);

  const goTo = (id: string) => {
    setDetail(null);
    setMenuOpen(false);
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  if (detail) {
    const experience = detail.type === "experience" ? experiences.find((item) => item.slug === detail.slug) : undefined;
    const project = detail.type === "project" ? projects.find((item) => item.slug === detail.slug) : undefined;
    return (
      <main className="detail-page">
        <div className="wrap detail-wrap">
          <PortfolioButton onClick={() => { setDetail(null); window.scrollTo({ top: 0 }); }}><ArrowLeft size={17} /> Back to {detail.type === "project" ? "projects" : "experience"}</PortfolioButton>
          {experience && <>
            <div className="detail-intro"><Initials large>{experience.initials}</Initials><div><p className="eyebrow">{experience.company}</p><h1>{experience.role}</h1><p>{experience.meta}</p></div></div>
            <div className="tag-row">{experience.tools.map((tool) => <span className="tag" key={tool}>{tool}</span>)}</div>
            <div className="case-grid"><article><h3>Overview</h3><p>{experience.overview}</p></article><article><h3>Responsibilities & Achievements</h3><ul>{experience.highlights.map((item) => <li key={item}>{item}</li>)}</ul></article></div>
          </>}
          {project && <>
            <p className="eyebrow">{project.category}</p><h1>{project.title}</h1>
            <div className="flow">{["Problem", "Analysis", "Insight", "Recommendation"].map((step) => <span key={step}>{step}</span>)}</div>
            <div className="case-grid">{caseSections.map(([title, copy]) => <article key={title}><h3>{title}</h3>{copy === "RESULT" ? <div className="result-placeholder">Dashboard or result preview will be added here.</div> : <p>{copy}</p>}</article>)}</div>
          </>}
        </div>
      </main>
    );
  }

  return <>
    <div className="progress-line" />
    <header className="site-header">
      <div className="nav-shell">
        <a href="#home" className="brand" onClick={(e) => { e.preventDefault(); goTo("home"); }}>Tariq Al-Zubaidi</a>
        <nav className={menuOpen ? "nav-links open" : "nav-links"} aria-label="Main navigation">
          {navigation.map((id) => <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); goTo(id); }}>{id[0].toUpperCase() + id.slice(1)}</a>)}
          <a className="nav-download" href={resumeAsset.url} download="Tariq-Al-Zubaidi-CV.pdf"><Download size={15} /> Download CV</a>
        </nav>
        <div className="nav-actions">
          <PortfolioButton compact aria-label={dark ? "Use light theme" : "Use dark theme"} onClick={() => setDark((value) => !value)}>{dark ? <Sun size={17} /> : <Moon size={17} />}</PortfolioButton>
          <PortfolioButton compact className="menu-button" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((value) => !value)}>{menuOpen ? <X size={18} /> : <Menu size={18} />}</PortfolioButton>
        </div>
      </div>
    </header>

    <main>
      <section id="home" className="hero-section">
        <div className="wrap hero-inner">
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="availability"><i />Open to HR and administration roles</span>
              <p className="hero-role">HR &amp; Administrative Professional</p>
              <p className="hero-summary">HR operations and administration experience in Saudi Arabia, now building Excel and Power BI reporting skills to support data-driven HR decisions.</p>
              <div className="hero-actions"><PortfolioButton tone="solid" onClick={() => goTo("projects")}>View Projects <ArrowRight size={17} /></PortfolioButton><a className="portfolio-link-button" href={resumeAsset.url} download="Tariq-Al-Zubaidi-CV.pdf"><Download size={17} /> Download CV</a></div>
            </div>
            <div className="portrait-wrap"><img src={portrait} alt="Tariq Al-Zubaidi" /></div>
          </div>
          <h1><span>Tariq</span> <span>Al-Zubaidi</span></h1>
          <div className="hero-stats"><div><b>100+</b><span>GOSI updates managed daily</span></div><div><b>250+</b><span>Qiwa contracts processed</span></div><div><b>50+</b><span>employees supported in onboarding</span></div></div>
        </div>
        <div className="marquee"><div>{[...Array(2)].flatMap(() => ["HR Operations", "HR Administration", "Excel & Data Analysis", "Power BI & Reporting"]).map((item, i) => <span key={`${item}-${i}`}>{item}</span>)}</div></div>
      </section>

      <section id="about" className="content-section"><div className="wrap split-layout"><SectionTitle title="About" /><div className="reveal reveal-right"><p className="large-copy">Detail-oriented professional with experience in HR operations, passenger services, and marketing coordination.</p><p className="large-copy muted-copy">Skilled in GOSI, Qiwa, and Oracle HRIS, with a focus on compliance and accurate employee data. Experienced in high-volume environments that need strong communication, problem-solving, and customer service, and able to coordinate across teams in fast-paced organizations.</p><div className="facts"><div><small>Education</small><b>Bachelor’s in Communication and Media (Marketing Communication)</b><span>King Abdulaziz University · 2020–2024 · GPA 4.48 / 5.00</span></div><div><small>Direction</small><b>HR, administration and data-driven roles</b></div><div><small>Languages</small><b>Arabic, English</b></div><div><small>Location</small><b>Jeddah, Saudi Arabia</b></div></div></div></div></section>

      <section id="experience" className="content-section section-alt"><div className="wrap split-layout"><SectionTitle title="Experience" lead="Select any role to open its own page." /><div className="timeline">{experiences.map((item, index) => <article className={`experience-card reveal ${index ? "experience-compact" : "experience-main"}`} key={item.slug}><div className="experience-head"><Initials>{item.initials}</Initials><div><h3>{item.role}</h3><p>{item.company} · {item.meta.split(" · ").at(-1)}</p></div></div>{index === 0 ? <ul>{item.highlights.slice(0, 4).map((point) => <li key={point}>{point}</li>)}</ul> : <p>{item.summary}</p>}<button className="text-link" onClick={() => { setDetail({ type: "experience", slug: item.slug }); window.scrollTo({ top: 0 }); }}>View full page <ArrowRight size={15} /></button></article>)}</div></div></section>

      <section id="education" className="content-section education-section"><div className="wrap split-layout"><SectionTitle title="Education" /><article className="education-card reveal reveal-right"><Initials large>KAU</Initials><div><p className="eyebrow">2020 – 2024 · Jeddah, Saudi Arabia</p><h3>Bachelor’s degree in Communication and Media</h3><p className="education-major">Marketing Communication</p><p>King Abdulaziz University</p><strong>GPA 4.48 / 5.00</strong></div></article></div></section>

      <section id="projects" className="content-section"><div className="wrap"><SectionTitle title="Featured Projects" lead="Case studies that move from business problem to analysis, findings, and recommendations." /><div className="card-grid">{projects.map((project) => <article className="project-card reveal" key={project.slug}><div className="project-preview"><div className="browser-dots"><i /><i /><i /></div><span>Preview coming soon</span></div><div className="card-body"><p className="eyebrow">{project.category}</p><h3>{project.title}</h3><div className="tag-row">{project.tools.map((tool) => <span className="tag" key={tool}>{tool}</span>)}</div><p>{project.description}</p><PortfolioButton tone="solid" compact onClick={() => { setDetail({ type: "project", slug: project.slug }); window.scrollTo({ top: 0 }); }}>View Case Study</PortfolioButton></div></article>)}</div></div></section>

      <section id="future" className="content-section dark-section"><div className="wrap"><SectionTitle title="Future Projects" lead="Planned, not yet completed." /><div className="card-grid">{futureProjects.map((project) => <article className="future-card reveal" key={project.title}><span className="soon">Coming Soon</span><h3>{project.title}</h3><p>{project.tools}</p></article>)}</div></div></section>

      <section id="skills" className="content-section"><div className="wrap split-layout"><SectionTitle title="Skills" /><div className="skill-list">{Object.entries(skills).map(([group, items]) => <article className="skill-box reveal reveal-right" key={group}><h3>{group}</h3><div className="tag-row">{items.map((item) => <span className="tag" key={item}>{item}</span>)}</div></article>)}</div></div></section>

      <section id="certifications" className="content-section section-alt"><div className="wrap"><SectionTitle title="Certifications" lead="Courses and certificates in HR, digital marketing, and professional skills." /><div className="card-grid">{certifications.map(([title, organization, initials]) => <article className="certificate-card reveal" key={title}><div className="certificate-mark"><Initials large>{initials}</Initials></div><div><h3>{title}</h3><p>{organization}</p></div></article>)}</div></div></section>

      <section id="resume" className="content-section resume-section"><div className="wrap"><div className="resume-band reveal"><div><h2>Resume</h2><p>Download my CV for the full summary of experience, education, and skills.</p></div><a className="resume-download" href={resumeAsset.url} download="Tariq-Al-Zubaidi-CV.pdf"><Download size={18} /> Download CV</a></div></div></section>

      <section id="contact" className="content-section"><div className="wrap contact-grid"><div className="reveal"><h2>Let’s Connect</h2><p className="section-lead">Open to HR, administration, and data-driven HR opportunities.</p><div className="contact-list"><div><small>Email</small><a href="mailto:ta.alzubaidi@gmail.com">ta.alzubaidi@gmail.com</a></div><div><small>LinkedIn</small><a href="https://www.linkedin.com/in/tariq-al-zubaidi-985b53245" target="_blank" rel="noreferrer">linkedin.com/in/tariq-al-zubaidi-985b53245</a></div><div><small>Phone</small><a href="tel:+966545505709">(+966) 545505709</a></div><div><small>Location</small><span>Jeddah, Saudi Arabia</span></div></div></div><form className="contact-form reveal reveal-right" action="mailto:ta.alzubaidi@gmail.com" method="post" encType="text/plain"><label>Name<input name="name" required autoComplete="name" /></label><label>Email<input name="email" type="email" required autoComplete="email" /></label><label>Message<textarea name="message" required /></label><PortfolioButton tone="solid" type="submit">Send message</PortfolioButton></form></div></section>
    </main>
    <footer><div className="wrap footer-inner"><div><b>Tariq Al-Zubaidi</b><br />HR &amp; Administrative Professional<br />© {new Date().getFullYear()} Tariq Al-Zubaidi. All rights reserved.</div><nav>{navigation.slice(0, -1).map((id) => <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); goTo(id); }}>{id[0].toUpperCase() + id.slice(1)}</a>)}</nav></div></footer>
  </>;
}