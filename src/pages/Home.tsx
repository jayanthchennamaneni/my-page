import { Link } from "react-router-dom";

const sections = [
  {
    title: "Thoughts",
    description:
      "Ideas and notes — the section I update most.",
    path: "/thoughts",
    featured: true,
  },
  {
    title: "Artificial Intelligence",
    description:
      "LLMs, agents, RAG, voice AI, and other experiments.",
    path: "/ai",
  },
  {
    title: "Algorithms",
    description:
      "Data structures, algorithms, problem solving, and implementations.",
    path: "/algorithms",
  },
];

export default function Home() {
  return (
    <main className="home container">
      <section className="hero">
        <p className="eyebrow">ML ENGINEER</p>

        <h1>Jayanth Chennamaneni</h1>

        <p className="intro">
          I experiment with machine learning systems.
        </p>
      </section>

      <section className="sections">
        {sections.map((section) => (
          <Link
            key={section.path}
            to={section.path}
            className={
              section.featured ? "section-card featured" : "section-card"
            }
          >
            <div>
              <h2>{section.title}</h2>
              <p>{section.description}</p>
            </div>

            <span className="arrow">→</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
