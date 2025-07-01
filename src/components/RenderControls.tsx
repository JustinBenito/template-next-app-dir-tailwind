import { z } from "zod";
import { AlignEnd } from "./AlignEnd";
import { Button } from "./Button";
import { InputContainer } from "./Container";
import { DownloadButton } from "./DownloadButton";
import { ErrorComp } from "./Error";
import { Input } from "./Input";
import { ProgressBar } from "./ProgressBar";
import { Spacing } from "./Spacing";
import { COMP_NAME, CompositionProps } from "../../types/constants";
import { useRendering } from "../helpers/use-rendering";

export const RenderControls: React.FC<{
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  inputProps: z.infer<typeof CompositionProps>;
}> = ({ text, setText, inputProps }) => {
  const { renderMedia, state, undo } = useRendering(COMP_NAME, inputProps);

  return (
    <InputContainer>
      {state.status === "init" ||
      state.status === "invoking" ||
      state.status === "error" ? (
        <>
          <Input
            disabled={state.status === "invoking"}
            setText={setText}
            text={text}
          ></Input>
          <Spacing></Spacing>
          <AlignEnd>
            <div className="flex gap-3">
              <Button
                disabled={state.status === "invoking"}
                loading={state.status === "invoking"}
                onClick={renderMedia}
              >
                Render video
              </Button>
              {/* Download SRT Button */}
              {inputProps.src && (
                <a
                  href={`public/downloads/${getSrtFileNameFromUrl(inputProps.src)}`}
                  download
                >
                  <Button secondary disabled={state.status === "invoking"}>
                    Download .srt
                  </Button>
                </a>
              )}
            </div>
          </AlignEnd>
          {state.status === "error" ? (
            <ErrorComp message={state.error.message}></ErrorComp>
          ) : null}
        </>
      ) : null}
      {state.status === "rendering" || state.status === "done" ? (
        <>
          <ProgressBar
            progress={state.status === "rendering" ? state.progress : 1}
          />
          <Spacing></Spacing>
          <AlignEnd>
            <DownloadButton undo={undo} state={state}></DownloadButton>
          </AlignEnd>
        </>
      ) : null}
    </InputContainer>
  );
};

// Helper to get SRT file name from video URL
function getSrtFileNameFromUrl(url: string): string {
  // Extract the file name from the URL and replace extension with .srt
  const fileName = url.split('/').pop() || '';
  return fileName.replace(/\.[^.]+$/, '.srt');
}
