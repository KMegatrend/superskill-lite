import React from 'react';
import { dailySkill, weeklyTrends, howItWorks } from '../data/featuresData';

const Features = () => {
  return (
    <section className="max-w-5xl mx-auto px-8 py-12 flex flex-col gap-24">
      {/* 🌟 오늘의 스킬 (Daily Card News) */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-blue-50 text-blue-500 border border-blue-100 px-3 py-1 rounded-full font-bold text-sm">
            {dailySkill.badge}
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight m-0">오늘의 스킬 큐레이션</h2>
        </div>

        <div 
          className="bg-white rounded-3xl p-8 md:p-12 flex flex-col gap-8 cursor-pointer shadow-[0_20px_60px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.02)] transition-transform duration-200 hover:-translate-y-1"
          onClick={() => window.location.href = dailySkill.link}
        >
          <div>
            <h3 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4 text-slate-900">
              {dailySkill.title}
            </h3>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed m-0">
              {dailySkill.description}
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border-l-4 border-blue-500">
            <div className="text-sm text-blue-500 font-bold mb-2">👨‍💻 전문가의 한 줄 평 (Point)</div>
            <p className="text-base md:text-lg text-slate-800 font-semibold m-0 leading-relaxed">
              {dailySkill.expertQuote}
            </p>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4">
            <span className="text-base text-slate-500 font-semibold">{dailySkill.rating}</span>
            <button className="bg-blue-500 hover:bg-blue-600 text-white border-none rounded-full px-6 py-3 font-semibold text-lg cursor-pointer transition-colors shadow-lg shadow-blue-500/30">
              {dailySkill.buttonText}
            </button>
          </div>
        </div>
      </div>

      {/* 🔥 주간 트렌드 피드 (Weekly Best) */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-slate-900 tracking-tight">🔥 주간 트렌드 피드</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {weeklyTrends.map((trend) => (
            <div 
              key={trend.id} 
              className="bg-white rounded-2xl p-8 cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.02)] transition-transform duration-200 hover:-translate-y-1 flex flex-col"
              onClick={() => window.location.href = trend.link}
            >
              <div className={`text-sm font-bold mb-2 ${trend.categoryColor}`}>{trend.category}</div>
              <h3 className="text-xl md:text-2xl font-extrabold mb-4 leading-snug text-slate-900">
                {trend.title}
              </h3>
              <p className="text-slate-600 text-base leading-relaxed mb-6 flex-1">
                {trend.description}
              </p>
              <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-auto">
                <span className="text-sm text-slate-500 font-semibold">{trend.rating}</span>
                <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 border-none rounded-xl px-4 py-2 font-semibold cursor-pointer transition-colors">
                  {trend.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 스킬 시스템 활용 가이드 (How it Works) */}
      <div className="bg-white rounded-[2rem] p-12 md:p-16 text-center shadow-[0_20px_60px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.02)]">
        <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight text-slate-900">{howItWorks.title}</h2>
        <p className="text-lg md:text-xl text-slate-600 mb-16">{howItWorks.subtitle}</p>

        <div className="flex flex-col md:flex-row justify-between items-start gap-8 text-left">
          {howItWorks.steps.map((step) => (
            <div key={step.id} className="flex-1 bg-slate-50 p-8 rounded-3xl border border-slate-100 w-full">
              <div className="text-5xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-extrabold mb-2 text-slate-900">{step.title}</h3>
              <p className="text-slate-500 leading-relaxed text-base">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
