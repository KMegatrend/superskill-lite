import React from 'react';
import { howItWorks } from '../data/featuresData';

const HowItWorks = () => {
  return (
    <section className="py-12 md:py-20">
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

export default HowItWorks;
