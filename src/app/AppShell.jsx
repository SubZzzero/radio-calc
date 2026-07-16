import { useEffect, useState } from 'react';
import { Activity, SlidersHorizontal } from 'lucide-react';
import { languages, useI18n } from '../i18n';
import { tabs } from './tabs.jsx';

const defaultTab = 'ohm';

function getTabFromHash() {
  if (typeof window === 'undefined') return defaultTab;
  const hash = window.location.hash.replace('#', '');
  return tabs.some((tab) => tab.id === hash) ? hash : defaultTab;
}

export function AppShell() {
  const [activeTab, setActiveTab] = useState(getTabFromHash);
  const { language, setLanguage, t } = useI18n();
  const activeTabConfig = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];
  const ActiveIcon = activeTabConfig?.icon ?? Activity;
  const ActivePanel = activeTabConfig?.component;

  useEffect(() => {
    const syncTabWithHash = () => {
      const hash = window.location.hash.replace('#', '');
      const hasToolHash = tabs.some((tab) => tab.id === hash);

      if (!hasToolHash) return;

      setActiveTab(hash);
      window.requestAnimationFrame(() => {
        document.getElementById('calculator')?.scrollIntoView({ block: 'start' });
      });
    };

    syncTabWithHash();
    window.addEventListener('hashchange', syncTabWithHash);
    return () => window.removeEventListener('hashchange', syncTabWithHash);
  }, []);

  const selectTab = (tabId) => {
    setActiveTab(tabId);
    window.location.hash = tabId;
  };

  return (
    <main id="calculator" className="min-h-screen scroll-mt-3 px-3 py-3 text-slate-100 sm:px-4 sm:py-5 lg:px-5 lg:py-6 xl:px-8 2xl:px-10 2xl:py-8">
      <div className="mx-auto grid max-w-[1560px] grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)] 2xl:grid-cols-[300px_minmax(0,1fr)] 2xl:gap-8">
        <div className="min-w-0 lg:self-start">
          <aside className="min-w-0 rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-3 shadow-2xl backdrop-blur sm:p-4 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:rounded-[2rem] xl:p-5 2xl:top-8 2xl:max-h-[calc(100vh-4rem)] 2xl:p-6">
            <div className="mb-4 flex items-center gap-3 lg:mb-6 lg:block 2xl:mb-9">
              <div className="inline-flex shrink-0 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-2.5 text-cyan-200 lg:mb-4 lg:p-3">
                <SlidersHorizontal size={24} />
              </div>
              <div className="min-w-0">
                <div className="font-display text-2xl font-bold tracking-[-0.08em] text-white sm:text-3xl 2xl:text-4xl">RadioCalc</div>
                <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm lg:mt-3">
                  {t('Инженерные калькуляторы для макетирования, пайки и разводки плат.')}
                </p>
              </div>
            </div>

            <label className="mb-4 grid grid-cols-[minmax(0,1fr)_88px] items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.025] px-3 py-2.5 lg:mb-5 2xl:mb-7">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{t('Язык')}</span>
              <select
                className="rounded-xl border border-cyan-300/10 bg-slate-950/70 px-3 py-2 font-display text-sm font-bold text-cyan-100 outline-none transition focus:border-cyan-300/50"
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
              >
                {languages.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
            </label>

            <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:block lg:space-y-2 lg:overflow-visible lg:px-0 lg:pb-0 2xl:space-y-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    className={`flex shrink-0 items-center gap-2 rounded-2xl border px-3 py-2.5 text-left transition lg:w-full lg:gap-3 lg:py-3 2xl:px-4 2xl:py-4 ${
                      active
                        ? 'border-cyan-300/40 bg-cyan-300/15 text-cyan-100 shadow-glow'
                        : 'border-white/5 bg-white/[0.03] text-slate-400 hover:border-white/15 hover:text-white'
                    }`}
                    type="button"
                    onClick={() => selectTab(tab.id)}
                  >
                    <Icon className="shrink-0" size={18} />
                    <span className="whitespace-nowrap font-display text-xs font-semibold uppercase tracking-[0.1em] sm:text-sm lg:tracking-[0.12em]">{t(tab.label)}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>

        <section id={activeTab} className="min-w-0 scroll-mt-3 rounded-[1.5rem] border border-white/10 bg-slate-900/55 p-4 shadow-2xl backdrop-blur sm:p-5 lg:min-h-[calc(100vh-3rem)] lg:rounded-[2rem] xl:p-6 2xl:min-h-[calc(100vh-4rem)] 2xl:p-8">
          <header className="mb-5 border-b border-white/10 pb-4 2xl:mb-8 2xl:pb-6">
            <div>
              <div className="mb-3 flex items-center gap-2 text-cyan-200 sm:gap-3">
                <ActiveIcon className="shrink-0" size={22} />
                <span className="font-display text-[11px] font-bold uppercase tracking-[0.22em] sm:text-xs sm:tracking-[0.35em]">{t('Практический расчет')}</span>
              </div>
              <h2 className="font-display text-3xl font-bold tracking-[-0.07em] text-white sm:text-4xl 2xl:text-5xl">
                {t(activeTabConfig?.label)}
              </h2>
            </div>
          </header>

          {ActivePanel && <ActivePanel />}
        </section>
      </div>
    </main>
  );
}
