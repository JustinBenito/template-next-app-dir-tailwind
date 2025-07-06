import { GoogleGenAI } from '@google/genai';
import { createUserContent } from '@google/genai';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- SRT GENERATION HELPERS (moved outside handler) ---
type Caption = {
  text: string;
  startMs: number;
  endMs: number;
  timestampMs?: number;
  confidence?: number;
};

function msToSrtTime(ms: number): string {
  const date = new Date(ms);
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  const milliseconds = String(ms % 1000).padStart(3, '0');
  return `${hours}:${minutes}:${seconds},${milliseconds}`;
}

function captionsToSrt(captions: Caption[]): string {
  return captions.map((caption, i) => {
    return `${i + 1}\n${msToSrtTime(caption.startMs)} --> ${msToSrtTime(caption.endMs)}\n${caption.text.trim()}\n`;
  }).join('\n');
}
// --- END SRT HELPERS ---

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let videoUrl = searchParams.get('url');
    const jsonFileName = videoUrl?.replace(/\.mp4$/, '.json')

    console.log("URL",`https://pub-449b3b5dd7dc457e86e54d9c58eaa858.r2.dev/uploads/${videoUrl}`)
    videoUrl=`https://pub-449b3b5dd7dc457e86e54d9c58eaa858.r2.dev/uploads/${videoUrl}`
    if (!videoUrl) {
      return new Response(JSON.stringify({ error: 'Missing video URL' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 1: Download the video to local folder
    let videoResponse;
    try {
      videoResponse = await fetch(videoUrl);
      if (!videoResponse.ok) {
        throw new Error(`Failed to download video: status ${videoResponse.status}`);
      }
    } catch (err) {
      console.error('Error downloading video:', err);
      return new Response(JSON.stringify({ error: 'Failed to download video', details: err instanceof Error ? err.message : String(err) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let buffer;
    let fileName;
    let filePath;
    try {
      const videoBuffer = await videoResponse.arrayBuffer();
      buffer = Buffer.from(videoBuffer);
      fileName = `${randomUUID()}.mp4`;
      const downloadsDir = path.join(process.cwd(), 'downloads');
      await fs.mkdir(downloadsDir, { recursive: true });
      filePath = path.join('./downloads', fileName);
      await fs.writeFile(filePath, new Uint8Array(buffer));
    } catch (err) {
      console.error('Error saving video file:', err);
      return new Response(JSON.stringify({ error: 'Failed to save video file', details: err instanceof Error ? err.message : String(err) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 1.5: If file is video, extract audio
    const processFilePath = filePath;
    const processMimeType = videoResponse.headers.get('content-type') || 'video/mp4';

    // Step 2: Read the local file and upload to Gemini
    let uploadedFile;
    let mimeType;
    try {
      mimeType = processMimeType;
      uploadedFile = await ai.files.upload({
        file: processFilePath,
        config: { mimeType },
      });
      if (!uploadedFile.name) {
        throw new Error('File name is undefined');
      }
    } catch (err) {
      console.error('Error uploading file to Gemini:', err);
      return new Response(JSON.stringify({ error: 'Failed to upload file to Gemini', details: err instanceof Error ? err.message : String(err) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 3: Wait until the file is processed
    let fileState = uploadedFile.state;
    let fileUri = uploadedFile.uri;
    let maxTries = 12;
    try {
      while (fileState !== 'ACTIVE' && maxTries > 0) {
        console.log(`Waiting for file to become ACTIVE. Current state: ${fileState}`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const updatedFile = await ai.files.get({ name: uploadedFile.name });
        fileState = updatedFile.state;
        fileUri = updatedFile.uri;
        maxTries--;
      }
      if (fileState !== 'ACTIVE') {
        throw new Error('File did not become ACTIVE in Gemini API');
      }
    } catch (err) {
      console.error('Error waiting for Gemini file to become ACTIVE:', err);
      return new Response(JSON.stringify({ error: 'Gemini file did not become ACTIVE', details: err instanceof Error ? err.message : String(err) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 4: Generate content
    let output;
    try {
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: createUserContent([
          { fileData: { fileUri, mimeType } },
          { text: `
          Make this exactly into single tanglish words. I am going to display this as captions in video, so though the content is in tamil, I want to display a transliterated version of it which means I want it to be displayed in tanglish. So give me a tanglish text. Dont give me 1 full sentence in tanglish. I want each word to be broken down and converted to tanglish and should be displayed in the json format I have provided. Dont use english words unless the original speaker has spoken a english word in which case, you can display english. Basically transliterate it in a normal spoke tanglish way. Use this JSON format for response, dont deviate from this JSON format:  
          {
    Make sure the milliseconds are accurate I dont want to see any difference in the time in which the text was uttered and the time in which it is displayed.
    "text": " the word in tanglish with a space as a prefix",
    "startMs": the start time of the word in milliseconds,
    "endMs": the end time of the word in milliseconds,
    "timestampMs": the average of the start and end time in milliseconds,
    "confidence": the confidence score of the text
        }
    Very important: there should be a space as a prefix to each text word. Very Important 

    here is an example
    [
    { "text": "hey", "startMs": 330, "endMs": 400, "timestampMs": 420, "confidence": 1.0 },
    { "text": " guys.", "startMs": 500, "endMs": 700, "timestampMs": 500, "confidence": 1.0 },
    { "text": " na", "startMs": 1040, "endMs": 1170, "timestampMs": 1040, "confidence": 0.963153600692749 },
    { "text": " inga", "startMs": 1230, "endMs": 1500, "timestampMs": 1230, "confidence": 0.9821343421936035 },
    { "text": " Flutter", "startMs": 1590, "endMs": 2040, "timestampMs": 1590, "confidence": 0.977540910243988 },
    { "text": " eventku", "startMs": 2040, "endMs": 2470, "timestampMs": 2040, "confidence": 0.9611732959747314 },
    { "text": " third", "startMs": 2510, "endMs": 2740, "timestampMs": 2510, "confidence": 0.9724959135055542 },
    { "text": " time", "startMs": 2740, "endMs": 2890, "timestampMs": 2740, "confidence": 0.9895510077476501 },
    { "text": " varen.", "startMs": 2890, "endMs": 3260, "timestampMs": 2890, "confidence": 0.9883281588554382 },
    { "text": " so", "startMs": 3380, "endMs": 3480, "timestampMs": 3380, "confidence": 0.970455527305603 },
    { "text": " eppayum", "startMs": 3480, "endMs": 3980, "timestampMs": 3480, "confidence": 0.9785779714584351 },
    { "text": " pola", "startMs": 3980, "endMs": 4250, "timestampMs": 3980, "confidence": 0.9884575605392456 },
    { "text": " superra", "startMs": 4250, "endMs": 4660, "timestampMs": 4250, "confidence": 0.9728028774261475 },
    { "text": " panni", "startMs": 4660, "endMs": 4940, "timestampMs": 4660, "confidence": 0.9801964163780212 },
    { "text": " irukkanga.", "startMs": 4940, "endMs": 5430, "timestampMs": 4940, "confidence": 0.9782485961914062 },
    { "text": " first", "startMs": 5880, "endMs": 6230, "timestampMs": 5880, "confidence": 0.9451284408569336 },
    { "text": " year", "startMs": 6230, "endMs": 6450, "timestampMs": 6230, "confidence": 0.9851028919219971 },
    { "text": " anniversary", "startMs": 6450, "endMs": 7270, "timestampMs": 6450, "confidence": 0.9850393533706665 }
    ]

    the above is just an example, dont use it anywhere else in response.

    Important: Make sure the JSON generated has [] to actually parse the JSON data.
    ` },
        ]),
      });
      output = result.text?.trim();
      console.log("da Output", output)
      if (!output) {
        throw new Error('No response from model');
      }
    } catch (err) {
      console.error('Error generating content with Gemini:', err);
      return new Response(JSON.stringify({ error: 'Failed to generate content with Gemini', details: err instanceof Error ? err.message : String(err) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 5: Extract JSON from the model's response
    let parsedJson;
    try {
      const jsonMatch = output.match(/```json\s*([\s\S]*?)\s*```/);
      if (!jsonMatch) {
        throw new Error('No JSON found in the model response');
      }
      parsedJson = JSON.parse(jsonMatch[1]);
      console.log(parsedJson);
    } catch (err) {
      console.error('Error parsing JSON from model response:', err);
      return new Response(JSON.stringify({ error: 'Failed to parse JSON from model response', details: err instanceof Error ? err.message : String(err) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 6: SRT GENERATION
    try {
      if (jsonFileName) {
        const srtContent = captionsToSrt(parsedJson);
        const srtFileName = jsonFileName.replace(/\.json$/, '.srt');
        const srtFilePath = path.join('./public/downloads', srtFileName);
        await fs.writeFile(srtFilePath, srtContent);
      }
    } catch (err) {
      console.error('Error generating SRT file:', err);
      return new Response(JSON.stringify({ error: 'Failed to generate SRT file', details: err instanceof Error ? err.message : String(err) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 7: Upload JSON to S3
    try {
      const s3 = new S3Client({
        region: 'auto',
        endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID!,
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        },
      });
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: `uploads/${jsonFileName}`,
          Body: JSON.stringify(parsedJson, null, 2),
          ContentType: 'application/json',
        })
      );
      console.log("doneee");
    } catch (err) {
      console.error('Error uploading JSON to S3:', err);
      return new Response(JSON.stringify({ error: 'Failed to upload JSON to S3', details: err instanceof Error ? err.message : String(err) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 8: Delete the downloaded video file
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.error('Error deleting downloaded video file:', err);
      // Don't return error, just log it
    }

    console.log("JSON", jsonFileName)

    return new Response(
      JSON.stringify({ message: 'JSON uploaded successfully', json: parsedJson }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('API ERROR:', error);
    return new Response(JSON.stringify({ error: 'Unexpected error in get-captions API', details: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
