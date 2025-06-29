"use client"

import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { TheBoldFont } from "./load-font";
import { fitText } from "@remotion/layout-utils";
import { makeTransform, scale, translateY } from "@remotion/animation-utils";
import { TikTokPage } from "@remotion/captions";
import { SubtitleStyleConfig } from "../../components/SubtitleStyleSelector";

const fontFamily = TheBoldFont;

// Style configurations
const STYLES = {
  tiktok: {
    container: { justifyContent: "center", alignItems: "center", bottom: 350, height: 150, left: undefined, top: undefined },
    fontSize: 220,
    highlightColor: "#39E508",
    strokeWidth: "20px",
    strokeColor: "black",
    textTransform: "uppercase" as const,
  },
  minimal: {
    container: { justifyContent: "center", alignItems: "center", bottom: 400, height: 120, left: undefined, top: undefined },
    fontSize: 180,
    highlightColor: "#ffffff",
    strokeWidth: "0px",
    strokeColor: "transparent",
    textTransform: "none" as const,
  },
  neon: {
    container: { justifyContent: "center", alignItems: "center", bottom: 350, height: 150, left: undefined, top: undefined },
    fontSize: 200,
    highlightColor: "#00ffff",
    strokeWidth: "8px",
    strokeColor: "#00ffff",
    textTransform: "uppercase" as const,
  },
  retro: {
    container: { justifyContent: "center", alignItems: "center", bottom: 350, height: 150, left: undefined, top: undefined },
    fontSize: 190,
    highlightColor: "#ff6b35",
    strokeWidth: "12px",
    strokeColor: "#2c1810",
    textTransform: "uppercase" as const,
  },
  elegant: {
    container: { justifyContent: "center", alignItems: "center", bottom: 380, height: 140, left: undefined, top: undefined },
    fontSize: 170,
    highlightColor: "#f8f9fa",
    strokeWidth: "3px",
    strokeColor: "#343a40",
    textTransform: "none" as const,
  },

  aestheticGlow: {
    container: { justifyContent: "center", alignItems: "center", bottom: 340, height: 150, left: undefined, top: undefined },
    fontSize: 200,
    highlightColor: "#ffffff",
    strokeWidth: "6px",
    strokeColor: "#ffc0cb",
    textTransform: "capitalize" as const,
  },
  boldPop: {
    container: { justifyContent: "center", alignItems: "center", bottom: 360, height: 150, left: undefined, top: undefined },
    fontSize: 220,
    highlightColor: "#ffdd00",
    strokeWidth: "14px",
    strokeColor: "#000000",
    textTransform: "uppercase" as const,
  },
  cyberWave: {
    container: { justifyContent: "center", alignItems: "center", bottom: 330, height: 150, left: undefined, top: undefined },
    fontSize: 210,
    highlightColor: "#00f0ff",
    strokeWidth: "10px",
    strokeColor: "#0f0f0f",
    textTransform: "uppercase" as const,
  },
  pastelSoft: {
    container: { justifyContent: "center", alignItems: "center", bottom: 370, height: 140, left: undefined, top: undefined },
    fontSize: 180,
    highlightColor: "#fde2e4",
    strokeWidth: "4px",
    strokeColor: "#fcd5ce",
    textTransform: "capitalize" as const,
  },
  glassGlow: {
    container: { justifyContent: "center", alignItems: "center", bottom: 340, height: 150, left: undefined, top: undefined },
    fontSize: 200,
    highlightColor: "#e0f7fa",
    strokeWidth: "6px",
    strokeColor: "rgba(255, 255, 255, 0.4)",
    textTransform: "uppercase" as const,
  },
  cinematic: {
    container: { justifyContent: "center", alignItems: "center", bottom: 320, height: 160, left: undefined, top: undefined },
    fontSize: 200,
    highlightColor: "#ffffff",
    strokeWidth: "10px",
    strokeColor: "#000000",
    textTransform: "uppercase" as const,
  },
  dangerZone: {
    container: { justifyContent: "center", alignItems: "center", bottom: 350, height: 150, left: undefined, top: undefined },
    fontSize: 220,
    highlightColor: "#ff1744",
    strokeWidth: "10px",
    strokeColor: "#000000",
    textTransform: "uppercase" as const,
  },
  vaporwave: {
    container: { justifyContent: "center", alignItems: "center", bottom: 340, height: 150, left: undefined, top: undefined },
    fontSize: 200,
    highlightColor: "#ff77ff",
    strokeWidth: "6px",
    strokeColor: "#00ffee",
    textTransform: "uppercase" as const,
  },
  skyBlue: {
    container: { justifyContent: "center", alignItems: "center", bottom: 360, height: 140, left: undefined, top: undefined },
    fontSize: 190,
    highlightColor: "#bbf0ff",
    strokeWidth: "5px",
    strokeColor: "#1e90ff",
    textTransform: "capitalize" as const,
  },
  funkyGraffiti: {
    container: { justifyContent: "center", alignItems: "center", bottom: 340, height: 150, left: undefined, top: undefined },
    fontSize: 210,
    highlightColor: "#fffd00",
    strokeWidth: "12px",
    strokeColor: "#ff0080",
    textTransform: "uppercase" as const,
  },
  luxeGold: {
    container: { justifyContent: "center", alignItems: "center", bottom: 330, height: 150, left: undefined, top: undefined },
    fontSize: 200,
    highlightColor: "#ffd700",
    strokeWidth: "6px",
    strokeColor: "#000000",
    textTransform: "uppercase" as const,
  },
  ghostWhite: {
    container: { justifyContent: "center", alignItems: "center", bottom: 370, height: 140, left: undefined, top: undefined },
    fontSize: 180,
    highlightColor: "#f8f8ff",
    strokeWidth: "4px",
    strokeColor: "#d3d3d3",
    textTransform: "capitalize" as const,
  },
};


