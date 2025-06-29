"use client";

import { useRef } from 'react';
import FileUploader from './FileUploader';
import { Dispatch, SetStateAction } from 'react';
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Squares from './Squares';
import { RoughNotation } from "react-rough-notation";

type HeroProps = {
  onUploadComplete: (url: string) => void;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  setStepIndex: Dispatch<SetStateAction<number>>;
};

export default function Hero({ onUploadComplete, setShowModal, setStepIndex }: HeroProps) {
    const orbitRef = useRef<HTMLDivElement>(null);

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-black">
            {/* Animated Background Gradient */}
             <div className="absolute inset-0 w-full h-full z-0 pointer-events-none">
                <Squares direction="diagonal" speed={0.5} borderColor="#222" squareSize={40} hoverFillColor="#222" />
            </div>
            <div 
                ref={orbitRef}
                className="absolute translate-x-[5] translate-y-2 -left-1/4 -top-1/4 h-[150%] w-[150%] "
                style={{
                    background: `radial-gradient(circle at 30% 30%, #D62828 0%, transparent 90%)`,
                    opacity: 0.25,
                    filter: 'blur(100px)',
                }}
            />

            {/* Squares Animated Grid Background */}
           

            {/* Content Container */}
            <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center space-y-6 text-center">
                    {/* Header */}

                    <div className='mt-24 items-center justify-center z-50 px-4   flex py-2  bg-white/10 backdrop-blur-lg border border-white/20  shadow-xl rounded-full md:text-sm text-white text-[10px]'>
                        ⚡ 100% Free to use
                    </div>

                    <h1 className="max-w-4xl  py-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-5xl font-bold text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
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
                          onUploadComplete={onUploadComplete}
                          setShowModal={setShowModal}
                          setStepIndex={setStepIndex}
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
    );
}
