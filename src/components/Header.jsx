import React, { useState } from 'react';

export default function Header({ onSignIn }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="flex justify-between items-center px-6 md:px-12 py-4 sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-black/5 relative">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
        <img src="/logo_superskill_black.svg" alt="AI Super Skill Logo" className="w-[140px] md:w-[180px] h-[46px] md:h-[60px] object-contain" />
      </div>
      
      <div className="hidden md:flex gap-8 text-sm font-semibold text-slate-600">
        <a href="/marketplace.html?category=dev" className="hover:text-slate-900 transition-colors">코딩/개발</a>
        <a href="/marketplace.html?category=business" className="hover:text-slate-900 transition-colors">비즈니스/마케팅</a>
        <a href="/marketplace.html?category=design" className="hover:text-slate-900 transition-colors">디자인/UI</a>
        <a href="/marketplace.html?category=docs" className="hover:text-slate-900 transition-colors">기획/문서</a>
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          className="bg-slate-900 text-white font-semibold py-2 px-4 md:px-5 rounded-full text-xs md:text-sm hover:bg-slate-800 transition-colors cursor-pointer"
          onClick={onSignIn}
        >
          마켓플레이스
        </button>
        <button 
          className="md:hidden text-slate-600 hover:text-slate-900 p-1"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-black/5 shadow-lg md:hidden flex flex-col py-4 px-6 gap-4 text-sm font-semibold text-slate-600">
          <a href="/marketplace.html?category=dev" className="hover:text-slate-900 transition-colors border-b border-slate-100 pb-2">코딩/개발</a>
          <a href="/marketplace.html?category=business" className="hover:text-slate-900 transition-colors border-b border-slate-100 pb-2">비즈니스/마케팅</a>
          <a href="/marketplace.html?category=design" className="hover:text-slate-900 transition-colors border-b border-slate-100 pb-2">디자인/UI</a>
          <a href="/marketplace.html?category=docs" className="hover:text-slate-900 transition-colors">기획/문서</a>
        </div>
      )}
    </nav>
  );
}
