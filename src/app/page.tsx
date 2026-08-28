const UI_FONT = "'Segoe UI Variable','Segoe UI Variable Display','Segoe UI',system-ui,sans-serif";
const MONO_FONT = "Consolas,'Cascadia Mono','Segoe UI Mono',Menlo,monospace";

const GUTTER_LINES = Array.from({ length: 26 }, (_, i) => String(i + 1).padStart(2, "0"));

function Chevron() {
  return (
    <svg width="5" height="10" viewBox="0 0 5 10" fill="none" style={{ display: "block", flex: "none" }}>
      <path d="M 0.8 0.8 L 4.2 5 L 0.8 9.2" stroke="rgba(249,249,249,0.5)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Home() {
  return (
    <div style={{ display: "flex", gap: 8, height: "100%" }}>
      {/* preview */}
      <div
        style={{
          width: 820,
          flex: "none",
          borderRadius: 7,
          background: "var(--bg-secondary)",
          boxShadow: "0 0 0 1px rgba(0,0,0,.1622)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ height: 34, flex: "none", display: "flex", alignItems: "center", gap: 10, padding: "0 14px" }}>
          <span style={{ font: `600 12px/1 ${UI_FONT}`, color: "rgb(255,255,255)", letterSpacing: ".06em", textTransform: "uppercase" }}>Preview</span>
          <span style={{ marginLeft: "auto", font: `400 12px/1 ${MONO_FONT}`, color: "rgb(96,205,255)" }}>locked to source</span>
        </div>
        <div style={{ padding: "22px 24px 26px", display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" }}>
          <h1 style={{ margin: 0, font: `600 28px/36px ${UI_FONT}`, color: "rgb(255,255,255)", letterSpacing: "-.01em" }}>
            Reading tokens out of a .fig
          </h1>
          <p style={{ margin: 0, font: `400 14px/20px ${UI_FONT}`, color: "rgb(249,249,249)" }}>
            A short note on building a <strong style={{ fontWeight: 600, color: "rgb(255,255,255)" }}>design system</strong> straight from
            the file instead of from memory of the brand.
          </p>
          <h2 style={{ margin: "6px 0 0", font: `600 20px/26px ${UI_FONT}`, color: "rgb(255,255,255)" }}>Why tokens first</h2>
          <ul style={{ margin: 0, padding: "0 0 0 20px", display: "flex", flexDirection: "column", gap: 7, font: `400 14px/20px ${UI_FONT}`, color: "rgb(249,249,249)" }}>
            <li>Colour and type come from the file</li>
            <li>Odd values stay odd — 7px radius, 50px rail</li>
          </ul>
          <div style={{ padding: "2px 0 2px 14px", boxShadow: "inset 3px 0 0 0 rgb(96,205,255)" }}>
            <p style={{ margin: 0, font: `400 14px/20px ${UI_FONT}`, color: "rgb(196,196,196)", fontStyle: "italic" }}>
              Read the file, not your memory of the brand.
            </p>
          </div>
          <div style={{ borderRadius: 4, background: "rgb(49,51,55)", padding: "12px 14px", display: "flex", flexDirection: "column", fontFamily: MONO_FONT, fontWeight: 400, fontSize: 13, lineHeight: "18px" }}>
            <div style={{ whiteSpace: "pre" }}>
              <span style={{ color: "rgb(96,205,255)" }}>const</span>
              <span style={{ color: "#E1E4E8" }}> accent = </span>
              <span style={{ color: "rgb(119,243,255)" }}>&quot;#60CDFF&quot;</span>
              <span style={{ color: "#E1E4E8" }}>;</span>
            </div>
          </div>
          <p style={{ margin: 0, font: `400 14px/20px ${UI_FONT}`, color: "rgb(249,249,249)" }}>
            See the{" "}
            <a href="#" style={{ color: "rgb(96,205,255)", textDecoration: "underline", textUnderlineOffset: "3px" }}>
              full write-up
            </a>{" "}
            for the extraction steps.
          </p>
        </div>
      </div>

      {/* source / code */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          borderRadius: 7,
          background: "var(--bg-secondary)",
          boxShadow: "0 0 0 1px rgba(0,0,0,.1622)",
          padding: 12,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 16,
          overflow: "hidden",
        }}
      >
        <div style={{ height: 12, flex: "none", display: "flex", flexDirection: "row", alignItems: "center", padding: 0, gap: 6 }}>
          <span style={{ fontFamily: UI_FONT, fontWeight: 400, fontSize: 12, lineHeight: "12px", color: "#FFFFFF", whiteSpace: "nowrap" }}>content</span>
          <Chevron />
          <span style={{ fontFamily: UI_FONT, fontWeight: 400, fontSize: 12, lineHeight: "12px", color: "#FFFFFF", whiteSpace: "nowrap" }}>posts</span>
          <Chevron />
          <span style={{ fontFamily: UI_FONT, fontWeight: 400, fontSize: 12, lineHeight: "12px", color: "#FFFFFF", whiteSpace: "nowrap" }}>fluent-tokens.md</span>
        </div>

        <div style={{ flex: 1, minHeight: 0, alignSelf: "stretch", display: "flex", flexDirection: "row", alignItems: "flex-start", padding: 0, gap: 8, position: "relative", overflowY: "auto" }}>
          <div style={{ width: 15, flex: "none", display: "flex", flexDirection: "column", alignItems: "flex-start", padding: 0, gap: 10 }}>
            {GUTTER_LINES.map((n) => (
              <span key={n} style={{ width: 15, height: 8, flex: "none", fontFamily: MONO_FONT, fontWeight: 400, fontSize: 13, lineHeight: "18px", color: "rgba(249,249,249,0.5)" }}>
                {n}
              </span>
            ))}
          </div>

          <div style={{ flex: 1, minWidth: 0, position: "relative", fontFamily: MONO_FONT, fontWeight: 400, fontSize: 13, lineHeight: "18px", color: "#E1E4E8" }}>
            <div style={{ position: "absolute", left: 6, top: 18, bottom: 36, width: 1, background: "rgba(249,249,249,0.1)" }} />
            <div style={{ position: "absolute", left: 34, top: 108, height: 72, width: 1, background: "rgba(249,249,249,0.1)" }} />
            <div style={{ position: "absolute", left: -23, top: 342, height: 18, width: 2, background: "#0F7B0F" }} />
            <div style={{ position: "relative", display: "flex", flexDirection: "column" }}>
              <div style={{ height: 18, whiteSpace: "pre" }}><span style={{ color: "rgba(249,249,249,0.5)" }}>---</span></div>
              <div style={{ height: 18, whiteSpace: "pre" }}>
                <span style={{ color: "rgb(83,214,128)" }}>title</span>
                <span style={{ color: "#E1E4E8" }}>: </span>
                <span style={{ color: "rgb(119,243,255)" }}>&quot;Reading tokens out of a .fig&quot;</span>
              </div>
              <div style={{ height: 18, whiteSpace: "pre" }}>
                <span style={{ color: "rgb(83,214,128)" }}>date</span>
                <span style={{ color: "#E1E4E8" }}>: </span>
                <span style={{ color: "rgb(119,243,255)" }}>2026-08-28</span>
              </div>
              <div style={{ height: 18, whiteSpace: "pre" }}>
                <span style={{ color: "rgb(83,214,128)" }}>tags</span>
                <span style={{ color: "rgb(119,243,255)" }}>: [design, fluent, figma]</span>
              </div>
              <div style={{ height: 18, whiteSpace: "pre" }}><span style={{ color: "rgba(249,249,249,0.5)" }}>---</span></div>
              <div style={{ height: 18, whiteSpace: "pre" }} />
              <div style={{ height: 18, whiteSpace: "pre" }}><span style={{ color: "rgb(96,205,255)", fontWeight: 700 }}># Reading tokens out of a .fig</span></div>
              <div style={{ height: 18, whiteSpace: "pre" }} />
              <div style={{ height: 18, whiteSpace: "pre" }}>
                <span style={{ color: "#E1E4E8" }}>A short note on building a </span>
                <span style={{ color: "#FFFFFF", fontWeight: 700 }}>**design system**</span>
              </div>
              <div style={{ height: 18, whiteSpace: "pre" }}><span style={{ color: "#E1E4E8" }}>straight from the file instead of from memory</span></div>
              <div style={{ height: 18, whiteSpace: "pre" }}><span style={{ color: "#E1E4E8" }}>of the brand.</span></div>
              <div style={{ height: 18, whiteSpace: "pre" }} />
              <div style={{ height: 18, whiteSpace: "pre" }}><span style={{ color: "rgb(96,205,255)", fontWeight: 700 }}>## Why tokens first</span></div>
              <div style={{ height: 18, whiteSpace: "pre" }} />
              <div style={{ height: 18, whiteSpace: "pre" }}>
                <span style={{ color: "rgb(96,205,255)" }}>- </span>
                <span style={{ color: "#E1E4E8" }}>Colour and type come from the file</span>
              </div>
              <div style={{ height: 18, whiteSpace: "pre" }}>
                <span style={{ color: "rgb(96,205,255)" }}>- </span>
                <span style={{ color: "#E1E4E8" }}>Odd values stay odd — 7px radius, 50px rail</span>
              </div>
              <div style={{ height: 18, whiteSpace: "pre" }} />
              <div style={{ height: 18, whiteSpace: "pre" }}><span style={{ color: "rgba(249,249,249,0.5)", fontStyle: "italic" }}>&gt; Read the file, not your memory of the brand.</span></div>
              <div style={{ height: 18, whiteSpace: "pre" }} />
              <div style={{ height: 18, whiteSpace: "pre" }}><span style={{ color: "rgba(249,249,249,0.5)" }}>```ts</span></div>
              <div style={{ height: 18, whiteSpace: "pre" }}>
                <span style={{ color: "rgb(96,205,255)" }}>const</span>
                <span style={{ color: "#E1E4E8" }}> accent = </span>
                <span style={{ color: "rgb(119,243,255)" }}>&quot;#60CDFF&quot;</span>
                <span style={{ color: "#E1E4E8" }}>;</span>
              </div>
              <div style={{ height: 18, whiteSpace: "pre" }}><span style={{ color: "rgba(249,249,249,0.5)" }}>```</span></div>
              <div style={{ height: 18, whiteSpace: "pre" }} />
              <div style={{ height: 18, whiteSpace: "pre" }}>
                <span style={{ color: "#E1E4E8" }}>See the </span>
                <span style={{ color: "rgb(11,152,249)" }}>[full write-up]</span>
                <span style={{ color: "rgba(249,249,249,0.5)" }}>(/posts/tokens)</span>
                <span style={{ color: "#E1E4E8" }}> for the</span>
              </div>
              <div style={{ height: 18, whiteSpace: "pre" }}><span style={{ color: "#E1E4E8" }}>extraction steps.</span></div>
              <div style={{ height: 18, whiteSpace: "pre" }} />
            </div>
          </div>

          <div style={{ width: 14, flex: "none", alignSelf: "stretch", position: "relative", borderRadius: "0 7px 7px 0" }}>
            <div style={{ position: "absolute", right: 4, top: 16, width: 2, height: 123, background: "rgba(255,255,255,0.5442)", borderRadius: 9999 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
