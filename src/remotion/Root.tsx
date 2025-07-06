import { Composition } from "remotion";
import { Main } from "./MyComp/Main";
import {
  COMP_NAME,
  defaultMyCompProps,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../../types/constants";
import {parseMedia} from '@remotion/media-parser';


export const RemotionRoot: React.FC = () => {

  return (
    <>
      <Composition
        id={COMP_NAME}
        component={Main}
        durationInFrames={300}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={defaultMyCompProps}
        calculateMetadata={async ({props}) => {
          const {slowDurationInSeconds} = await parseMedia({
            src: `https://pub-449b3b5dd7dc457e86e54d9c58eaa858.r2.dev/uploads/${props.src}`,
            fields: {slowDurationInSeconds: true},
          });
   
          return {
            durationInFrames: Math.floor(slowDurationInSeconds * 30),
          };
        }}
      />
    </>
  );
};
