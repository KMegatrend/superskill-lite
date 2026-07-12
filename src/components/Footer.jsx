import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 mt-16 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <div className="flex items-center justify-center mb-6">
          <img src="/logo_superskill_white.svg" alt="AI Super Skill Logo" className="w-[140px] h-[50px] object-contain" style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden', WebkitFontSmoothing: 'antialiased' }} />
        </div>
        <div className="flex justify-center gap-6 mb-6">
          <a href="/about.html" className="hover:text-white transition-colors">회사소개</a>
          <a href="/terms.html" className="hover:text-white transition-colors">이용약관</a>
          <a href="/privacy.html" className="hover:text-white transition-colors font-bold">개인정보처리방침</a>
          <a href="/support.html" className="hover:text-white transition-colors">고객센터</a>
        </div>
        <p className="text-sm">© 2026 AI Super Skill. All rights reserved.</p>
      </div>
    </footer>
  );
}
