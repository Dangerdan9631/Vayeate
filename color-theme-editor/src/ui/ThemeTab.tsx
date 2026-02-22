import type { GeneratedOutputSummary, GeneratedThemePair, PreviewSample } from "../domain/types";
import { PreviewPane } from "./preview/PreviewPane";
import { previewSamples } from "./preview/samples";

export interface ThemeTabProps {
  generated: GeneratedThemePair;
  selectedSampleIds: string[];
  showDark: boolean;
  showLight: boolean;
  outputSummary: GeneratedOutputSummary | null;
  apiBusy: boolean;
  apiMessage: string;
  apiError: string;
  setShowDark: (show: boolean) => void;
  setShowLight: (show: boolean) => void;
  toggleSample: (sampleId: string) => void;
  handlePreviewGenerateSummary: () => Promise<void>;
  handleGenerateToThemes: () => Promise<void>;
}

export function ThemeTab({
  generated,
  selectedSampleIds,
  showDark,
  showLight,
  outputSummary,
  apiBusy,
  apiMessage,
  apiError,
  setShowDark,
  setShowLight,
  toggleSample,
  handlePreviewGenerateSummary,
  handleGenerateToThemes,
}: ThemeTabProps): JSX.Element {
  const selectedSamples = previewSamples.filter((sample) => selectedSampleIds.includes(sample.id));

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Theme Generation</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <button type="button" onClick={() => void handlePreviewGenerateSummary()} disabled={apiBusy}>
            Refresh Output Summary
          </button>
          <button type="button" onClick={() => void handleGenerateToThemes()} disabled={apiBusy}>
            Generate to themes
          </button>
        </div>
        {apiError ? <p style={{ margin: 0, color: "#b00020", whiteSpace: "pre-wrap" }}>{apiError}</p> : null}
        {apiMessage ? <p style={{ margin: 0, color: "#0b5f2a", whiteSpace: "pre-wrap" }}>{apiMessage}</p> : null}
      </article>

      <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Output Summary</h2>
        {outputSummary ? (
          <div style={{ display: "grid", gap: 8 }}>
            {[outputSummary.dark, outputSummary.light].map((item) => (
              <div key={item.fileName} style={{ border: "1px solid #e1e1e1", borderRadius: 6, padding: 8 }}>
                <div style={{ fontWeight: 600 }}>{item.fileName}</div>
                <div style={{ fontSize: 12 }}>Path: {item.targetPath}</div>
                <div style={{ fontSize: 12 }}>Exists: {item.exists ? "yes" : "no"}</div>
                <div style={{ fontSize: 12 }}>
                  Bytes: {item.beforeBytes} → {item.afterBytes}
                </div>
                <div style={{ fontSize: 12, color: item.changed ? "#9a4f00" : "#0b5f2a" }}>
                  {item.changed ? "Will update file" : "No byte-level change"}
                </div>
              </div>
            ))}
            <div style={{ fontSize: 12 }}>
              Colors (dark/light): {outputSummary.colorCount.dark}/{outputSummary.colorCount.light}
            </div>
            <div style={{ fontSize: 12 }}>
              Token rules (dark/light): {outputSummary.tokenCount.dark}/{outputSummary.tokenCount.light}
            </div>
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
            Run <strong>Refresh Output Summary</strong> to inspect existing vs generated output before writing files.
          </p>
        )}
      </article>

      <article style={{ border: "1px solid #d0d0d0", borderRadius: 8, padding: 12 }}>
        <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Preview Controls</h2>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
          <label>
            <input type="checkbox" checked={showDark} onChange={(event) => setShowDark(event.target.checked)} /> Dark
          </label>
          <label>
            <input type="checkbox" checked={showLight} onChange={(event) => setShowLight(event.target.checked)} />{" "}
            Light
          </label>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {previewSamples.map((sample) => (
            <label key={sample.id}>
              <input
                type="checkbox"
                checked={selectedSampleIds.includes(sample.id)}
                onChange={() => toggleSample(sample.id)}
              />{" "}
              {sample.label}
            </label>
          ))}
        </div>
      </article>

      <section style={{ display: "grid", gap: 10, gridTemplateColumns: showDark && showLight ? "1fr 1fr" : "1fr" }}>
        {showDark ? <PreviewPane title="Dark Preview" theme={generated.dark} samples={selectedSamples} /> : null}
        {showLight ? <PreviewPane title="Light Preview" theme={generated.light} samples={selectedSamples} /> : null}
      </section>
    </div>
  );
}
