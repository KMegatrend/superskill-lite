import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AdminPanel({ onBack }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin-data')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUsers(data.users);
        } else {
          toast.error(data.error || '데이터를 불러오는데 실패했습니다.');
        }
      })
      .catch(() => toast.error('서버 통신 오류'))
      .finally(() => setIsLoading(false));
  }, []);

  const totalUsers = users.length;
  const paidUsers = users.filter(u => u.data.plan.type === 'PRO' || u.data.plan.type === 'PREMIUM').length;
  const totalUsage = users.reduce((acc, u) => acc + (u.data.plan.usage || 0), 0);

  if (isLoading) {
    return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center font-bold">관리자 데이터 로딩 중...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              👑 마스터 관리자 패널
            </h1>
            <p className="text-slate-400 mt-2">전체 회원 및 결제 현황 모니터링</p>
          </div>
          <button 
            onClick={onBack}
            className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-bold transition-colors"
          >
            돌아가기
          </button>
        </div>

        {/* KPI 위젯 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-slate-400 font-bold mb-2">총 가입 고객</h3>
            <p className="text-4xl font-black text-white">{totalUsers}명</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 border-t-4 border-t-blue-500">
            <h3 className="text-slate-400 font-bold mb-2">유료 결제 고객 (PRO/PREMIUM)</h3>
            <p className="text-4xl font-black text-blue-400">{paidUsers}명</p>
          </div>
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 border-t-4 border-t-purple-500">
            <h3 className="text-slate-400 font-bold mb-2">누적 API 사용량</h3>
            <p className="text-4xl font-black text-purple-400">{totalUsage} 호출</p>
          </div>
        </div>

        {/* 사용자 테이블 */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white">가입자 상세 목록</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 text-sm">
                  <th className="p-4 font-bold">아이디 (ID)</th>
                  <th className="p-4 font-bold">이름/프로필</th>
                  <th className="p-4 font-bold">플랜</th>
                  <th className="p-4 font-bold">사용량</th>
                  <th className="p-4 font-bold text-right">스킬 개수</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="p-4 font-bold text-blue-300">{user.id}</td>
                    <td className="p-4">
                      <div>{user.data.profile?.name || '미설정'}</div>
                      <div className="text-xs text-slate-500">{user.data.profile?.job || ''}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        user.data.plan?.type === 'BASIC' ? 'bg-slate-700 text-slate-300' :
                        user.data.plan?.type === 'PRO' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {user.data.plan?.type || 'BASIC'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300 font-mono">
                      {user.data.plan?.usage || 0}
                    </td>
                    <td className="p-4 text-right text-slate-400">
                      {user.data.skills?.length || 0} 개
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">가입된 사용자가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
