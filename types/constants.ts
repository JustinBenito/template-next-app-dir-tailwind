import { staticFile } from "remotion";
import { z } from "zod";
export const COMP_NAME = "MyComp";
// import { staticFile } from "remotion";

export const CompositionProps = z.object({
  title: z.string(),
  src: z.string()
});

export const defaultMyCompProps: z.infer<typeof CompositionProps> = {
  title: "h",
  src: staticFile("/sample-video.mp4")
};

export const DURATION_IN_FRAMES = 550;
export const VIDEO_WIDTH = 720;
export const VIDEO_HEIGHT = 1080;
export const VIDEO_FPS = 30;
