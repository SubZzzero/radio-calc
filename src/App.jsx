import { useMemo, useState } from 'react';
import {
  Activity,
  Cpu,
  Gauge,
  Layers3,
  Lightbulb,
  List,
  SlidersHorizontal,
  Thermometer,
  Waves,
  Split,
} from 'lucide-react';
import { e12Base, e24Base, resistorColors, resistorPowerSteps } from './data/standards';
import { calculateOhmsLaw } from './utils/ohmsLaw';
import { calculateLedResistor, calculateLedWithSelectedResistor } from './utils/led';
import { calculateTraceWidth } from './utils/pcbTrace';
import { decodeColorBands, decodeSmdCode } from './utils/markings';
import { currentDivider, lcCutoff, rcCutoff, voltageDivider } from './utils/filters';
import { formatNumber, toNumber } from './utils/format';
import { recommendedResistorPower } from './utils/standards';
import { calculateLedPotentiometer } from './utils/potentiometer';

const tabs = [
  { id: 'ohm', label: 'Закон Ома', icon: Gauge },
  { id: 'led', label: 'Ограничительный R', icon: Lightbulb },
  { id: 'pot', label: 'Потенциометр', icon: SlidersHorizontal },
  { id: 'soldering', label: 'Пайка', icon: Thermometer },
  { id: 'pcb', label: 'Ширина дорожки', icon: Layers3 },
  { id: 'markings', label: 'Маркировка', icon: Cpu },
  { id: 'resistors', label: 'Резисторы', icon: List },
  { id: 'dividers', label: 'Делители', icon: Split },
  { id: 'filters', label: 'Фильтры', icon: Waves },
];

const resistorDecades = [
  ['1', '1-9.1 Ω'],
  ['10', '10-91 Ω'],
  ['100', '100-910 Ω'],
  ['1000', '1-9.1 kΩ'],
  ['10000', '10-91 kΩ'],
  ['100000', '100-910 kΩ'],
  ['1000000', '1-9.1 MΩ'],
];

const solderAlloys = [
  {
    id: 'lead',
    label: 'Sn60Pb40 / Sn63Pb37',
    short: 'Свинцовый',
    melting: '183-190 °C',
    range: [300, 340],
    note: 'Плавится мягче и быстрее. Для старой техники и SnPb-припоя обычно не нужна экстремальная температура.',
  },
  {
    id: 'leadFree',
    label: 'Pb-Free / SAC / SnAgCu',
    short: 'Бессвинцовый',
    melting: '217-221 °C',
    range: [340, 380],
    note: 'Требует больше тепла и хорошего флюса. Часто встречается на RoHS/PbF/LF платах.',
  },
  {
    id: 'lowTemp',
    label: 'Bi/Sn низкотемпературный',
    short: 'Низкотемпературный',
    melting: '138-170 °C',
    range: [230, 280],
    note: 'Используют для деликатного демонтажа и снижения тепловой нагрузки. Не смешивайте без понимания задачи.',
  },
  {
    id: 'unknown',
    label: 'Неизвестный припой',
    short: 'Неизвестно',
    melting: 'проверьте по месту',
    range: [330, 360],
    note: 'Начинайте с умеренной температуры, добавьте флюс и смотрите, как быстро припой смачивает жало и площадку.',
  },
];

const solderTasks = [
  {
    id: 'throughHole',
    label: 'Выводные детали',
    badge: 'Обычная пайка',
    adjust: [0, 0],
    tip: 'Для резисторов, конденсаторов и обычных ножек держите контакт коротким: примерно 1-3 секунды на точку.',
  },
  {
    id: 'smd',
    label: 'SMD и мелкие площадки',
    badge: 'Аккуратно',
    adjust: [-20, -10],
    tip: 'Лучше небольшое жало подходящей формы, флюс и короткое касание. Маленькие площадки легко перегреть или сорвать.',
  },
  {
    id: 'plastic',
    label: 'Разъемы / пластик рядом',
    badge: 'Риск плавления',
    adjust: [-30, -15],
    tip: 'Температуру держите умеренной, но не слишком низкой: долгий прогрев тоже плавит пластик. Работайте быстро.',
  },
  {
    id: 'ground',
    label: 'Земляной полигон / массивная площадка',
    badge: 'Много меди',
    adjust: [30, 50],
    tip: 'Если тепло уходит в плату, помогает широкое жало, флюс и преднагрев. Не компенсируйте все одной максимальной температурой.',
  },
  {
    id: 'desolder',
    label: 'Демонтаж',
    badge: 'Быстро прогреть',
    adjust: [20, 40],
    tip: 'Добавьте свежий припой и флюс: смесь обычно плавится легче, а время нагрева площадки становится меньше.',
  },
  {
    id: 'wires',
    label: 'Лужение проводов',
    badge: 'Масса металла',
    adjust: [10, 30],
    tip: 'Провод отводит тепло. Берите достаточно крупное жало, чтобы прогреть жилу быстро и не плавить изоляцию.',
  },
];

