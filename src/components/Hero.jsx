import React, { useState, useEffect } from 'react';
import { heroContents } from '../data/heroData';

export default function Hero({ onGetStarted }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % heroContents.length);
        setFade(true);
      }, 500); 
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const currentContent = heroContents[currentIndex];

  const handleDotClick = (index) => {
    if (index === currentIndex) return;
    setFade(false);
    setTimeout(() => {
      setCurrentIndex(index);
      setFade(true);
    }, 500);
  };

  return (
    <section className="text-center pt-24 sm:pt-32 pb-16 sm:pb-20 px-4 sm:px-5 min-h-[600px] flex flex-col justify-center items-center">
      <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full font-bold text-xs tracking-wider mb-6">
        NEW UPDATE 🚀
      </div>
      
      {/* 덜컹거림(높이 변화)을 방지하기 위해 최소 높이(min-h) 지정 및 이동(translate-y) 제거 */}
      <div className={`min-h-[280px] md:min-h-[320px] flex flex-col justify-center transition-opacity duration-500 ease-in-out ${fade ? 'opacity-100' : 'opacity-0'}`}>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tighter text-slate-900 leading-tight mb-6 sm:mb-8">
          {currentContent.title1} <br />
          <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-transparent bg-clip-text">
            {currentContent.title2}
          </span>
        </h1>
        <p className="text-base sm:text-lg md:text-2xl text-slate-600 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-medium whitespace-pre-line px-2">
          {currentContent.highlightText ? (
            <>
              {currentContent.description.split(currentContent.highlightText).map((part, i, arr) => (
                <React.Fragment key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span className="font-bold text-slate-900">{currentContent.highlightText}</span>
                  )}
                </React.Fragment>
              ))}
            </>
          ) : (
            currentContent.description
          )}
        </p>
      </div>

      {/* 인디케이터 (작은 원 2개) */}
      <div className="flex justify-center gap-3 mb-8">
        {heroContents.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-3 h-3 rounded-full transition-colors duration-300 cursor-pointer border-none p-0 ${
              index === currentIndex ? 'bg-blue-600 scale-110' : 'bg-slate-300 hover:bg-slate-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-2 w-full px-4 sm:px-0">
        <button 
          className="w-full sm:w-auto bg-blue-600 text-white font-bold py-4 px-8 rounded-full text-lg shadow-[0_10px_30px_rgba(37,99,235,0.3)] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(37,99,235,0.4)] transition-all cursor-pointer border-none"
          onClick={onGetStarted}
        >
          무료로 시작하기
        </button>
        <button 
          className="w-full sm:w-auto bg-white text-slate-700 border border-slate-200 font-bold py-4 px-8 rounded-full text-lg shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.1)] transition-all cursor-pointer"
          onClick={() => window.location.href='/marketplace.html'}
        >
          스킬 둘러보기
        </button>
      </div>
    </section>
  );
}
