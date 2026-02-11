import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { loadFont } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

// ─── FONTS ───────────────────────────────────────────────
const { fontFamily: inter } = loadFont("normal", {
  weights: ["400", "700", "900"],
  subsets: ["latin"],
});
const { fontFamily: mono } = loadMono("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

// ─── COLORS (Claude Theme) ──────────────────────────────
const C = {
  bg: "#100F1A",
  surface: "#1B1A28",
  surfaceLight: "#28273A",
  border: "#35344A",
  orange: "#D4A373",
  terracotta: "#CC785C",
  cream: "#F5F0EB",
  purple: "#7C3AED",
  purpleLight: "#A78BFA",
  purpleDark: "#2D1B69",
  blue: "#027DFD",
  teal: "#5EEAD4",
  red: "#EF4444",
  green: "#22C55E",
  white: "#FFFFFF",
  muted: "#8B8A9E",
  dimmed: "#5A596E",
};

// ─── DURATIONS ──────────────────────────────────────────
const S = {
  intro: 185,
  problem: 200,
  codebase: 200,
  hotReload: 185,
  ui: 185,
  dart: 185,
  startup: 185,
  conclusion: 250,
};
const T = 15;
export const TOTAL_DURATION =
  Object.values(S).reduce((a, b) => a + b, 0) - T * 7;

// ─── HELPERS ────────────────────────────────────────────
const clamp = { extrapolateLeft: "clamp" as const, extrapolateRight: "clamp" as const };

const useSpring = (delay: number, config?: object) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame, fps, delay, config: config ?? { damping: 200 } });
};

// Zoom wrapper: gently scales content during key reveal
const ZoomPulse: React.FC<{
  children: React.ReactNode;
  startFrame: number;
  duration?: number;
  intensity?: number;
}> = ({ children, startFrame, duration = 40, intensity = 1.04 }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(
    frame,
    [startFrame, startFrame + duration * 0.4, startFrame + duration],
    [1, intensity, 1],
    clamp,
  );
  return (
    <div style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>
      {children}
    </div>
  );
};

// ─── BACKGROUND ─────────────────────────────────────────
const SceneBg: React.FC<{
  accentColor?: string;
  accentX?: number;
  accentY?: number;
}> = ({ accentColor = C.purple, accentX = 960, accentY = 400 }) => (
  <div style={{ position: "absolute", inset: 0, background: C.bg }}>
    {/* Subtle dot grid */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `radial-gradient(${C.dimmed}22 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
      }}
    />
    {/* Soft glow */}
    <div
      style={{
        position: "absolute",
        left: accentX - 350,
        top: accentY - 350,
        width: 700,
        height: 700,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${accentColor}15 0%, transparent 65%)`,
        filter: "blur(40px)",
      }}
    />
  </div>
);

// ─── STEP TAG ───────────────────────────────────────────
const StepTag: React.FC<{ num: string; label: string; delay?: number }> = ({
  num,
  label,
  delay = 0,
}) => {
  const s = useSpring(delay);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [12, 0])}px)`,
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${C.orange}, ${C.terracotta})`,
          borderRadius: 8,
          padding: "5px 14px",
          fontFamily: inter,
          fontWeight: 900,
          fontSize: 18,
          color: C.bg,
          letterSpacing: 2,
        }}
      >
        {num}
      </div>
      <span
        style={{
          fontFamily: inter,
          fontSize: 18,
          fontWeight: 700,
          color: C.muted,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
    </div>
  );
};

// ─── TITLE ──────────────────────────────────────────────
const Title: React.FC<{
  text: string;
  delay?: number;
  size?: number;
  color?: string;
  gradient?: [string, string];
}> = ({ text, delay = 5, size = 54, color, gradient }) => {
  const s = useSpring(delay, { damping: 14, stiffness: 100 });
  const style: React.CSSProperties = {
    fontFamily: inter,
    fontSize: size,
    fontWeight: 900,
    lineHeight: 1.15,
    letterSpacing: -1,
    opacity: s,
    transform: `translateY(${interpolate(s, [0, 1], [24, 0])}px)`,
  };
  if (gradient) {
    style.background = `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`;
    style.WebkitBackgroundClip = "text";
    style.WebkitTextFillColor = "transparent";
  } else {
    style.color = color ?? C.cream;
  }
  return <div style={style}>{text}</div>;
};

