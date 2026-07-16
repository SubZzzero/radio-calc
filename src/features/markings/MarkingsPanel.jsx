import { useState } from 'react';
import { Card, Hint, Input, Result, Select } from '../../components/ui';
import { useI18n } from '../../i18n';
import { resistorColors } from '../../data/standards';
import { decodeColorBands, decodeSmdCode } from '../../utils/markings';
import { formatNumber } from '../../utils/format';

export function MarkingsPanel() {
  const { language } = useI18n();
  const colorKeys = Object.keys(resistorColors);
  const [bands, setBands] = useState(['brown', 'black', 'red', 'gold']);
  const [smd, setSmd] = useState('103');
  const colorResult = decodeColorBands(bands);
  const smdResult = decodeSmdCode(smd);

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_420px] 2xl:gap-6">
      <Card title="Цветовые кольца" wide>
        <Hint>4 или 5 полос: цифры, множитель, допуск.</Hint>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[0, 1, 2, 3, 4].map((index) => (
            <Select
              key={index}
              label={language === 'en' ? `Band ${index + 1}` : `${index + 1} кольцо`}
              value={bands[index] ?? ''}
              onChange={(value) => {
                const next = [...bands];
                next[index] = value;
                setBands(next.filter((item) => item !== ''));
              }}
              options={['', ...colorKeys].map((key) => [key, key ? resistorColors[key].label : 'Нет'])}
            />
          ))}
        </div>
        <div className="mx-auto mt-6 flex h-16 max-w-[260px] items-center justify-center gap-3 rounded-2xl border border-white/10 bg-slate-950/60 px-5">
          {bands.map((band, index) => (
            <div key={`${band}-${index}`} className="h-10 w-6 rounded-md border border-white/20" style={{ background: colorToCss(band) }} />
          ))}
        </div>
      </Card>
      <Card title="Декодер SMD">
        <Hint>Пример: 103 = 10 kΩ, 4R7 = 4.7 Ω.</Hint>
        <div className="mb-4">
          <Input label="SMD код" value={smd} onChange={setSmd} />
        </div>
        <Result label="Номинал по кольцам" value={formatNumber(colorResult?.resistance, 'Ω')} accent />
        <Result label="Допуск" value={colorResult?.tolerance ? `±${colorResult.tolerance}%` : '—'} />
        <Result label="SMD номинал" value={formatNumber(smdResult?.resistance, 'Ω')} accent />
        <Result label="Система" value={smdResult?.system ?? '—'} />
      </Card>
    </div>
  );
}

function colorToCss(color) {
  const map = {
    black: '#020617',
    brown: '#7c2d12',
    red: '#dc2626',
    orange: '#f97316',
    yellow: '#facc15',
    green: '#16a34a',
    blue: '#2563eb',
    violet: '#7c3aed',
    gray: '#64748b',
    white: '#f8fafc',
    gold: '#d6a520',
    silver: '#cbd5e1',
  };
  return map[color] ?? 'transparent';
}
