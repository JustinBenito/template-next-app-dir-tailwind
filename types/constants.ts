import { z } from "zod";
export const COMP_NAME = "MyComp";

export const CompositionProps = z.object({
  src: z.string(),
  captions: z.array(z.object({
    text: z.string(),
    startMs: z.number(),
    endMs: z.number(),
    timestampMs: z.number().nullable().optional(),
    confidence: z.number().optional(),
  })).optional(),
  subtitleStyle: z.enum([
    "tiktok", "minimal", "neon", "retro", "elegant", 
    "aestheticGlow", "boldPop", "cyberWave", "pastelSoft", 
    "glassGlow", "cinematic", "dangerZone", "vaporwave", 
    "skyBlue", "funkyGraffiti", "luxeGold", "ghostWhite"
  ]).optional(),
});

export const defaultMyCompProps: z.infer<typeof CompositionProps> = {
  src: "https://storage.googleapis.com/tanglish/sample-video1.mp4",
  subtitleStyle: "tiktok",
};

export const DURATION_IN_FRAMES = 550;
export const VIDEO_WIDTH = 720;
export const VIDEO_HEIGHT = 1080;
export const VIDEO_FPS = 30;
