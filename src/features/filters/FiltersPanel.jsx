import { useState } from 'react';
import { Card, CircuitBox, Grid, Hint, Input, Result } from '../../components/ui';
import { lcCutoff, rcCutoff, voltageDivider } from '../../utils/filters';
import { formatNumber, toNumber } from '../../utils/format';

export function FiltersPanel() {
  const [form, setForm] = useState({ r: '10000', c: '10', l: '100', cnf: '100', vin: '12', r1: '10000', r2: '3300', rLoad: '' });
  const rc = rcCutoff(toNumber(form.r), toNumber(form.c));
  const lc = lcCutoff(toNumber(form.l), toNumber(form.cnf));
  const divider = voltageDivider({ vin: toNumber(form.vin), r1: toNumber(form.r1), r2: toNumber(form.r2), rLoad: toNumber(form.rLoad) });

  return (
    <Grid>
      <Card title="RC / LC фильтры" wide>
        <Hint>RC считает частоту среза. LC считает резонансную частоту контура.</Hint>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:gap-5">
          <Input label="R" unit="Ω" value={form.r} onChange={(value) => setForm({ ...form, r: value })} />
          <Input label="C" unit="µF" value={form.c} onChange={(value) => setForm({ ...form, c: value })} />
          <Input label="L" unit="µH" value={form.l} onChange={(value) => setForm({ ...form, l: value })} />
          <Input label="C" unit="nF" value={form.cnf} onChange={(value) => setForm({ ...form, cnf: value })} />
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:gap-5">
          <Result label="RC частота среза" value={formatNumber(rc, 'Hz')} accent />
          <Result label="LC резонансная частота" value={formatNumber(lc, 'Hz')} accent />
        </div>
      </Card>
      <Card title="Делитель напряжения">
        <CircuitBox lines={['Вход ── R1 ──●── R2 ── GND', '             │', '           Выход']} />
        <Hint>Оставьте R нагрузки пустым для расчета без нагрузки. Если указать номинал, он считается параллельно R2.</Hint>
        <div className="space-y-4">
          <Input label="Входное напряжение" unit="V" value={form.vin} onChange={(value) => setForm({ ...form, vin: value })} />
          <Input label="R1 верхнее плечо" unit="Ω" value={form.r1} onChange={(value) => setForm({ ...form, r1: value })} />
          <Input label="R2 нижнее плечо" unit="Ω" value={form.r2} onChange={(value) => setForm({ ...form, r2: value })} />
          <Input label="R нагрузки" unit="Ω" value={form.rLoad} onChange={(value) => setForm({ ...form, rLoad: value })} />
        </div>
        <div className="mt-5">
          <Result label="Выходное напряжение" value={formatNumber(divider?.vout, 'V')} accent />
          <Result label="Ток делителя" value={formatNumber(divider?.current, 'A')} />
          <Result label="Ток нагрузки" value={formatNumber(divider?.loadCurrent, 'A')} />
        </div>
      </Card>
    </Grid>
  );
}
