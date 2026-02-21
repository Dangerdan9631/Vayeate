export function App(): JSX.Element {
  return (
    <main style={{ fontFamily: "Segoe UI, sans-serif", padding: 24, lineHeight: 1.4 }}>
      <h1 style={{ marginTop: 0 }}>Vayeate Theme Studio</h1>
      <p>Phase 1 foundation is active: schemas, contrast policy split, palette utilities, and deterministic export pipeline.</p>
      <ul>
        <li>Standalone runtime under <strong>color-theme-editor</strong>.</li>
        <li>Root extension packaging and launch remain unchanged.</li>
        <li>Generated outputs target <strong>../themes</strong> only.</li>
      </ul>
    </main>
  );
}