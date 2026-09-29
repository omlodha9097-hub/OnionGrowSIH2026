import React from 'react';
import { Sparkles } from 'lucide-react';

interface Props {
  onSelectSample: (imageUrl: string, sampleName: string) => void;
}

export const DemoSamples: React.FC<Props> = ({ onSelectSample }) => {
  const samples = [
    {
      id: 'sample_1',
      name: 'Export Grade Red Onions',
      tag: 'Grade A Candidate',
      tagBg: 'bg-emerald-100 text-emerald-950 border-emerald-400',
      url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8ce?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'sample_2',
      name: 'Domestic APMC Market Lot',
      tag: 'Grade B (Domestic)',
      tagBg: 'bg-blue-100 text-blue-950 border-blue-400',
      url: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80'
    },
    {
      id: 'sample_3',
      name: 'Processing & Sprouted Lot',
      tag: 'Grade C Candidate',
      tagBg: 'bg-amber-100 text-amber-950 border-amber-400',
      url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-300 dark:border-slate-800 p-5 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-amber-600 dark:text-amber-400" />
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide">
            Instant One-Click Demo Samples
          </h3>
        </div>
        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
          Click any batch sample to test the AI vision pipeline instantly
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {samples.map((sample) => (
          <button
            key={sample.id}
            onClick={() => onSelectSample(sample.url, sample.name)}
            className="group bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-slate-800 p-3.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 hover:border-emerald-600 transition-all flex items-center gap-3.5 text-left shadow-sm hover:shadow-md cursor-pointer"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0 border-2 border-slate-300 dark:border-slate-600">
              <img
                src={sample.url}
                alt={sample.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>

            <div className="space-y-1.5 min-w-0 flex-1">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${sample.tagBg} inline-block shadow-sm`}>
                {sample.tag}
              </span>
              <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug">
                {sample.name}
              </h4>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
