import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, X, Sparkles, Languages } from 'lucide-react';
import { Language } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const VoiceAssistantModal: React.FC<Props> = ({ isOpen, onClose, language }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [selectedLang, setSelectedLang] = useState<Language>(language);

  useEffect(() => {
    setSelectedLang(language);
  }, [language]);

  if (!isOpen) return null;

  const sampleVoiceQueries = {
    en: [
      "Explain my recent batch grade report",
      "What is today's MSP rate for Grade A onions?",
      "Which APMC mandi has the highest price today?"
    ],
    hi: [
      "मेरे प्याज के बैच की ग्रेड रिपोर्ट समझाएं",
      "आज ग्रेड A प्याज की MSP दर क्या है?",
      "आज किस मंडी में सबसे अधिक मूल्य मिल रहा है?"
    ],
    mr: [
      "माझ्या कांद्याच्या बॅचचा ग्रेड रिपोर्ट समजावून सांगा",
      "आज ग्रेड A कांद्याचा MSP दर काय आहे?",
      "आज कोणत्या कृषी उत्पन्न बाजार समितीत जास्त भाव आहे?"
    ]
  };

  const handleSimulateVoice = (query: string) => {
    setTranscript(query);
    setIsListening(false);

    // Speak response based on language
    let resp = "";
    if (selectedLang === 'mr') {
      resp = "तुमचा बॅच 'ग्रेड A' म्हणून मंजूर झाला आहे. ९४% कांदे उत्तम प्रतीचे आहेत. रु. ५३,१२५ थेट बँक खात्यात पाठवले आहेत.";
    } else if (selectedLang === 'hi') {
      resp = "आपका प्याज बैच 'ग्रेड A' स्वीकृत किया गया है। 94% प्याज स्वस्थ हैं। ₹53,125 का भुगतान सीधे बैंक खाते में भेज दिया गया है।";
    } else {
      resp = "Your batch BATCH-MH-2026-1001 is classified as Grade A (Quality Score: 94/100). ₹53,125 payment has been disbursed to your linked bank account.";
    }

    setAssistantResponse(resp);

    // Use Web Speech API Text-to-Speech if available
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(resp);
      utterance.lang = selectedLang === 'mr' ? 'mr-IN' : selectedLang === 'hi' ? 'hi-IN' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setTranscript("Listening to voice input...");

    // Fallback simulation after 2.5 seconds
    setTimeout(() => {
      const queries = sampleVoiceQueries[selectedLang];
      const randomQ = queries[Math.floor(Math.random() * queries.length)];
      handleSimulateVoice(randomQ);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="glass-card w-full max-w-lg rounded-3xl border border-onion-ruby/50 bg-slate-900/95 p-6 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-onion-ruby/30 rounded-full blur-3xl" />
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-onion-ruby to-onion-amber text-white shadow-lg">
              <Mic size={22} className={isListening ? 'animate-bounce' : ''} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Voice AI Assistant <Sparkles size={16} className="text-onion-amber" />
              </h3>
              <p className="text-xs text-slate-400">
                Multilingual Speech Assistant (Hindi / Marathi / English)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Language Selection Bar */}
        <div className="flex items-center justify-between bg-slate-950 p-2 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 flex items-center gap-1.5 pl-2">
            <Languages size={14} className="text-onion-amber" /> Select Speech Language:
          </span>
          <div className="flex items-center gap-1">
            {(['en', 'hi', 'mr'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold uppercase transition-all ${
                  selectedLang === lang
                    ? 'bg-onion-ruby text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'en' ? 'English' : lang === 'hi' ? 'हिन्दी' : 'मराठी'}
              </button>
            ))}
          </div>
        </div>

        {/* Animated Mic Visualizer */}
        <div className="flex flex-col items-center justify-center py-6 space-y-4">
          <button
            onClick={toggleListening}
            className={`relative p-6 rounded-full transition-all duration-300 shadow-2xl ${
              isListening
                ? 'bg-gradient-to-tr from-rose-600 via-onion-ruby to-onion-amber scale-110 ring-4 ring-rose-500/40 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-onion-amber border border-onion-amber/40 hover:scale-105'
            }`}
          >
            {isListening ? <Mic size={36} className="text-white" /> : <MicOff size={36} />}
          </button>

          <p className="text-xs text-slate-300 font-medium tracking-wide text-center">
            {isListening ? 'Speak now... (Listening in ' + selectedLang.toUpperCase() + ')' : 'Tap microphone or choose a sample prompt below'}
          </p>
        </div>

        {/* Speech Input & Response Displays */}
        {transcript && (
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Your Query</span>
            <p className="text-xs text-slate-200 font-medium">"{transcript}"</p>
          </div>
        )}

        {assistantResponse && (
          <div className="bg-gradient-to-r from-onion-ruby/20 to-emerald-950/40 p-4 rounded-2xl border border-emerald-500/40 space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
              <span className="flex items-center gap-1.5">
                <Volume2 size={16} className="animate-pulse" /> Voice AI Response
              </span>
              <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded text-emerald-300">
                Audio Output Playing
              </span>
            </div>
            <p className="text-xs text-slate-100 font-medium leading-relaxed">
              {assistantResponse}
            </p>
          </div>
        )}

        {/* Sample Prompt Chips */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 block">Try Asking:</span>
          <div className="flex flex-col gap-1.5">
            {sampleVoiceQueries[selectedLang].map((query, idx) => (
              <button
                key={idx}
                onClick={() => handleSimulateVoice(query)}
                className="text-left text-xs text-slate-300 hover:text-white bg-slate-800/60 hover:bg-onion-ruby/30 p-2.5 rounded-xl border border-slate-700/50 hover:border-onion-ruby/50 transition-all flex items-center justify-between"
              >
                <span>"{query}"</span>
                <span className="text-[10px] text-onion-amber font-semibold">Ask →</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