const heatSensitiveParts = [
  'пластиковые разъемы и держатели',
  'светодиоды и оптопары',
  'электролитические конденсаторы',
  'микросхемы в мелких корпусах',
  'старые пятаки и тонкие дорожки',
];

const solderPrepTips = [
  {
    title: 'Разогреть',
    text: 'Дайте станции выйти на температуру. Холодное жало плохо передает тепло и пачкает пайку.',
  },
  {
    title: 'Очистить жало',
    text: 'Снимите черный налет влажной губкой или латунной стружкой. Блестящее жало работает заметно лучше.',
  },
  {
    title: 'Залудить',
    text: 'Нанесите тонкий слой припоя на кончик жала. Это улучшает теплопередачу к выводу и площадке.',
  },
  {
    title: 'Держать чистым',
    text: 'Во время работы периодически чистите и снова лудите жало. Сухим серым жалом паять тяжело.',
  },
];

const solderSafetyTips = [
  {
    title: 'Дым не вдыхать',
    text: 'Паяйте при проветривании или с вытяжкой. Дым флюса раздражает дыхание, даже если припой бессвинцовый.',
  },
  {
    title: 'Флюс для электроники',
    text: 'Берите канифольный, RMA или no-clean. Кислотный сантехнический флюс оставляет проводящие и коррозионные следы.',
  },
  {
    title: 'Свинец отдельно',
    text: 'После SnPb-припоя мойте руки, не ешьте за столом и не используйте одну губку для бытовых вещей.',
  },
];

const solderTechniqueSteps = [
  {
    title: 'Коснитесь вывода и площадки',
    text: 'Жало должно греть оба металла сразу, а не только каплю припоя на кончике.',
  },
  {
    title: 'Подайте припой в место пайки',
    text: 'Припой должен расплавиться от детали и площадки. Так он смачивает соединение, а не просто висит шариком.',
  },
  {
    title: 'Уберите припой, затем жало',
    text: 'Дайте капле сформироваться и не двигайте деталь секунду, пока соединение застывает.',
  },
];

const goodSolderJointSigns = [
  'ровная капля с плавным переходом к площадке',
  'припой смочил и вывод, и медную площадку',
  'нет шарика, иголок, трещин и перемычек',
  'площадка не потемнела и не отходит от платы',
];

const beginnerMaterialTips = [
  'Для мелкой электроники удобен припой 0.5-0.8 мм.',
  'Флюс лучше наносить мало, но вовремя: перед прогревом сложной или окисленной точки.',
  'Если жало серое и припой с него скатывается, сначала очистите и залудите его, а не поднимайте температуру.',
];

const desolderingTips = [
  {
    title: 'Старый припой не плавится',
    do: 'Лучше добавить флюс. Если его нет, добавьте свежий припой с канифолью внутри, очистите и залудите жало, затем поднимайте температуру по 10 °C.',
    avoid: 'Не давите жалом в площадку: так легко оторвать пятак.',
  },
  {
    title: 'Один вывод детали',
    do: 'Прогрейте вывод и площадку вместе, потом уберите припой отсосом или оплеткой. После этого шевелите вывод только когда он свободен.',
    avoid: 'Не тяните деталь, пока припой еще держит отверстие.',
  },
  {
    title: 'Разъем или много ножек',
    do: 'Добавьте свежий припой на все ноги, прогревайте по очереди и убирайте припой частями. Если нет флюса, хотя бы чаще чистите и лудите жало.',
    avoid: 'Не пытайтесь вырвать разъем за один прогрев.',
  },
  {
    title: 'Земляная площадка забирает тепло',
    do: 'Поставьте жало шире, добавьте свежий припой и поднимите температуру на 20-40 °C. Если есть флюс или преднагрев платы, используйте их.',
    avoid: 'Не держите тонкое жало долго на одном месте.',
  },
];

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

