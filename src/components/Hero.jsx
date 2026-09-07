import React, { useState, useEffect } from 'react';
import { heroContents } from '../data/heroData';

export default function Hero({ onGetStarted }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const duration = 8500;
    const timer = setTimeout(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % heroContents.length);
        setFade(true);
      }, 400);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  const currentContent = heroContents[currentIndex];

  const handleDotClick = (index) => {
    if (index === currentIndex) return;
    setFade(false);
    setTimeout(() => {
      setCurrentIndex(index);
      setFade(true);
    }, 400);
  };

  const handleCopyCli = async () => {
    try {
      await navigator.clipboard.writeText(currentContent.cliSample);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed', e);
    }
  };

  return (
    <section className="pt-12 sm:pt-16 pb-16 px-4 max-w-6xl mx-auto w-full">
      {/* Top Tag & Slide Indicators */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white font-mono text-xs font-semibold tracking-wide">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          {currentContent.badge}
        </div>

        <div className="flex items-center gap-2">
          {heroContents.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer border-none p-0 ${
                index === currentIndex ? 'w-8 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Main Grid: Editorial Typography + Interactive Terminal Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Narrative Column */}
        <div className="lg:col-span-7 flex flex-col justify-center text-left">
          <div className={`transition-opacity duration-400 ease-in-out ${fade ? 'opacity-100' : 'opacity-0'}`}>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.2] mb-5">
              <span className="block text-slate-600 font-medium text-2xl sm:text-3xl mb-1">
                {currentContent.title1}
              </span>
              <span className="text-slate-900 underline decoration-blue-500 decoration-wavy decoration-2 underline-offset-8">
                {currentContent.title2}
              </span>
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed mb-8 whitespace-pre-line font-normal">
              {currentContent.highlightText ? (
                <>
                  {currentContent.description.split(currentContent.highlightText).map((part, i, arr) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <span className="font-semibold text-slate-900 bg-blue-50 px-1 rounded">{currentContent.highlightText}</span>
                      )}
                    </React.Fragment>
                  ))}
                </>
              ) : (
                currentContent.description
              )}
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => window.location.href = '/marketplace.html'}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-7 rounded-xl text-base transition-colors duration-150 cursor-pointer border-none shadow-sm flex items-center gap-2"
            >
              <span>⚡ 마켓플레이스 92개 스킬 탐색</span>
            </button>
            <button
              onClick={handleCopyCli}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold py-3.5 px-6 rounded-xl text-base transition-colors duration-150 cursor-pointer flex items-center gap-2 font-mono text-sm"
            >
              <span>{copied ? '✅ 복사 완료!' : '📋 CLI 명령어 복사'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 mt-4 font-mono">
            * Antigravity IDE, Cursor, Windsurf, Claude Code 환경에서 즉시 100% 성능 발휘
          </p>
        </div>

        {/* Right Interactive Terminal Box */}
        <div className="lg:col-span-5">
          <div className="bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-mono text-xs sm:text-sm">
            {/* Terminal Header */}
            <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/90 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/90 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/90 inline-block"></span>
                <span className="text-slate-400 text-xs ml-2">bash — superskill-package-manager</span>
              </div>
              <button
                onClick={handleCopyCli}
                className="text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition-colors border-none cursor-pointer"
              >
                {copied ? '✔ Copied' : 'Copy'}
              </button>
            </div>

            {/* Terminal Content */}
            <div className="p-5 space-y-3 leading-relaxed">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-emerald-400">~</span>
                <span className="text-slate-200">$</span>
                <span className="text-white font-semibold">{currentContent.cliSample}</span>
              </div>

              <div className="text-slate-500 text-xs pl-4 border-l border-slate-800 space-y-1.5 pt-1">
                <p className="text-blue-400">ℹ Resolving package manifest from superskill registry...</p>
                <p className="text-slate-300">✔ Found: <span className="text-amber-300">SKILL.md</span> + <span className="text-indigo-300">manifest.json</span></p>
                <p className="text-slate-300">✔ Unpacking full tree to <span className="text-emerald-300">.agents/skills/</span></p>
                <p className="text-emerald-400 font-bold">✔ 100% Agent Intelligence Unlocked (No Lost-in-Middle)</p>
              </div>

              <div className="pt-3 border-t border-slate-900/80 flex items-center justify-between text-xs text-slate-400">
                <span>Total Packages: <strong className="text-slate-200">92 Skills</strong></span>
                <span className="text-emerald-400 font-semibold">● Registry Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
