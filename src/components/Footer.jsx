import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 mt-16 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-black text-sm">AI</div>
          <span className="font-bold text-xl tracking-tight text-white">Super Skill</span>
        </div>
        <div className="flex justify-center gap-6 mb-6">
          <a href="#" onClick={(e) => { e.preventDefault(); alert('준비 중입니다.'); }} className="hover:text-white transition-colors">회사소개</a>
          <a href="#" onClick={(e) => { e.preventDefault(); alert('준비 중입니다.'); }} className="hover:text-white transition-colors">이용약관</a>
          <a href="#" onClick={(e) => { e.preventDefault(); alert('준비 중입니다.'); }} className="hover:text-white transition-colors font-bold">개인정보처리방침</a>
          <a href="#" onClick={(e) => { e.preventDefault(); alert('준비 중입니다.'); }} className="hover:text-white transition-colors">고객센터</a>
        </div>
        <p className="text-sm">© 2026 AI Super Skill. All rights reserved.</p>
      </div>
    </footer>
  );
}