const fieldClass =
  'w-full rounded-xl border border-cyan-300/10 bg-slate-950/70 px-3 py-3 font-display text-base text-cyan-50 outline-none transition focus:border-cyan-300/50 focus:shadow-glow sm:px-4 sm:text-lg';

function App() {
  const [activeTab, setActiveTab] = useState('ohm');
  const ActiveIcon = tabs.find((tab) => tab.id === activeTab)?.icon ?? Activity;

  return (
    <main className="min-h-screen px-3 py-3 text-slate-100 sm:px-4 sm:py-5 lg:px-5 lg:py-6 xl:px-8 2xl:px-10 2xl:py-8">
      <div className="mx-auto grid max-w-[1560px] grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)] 2xl:grid-cols-[300px_minmax(0,1fr)] 2xl:gap-8">
        <div className="min-w-0 lg:h-[calc(100vh-3rem)] 2xl:h-[calc(100vh-4rem)]">
          <aside className="min-w-0 rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-3 shadow-2xl backdrop-blur sm:p-4 lg:fixed lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-[250px] lg:overflow-y-auto lg:rounded-[2rem] xl:w-[280px] xl:p-5 2xl:top-8 2xl:h-[calc(100vh-4rem)] 2xl:w-[300px] 2xl:p-6">
            <div className="mb-4 flex items-center gap-3 lg:mb-6 lg:block 2xl:mb-9">
              <div className="inline-flex shrink-0 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-2.5 text-cyan-200 lg:mb-4 lg:p-3">
                <SlidersHorizontal size={24} />
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-2xl font-bold tracking-[-0.08em] text-white sm:text-3xl 2xl:text-4xl">RadioCalc</h1>
                <p className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm lg:mt-3">
                  Инженерные калькуляторы для макетирования, пайки и разводки плат.
                </p>
              </div>
            </div>

            <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:block lg:space-y-2 lg:overflow-visible lg:px-0 lg:pb-0 2xl:space-y-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    className={`flex shrink-0 items-center gap-2 rounded-2xl border px-3 py-2.5 text-left transition lg:w-full lg:gap-3 lg:py-3 2xl:px-4 2xl:py-4 ${
                      active
                        ? 'border-cyan-300/40 bg-cyan-300/15 text-cyan-100 shadow-glow'
                        : 'border-white/5 bg-white/[0.03] text-slate-400 hover:border-white/15 hover:text-white'
                    }`}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <Icon className="shrink-0" size={18} />
                    <span className="whitespace-nowrap font-display text-xs font-semibold uppercase tracking-[0.1em] sm:text-sm lg:tracking-[0.12em]">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
        </div>

        <section className="min-w-0 rounded-[1.5rem] border border-white/10 bg-slate-900/55 p-4 shadow-2xl backdrop-blur sm:p-5 lg:min-h-[calc(100vh-3rem)] lg:rounded-[2rem] xl:p-6 2xl:min-h-[calc(100vh-4rem)] 2xl:p-8">
          <header className="mb-5 border-b border-white/10 pb-4 2xl:mb-8 2xl:pb-6">
            <div>
              <div className="mb-3 flex items-center gap-2 text-cyan-200 sm:gap-3">
                <ActiveIcon className="shrink-0" size={22} />
                <span className="font-display text-[11px] font-bold uppercase tracking-[0.22em] sm:text-xs sm:tracking-[0.35em]">Практический расчет</span>
              </div>
              <h2 className="font-display text-3xl font-bold tracking-[-0.07em] text-white sm:text-4xl 2xl:text-5xl">
                {tabs.find((tab) => tab.id === activeTab)?.label}
              </h2>
            </div>
          </header>

          {activeTab === 'ohm' && <OhmsLawPanel />}
          {activeTab === 'led' && <LedPanel />}
          {activeTab === 'pot' && <PotentiometerPanel />}
          {activeTab === 'soldering' && <SolderingPanel />}
          {activeTab === 'pcb' && <PcbPanel />}
          {activeTab === 'markings' && <MarkingsPanel />}
          {activeTab === 'resistors' && <ResistorsPanel />}
          {activeTab === 'dividers' && <DividersPanel />}
          {activeTab === 'filters' && <FiltersPanel />}
        </section>
      </div>
    </main>
  );
}

