"use client";

import React, { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { Button } from  "../../components/Button";

// import { Player } from "@remotion/player";
import { loadFont } from "../../remotion/MyComp/load-font";
// import {
//   VIDEO_FPS,
// //   VIDEO_HEIGHT,
// //   VIDEO_WIDTH,
// } from "../../../types/constants";
// import { Main } from "../../remotion/MyComp/Main";
import { Caption } from "@remotion/captions";
// import { RenderControls } from "../../components/RenderControls";
import { ProgressModal } from "../../components/ProgressModal";
import Nav from "../../components/Navbar";
// import { SubtitleStyleSelector, SubtitleStyle, SubtitleStyleConfig, PRESET_STYLES } from "../../components/SubtitleStyleSelector";
// import { parseMedia } from '@remotion/media-parser';
// import Orb from '../../components/Orb';

// import Modal from "react-modal";
import FileUploader from "../../components/FileUploader";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Squares from '../../components/Squares';
import { RoughNotation } from "react-rough-notation";

const UploadPage: React.FC = () => {
  const [uploadedURL, setUploadedURL] = useState<string | null>(null);
  const [captions, setCaptions] = useState<Caption[]>([]);
//   const [selectedSubtitleStyle, setSelectedSubtitleStyle] = useState<SubtitleStyle>("tiktok");
//   const [customStyle, setCustomStyle] = useState<Partial<SubtitleStyleConfig>>({});
  const editorRef = useRef<HTMLDivElement>(null);
//   const [text, setText] = useState("");

  // Progress modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<"uploading" | "generating" | "rendering" | "done" | "error">("uploading");
  const [modalProgress, setModalProgress] = useState(0.1);
  const [modalError, setModalError] = useState<string | undefined>(undefined);

//   const [currentFrame] = useState(0);
//   const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');
//   const [durationInFrames, setDurationInFrames] = useState<number>(600);
//   const [showDurationWarning, setShowDurationWarning] = useState(false);

  const memImages = [
    "https://i.ibb.co/jYF2qNn/Screenshot-2025-06-28-at-12-35-45-PM.png"
  ];

//   // When user selects a preset, immediately apply it and clear custom style
//   const handlePresetSelect = (style: SubtitleStyle) => {
//     setSelectedSubtitleStyle(style);
//     setCustomStyle({});
//   };

//   // When user edits custom style, update and apply in real time
//   const handleCustomStyleChange = (style: Partial<SubtitleStyleConfig>) => {
//     setCustomStyle(style);
//   };

//   // The custom style controls should always show the current style values
//   const currentCustomStyle = React.useMemo(() => {
//     if (activeTab === 'custom') {
//       return customStyle;
//     }
//     return {};
//   }, [activeTab, customStyle]);

  // Always merge preset and custom style for the reel
//   const mergedStyle = React.useMemo(() => {
//     const preset = PRESET_STYLES[selectedSubtitleStyle];
//     return {
//       ...preset,
//       ...customStyle,
//       container: {
//         ...preset.container,
//         ...(customStyle.container || {}),
//       },
//     };
//   }, [selectedSubtitleStyle, customStyle]);

  const inputProps = React.useMemo(() => {
    return {
      src: uploadedURL!,
    //   durationInFrames: durationInFrames,
      captions: captions.map(c => ({
        text: c.text,
        startMs: c.startMs,
        endMs: c.endMs,
        timestampMs: c.timestampMs,
        confidence: c.confidence || undefined,
      })),
    //   subtitleStyle: selectedSubtitleStyle,
    //   subtitleStyleConfig: mergedStyle,
    };
  }, [uploadedURL, captions
    // , selectedSubtitleStyle, mergedStyle
]);

  // Animate progress bar for fun
  useEffect(() => {
    if (!modalOpen || modalStep === "done" || modalStep === "error") return;
    let raf: number;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = (now - start) / 1000;
      // Animate progress, but never reach 1 unless done
      let base = 0.1;
      if (modalStep === "uploading") base = 0.1 + 0.3 * Math.sin(elapsed * 1.2);
      if (modalStep === "generating") base = 0.4 + 0.2 * Math.sin(elapsed * 1.5);
      if (modalStep === "rendering") base = 0.6 + 0.3 * Math.sin(elapsed * 1.1);
      setModalProgress(Math.min(0.98, Math.abs(base)));
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [modalOpen, modalStep]);

//   useEffect(() => {
//     if (!uploadedURL) return;
//     parseMedia({
//       src: `https://pub-449b3b5dd7dc457e86e54d9c58eaa858.r2.dev/uploads/${uploadedURL}`,
//       fields: {
//         durationInSeconds: true,
//         dimensions: true,
//       },
//     })
//       .then((result) => {
//         if (result && result.durationInSeconds) {
//           setDurationInFrames(Math.ceil(result.durationInSeconds * VIDEO_FPS));
//           if (result.durationInSeconds > 45) {
//             // setShowDurationWarning(true);
//           }
//         }
//       })
//       .catch((err) => {
//         console.error('Failed to parse media', err);
//       });
//   }, [uploadedURL]);

  useEffect(() => {
    if (!uploadedURL) return;
    const fetchCaptions = async () => {
      setModalStep("generating");
      setModalOpen(true);
      setModalError(undefined);
      try {
        const res = await fetch(`/api/get-captions?url=${uploadedURL}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        if (data?.json) {
          await loadFont();
          setCaptions(data.json.map((c: Caption) => ({
            ...c,
            text: c.text.startsWith(" ") ? c.text : " " + c.text.trimStart(),
          })));
          setTimeout(() => {
            setModalStep("done");
            setModalProgress(1);
            setTimeout(() => setModalOpen(false), 1200);
          }, 800);
        } else {
          throw new Error("No captions returned");
        }
      } catch (err: unknown) {
        setModalStep("error");
        let message = "Failed to generate captions";
        if (err instanceof Error) message = err.message;
        setModalError(message);
      }
    };
    fetchCaptions();
  }, [uploadedURL]);

  // Editable paragraph UI
  const handleSpanEdit = (idx: number, value: string) => {
    // Always enforce a whitespace prefix
    let newText = value;
    if (!newText.startsWith(" ")) newText = " " + newText.trimStart();
    setCaptions(captions.map((c, i) => i === idx ? { ...c, text: newText } : c));
  };

  const handleDeleteCaption = (idx: number) => {
    setCaptions(captions.filter((_, i) => i !== idx));
  };

  const handleUploadComplete = (url: string) => {
    setModalStep("uploading");
    setModalOpen(true);
    setModalError(undefined);
    setUploadedURL(url);
  };


// Helper to get SRT file name from video URL
function getSrtFileNameFromUrl(url: string): string {
    // Extract the file name from the URL and replace extension with .srt
    const fileName = url.split('/').pop() || '';
    console.log("SRT FILE NAME GENERATED: ", fileName)
    return fileName.replace(/\.[^.]+$/, '.srt');
  }
  

  const handleStepIndex: Dispatch<SetStateAction<number>> = (stepIdx) => {
    const step = typeof stepIdx === 'function' ? stepIdx(0) : stepIdx;
    if (step === 0) {
      setModalStep("uploading");
    } else if (step === 1) {
      setModalStep("generating");
    } else if (step === 2) {
      setModalStep("rendering");
    }
  };

  return (
    <>
      <Nav onHomeClick={() => {
        setUploadedURL(null);
        setCaptions([]);
      }} />
      
      <div className="min-h-screen w-full bg-gradient-to-br from-[#f8f9fa] via-[#fff0f6] to-[#f8e1e7] dark:bg-gradient-to-br dark:from-[#18181b] dark:via-[#232326] dark:to-[#1a1a1a] flex flex-col items-center justify-center font-sans text-[#1A1A1A] dark:text-white">
        <ProgressModal
          open={modalOpen}
          step={modalStep}
          progress={modalProgress}
          errorMessage={modalError}
          memeUrl={memImages[0]}
          onClose={() => setModalOpen(false)}
        />

        {uploadedURL ? (
          <div className="relative max-w-8xl mt-36 w-full mx-auto mb-24 px-4">
            {/* Floating badge/icon */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20">
              <div className="bg-gradient-to-r from-[#a8324a] to-[#7b1f2b] text-white px-6 py-2 rounded-full shadow-lg text-sm md:text-lg font-bold tracking-wide flex items-center gap-2 border-2 border-white/80">
                Tanglish Audio Studio
              </div>
            </div>
            
            <div className="bg-white/80 dark:bg-[#232326]/80 backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-[#a8324a]/30 dark:border-[#8B4A47]/40 flex flex-col xl:flex-row gap-8 overflow-hidden transition-all justify-center duration-300 min-h-[800px]">
              {/* Left Column: Captions */}
              <div className="flex-1 p-8 flex flex-col gap-4 min-w-[300px]">
                <h2 className="text-2xl font-extrabold text-[#a8324a] dark:text-[#F5F1E8] mb-2 tracking-tight">Edit Captions</h2>
                <div
                  ref={editorRef}
                  className="notion-like-editor w-full min-h-[120px] bg-white/90 rounded-xl px-4 py-3 text-lg text-[#222] focus-within:ring-2 focus-within:ring-[#a8324a] dark:focus-within:ring-[#8B4A47] transition shadow border-gray-300 border-2"
                  style={{ outline: 'none', cursor: 'text', fontFamily: 'inherit', lineHeight: 1.7 }}
                  tabIndex={0}
                >
                  {captions.map((caption, idx) => (
                    <div key={caption.startMs + '-' + idx} className="relative inline-block mx-1 my-1 group" style={{ verticalAlign: 'middle' }}>
                      <span
                        contentEditable
                        suppressContentEditableWarning
                        className="inline-block px-1 py-0.5 rounded hover:bg-[#a8324a]/10 focus:bg-[#a8324a]/20 transition"
                        style={{ minWidth: 10, marginRight: 2, marginBottom: 2 }}
                        onBlur={e => handleSpanEdit(idx, e.currentTarget.textContent || "")}
                        onKeyDown={e => {
                          if (e.key === 'Backspace' && (e.currentTarget.textContent || "").length === 0) {
                            handleDeleteCaption(idx);
                            e.preventDefault();
                          }
                        }}
                      >
                        {caption.text.startsWith(" ") ? caption.text : " " + caption.text.trimStart()}
                      </span>
                      <span
                        contentEditable={false}
                        className="absolute left-1/2 -top-6 -translate-x-1/2 text-[#a8324a] border border-gray-300 bg-white rounded-md opacity-0 group-hover:opacity-100 transition text-sm font-semibold px-2 py-1 select-none cursor-pointer z-10 shadow-sm hover:bg-[#fbe9eb] active:bg-[#f5cfd5]"
                        style={{ userSelect: 'none', pointerEvents: 'auto' }}
                        onClick={ev => {
                          ev.stopPropagation();
                          handleDeleteCaption(idx);
                        }}
                        tabIndex={-1}
                        title="Delete caption"
                      >
                        ×
                      </span>
                    </div>
                  ))}
                </div>
                
                                  {/* Download SRT Button */}
                  {inputProps.src && (
                    <div className="mt-4 flex items-center justify-center ">
                      <a
                        href={`${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/uploads/${getSrtFileNameFromUrl(inputProps.src)}`}
                        download
                      >
                        <Button secondary className="px-8 py-4 text-lg font-bold rounded-xl">
                          Download .srt
                        </Button>
                      </a>
                    </div>
                  )}
              </div>



            </div>
          </div>
        ) : (
          <div className="relative min-h-screen w-full overflow-hidden bg-black">
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
              <Squares direction="diagonal" speed={0.5} borderColor="#222" squareSize={40} hoverFillColor="#222" />
            </div>
            
            {/* Content Container */}
            <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
              <div className="flex flex-col items-center justify-center space-y-6 text-center">
                {/* Header */}
                <div className='mt-24 items-center justify-center z-50 px-4 flex py-2 bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl rounded-full md:text-sm text-white text-[10px]'>
                  ⚡ 100% Free to use
                </div>

                <h1 className="max-w-4xl py-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-5xl font-bold text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
                  Stop wasting 
                  <RoughNotation type="underline" show={true} color='yellow' animate={true} padding={[0,0,-2,0]}>
                    <span> 4 </span>
                  </RoughNotation>
                  hours<br /> captioning your 
                  <RoughNotation type="underline" show={true} color='yellow' animate={true} padding={[0,0,-2,0]}>
                    <span> 40s </span>
                  </RoughNotation>
                  reels
                </h1>

                {/* Subtitle */}
                <p className="max-w-2xl text-lg text-gray-400/60 sm:text-xl">
                  Get your tanglish captions in seconds. <br /> Available in .srt and format
                </p>

                {/* FileUploader Component */}
                <div className="w-full mt-8 max-w-3xl">
                  <SignedIn>
                    <FileUploader
                      onUploadComplete={handleUploadComplete}
                      setShowModal={setModalOpen}
                      setStepIndex={handleStepIndex}
                    />
                  </SignedIn>
                  <SignedOut>
                    <div className="flex flex-col items-center justify-center gap-4 p-8 bg-white/10 rounded-xl border border-white/20 shadow-lg">
                      <p className="text-lg text-white font-semibold">Sign in to upload your video and generate captions!</p>
                      <SignInButton mode="modal">
                        <button className="bg-red-800 text-white px-6 py-2 rounded-full font-bold text-base hover:bg-red-700 transition">Sign in to upload</button>
                      </SignInButton>
                    </div>
                  </SignedOut>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <footer className="w-full text-center py-4 text-white text-sm bg-[#000000]">
        Built with <span style={{color:'#8B4A47'}}>🩵</span> by Justin
      </footer>
    </>
  );
};

export default UploadPage; 