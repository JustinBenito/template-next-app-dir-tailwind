"use client";

import React, { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { CloudArrowUp } from "@phosphor-icons/react";

type FileDropProps = {
  onUploadComplete: (url: string) => void;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  setStepIndex: Dispatch<SetStateAction<number>>;
};

export default function FileDrop({ onUploadComplete, setShowModal, setStepIndex }: FileDropProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileURL, setFileURL] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedURL, setUploadedURL] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleFile = (incomingFile: File) => {
    console.log(incomingFile.type)
    if (!incomingFile.type.startsWith("video/") && !incomingFile.type.startsWith("audio/")) {
      alert("Only video and audio files are allowed.");
      return;
    }

    if (incomingFile.size > MAX_FILE_SIZE) {
      alert("File size exceeds 50MB limit.");
      return;
    }

    setFile(incomingFile);
    const url = URL.createObjectURL(incomingFile);
    setFileURL(url);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    return () => {
      if (fileURL) {
        URL.revokeObjectURL(fileURL);
      }
    };
  }, [fileURL]);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setShowModal(true);
    setStepIndex(0); // Uploading
    try {
      // Step 1: Uploading
      setStepIndex(0);
      const res = await fetch("/api/upload-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
        }),
      });
      if (!res.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, fileUrl } = await res.json();
      // Step 2: Upload file
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");
      setStepIndex(0); // Still uploading
      // Step 3: Simulate delay for fun
      await new Promise((resolve) => setTimeout(resolve, 800));
      setUploadedURL(fileUrl);
      onUploadComplete(fileUrl); // Parent will handle next steps
    } catch {
      setShowModal(false);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div
        className={`relative w-full max-w-xl text-black rounded-lg border-2 border-dashed p-8 flex flex-col items-center justify-center transition-all
          backdrop-blur-md cursor-pointer
          ${isDragging ? "border-red-400 bg-yellow-100/20" : "border-gray-300/30 bg-white/5"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-2 rounded-full p-4">
            <CloudArrowUp className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-white/70">
            {file ? "File ready to submit" : "Upload your video or audio"}
          </h3>
          <p className="mb-4 text-sm text-white/50">
            {file
              ? `${file.name} (${(file.size / 1024).toFixed(2)} KB)`
              : "Drag and drop your video/audio file here (max 50MB), or click to browse"}
          </p>
          {file && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleUpload();
              }}
              disabled={isUploading}
              className="rounded-md bg-yellow-400 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              {isUploading ? "Uploading..." : "Submit File"}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {uploadedURL && (
        <div className="mt-6 w-full max-w-xl">
          {/* <p className="text-white">Uploaded Video URL:</p> */}
          {/* <a href={uploadedURL} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
            {uploadedURL}
          </a> */}
          <video controls className="mt-4 rounded-xl w-full">
            <source src={`https://pub-449b3b5dd7dc457e86e54d9c58eaa858.r2.dev/uploads/${uploadedURL}`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
}