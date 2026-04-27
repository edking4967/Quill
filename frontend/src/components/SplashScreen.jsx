export default function SplashScreen({ onEnter }) {
  return (
    <div className="splash-page">
      <div className="splash-inner">

        <div className="splash-hero">
          <h1 className="splash-title">Bill</h1>
          <p className="splash-tagline">Your writing's missing progress bar</p>
        </div>

        <div className="splash-body">
          <p className="splash-copy">[your copy here]</p>
        </div>

        <div className="splash-ctas">
          <button className="btn-primary" onClick={() => onEnter("auth")}>
            Sign In / Create Account
          </button>
          <button className="btn-primary" onClick={() => onEnter("demo")}>
            Try the demo
          </button>
        </div>

      </div>
    </div>
  );
}
