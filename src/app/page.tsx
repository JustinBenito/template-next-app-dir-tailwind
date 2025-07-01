"use client";

import { Player } from "@remotion/player";
import type { NextPage } from "next"
import React, { useMemo, useState, useEffect, useRef } from "react";
import { loadFont } from "../remotion/MyComp/load-font";
import {
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../../types/constants";
import { Main } from "../remotion/MyComp/Main";
import Hero from "../components/Hero";
import { Caption } from "@remotion/captions";
import { RenderControls } from "../components/RenderControls";
import { ProgressModal } from "../components/ProgressModal";

import Nav from "../components/Navbar";
import { SubtitleStyleSelector, SubtitleStyle, SubtitleStyleConfig, PRESET_STYLES } from "../components/SubtitleStyleSelector";
import { parseMedia } from '@remotion/media-parser';
import Orb from '../components/Orb';
import TextCursor from '../components/TextCursor';

// interface TextPressureProps {
//   text: string;
//   textColor?: string;
//   minFontSize?: number;
// }

// const TextPressure: React.FC<TextPressureProps> = ({ text, textColor = "#ffffff", minFontSize = 36 }) => {
//   return (
//     <div style={{
//       fontSize: `${minFontSize}px`,
//       fontWeight: '600',
//       color: textColor,
//       letterSpacing: '-0.025em',
//       lineHeight: '1.2'
//     }}>
//       {text}
//     </div>
//   );
// };

const Home: NextPage = () => {
  const [uploadedURL, setUploadedURL] = useState<string | null>(null);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [selectedSubtitleStyle, setSelectedSubtitleStyle] = useState<SubtitleStyle>("tiktok");
  const [customStyle, setCustomStyle] = useState<Partial<SubtitleStyleConfig>>({});
  const editorRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");

  // Progress modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<"uploading" | "generating" | "rendering" | "done" | "error">("uploading");
  const [modalProgress, setModalProgress] = useState(0.1);
  const [modalError, setModalError] = useState<string | undefined>(undefined);

  const [currentFrame] = useState(0);

  const [activeTab, setActiveTab] = useState<'preset' | 'custom'>('preset');

  const [durationInFrames, setDurationInFrames] = useState<number>(600);

  // When user selects a preset, immediately apply it and clear custom style
  const handlePresetSelect = (style: SubtitleStyle) => {
    setSelectedSubtitleStyle(style);
    setCustomStyle({});
  };

  // When user edits custom style, update and apply in real time
  const handleCustomStyleChange = (style: Partial<SubtitleStyleConfig>) => {
    setCustomStyle(style);
  };

  // The custom style controls should always show the current style values
  const currentCustomStyle = useMemo(() => {
    if (activeTab === 'custom') {
      return customStyle;
    }
    return {};
  }, [activeTab, customStyle]);

  // Always merge preset and custom style for the reel
  const mergedStyle = useMemo(() => {
    const preset = PRESET_STYLES[selectedSubtitleStyle];
    return {
      ...preset,
      ...customStyle,
      container: {
        ...preset.container,
        ...(customStyle.container || {}),
      },
    };
  }, [selectedSubtitleStyle, customStyle]);

  const inputProps = useMemo(() => {
    return {
      src: uploadedURL!,
      captions: captions.map(c => ({
        text: c.text,
        startMs: c.startMs,
        endMs: c.endMs,
        timestampMs: c.timestampMs,
        confidence: c.confidence || undefined,
      })),
      subtitleStyle: selectedSubtitleStyle,
      subtitleStyleConfig: mergedStyle,
    };
  }, [uploadedURL, captions, selectedSubtitleStyle, mergedStyle]);

  const memImages = [
    "https://i.ibb.co/jYF2qNn/Screenshot-2025-06-28-at-12-35-45-PM.png"
  ]

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

  useEffect(() => {
    if (!uploadedURL) return;
    parseMedia({
      src: `https://pub-449b3b5dd7dc457e86e54d9c58eaa858.r2.dev/uploads/${uploadedURL}`,
      fields: {
        durationInSeconds: true,
        dimensions: true,
      },
    })
      .then((result) => {
        if (result && result.durationInSeconds) {
          setDurationInFrames(Math.ceil(result.durationInSeconds * VIDEO_FPS));
        }
      })
      .catch((err) => {
        console.error('Failed to parse media', err);
      });
  }, [uploadedURL]);

  useEffect(() => {
    if (!uploadedURL) return;
    const fetchCaptions = async () => {
      setModalStep("generating");
      setModalOpen(true);
      setModalError(undefined);
      try {
        const res = await fetch(`/api/get-captions?url=${uploadedURL}`);
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

  return (
    <>
    <Nav onHomeClick={() => {
      setUploadedURL(null);
      setCaptions([]);
      setText("");
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
            <div className="bg-gradient-to-r from-[#a8324a] to-[#7b1f2b] text-white px-6 py-2 rounded-full shadow-lg text-sm  md:text-lg font-bold tracking-wide flex items-center gap-2 border-2 border-white/80">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
              Tanglish Reel Studio
            </div>
          </div>
          <div className="bg-white/80 dark:bg-[#232326]/80 backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-[#a8324a]/30 dark:border-[#8B4A47]/40 flex flex-col xl:flex-row gap-8 overflow-hidden transition-all duration-300 min-h-[800px]">
            {/* Left Column: Captions */}
            <div className="flex-1 p-8 flex flex-col gap-4 min-w-[300px]">
              <h2 className="text-2xl font-extrabold text-[#a8324a] dark:text-[#F5F1E8] mb-2 tracking-tight">Edit Captions</h2>
              <div
                ref={editorRef}
                className="notion-like-editor w-full min-h-[120px] bg-white/90  rounded-xl px-4 py-3 text-lg text-[#222] focus-within:ring-2 focus-within:ring-[#a8324a] dark:focus-within:ring-[#8B4A47] transition shadow  border-gray-300 border-2"
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
            </div>
            
            {/* Middle Column: Video + Render Controls */}
            <div className="flex-1 p-8 flex flex-col gap-8 min-w-[400px] items-center justify-start">
              <div className="relative w-full min-h-[500px] flex items-center justify-center overflow-hidden rounded-2xl shadow-xl bg-black dark:bg-[#18181b]">
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <Orb
                    hoverIntensity={0.5}
                    rotateOnHover={true}
                    hue={0}
                    forceHoverState={false}
                  />
                </div>
                <div className="relative z-10 w-full">
                  <Player
                    component={Main}
                    inputProps={inputProps}
                    durationInFrames={durationInFrames}
                    fps={VIDEO_FPS}
                    compositionHeight={VIDEO_HEIGHT}
                    compositionWidth={VIDEO_WIDTH}
                    style={{ width: "100%", minHeight: 500 }}
                    controls
                    inFrame={currentFrame}
                  />
                </div>
              </div>
              {/* Render Controls */}
              <div className="w-full mt-2">
              <div className="w-full mt-4">
                    <RenderControls
                      text={text}
                      setText={setText}
                      inputProps={inputProps}
                    />
              </div>
              </div>
            </div>

            {/* Right Column: Subtitle Style Editor */}
            <div className="flex-1 p-8 flex flex-col gap-4 min-w-[350px]">
              <SubtitleStyleSelector
                selectedStyle={selectedSubtitleStyle}
                onStyleChange={handlePresetSelect}
                customStyle={currentCustomStyle}
                onCustomStyleChange={handleCustomStyleChange}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            </div>
          </div>
        </div>
      ) : (
      <>
        <Hero
          onUploadComplete={url => {
            setModalStep("uploading");
            setModalOpen(true);
            setModalError(undefined);
            setUploadedURL(url);
          }}
          setShowModal={setModalOpen}
          setStepIndex={stepIdx => {
            if (stepIdx === 0) {
              setModalStep("uploading");
            } else if (stepIdx === 1) {
              setModalStep("generating");
            } else if (stepIdx === 2) {
              setModalStep("rendering");
            }
          }}
        />
            <div className="bg-black text-white min-h-screen w-full">
      <section className="max-w-6xl mx-auto px-8 py-24">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Left Content */}
          <div className="flex-1 space-y-6">
            <div className="space-y-2" style={{ position: 'relative', width: 'fit-content' }}>
              {/* Red radial gradient highlight */}
              <div
                className="absolute left-1/2 top-1/2 z-0"
                style={{
                  transform: 'translate(-50%, -50%)',
                  width: '420px',
                  height: '480px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(139,74,71,0.32) 0%, rgba(139,74,71,0.12) 60%, transparent 100%)',
                  filter: 'blur(24px)',
                  pointerEvents: 'none',
                }}
              />
              <h2 className="text-7xl font-bold">Cut time spent by 99%</h2>
              <div style={{ width: '100%', height: '80px', position: 'relative' }}>
                {/* Animated Text Cursor Effect */}
                <TextCursor
                  text="⏳"
                  delay={0.01}
                  spacing={800}
                  followMouseDirection={true}
                  randomFloat={true}
                  exitDuration={3}
                  removalInterval={20}
                  maxPoints={20}
                />
              </div>
            </div>
            
            <p className="text-lg text-gray-400 leading-relaxed max-w-md">
              Loads of styles to choose from,<br />
              find your unique flavor
            </p>
          </div>
          
          {/* Right Video */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <div className="relative">
              {/* Beautiful glow effect */}
              <div className="absolute -inset-8 bg-gradient-to-r from-purple-600/20 via-blue-500/20 to-cyan-400/20 rounded-3xl blur-2xl opacity-75"></div>
              
              {/* Video container */}
              <div className="relative">
                <video
                  src="/sample-video.mp4"
                  controls
                  className="w-80 h-auto rounded-2xl shadow-2xl border border-white/20"
                  style={{ aspectRatio: '9/16' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
        </>
      )}
    </div>
    <footer className="w-full text-center py-4 text-white text-sm bg-[#000000]">
      Built with <span style={{color:'#8B4A47'}}>🩵</span> by Justin
    </footer>
    </>
  );
};

export default Home;
