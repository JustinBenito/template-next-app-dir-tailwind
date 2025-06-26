import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path, { parse } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    console.log("URL", url);

    // Step 1: Get content from Jina AI with additional headers
    const encodedUrl = encodeURIComponent(url);
    const jinaResponse = await fetch(`https://r.jina.ai/${encodedUrl}`, {
      headers: {
        'Authorization': `Bearer ${process.env.JINA_API_KEY}`,
        'X-Engine': 'browser',
        'X-With-Generated-Alt': 'true',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!jinaResponse.ok) {
      console.log('Jina AI Response:', {
        status: jinaResponse.status,
        statusText: jinaResponse.statusText,
        headers: Object.fromEntries(jinaResponse.headers.entries())
      });
      throw new Error(`Failed to fetch content from Jina AI: ${jinaResponse.statusText}`);
    }

    const jinaContent = await jinaResponse.text();
    console.log(jinaContent);

    // Step 2: Send to Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: `return a JSON data where the structure should be like
{
text: "the summarised text of ${jinaContent} should be made into a 60 second reel script with only pure speaking content out of that content which should be covering only the key points. write it like one paragraph of text content for the script, do not include emojis or bullets or anything that would make a text to speech reader convert this text wrongly."
}`}]
          }]
        })
      }
    );

    let geminiData = await geminiResponse.json();
    geminiData = geminiData.candidates[0].content.parts[0].text?.trim();
    const jsonMatch = geminiData.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch) {
        return new Response(JSON.stringify({ error: 'No JSON found in the model response' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
  
      const parsedJson = JSON.parse(jsonMatch[1]);
      console.log(parsedJson)

    const text = parsedJson.text;
    console.log("txt", text);

    // Step 3: Generate speech using OpenAI
    const speechResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        input: text,
        voice: 'alloy',
        response_format: 'mp3'
      })
    });

    if (!speechResponse.ok) {
      throw new Error('Failed to generate speech');
    }

    const speechBuffer = await speechResponse.arrayBuffer();
    const speechPath = path.join(process.cwd(), 'public', 'temp-speech.mp3');
    await fs.writeFile(speechPath, Buffer.from(speechBuffer));

    console.log(speechPath);

    // Step 4: Combine video and audio using ffmpeg with more specific parameters
    const outputPath = path.join(process.cwd(), 'downloads', 'final-video.mp4');
    const ffmpegCommand = `ffmpeg -y -i public/brainrot.mp4 -i ${speechPath} -c:v copy -c:a aac -b:a 192k -map 0:v:0 -map 1:a:0 -shortest ${outputPath}`;
    
    try {
      await execAsync(ffmpegCommand);
    } catch (ffmpegError) {
      console.error('FFmpeg error:', ffmpegError);
      throw new Error('Failed to combine video and audio');
    }

    // Step 5: Upload to Cloudflare
    const uploadResponse = await fetch('/api/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: 'final-video.mp4',
        contentType: 'video/mp4'
      })
    });

    if (!uploadResponse.ok) throw new Error('Failed to get upload URL');

    const { uploadUrl, fileUrl } = await uploadResponse.json();

    const finalUploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'video/mp4' },
      body: await fs.readFile(outputPath)
    });

    if (!finalUploadResponse.ok) throw new Error('Upload failed');

    // Cleanup temporary files
    try {
      await fs.unlink(speechPath);
      await fs.unlink(outputPath);
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }

    return NextResponse.json({ 
      success: true, 
      videoUrl: fileUrl,
      script: text,
    });

  } catch (error) {
    console.error('Error in blog-to-reel conversion:', error);
    return NextResponse.json(
      { error: 'Failed to process blog to reel' },
      { status: 500 }
    );
  }
}