import { useState } from 'react';
import { Card, Grid, Hint, Input, InputWithUnitSelect, Result } from '../../components/ui';
import { useI18n } from '../../i18n';
import { translate } from '../../i18n/translations';
import { calculateOhmsLaw } from '../../utils/ohmsLaw';
import { formatNumber, toNumber } from '../../utils/format';

const ohmFields = ['voltage', 'current', 'resistance', 'power'];

const ohmFieldMeta = {
  voltage: { label: 'Напряжение', symbol: 'U', unit: 'V', hint: 'Падение напряжения на участке цепи.' },
  current: { label: 'Ток', symbol: 'I', hint: 'Ток через этот же участок цепи.' },
  resistance: { label: 'Сопротивление', symbol: 'R', unit: 'Ω', hint: 'Номинал резистора или сопротивление нагрузки.' },
  power: { label: 'Мощность', symbol: 'P', hint: 'Тепловая мощность, которую рассеивает нагрузка.' },
};

const ohmResultMeta = {
  voltage: { label: 'Напряжение U', unit: 'V' },
  current: { label: 'Ток I', unit: 'A' },
  resistance: { label: 'Сопротивление R', unit: 'Ω' },
  power: { label: 'Мощность P', unit: 'W' },
};

export function OhmsLawPanel() {
  const { language, t } = useI18n();
  const [values, setValues] = useState({ voltage: '5', current: '20', resistance: '', power: '' });
  const [currentUnit, setCurrentUnit] = useState('mA');
  const [powerUnit, setPowerUnit] = useState('W');
  const current = parsePositive(values.current);
  const power = parsePositive(values.power);
  const inputs = {
    voltage: parsePositive(values.voltage),
    current: Number.isFinite(current) ? (currentUnit === 'mA' ? current / 1_000 : current) : null,
    resistance: parsePositive(values.resistance),
    power: Number.isFinite(power) ? (powerUnit === 'mW' ? power / 1_000 : power) : null,
  };
  const knownFields = ohmFields.filter((field) => Number.isFinite(inputs[field]));
  const result = knownFields.length === 2 ? calculateOhmsLaw(inputs) : null;
  const status = getOhmStatus(knownFields.length, language);

  function clearValues() {
    setValues({ voltage: '', current: '', resistance: '', power: '' });
  }

  return (
    <Grid>
      <Card title="Входные параметры" wide>
        <Hint>Заполните ровно любые две положительные величины. Остальные значения будут рассчитаны автоматически по закону Ома и формулам мощности.</Hint>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:gap-5">
          {ohmFields.map((field) => {
            const meta = ohmFieldMeta[field];
            const active = knownFields.includes(field);
            return (
              <div
                key={field}
                className={`rounded-[1.35rem] border p-4 transition ${
                  active ? 'border-cyan-300/45 bg-cyan-300/[0.08]' : 'border-white/10 bg-white/[0.025]'
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="font-display text-xl font-bold tracking-[-0.06em] text-white">{meta.symbol}</div>
                    <div className="mt-1 text-sm text-slate-400">{t(meta.label)}</div>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
                    active ? 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100' : 'border-white/10 bg-white/[0.035] text-slate-500'
                  }`}>
                    {active ? t('исходное') : t('пусто')}
                  </span>
                </div>
                {field === 'current' ? (
                  <InputWithUnitSelect
                    label={`${t(meta.label)} ${meta.symbol}`}
                    value={values.current}
                    unit={currentUnit}
                    units={['A', 'mA']}
                    onUnitChange={setCurrentUnit}
                    onChange={(value) => setValues({ ...values, current: value })}
                  />
                ) : field === 'power' ? (
                  <InputWithUnitSelect
                    label={`${t(meta.label)} ${meta.symbol}`}
                    value={values.power}
                    unit={powerUnit}
                    units={['W', 'mW']}
                    onUnitChange={setPowerUnit}
                    onChange={(value) => setValues({ ...values, power: value })}
                  />
                ) : (
                  <Input label={`${t(meta.label)} ${meta.symbol}`} unit={meta.unit} value={values[field]} onChange={(value) => setValues({ ...values, [field]: value })} />
                )}
                <p className="mt-2 text-xs leading-5 text-slate-500">{t(meta.hint)}</p>
              </div>
            );
          })}
        </div>

        <div className={`mt-5 rounded-[1.35rem] border px-4 py-4 sm:flex sm:items-center sm:justify-between sm:gap-4 ${status.tone}`}>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em]">{status.title}</div>
            <div className="mt-2 text-sm leading-5 text-slate-300">{status.text}</div>
          </div>
          <button
            className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/30 hover:text-white sm:mt-0"
            type="button"
            onClick={clearValues}
          >
            {t('Очистить')}
          </button>
        </div>
      </Card>
      <Card title="Результат">
        <div className="mb-5 rounded-[1.5rem] border border-cyan-300/25 bg-cyan-300/[0.08] px-4 py-5 sm:px-5 sm:py-6">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200 sm:tracking-[0.24em]">{result ? t('Расчет готов') : t('Ожидаю данные')}</div>
          <div className="mt-3 text-sm leading-6 text-slate-300">
            {result ? `${t('Используются')}: ${knownFields.map((field) => `${t(ohmFieldMeta[field].label)} ${ohmFieldMeta[field].symbol}`).join(' + ')}.` : status.text}
          </div>
        </div>
        {ohmFields.map((field) => (
          <OhmResult
            key={field}
            field={field}
            inputs={inputs}
            result={result}
            knownFields={knownFields}
            currentUnit={currentUnit}
            powerUnit={powerUnit}
          />
        ))}
      </Card>
    </Grid>
  );
}

