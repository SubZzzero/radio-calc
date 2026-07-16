import { useState } from 'react';
import { Card, CircuitBox, Grid, Hint, Input, Result, Select } from '../../components/ui';
import { useI18n } from '../../i18n';
import { calculateLedResistor, calculateLedWithSelectedResistor } from '../../utils/led';
import { formatNumber, toNumber } from '../../utils/format';

export function LedPanel() {
  const { t } = useI18n();
  const [mode, setMode] = useState('pick');
  const [form, setForm] = useState({
    supplyVoltage: '9',
    forwardVoltage: '2.0',
    forwardCurrentMa: '20',
    selectedResistance: '470',
    powerMarginPercent: '30',
    resistanceMarginPercent: '30',
    series: 'E24',
  });
  const powerMarginPercent = toNumber(form.powerMarginPercent) ?? 0;
  const resistanceMarginPercent = toNumber(form.resistanceMarginPercent) ?? 0;
  const ledVoltage = toNumber(form.forwardVoltage);
  const pickResult = calculateLedResistor({
    supplyVoltage: toNumber(form.supplyVoltage),
    forwardVoltage: toNumber(form.forwardVoltage),
    forwardCurrentMa: toNumber(form.forwardCurrentMa),
    powerMarginPercent,
    resistanceMarginPercent,
    series: form.series,
  });
  const checkResult = calculateLedWithSelectedResistor({
    supplyVoltage: toNumber(form.supplyVoltage),
    forwardVoltage: toNumber(form.forwardVoltage),
    resistance: toNumber(form.selectedResistance),
    powerMarginPercent,
  });

  return (
    <Grid>
      <Card title="Последовательная цепь" wide>
        <CircuitBox lines={['+Vs ── R ── нагрузка ── GND']} />
        <Hint>Подходит для LED и других последовательных нагрузок, если известно падение напряжения на нагрузке. Проверка резистора считает нагрузку как фиксированное падение напряжения.</Hint>
        <div className="mb-5 grid grid-cols-1 gap-2 rounded-2xl border border-white/10 bg-white/[0.025] p-2 sm:grid-cols-2 sm:gap-3">
          <button
            className={`rounded-xl px-4 py-3 text-left font-display text-sm font-semibold uppercase tracking-[0.12em] transition ${
              mode === 'pick' ? 'bg-cyan-300/15 text-cyan-100 shadow-glow' : 'text-slate-500 hover:text-white'
            }`}
            type="button"
            onClick={() => setMode('pick')}
          >
            {t('Подобрать резистор')}
          </button>
          <button
            className={`rounded-xl px-4 py-3 text-left font-display text-sm font-semibold uppercase tracking-[0.12em] transition ${
              mode === 'check' ? 'bg-cyan-300/15 text-cyan-100 shadow-glow' : 'text-slate-500 hover:text-white'
            }`}
            type="button"
            onClick={() => setMode('check')}
          >
            {t('Проверить резистор')}
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3 2xl:gap-5">
          <Input label="Vs питание" unit="V" value={form.supplyVoltage} onChange={(value) => setForm({ ...form, supplyVoltage: value })} />
          <Input label="U нагрузки" unit="V" value={form.forwardVoltage} onChange={(value) => setForm({ ...form, forwardVoltage: value })} />
          {mode === 'check' ? (
            <Input label="Ваш резистор" unit="Ω" value={form.selectedResistance} onChange={(value) => setForm({ ...form, selectedResistance: value })} />
          ) : (
            <Input label="Ток нагрузки" unit="mA" value={form.forwardCurrentMa} onChange={(value) => setForm({ ...form, forwardCurrentMa: value })} />
          )}
          <Input label="Запас мощности" unit="%" value={form.powerMarginPercent} onChange={(value) => setForm({ ...form, powerMarginPercent: value })} />
          {mode === 'pick' && (
            <>
              <Input label="Запас R" unit="%" value={form.resistanceMarginPercent} onChange={(value) => setForm({ ...form, resistanceMarginPercent: value })} />
              <Select label="Ряд" value={form.series} onChange={(value) => setForm({ ...form, series: value })} options={['E24', 'E12']} />
            </>
          )}
        </div>
      </Card>
      {mode === 'check' ? (
        <div className="rounded-[1.5rem] border border-amber-300/60 bg-slate-950/55 p-5 sm:p-6">
          <h3 className="mb-5 font-display text-sm font-bold uppercase tracking-[0.16em] text-amber-100 sm:tracking-[0.2em]">{t('Итог')}</h3>
          <Result label="Принятое напряжение нагрузки" value={formatNumber(checkResult?.ledVoltage, 'V')} />
          <Result label="На резисторе останется" value={formatNumber(checkResult?.voltageOnResistor, 'V')} />
          <Result label="Мощность резистора" value={formatNumber(checkResult?.powerRecommendation?.recommended, 'W')} accent />
          <Result label="Ток нагрузки" value={formatNumber(checkResult?.current * 1_000, 'mA', 1)} />
          <Result label="Резистор рассеивает" value={formatNumber(checkResult?.power, 'W', 3)} />
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-amber-300/60 bg-slate-950/55 p-5 sm:p-6">
          <h3 className="mb-5 font-display text-sm font-bold uppercase tracking-[0.16em] text-amber-100 sm:tracking-[0.2em]">{t('Итог')}</h3>
          <Result label="Падение на нагрузке" value={formatNumber(ledVoltage, 'V')} />
          <Result label="Точное расчетное R" value={formatNumber(pickResult?.exactResistance, 'Ω')} />
          <Result label="На резисторе останется" value={formatNumber(pickResult?.voltageOnResistor, 'V')} />
          <Result label="Ставить резистор" value={formatNumber(pickResult?.standardResistance, 'Ω')} accent />
          <Result label="Мощность резистора" value={formatNumber(pickResult?.powerRecommendation?.recommended, 'W')} accent />
          <Result label="Ток нагрузки" value={formatNumber(pickResult?.selectedCurrent * 1_000, 'mA', 1)} />
          <Result label="Резистор рассеивает" value={formatNumber(pickResult?.selectedPower, 'W', 3)} />
        </div>
      )}
    </Grid>
  );
}