function OhmsLawPanel() {
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
  const status = getOhmStatus(knownFields.length);

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
                    <div className="mt-1 text-sm text-slate-400">{meta.label}</div>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
                    active ? 'border-cyan-300/30 bg-cyan-300/10 text-cyan-100' : 'border-white/10 bg-white/[0.035] text-slate-500'
                  }`}>
                    {active ? 'исходное' : 'пусто'}
                  </span>
                </div>
                {field === 'current' ? (
                  <InputWithUnitSelect
                    label={`${meta.label} ${meta.symbol}`}
                    value={values.current}
                    unit={currentUnit}
                    units={['A', 'mA']}
                    onUnitChange={setCurrentUnit}
                    onChange={(value) => setValues({ ...values, current: value })}
                  />
                ) : field === 'power' ? (
                  <InputWithUnitSelect
                    label={`${meta.label} ${meta.symbol}`}
                    value={values.power}
                    unit={powerUnit}
                    units={['W', 'mW']}
                    onUnitChange={setPowerUnit}
                    onChange={(value) => setValues({ ...values, power: value })}
                  />
                ) : (
                  <Input label={`${meta.label} ${meta.symbol}`} unit={meta.unit} value={values[field]} onChange={(value) => setValues({ ...values, [field]: value })} />
                )}
                <p className="mt-2 text-xs leading-5 text-slate-500">{meta.hint}</p>
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
            Очистить
          </button>
        </div>
      </Card>
      <Card title="Результат">
        <div className="mb-5 rounded-[1.5rem] border border-cyan-300/25 bg-cyan-300/[0.08] px-4 py-5 sm:px-5 sm:py-6">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200 sm:tracking-[0.24em]">{result ? 'Расчет готов' : 'Ожидаю данные'}</div>
          <div className="mt-3 text-sm leading-6 text-slate-300">
            {result ? `Используются: ${knownFields.map((field) => `${ohmFieldMeta[field].label} ${ohmFieldMeta[field].symbol}`).join(' + ')}.` : status.text}
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
  const meta = ohmFieldMeta[field];
  const known = knownFields.includes(field);
  const value = result?.[field] ?? (known ? inputs[field] : null);
  return (
    <div className={`mb-3 min-w-0 rounded-2xl border px-4 py-4 sm:px-5 sm:py-5 ${known ? 'border-white/10 bg-white/[0.025]' : 'border-cyan-300/15 bg-white/[0.04]'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="break-words text-[11px] font-semibold uppercase leading-4 tracking-normal text-slate-500">{meta.label} {meta.symbol}</div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${known ? 'border-white/10 text-slate-500' : 'border-cyan-300/25 text-cyan-100'}`}>
          {known ? 'задано' : 'расчет'}
        </span>
      </div>
      <div className={`mt-3 break-words font-display text-lg font-bold leading-7 sm:mt-4 sm:text-xl 2xl:text-[22px] ${known ? 'text-slate-300' : 'text-white'}`}>
        {formatOhmValue(field, value, currentUnit, powerUnit)}
      </div>
      <div className="mt-2 text-xs leading-5 text-slate-500">{known ? 'Исходное значение пользователя' : getOhmFormula(field, knownFields)}</div>
    </div>
  );
}

function parsePositive(value) {
  const number = toNumber(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function getOhmStatus(knownCount) {
  if (knownCount === 2) {
    return {
      title: 'Данных достаточно',
      text: 'Расчет выполнен по двум исходным величинам.',
      tone: 'border-cyan-300/25 bg-cyan-300/[0.07] text-cyan-100',
    };
  }

  if (knownCount < 2) {
    return {
      title: 'Нужно больше данных',
      text: `Заполните еще ${2 - knownCount} ${knownCount === 1 ? 'величину' : 'величины'}.`,
      tone: 'border-amber-300/25 bg-amber-300/[0.07] text-amber-100',
    };
  }

  return {
    title: 'Слишком много исходных',
    text: 'Оставьте ровно две величины, чтобы расчет был однозначным.',
    tone: 'border-amber-300/25 bg-amber-300/[0.07] text-amber-100',
  };
}

function formatOhmValue(field, value, currentUnit, powerUnit) {
  if (field === 'current') return formatNumber(currentUnit === 'mA' ? value * 1_000 : value, currentUnit);
  if (field === 'power') return formatNumber(powerUnit === 'mW' ? value * 1_000 : value, powerUnit);
  return formatNumber(value, ohmResultMeta[field].unit);
}

function getOhmFormula(field, knownFields) {
  if (knownFields.length !== 2) return 'Заполните две исходные величины';
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

  return 'Расчетная величина';
}

function LedPanel() {
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
            Подобрать резистор
          </button>
          <button
            className={`rounded-xl px-4 py-3 text-left font-display text-sm font-semibold uppercase tracking-[0.12em] transition ${
              mode === 'check' ? 'bg-cyan-300/15 text-cyan-100 shadow-glow' : 'text-slate-500 hover:text-white'
            }`}
            type="button"
            onClick={() => setMode('check')}
          >
            Проверить резистор
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
          <h3 className="mb-5 font-display text-sm font-bold uppercase tracking-[0.16em] text-amber-100 sm:tracking-[0.2em]">Итог</h3>
          <Result label="Принятое напряжение нагрузки" value={formatNumber(checkResult?.ledVoltage, 'V')} />
          <Result label="На резисторе останется" value={formatNumber(checkResult?.voltageOnResistor, 'V')} />
          <Result label="Мощность резистора" value={formatNumber(checkResult?.powerRecommendation?.recommended, 'W')} accent />
          <Result label="Ток нагрузки" value={formatNumber(checkResult?.current * 1_000, 'mA', 1)} />
          <Result label="Резистор рассеивает" value={formatNumber(checkResult?.power, 'W', 3)} />
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-amber-300/60 bg-slate-950/55 p-5 sm:p-6">
          <h3 className="mb-5 font-display text-sm font-bold uppercase tracking-[0.16em] text-amber-100 sm:tracking-[0.2em]">Итог</h3>
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

function PotentiometerPanel() {
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
        <h3 className="mb-5 font-display text-sm font-bold uppercase tracking-[0.16em] text-amber-100 sm:tracking-[0.2em]">Итог</h3>
        <Result label="Ставить потенциометр" value={formatNumber(result?.recommendedPotentiometer, 'Ω')} accent />
        <Result label="Ток нагрузки на минимуме" value={formatNumber(result?.minCurrent * 1_000, 'mA', 1)} />
        <Result label="Ток нагрузки на максимуме" value={formatNumber(result?.maxCurrent * 1_000, 'mA', 1)} />
        <Result label="Мощность защитного R" value={formatNumber(fixedPowerRecommendation?.recommended, 'W')} accent />
        <Result label="Потенциометр рассеивает до" value={formatNumber(result?.potMaxPower, 'W', 3)} />
        <Result label="Максимум при Rpot" value={formatNumber(result?.potMaxPowerResistance, 'Ω')} />
        {result?.minCurrentExceedsMax && (
          <p className="mt-5 rounded-xl border border-red-300/25 bg-red-300/[0.06] p-4 text-sm leading-6 text-red-50">
            Заданный минимальный ток выше максимального тока с этим защитным резистором. Даже при минимальном сопротивлении потенциометра ток будет меньше заданного.
          </p>
        )}
        {result?.exceedsCatalog && (
          <p className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm leading-6 text-amber-50">
            Для заданного минимального тока нужен потенциометр больше доступного ряда. Показан максимальный номинал из списка.
          </p>
        )}
      </div>
    </Grid>
  );
}

function SolderingPanel() {
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
                <span className="font-display text-lg font-bold tracking-[-0.04em] text-white">{item.title}</span>
              </div>
              <p className="text-sm leading-6 text-slate-300">{item.text}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Безопасный старт" wide>
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
          {solderSafetyTips.map((item) => (
            <div key={item.title} className="relative overflow-hidden rounded-2xl border border-amber-300/20 bg-gradient-to-br from-amber-300/[0.12] via-white/[0.035] to-cyan-300/[0.06] p-4 2xl:min-h-[150px]">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-200/10 blur-2xl" />
              <div className="relative text-[11px] font-bold uppercase tracking-[0.18em] text-amber-100">Важно</div>
              <div className="relative mt-3 font-display text-lg font-bold tracking-[-0.04em] text-white">{item.title}</div>
              <p className="relative mt-3 text-sm leading-6 text-slate-300">{item.text}</p>
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
                <span className="block font-display text-xl font-bold tracking-[-0.05em] text-white">{item.title}</span>
                <span className="mt-3 inline-flex rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-100">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-4 min-h-[78px] rounded-2xl border border-white/10 bg-slate-950/55 px-5 py-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Что это значит</div>
          <p className="mt-2 text-sm leading-6 text-slate-300">{boardChoice.text}</p>
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
                <span className="block font-display text-xl font-bold tracking-[-0.05em] text-white">{item.title}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-4 min-h-[70px] rounded-2xl border border-white/10 bg-slate-950/55 px-5 py-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Текущая задача</div>
          <p className="mt-2 text-sm leading-6 text-slate-300">{workChoice.text}</p>
        </div>
      </Card>

      <Card title="Температура паяльника" wide>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="rounded-[1.5rem] border border-cyan-300/25 bg-cyan-300/[0.08] px-4 py-5 sm:px-5 sm:py-6">
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-200 sm:tracking-[0.24em]">Начните с</div>
            <div className="mt-3 font-display text-3xl font-bold tracking-[-0.08em] text-white sm:text-4xl 2xl:text-5xl">
              {startTemperature} °C
            </div>
            <div className="mt-4 text-sm leading-6 text-slate-300">Рабочий коридор: {temperatureRange[0]}-{temperatureRange[1]} °C.</div>
          </div>
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-5 2xl:min-h-[188px]">
            <p className="text-sm leading-6 text-slate-300 2xl:max-h-[112px] 2xl:overflow-y-auto">{temperatureAdvice}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-100">
                {workChoice.title}
              </span>
              <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-100">
                {boardChoice.label}
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Как сделать одну хорошую пайку" wide>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[1.5rem] border border-cyan-300/20 bg-cyan-300/[0.055] p-4 sm:p-5">
            <div className="mb-4 font-display text-xl font-bold tracking-[-0.05em] text-white">Три движения</div>
            <div className="grid grid-cols-1 gap-3">
              {solderTechniqueSteps.map((item, index) => (
                <div key={item.title} className="grid grid-cols-[36px_minmax(0,1fr)] gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 font-display text-sm font-bold text-cyan-100">
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-display text-base font-bold tracking-[-0.03em] text-white">{item.title}</div>
                    <p className="mt-1 text-sm leading-6 text-slate-300">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-[1.5rem] border border-emerald-300/20 bg-emerald-300/[0.055] p-4 sm:p-5">
              <div className="font-display text-xl font-bold tracking-[-0.05em] text-white">Признаки нормы</div>
              <div className="mt-4 grid grid-cols-1 gap-2">
                {goodSolderJointSigns.map((item) => (
                  <div key={item} className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm leading-6 text-emerald-50">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-4 sm:p-5">
              <div className="font-display text-xl font-bold tracking-[-0.05em] text-white">Материалы без сюрпризов</div>
              <div className="mt-4 space-y-3">
                {beginnerMaterialTips.map((item) => (
                  <p key={item} className="text-sm leading-6 text-slate-300">{item}</p>
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
              <div className="font-display text-lg font-bold tracking-[-0.04em] text-white">{item.title}</div>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.do}</p>
              <p className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] px-3 py-3 text-sm leading-5 text-amber-50">{item.avoid}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Что легко перегреть" wide>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {heatSensitiveParts.map((item) => (
            <div key={item} className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] px-4 py-3 text-sm leading-6 text-amber-50">
              {item}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function PcbPanel() {
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
          <Select label="Слой" value={form.layer} onChange={(value) => setForm({ ...form, layer: value })} options={[['external', 'Внешний'], ['internal', 'Внутренний']]} />
        </div>
      </Card>
      <Card title="Оценочная ширина">
        <Result label="Расчетная ширина" value={formatNumber(result?.widthMm, 'мм')} />
        <Result label="Округлить вверх до" value={formatNumber(result?.roundedSafeMm, 'мм')} accent />
        <Result label="Площадь сечения, кв. mil" value={formatNumber(result?.areaMils, 'mil²')} />
        <Result label="Модель" value={result?.model ?? '—'} />
        <p className="mt-5 rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-100">
          Используется IPC-2221: I = k × ΔT^0.44 × A^0.725. Для внутренних слоев коэффициент ниже, поэтому ширина получается больше.
        </p>
      </Card>
    </Grid>
  );
}

function MarkingsPanel() {
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
              label={`${index + 1} кольцо`}
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

function ResistorsPanel() {
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
  return (
    <div className={`mb-3 rounded-2xl border px-4 py-4 ${accent ? 'border-cyan-300/30 bg-cyan-300/10' : 'border-white/10 bg-white/[0.035]'}`}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className={`font-display text-xl font-bold ${accent ? 'text-cyan-100' : 'text-white'}`}>{power}</span>
        <span className="text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</span>
      </div>
      <p className="text-sm leading-6 text-slate-400">{text}</p>
    </div>
  );
}

function DividersPanel() {
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

function FiltersPanel() {
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

function Grid({ children }) {
  return <div className="grid grid-cols-1 gap-4 sm:gap-5 xl:grid-cols-[1.35fr_0.9fr] 2xl:gap-6">{children}</div>;
}

function Card({ title, children, wide = false }) {
  return (
    <article className={`min-w-0 rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-4 sm:p-5 2xl:p-6 ${wide ? '' : 'self-start'}`}>
      <h3 className="mb-5 break-words font-display text-xs font-bold uppercase tracking-[0.16em] text-slate-300 sm:text-sm sm:tracking-[0.2em]">{title}</h3>
      {children}
    </article>
  );
}

function Input({ label, unit, value, onChange }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-medium text-slate-400">{label}</span>
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

function InputWithUnitSelect({ label, value, onChange, unit, units, onUnitChange }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-medium text-slate-400">{label}</span>
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

function Select({ label, value, onChange, options, suffix }) {
  const normalized = useMemo(() => options.map((option) => (Array.isArray(option) ? option : [option, `${option}${suffix ? ` ${suffix}` : ''}`])), [options, suffix]);
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-medium text-slate-400">{label}</span>
      <select className={fieldClass} value={value} onChange={(event) => onChange(event.target.value)}>
        {normalized.map(([optionValue, labelText]) => (
          <option key={optionValue || 'empty'} value={optionValue}>{labelText}</option>
        ))}
      </select>
    </label>
  );
}

function Result({ label, value, accent = false }) {
  return (
    <div className="mb-3 min-w-0 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4 sm:px-5 sm:py-5">
      <div className="break-words text-[11px] font-semibold uppercase leading-4 tracking-normal text-slate-500">{label}</div>
      <div className={`mt-3 break-words font-display text-lg font-bold leading-7 sm:mt-4 sm:text-xl 2xl:text-[22px] ${accent ? 'text-cyan-200' : 'text-white'}`}>{value}</div>
    </div>
  );
}

function Hint({ children }) {
  return (
    <div className="mb-5 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-sm text-slate-400">
      {children}
    </div>
  );
}

function CircuitBox({ lines }) {
  return (
    <pre className="mb-4 overflow-x-auto rounded-xl border border-cyan-300/15 bg-slate-950/60 px-3 py-3 font-display text-xs leading-6 text-cyan-100 sm:px-4 sm:text-sm">
      {lines.join('\n')}
    </pre>
  );
}

function SafetyBox({ title, children }) {
  return (
    <div className="mt-5 rounded-[1.35rem] border border-amber-300/60 p-4">
      <div className="mb-3 flex items-center">
        <span className="font-display text-xs font-bold uppercase tracking-[0.16em] text-amber-100 sm:tracking-[0.22em]">{title}</span>
      </div>
      {children}
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

export default App;
