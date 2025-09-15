"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { askStudyBuddy } from '@/lib/api';
import { useI18n } from '@/i18n/useI18n';
import { useUser } from '@clerk/nextjs';

export default function StudyBuddyPage() {
  const { user } = useUser();
  const { t } = useI18n();
  const [history, setHistory] = useState([]); // {role:'user'|'assistant', content:string}
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('answer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [history]);

  async function send() {
    if (!input.trim()) return;
    const question = input.trim();
    setInput('');
    setHistory(h => [...h, { role: 'user', content: question }]);
    setLoading(true);
    setError(null);
    try {
      const response = await askStudyBuddy({ question, mode, history });
      setHistory(h => [...h, { role: 'assistant', content: response.answer }]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e){
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">🤖 {t.studyBuddy.title()}</h1>
          <Link href="/student" className="text-blue-600 hover:underline text-sm">{t.studyBuddy.back()}</Link>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {['answer','explain','practice'].map(m => (
            <button key={m} onClick={()=>setMode(m)} className={`px-3 py-1 rounded-full text-sm border ${mode===m? 'bg-blue-600 text-white border-blue-600':'bg-white hover:bg-blue-50'}`}>{t.studyBuddy.modes[m]()}</button>
          ))}
        </div>

        {error && (
          <div className="mb-3 p-3 text-sm rounded border border-red-300 bg-red-50 text-red-700">
            {error}
          </div>
        )}
        <div className="bg-white border rounded-xl h-[60vh] flex flex-col overflow-hidden shadow-sm">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
            {history.length === 0 && (
              <div className="text-gray-500 text-center pt-10">
                {t.studyBuddy.askAny()}
                <ul className="list-disc list-inside text-left mt-2 space-y-1">
                  <li><strong>{t.studyBuddy.modes.answer()}</strong>: {t.studyBuddy.modeHints.answer()}</li>
                  <li><strong>{t.studyBuddy.modes.explain()}</strong>: {t.studyBuddy.modeHints.explain()}</li>
                  <li><strong>{t.studyBuddy.modes.practice()}</strong>: {t.studyBuddy.modeHints.practice()}</li>
                </ul>
              </div>
            )}
            {history.map((m,i)=>(
              <div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}>
                <div className={`max-w-[80%] whitespace-pre-wrap leading-relaxed rounded-lg px-3 py-2 shadow-sm text-[13px] ${m.role==='user'?'bg-blue-600 text-white':'bg-slate-100 text-slate-800'}`}> 
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-gray-500">{t.common.thinking()}</div>}
            {!loading && !history.length && !error && (
              <div className="text-[11px] text-gray-400">
                {t.studyBuddy.tips.header({ ex1: 'explain photosynthesis', ex2: 'practice integer addition' })}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t p-3 bg-slate-50">
            <textarea 
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={2}
              placeholder={t.studyBuddy.placeholders.question()}
              className="w-full resize-none text-sm p-2 rounded border focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            />
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>{mode === 'practice' ? t.studyBuddy.modeHints.practice() : mode === 'explain' ? t.studyBuddy.modeHints.explain() : t.studyBuddy.modeHints.answer()}</span>
              <div className="flex gap-2">
                <button disabled={loading || !input.trim()} onClick={send} className="px-4 py-1.5 rounded bg-blue-600 text-white text-xs font-medium disabled:opacity-50">{t.common.send()}</button>
                <button disabled={history.length===0} onClick={()=>setHistory([])} className="px-3 py-1.5 rounded border text-xs">{t.common.clear()}</button>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-[11px] text-gray-500">{t.studyBuddy.disclaimer()}</p>
      </div>
    </div>
  );
}
