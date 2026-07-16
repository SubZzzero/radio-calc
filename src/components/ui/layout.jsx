import { useI18n } from '../../i18n';

export function Grid({ children }) {
  return <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-[1.35fr_0.9fr] 2xl:gap-6">{children}</div>;
}

export function Card({ title, children, wide = false }) {
  const { t } = useI18n();
  return (
    <article className={`min-w-0 rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-4 sm:p-5 2xl:p-6 ${wide ? '' : 'self-start'}`}>
      <h3 className="mb-5 break-words font-display text-xs font-bold uppercase tracking-[0.16em] text-slate-300 sm:text-sm sm:tracking-[0.2em]">{t(title)}</h3>
      {children}
    </article>
  );
}

export function Result({ label, value, accent = false }) {
  const { t } = useI18n();
  return (
    <div className="mb-3 min-w-0 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4 sm:px-5 sm:py-5">
      <div className="break-words text-[11px] font-semibold uppercase leading-4 tracking-normal text-slate-500">{t(label)}</div>
      <div className={`mt-3 break-words font-display text-lg font-bold leading-7 sm:mt-4 sm:text-xl 2xl:text-[22px] ${accent ? 'text-cyan-200' : 'text-white'}`}>{value}</div>
    </div>
  );
}

export function Hint({ children }) {
  const { t } = useI18n();
  return (
    <div className="mb-5 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-sm text-slate-400">
      {typeof children === 'string' ? t(children) : children}
    </div>
  );
}

export function CircuitBox({ lines }) {
  const { t } = useI18n();
  return (
    <pre className="mb-4 overflow-x-auto rounded-xl border border-cyan-300/15 bg-slate-950/60 px-3 py-3 font-display text-xs leading-6 text-cyan-100 sm:px-4 sm:text-sm">
      {lines.map((line) => t(line)).join('\n')}
    </pre>
  );
}
