import React from 'react';
import { packFeatures } from '../data/landingData.js';

export default function Showcase() {
  const designerPack = packFeatures.find(p => p.id === 'designer');
  const wizardPack = packFeatures.find(p => p.id === 'wizard');
  const pmPack = packFeatures.find(p => p.id === 'pm');

  return (
    <div className="flex flex-col gap-16 py-16">
      
      {/* Zig-Zag Section 1: Designer */}
      <section id="designer" className="flex flex-col md:flex-row items-center justify-between gap-16">
        <div className="flex-1">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border border-purple-100 ${designerPack.badgeBg} ${designerPack.badgeColor}`}>
            {designerPack.badgeText}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold my-4 tracking-tight text-slate-900">
            {designerPack.title}
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            <code className="bg-slate-100 px-1 rounded text-slate-800 text-sm">ui-ux-pro-max</code>, <code className="bg-slate-100 px-1 rounded text-slate-800 text-sm">canvas-design</code> 스킬을 통해 단순한 와이어프레임을 모던하고 매력적인 인터페이스로 변환합니다.
          </p>
          <ul className="list-none p-0 flex flex-col gap-4">
            {designerPack.features.map((feat, i) => (
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
              🧑‍💻
            </div>
            <h3 className="text-2xl font-extrabold mb-1 text-slate-900">John Doe</h3>
            <p className="text-indigo-500 font-semibold text-sm mb-6">Senior Product Designer</p>
            <div className="flex justify-center gap-2 mb-8">
              <span className="bg-blue-50 text-blue-500 px-3 py-1 rounded-xl text-xs font-bold">REACT</span>
              <span className="bg-purple-50 text-purple-500 px-3 py-1 rounded-xl text-xs font-bold">UX/UI</span>
              <span className="bg-pink-50 text-pink-500 px-3 py-1 rounded-xl text-xs font-bold">3D</span>
            </div>
            <button className="bg-slate-900 text-white w-full border-none rounded-xl py-3 font-semibold cursor-pointer hover:bg-slate-800 transition-colors">
              Send Message
            </button>
          </div>
        </div>
      </section>

      {/* Zig-Zag Section 2: Code (Reversed) */}
      <section id="wizard" className="flex flex-col md:flex-row-reverse items-center justify-between gap-16">
        <div className="flex-1">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border border-blue-100 ${wizardPack.badgeBg} ${wizardPack.badgeColor}`}>
            {wizardPack.badgeText}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold my-4 tracking-tight text-slate-900">
            {wizardPack.title}
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            <code className="bg-slate-100 px-1 rounded text-slate-800 text-sm">react-patterns</code>, <code className="bg-slate-100 px-1 rounded text-slate-800 text-sm">tailwind-patterns</code> 스킬이 스파게티 코드를 방지하고, 유지보수 가능한 엔터프라이즈급 코드를 작성합니다.
          </p>
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-black/5 p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <h4 className="font-bold mb-1 text-slate-900">React Best Practices</h4>
              <p className="text-sm text-slate-500 m-0">Custom Hooks, Context API 최적화 자동 적용</p>
            </div>
            <div className="bg-white border border-black/5 p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <h4 className="font-bold mb-1 text-slate-900">SEO & Accessibility</h4>
              <p className="text-sm text-slate-500 m-0">Semantic HTML 및 메타 태그 최적화</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex justify-center w-full">
          {/* Code Block Mockup */}
          <div className="bg-slate-900 rounded-2xl w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden font-mono text-sm">
            <div className="bg-slate-800 px-4 py-3 flex gap-2 items-center">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="p-8 text-slate-300 leading-loose">
              <span className="text-blue-400">&lt;button</span><br />
              &nbsp;&nbsp;<span className="text-purple-400">className</span>=<span className="text-emerald-400">"flex items-center justify-center px-6 py-3<br />
              &nbsp;&nbsp;bg-blue-600 hover:bg-blue-700<br />
              &nbsp;&nbsp;text-white font-medium rounded-lg<br />
              &nbsp;&nbsp;transition-all shadow-lg hover:shadow-blue-500/30"</span><span className="text-blue-400">&gt;</span><br />
              &nbsp;&nbsp;<span className="text-blue-400">&lt;span&gt;</span>Click Me<span className="text-blue-400">&lt;/span&gt;</span><br />
              &nbsp;&nbsp;<span className="text-blue-400">&lt;Icon</span> <span className="text-purple-400">name</span>=<span className="text-emerald-400">"arrow-right"</span> <span className="text-purple-400">className</span>=<span className="text-emerald-400">"ml-2"</span> <span className="text-blue-400">/&gt;</span><br />
              <span className="text-blue-400">&lt;/button&gt;</span><br />
              <span className="text-slate-500">// Optimized with Tailwind & Accessibility</span>
            </div>
          </div>
        </div>
      </section>

      {/* Zig-Zag Section 3: PM */}
      <section id="pm" className="flex flex-col md:flex-row items-center justify-between gap-16">
        <div className="flex-1">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border border-green-100 ${pmPack.badgeBg} ${pmPack.badgeColor}`}>
            {pmPack.badgeText}
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold my-4 tracking-tight text-slate-900">
            {pmPack.title}
          </h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-8">
            <code className="bg-slate-100 px-1 rounded text-slate-800 text-sm">pm-master</code>, <code className="bg-slate-100 px-1 rounded text-slate-800 text-sm">logic-architect</code> 스킬을 통해 모호한 아이디어를 구체적인 PRD(제품 요구사항 정의서)와 비즈니스 로직으로 구조화합니다.
          </p>
          <ul className="list-none p-0 flex flex-col gap-4">
            {pmPack.features.map((feat, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                <span className="text-emerald-500">✔️</span> {feat}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1 flex justify-center w-full">
          {/* PRD Document Mockup */}
          <div className="bg-white rounded-2xl w-full max-w-md shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-black/5 overflow-hidden">
            <div className="p-6 border-b border-black/5 flex justify-between items-center bg-slate-50">
              <div className="flex gap-2 items-center">
                <span className="text-2xl">📝</span>
                <span className="font-bold text-slate-900">PRD: AI Super Skill</span>
              </div>
              <span className="bg-yellow-100 text-yellow-600 text-[10px] font-extrabold px-2 py-1 rounded-full border border-yellow-300">
                IN PROGRESS
              </span>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="h-3 bg-slate-100 rounded-full w-4/5"></div>
              <div className="h-3 bg-slate-100 rounded-full w-3/5"></div>
              <div className="h-3 bg-slate-100 rounded-full w-11/12"></div>
              
              <div className="mt-4 border border-black/5 rounded-xl p-4 bg-white">
                <h4 className="text-sm font-bold text-slate-500 mb-3 flex items-center gap-2">
                  <span className="text-base">🗃️</span> Database Schema
                </h4>
                <div className="flex gap-2 flex-wrap">
                  <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-md">Users</span>
                  <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-md">Skills</span>
                  <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-md">Reviews</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
