'use client';
import Link from 'next/link';

import { UserButton, SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";

export default function Nav({ onHomeClick }: { onHomeClick?: () => void }) {


  return (
<nav className="fixed z-50 w-full
     flex justify-between items-center py-4 px-6 md:px-12 lg:px-20 
     bg-white/10 backdrop-blur-lg border border-b border-t-0 border-l-0 border-r-0 border-white/20 
     shadow-xl">

      <div className='max-w-7xl mx-auto items-center justify-between w-full flex'>

      <div className="flex max-w-7xl items-center">
        {onHomeClick ? (
          <button
            type="button"
            onClick={onHomeClick}
            className="bg-white text-black font-bold px-4 py-2 rounded-full cursor-pointer transition hover:opacity-90 border-none outline-none"
            style={{ appearance: 'none' }}
          >
            <span className="">
              <span className="text-red-800">tanglish</span>captions.com
            </span>
          </button>
        ) : (
          <Link href="/">
            <div className="bg-white text-black font-bold px-4 py-2 rounded-full cursor-pointer transition hover:opacity-90">
              <span className="">
                <span className="text-red-800">tanglish</span>captions.com
              </span>
            </div>
          </Link>
        )}
      </div>

      <div className="flex items-center gap-4">

        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">

            <button className="bg-red-800 border border-white/30 cursor-pointer text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition">
              Sign in
            </button>

          </SignInButton>
        </SignedOut>

      </div>

      </div>
    </nav>
  );
}
