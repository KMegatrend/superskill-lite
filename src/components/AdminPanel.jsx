import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AdminPanel({ onBack }) {
  const [users, setUsers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('support_inquiries') || '[]');
      stored.sort((a, b) => b.id - a.id);
      setInquiries(stored);
    } catch (e) {}
  }, []);

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

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!selectedInquiry || !replyText.trim()) return;

    try {
      const stored = JSON.parse(localStorage.getItem('support_inquiries') || '[]');
      const updated = stored.map(iq => {
        if (iq.id === selectedInquiry.id) {
          return { ...iq, status: '답변 완료', adminReply: replyText, replyDate: new Date().toLocaleDateString('ko-KR') };
        }
        return iq;
      });
      localStorage.setItem('support_inquiries', JSON.stringify(updated));
      
      updated.sort((a, b) => b.id - a.id);
      setInquiries(updated);
      setSelectedInquiry(null);
      setReplyText('');
      toast.success('답변이 등록되었습니다.');
    } catch (e) {
      toast.error('오류가 발생했습니다.');
    }
  };

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
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden mb-10">
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

        {/* 고객센터 게시판 */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-bold text-white">고객센터 문의 내역</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 text-sm">
                  <th className="p-4 font-bold">분류</th>
                  <th className="p-4 font-bold">이메일</th>
                  <th className="p-4 font-bold">제목 / 내용</th>
                  <th className="p-4 font-bold">상태</th>
                  <th className="p-4 font-bold text-right">작성일</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((iq) => (
                  <tr 
                    key={iq.id} 
                    className="border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors cursor-pointer"
                    onClick={() => { setSelectedInquiry(iq); setReplyText(iq.adminReply || ''); }}
                  >
                    <td className="p-4">
                      <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-xs font-bold">
                        {iq.category}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-300">{iq.email}</td>
                    <td className="p-4 text-white font-medium max-w-xs">
                      <div className="truncate">{iq.title}</div>
                      <div className="text-xs text-slate-500 mt-1 truncate">{iq.content}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-bold">
                        {iq.status}
                      </span>
                    </td>
                    <td className="p-4 text-right text-slate-400">{iq.date}</td>
                  </tr>
                ))}
                {inquiries.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">접수된 문의가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 문의 답변 모달 */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl w-full max-w-2xl border border-slate-700 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">문의 내용 및 답변</h2>
              <button onClick={() => setSelectedInquiry(null)} className="text-slate-400 hover:text-white transition-colors text-2xl leading-none">
                &times;
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6 bg-slate-900/50 p-5 rounded-xl border border-slate-700/50">
                <div className="flex gap-2 items-center mb-3">
                  <span className="px-2.5 py-1 bg-slate-700 text-slate-300 rounded-md text-xs font-bold">{selectedInquiry.category}</span>
                  <span className="text-sm font-mono text-slate-400">{selectedInquiry.email}</span>
                  <span className="text-xs text-slate-500 ml-auto">{selectedInquiry.date}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{selectedInquiry.title}</h3>
                <p className="text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">{selectedInquiry.content}</p>
              </div>

              <form onSubmit={handleReplySubmit}>
                <label className="block text-sm font-bold text-slate-300 mb-2">관리자 답변</label>
                <textarea 
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors mb-4 resize-none"
                  rows="5"
                  placeholder="사용자에게 전달할 답변을 작성하세요."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  required
                ></textarea>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setSelectedInquiry(null)} className="px-5 py-2.5 rounded-xl text-slate-400 hover:bg-slate-700 transition-colors font-bold text-sm">취소</button>
                  <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors font-bold text-sm">답변 등록</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
