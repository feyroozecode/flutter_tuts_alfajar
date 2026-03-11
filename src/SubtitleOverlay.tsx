import React, { useState, useEffect, useCallback } from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  staticFile,
  useDelayRender,
  Sequence,
} from "remotion";
import {
  createTikTokStyleCaptions,
  type Caption,
  type TikTokPage,
} from "@remotion/captions";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily: inter } = loadFont("normal", {
  weights: ["700"],
  subsets: ["latin"],
});

// How often caption pages switch (ms) — roughly 2–3 words per page
const SWITCH_EVERY_MS = 1400;

const HIGHLIGHT_COLOR = "#D4A373"; // orange accent matching the video theme
const TEXT_COLOR = "#F5F0EB"; // cream

// ─── Single caption page ────────────────────────────────
const CaptionPage: React.FC<{ page: TikTokPage }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTimeMs = (frame / fps) * 1000;
  const absoluteTimeMs = page.startMs + currentTimeMs;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        height: "100%",
        paddingBottom: 60,
        paddingLeft: 80,
        paddingRight: 80,
      }}
    >
      <div
        style={{
          background: "rgba(16, 15, 26, 0.82)",
          borderRadius: 14,
          padding: "12px 28px",
          backdropFilter: "blur(6px)",
          border: "1px solid rgba(212,163,115,0.15)",
          maxWidth: 900,
          textAlign: "center",
          whiteSpace: "pre",
        }}
      >
        {page.tokens.map((token) => {
          const isActive =
            token.fromMs <= absoluteTimeMs && token.toMs > absoluteTimeMs;
          return (
            <span
              key={token.fromMs}
              style={{
                fontFamily: inter,
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: 0.2,
                color: isActive ? HIGHLIGHT_COLOR : TEXT_COLOR,
                transition: "color 0.05s",
              }}
            >
              {token.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main overlay ───────────────────────────────────────
export const SubtitleOverlay: React.FC = () => {
  const [captions, setCaptions] = useState<Caption[] | null>(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const [handle] = useState(() => delayRender("Loading French captions"));
  const { fps } = useVideoConfig();

  const fetchCaptions = useCallback(async () => {
    try {
      const response = await fetch(staticFile("flutter-captions-fr.json"));
      const data: Caption[] = await response.json();
      setCaptions(data);
      continueRender(handle);
    } catch (e) {
      cancelRender(e);
    }
  }, [continueRender, cancelRender, handle]);

  useEffect(() => {
    fetchCaptions();
  }, [fetchCaptions]);

  if (!captions) {
    return null;
  }

  const { pages } = createTikTokStyleCaptions({
    captions,
    combineTokensWithinMilliseconds: SWITCH_EVERY_MS,
  });

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {pages.map((page, index) => {
        const nextPage = pages[index + 1] ?? null;
        const startFrame = (page.startMs / 1000) * fps;
        const endFrame = Math.min(
          nextPage ? (nextPage.startMs / 1000) * fps : Infinity,
          startFrame + (SWITCH_EVERY_MS / 1000) * fps,
        );
        const durationInFrames = Math.round(endFrame - startFrame);

        if (durationInFrames <= 0) {
          return null;
        }

        return (
          <Sequence
            key={index}
            from={Math.round(startFrame)}
            durationInFrames={durationInFrames}
          >
            <CaptionPage page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