export type SubtitleStyle = keyof typeof STYLES;

export const Page: React.FC<{
  readonly enterProgress: number;
  readonly page: TikTokPage;
  readonly style?: SubtitleStyle;
  readonly styleConfig?: SubtitleStyleConfig;
}> = ({ enterProgress, page, style = "tiktok", styleConfig }) => {
  const frame = useCurrentFrame();
  const { width, fps } = useVideoConfig();
  const timeInMs = (frame / fps) * 1000;

  const currentStyle = styleConfig || STYLES[style];

  const fittedText = fitText({
    fontFamily,
    text: page.text,
    withinWidth: width * 0.9,
    textTransform: currentStyle.textTransform,
  });

  const fontSize = Math.min(currentStyle.fontSize, fittedText.fontSize);

  return (
    <AbsoluteFill>
      <div
        style={{
          fontSize,
          color: "white",
          WebkitTextStroke: `${currentStyle.strokeWidth} ${currentStyle.strokeColor}`,
          paintOrder: "stroke",
          transform: makeTransform([
            scale(interpolate(enterProgress, [0, 1], [0.8, 1])),
            translateY(interpolate(enterProgress, [0, 1], [50, 0])),
          ]),
          fontFamily,
          textTransform: currentStyle.textTransform,
          position: 'absolute',
          left: currentStyle.container.left ?? 0,
          top: currentStyle.container.top ?? 0,
          justifyContent: currentStyle.container.justifyContent,
          alignItems: currentStyle.container.alignItems,
          display: 'flex',
          width: '100%',
        }}
      >
        <span
          style={{
            transform: makeTransform([
              scale(interpolate(enterProgress, [0, 1], [0.8, 1])),
              translateY(interpolate(enterProgress, [0, 1], [50, 0])),
            ]),
          }}
        >
          {page.tokens.map((t, idx) => {
            const startRelativeToSequence = t.fromMs - page.startMs;
            const endRelativeToSequence = t.toMs - page.startMs;

            const active =
              startRelativeToSequence <= timeInMs &&
              endRelativeToSequence > timeInMs;

            return (
              <span
                key={`${startRelativeToSequence}-${idx}`}
                style={{
                  display: "inline",
                  whiteSpace: "pre",
                  color: active ? currentStyle.highlightColor : "white",
                }}
              >
                {t.text.startsWith(" ") ? t.text : " " + t.text.trimStart()}
              </span>
            );
          })}
        </span>
      </div>
    </AbsoluteFill>
  );
};
