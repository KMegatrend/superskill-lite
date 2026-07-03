import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { LayoutDashboard, Wrench, CreditCard, Bot, Settings, Headphones, Crown, ShoppingCart, Home, LogOut, Sun, Moon } from 'lucide-react';

const INITIAL_SKILLS = [
  { id: 1, name: 'ui-ux-pro-max', category: 'Designer Pack', usage: 14, status: true },
  { id: 2, name: 'react-patterns', category: 'Web Wizard Pack', usage: 32, status: true },
  { id: 3, name: 'pm-master', category: 'Product Manager Pack', usage: 5, status: false }
];

const INITIAL_PROFILE = {
  name: '관리자',
  email: 'admin@super-skill.ai'
};

const INITIAL_PLAN = {
  type: 'BASIC', // Changed default to BASIC to show payment flow
  status: 'ACTIVE',
  cycle: 'monthly'
};

export default function Dashboard({ onSignOut, onAdmin, onMarketplace }) {
  const [activeTab, setActiveTab] = useState('billing'); // Defaulting to billing for easier testing
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  
  // State
  const [skills, setSkills] = useState(INITIAL_SKILLS);
  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [plan, setPlan] = useState(INITIAL_PLAN);
  const [userId, setUserId] = useState(null);

  // Payment UI State
  const [isYearly, setIsYearly] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState('select'); // 'select' | 'qr'
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  
  // AI Settings State
  const [aiApiKey, setAiApiKey] = useState('');

  // User Inquiries
  const [myInquiries, setMyInquiries] = useState([]);

  // Load from API on mount
  useEffect(() => {
    // Load local storage AI key
    const key = localStorage.getItem('gemini_api_key');
    if (key) setAiApiKey(key);

    const inquiries = JSON.parse(localStorage.getItem('support_inquiries') || '[]');
    setMyInquiries(inquiries);

    const fetchData = async () => {
      try {
        // 1. Fetch user profile from API
        const res = await fetch('/api/user-data');
        const json = await res.json();
        
        const localPlanStr = localStorage.getItem('user_plan');
        const localPlan = localPlanStr ? JSON.parse(localPlanStr) : null;

        if (json.success && json.data) {
          if (json.userId) setUserId(json.userId);
          if (json.data.profile && Object.keys(json.data.profile).length > 0) setProfile(json.data.profile);
          
          if (json.data.plan && Object.keys(json.data.plan).length > 0 && json.data.plan.type !== 'BASIC') {
            setPlan(json.data.plan);
          } else if (localPlan) {
            setPlan(localPlan);
          }
        } else if (localPlan) {
           setPlan(localPlan);
        }

        // 2. Sync Skills from Local Storage & Registry (Marketplace Sync)
        const installedSkillsStr = localStorage.getItem('installed_skills');
        if (installedSkillsStr) {
          const installedSkillsMap = JSON.parse(installedSkillsStr);
          const activeSkillsMap = JSON.parse(localStorage.getItem('active_skills') || '{}');
          
          const registryRes = await fetch('/data/skill-registry.json');
          if (registryRes.ok) {
            const registry = await registryRes.json();
            const syncedSkills = [];
            
            Object.keys(installedSkillsMap).forEach(skillId => {
              const registrySkill = registry.skills?.find(s => s.id === skillId);
              if (registrySkill) {
                syncedSkills.push({
                  id: skillId,
                  name: registrySkill.name,
                  category: registrySkill.category || 'Custom Skill',
                  usage: Math.floor(Math.random() * 20), // Mock usage for now
                  status: activeSkillsMap[skillId] !== false // Default to true unless explicitly disabled
                });
              }
            });
            
            setSkills(syncedSkills);
          }
        } else {
          // No skills installed
          setSkills([]);
        }

      } catch (err) {
        console.error('Failed to load user data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helpers to save state
  const updateSkills = async (newSkills) => {
    setSkills(newSkills);
    // Save active status to localStorage to sync with Marketplace state
    const activeSkillsMap = {};
    newSkills.forEach(s => {
      activeSkillsMap[s.id] = s.status;
    });
    localStorage.setItem('active_skills', JSON.stringify(activeSkillsMap));
  };

  const updateProfile = async (newProfile) => {
    setProfile(newProfile);
    try {
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'profile', payload: newProfile })
      });
    } catch (e) {}
  };

  const updatePlan = async (newPlan) => {
    setPlan(newPlan);
    localStorage.setItem('user_plan', JSON.stringify(newPlan));
    try {
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'plan', payload: newPlan })
      });
    } catch (e) {}
  };

  // Handlers
  const handleToggleSkill = (id) => {
    // If BASIC plan, restrict to max 2 active skills
    if (plan.type === 'BASIC') {
      const activeCount = skills.filter(s => s.status).length;
      const targetSkill = skills.find(s => s.id === id);
      if (!targetSkill.status && activeCount >= 2) {
        toast('BASIC 플랜은 최대 2개의 스킬만 활성화할 수 있습니다.', { icon: '🔒' });
        setTimeout(() => toast('무제한으로 사용하려면 PRO 플랜으로 업그레이드 해주세요!', { icon: '💡' }), 500);
        setActiveTab('billing');
        return;
      }
    }

    const newSkills = skills.map(skill => 
      skill.id === id ? { ...skill, status: !skill.status } : skill
    );
    updateSkills(newSkills);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    updateProfile({
      name: formData.get('name'),
      email: formData.get('email')
    });
    toast.success('프로필 정보가 성공적으로 업데이트 되었습니다.');
  };

  const handleDeleteAccount = () => {
    setShowDeleteModal(true);
    setDeleteInput('');
  };

  const confirmDeleteAccount = async () => {
    if (deleteInput !== '탈퇴 확인') {
      toast.error('입력한 문구가 일치하지 않습니다.');
      return;
    }
    try {
      await fetch('/api/user-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'all', payload: { skills: [], profile: {}, plan: { type: 'BASIC', usage: 0 } } })
      });
      await fetch('/api/logout');
    } catch(e) {}
    toast.success('계정이 성공적으로 삭제되었습니다. 이용해 주셔서 감사합니다.', { duration: 3000 });
    setTimeout(() => window.location.reload(), 1500);
  };

  const handleSaveAiKey = (e) => {
    e.preventDefault();
    const key = new FormData(e.target).get('aiKey').trim();
    if (key) {
      localStorage.setItem('gemini_api_key', key);
      setAiApiKey(key);
      toast.success('Gemini API 키가 로컬 스토리지에 안전하게 저장되었습니다.');
      e.target.reset();
    } else {
      toast.error('API 키를 입력해주세요.');
    }
  };

  const handleDeleteAiKey = () => {
    if (window.confirm("저장된 API 키를 브라우저에서 완전히 삭제하시겠습니까?")) {
      localStorage.removeItem('gemini_api_key');
      setAiApiKey('');
      toast.success('API 키가 삭제되었습니다.');
    }
  };

  const handleSelectPaymentMethod = (method) => {
    setSelectedMethod(method);
    setPaymentStep('qr');
  };

  const handleProcessPayment = () => {
    setIsProcessing(true);

    // Simulate network request for payment gateway
    setTimeout(() => {
      setIsProcessing(false);
      setShowPaymentModal(false);
      setPaymentStep('select');
      updatePlan({ 
        type: 'PRO', 
        status: 'ACTIVE', 
        cycle: isYearly ? 'yearly' : 'monthly' 
      });
      toast.success('결제가 성공적으로 완료되었습니다!\n이제 PRO 플랜의 모든 기능을 사용할 수 있습니다.', { duration: 4000 });
    }, 1500);
  };

  const handleCancelSubscription = () => {
    if (plan.status === 'CANCELED') {
      toast.error('이미 구독이 취소된 상태입니다.');
      return;
    }
    const confirmCancel = window.confirm("정말 구독을 취소하시겠습니까?\n다음 결제일에 서비스가 종료됩니다.");
    if (confirmCancel) {
      updatePlan({ ...plan, status: 'CANCELED' });
      toast.success('구독이 취소되었습니다.');
    }
  };

  // Derived data
  const activeSkillCount = skills.filter(s => s.status).length;
  const totalUsage = skills.reduce((acc, curr) => acc + curr.usage, 0);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.05)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] dark:hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:border-cyan-300 dark:hover:border-cyan-500/50 transition-all duration-300 group cursor-default relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-5 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500 text-cyan-500 dark:text-cyan-400">
                  <LayoutDashboard size={80} />
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2 flex items-center gap-2">
                  <Wrench size={16} className="text-cyan-500" /> 활성화된 스킬
                </h3>
                <p className="text-3xl font-black text-slate-800 dark:text-white m-0 drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">{activeSkillCount}<span className="text-lg font-semibold text-cyan-600 dark:text-cyan-400/70 ml-1">개</span></p>
              </div>
              <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.05)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] dark:hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:border-blue-300 dark:hover:border-blue-500/50 transition-all duration-300 group cursor-default relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-5 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500 text-blue-500 dark:text-blue-400">
                  <Bot size={80} />
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2 flex items-center gap-2">
                  <LayoutDashboard size={16} className="text-blue-500" /> 이번 달 사용량
                </h3>
                <p className="text-3xl font-black text-slate-800 dark:text-white m-0 drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">{totalUsage}<span className="text-lg font-semibold text-blue-600 dark:text-blue-400/70 ml-1">회</span></p>
              </div>
              <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.05)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(217,70,239,0.1)] dark:hover:shadow-[0_0_20px_rgba(217,70,239,0.2)] hover:border-fuchsia-300 dark:hover:border-fuchsia-500/50 transition-all duration-300 group cursor-default relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 dark:opacity-5 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500 text-fuchsia-500 dark:text-fuchsia-400">
                  <Crown size={80} />
                </div>
                <h3 className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2 flex items-center gap-2">
                  <CreditCard size={16} className="text-fuchsia-500" /> 멤버십 등급
                </h3>
                <p className={`text-xl font-black m-0 mt-1 flex items-center gap-2 drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] ${plan.type === 'PRO' ? 'text-fuchsia-500 dark:text-fuchsia-400' : 'text-slate-600 dark:text-slate-300'}`}>
                  {plan.type === 'PRO' && <Crown size={20} className="text-fuchsia-500 drop-shadow-[0_0_5px_rgba(217,70,239,0.4)] dark:drop-shadow-[0_0_5px_rgba(217,70,239,0.8)]" />} {plan.type} Plan
                </p>
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2 drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">
              <Bot size={20} className="text-cyan-500 dark:text-cyan-400" /> 최근 사용 내역
            </h2>
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.05)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors duration-300 group cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400 text-xs font-bold px-2.5 py-1.5 rounded-md shadow-[0_0_10px_rgba(6,182,212,0.1)] dark:shadow-[0_0_10px_rgba(34,211,238,0.2)] border border-cyan-200 dark:border-cyan-500/30">react-patterns</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300 font-medium group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">로그인 페이지 리팩토링</span>
                </div>
                <span className="text-xs text-slate-500 font-semibold bg-white dark:bg-slate-950/50 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-800">10분 전</span>
              </div>
              <div className="p-4 flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors duration-300 group cursor-pointer">
                <div className="flex items-center gap-3">
                  <span className="bg-fuchsia-100 dark:bg-fuchsia-900/50 text-fuchsia-600 dark:text-fuchsia-400 text-xs font-bold px-2.5 py-1.5 rounded-md shadow-[0_0_10px_rgba(217,70,239,0.1)] dark:shadow-[0_0_10px_rgba(217,70,239,0.2)] border border-fuchsia-200 dark:border-fuchsia-500/30">ui-ux-pro-max</span>
                  <span className="text-sm text-slate-700 dark:text-slate-300 font-medium group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-300 transition-colors">대시보드 와이어프레임 디자인</span>
                </div>
                <span className="text-xs text-slate-500 font-semibold bg-white dark:bg-slate-950/50 px-2 py-1 rounded-full border border-slate-200 dark:border-slate-800">2시간 전</span>
              </div>
            </div>
          </>
        );
      
      case 'skills':
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">내 스킬 관리</h2>
              <button 
                onClick={onMarketplace}
                className="bg-cyan-500 hover:bg-cyan-600 dark:hover:bg-cyan-400 text-white dark:text-slate-950 text-sm font-black px-4 py-2 rounded-lg transition-colors cursor-pointer border-none shadow-[0_0_15px_rgba(6,182,212,0.4)] dark:shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] dark:hover:shadow-[0_0_25px_rgba(34,211,238,0.6)]"
              >
                + 새 스킬 다운로드
              </button>
            </div>
            
            {/* Onboarding Banner: What is a Skill? */}
            <div className="bg-gradient-to-r from-fuchsia-50 to-cyan-50 dark:from-fuchsia-900/20 dark:to-cyan-900/20 border border-fuchsia-100 dark:border-fuchsia-500/30 rounded-2xl p-5 mb-6 flex items-start gap-4 shadow-sm dark:shadow-[0_0_15px_rgba(217,70,239,0.1)]">
              <div className="text-3xl drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] mt-1">💡</div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white mb-1 drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">스킬(Skill)이 무엇인가요?</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  스킬은 AI에게 특정 분야의 업무 능력을 부여하는 <strong className="text-fuchsia-600 dark:text-fuchsia-400 drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(217,70,239,0.5)]">전문가 자격증</strong>과 같습니다. <br className="hidden sm:block" />
                  원하는 스킬을 활성화하면, 슈퍼스킬 AI가 해당 분야의 실무 전문가처럼 특화된 맞춤형 결과물을 만들어 냅니다!
                </p>
              </div>
            </div>

            {plan.type === 'BASIC' && (
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-500/50 text-blue-800 dark:text-blue-300 p-4 rounded-xl mb-6 flex justify-between items-center shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                <div className="text-sm">
                  <strong className="text-blue-600 dark:text-blue-400 drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]">BASIC 플랜 안내:</strong> 무료 회원은 최대 2개의 스킬만 활성화할 수 있습니다.
                </div>
                <button onClick={() => setActiveTab('billing')} className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg font-bold hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors border-none cursor-pointer shadow-[0_0_10px_rgba(59,130,246,0.4)] hover:shadow-[0_0_15px_rgba(59,130,246,0.6)]">
                  PRO 업그레이드
                </button>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto shadow-[0_8px_30px_rgb(0,0,0,0.05)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">스킬 이름</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">카테고리</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">사용 횟수</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">활성화 상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {skills.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                        <div className="text-3xl mb-3 opacity-50">📦</div>
                        <div className="font-semibold mb-1 text-slate-600 dark:text-slate-400">설치된 스킬이 없습니다.</div>
                        <div className="text-sm text-slate-500">마켓플레이스에서 내 프로젝트에 맞는 스킬을 찾아 설치해보세요.</div>
                        <button 
                          onClick={onMarketplace}
                          className="mt-4 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-300 dark:hover:border-cyan-500/50 cursor-pointer transition-all duration-300"
                        >
                          마켓플레이스 둘러보기
                        </button>
                      </td>
                    </tr>
                  ) : (
                    skills.map(skill => (
                    <tr key={skill.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-white">
                        <code className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded text-sm text-cyan-600 dark:text-cyan-400 drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(34,211,238,0.2)]">{skill.name}</code>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">{skill.category}</td>
                      <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 font-bold">{skill.usage}회</td>
                      <td className="px-6 py-4 text-right">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={skill.status}
                            onChange={() => handleToggleSkill(skill.id)}
                          />
                          <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500 peer-checked:shadow-[0_0_10px_rgba(6,182,212,0.5)] dark:peer-checked:shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                        </label>
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        );


      case 'billing':
        return (
          <>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">결제 및 구독</h2>
            
            {plan.type === 'PRO' ? (
              /* PRO Member Dashboard */
              <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-2xl p-5 md:p-8 text-slate-800 dark:text-white mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.05)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-fuchsia-600 dark:text-fuchsia-400 font-bold text-sm mb-1 drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(217,70,239,0.5)]">CURRENT PLAN</h3>
                    <div className="text-3xl font-black text-slate-900 dark:text-white drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">PRO 멤버십</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                      결제 주기: <strong className="text-slate-700 dark:text-white drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">{plan.cycle === 'yearly' ? '연간 결제 (20% 할인)' : '월간 결제'}</strong>
                    </div>
                  </div>
                  {plan.status === 'ACTIVE' ? (
                    <span className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold px-3 py-1 rounded-full border border-cyan-300 dark:border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)] dark:shadow-[0_0_10px_rgba(34,211,238,0.2)]">ACTIVE</span>
                  ) : (
                    <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full border border-red-300 dark:border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)] dark:shadow-[0_0_10px_rgba(248,113,113,0.2)]">CANCELED</span>
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 max-w-md leading-relaxed">
                  프리미엄 스킬 팩 전체 무제한 접근 및 신규 업데이트 우선 권한이 포함되어 있습니다.
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => toast.success('이미 PRO 플랜을 사용 중입니다.')}
                    className="bg-cyan-500 hover:bg-cyan-600 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-black py-2 px-5 rounded-lg text-sm border-none transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)] dark:shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] dark:hover:shadow-[0_0_25px_rgba(34,211,238,0.6)]"
                  >
                    플랜 업그레이드
                  </button>
                  <button 
                    onClick={handleCancelSubscription}
                    className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold py-2 px-5 rounded-lg text-sm border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    구독 취소
                  </button>
                </div>
              </div>
            ) : (
              /* Upgrade Pricing View for BASIC Members */
              <div className="mb-12">
                <div className="flex flex-col items-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">프리미엄 스킬 잠금 해제</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 text-center">월 결제보다 연간 결제를 선택하시면 <span className="font-bold text-fuchsia-600 dark:text-fuchsia-400 drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(217,70,239,0.5)]">20% 할인</span> 혜택을 받으실 수 있습니다.</p>
                  
                  {/* Monthly/Yearly Toggle */}
                  <div className="flex items-center bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-inner dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                    <button 
                      onClick={() => setIsYearly(false)}
                      className={`px-6 py-2 rounded-lg text-sm font-bold transition-all border-none cursor-pointer ${!isYearly ? 'bg-white dark:bg-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.1)] dark:shadow-[0_0_10px_rgba(0,0,0,0.5)] text-slate-800 dark:text-white' : 'bg-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                      월간 결제
                    </button>
                    <button 
                      onClick={() => setIsYearly(true)}
                      className={`px-6 py-2 rounded-lg text-sm font-bold transition-all border-none cursor-pointer flex items-center gap-2 ${isYearly ? 'bg-white dark:bg-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.1)] dark:shadow-[0_0_10px_rgba(0,0,0,0.5)] text-slate-800 dark:text-white' : 'bg-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                      연간 결제
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${isYearly ? 'bg-fuchsia-500 text-white shadow-[0_0_5px_rgba(217,70,239,0.5)]' : 'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400'}`}>-20%</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:p-8 max-w-4xl mx-auto">
                  {/* Basic Plan */}
                  <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.05)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
                    <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">BASIC</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm h-10">서비스를 체험해보기 위한 기본 요금제</p>
                    <div className="my-6">
                      <span className="text-4xl font-black text-slate-800 dark:text-white">₩0</span>
                      <span className="text-slate-500 font-medium">/월</span>
                    </div>
                    <ul className="space-y-4 mb-8 text-sm text-slate-600 dark:text-slate-300">
                      <li className="flex items-center gap-3">
                        <span className="text-cyan-500 font-bold drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">✓</span> 기본 스킬 2개 활성화 제한
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="text-cyan-500 font-bold drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">✓</span> 일일 사용량 10회 제한
                      </li>
                      <li className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
                        <span className="text-slate-400 dark:text-slate-600 font-bold">✕</span> 프리미엄 신규 스킬 접근
                      </li>
                    </ul>
                    <button disabled className="w-full py-3 rounded-xl font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 cursor-not-allowed">
                      현재 사용 중인 플랜
                    </button>
                  </div>

                  {/* Pro Plan */}
                  <div className="bg-gradient-to-b from-fuchsia-50 to-white dark:from-slate-900 dark:to-slate-950 rounded-3xl p-5 md:p-8 text-slate-800 dark:text-white shadow-[0_8px_30px_rgba(217,70,239,0.1)] dark:shadow-[0_0_30px_rgba(217,70,239,0.1)] relative border border-fuchsia-300 dark:border-fuchsia-500/30 transform md:-translate-y-4">
                    <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-gradient-to-r from-cyan-400 to-fuchsia-500 dark:from-cyan-500 dark:to-fuchsia-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-[0_0_15px_rgba(217,70,239,0.5)]">
                      MOST POPULAR
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">PRO</h4>
                    <p className="text-slate-600 dark:text-slate-300 text-sm h-10">전문가와 실무자를 위한 무제한 요금제</p>
                    <div className="my-6">
                      <span className="text-4xl font-black text-slate-900 dark:text-white drop-shadow-sm dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                        {isYearly ? '₩15,900' : '₩19,900'}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">/월</span>
                      {isYearly && <div className="text-xs text-fuchsia-600 dark:text-fuchsia-400 mt-1 drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(217,70,239,0.5)]">연 ₩190,800 일시불 결제</div>}
                    </div>
                    <ul className="space-y-4 mb-8 text-sm text-slate-700 dark:text-slate-200">
                      <li className="flex items-center gap-3">
                        <span className="text-fuchsia-500 dark:text-fuchsia-400 font-bold drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(217,70,239,0.8)]">✓</span> <strong className="text-slate-900 dark:text-white drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">모든 스킬 팩 무제한 접근</strong>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="text-fuchsia-500 dark:text-fuchsia-400 font-bold drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(217,70,239,0.8)]">✓</span> 일일 사용량 무제한
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="text-fuchsia-500 dark:text-fuchsia-400 font-bold drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(217,70,239,0.8)]">✓</span> 1:1 우선 기술 지원
                      </li>
                    </ul>
                    <button 
                      onClick={() => {
                        setPaymentStep('select');
                        setShowPaymentModal(true);
                      }}
                      className="w-full py-3 rounded-xl font-bold text-white dark:text-slate-950 bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-400 dark:to-blue-500 hover:from-cyan-600 hover:to-blue-700 dark:hover:from-cyan-300 dark:hover:to-blue-400 border-none cursor-pointer transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)] dark:shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] dark:hover:shadow-[0_0_25px_rgba(34,211,238,0.6)]"
                    >
                      PRO 플랜으로 시작하기
                    </button>
                  </div>
                </div>
              </div>
            )}

            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">등록된 결제 수단</h3>
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex justify-between items-center shadow-[0_8px_30px_rgb(0,0,0,0.05)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
              {plan.type === 'PRO' ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded flex items-center justify-center font-bold text-cyan-600 dark:text-cyan-400 text-xs shadow-sm dark:shadow-[0_0_10px_rgba(34,211,238,0.1)]">
                    PAY
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-white text-sm">등록된 간편결제</div>
                    <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                      {plan.status === 'ACTIVE' ? '다음 결제 예정일: 2026.07.21' : '결제 예정 내역이 없습니다.'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500">등록된 결제 수단이 없습니다. PRO 플랜 업그레이드 시 등록할 수 있습니다.</div>
              )}
              
              {plan.type === 'PRO' && (
                <button 
                  onClick={() => toast('결제 수단 변경 기능은 준비중입니다.', { icon: '🚧' })}
                  className="text-cyan-600 dark:text-cyan-400 font-bold text-sm bg-cyan-50 dark:bg-cyan-900/30 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 px-4 py-2 rounded-lg border border-cyan-200 dark:border-cyan-500/30 transition-colors cursor-pointer"
                >
                  수정
                </button>
              )}
            </div>
          </>
        );

      case 'account':
        return (
          <>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">계정 및 보안 설정</h2>
            
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-8 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.05)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">내 프로필</h3>
              <form onSubmit={handleProfileSubmit} className="flex flex-col gap-6 max-w-lg">
                <div>
                  <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">이름</label>
                  <input 
                    name="name"
                    type="text" 
                    defaultValue={profile.name} 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-900 transition-colors shadow-inner dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)] focus:shadow-[0_0_15px_rgba(6,182,212,0.1)] dark:focus:shadow-[0_0_15px_rgba(34,211,238,0.2)]" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">이메일 주소</label>
                  <input 
                    name="email"
                    type="email" 
                    defaultValue={profile.email} 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-900 transition-colors shadow-inner dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)] focus:shadow-[0_0_15px_rgba(6,182,212,0.1)] dark:focus:shadow-[0_0_15px_rgba(34,211,238,0.2)]" 
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-950 font-black py-3 px-6 rounded-xl w-fit transition-all cursor-pointer border-none shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]"
                >
                  변경사항 저장
                </button>
              </form>
            </div>

            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.05)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
              <h3 className="text-lg font-bold text-red-500 dark:text-red-400 mb-2 drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]">Danger Zone (위험 구역)</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">계정을 삭제하면 모든 스킬 설정과 데이터가 영구적으로 삭제되며 복구할 수 없습니다.</p>
              <button 
                onClick={handleDeleteAccount}
                className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/50 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-700 dark:hover:text-red-300 font-bold py-3 px-6 rounded-xl transition-all cursor-pointer shadow-sm dark:shadow-[0_0_10px_rgba(248,113,113,0.2)] hover:shadow-[0_0_10px_rgba(239,68,68,0.2)] dark:hover:shadow-[0_0_15px_rgba(248,113,113,0.4)]"
              >
                회원 탈퇴하기
              </button>
            </div>
          </>
        );

      case 'support':
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">🎧 고객센터 (문의 내역)</h2>
              <button 
                onClick={() => window.location.href = '/support.html'}
                className="bg-cyan-500 hover:bg-cyan-600 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-black py-2.5 px-5 rounded-xl text-sm border-none transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)] dark:shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] dark:hover:shadow-[0_0_25px_rgba(34,211,238,0.6)]"
              >
                + 새 문의하기
              </button>
            </div>
            
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-8 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.05)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
              {myInquiries.length === 0 ? (
                <div className="text-sm text-slate-500 py-12 text-center bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-3">
                  <span className="text-3xl opacity-50">📭</span>
                  접수된 문의 내역이 없습니다.<br/>도움이 필요하시면 새 문의하기를 이용해 주세요.
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
                  {myInquiries.map((inq, idx) => (
                    <div key={inq.id || idx} className="border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-cyan-300 dark:hover:border-cyan-500/50 transition-colors bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/60">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-200 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-bold px-2 py-1 rounded">{inq.category}</span>
                          <span className="font-bold text-slate-800 dark:text-white">{inq.title}</span>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${inq.status === '답변 완료' ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/30' : 'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-300 dark:border-fuchsia-500/30'}`}>
                          {inq.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 bg-white dark:bg-slate-950/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 whitespace-pre-wrap leading-relaxed">
                        {inq.content}
                      </p>
                      {inq.adminReply && (
                        <div className="mb-3 bg-cyan-50 dark:bg-cyan-950/30 p-4 rounded-lg border border-cyan-200 dark:border-cyan-900/50">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="bg-cyan-500 text-white dark:text-slate-950 text-[10px] font-black px-2 py-0.5 rounded shadow-[0_0_5px_rgba(6,182,212,0.5)] dark:shadow-[0_0_5px_rgba(34,211,238,0.5)]">관리자 답변</span>
                            <span className="text-xs text-cyan-600/70 dark:text-cyan-400/70">{inq.replyDate || ''}</span>
                          </div>
                          <p className="text-sm text-cyan-800 dark:text-cyan-100 whitespace-pre-wrap leading-relaxed font-medium">
                            {inq.adminReply}
                          </p>
                        </div>
                      )}
                      <div className="text-xs text-slate-500 text-right font-medium">
                        접수일: {inq.date}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        );

      case 'ai-settings':
        return (
          <>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">🤖 AI 설정</h2>
            
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl p-5 md:p-8 mb-8 shadow-[0_8px_30px_rgb(0,0,0,0.05)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">Google Gemini API 키 관리</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                입력하신 키는 서버로 전송되지 않으며, 현재 사용 중인 브라우저(로컬 스토리지)에만 안전하게 보관됩니다.
              </p>

              <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl p-5 mb-8">
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <span className="opacity-80">💡</span> 추천 방식의 차이점이 무엇인가요?
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                    <strong className="text-cyan-600 dark:text-cyan-500 block mb-1 drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">키워드 검색 (API 미등록 시)</strong>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mb-2">스킬 제목과 설명에 포함된 '단어'를 직접 매칭합니다.</p>
                    <ul className="text-xs text-slate-600 dark:text-slate-500 space-y-1 pl-4 list-disc marker:text-cyan-500">
                      <li><strong className="text-slate-700 dark:text-slate-300">장점:</strong> 오프라인에서도 즉시 반응하며 빠릅니다.</li>
                      <li><strong className="text-slate-700 dark:text-slate-300">단점:</strong> "로그인", "결제" 등 명확한 단어로만 검색해야 합니다.</li>
                    </ul>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-[0_2px_10px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                    <strong className="text-fuchsia-600 dark:text-fuchsia-400 block mb-1 drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(217,70,239,0.5)]">AI 추천 (API 등록 시)</strong>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mb-2">AI가 질문의 '문맥'과 '의도' 파악하여 추천합니다.</p>
                    <ul className="text-xs text-slate-600 dark:text-slate-500 space-y-1 pl-4 list-disc marker:text-fuchsia-500">
                      <li><strong className="text-slate-700 dark:text-slate-300">장점:</strong> "이런저런 기능이 있는 앱을 만들고 싶어"처럼 추상적으로 질문해도 알아서 적합한 스킬 조합을 찾아줍니다.</li>
                      <li><strong className="text-slate-700 dark:text-slate-300">단점:</strong> API 호출 시 1~2초의 로딩 시간이 발생합니다.</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">현재 저장된 키</label>
                {aiApiKey ? (
                  <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 shadow-inner dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)]">
                    <code className="text-cyan-600 dark:text-cyan-400 font-mono text-sm drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(34,211,238,0.3)]">
                      {aiApiKey.substring(0, 8)}••••••••••••••••••••
                    </code>
                    <button 
                      onClick={handleDeleteAiKey}
                      className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 text-sm font-bold border-none bg-transparent cursor-pointer drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]"
                    >
                      삭제
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-500 text-sm font-medium">
                    저장된 API 키가 없습니다.
                  </div>
                )}
              </div>

              <form onSubmit={handleSaveAiKey} className="flex flex-col gap-4 max-w-lg">
                <div>
                  <label className="block text-sm font-bold text-slate-600 dark:text-slate-300 mb-2">{aiApiKey ? '키 변경하기' : '새 키 등록하기'}</label>
                  <input 
                    name="aiKey"
                    type="password" 
                    placeholder="AIzaSy..." 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-900 transition-colors shadow-inner dark:shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)] focus:shadow-[0_0_15px_rgba(6,182,212,0.1)] dark:focus:shadow-[0_0_15px_rgba(34,211,238,0.2)]" 
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-cyan-500 hover:bg-cyan-600 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-black py-3 px-6 rounded-xl w-fit transition-all cursor-pointer border-none shadow-[0_0_15px_rgba(6,182,212,0.4)] dark:shadow-[0_0_15px_rgba(34,211,238,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] dark:hover:shadow-[0_0_25px_rgba(34,211,238,0.6)]"
                >
                  API 키 저장
                </button>
              </form>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row relative transition-colors duration-300 bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-300 ${isDarkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 shadow-[4px_0_24px_rgba(0,0,0,0.1)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.5)] flex flex-col static md:fixed h-auto md:h-full z-20 transition-colors duration-300">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
          <div className="text-xl font-extrabold tracking-tight flex items-center gap-2 text-slate-900 dark:text-white">
            <div className="bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(34,211,238,0.5)] text-white dark:text-slate-950 w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-black">AI</div>
            Super <span className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-transparent bg-clip-text drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">Skill</span>
          </div>
        </div>
        <nav className="flex-1 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-3 px-4 py-3 font-bold rounded-xl text-sm border-none cursor-pointer transition-all duration-300 ${activeTab === 'home' ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 shadow-[inset_0_0_15px_rgba(6,182,212,0.2)] dark:shadow-[inset_0_0_15px_rgba(34,211,238,0.1)] border border-cyan-300 dark:border-cyan-500/30' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
          >
            <LayoutDashboard size={18} className={activeTab === 'home' ? 'text-cyan-500 dark:text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] dark:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'text-slate-400 dark:text-slate-500'} /> 대시보드 홈
          </button>
          <button 
            onClick={() => setActiveTab('skills')}
            className={`flex items-center gap-3 px-4 py-3 font-bold rounded-xl text-sm border-none cursor-pointer transition-all duration-300 ${activeTab === 'skills' ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 shadow-[inset_0_0_15px_rgba(6,182,212,0.2)] dark:shadow-[inset_0_0_15px_rgba(34,211,238,0.1)] border border-cyan-300 dark:border-cyan-500/30' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
          >
            <Wrench size={18} className={activeTab === 'skills' ? 'text-cyan-500 dark:text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] dark:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'text-slate-400 dark:text-slate-500'} /> 내 스킬 관리
          </button>
          <button 
            onClick={() => setActiveTab('billing')}
            className={`flex items-center gap-3 px-4 py-3 font-bold rounded-xl text-sm border-none cursor-pointer transition-all duration-300 ${activeTab === 'billing' ? 'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400 shadow-[inset_0_0_15px_rgba(217,70,239,0.2)] dark:shadow-[inset_0_0_15px_rgba(217,70,239,0.1)] border border-fuchsia-300 dark:border-fuchsia-500/30' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
          >
            <CreditCard size={18} className={activeTab === 'billing' ? 'text-fuchsia-500 dark:text-fuchsia-400 drop-shadow-[0_0_8px_rgba(217,70,239,0.5)] dark:drop-shadow-[0_0_8px_rgba(217,70,239,0.8)]' : 'text-slate-400 dark:text-slate-500'} /> 결제 및 구독
          </button>
          <button 
            onClick={() => setActiveTab('ai-settings')}
            className={`flex items-center gap-3 px-4 py-3 font-bold rounded-xl text-sm border-none cursor-pointer transition-all duration-300 ${activeTab === 'ai-settings' ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 shadow-[inset_0_0_15px_rgba(6,182,212,0.2)] dark:shadow-[inset_0_0_15px_rgba(34,211,238,0.1)] border border-cyan-300 dark:border-cyan-500/30' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
          >
            <Bot size={18} className={activeTab === 'ai-settings' ? 'text-cyan-500 dark:text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] dark:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'text-slate-400 dark:text-slate-500'} /> AI 설정
          </button>
          <button 
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-3 px-4 py-3 font-bold rounded-xl text-sm border-none cursor-pointer transition-all duration-300 ${activeTab === 'account' ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 shadow-[inset_0_0_15px_rgba(6,182,212,0.2)] dark:shadow-[inset_0_0_15px_rgba(34,211,238,0.1)] border border-cyan-300 dark:border-cyan-500/30' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
          >
            <Settings size={18} className={activeTab === 'account' ? 'text-cyan-500 dark:text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] dark:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'text-slate-400 dark:text-slate-500'} /> 계정 설정
          </button>
          <button 
            onClick={() => setActiveTab('support')}
            className={`flex items-center gap-3 px-4 py-3 font-bold rounded-xl text-sm border-none cursor-pointer transition-all duration-300 ${activeTab === 'support' ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 shadow-[inset_0_0_15px_rgba(6,182,212,0.2)] dark:shadow-[inset_0_0_15px_rgba(34,211,238,0.1)] border border-cyan-300 dark:border-cyan-500/30' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white border border-transparent'}`}
          >
            <Headphones size={18} className={activeTab === 'support' ? 'text-cyan-500 dark:text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)] dark:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'text-slate-400 dark:text-slate-500'} /> 고객센터
          </button>
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-row md:flex-col gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide transition-colors duration-300">
          {typeof localStorage !== 'undefined' && localStorage.getItem('site_role') === 'master' && (
            <button 
              onClick={onAdmin}
              className="flex items-center gap-3 px-4 py-3 font-bold rounded-xl text-sm border-none cursor-pointer transition-all duration-300 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 md:mt-2 bg-slate-50 dark:bg-slate-800/50"
            >
              <Crown size={18} className="text-amber-500 dark:text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] dark:drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" /> 마스터 관리자 패널
            </button>
          )}
          <button 
            onClick={onMarketplace}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/30 font-bold rounded-xl text-sm cursor-pointer transition-all duration-300 md:mb-2 whitespace-nowrap shadow-[0_0_10px_rgba(6,182,212,0.1)] dark:shadow-[0_0_10px_rgba(34,211,238,0.1)]"
          >
            <ShoppingCart size={16} /> 마켓플레이스
          </button>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm border border-transparent cursor-pointer transition-all duration-300 md:mb-2 whitespace-nowrap"
          >
            <Home size={16} /> 랜딩 페이지로
          </button>
          <button 
            onClick={onSignOut}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 font-bold rounded-xl text-sm cursor-pointer transition-all duration-300 whitespace-nowrap hover:shadow-[0_0_10px_rgba(239,68,68,0.2)] dark:hover:shadow-[0_0_10px_rgba(248,113,113,0.2)]"
          >
            <LogOut size={16} /> 로그아웃
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col ml-0 md:ml-64 min-h-screen">
        <header className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-5 flex justify-between items-center sticky top-0 z-10 flex-wrap gap-4 shadow-[0_4px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-colors duration-300">
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white drop-shadow-sm dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] m-0 transition-colors duration-300">
            {activeTab === 'home' && '대시보드 홈'}
            {activeTab === 'skills' && '내 스킬 관리'}
            {activeTab === 'billing' && '결제 및 구독'}
            {activeTab === 'ai-settings' && 'AI 설정'}
            {activeTab === 'account' && '계정 설정'}
            {activeTab === 'support' && '고객센터'}
          </h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-yellow-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-inner dark:shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] cursor-pointer border border-slate-200 dark:border-slate-700"
              title={isDarkMode ? "화이트 버전으로 변경" : "블랙 버전으로 변경"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 cursor-pointer hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">이용약관</span>
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 transition-colors duration-300"></div>
            <div className="flex items-center gap-3 group cursor-pointer">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{profile.name}</span>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 dark:from-cyan-500 dark:to-blue-600 text-white dark:text-slate-950 flex items-center justify-center font-black text-sm shadow-[0_0_10px_rgba(34,211,238,0.3)] group-hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] dark:group-hover:shadow-[0_0_20px_rgba(34,211,238,0.8)] transition-all uppercase ring-2 ring-cyan-500/30">
                {profile.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
          {renderContent()}
        </div>
      </main>

      {/* Korean Easy Payment Checkout Modal Overlay */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100">
              <div className="font-bold text-slate-900 text-lg">결제하기</div>
              <button 
                onClick={() => !isProcessing && setShowPaymentModal(false)}
                className="text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer text-xl"
              >
                ✕
              </button>
            </div>

            {/* Step 1: Select Payment Method */}
            {paymentStep === 'select' && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="text-slate-600 font-medium">총 결제금액</div>
                  <div className="text-2xl font-black text-slate-900">
                    {isYearly ? '190,800' : '19,900'} <span className="text-lg font-bold text-slate-900">원</span>
                  </div>
                </div>

                <div className="text-sm font-bold text-slate-700 mb-3">결제 수단 선택</div>
                
                <div className="grid grid-cols-1 gap-3 mb-6">
                  <button 
                    onClick={() => handleSelectPaymentMethod('Toss')}
                    className="w-full flex items-center p-4 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold mr-3 shadow-sm text-xs">toss</div>
                    <div className="font-bold text-slate-900">토스페이</div>
                    <div className="ml-auto text-blue-600 text-xs font-bold bg-white px-2 py-1 rounded shadow-sm border border-blue-100">추천</div>
                  </button>

                  <button 
                    onClick={() => handleSelectPaymentMethod('Kakao')}
                    className="w-full flex items-center p-4 rounded-xl border border-yellow-300 bg-yellow-50 hover:bg-yellow-100 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold mr-3 shadow-sm text-xs">K</div>
                    <div className="font-bold text-slate-900">카카오페이</div>
                  </button>

                  <button 
                    onClick={() => handleSelectPaymentMethod('Naver')}
                    className="w-full flex items-center p-4 rounded-xl border border-green-200 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold mr-3 shadow-sm text-xs">N</div>
                    <div className="font-bold text-slate-900">네이버페이</div>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button className="p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors cursor-pointer">
                    신용/체크카드
                  </button>
                  <button className="p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors cursor-pointer">
                    계좌이체
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: QR & Processing Simulation */}
            {paymentStep === 'qr' && (
              <div className="p-5 md:p-8 text-center flex flex-col items-center">
                <div className="mb-2 font-bold text-slate-900 text-lg">
                  {selectedMethod === 'Toss' && '토스앱'}
                  {selectedMethod === 'Kakao' && '카카오톡'}
                  {selectedMethod === 'Naver' && '네이버앱'}에서 결제해주세요
                </div>
                <div className="text-sm text-slate-500 mb-8">스마트폰에서 결제를 완료하면 화면이 넘어갑니다.</div>

                <div className="w-40 h-40 bg-slate-100 border border-slate-200 rounded-xl mb-8 flex items-center justify-center">
                  {/* Fake QR Icon */}
                  <div className="w-32 h-32 opacity-20" style={{
                    backgroundImage: 'radial-gradient(circle at center, #000 2px, transparent 2px)',
                    backgroundSize: '8px 8px'
                  }}></div>
                </div>

                <div className="w-full pt-4 border-t border-slate-100">
                  <button 
                    onClick={handleProcessPayment} 
                    disabled={isProcessing}
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold border-none cursor-pointer shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        결제 승인 대기 중...
                      </>
                    ) : (
                      `[시뮬레이션] 휴대폰 결제 완료하기`
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Account Deletion Modal Overlay */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 md:p-8 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-extrabold text-red-600 mb-2">정말 계정을 삭제하시겠습니까?</h3>
            <p className="text-slate-500 mb-6 text-sm">
              이 작업은 되돌릴 수 없으며, 모든 결제 내역과 스킬 정보가 영구적으로 삭제됩니다. 계속 진행하시려면 아래 입력창에 <strong>'탈퇴 확인'</strong>이라고 입력해 주세요.
            </p>
            <input 
              type="text" 
              placeholder="탈퇴 확인"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:border-red-500 transition-colors mb-6 text-center"
            />
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl border-none cursor-pointer transition-colors"
              >
                취소
              </button>
              <button 
                onClick={confirmDeleteAccount}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl border-none cursor-pointer shadow-lg shadow-red-500/30 transition-colors"
              >
                계정 영구 삭제
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
