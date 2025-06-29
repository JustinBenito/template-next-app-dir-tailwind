// import React from "react";

// interface TextPressureProps {
//   text: string;
//   textColor?: string;
//   minFontSize?: number;
// }

// const TextPressure: React.FC<TextPressureProps> = ({ text, textColor = "#ffffff", minFontSize = 36 }) => {
//   return (
//     <div style={{
//       fontSize: `${minFontSize}px`,
//       fontWeight: '600',
//       color: textColor,
//       letterSpacing: '-0.025em',
//       lineHeight: '1.2'
//     }}>
//       {text}
//     </div>
//   );
// };

// const Later = () => {
//   return (
//     <div className="bg-black text-white min-h-screen w-full">
//       <section className="max-w-6xl mx-auto px-8 py-24">
//         <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
//           {/* Left Content */}
//           <div className="flex-1 space-y-6">
//             <div className="space-y-2">
//               <TextPressure
//                 text="See it in Action"
//                 textColor="#ffffff"
//                 minFontSize={42}
//               />
//             </div>
            
//             <p className="text-lg text-gray-400 leading-relaxed max-w-md">
//               Loads of styles to choose from,<br />
//               find your unique flavor
//             </p>
//           </div>
          
//           {/* Right Video */}
//           <div className="flex-1 flex justify-center lg:justify-end">
//             <div className="relative">
//               {/* Beautiful glow effect */}
//               <div className="absolute -inset-8 bg-gradient-to-r from-purple-600/20 via-blue-500/20 to-cyan-400/20 rounded-3xl blur-2xl opacity-75"></div>
              
//               {/* Video container */}
//               <div className="relative">
//                 <video
//                   src="/sample-video.mp4"
//                   controls
//                   className="w-80 h-auto rounded-2xl shadow-2xl border border-white/20"
//                   style={{ aspectRatio: '9/16' }}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default Later;

// import TextCursor from './TextCursor';