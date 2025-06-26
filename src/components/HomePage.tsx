import React, { useState } from 'react';
import { ArrowRight, Link, Sparkles } from 'lucide-react';

interface HomePageProps {
  onGenerateReel: (url: string) => void;
}

function HomePage({ onGenerateReel }: HomePageProps) {
  const [blogUrl, setBlogUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    videoUrl: string;
    script: string;
    images: Array<{ triggerword: string; image: string }>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blogUrl.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/blog-to-reel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: blogUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to process blog');
      }

      const data = await response.json();
      console.log(data);
      setResult(data);
      onGenerateReel(data.videoUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-100/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Blog to Reel
            <br />
            <span className="text-gray-500">in minutes with AI</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Transform your blog posts into engaging video reels with AI-powered content analysis and generation.
          </p>
          
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-12">
            <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white/80 backdrop-blur-sm rounded-2xl border border-pink-200/50 shadow-xl shadow-pink-500/10">
              <div className="flex-1 relative">
                <Link className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={blogUrl}
                  onChange={(e) => setBlogUrl(e.target.value)}
                  placeholder="Paste your blog URL here..."
                  className="w-full pl-12 pr-4 py-4 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none text-lg"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !blogUrl.trim()}
                className="group bg-gradient-to-r from-pink-500 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-pink-600 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 min-w-[200px] shadow-lg shadow-pink-500/25"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Reel</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </button>
            </div>
          </form>
          
          {error && (
            <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">
              {error}
            </div>
          )}
          
          {result && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-pink-200/50 p-8 shadow-xl shadow-pink-500/10">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Generated Script</h3>
                <p className="text-gray-700 leading-relaxed">{result.script}</p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-pink-200/50 p-8 shadow-xl shadow-pink-500/10">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Generated Images</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {result.images.map((img, index) => (
                    <div key={index} className="relative rounded-xl overflow-hidden">
                      <img
                        src={img.image}
                        alt={img.triggerword}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3">
                        {img.triggerword}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-pink-200/50 p-8 shadow-xl shadow-pink-500/10">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">Generated Video</h3>
                <video
                  controls
                  className="w-full rounded-xl"
                  src={result.videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          )}
          
          {!result && !error && (
            <div className="mt-20">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-pink-200/50 p-8 max-w-4xl mx-auto shadow-xl shadow-pink-500/10">
                <div className="aspect-video bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl flex items-center justify-center border border-pink-200/30">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-pink-200/50">
                      <Sparkles className="w-8 h-8 text-pink-600" />
                    </div>
                    <p className="text-gray-700 text-lg font-medium">AI-Generated Reel Preview</p>
                    <p className="text-gray-500 text-sm mt-2">Your content will appear here</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;