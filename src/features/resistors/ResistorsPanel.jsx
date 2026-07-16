import { useState } from 'react';
import { Card, Grid, Hint, Select } from '../../components/ui';
import { useI18n } from '../../i18n';
import { e12Base, e24Base } from '../../data/standards';
import { formatNumber } from '../../utils/format';

const resistorDecades = [
  ['1', '1-9.1 Ω'],
  ['10', '10-91 Ω'],
  ['100', '100-910 Ω'],
  ['1000', '1-9.1 kΩ'],
  ['10000', '10-91 kΩ'],
  ['100000', '100-910 kΩ'],
  ['1000000', '1-9.1 MΩ'],
];

export function ResistorsPanel() {
  const [series, setSeries] = useState('E24');
  const [decade, setDecade] = useState('1');
  const base = series === 'E12' ? e12Base : e24Base;
  const multiplier = Number(decade);
  const values = base.map((value) => value * multiplier / 10);

  return (
    <Grid>
      <Card title="Стандартные номиналы" wide>
        <Hint>E12 чаще встречается в простых наборах. E24 дает больше промежуточных значений, например 51 Ω.</Hint>
        <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:gap-5">
          <Select label="Ряд" value={series} onChange={setSeries} options={['E24', 'E12']} />
          <Select label="Диапазон" value={decade} onChange={setDecade} options={resistorDecades} />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4 2xl:gap-5">
          {values.map((value) => (
            <div key={value} className="min-w-0 break-words rounded-[1.25rem] border border-cyan-300/10 bg-white/[0.035] px-3 py-4 text-center font-display text-base font-bold leading-7 text-cyan-50 sm:px-4 sm:py-5 sm:text-lg 2xl:px-5 2xl:py-6 2xl:text-xl">
              {formatNumber(value, 'Ω')}
            </div>
          ))}
        </div>
      </Card>
      <Card title="Мощность резисторов">
        <Hint>Это не номинал в омах, а допустимая рассеиваемая мощность резистора. Если расчет дал 0.136 W, резистор на 0.125 W уже маловат, поэтому берут 0.25 W.</Hint>
        <PowerGuide power="0.125 W" title="Минимальный" text="Для очень малых токов и компактных схем, когда расчетная мощность заметно ниже 0.125 W." />
        <PowerGuide power="0.25 W" title="Обычный для макетирования" text="Самый частый выводной резистор. Хороший вариант для индикаторов, подтяжек и простых схем." accent />
        <PowerGuide power="0.5 W" title="Если греется" text="Берите, когда расчет близок к 0.25 W или резистор будет работать долго." />
        <PowerGuide power="1 W" title="Повышенная мощность" text="Для заметного нагрева, нагрузок и схем с большим падением напряжения." />
        <PowerGuide power="2 W / 5 W" title="Силовые цепи" text="Для нагрузочных, гасящих и силовых резисторов. Обычно крупные корпуса." />
      </Card>
    </Grid>
  );
}

function PowerGuide({ power, title, text, accent = false }) {
  const { t } = useI18n();
  return (
    <div className={`mb-3 rounded-2xl border px-4 py-4 ${accent ? 'border-cyan-300/30 bg-cyan-300/10' : 'border-white/10 bg-white/[0.035]'}`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className={`font-display text-xl font-bold ${accent ? 'text-cyan-100' : 'text-white'}`}>{power}</span>
        <span className="text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t(title)}</span>
      </div>
      <p className="text-sm leading-6 text-slate-400">{t(text)}</p>
    </div>
  );
}
