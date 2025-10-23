export default function Styleguide() {
  return (
    <div className="sg">
      <h1>Design System</h1>
      <section>
        <h2>Buttons</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button className="btn btn--primary">Primary</button>
          <button className="btn">Default</button>
          <button className="btn btn--ghost">Ghost</button>
        </div>
      </section>
      <section>
        <h2>Form</h2>
        <div className="card" style={{ maxWidth: 420 }}>
          <label>
            <span>Email</span>
            <input placeholder="you@business.com" />
          </label>
          <label>
            <span>Password</span>
            <input type="password" placeholder="••••••••" />
          </label>
          <div className="alert">A neutral alert</div>
          <div className="alert alert--danger">An error alert</div>
        </div>
      </section>
      <section>
        <h2>Cards</h2>
        <div className="card">
          This is a card using premium elevation and borders.
        </div>
      </section>
    </div>
  );
}
