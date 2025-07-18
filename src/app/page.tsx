"use client";

import { Player } from "@remotion/player";
import type { NextPage } from "next"
import React, { useMemo, useState, useEffect, useRef } from "react";
import { z } from "zod";
import { loadFont } from "../remotion/MyComp/load-font";
import {
  CompositionProps,
  DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../../types/constants";

import Hero from "../components/Hero";
import { Caption } from "@remotion/captions";
import { ProgressModal } from "../components/ProgressModal";
import Later from "../components/Demo";
import Nav from "../components/Navbar";

import { RenderControls } from "../components/RenderControls";
import { Spacing } from "../components/Spacing";
import { Tips } from "../components/Tips";
import { Main } from "../remotion/MyComp/Main";// Adjust path based on where your uploader is located
import HomePage from "../components/HomePage";


const Home: NextPage = () => {
  const [uploadedURL, setUploadedURL] = useState<string | null>(null);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");
  // Progress modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<"uploading" | "generating" | "rendering" | "done" | "error">("uploading");
  const [modalProgress, setModalProgress] = useState(0.1);
  const [modalError, setModalError] = useState<string | undefined>(undefined);

  const inputProps: z.infer<typeof CompositionProps> = useMemo(() => {
    return {
      src: uploadedURL!,
      captions,
    };
  }, [uploadedURL, captions]);

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

  const handleGenerateReel = async (url: string) => {
    console.log("Blog URL", url);
    // const res = await fetch(`/api/get-reel?url=${url}`);
    // const data = await res.json();
    // console.log(data);
    setUploadedURL(url);
  };

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
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f8f9fa] via-[#fff0f6] to-[#f8e1e7] flex flex-col items-center justify-center font-sans">
      <ProgressModal
        open={modalOpen}
        step={modalStep}
        progress={modalProgress}
        errorMessage={modalError}
        onClose={() => setModalOpen(false)}
      />
      {uploadedURL ? (
        <div className="relative max-w-5xl mt-36 w-full mx-auto  mb-24 px-4">
          {/* Floating badge/icon */}
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-gradient-to-r from-[#a8324a] to-[#7b1f2b] text-white px-6 py-2 rounded-full shadow-lg text-lg font-bold tracking-wide flex items-center gap-2 border-4 border-white/80">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
              Tanglish Reel Studio
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border-2 border-[#a8324a]/30 flex flex-col md:flex-row gap-0 overflow-hidden transition-all duration-300">
            {/* Captions */}
            <div className="flex-1 p-8 flex flex-col gap-4 min-w-[280px]">
              <h2 className="text-2xl font-extrabold text-[#a8324a] mb-2 tracking-tight">Edit Captions</h2>
              <div
                ref={editorRef}
                className="notion-like-editor w-full min-h-[120px] bg-white/70 rounded-xl px-4 py-3 text-lg text-[#222] focus-within:ring-2 focus-within:ring-[#a8324a] transition shadow border border-gray-200"
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
            {/* Divider */}
            <div className="w-px bg-gradient-to-b from-[#a8324a]/10 to-[#7b1f2b]/10 my-8 hidden md:block"></div>
            {/* Video + Render Controls */}
            <div className="flex-1 p-8 flex flex-col gap-8 min-w-[320px] items-center justify-center">
              <div className="overflow-hidden rounded-2xl shadow-xl bg-black flex flex-col items-center w-full">
                <Player
                  component={Main}
                  inputProps={inputProps}
                  durationInFrames={DURATION_IN_FRAMES}
                  fps={VIDEO_FPS}
                  compositionHeight={VIDEO_HEIGHT}
                  compositionWidth={VIDEO_WIDTH}
                  style={{ width: "100%", minHeight: 400 }}
                  controls
                />
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
                {/* <div className="bg-white/90 rounded-xl shadow-lg border border-gray-200 p-6 flex flex-col gap-4 items-center transition-all duration-300">
                  <h3 className="text-lg font-bold text-[#a8324a] mb-1">Render Your Video</h3>
                  <p className="text-gray-500 mb-2 text-center text-sm">Add a title or description and render your video using our powerful AWS Lambda backend.</p>
                  <div className="w-full flex flex-col md:flex-row gap-3 items-center justify-center">
                    <input
                      className="w-full md:w-2/3 rounded-lg border border-gray-300 bg-white/70 px-4 py-2 text-base text-[#222] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a8324a] focus:border-[#a8324a] transition shadow-sm"
                      placeholder="Enter a title or description..."
                      value={text}
                      onChange={e => setText(e.target.value)}
                      spellCheck={false}
                    />
                    <button
                      className="flex items-center gap-2 bg-gradient-to-r from-[#a8324a] to-[#7b1f2b] text-white font-semibold px-5 py-2.5 rounded-lg shadow-lg hover:from-[#7b1f2b] hover:to-[#a8324a] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#a8324a] text-base"
                      onClick={() => (document.querySelector('button[data-render-video]') as HTMLButtonElement | null)?.click()}
                      type="button"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" /></svg>
                      Render video
                    </button>
                  </div>
                  
                </div> */}
              </div>
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
        <Later />
        </>
      )}
    </div>
    </>
  );
};

export default Home;
