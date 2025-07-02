"use client"
import { useEffect, useMemo, useState, useRef } from "react";
import {
  AbsoluteFill,
  Video,
  Sequence,
  CalculateMetadataFunction,
  continueRender,
  delayRender,
  useVideoConfig,
} from "remotion";
import { z } from "zod";
import SubtitlePage from "./SubtitlePage";
import { getVideoMetadata } from "@remotion/media-utils";
import { loadFont } from "./load-font";
import { Caption, createTikTokStyleCaptions } from "@remotion/captions";
import {prefetch} from 'remotion';
import { SubtitleStyleConfig } from "../../components/SubtitleStyleSelector";
// import type {PrefetchOnProgress} from 'remotion';

export type SubtitleProp = {
  startInSeconds: number;
  text: string;
};

export const captionedVideoSchema = z.object({
  src: z.string(),
});

export const calculateCaptionedVideoMetadata: CalculateMetadataFunction<
  z.infer<typeof captionedVideoSchema>
> = async ({ props }) => {
  const fps = 30;
  const metadata = await getVideoMetadata(props.src);

  return {
    fps,
    durationInFrames: Math.floor(metadata.durationInSeconds * fps),
  };
};

const SWITCH_CAPTIONS_EVERY_MS = 800;

export const Main:React.FC<{
  src: string;
  captions?: {
    text: string;
    startMs: number;
    endMs: number;
    timestampMs?: number | null;
    confidence?: number;
  }[];
  subtitleStyle?: "tiktok" | "minimal" | "neon" | "retro" | "elegant" | 
    "aestheticGlow" | "boldPop" | "cyberWave" | "pastelSoft" | 
    "glassGlow" | "cinematic" | "dangerZone" | "vaporwave" | 
    "skyBlue" | "funkyGraffiti" | "luxeGold" | "ghostWhite";
  subtitleStyleConfig?: SubtitleStyleConfig;
}> = ({ src, captions, subtitleStyle = "tiktok", subtitleStyleConfig }) => {
  const [subtitles, setSubtitles] = useState<Caption[] | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [handle] = useState(() => delayRender());
  const { fps } = useVideoConfig();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const prepareResources = async () => {
      const timeout = setTimeout(() => {
        console.error("Timeout: prepareResources took too long.");
        continueRender(handle); // failsafe to avoid permanent hang
      }, 15000); // fallback after 15s
  
      try {
        await loadFont();
  
        if (captions && captions.length > 0) {
          setSubtitles(captions as Caption[]);
          setIsReady(true);
          continueRender(handle);
          clearTimeout(timeout);
          return;
        }
  
        const { waitUntilDone } = prefetch(
          `https://pub-449b3b5dd7dc457e86e54d9c58eaa858.r2.dev/uploads/${src}`,
          { method: "blob-url" }
        );
  
        const result = await Promise.race([
          Promise.all([
            fetch(
              `https://pub-449b3b5dd7dc457e86e54d9c58eaa858.r2.dev/uploads/${src.replace(
                ".mp4",
                ".json"
              )}`
            ),
            waitUntilDone(),
          ]),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Promise race timeout")), 10000)
          ),
        ]);
        
        const [subtitleResponse] = result as [Response, void]; // ✅ Type assertion
        
  
        const data = await subtitleResponse.json();
        setSubtitles(data);
        setIsReady(true);
        continueRender(handle);
      } catch (e) {
        console.error("Error during preparation", e);
        continueRender(handle); // prevent render hang even if there's an error
      } finally {
        clearTimeout(timeout);
      }
    };
  
    prepareResources();
  }, [src, captions, handle]);
  

  const { pages } = useMemo(() => {
    if (!subtitles) return { pages: [] };
    return createTikTokStyleCaptions({
      combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
      captions: subtitles,
    });
  }, [subtitles]);

  if (!isReady) {
    return null;
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      <AbsoluteFill>
        <Video
          ref={videoRef}
          pauseWhenBuffering={true}
          acceptableTimeShiftInSeconds={0.5}
          style={{ 
            objectFit: "cover",
            width: "100%",
            height: "100%",
          }}
          src={`https://pub-449b3b5dd7dc457e86e54d9c58eaa858.r2.dev/uploads/${src}`}
          onLoadedData={() => {
            if (videoRef.current) {
              videoRef.current.playbackRate = 1;
            }
          }}
        />
      </AbsoluteFill>
      {pages.map((page, index) => {
        const nextPage = pages[index + 1] ?? null;
        const subtitleStartFrame = Math.floor(((page.startMs) / 1000) * fps);
        const subtitleEndFrame = Math.max(
          nextPage ? Math.floor((nextPage.startMs / 1000) * fps) : Infinity,
          Math.max(
            subtitleStartFrame + Math.floor((SWITCH_CAPTIONS_EVERY_MS / 1000) * fps)
          )
        );

        const durationInFrames = subtitleEndFrame - subtitleStartFrame;
        
        if (durationInFrames <= 0) return null;

        return (
          <Sequence
            key={`${index}-${subtitleStartFrame}`}
            from={subtitleStartFrame}
            durationInFrames={durationInFrames}
          >
            <SubtitlePage page={page} style={subtitleStyle} styleConfig={subtitleStyleConfig} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