function OhmResult({ field, inputs, result, knownFields, currentUnit, powerUnit }) {
  const { t } = useI18n();
  const meta = ohmFieldMeta[field];
  const known = knownFields.includes(field);
  const value = result?.[field] ?? (known ? inputs[field] : null);
  return (
    <div className={`mb-3 min-w-0 rounded-2xl border px-4 py-4 sm:px-5 sm:py-5 ${known ? 'border-white/10 bg-white/[0.025]' : 'border-cyan-300/15 bg-white/[0.04]'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="break-words text-[11px] font-semibold uppercase leading-4 tracking-normal text-slate-500">{t(meta.label)} {meta.symbol}</div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${known ? 'border-white/10 text-slate-500' : 'border-cyan-300/25 text-cyan-100'}`}>
          {known ? t('задано') : t('расчет')}
        </span>
      </div>
      <div className={`mt-3 break-words font-display text-lg font-bold leading-7 sm:mt-4 sm:text-xl 2xl:text-[22px] ${known ? 'text-slate-300' : 'text-white'}`}>
        {formatOhmValue(field, value, currentUnit, powerUnit)}
      </div>
      <div className="mt-2 text-xs leading-5 text-slate-500">{known ? t('Исходное значение пользователя') : getOhmFormula(field, knownFields, t)}</div>
    </div>
  );
}

function parsePositive(value) {
  const number = toNumber(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function getOhmStatus(knownCount, language) {
  if (knownCount === 2) {
    return {
      title: translate('Данных достаточно', language),
      text: translate('Расчет выполнен по двум исходным величинам.', language),
      tone: 'border-cyan-300/25 bg-cyan-300/[0.07] text-cyan-100',
    };
  }

  if (knownCount < 2) {
    return {
      title: translate('Нужно больше данных', language),
      text: language === 'en'
        ? `Enter ${2 - knownCount} more ${knownCount === 1 ? 'value' : 'values'}.`
        : `Заполните еще ${2 - knownCount} ${knownCount === 1 ? 'величину' : 'величины'}.`,
      tone: 'border-amber-300/25 bg-amber-300/[0.07] text-amber-100',
    };
  }

  return {
    title: translate('Слишком много исходных', language),
    text: translate('Оставьте ровно две величины, чтобы расчет был однозначным.', language),
    tone: 'border-amber-300/25 bg-amber-300/[0.07] text-amber-100',
  };
}

function formatOhmValue(field, value, currentUnit, powerUnit) {
  if (field === 'current') return formatNumber(currentUnit === 'mA' ? value * 1_000 : value, currentUnit);
  if (field === 'power') return formatNumber(powerUnit === 'mW' ? value * 1_000 : value, powerUnit);
  return formatNumber(value, ohmResultMeta[field].unit);
}

function getOhmFormula(field, knownFields, t) {
  if (knownFields.length !== 2) return t('Заполните две исходные величины');
  const has = (name) => knownFields.includes(name);

  if (field === 'voltage') {
    if (has('current') && has('resistance')) return 'U = I × R';
    if (has('power') && has('current')) return 'U = P / I';
    if (has('power') && has('resistance')) return 'U = √(P × R)';
  }
  if (field === 'current') {
    if (has('voltage') && has('resistance')) return 'I = U / R';
    if (has('power') && has('voltage')) return 'I = P / U';
    if (has('power') && has('resistance')) return 'I = √(P / R)';
  }
  if (field === 'resistance') {
    if (has('voltage') && has('current')) return 'R = U / I';
    if (has('voltage') && has('power')) return 'R = U² / P';
    if (has('power') && has('current')) return 'R = P / I²';
  }
  if (field === 'power') {
    if (has('voltage') && has('current')) return 'P = U × I';
    if (has('voltage') && has('resistance')) return 'P = U² / R';
    if (has('current') && has('resistance')) return 'P = I² × R';
  }

  return t('Расчетная величина');
}
