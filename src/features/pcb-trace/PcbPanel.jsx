import { useState } from 'react';
import { Card, Grid, Hint, Input, Result, Select } from '../../components/ui';
import { useI18n } from '../../i18n';
import { calculateTraceWidth } from '../../utils/pcbTrace';
import { formatNumber, toNumber } from '../../utils/format';

export function PcbPanel() {
  const { t } = useI18n();
  const [form, setForm] = useState({ current: '3', copperMicrons: '35', temperatureRise: '10', layer: 'external' });
  const result = calculateTraceWidth({
    current: toNumber(form.current),
    copperMicrons: toNumber(form.copperMicrons),
    temperatureRise: toNumber(form.temperatureRise),
    layer: form.layer,
  });

  return (
    <Grid>
      <Card title="Параметры дорожки" wide>
        <Hint>Это оценка по IPC-2221. Для платы берите округленную ширину вверх и учитывайте охлаждение, полигоны и реальные условия трассировки.</Hint>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:gap-5">
          <Input label="Ток" unit="A" value={form.current} onChange={(value) => setForm({ ...form, current: value })} />
          <Select label="Медь" value={form.copperMicrons} onChange={(value) => setForm({ ...form, copperMicrons: value })} options={['18', '35', '70']} suffix="мкм" />
          <Select label="Нагрев" value={form.temperatureRise} onChange={(value) => setForm({ ...form, temperatureRise: value })} options={['10', '20', '30']} suffix="°C" />
          <Select label="Слой" value={form.layer} onChange={(value) => setForm({ ...form, layer: value })} options={[["external", "Внешний"], ["internal", "Внутренний"]]} />
        </div>
      </Card>
      <Card title="Оценочная ширина">
        <Result label="Расчетная ширина" value={formatNumber(result?.widthMm, t('мм'))} />
        <Result label="Округлить вверх до" value={formatNumber(result?.roundedSafeMm, t('мм'))} accent />
        <Result label="Площадь сечения, кв. mil" value={formatNumber(result?.areaMils, 'mil²')} />
        <Result label="Модель" value={result?.model ?? '—'} />
        <p className="mt-5 rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-100">
          {t('Используется IPC-2221: I = k × ΔT^0.44 × A^0.725. Для внутренних слоев коэффициент ниже, поэтому ширина получается больше.')}
        </p>
      </Card>
    </Grid>
  );
}
