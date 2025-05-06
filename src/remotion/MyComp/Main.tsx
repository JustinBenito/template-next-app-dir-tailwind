"use client"
import { useEffect, useMemo, useState } from "react";
import {
  AbsoluteFill,
  Video,
  Sequence,
  CalculateMetadataFunction,
  continueRender,
  delayRender,
  useVideoConfig,
} from "remotion";

import { staticFile } from "remotion";

import {preloadVideo} from '@remotion/preload';
import { z } from "zod";
import SubtitlePage from "./SubtitlePage";
import { getVideoMetadata } from "@remotion/media-utils";
import { loadFont } from "./load-font";
import { Caption, createTikTokStyleCaptions } from "@remotion/captions";

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

const SWITCH_CAPTIONS_EVERY_MS = 200;

export const Main:React.FC<{
  src: string;
}> = ({ src }) => {

  console.log("Src:", src);
 
  const [subtitles, setSubtitles] = useState<Caption[] | null>(null);
  const [handle] = useState(() => delayRender());
  const { fps } = useVideoConfig();

  useEffect(() => {
    const prepareResources = async () => {
      try {
        preloadVideo(src);
        
        fetch(`https://pub-449b3b5dd7dc457e86e54d9c58eaa858.r2.dev/uploads/${src.replace(".mp4",".json")}`)
  .then(response => response.json())
  .then(dats => {

    console.log(dats)
    setSubtitles(dats);
    continueRender(handle)

    console.log(dats);
  })
  .catch(error => console.error('Error loading JSON:', error));

        if (subtitles) {
          console.log("Subs are there")
          await loadFont(); // Load font before rendering
          const parsedSubs = subtitles;
          setSubtitles(parsedSubs);
        }

        // Preload video while subtitles are being processed
        
        continueRender(handle);
      } catch (e) {
        console.error("Error during preparation", e);
      }
    };

    prepareResources();
  }, [src, handle]);

  const { pages } = useMemo(() => {
    return createTikTokStyleCaptions({
      combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
      captions: subtitles ?? [],
    });
  }, [subtitles]);


  return (
    <AbsoluteFill style={{ backgroundColor: "white" }}>
      <AbsoluteFill>
        <Video
          pauseWhenBuffering={true}
          acceptableTimeShiftInSeconds={0.01}
          style={{ objectFit: "cover" }}
          src={`https://pub-449b3b5dd7dc457e86e54d9c58eaa858.r2.dev/uploads/${src}`}
        />
      </AbsoluteFill>
      {pages.map((page, index) => {
        const nextPage = pages[index + 1] ?? null;
        const subtitleStartFrame = (page.startMs / 1000) * fps;
        const subtitleEndFrame = Math.min(
          nextPage ? (nextPage.startMs / 1000) * fps : Infinity,
          subtitleStartFrame + SWITCH_CAPTIONS_EVERY_MS
        );
        const durationInFrames = subtitleEndFrame - subtitleStartFrame;
        if (durationInFrames <= 0) return null;

        return (
          <Sequence
            key={index}
            from={subtitleStartFrame}
            durationInFrames={durationInFrames}
          >
            <SubtitlePage page={page} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
