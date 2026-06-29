import React from 'react';

export default function Header({ onSignIn }) {
  return (
    <nav className="flex justify-between items-center px-6 md:px-12 py-4 sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-black/5">
      <div className="text-xl font-extrabold tracking-tight flex items-center gap-2 text-slate-900 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
        <div className="bg-blue-500 text-white w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-black">AI</div>
        Super <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">Skill</span>
      </div>
      <div className="hidden md:flex gap-8 text-sm font-semibold text-slate-600">
        <a href="/marketplace.html?category=dev" className="hover:text-slate-900 transition-colors">코딩/개발</a>
        <a href="/marketplace.html?category=business" className="hover:text-slate-900 transition-colors">비즈니스/마케팅</a>
        <a href="/marketplace.html?category=design" className="hover:text-slate-900 transition-colors">디자인/UI</a>
        <a href="/marketplace.html?category=docs" className="hover:text-slate-900 transition-colors">기획/문서</a>
      </div>
      <button 
        className="bg-slate-900 text-white font-semibold py-2 px-5 rounded-full text-sm hover:bg-slate-800 transition-colors cursor-pointer"
        onClick={onSignIn}
      >
        마켓플레이스
      </button>
    </nav>
  );
}