// ─── BODY TEXT ───────────────────────────────────────────
const Body: React.FC<{
  text: string;
  delay?: number;
  size?: number;
  color?: string;
  bold?: boolean;
}> = ({ text, delay = 0, size = 24, color = C.muted, bold }) => {
  const s = useSpring(delay);
  return (
    <div
      style={{
        fontFamily: inter,
        fontSize: size,
        fontWeight: bold ? 700 : 400,
        color,
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [14, 0])}px)`,
        lineHeight: 1.5,
      }}
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
};

// ─── CODE EDITOR MOCKUP ─────────────────────────────────
const Editor: React.FC<{
  fileName: string;
  lines: { tokens: { t: string; c: string }[] }[];
  delay: number;
  width?: number;
}> = ({ fileName, lines, delay, width = 560 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, delay, config: { damping: 200 } });
  return (
    <div
      style={{
        width,
        background: "#0D0C14",
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        overflow: "hidden",
        opacity: enter,
        transform: `translateY(${interpolate(enter, [0, 1], [16, 0])}px)`,
        boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
      }}
    >
      {/* Title bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 16px",
          gap: 8,
          borderBottom: `1px solid ${C.border}`,
          background: "#131220",
        }}
      >
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <div
            key={c}
            style={{ width: 11, height: 11, borderRadius: 6, background: c }}
          />
        ))}
        <span
          style={{
            fontFamily: mono,
            fontSize: 13,
            color: C.muted,
            marginLeft: 8,
          }}
        >
          {fileName}
        </span>
      </div>
      {/* Code body */}
      <div style={{ padding: "16px 20px", fontFamily: mono, fontSize: 17, lineHeight: 1.8 }}>
        {lines.map((line, i) => {
          const ls = spring({
            frame,
            fps,
            delay: delay + 4 + i * 3,
            config: { damping: 200 },
          });
          return (
            <div key={i} style={{ display: "flex", opacity: ls }}>
              <span
                style={{
                  color: C.dimmed,
                  width: 36,
                  textAlign: "right",
                  marginRight: 16,
                  userSelect: "none",
                  fontSize: 14,
                }}
              >
                {i + 1}
              </span>
              <span>
                {line.tokens.map((tk, j) => (
                  <span key={j} style={{ color: tk.c }}>
                    {tk.t}
                  </span>
                ))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── PHONE MOCKUP ───────────────────────────────────────
const PhoneMockup: React.FC<{
  children: React.ReactNode;
  delay: number;
}> = ({ children, delay }) => {
  const s = useSpring(delay, { damping: 14 });
  return (
    <div
      style={{
        width: 220,
        height: 420,
        background: "#0A0A12",
        borderRadius: 32,
        border: `3px solid ${C.border}`,
        padding: 8,
        opacity: s,
        transform: `scale(${interpolate(s, [0, 1], [0.9, 1])})`,
        boxShadow: "0 16px 50px rgba(0,0,0,0.5)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Notch */}
      <div style={{ display: "flex", justifyContent: "center", padding: "6px 0" }}>
        <div
          style={{
            width: 60,
            height: 6,
            borderRadius: 3,
            background: C.border,
          }}
        />
      </div>
      {/* Screen */}
      <div
        style={{
          flex: 1,
          borderRadius: 20,
          overflow: "hidden",
          background: C.surface,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </div>
  );
};

// ─── STAT PILL ──────────────────────────────────────────
const Stat: React.FC<{
  value: string;
  label: string;
  color: string;
  delay: number;
}> = ({ value, label, color, delay }) => {
  const s = useSpring(delay, { damping: 14 });
  return (
    <div
      style={{
        background: `${color}0C`,
        border: `1px solid ${color}28`,
        borderRadius: 16,
        padding: "24px 32px",
        textAlign: "center",
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [18, 0])}px)`,
        minWidth: 180,
      }}
    >
      <div
        style={{
          fontFamily: inter,
          fontSize: 46,
          fontWeight: 900,
          color,
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: inter,
          fontSize: 16,
          fontWeight: 400,
          color: C.muted,
          marginTop: 8,
        }}
      >
        {label}
      </div>
    </div>
  );
};

