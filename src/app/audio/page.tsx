import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AudioPage() {
  const params = useSearchParams();
  const src = params.get("src");
  const [captions, setCaptions] = useState<{ text: string }[]>([]);
  const [srtUrl, setSrtUrl] = useState("");

  useEffect(() => {
    if (!src) return;
    // Fetch captions JSON (placeholder path)
    fetch(`/cloudflare/path/${src.replace(/\.[^.]+$/, ".json")}`)
      .then(res => res.json())
      .then(data => setCaptions(data));
    // Set SRT download URL (placeholder path)
    setSrtUrl(`/cloudflare/path/${src.replace(/\.[^.]+$/, ".srt")}`);
  }, [src]);

  // Convert captions to paragraph
  const paragraph = captions.map((c) => c.text).join(" ");

  return (
    <div>
      <audio controls src={`/cloudflare/path/${src}`} />
      <div style={{ margin: "1em 0" }}>
        <strong>Transcript:</strong>
        <p>{paragraph}</p>
      </div>
      <a href={srtUrl} download>
        <button>Download .srt</button>
      </a>
    </div>
  );
} 