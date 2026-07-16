import { useState } from 'react';
import { Card, Hint } from '../../components/ui';
import { useI18n } from '../../i18n';
import {
  beginnerMaterialTips,
  desolderingTips,
  goodSolderJointSigns,
  heatSensitiveParts,
  solderAlloys,
  solderPrepTips,
  solderSafetyTips,
  solderTasks,
  solderTechniqueSteps,
} from './solderingData';

export function SolderingPanel() {
  const { t } = useI18n();
  const boardChoices = [
    {
      id: 'leadFreeBoard',
      title: 'PbF / Pb-Free / LF / RoHS',
      label: 'Скорее бессвинцовый',
      alloyId: 'leadFree',
      text: 'Современная плата. Обычно нужна температура выше, чистое залуженное жало и хорошая передача тепла.',
    },
    {
      id: 'leadBoard',
      title: 'SnPb / Pb / старая плата',
      label: 'Скорее свинцовый',
      alloyId: 'lead',
      text: 'Старая техника или прямо указанный SnPb. Плавится легче, температуру можно ниже.',
    },
    {
      id: 'unknownBoard',
      title: 'Не знаю / нет маркировки',
      label: 'Безопасный старт',
      alloyId: 'unknown',
      text: 'Начните умеренно. Если припой не течет, сначала проверьте жало и теплопередачу, потом поднимайте температуру.',
    },
  ];
  const workChoices = [
    {
      id: 'normal',
      title: 'Обычная пайка',
      taskId: 'throughHole',
      text: 'Резисторы, конденсаторы, обычные выводы.',
    },
    {
      id: 'delicate',
      title: 'Мелкое / рядом пластик',
      taskId: 'smd',
      text: 'SMD, тонкие площадки, светодиоды, разъемы.',
    },
    {
      id: 'heavy',
      title: 'Много меди',
      taskId: 'ground',
      text: 'Земляной полигон, толстые выводы, разъемы питания.',
    },
    {
      id: 'desoldering',
      title: 'Выпаиваю деталь',
      taskId: 'desolder',
      text: 'Нужно снять компонент, очистить отверстие или убрать лишний припой.',
    },
  ];
  const [boardChoiceId, setBoardChoiceId] = useState('leadFreeBoard');
  const [workChoiceId, setWorkChoiceId] = useState('normal');
  const boardChoice = boardChoices.find((item) => item.id === boardChoiceId) ?? boardChoices[0];
  const workChoice = workChoices.find((item) => item.id === workChoiceId) ?? workChoices[0];
  const alloy = solderAlloys.find((item) => item.id === boardChoice.alloyId) ?? solderAlloys[0];
  const task = solderTasks.find((item) => item.id === workChoice.taskId) ?? solderTasks[0];
  const temperatureRange = calculateSolderingRange(alloy.range, task.adjust);
  const startTemperature = clampSolderingTemperature(temperatureRange[0] + (workChoice.id === 'normal' ? 10 : 0));
  const temperatureAdvice = {
    normal: 'Для обычной пайки сначала проверьте жало: оно должно быть чистым и залуженным. Если припой плохо смачивает площадку, помогает свежий припой или флюс. Температуру поднимайте только постепенно.',
    delicate: 'Для SMD и пластика рядом не компенсируйте все температурой. Работайте короткими касаниями, чистым жалом и небольшим количеством припоя. Если не смачивает, лучше добавить флюс или свежий припой, а не долго греть.',
    heavy: 'Для большой земли и толстых выводов проблема чаще не в градусах, а в передаче тепла. Возьмите жало шире, добавьте свежий припой, прогрейте площадку быстрее. Температуру повышайте шагом 10-20 °C.',
    desoldering: 'При выпайке старый припой часто окислен. Добавьте свежий припой, прогрейте вывод и площадку вместе, затем убирайте припой отсосом или оплеткой. Не тяните деталь, пока припой держит вывод.',
  }[workChoice.id];

  return (
    <div className="space-y-6">
      <Card title="Перед работой: паяльник" wide>
        <Hint>Перед выбором температуры подготовьте именно жало. Грязное или сухое жало может плохо паять даже при правильных градусах.</Hint>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
          {solderPrepTips.map((item, index) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 2xl:min-h-[150px]">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-300/10 font-display text-xs font-bold text-cyan-100">
                  {index + 1}
                </span>
                <span className="font-display text-lg font-bold tracking-[-0.04em] text-white">{t(item.title)}</span>
              </div>
              <p className="text-sm leading-6 text-slate-300">{t(item.text)}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Безопасный старт" wide>
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
          {solderSafetyTips.map((item) => (
            <div key={item.title} className="relative overflow-hidden rounded-2xl border border-amber-300/20 bg-gradient-to-br from-amber-300/[0.12] via-white/[0.035] to-cyan-300/[0.06] p-4 2xl:min-h-[150px]">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-200/10 blur-2xl" />
              <div className="relative text-[11px] font-bold uppercase tracking-[0.18em] text-amber-100">{t('Важно')}</div>
              <div className="relative mt-3 font-display text-lg font-bold tracking-[-0.04em] text-white">{t(item.title)}</div>
              <p className="relative mt-3 text-sm leading-6 text-slate-300">{t(item.text)}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="1. Плата или припой" wide>
        <Hint>Выберите самое похожее. Для паяльника этого достаточно, чтобы не гадать с температурой.</Hint>
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
          {boardChoices.map((item) => {
            const active = item.id === boardChoice.id;
            return (
              <button
                key={item.id}
                className={`rounded-2xl border p-4 text-left transition 2xl:min-h-[118px] ${
                  active
                    ? 'border-cyan-300/50 bg-cyan-300/15 text-cyan-50 shadow-glow'
                    : 'border-white/10 bg-white/[0.025] text-slate-300 hover:border-cyan-300/25 hover:bg-white/[0.045]'
                }`}
                type="button"
                onClick={() => setBoardChoiceId(item.id)}
              >
                <span className="block font-display text-xl font-bold tracking-[-0.05em] text-white">{t(item.title)}</span>
                <span className="mt-3 inline-flex rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-100">
                  {t(item.label)}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-4 min-h-[78px] rounded-2xl border border-white/10 bg-slate-950/55 px-5 py-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{t('Что это значит')}</div>
          <p className="mt-2 text-sm leading-6 text-slate-300">{t(boardChoice.text)}</p>
        </div>
      </Card>

      <Card title="2. Что делаете" wide>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
          {workChoices.map((item) => {
            const active = item.id === workChoice.id;
            return (
              <button
                key={item.id}
                className={`rounded-2xl border p-4 text-left transition 2xl:min-h-[104px] ${
                  active
                    ? 'border-cyan-300/50 bg-cyan-300/15 shadow-glow'
                    : 'border-white/10 bg-white/[0.025] hover:border-cyan-300/25 hover:bg-white/[0.045]'
                }`}
                type="button"
                onClick={() => setWorkChoiceId(item.id)}
              >
                <span className="block font-display text-xl font-bold tracking-[-0.05em] text-white">{t(item.title)}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-4 min-h-[70px] rounded-2xl border border-white/10 bg-slate-950/55 px-5 py-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{t('Текущая задача')}</div>
          <p className="mt-2 text-sm leading-6 text-slate-300">{t(workChoice.text)}</p>
        </div>
      </Card>

      <Card title="Температура паяльника" wide>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="rounded-[1.5rem] border border-cyan-300/25 bg-cyan-300/[0.08] px-4 py-5 sm:px-5 sm:py-6">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200 sm:tracking-[0.24em]">{t('Начните с')}</div>
            <div className="mt-3 font-display text-3xl font-bold tracking-[-0.08em] text-white sm:text-4xl 2xl:text-5xl">
              {startTemperature} °C
            </div>
            <div className="mt-4 text-sm leading-6 text-slate-300">{t('Рабочий коридор')}: {temperatureRange[0]}-{temperatureRange[1]} °C.</div>
          </div>
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-5 2xl:min-h-[188px]">
            <p className="text-sm leading-6 text-slate-300 2xl:max-h-[112px] 2xl:overflow-y-auto">{t(temperatureAdvice)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-100">
                {t(workChoice.title)}
              </span>
              <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-100">
                {t(boardChoice.label)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Как сделать одну хорошую пайку" wide>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[1.5rem] border border-cyan-300/20 bg-cyan-300/[0.055] p-4 sm:p-5">
            <div className="mb-4 font-display text-xl font-bold tracking-[-0.05em] text-white">{t('Три движения')}</div>
            <div className="grid grid-cols-1 gap-3">
              {solderTechniqueSteps.map((item, index) => (
                <div key={item.title} className="grid grid-cols-[36px_minmax(0,1fr)] gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 font-display text-sm font-bold text-cyan-100">
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-display text-base font-bold tracking-[-0.03em] text-white">{t(item.title)}</div>
                    <p className="mt-1 text-sm leading-6 text-slate-300">{t(item.text)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-emerald-300/20 bg-emerald-300/[0.055] p-4 sm:p-5">
              <div className="font-display text-xl font-bold tracking-[-0.05em] text-white">{t('Признаки нормы')}</div>
              <div className="mt-4 grid grid-cols-1 gap-2">
                {goodSolderJointSigns.map((item) => (
                  <div key={item} className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm leading-6 text-emerald-50">
                    {t(item)}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-4 sm:p-5">
              <div className="font-display text-xl font-bold tracking-[-0.05em] text-white">{t('Материалы без сюрпризов')}</div>
              <div className="mt-4 space-y-3">
                {beginnerMaterialTips.map((item) => (
                  <p key={item} className="text-sm leading-6 text-slate-300">{t(item)}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Как выпаивать паяльником" wide>
        <Hint>При выпайке задача не “жарить сильнее”, а быстро передать тепло и убрать припой, пока площадка не перегрелась.</Hint>
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {desolderingTips.map((item) => (
            <div key={item.title} className="grid rounded-2xl border border-white/10 bg-white/[0.035] p-4 2xl:min-h-[210px] 2xl:grid-rows-[auto_minmax(0,1fr)_auto]">
              <div className="font-display text-lg font-bold tracking-[-0.04em] text-white">{t(item.title)}</div>
              <p className="mt-3 text-sm leading-6 text-slate-300">{t(item.do)}</p>
              <p className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] px-3 py-3 text-sm leading-5 text-amber-50">{t(item.avoid)}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Что легко перегреть" wide>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {heatSensitiveParts.map((item) => (
            <div key={item} className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-3 text-sm leading-6 text-amber-50">
              {t(item)}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function calculateSolderingRange(baseRange, adjustment) {
  const low = clampSolderingTemperature(baseRange[0] + adjustment[0]);
  const high = clampSolderingTemperature(Math.max(low + 10, baseRange[1] + adjustment[1]));
  return [low, high];
}

function clampSolderingTemperature(value) {
  return Math.min(420, Math.max(180, Math.round(value / 5) * 5));
}