// ─── SCENE LAYOUT ───────────────────────────────────────
const SceneLayout: React.FC<{
  children: React.ReactNode;
  accent?: string;
  accentPos?: [number, number];
}> = ({ children, accent, accentPos }) => (
  <AbsoluteFill>
    <SceneBg
      accentColor={accent}
      accentX={accentPos?.[0]}
      accentY={accentPos?.[1]}
    />
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "72px 100px",
      }}
    >
      {children}
    </AbsoluteFill>
  </AbsoluteFill>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCENE 1: INTRO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const whyS = spring({ frame, fps, delay: 10, config: { damping: 12 } });
  const flutterS = spring({ frame, fps, delay: 22, config: { damping: 14, stiffness: 120 } });
  const markS = spring({ frame, fps, delay: 32, config: { damping: 8 } });
  const subS = spring({ frame, fps, delay: 48, config: { damping: 200 } });

  // Zoom on Flutter text entrance
  const zoom = interpolate(frame, [20, 35, 55], [1, 1.06, 1], clamp);

  return (
    <AbsoluteFill>
      <SceneBg accentColor={C.orange} accentX={960} accentY={380} />
      <div
        style={{
          position: "absolute",
          left: 200,
          top: 150,
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.purpleDark}20 0%, transparent 60%)`,
          filter: "blur(60px)",
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${zoom})`,
        }}
      >
        {/* Main title row */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
          <span
            style={{
              fontFamily: inter,
              fontSize: 120,
              fontWeight: 900,
              color: C.cream,
              opacity: whyS,
              transform: `translateY(${interpolate(whyS, [0, 1], [30, 0])}px)`,
              letterSpacing: -3,
              display: "inline-block",
            }}
          >
            POURQUOI
          </span>
          <span
            style={{
              fontFamily: inter,
              fontSize: 120,
              fontWeight: 900,
              background: `linear-gradient(135deg, ${C.blue}, ${C.teal})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              opacity: flutterS,
              transform: `translateX(${interpolate(flutterS, [0, 1], [40, 0])}px)`,
              letterSpacing: -3,
              display: "inline-block",
            }}
          >
            FLUTTER
          </span>
          <span
            style={{
              fontFamily: inter,
              fontSize: 120,
              fontWeight: 900,
              color: C.orange,
              opacity: markS,
              transform: `scale(${interpolate(markS, [0, 1], [2.5, 1])})`,
              display: "inline-block",
            }}
          >
            ?
          </span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            marginTop: 20,
            fontFamily: inter,
            fontSize: 28,
            color: C.muted,
            opacity: subS,
            transform: `translateY(${interpolate(subS, [0, 1], [16, 0])}px)`,
            letterSpacing: 1,
          }}
        >
          Le framework{" "}
          <span style={{ color: C.orange, fontWeight: 700 }}>#1</span> pour les{" "}
          <span style={{ color: C.cream, fontWeight: 700 }}>devs solo</span> &{" "}
          <span style={{ color: C.purple, fontWeight: 700 }}>startups</span>
        </div>

        {/* Platform pills */}
        <div style={{ display: "flex", gap: 14, marginTop: 44 }}>
          {["Mobile", "Web", "Desktop"].map((label, i) => (
            <div
              key={label}
              style={{
                background: C.surfaceLight,
                border: `1px solid ${C.border}`,
                borderRadius: 24,
                padding: "8px 22px",
                fontFamily: inter,
                fontSize: 17,
                fontWeight: 700,
                color: C.purpleLight,
                letterSpacing: 1,
                opacity: spring({
                  frame,
                  fps,
                  delay: 65 + i * 7,
                  config: { damping: 200 },
                }),
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCENE 2: LE PROBLEME
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const platforms = [
    { name: "iOS", lang: "Swift", color: "#F97316", icon: "🍎" },
    { name: "Android", lang: "Kotlin", color: "#A855F7", icon: "🤖" },
    { name: "Web", lang: "React", color: "#3B82F6", icon: "🌐" },
  ];

  return (
    <SceneLayout accent={C.red} accentPos={[960, 350]}>
      <Title text="Le dilemme du dev solo" delay={6} size={52} />

      <ZoomPulse startFrame={55} intensity={1.05}>
        <div
          style={{
            display: "flex",
            gap: 36,
            marginTop: 52,
            justifyContent: "center",
          }}
        >
          {platforms.map((p, i) => {
            const d = 18 + i * 10;
            const s = spring({ frame, fps, delay: d, config: { damping: 200 } });
            const xD = 50 + i * 8;
            const xS = spring({ frame, fps, delay: xD, config: { damping: 12 } });
            return (
              <div
                key={p.name}
                style={{
                  background: C.surface,
                  border: `1px solid ${C.border}`,
                  borderRadius: 18,
                  padding: "32px 44px",
                  textAlign: "center",
                  opacity: s,
                  transform: `translateY(${interpolate(s, [0, 1], [24, 0])}px)`,
                  position: "relative",
                  width: 220,
                }}
              >
                <div style={{ fontSize: 38, marginBottom: 10 }}>{p.icon}</div>
                <div
                  style={{
                    fontFamily: inter,
                    fontSize: 32,
                    fontWeight: 900,
                    color: p.color,
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 17,
                    color: C.muted,
                    marginTop: 6,
                  }}
                >
                  {p.lang}
                </div>
                {/* Red X */}
                <div
                  style={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    background: C.red,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: inter,
                    fontWeight: 900,
                    fontSize: 18,
                    color: C.white,
                    opacity: xS,
                    transform: `scale(${xS})`,
                    boxShadow: `0 0 16px ${C.red}55`,
                  }}
                >
                  X
                </div>
              </div>
            );
          })}
        </div>
      </ZoomPulse>

      <div style={{ textAlign: "center", marginTop: 40 }}>
        <Body
          text="3 bases de code &middot; 3 langages &middot; <span style='color:#EF4444;font-weight:700'>1 seul développeur</span>"
          delay={75}
          size={26}
        />
      </div>

      <ZoomPulse startFrame={110} intensity={1.06}>
        <div style={{ textAlign: "center", marginTop: 28 }}>
          <Title
            text="Et s'il existait UNE seule solution ?"
            delay={100}
            size={36}
            color={C.orange}
          />
        </div>
      </ZoomPulse>
    </SceneLayout>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCENE 3: UN SEUL CODE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CodebaseScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const platforms = [
    { name: "iOS", icon: "📱", color: C.orange },
    { name: "Android", icon: "🤖", color: C.green },
    { name: "Web", icon: "🌐", color: C.blue },
    { name: "macOS", icon: "💻", color: C.purple },
    { name: "Linux", icon: "🖥️", color: C.teal },
    { name: "Windows", icon: "⚪", color: "#0078D4" },
  ];

  const centerS = spring({ frame, fps, delay: 16, config: { damping: 14 } });

  return (
    <SceneLayout accent={C.blue} accentPos={[960, 420]}>
      <StepTag num="01" label="Étape" delay={4} />
      <div style={{ marginTop: 10 }}>
        <Title text="Un seul code. Toutes les plateformes." delay={10} />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 48,
          gap: 32,
        }}
      >
        {/* Flutter badge */}
        <div
          style={{
            background: `linear-gradient(135deg, ${C.blue}18, ${C.teal}18)`,
            border: `2px solid ${C.blue}40`,
            borderRadius: 18,
            padding: "16px 48px",
            fontFamily: inter,
            fontSize: 32,
            fontWeight: 900,
            color: C.blue,
            letterSpacing: 3,
            opacity: centerS,
            transform: `scale(${centerS})`,
            boxShadow: `0 0 50px ${C.blue}18`,
          }}
        >
          FLUTTER
        </div>

        {/* Connection line */}
        <div
          style={{
            width: 3,
            height: 40,
            background: `linear-gradient(to bottom, ${C.blue}55, ${C.purple}55)`,
            opacity: spring({ frame, fps, delay: 24, config: { damping: 200 } }),
          }}
        />

        {/* Platform grid */}
        <ZoomPulse startFrame={40} intensity={1.05} duration={50}>
          <div
            style={{
              display: "flex",
              gap: 32,
              flexWrap: "wrap",
              justifyContent: "center",
              maxWidth: 780,
            }}
          >
            {platforms.map((p, i) => {
              const d = 30 + i * 7;
              const s = spring({ frame, fps, delay: d, config: { damping: 14, stiffness: 120 } });
              return (
                <div
                  key={p.name}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    opacity: s,
                    transform: `scale(${s})`,
                  }}
                >
                  <div
                    style={{
                      width: 68,
                      height: 68,
                      borderRadius: 16,
                      background: `${p.color}12`,
                      border: `1px solid ${p.color}35`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 30,
                      boxShadow: `0 0 24px ${p.color}15`,
                    }}
                  >
                    {p.icon}
                  </div>
                  <span
                    style={{
                      fontFamily: inter,
                      fontSize: 15,
                      fontWeight: 700,
                      color: C.cream,
                      letterSpacing: 1,
                    }}
                  >
                    {p.name}
                  </span>
                </div>
              );
            })}
          </div>
        </ZoomPulse>
      </div>

      <div style={{ textAlign: "center", marginTop: 32 }}>
        <Body
          text="« Écrivez une fois, déployez partout »"
          delay={80}
          size={22}
          color={C.dimmed}
        />
      </div>
    </SceneLayout>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCENE 4: HOT RELOAD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const HotReloadScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const codeLines = [
    { tokens: [{ t: "Container", c: C.teal }, { t: "(", c: C.muted }] },
    { tokens: [{ t: "  color: ", c: C.cream }, { t: "Colors.blue", c: C.blue }, { t: ",", c: C.muted }] },
    { tokens: [{ t: "  child: ", c: C.cream }, { t: "Text", c: C.teal }, { t: "(", c: C.muted }] },
    { tokens: [{ t: "    ", c: C.cream }, { t: "'Bonjour Flutter !'", c: C.green }] },
    { tokens: [{ t: "  ),", c: C.muted }] },
    { tokens: [{ t: ")", c: C.muted }] },
  ];

  // Flash effect when "hot reload" triggers
  const flash = interpolate(frame, [80, 84, 92, 96], [0, 0.6, 0.6, 0], clamp);

  return (
    <SceneLayout accent={C.orange} accentPos={[700, 380]}>
      <StepTag num="02" label="Étape" delay={4} />
      <div style={{ marginTop: 10 }}>
        <Title text="Hot Reload = Développez plus vite" delay={10} />
      </div>

      <div
        style={{
          display: "flex",
          gap: 40,
          marginTop: 40,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Editor fileName="main.dart" lines={codeLines} delay={18} width={480} />

        {/* Arrow / lightning */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              fontSize: 36,
              opacity: spring({ frame, fps, delay: 50, config: { damping: 200 } }),
            }}
          >
            ⚡
          </div>
          <div
            style={{
              fontFamily: inter,
              fontSize: 14,
              fontWeight: 900,
              color: C.orange,
              letterSpacing: 2,
              opacity: spring({ frame, fps, delay: 55, config: { damping: 200 } }),
            }}
          >
            INSTANT
          </div>
        </div>

        <PhoneMockup delay={25}>
          {/* Status bar */}
          <div
            style={{
              padding: "8px 14px",
              display: "flex",
              justifyContent: "space-between",
              fontFamily: inter,
              fontSize: 10,
              color: C.muted,
            }}
          >
            <span>9:41</span>
            <span>100%</span>
          </div>
          {/* App content */}
          <div
            style={{
              flex: 1,
              background: C.blue,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <span
              style={{
                fontFamily: inter,
                fontSize: 18,
                fontWeight: 700,
                color: C.white,
              }}
            >
              Bonjour Flutter !
            </span>
            {/* Flash overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: C.orange,
                opacity: flash,
              }}
            />
          </div>
          {/* Bottom nav */}
          <div
            style={{
              padding: "12px 20px",
              display: "flex",
              justifyContent: "space-around",
              background: "#12111A",
            }}
          >
            {["⌂", "☆", "⚙"].map((ic) => (
              <span key={ic} style={{ fontSize: 16, color: C.muted }}>
                {ic}
              </span>
            ))}
          </div>
        </PhoneMockup>
      </div>

      <ZoomPulse startFrame={95} intensity={1.06}>
        <div style={{ display: "flex", gap: 28, justifyContent: "center", marginTop: 36 }}>
          <Stat value="< 1s" label="Temps de rechargement" color={C.orange} delay={90} />
          <Stat value="2h+" label="Gagnées par jour" color={C.green} delay={100} />
        </div>
      </ZoomPulse>
    </SceneLayout>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCENE 5: BEAU UI
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const UIScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const widgets = [
    { name: "Boutons", color: C.blue },
    { name: "Cartes", color: C.purple },
    { name: "Listes", color: C.teal },
    { name: "Barres de nav", color: C.orange },
    { name: "Dialogues", color: C.green },
    { name: "Formulaires", color: C.terracotta },
  ];

  return (
    <SceneLayout accent={C.purple} accentPos={[960, 380]}>
      <StepTag num="03" label="Étape" delay={4} />
      <div style={{ marginTop: 10 }}>
        <Title text="Un design magnifique. Sans effort." delay={10} />
      </div>

      <ZoomPulse startFrame={30} intensity={1.04} duration={50}>
        <div
          style={{
            display: "flex",
            gap: 20,
            marginTop: 48,
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: 880,
            alignSelf: "center",
          }}
        >
          {widgets.map((w, i) => {
            const d = 22 + i * 7;
            const s = spring({ frame, fps, delay: d, config: { damping: 14 } });
            return (
              <div
                key={w.name}
                style={{
                  background: `${w.color}0C`,
                  border: `1px solid ${w.color}28`,
                  borderRadius: 14,
                  padding: "20px 32px",
                  fontFamily: inter,
                  fontSize: 20,
                  fontWeight: 700,
                  color: w.color,
                  opacity: s,
                  transform: `translateY(${interpolate(s, [0, 1], [20, 0])}px)`,
                  textAlign: "center",
                  minWidth: 150,
                }}
              >
                {w.name}
              </div>
            );
          })}
        </div>
      </ZoomPulse>

      {/* Framework badges */}
      <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 44 }}>
        {[
          { name: "Material 3", color: C.blue },
          { name: "Cupertino", color: C.muted },
        ].map((fw, i) => {
          const d = 68 + i * 10;
          const s = spring({ frame, fps, delay: d, config: { damping: 200 } });
          return (
            <div
              key={fw.name}
              style={{
                background: `${fw.color}10`,
                border: `2px solid ${fw.color}35`,
                borderRadius: 50,
                padding: "10px 28px",
                fontFamily: inter,
                fontSize: 22,
                fontWeight: 900,
                color: fw.color,
                letterSpacing: 1,
                opacity: s,
                transform: `scale(${s})`,
              }}
            >
              {fw.name}
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: "center", marginTop: 28 }}>
        <Body
          text="Rendu natif sur chaque plateforme"
          delay={90}
          size={22}
          color={C.dimmed}
        />
      </div>
    </SceneLayout>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCENE 6: DART EST SIMPLE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const DartScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const dartCode = [
    { tokens: [{ t: "class ", c: C.purple }, { t: "User ", c: C.teal }, { t: "{", c: C.muted }] },
    { tokens: [{ t: "  final ", c: C.purple }, { t: "String ", c: C.teal }, { t: "name;", c: C.cream }] },
    { tokens: [{ t: "  final ", c: C.purple }, { t: "int ", c: C.teal }, { t: "age;", c: C.cream }] },
    { tokens: [{ t: "", c: C.muted }] },
    { tokens: [{ t: "  User", c: C.teal }, { t: "({", c: C.muted }] },
    { tokens: [{ t: "    required ", c: C.purple }, { t: "this", c: C.orange }, { t: ".name,", c: C.cream }] },
    { tokens: [{ t: "    required ", c: C.purple }, { t: "this", c: C.orange }, { t: ".age,", c: C.cream }] },
    { tokens: [{ t: "  });", c: C.muted }] },
    { tokens: [{ t: "}", c: C.muted }] },
  ];

  const features = [
    { text: "Syntaxe familière", icon: "✅" },
    { text: "Typage sûr", icon: "🔒" },
    { text: "Null-safety intégré", icon: "🛡️" },
    { text: "Async/await natif", icon: "⚡" },
  ];

  return (
    <SceneLayout accent={C.teal} accentPos={[500, 400]}>
      <StepTag num="04" label="Étape" delay={4} />
      <div style={{ marginTop: 10 }}>
        <Title text="Dart est simple à apprendre" delay={10} />
      </div>

      <div
        style={{
          display: "flex",
          gap: 52,
          marginTop: 36,
          alignItems: "flex-start",
        }}
      >
        <ZoomPulse startFrame={24} intensity={1.04} duration={45}>
          <Editor fileName="user.dart" lines={dartCode} delay={18} width={460} />
        </ZoomPulse>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 12 }}>
          {features.map((f, i) => {
            const d = 48 + i * 9;
            const s = spring({ frame, fps, delay: d, config: { damping: 200 } });
            return (
              <div
                key={f.text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  opacity: s,
                  transform: `translateX(${interpolate(s, [0, 1], [24, 0])}px)`,
                }}
              >
                <span style={{ fontSize: 24 }}>{f.icon}</span>
                <span
                  style={{
                    fontFamily: inter,
                    fontSize: 24,
                    fontWeight: 700,
                    color: C.cream,
                  }}
                >
                  {f.text}
                </span>
              </div>
            );
          })}

          <ZoomPulse startFrame={100} intensity={1.08}>
            <div
              style={{
                marginTop: 20,
                background: `${C.orange}0C`,
                border: `1px solid ${C.orange}28`,
                borderRadius: 12,
                padding: "14px 22px",
                fontFamily: inter,
                fontSize: 19,
                color: C.orange,
                fontWeight: 700,
                opacity: spring({ frame, fps, delay: 95, config: { damping: 200 } }),
                maxWidth: 380,
              }}
            >
              &laquo; Apprenez Dart en un week-end si vous connaissez JS &raquo;
            </div>
          </ZoomPulse>
        </div>
      </div>
    </SceneLayout>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCENE 7: STARTUP READY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const StartupScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const companies = [
    { name: "Google Pay", color: C.blue },
    { name: "BMW", color: C.white },
    { name: "Alibaba", color: C.orange },
    { name: "Nubank", color: C.purple },
    { name: "eBay", color: C.red },
    { name: "Toyota", color: C.green },
  ];

  return (
    <SceneLayout accent={C.green} accentPos={[960, 360]}>
      <StepTag num="05" label="Étape" delay={4} />
      <div style={{ marginTop: 10 }}>
        <Title text="Parfait pour les startups" delay={10} />
      </div>

      <ZoomPulse startFrame={30} intensity={1.05} duration={45}>
        <div style={{ display: "flex", gap: 32, marginTop: 48, justifyContent: "center" }}>
          <Stat value="1" label="Équipe au lieu de 3" color={C.green} delay={22} />
          <Stat value="50%" label="Plus rapide sur le marché" color={C.orange} delay={32} />
          <Stat value="60%" label="Coûts réduits" color={C.purple} delay={42} />
        </div>
      </ZoomPulse>

      <div style={{ textAlign: "center", marginTop: 42 }}>
        <Body text="Utilisé par les leaders de l'industrie" delay={58} size={22} color={C.muted} />
      </div>

      <div
        style={{
          display: "flex",
          gap: 20,
          marginTop: 20,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {companies.map((c, i) => {
          const d = 65 + i * 7;
          const s = spring({ frame, fps, delay: d, config: { damping: 200 } });
          return (
            <div
              key={c.name}
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: "8px 20px",
                fontFamily: inter,
                fontSize: 18,
                fontWeight: 700,
                color: c.color,
                opacity: s,
                letterSpacing: 0.5,
              }}
            >
              {c.name}
            </div>
          );
        })}
      </div>
    </SceneLayout>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCENE 8: CONCLUSION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ConclusionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const steps = [
    { num: "01", text: "Un seul code", color: C.blue },
    { num: "02", text: "Hot Reload", color: C.orange },
    { num: "03", text: "Beau design", color: C.purple },
    { num: "04", text: "Dart simple", color: C.teal },
    { num: "05", text: "Startup-ready", color: C.green },
  ];

  const ctaS = spring({ frame, fps, delay: 55, config: { damping: 12 } });
  const urlS = spring({ frame, fps, delay: 85, config: { damping: 200 } });

  // Slow zoom in for dramatic ending
  const endZoom = interpolate(frame, [0, 250], [1, 1.03], clamp);

  return (
    <AbsoluteFill>
      <SceneBg accentColor={C.orange} accentX={960} accentY={400} />
      {/* Extra glow orbs for finale */}
      <div
        style={{
          position: "absolute",
          left: 250,
          top: 250,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.purpleDark}18 0%, transparent 60%)`,
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 200,
          bottom: 200,
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.blue}15 0%, transparent 60%)`,
          filter: "blur(50px)",
        }}
      />

      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          transform: `scale(${endZoom})`,
        }}
      >
        {/* Recap badges */}
        <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
          {steps.map((st, i) => {
            const d = 6 + i * 7;
            const s = spring({ frame, fps, delay: d, config: { damping: 14 } });
            return (
              <div
                key={st.num}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: `${st.color}0C`,
                  border: `1px solid ${st.color}30`,
                  borderRadius: 10,
                  padding: "8px 16px",
                  opacity: s,
                  transform: `translateY(${interpolate(s, [0, 1], [16, 0])}px)`,
                }}
              >
                <span
                  style={{
                    fontFamily: inter,
                    fontSize: 14,
                    fontWeight: 900,
                    color: st.color,
                  }}
                >
                  {st.num}
                </span>
                <span
                  style={{
                    fontFamily: inter,
                    fontSize: 14,
                    fontWeight: 700,
                    color: C.cream,
                  }}
                >
                  {st.text}
                </span>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <ZoomPulse startFrame={55} intensity={1.06}>
          <div
            style={{
              fontFamily: inter,
              fontSize: 66,
              fontWeight: 900,
              textAlign: "center",
              lineHeight: 1.15,
              opacity: ctaS,
              transform: `scale(${interpolate(ctaS, [0, 1], [0.92, 1])})`,
              letterSpacing: -1,
            }}
          >
            <span style={{ color: C.cream }}>Commencez avec</span>
            <br />
            <span
              style={{
                background: `linear-gradient(135deg, ${C.blue}, ${C.teal})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Flutter
            </span>{" "}
            <span style={{ color: C.orange }}>AUJOURD&apos;HUI</span>
          </div>
        </ZoomPulse>

        {/* URL */}
        <div
          style={{
            fontFamily: mono,
            fontSize: 26,
            fontWeight: 700,
            color: C.blue,
            background: `${C.blue}0C`,
            border: `1px solid ${C.blue}28`,
            borderRadius: 10,
            padding: "10px 28px",
            opacity: urlS,
            transform: `translateY(${interpolate(urlS, [0, 1], [8, 0])}px)`,
            letterSpacing: 1,
          }}
        >
          flutter.dev
        </div>

        {/* Claude credit */}
        <div
          style={{
            marginTop: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
            opacity: spring({ frame, fps, delay: 120, config: { damping: 200 } }),
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              background: C.orange,
            }}
          />
          <span
            style={{
              fontFamily: inter,
              fontSize: 16,
              color: C.muted,
            }}
          >
            Presenté par{" "}
            <span style={{ color: C.orange, fontWeight: 700 }}>Ibrahim Ahmad</span>
          </span>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPOSITION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const FlutterVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = frame / durationInFrames;

  const scenes: { component: React.FC; duration: number }[] = [
    { component: IntroScene, duration: S.intro },
    { component: ProblemScene, duration: S.problem },
    { component: CodebaseScene, duration: S.codebase },
    { component: HotReloadScene, duration: S.hotReload },
    { component: UIScene, duration: S.ui },
    { component: DartScene, duration: S.dart },
    { component: StartupScene, duration: S.startup },
    { component: ConclusionScene, duration: S.conclusion },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <TransitionSeries>
        {scenes.map((scene, i) => {
          const Scene = scene.component;
          const elements: React.ReactNode[] = [
            <TransitionSeries.Sequence
              key={`s-${i}`}
              durationInFrames={scene.duration}
            >
              <Scene />
            </TransitionSeries.Sequence>,
          ];
          if (i < scenes.length - 1) {
            elements.push(
              <TransitionSeries.Transition
                key={`t-${i}`}
                presentation={slide({ direction: "from-right" })}
                timing={linearTiming({ durationInFrames: T })}
              />,
            );
          }
          return elements;
        })}
      </TransitionSeries>

      {/* ── Progress bar ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `${C.white}06`,
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${C.orange}, ${C.terracotta})`,
            borderRadius: "0 2px 2px 0",
            boxShadow: `0 0 10px ${C.orange}55`,
          }}
        />
      </div>

      {/* ── Channel watermark ── */}
      <div
        style={{
          position: "absolute",
          top: 22,
          right: 28,
          display: "flex",
          alignItems: "center",
          gap: 8,
          opacity: 0.4,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            background: C.orange,
          }}
        />
        <span
          style={{
            fontFamily: inter,
            fontSize: 14,
            fontWeight: 700,
            color: C.cream,
            letterSpacing: 2,
          }}
        >
          Ibrahim Ahmad
        </span>
      </div>
    </AbsoluteFill>
  );
};
