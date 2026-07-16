import { useState } from 'react';
import { Card, CircuitBox, Grid, Hint, Input, Result } from '../../components/ui';
import { useI18n } from '../../i18n';
import { calculateLedPotentiometer } from '../../utils/potentiometer';
import { formatNumber, toNumber } from '../../utils/format';
import { recommendedResistorPower } from '../../utils/standards';

export function PotentiometerPanel() {
  const { t } = useI18n();
  const [form, setForm] = useState({
    supplyVoltage: '9',
    forwardVoltage: '2.0',
    fixedResistance: '470',
    minCurrentMa: '1',
  });
  const result = calculateLedPotentiometer({
    supplyVoltage: toNumber(form.supplyVoltage),
    forwardVoltage: toNumber(form.forwardVoltage),
    fixedResistance: toNumber(form.fixedResistance),
    minCurrentMa: toNumber(form.minCurrentMa),
  });
  const fixedPowerRecommendation = recommendedResistorPower(result?.fixedResistorMaxPower, 0.5);

  return (
    <Grid>
      <Card title="Нагрузка + потенциометр" wide>
        <CircuitBox lines={['+Vs ── R защитный ── POT ── нагрузка ── GND']} />
        <Hint>При максимальном сопротивлении потенциометра ток минимален. При минимальном сопротивлении ток ограничивает защитный резистор.</Hint>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:gap-5">
          <Input label="Vs питание" unit="V" value={form.supplyVoltage} onChange={(value) => setForm({ ...form, supplyVoltage: value })} />
          <Input label="U нагрузки" unit="V" value={form.forwardVoltage} onChange={(value) => setForm({ ...form, forwardVoltage: value })} />
          <Input label="Защитный R" unit="Ω" value={form.fixedResistance} onChange={(value) => setForm({ ...form, fixedResistance: value })} />
          <Input label="Минимальный ток" unit="mA" value={form.minCurrentMa} onChange={(value) => setForm({ ...form, minCurrentMa: value })} />
        </div>
      </Card>
      <div className="rounded-[1.5rem] border border-amber-300/60 bg-slate-950/55 p-5 sm:p-6">
        <h3 className="mb-5 font-display text-sm font-bold uppercase tracking-[0.16em] text-amber-100 sm:tracking-[0.2em]">{t('Итог')}</h3>
        <Result label="Ставить потенциометр" value={formatNumber(result?.recommendedPotentiometer, 'Ω')} accent />
        <Result label="Ток нагрузки на минимуме" value={formatNumber(result?.minCurrent * 1_000, 'mA', 1)} />
        <Result label="Ток нагрузки на максимуме" value={formatNumber(result?.maxCurrent * 1_000, 'mA', 1)} />
        <Result label="Мощность защитного R" value={formatNumber(fixedPowerRecommendation?.recommended, 'W')} accent />
        <Result label="Потенциометр рассеивает до" value={formatNumber(result?.potMaxPower, 'W', 3)} />
        <Result label="Максимум при Rpot" value={formatNumber(result?.potMaxPowerResistance, 'Ω')} />
        {result?.minCurrentExceedsMax && (
          <p className="mt-5 rounded-xl border border-red-300/25 bg-red-300/[0.06] p-4 text-sm leading-6 text-red-50">
            {t('Заданный минимальный ток выше максимального тока с этим защитным резистором. Даже при минимальном сопротивлении потенциометра ток будет меньше заданного.')}
          </p>
        )}
        {result?.exceedsCatalog && (
          <p className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm leading-6 text-amber-50">
            {t('Для заданного минимального тока нужен потенциометр больше доступного ряда. Показан максимальный номинал из списка.')}
          </p>
        )}
      </div>
    </Grid>
  );
}
