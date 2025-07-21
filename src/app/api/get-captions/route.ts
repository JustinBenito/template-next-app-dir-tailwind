import { GoogleGenAI } from '@google/genai';
import { createUserContent } from '@google/genai';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- SRT GENERATION HELPERS (moved outside handler) ---
// type Caption = {
//   text: string;
//   startMs: number;
//   endMs: number;
//   timestampMs?: number;
//   confidence?: number;
// };

// function msToSrtTime(ms: number): string {
//   const hours = Math.floor(ms / 3600000);
//   const minutes = Math.floor((ms % 3600000) / 60000);
//   const seconds = Math.floor((ms % 60000) / 1000);
//   const milliseconds = ms % 1000;

//   return (
//     String(hours).padStart(2, '0') + ':' +
//     String(minutes).padStart(2, '0') + ':' +
//     String(seconds).padStart(2, '0') + ',' +
//     String(milliseconds).padStart(3, '0')
//   );
// }


// function captionsToSrt(captions: Caption[]): string {
//   return captions.map((caption, i) => {
//     return `${i + 1}\n${msToSrtTime(caption.startMs)} --> ${msToSrtTime(caption.endMs)}\n${caption.text.trim()}\n`;
//   }).join('\n');
// }
// --- END SRT HELPERS ---

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let videoUrl = searchParams.get('url');
    
    // Handle spaces and special characters in filenames
    const sanitizedVideoUrl = videoUrl ? decodeURIComponent(videoUrl) : null;
    const jsonFileName = sanitizedVideoUrl?.replace(
      /\.(mp4|mov|avi|mkv|wmv|flv|webm|m4v|3gp|ogv|ts|mts|m2ts|mp3|wav|ogg|aac|flac|m4a|wma|aiff|alac)$/i,
      '.json'
    );

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
      console.log('[Gemini] Uploading file to Gemini:', { processFilePath, mimeType });
      uploadedFile = await ai.files.upload({
        file: processFilePath,
        config: { mimeType },
      });
      console.log('[Gemini] File uploaded:', uploadedFile);
      if (!uploadedFile.name) {
        throw new Error('File name is undefined');
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error('[Gemini] Error uploading file to Gemini:', err.stack || err.message);
      } else {
        console.error('[Gemini] Error uploading file to Gemini:', String(err));
      }
      return new Response(JSON.stringify({ error: 'Failed to upload file to Gemini', details: err instanceof Error ? err.message : String(err) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 3: Wait until the file is processed
    let fileState = uploadedFile.state;
    let fileUri = uploadedFile.uri;
    let maxTries = 24;
    try {
      while (fileState !== 'ACTIVE' && maxTries > 0) {
        console.log(`[Gemini] Waiting for file to become ACTIVE. Current state: ${fileState}, fileUri: ${fileUri}`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const updatedFile = await ai.files.get({ name: uploadedFile.name });
        fileState = updatedFile.state;
        fileUri = updatedFile.uri;
        maxTries--;
      }
      if (fileState !== 'ACTIVE') {
        throw new Error('File did not become ACTIVE in Gemini API');
      }
      console.log('[Gemini] File is ACTIVE:', { fileUri });
    } catch (err) {
      if (err instanceof Error) {
        console.error('[Gemini] Error waiting for Gemini file to become ACTIVE:', err.stack || err.message);
      } else {
        console.error('[Gemini] Error waiting for Gemini file to become ACTIVE:', String(err));
      }
      return new Response(JSON.stringify({ error: 'Gemini file did not become ACTIVE', details: err instanceof Error ? err.message : String(err) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 4: Generate content
    let output;
    try {
      console.log('[Gemini] Calling generateContent with:', { fileUri, mimeType, model: 'gemini-2.5-pro' });
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: createUserContent([
          { fileData: { fileUri, mimeType } },
          { text: `
          Make this exactly into translated English sentences with timestamps. I am going to display this as captions for a podcast video, so though the content is in Tamil, I want to display a translated version of it which means I want it to be displayed in English.

So give me an English text of the spoken Tamil content. Give me 1 full sentence in English with proper aligned timestamps. I want it to be converted to English and should be displayed in normal spoken English for easier understanding.

 Very important: The milliseconds should be accurate — I do not want to see any difference in the time the sentence was uttered and the time it is displayed. The alignment of the timestamps to the original Tamil speech is highly important.

 Output the SRT file like normal SRT.

Each sentence must be displayed as a single SRT entry, with:

    Proper index numbers starting from 1

    Timestamps in this format: 00:00:01,200 --> 00:00:04,300 (use comma for milliseconds, not dot)

    Text must be translated into clear conversational English

    Sentences should be natural, like how someone would speak in English, not word-by-word literal translations

    here is an example
    ```srt 
    1\n00:00:00,330 --> 00:00:01,420\n hey hi thank you for having me in this podcast\n\n2\n00:00:01,430 --> 00:00:02,560\n absolutely you have been a great SAAS tools developer\n\n3\n00:00:02,580 --> 00:00:04,100\n absolutely, it feels great to be here\n\n4\n00:00:04,101 --> 00:00:06,000\n yes, so jumping into the podcast\n\n5\n00:00:07,300 --> 00:00:08,500\n my first question would be to tell us about yourself\n\n6\n00:00:08,700 --> 00:00:10,200\n sure, so I am Justin and I did my engineering and now I am building my own SaaS called as inforgraphics.co\n\n7\n00:00:10,201 --> 00:00:10,700\n Wow, that is great.\n\n8\n00:00:12,500 --> 00:00:14,000\n Yes it is, I have made around $10000 in ARR\n\n9\n00:00:14,300 --> 00:00:15,400\n So what is ARR exactly ?\n\n10\n00:00:15,700 --> 00:00:16,900\n So ARR means Annual Recurring Revenue\n\n11\n00:00:17,000 --> 00:00:18,700\n Okay, so you get paid annually ?\n\n12\n00:00:19,200 --> 00:00:20,100\n No it is just based on the monthly subscription that users pay\n\n13\n00:00:21,000 --> 00:00:22,400\n but we multiple it by 12 months\n\n14\n00:00:22,600 --> 00:00:23,900\n Oh thats amazing, so 10000 dollars is not easy.\n\n15\n00:00:24,000 --> 00:00:26,000\n how did you manage to build it ?\n\n16\n00:00:26,500 --> 00:00:27,600\n So I didnt have any coding knowledge\n\n17\n00:00:28,000 --> 00:00:29,600\n but I learned it from youtube and built this ```
  
]

And the final output should be:
a SRT file

Again, make sure:

    Timestamps are accurate to the millisecond

    Start and end time match exactly when the spoken Tamil sentence starts and ends

    Sentences are translated, not transliterated

    Output is SRT format, wrapped as a value under "srt" in a single-element JSON array

    Do not include anything else outside the format

Make sure your response can be parsed directly as JSON and embedded in a video caption system.


    the above is just an example, dont use it anywhere else in response.

    Though the speaker is in Tamil and speaks in tamil, I want you to understand what they speak in tamil and translate it to english as setence level captions. 
    Remember this is highly important to be accurate, so make sure the timestamps you give are very very accurate in terms of the spoken words and interms of the time it was spoken and everything and is properly converted to minutes, seconds in the srt file generated. 


    The most important of them all is you making sure the format of SRT is maintained at HH:MM:SS,mmm for each instance. or else I will doom you to in existence.


    Important: Make sure the JSON generated has [] to actually parse the JSON data.
    ` },
        ]),
      });
      output = result.text?.trim();
      console.log('[Gemini] generateContent output:', output);
      if (output) {
        const jsonFilePath = path.join('./public/downloads', "testing_now.txt");
        await fs.writeFile(jsonFilePath, JSON.stringify(output, null, 2));
        console.log("JSON file written locally:", jsonFileName);
      }
      if (!output) {
        throw new Error('No response from model');
      }
    } catch (err) {
      if (err instanceof Error) {
        console.error('[Gemini] Error generating content with Gemini:', err.stack || err.message);
      } else {
        console.error('[Gemini] Error generating content with Gemini:', String(err));
      }
      return new Response(JSON.stringify({ error: 'Failed to generate content with Gemini', details: err instanceof Error ? err.message : String(err) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 5: Extract JSON from the model's response
    let parsedJson;
    let srtFromJson: string | undefined;
    try {
      const jsonMatch = output.match(/```json\s*([\s\S]*?)\s*```/);
      if (!jsonMatch) {
        throw new Error('No JSON found in the model response');
      }
      parsedJson = JSON.parse(jsonMatch[1]);
      console.log("this is the parsed", parsedJson);
      // Write the parsed JSON to public/downloads
      if (jsonFileName) {
        const jsonFilePath = path.join('./public/downloads', jsonFileName);
        await fs.writeFile(jsonFilePath, JSON.stringify(parsedJson, null, 2));
        console.log("JSON file written locally:", jsonFileName);
      }
      // If the output is in the form { srt: <srt> }, decode and write SRT
      if (parsedJson) {
        srtFromJson = parsedJson.srt;
        console.log("the parsed srt:", srtFromJson)
        // Use AI SDK to check and correct SRT formatting
        let correctedSrt = srtFromJson;
        try {
         // Call Gemini to check and correct SRT formatting
          const correctionPrompt = `You are an expert in SRT subtitle formatting. Here is an SRT file. Check if every block is in proper SRT format (number, time range in HH:MM:SS,mmm --> HH:MM:SS,mmm, and text). If there are any mistakes, correct them. If it is already correct, return it as is. Only return the corrected SRT file fully, nothing else.\n\n${srtFromJson}`;
          const correctionResult = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: correctionPrompt
          });
          console.log("correction Result:", correctionResult);
          console.log("corr:", correctionResult.text)
          if (correctionResult && correctionResult.candidates && correctionResult.candidates[0] && correctionResult.candidates[0].content) {
            const contentObj = correctionResult.candidates[0].content;
            console.log("ya",contentObj)
            if (typeof contentObj === 'object' && contentObj !== null && 'text' in contentObj && typeof (contentObj as { text: unknown }).text === 'string') {
              console.log("possiblyfix:", (contentObj as { text: string }).text);
            }
          }
          if (correctionResult.text) {
            correctedSrt = correctionResult.text.toString().trim();
            console.log("SRT file:", correctedSrt);
            // Remove any code block markers if present
            if (correctedSrt.startsWith('```')) {
              const match = correctedSrt.match(/```(?:srt)?\s*([\s\S]*?)\s*```/);
              if (match) correctedSrt = match[1].trim();
            }
            if (correctedSrt) {
              const srtFilePath = path.join('./public/downloads', "correctedSRT.srt");
              await fs.writeFile(srtFilePath, correctedSrt);
              console.log("SRT file written locally:", jsonFileName);
            }
          }



        } catch (aiErr) {
          console.error('[Gemini] Error correcting SRT format:', aiErr instanceof Error ? aiErr.stack || aiErr.message : String(aiErr));
          // Fallback to original SRT if correction fails
        }
        // Write the corrected SRT string to a .srt file
        if (jsonFileName && typeof correctedSrt === 'string') {
          const srtFileName = jsonFileName.replace(/\.json$/, '.srt');
          const srtFilePath = path.join('./public/downloads', srtFileName);
          await fs.writeFile(srtFilePath, correctedSrt);
          console.log("Corrected SRT file written locally:", srtFileName);
        }
      }
    } catch (err) {
      console.error('Error parsing JSON from model response:', err);
      return new Response(JSON.stringify({ error: 'Failed to parse JSON from model response', details: err instanceof Error ? err.message : String(err) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Step 6: SRT GENERATION
    let srtFileName: string | undefined;
    // try {
    //   if (jsonFileName) {
    //     const srtContent = captionsToSrt(parsedJson);
    //     srtFileName = jsonFileName.replace(/\.json$/, '.srt');
    //     // Ensure the local file path handles spaces properly
    //     const srtFilePath = path.join('./public/downloads', srtFileName);
    //     await fs.writeFile(srtFilePath, srtContent);
    //     console.log("SRT file generated locally:", srtFileName);
    //   }
    // } catch (err) {
    //   console.error('Error generating SRT file:', err);
    //   return new Response(JSON.stringify({ error: 'Failed to generate SRT file', details: err instanceof Error ? err.message : String(err) }), {
    //     status: 500,
    //     headers: { 'Content-Type': 'application/json' },
    //   });
    // }

    // Step 7: Upload JSON to S3
    // try {
    //   const s3 = new S3Client({
    //     region: 'auto',
    //     endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/`,
    //     credentials: {
    //       accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    //       secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    //     },
    //   });
    //   await s3.send(
    //     new PutObjectCommand({
    //       Bucket: process.env.R2_BUCKET_NAME!,
    //       Key: `uploads/${jsonFileName}`,
    //       Body: JSON.stringify(parsedJson, null, 2),
    //       ContentType: 'application/json',
    //     })
    //   );
    //   console.log("JSON uploaded to S3:", jsonFileName);
    // } catch (err) {
    //   console.error('Error uploading JSON to S3:', err);
    //   return new Response(JSON.stringify({ error: 'Failed to upload JSON to S3', details: err instanceof Error ? err.message : String(err) }), {
    //     status: 500,
    //     headers: { 'Content-Type': 'application/json' },
    //   });
    // }

    // // Step 8: Upload SRT to S3
    // try {
    //   if (srtFileName) {
    //     const srtContent = captionsToSrt(parsedJson);
    //     const s3 = new S3Client({
    //       region: 'auto',
    //       endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/`,
    //       credentials: {
    //         accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    //         secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    //       },
    //     });
    //     await s3.send(
    //       new PutObjectCommand({
    //         Bucket: process.env.R2_BUCKET_NAME!,
    //         Key: `uploads/${srtFileName}`,
    //         Body: srtContent,
    //         ContentType: 'text/plain',
    //         ContentDisposition: `attachment; filename="${srtFileName}"`
    //       })
    //     );
    //     console.log("SRT uploaded to S3:", srtFileName);
    //   }
    // } catch (err) {
    //   console.error('Error uploading SRT to S3:', err);
    //   return new Response(JSON.stringify({ error: 'Failed to upload SRT to S3', details: err instanceof Error ? err.message : String(err) }), {
    //     status: 500,
    //     headers: { 'Content-Type': 'application/json' },
    //   });
    // }

    // Step 9: Delete the downloaded video file
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.error('Error deleting downloaded video file:', err);
      // Don't return error, just log it
    }

    console.log("JSON", jsonFileName)
    console.log("SRT", srtFileName)

    return new Response(
      JSON.stringify({ 
        message: 'Files uploaded successfully', 
        json: parsedJson,
        jsonFileName: jsonFileName,
        srtFileName: srtFileName,
        srtUrl: srtFileName ? `https://pub-449b3b5dd7dc457e86e54d9c58eaa858.r2.dev/uploads/${encodeURIComponent(srtFileName)}` : null
      }),
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
