import { useMemo } from 'react';
import { useI18n } from '../../i18n';

const fieldClass =
  'w-full rounded-xl border border-cyan-300/10 bg-slate-950/70 px-3 py-3 font-display text-base text-cyan-50 outline-none transition focus:border-cyan-300/50 focus:shadow-glow sm:px-4 sm:text-lg';

export function Input({ label, unit, value, onChange }) {
  const { t } = useI18n();
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-medium text-slate-400">{t(label)}</span>
      {unit ? (
        <div className="grid grid-cols-[minmax(0,1fr)_48px] overflow-hidden rounded-xl border border-cyan-300/10 bg-slate-950/70 transition focus-within:border-cyan-300/50 focus-within:shadow-glow sm:grid-cols-[minmax(0,1fr)_52px]">
          <input
            className="min-w-0 bg-transparent px-3 py-3 font-display text-base text-cyan-50 outline-none sm:px-4 sm:text-lg"
            value={value}
            onChange={(event) => onChange(event.target.value)}
          />
          <span className="flex items-center justify-center border-l border-cyan-300/10 bg-slate-900/70 px-2 text-sm text-slate-500">{unit}</span>
        </div>
      ) : (
        <input className={fieldClass} value={value} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}

export function InputWithUnitSelect({ label, value, onChange, unit, units, onUnitChange }) {
  const { t } = useI18n();
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-medium text-slate-400">{t(label)}</span>
      <div className="grid grid-cols-[minmax(0,1fr)_74px] overflow-hidden rounded-xl border border-cyan-300/10 bg-slate-950/70 transition focus-within:border-cyan-300/50 focus-within:shadow-glow sm:grid-cols-[minmax(0,1fr)_86px]">
        <input
          className="min-w-0 bg-transparent px-3 py-3 font-display text-base text-cyan-50 outline-none sm:px-4 sm:text-lg"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <select
          className="border-l border-cyan-300/10 bg-slate-900 px-2 font-display text-sm text-cyan-100 outline-none"
          value={unit}
          onChange={(event) => onUnitChange(event.target.value)}
        >
          {units.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>
    </label>
  );
}

export function Select({ label, value, onChange, options, suffix }) {
  const { t } = useI18n();
  const normalized = useMemo(() => options.map((option) => (Array.isArray(option) ? option : [option, `${option}${suffix ? ` ${t(suffix)}` : ''}`])), [options, suffix, t]);
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-medium text-slate-400">{t(label)}</span>
      <select className={fieldClass} value={value} onChange={(event) => onChange(event.target.value)}>
        {normalized.map(([optionValue, labelText]) => (
          <option key={optionValue || 'empty'} value={optionValue}>{t(labelText)}</option>
        ))}
      </select>
    </label>
  );
}
