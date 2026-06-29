import React, { useState, useEffect } from 'react';
import { dailySkill as defaultDaily, weeklyTrends as defaultWeekly, howItWorks } from '../data/featuresData';

function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const Features = () => {
  const [daily, setDaily] = useState(defaultDaily);
  const [weeklys, setWeeklys] = useState(defaultWeekly);

  useEffect(() => {
    fetch('/data/skill-registry.json')
      .then(res => res.json())
      .then(data => {
        if (!data || !data.skills) return;
        
        const goodSkills = data.skills.filter(s => parseFloat(s.rating || '0') >= 4.5);
        if (goodSkills.length < 3) return;

        const todayStr = new Date().toISOString().split('T')[0];
        const daySeed = parseInt(todayStr.replace(/-/g, ''), 10);
        const weekNum = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));

        const dailyIndex = Math.floor(seededRandom(daySeed) * goodSkills.length);
        const dailyData = goodSkills[dailyIndex];

        const w1Index = Math.floor(seededRandom(weekNum) * goodSkills.length);
        let w2Index = Math.floor(seededRandom(weekNum + 1) * goodSkills.length);
        if (w1Index === w2Index) w2Index = (w2Index + 1) % goodSkills.length;
        
        const w1Data = goodSkills[w1Index];
        const w2Data = goodSkills[w2Index];

        setDaily({
          badge: "Today",
          title: dailyData.name,
          description: dailyData.description,
          expertQuote: dailyData.beforeAfter ? dailyData.beforeAfter.after : "매일 반복되던 비효율적인 작업을 완전히 끝낼 수 있습니다.",
          rating: `⭐️ ${parseFloat(dailyData.rating || '5.0').toFixed(1)} (설치 후기 ${Math.floor((dailyData.downloads || 1500) / 10)}건)`,
          buttonText: "바로 확인하기",
          link: `/marketplace.html?category=${dailyData.categoryId}&highlight=${dailyData.id}`
        });

        const categoryMap = { 'dev': '개발 필수', 'business': '비즈니스/마케팅', 'design': '디자인/UI', 'translate': '번역/외국어' };

        setWeeklys([
          {
            id: w1Data.id,
            category: categoryMap[w1Data.categoryId] || '트렌드',
            categoryColor: "text-blue-500",
            title: w1Data.name,
            description: w1Data.description,
            rating: `⭐️ ${parseFloat(w1Data.rating || '5.0').toFixed(1)} 리뷰 보기`,
            buttonText: "둘러보기",
            link: `/marketplace.html?category=${w1Data.categoryId}&highlight=${w1Data.id}`
          },
          {
            id: w2Data.id,
            category: categoryMap[w2Data.categoryId] || '트렌드',
            categoryColor: "text-pink-500",
            title: w2Data.name,
            description: w2Data.description,
            rating: `⭐️ ${parseFloat(w2Data.rating || '5.0').toFixed(1)} 리뷰 보기`,
            buttonText: "둘러보기",
            link: `/marketplace.html?category=${w2Data.categoryId}&highlight=${w2Data.id}`
          }
        ]);
      })
      .catch(err => console.error("Failed to load skills for curation:", err));
  }, []);

  return (
    <section className="max-w-5xl mx-auto px-8 py-12 flex flex-col gap-24">
      {/* 🌟 오늘의 스킬 (Daily Card News) */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-blue-50 text-blue-500 border border-blue-100 px-3 py-1 rounded-full font-bold text-sm">
            {daily.badge}
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight m-0">오늘의 스킬 큐레이션</h2>
        </div>

        <div 
          className="bg-white rounded-3xl p-8 md:p-12 flex flex-col gap-8 cursor-pointer shadow-[0_20px_60px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.02)] transition-transform duration-200 hover:-translate-y-1"
          onClick={() => window.location.href = daily.link}
        >
          <div>
            <h3 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4 text-slate-900">
              {daily.title}
            </h3>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed m-0 line-clamp-2">
              {daily.description}
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 border-l-4 border-blue-500">
            <div className="text-sm text-blue-500 font-bold mb-2">👨‍💻 전문가의 한 줄 평 (Point)</div>
            <p className="text-base md:text-lg text-slate-800 font-semibold m-0 leading-relaxed">
              {daily.expertQuote}
            </p>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-4">
            <span className="text-base text-slate-500 font-semibold">{daily.rating}</span>
            <button className="bg-blue-500 hover:bg-blue-600 text-white border-none rounded-full px-6 py-3 font-semibold text-lg cursor-pointer transition-colors shadow-lg shadow-blue-500/30">
              {daily.buttonText}
            </button>
          </div>
        </div>
      </div>

      {/* 🔥 주간 베스트 스킬 (Weekly Best) */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-slate-900 tracking-tight">🔥 주간 베스트 스킬</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {weeklys.map((trend, idx) => (
            <div 
              key={trend.id || idx} 
              className="bg-white rounded-2xl p-8 cursor-pointer shadow-[0_10px_30px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.02)] transition-transform duration-200 hover:-translate-y-1 flex flex-col"
              onClick={() => window.location.href = trend.link}
            >
              <div className={`text-sm font-bold mb-2 ${trend.categoryColor}`}>{trend.category}</div>
              <h3 className="text-xl md:text-2xl font-extrabold mb-4 leading-snug text-slate-900 line-clamp-2">
                {trend.title}
              </h3>
              <p className="text-slate-600 text-base leading-relaxed mb-6 flex-1 line-clamp-3">
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
    </section>
  );
};

export default Features;
