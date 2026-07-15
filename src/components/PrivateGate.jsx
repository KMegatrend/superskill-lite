import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Sparkles } from 'lucide-react';

export default function PrivateGate({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    fetch('/api/check-auth')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          setIsAuthenticated(true);
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsMounted(true);
        setIsChecking(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        localStorage.setItem('site_role', data.role || 'user');
        if (data.plan === 'PRO') {
          localStorage.setItem('user_plan', JSON.stringify({ type: 'PRO', status: 'ACTIVE', cycle: 'yearly' }));
        }
        setIsAuthenticated(true);
      } else {
        setError(data.error || '처리 중 오류가 발생했습니다.');
      }
    } catch (err) {
      setError('서버 통신에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // SSR/Hydration 에러 방지 및 로딩 처리
  if (!isMounted || isChecking) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-500 font-bold">인증 정보 확인 중...</div>;

  if (isAuthenticated) {
    return children;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-blue-500 selection:text-white">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden">
        {/* 장식용 그라데이션 */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
        
        <div className="text-center mb-8 mt-2">
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/logo_superskill_black.svg" 
              alt="AI Super Skill Logo" 
              className="w-[320px] h-[110px] object-contain" 
              style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden', WebkitFontSmoothing: 'antialiased' }} 
            />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            회원 로그인
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            아이디와 비밀번호를 입력해주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">ID</label>
            <input 
              type="text" 
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium transition-all"
              placeholder="아이디를 입력하세요"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 text-slate-900 font-medium transition-all"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-sm font-bold text-center bg-red-50 p-2 rounded-lg m-0">
              {error}
            </p>
          )}

          <button 
            type="submit"
            className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl mt-2 hover:bg-slate-800 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            안전하게 접속하기
          </button>
        </form>
        
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-slate-400 text-xs font-bold">또는</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            type="button"
            onClick={() => toast('카카오 소셜 로그인은 API 연동 대기 중입니다.', { icon: '🚧' })}
            className="w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl transition-all shadow-sm hover:shadow-md bg-[#FEE500] text-[#000000] hover:bg-[#F4DC00] border-none cursor-pointer"
          >
            카카오로 시작하기
          </button>
          
          <button 
            type="button"
            onClick={() => toast('네이버 소셜 로그인은 API 연동 대기 중입니다.', { icon: '🚧' })}
            className="w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl transition-all shadow-sm hover:shadow-md bg-[#03C75A] text-white hover:bg-[#02B351] border-none cursor-pointer"
          >
            네이버로 시작하기
          </button>

          <button 
            type="button"
            onClick={() => toast('구글 소셜 로그인은 API 연동 대기 중입니다.', { icon: '🚧' })}
            className="w-full flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl transition-all shadow-sm hover:shadow-md bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 cursor-pointer"
          >
            구글로 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
