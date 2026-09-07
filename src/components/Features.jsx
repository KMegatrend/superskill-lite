import React, { useState, useEffect } from 'react';
import { dailySkill as defaultDaily, weeklyTrends as defaultWeekly } from '../data/featuresData';

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
          id: dailyData.id,
          badge: "Today's Pick",
          title: dailyData.name,
          description: dailyData.description,
          role: dailyData.role || "에이전트 시니어 전문가",
          expertQuote: dailyData.beforeAfter ? dailyData.beforeAfter.after : "매일 반복되던 비효율적인 작업을 완전히 끝낼 수 있습니다.",
          rating: `⭐️ ${parseFloat(dailyData.rating || '5.0').toFixed(1)} (설치 ${Math.floor((dailyData.downloads || 1500) / 10)}건)`,
          buttonText: "패키지 확인하기",
          link: `/marketplace.html?category=${dailyData.categoryId}&highlight=${dailyData.id}`
        });

        const categoryMap = { 'dev': '코딩/개발', 'business': '비즈니스', 'design': '디자인/UI', 'docs': '기획/문서' };

        setWeeklys([
          {
            id: w1Data.id,
            category: categoryMap[w1Data.categoryId] || '트렌드',
            categoryColor: "text-blue-600",
            title: w1Data.name,
            description: w1Data.description,
            role: w1Data.role,
            rating: `⭐️ ${parseFloat(w1Data.rating || '5.0').toFixed(1)} 리뷰`,
            buttonText: "설치하기",
            link: `/marketplace.html?category=${w1Data.categoryId}&highlight=${w1Data.id}`
          },
          {
            id: w2Data.id,
            category: categoryMap[w2Data.categoryId] || '트렌드',
            categoryColor: "text-indigo-600",
            title: w2Data.name,
            description: w2Data.description,
            role: w2Data.role,
            rating: `⭐️ ${parseFloat(w2Data.rating || '5.0').toFixed(1)} 리뷰`,
            buttonText: "설치하기",
            link: `/marketplace.html?category=${w2Data.categoryId}&highlight=${w2Data.id}`
          }
        ]);
      })
      .catch(err => console.error("Failed to load skills for curation:", err));
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-16 flex flex-col gap-16 md:gap-24">
      {/* 🧠 3대 패키지 매니저 혁신 비교 섹션 */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 border border-slate-800">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-blue-400 font-mono text-xs uppercase tracking-widest font-bold">Why SuperSkill Package Manager</span>
          <h2 className="text-2xl md:text-3xl font-extrabold mt-2 mb-4 tracking-tight">
            왜 복사-붙여넣기보다 <span className="text-blue-400">패키지 매니저</span>인가요?
          </h2>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed">
            방대한 프롬프트 텍스트를 대화창에 복사해 넣으면 AI가 중요한 규칙을 잊어버립니다.<br className="hidden md:inline" />
            슈퍼스킬 패키지 매니저는 에이전트가 100% 성능을 낼 수 있도록 원본 파일 트리를 안전하게 공급합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-lg mb-4">
              01
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">Lost in the Middle 원천 차단</h3>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
              수만 자의 텍스트가 컨텍스트 윈도우를 과부하시켜 중간 룰을 망각하는 AI 인지 결함을 온디맨드 로딩 구조로 해결합니다.
            </p>
          </div>

          <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg mb-4">
              02
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">점진적 탐색 (Progressive Disclosure)</h3>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
              평소에는 목차(SKILL.md)만 가볍게 파악하고 있다가, 실제 작업 시에만 세부 검증 가이드(references/)를 정독하여 지능을 극대화합니다.
            </p>
          </div>

          <div className="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg mb-4">
              03
            </div>
            <h3 className="text-lg font-bold mb-2 text-white">터미널 1초 원클릭 자동 설치</h3>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
              <code className="text-amber-300 font-mono text-xs">npx superskill add [스킬]</code> 한 줄만 치면 프로젝트의 <code className="text-slate-300 font-mono text-xs">.agents/skills/</code>에 파일이 자동 복사됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* 🌟 오늘의 스킬 큐레이션 */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold text-xs font-mono">
            {daily.badge}
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight m-0">오늘의 추천 에이전트 패키지</h2>
        </div>

        <div 
          className="bg-white rounded-3xl p-6 md:p-10 flex flex-col gap-6 cursor-pointer border border-slate-200 shadow-sm hover:border-blue-400 transition-colors"
          onClick={() => window.location.href = daily.link}
        >
          <div>
            {daily.role && (
              <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-md mb-3">
                {daily.role}
              </span>
            )}
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3 text-slate-900">
              {daily.title}
            </h3>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed m-0 line-clamp-2">
              {daily.description}
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-5 border-l-4 border-blue-600">
            <div className="text-xs text-blue-600 font-bold mb-1">💡 도입 후 기대 변화</div>
            <p className="text-sm md:text-base text-slate-800 font-semibold m-0 leading-relaxed">
              {daily.expertQuote}
            </p>
          </div>

          {/* Quick CLI snippet inside card */}
          <div className="bg-slate-950 text-slate-200 font-mono text-xs p-3 rounded-lg flex items-center justify-between">
            <span>$ npx superskill add {daily.id || 'luxury-agency-web-designer'}</span>
            <span className="text-blue-400 font-semibold text-xs">원클릭 설치 ➔</span>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-4 border-t border-slate-100 gap-4 md:gap-0">
            <span className="text-sm text-slate-500 font-medium">{daily.rating}</span>
            <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white border-none rounded-xl py-2.5 px-6 font-semibold text-sm cursor-pointer transition-colors">
              {daily.buttonText}
            </button>
          </div>
        </div>
      </div>

      {/* 🔥 주간 베스트 스킬 */}
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold mb-6 text-slate-900 tracking-tight">🔥 주간 베스트 패키지</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {weeklys.map((trend, idx) => (
            <div 
              key={trend.id || idx} 
              className="bg-white rounded-2xl p-6 md:p-8 cursor-pointer border border-slate-200 shadow-sm hover:border-blue-400 transition-colors flex flex-col"
              onClick={() => window.location.href = trend.link}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold ${trend.categoryColor}`}>{trend.category}</span>
                {trend.role && (
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium truncate max-w-[180px]">
                    {trend.role}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold mb-3 leading-snug text-slate-900 line-clamp-2">
                {trend.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1 line-clamp-2">
                {trend.description}
              </p>
              
              <div className="bg-slate-950 text-slate-300 font-mono text-xs px-3 py-2 rounded-lg mb-4 flex items-center justify-between">
                <span>$ npx superskill add {trend.id}</span>
                <span className="text-emerald-400">⚡ 100%</span>
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 pt-3 mt-auto">
                <span className="text-xs text-slate-500 font-medium">{trend.rating}</span>
                <button className="bg-slate-100 hover:bg-slate-200 text-slate-800 border-none rounded-lg px-4 py-1.5 font-semibold text-xs cursor-pointer transition-colors">
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
