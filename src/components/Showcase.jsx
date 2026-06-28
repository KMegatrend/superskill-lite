import React from 'react';
import { packFeatures } from '../data/landingData.js';

export default function Showcase() {
  const ideationPack = packFeatures.find(p => p.id === 'ideation');
  const productivityPack = packFeatures.find(p => p.id === 'productivity');
  const writingPack = packFeatures.find(p => p.id === 'writing');

  return (
    <div className="flex flex-col gap-16 py-16">

      {/* Top Picks / New Updates Section */}
      <section className="text-center mb-8">
        <span className="inline-block px-4 py-1.5 rounded-full text-sm font-bold bg-amber-50 text-amber-600 border border-amber-200 mb-6 shadow-sm">
          🔥 이번 주 Top Picks
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-slate-900 tracking-tight">
          새롭게 업데이트된 베스트 스킬
        </h2>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto mb-12">
          AI SuperSkill에서 가장 높은 평가를 받은 프리미엄 큐레이션 스킬들을 만나보세요.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {/* Mock Top Pick Card 1 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => window.location.href='/marketplace.html'}>
            <div className="flex justify-between items-start mb-4">
              <span className="bg-gradient-to-r from-amber-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">🔥 에디터 추천</span>
              <span className="text-slate-400 text-sm">★ 5.0</span>
            </div>
            <h3 className="font-extrabold text-xl mb-2 text-slate-900">Next.js + Tailwind 완벽 보일러플레이트 세팅</h3>
            <p className="text-sm text-slate-500 mb-4 line-clamp-2">단 한 번의 명령어로 글로벌 스탠다드 프론트엔드 환경을 구축합니다.</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">#dev</span>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">#nextjs</span>
            </div>
          </div>
          
          {/* Mock Top Pick Card 2 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => window.location.href='/marketplace.html'}>
            <div className="flex justify-between items-start mb-4">
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">✨ 신규 업데이트</span>
              <span className="text-slate-400 text-sm">★ 4.9</span>
            </div>
            <h3 className="font-extrabold text-xl mb-2 text-slate-900">10년 차 카피라이터의 SEO 블로그 포스팅</h3>
            <p className="text-sm text-slate-500 mb-4 line-clamp-2">구글 검색 1페이지 노출을 위한 완벽한 SEO 최적화 글쓰기 에이전트.</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">#business</span>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">#seo</span>
            </div>
          </div>
          
          {/* Mock Top Pick Card 3 */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => window.location.href='/marketplace.html'}>
            <div className="flex justify-between items-start mb-4">
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">🚀 베스트셀러</span>
              <span className="text-slate-400 text-sm">★ 5.0</span>
            </div>
            <h3 className="font-extrabold text-xl mb-2 text-slate-900">시니어 디자이너의 UI/UX 색상 팔레트 추출기</h3>
            <p className="text-sm text-slate-500 mb-4 line-clamp-2">브랜드 키워드만 입력하면 완벽한 배색 조합과 CSS 변수를 뽑아줍니다.</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">#design</span>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">#ui</span>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <a href="/marketplace.html" className="inline-flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
            전체 큐레이션 스킬 둘러보기 <span>→</span>
          </a>
        </div>
      </section>
      
      {/* Zig-Zag Section 1: Ideation (was Designer) */}
      <section id="ideation" className="flex flex-col md:flex-row items-center justify-between gap-16">
        <div className="flex-1">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border border-purple-100 ${ideationPack.badgeBg} ${ideationPack.badgeColor}`}>
            {ideationPack.badgeText}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold my-4 tracking-tight text-slate-900">
            {ideationPack.title}
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            {ideationPack.description}
          </p>
          <ul className="list-none p-0 flex flex-col gap-4">
            {ideationPack.features.map((feat, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                <span className="text-emerald-500">✔️</span> {feat}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1 flex justify-center w-full">
          {/* Mockup Card */}
          <div className="bg-white rounded-3xl p-8 md:p-12 w-full max-w-sm shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-black/5 text-center relative">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mx-auto mb-6 flex items-center justify-center text-4xl shadow-[0_10px_20px_rgba(139,92,246,0.3)]">
              💡
            </div>
            <h3 className="text-2xl font-extrabold mb-1 text-slate-900">새로운 아이디어</h3>
            <p className="text-indigo-500 font-semibold text-sm mb-6">콘텐츠 기획자</p>
            <div className="flex justify-center gap-2 mb-8">
              <span className="bg-blue-50 text-blue-500 px-3 py-1 rounded-xl text-xs font-bold">기획</span>
              <span className="bg-purple-50 text-purple-500 px-3 py-1 rounded-xl text-xs font-bold">유튜브</span>
              <span className="bg-pink-50 text-pink-500 px-3 py-1 rounded-xl text-xs font-bold">마케팅</span>
            </div>
            <button className="bg-slate-900 text-white w-full border-none rounded-xl py-3 font-semibold cursor-pointer hover:bg-slate-800 transition-colors">
              생성 시작
            </button>
          </div>
        </div>
      </section>

      {/* Zig-Zag Section 2: Productivity (was Wizard) */}
      <section id="productivity" className="flex flex-col md:flex-row-reverse items-center justify-between gap-16">
        <div className="flex-1">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border border-blue-100 ${productivityPack.badgeBg} ${productivityPack.badgeColor}`}>
            {productivityPack.badgeText}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold my-4 tracking-tight text-slate-900">
            {productivityPack.title}
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            {productivityPack.description}
          </p>
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-black/5 p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <h4 className="font-bold mb-1 text-slate-900">복잡한 엑셀 수식 자동화</h4>
              <p className="text-sm text-slate-500 m-0">이제 엑셀 함수를 몰라도 자연어로 수식을 만드세요.</p>
            </div>
            <div className="bg-white border border-black/5 p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <h4 className="font-bold mb-1 text-slate-900">비즈니스 이메일 작성</h4>
              <p className="text-sm text-slate-500 m-0">상황에 맞는 예의 바르고 명확한 이메일 초안 생성</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex justify-center w-full">
          {/* Code Block Mockup -> Excel / Email Mockup */}
          <div className="bg-slate-900 rounded-2xl w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden font-mono text-sm">
            <div className="bg-slate-800 px-4 py-3 flex gap-2 items-center">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="p-8 text-slate-300 leading-loose">
              <span className="text-blue-400"># 요청사항</span><br />
              <span className="text-emerald-400">"이번 달 매출 데이터를 기준액 대비 달성률로 변환하는 엑셀 수식을 짜줘. 100% 미만이면 빨간색으로 표시하는 조건부 서식 규칙도 알려줘."</span><br />
              <br />
              <span className="text-slate-500">// 결과 생성 중...</span><br />
              <span className="text-purple-400">=IF(B2&gt;0, C2/B2, 0)</span><br />
              <span className="text-slate-500"># 자동화 완료</span>
            </div>
          </div>
        </div>
      </section>

      {/* Zig-Zag Section 3: Writing (was PM) */}
      <section id="writing" className="flex flex-col md:flex-row items-center justify-between gap-16">
        <div className="flex-1">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border border-green-100 ${writingPack.badgeBg} ${writingPack.badgeColor}`}>
            {writingPack.badgeText}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold my-4 tracking-tight text-slate-900">
            {writingPack.title}
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            {writingPack.description}
          </p>
          <ul className="list-none p-0 flex flex-col gap-4">
            {writingPack.features.map((feat, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                <span className="text-emerald-500">✔️</span> {feat}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1 flex justify-center w-full">
          {/* Document Mockup */}
          <div className="bg-white rounded-2xl w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-black/5 overflow-hidden">
            <div className="p-6 border-b border-black/5 flex justify-between items-center bg-slate-50">
              <div className="flex gap-2 items-center">
                <span className="text-2xl">📝</span>
                <span className="font-bold text-slate-900">블로그 포스팅 초안</span>
              </div>
              <span className="bg-yellow-100 text-yellow-600 text-[10px] font-extrabold px-2 py-1 rounded-full border border-yellow-300">
                작성 완료
              </span>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <h3 className="font-bold text-lg text-slate-800">초보자를 위한 AI 활용법 5가지</h3>
              <div className="h-2 bg-slate-100 rounded-full w-full"></div>
              <div className="h-2 bg-slate-100 rounded-full w-full"></div>
              <div className="h-2 bg-slate-100 rounded-full w-4/5"></div>
              
              <div className="mt-4 border border-black/5 rounded-xl p-4 bg-white">
                <h4 className="text-sm font-bold text-slate-500 mb-3 flex items-center gap-2">
                  <span className="text-base">🏷️</span> 추천 해시태그
                </h4>
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-green-50 text-green-600 text-xs font-bold px-2.5 py-1 rounded-md">#AI활용법</span>
                  <span className="bg-green-50 text-green-600 text-xs font-bold px-2.5 py-1 rounded-md">#초보자팁</span>
                  <span className="bg-green-50 text-green-600 text-xs font-bold px-2.5 py-1 rounded-md">#업무효율화</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
