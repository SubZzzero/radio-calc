import { useState } from 'react';
import { Card, CircuitBox, Hint, Input, InputWithUnitSelect, Result } from '../../components/ui';
import { currentDivider, voltageDivider } from '../../utils/filters';
import { formatNumber, toNumber } from '../../utils/format';

export function DividersPanel() {
  const [voltageForm, setVoltageForm] = useState({ vin: '12', r1: '10000', r2: '3300', rLoad: '' });
  const [currentForm, setCurrentForm] = useState({ totalCurrent: '100', currentUnit: 'mA', r1: '1000', r2: '2200' });
  const totalCurrent = toNumber(currentForm.totalCurrent);
  const currentDividerResult = currentDivider({
    totalCurrent: Number.isFinite(totalCurrent) ? (currentForm.currentUnit === 'mA' ? totalCurrent / 1_000 : totalCurrent) : null,
    r1: toNumber(currentForm.r1),
    r2: toNumber(currentForm.r2),
  });
  const voltageDividerResult = voltageDivider({
    vin: toNumber(voltageForm.vin),
    r1: toNumber(voltageForm.r1),
    r2: toNumber(voltageForm.r2),
    rLoad: toNumber(voltageForm.rLoad),
  });
  const voltageRatio = voltageDividerResult ? voltageDividerResult.vout / toNumber(voltageForm.vin) : null;

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 2xl:gap-6">
      <Card title="Делитель напряжения: R1 + R2">
        <CircuitBox lines={['Вход ── R1 ──●── R2 ── GND', '             │', '           Выход']} />
        <Hint>Последовательные резисторы делят напряжение. Если выход нагружен, укажите сопротивление нагрузки: оно считается параллельно R2.</Hint>
        <div className="grid grid-cols-1 gap-4">
          <Input label="Входное напряжение" unit="V" value={voltageForm.vin} onChange={(value) => setVoltageForm({ ...voltageForm, vin: value })} />
          <Input label="R1 верхний" unit="Ω" value={voltageForm.r1} onChange={(value) => setVoltageForm({ ...voltageForm, r1: value })} />
          <Input label="R2 нижний" unit="Ω" value={voltageForm.r2} onChange={(value) => setVoltageForm({ ...voltageForm, r2: value })} />
          <Input label="R нагрузки" unit="Ω" value={voltageForm.rLoad} onChange={(value) => setVoltageForm({ ...voltageForm, rLoad: value })} />
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 2xl:grid-cols-2">
          <Result label="Выходное напряжение" value={formatNumber(voltageDividerResult?.vout, 'V')} accent />
          <Result label="Коэффициент" value={Number.isFinite(voltageRatio) ? `${formatNumber(voltageRatio * 100, '%')}` : '—'} />
          <Result label="Ток цепи, A" value={formatNumber(voltageDividerResult?.current, 'A')} />
          <Result label="Ток цепи, mA" value={formatNumber((voltageDividerResult?.current ?? NaN) * 1_000, 'mA')} />
          <Result label="Нижнее плечо с нагрузкой" value={formatNumber(voltageDividerResult?.lowerResistance, 'Ω')} />
          <Result label="Ток нагрузки" value={formatNumber(voltageDividerResult?.loadCurrent, 'A')} />
          <Result label="Мощность R1" value={formatNumber(voltageDividerResult?.r1Power, 'W', 4)} />
          <Result label="Мощность R2" value={formatNumber(voltageDividerResult?.r2Power, 'W', 4)} />
          <Result label="Мощность нагрузки" value={formatNumber(voltageDividerResult?.loadPower, 'W', 4)} />
        </div>
      </Card>

      <Card title="Делитель тока: R1 || R2">
        <CircuitBox lines={['Iin ──●── R1 ──●', '      │        │', '      └── R2 ──┘']} />
        <Hint>Параллельные ветви делят ток.</Hint>
        <div className="grid grid-cols-1 gap-4">
          <InputWithUnitSelect
            label="Общий ток"
            value={currentForm.totalCurrent}
            unit={currentForm.currentUnit}
            units={['A', 'mA']}
            onUnitChange={(value) => setCurrentForm({ ...currentForm, currentUnit: value })}
            onChange={(value) => setCurrentForm({ ...currentForm, totalCurrent: value })}
          />
          <Input label="R1 ветвь" unit="Ω" value={currentForm.r1} onChange={(value) => setCurrentForm({ ...currentForm, r1: value })} />
          <Input label="R2 ветвь" unit="Ω" value={currentForm.r2} onChange={(value) => setCurrentForm({ ...currentForm, r2: value })} />
        </div>
        <div className="mt-5 grid grid-cols-1 gap-3 2xl:grid-cols-2">
          <Result label="Ток через R1" value={formatNumber(currentDividerResult?.i1, 'A')} accent />
          <Result label="Ток через R2" value={formatNumber(currentDividerResult?.i2, 'A')} accent />
          <Result label="Эквивалентное R" value={formatNumber(currentDividerResult?.equivalentResistance, 'Ω')} />
          <Result label="Напряжение ветвей" value={formatNumber(currentDividerResult?.branchVoltage, 'V')} />
          <Result label="Мощность R1" value={formatNumber(currentDividerResult?.r1Power, 'W', 4)} />
          <Result label="Мощность R2" value={formatNumber(currentDividerResult?.r2Power, 'W', 4)} />
        </div>
      </Card>
    </div>
  );
}
