import React, { useState } from 'react';
import { faqs } from '../data/landingData.js';
import toast from 'react-hot-toast';

export default function FAQ() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [csText, setCsText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (csText.trim().length < 10) {
      toast.error('상세한 답변을 위해 10자 이상 입력해 주세요.');
      return;
    }
    
    setIsModalOpen(false);
    toast.success('소중한 의견이 접수되었습니다! 담당자가 확인 후 연락드리겠습니다.', { duration: 4000 });

    const newInquiry = {
      id: Date.now(),
      category: '의견/피드백',
      email: '익명 사용자 (랜딩페이지)',
      title: '랜딩페이지 의견 접수',
      content: csText,
      status: '대기중',
      date: new Date().toLocaleDateString('ko-KR')
    };

    // 로컬 스토리지에 저장 (관리자 페이지 연동)
    const existing = JSON.parse(localStorage.getItem('support_inquiries') || '[]');
    localStorage.setItem('support_inquiries', JSON.stringify([newInquiry, ...existing]));

    // 메일 발송 API 호출
    try {
      await fetch('/api/send-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInquiry)
      });
    } catch (err) {
      console.error('메일 발송 실패:', err);
    }

    setCsText('');
  };

  return (
    <section className="mt-8 border-t border-black/5 pt-16">
      <h2 className="text-3xl font-extrabold mb-8 text-slate-900 text-center tracking-tight">자주 묻는 질문 (FAQ)</h2>
      <div className="flex flex-col gap-4">
        {faqs.map((faq, index) => (
          <div key={faq.id} className="bg-white rounded-2xl py-6 px-8 border-l-4 border-blue-500 shadow-sm">
            <h4 className="text-lg font-extrabold mb-2 text-slate-900">{faq.question}</h4>
            <p className="text-slate-600 m-0 leading-relaxed">{faq.answer}</p>
          </div>
        ))}
        
        {/* CTA Box */}
        <div className="bg-slate-50 rounded-2xl py-6 px-8 border border-black/5 flex justify-between items-center mt-4">
          <div>
            <h4 className="text-lg font-extrabold mb-1 text-slate-900">원하는 답변을 찾지 못하셨나요?</h4>
            <p className="text-slate-500 m-0">저희 팀에게 궁금한 점을 직접 남겨주시면 빠르게 답변해 드리겠습니다!</p>
          </div>
          <button 
            className="bg-slate-900 text-white border-none rounded-full py-2.5 px-6 font-semibold cursor-pointer transition-transform duration-200"
            onMouseEnter={() => setHoveredIndex('cta')}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => setIsModalOpen(true)}
            style={{ transform: hoveredIndex === 'cta' ? 'scale(1.05)' : 'scale(1)' }}
          >
            의견 남기기
          </button>
        </div>
      </div>

      {/* CS Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">고객 센터 문의하기</h3>
            <p className="text-slate-500 mb-6 text-sm">서비스 이용 중 불편하신 점이나 제안하실 내용을 남겨주세요.</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-900 font-medium focus:outline-none focus:border-blue-500 transition-colors resize-none h-32"
                placeholder="여기에 내용을 입력해 주세요... (최소 10자)"
                value={csText}
                onChange={(e) => setCsText(e.target.value)}
              />
              <div className="flex justify-end gap-3 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border-none cursor-pointer transition-colors"
                >
                  취소
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 border-none cursor-pointer transition-colors shadow-lg shadow-blue-500/30"
                >
                  문의 접수하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
