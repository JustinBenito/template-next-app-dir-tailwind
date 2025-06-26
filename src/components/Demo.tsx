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
      {/* Reel Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 space-y-6">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight text-balance">See it in action</h2>
          <p className="text-lg text-gray-400/80 max-w-md leading-relaxed">Upload your reel and get instant, accurate Tanglish captions. No more manual typing. Just upload, download, done!</p>
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

      {/* How it Works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h3 className="text-4xl font-bold text-center mb-12 tracking-tight text-balance">How it works</h3>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              icon: "1️⃣",
              title: "Upload your reel",
              text: "Drag and drop your video. We support all major formats.",
            },
            {
              icon: "2️⃣",
              title: "Get captions instantly",
              text: "Our AI generates Tanglish captions in seconds.",
            },
            {
              icon: "3️⃣",
              title: "Download & share",
              text: "Download captions in .srt or .vtt and share your reel!",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white/5 hover:bg-white/10 transition rounded-2xl p-8 flex flex-col items-center text-center border border-white/20 shadow-md"
            >
              <span className="text-4xl mb-4">{item.icon}</span>
              <h4 className="font-semibold text-xl mb-2">{item.title}</h4>
              <p className="text-gray-400 text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Creators Marquee */}
      <section className="w-full py-16 bg-gradient-to-r from-black via-gray-900 to-black">
        <h3 className="text-4xl font-bold text-center mb-10 tracking-tight">Creators using Tanglish Captions</h3>
        <div className="overflow-x-auto whitespace-nowrap flex items-end gap-8 px-6 pb-4">
          {creators.map((c, i) => (
            <div key={i} className="inline-flex flex-col items-center min-w-[120px] transition-transform hover:-translate-y-1">
              <img src={c.img} alt={c.name} className="w-24 h-24 rounded-full border-4 border-white/20 shadow-lg object-cover" />
              <span className="mt-3 font-semibold">{c.name}</span>
              <span className="text-sm text-gray-400">{c.followers} followers</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h3 className="text-4xl font-bold tracking-tight">Pricing</h3>
          <p className="text-lg text-gray-400/90 leading-relaxed">No money, no problem! Tanglish Captions is <span className="font-bold text-green-400">free for everyone</span>. For enterprise features, <a href="#" className="underline text-blue-400 hover:text-blue-300">contact us</a>.</p>
        </div>
        <div className="flex-1 flex justify-center">
          <img src="https://i.imgflip.com/30b1gx.jpg" alt="No Money Meme" className="rounded-xl w-72 border border-white/10 shadow-2xl" />
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h3 className="text-4xl font-bold text-center mb-10 tracking-tight">FAQ</h3>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white/5 hover:bg-white/10 transition rounded-xl p-6 border border-white/20 shadow-sm">
              <h4 className="font-semibold text-lg mb-2">{faq.q}</h4>
              <p className="text-gray-400">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-24 bg-gradient-to-r from-red-900 via-black to-red-900 flex flex-col items-center justify-center text-center">
        <h3 className="text-4xl font-bold mb-4 tracking-tight">Ready to get started?</h3>
        <p className="text-lg text-gray-300 mb-8 max-w-xl">Start captioning your reels in Tanglish for free today.</p>
        <a href="#" className="bg-white text-black font-bold px-8 py-4 rounded-full shadow-xl hover:bg-gray-200 transition-all">Get Started</a>
      </section>
    </div>
  );
};

export default Later;
