import "./loading-screen.scss";

export default function LoadingScreen({ message = "Preparing your workspace" }) {
  return (
    <main className="loading-screen" aria-live="polite" aria-busy="true">
      <div className="loading-orbit" aria-hidden="true">
        <span className="loading-orbit-dot" />
      </div>
      <div className="loading-copy">
        <p className="loading-kicker">AI Interviewer</p>
        <h1>{message}</h1>
        <div className="loading-lines" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>
    </main>
  );
}
