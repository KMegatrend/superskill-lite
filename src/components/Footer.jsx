import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 mt-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-black text-sm">AI</div>
          <span className="font-bold text-xl tracking-tight text-white">Super Skill</span>
        </div>
        <p className="text-sm">Built with AI Awesome Skills • Just Build It.</p>
      </div>
    </footer>
  );
}
