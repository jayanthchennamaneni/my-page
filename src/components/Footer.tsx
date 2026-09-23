const LAST_UPDATED = "2026-09-24";
const REPO_URL = "https://github.com/jayanthchennamaneni";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p className="footer-links">
          <a href="mailto:jayanthchennamaneni@gmail.com">Email</a>
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/jayanth-chennamaneni-28b874200" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </p>
        <p className="footer-meta">
          © {new Date().getFullYear()} Jayanth Chennamaneni · Updated{" "}
          {LAST_UPDATED}
        </p>
      </div>
    </footer>
  );
}