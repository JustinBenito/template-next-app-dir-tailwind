"use client"
import React from "react";
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Page, SubtitleStyle } from "./Page";
import { TikTokPage } from "@remotion/captions";
import { SubtitleStyleConfig } from "../../components/SubtitleStyleSelector";

const SubtitlePage: React.FC<{ 
  readonly page: TikTokPage;
  readonly style?: SubtitleStyle;
  readonly styleConfig?: SubtitleStyleConfig;
}> = ({ page, style, styleConfig }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({
    frame,
    fps,
    config: {
      damping: 200,
    },
    durationInFrames: 5,
  });

  return (
    <AbsoluteFill>
      <Page enterProgress={enter} page={page} style={style} styleConfig={styleConfig} />
    </AbsoluteFill>
  );
};

export default SubtitlePage;
