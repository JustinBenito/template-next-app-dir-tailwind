import React from "react";

const creators = [
  { name: "@creator1", followers: "120k", img: "https://randomuser.me/api/portraits/men/32.jpg" },
  { name: "@creator2", followers: "98k", img: "https://randomuser.me/api/portraits/women/44.jpg" },
  { name: "@creator3", followers: "210k", img: "https://randomuser.me/api/portraits/men/65.jpg" },
  { name: "@creator4", followers: "76k", img: "https://randomuser.me/api/portraits/women/68.jpg" },
  { name: "@creator5", followers: "150k", img: "https://randomuser.me/api/portraits/men/12.jpg" },
  { name: "@creator6", followers: "180k", img: "https://randomuser.me/api/portraits/women/22.jpg" },
];

const faqs = [
  { q: "Is it really free?", a: "Yes! 100% free for individuals." },
  { q: "Can I use it for commercial projects?", a: "Absolutely. For enterprise features, contact us." },
  { q: "What formats are supported?", a: ".srt and .vtt for captions." },
  { q: "How fast is it?", a: "Captions in seconds!" },
];

const Later = () => {
  return (
    <div className="bg-black text-white min-h-screen w-full font-sans">
      {/* Later Reel Section */}
      <section className="max-w-7xl mx-auto px-4 py-24 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">See it in action</h2>
          <p className="text-lg text-gray-400/80 max-w-md">Upload your reel and get instant, accurate Tanglish captions. No more manual typing. Just upload, download, done!</p>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <video
            src="/sample-video.mp4"
            controls
            className="rounded-2xl shadow-2xl border border-white/10 w-full max-w-md bg-black"
            poster="https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=facearea&w=400&h=400"
          />
        </div>
      </section>

      {/* How it Works Section */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <h3 className="text-3xl md:text-4xl font-bold mb-8 text-center">How it works</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white/5 rounded-xl p-8 flex flex-col items-center text-center border border-white/10">
            <span className="text-4xl mb-4">1️⃣</span>
            <h4 className="font-semibold text-xl mb-2">Upload your reel</h4>
            <p className="text-gray-400">Drag and drop your video. We support all major formats.</p>
          </div>
          <div className="bg-white/5 rounded-xl p-8 flex flex-col items-center text-center border border-white/10">
            <span className="text-4xl mb-4">2️⃣</span>
            <h4 className="font-semibold text-xl mb-2">Get captions instantly</h4>
            <p className="text-gray-400">Our AI generates Tanglish captions in seconds.</p>
          </div>
          <div className="bg-white/5 rounded-xl p-8 flex flex-col items-center text-center border border-white/10">
            <span className="text-4xl mb-4">3️⃣</span>
            <h4 className="font-semibold text-xl mb-2">Download & share</h4>
            <p className="text-gray-400">Download captions in .srt or .vtt and share your reel!</p>
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <section className="w-full py-16 bg-gradient-to-r from-black via-gray-900 to-black">
        <h3 className="text-3xl font-bold text-center mb-8">Creators using Tanglish Captions</h3>
        <div className="overflow-x-auto whitespace-nowrap flex items-end gap-8 px-4 pb-4">
          {creators.map((c, i) => (
            <div key={i} className="inline-flex flex-col items-center mx-2 min-w-[120px]">
              <img src={c.img} alt={c.name} className="w-24 h-24 rounded-full border-4 border-white/20 shadow-lg object-cover" />
              <span className="mt-3 font-semibold text-lg">{c.name}</span>
              <span className="text-sm text-gray-400">{c.followers} followers</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-4xl mx-auto px-4 py-20 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h3 className="text-3xl md:text-4xl font-bold mb-2">Pricing</h3>
          <p className="text-lg text-gray-400/80">No money, no problem! Tanglish Captions is <span className="font-bold text-green-400">free for everyone</span>. For enterprise features, <a href="#" className="underline text-blue-400">contact us</a>.</p>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <img src="https://i.imgflip.com/30b1gx.jpg" alt="No Money Meme" className="rounded-xl w-72 border border-white/10 shadow-2xl" />
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 py-20">
        <h3 className="text-3xl md:text-4xl font-bold mb-8 text-center">FAQ</h3>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h4 className="font-semibold text-lg mb-2">{faq.q}</h4>
              <p className="text-gray-400">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 bg-gradient-to-r from-red-900 via-black to-red-900 flex flex-col items-center justify-center">
        <h3 className="text-3xl md:text-4xl font-bold mb-4 text-center">Ready to get started?</h3>
        <p className="text-lg text-gray-300 mb-8 text-center">Start captioning your reels in Tanglish for free today.</p>
        <a href="#" className="bg-white text-black font-bold px-8 py-4 rounded-full shadow-lg hover:bg-gray-200 transition">Get Started</a>
      </section>
    </div>
  );
};

export default Later;