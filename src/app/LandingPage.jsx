import {
  ArrowDown,
  Cpu,
  Gauge,
  Layers3,
  Lightbulb,
  List,
  SlidersHorizontal,
  Split,
  Thermometer,
  Waves,
} from 'lucide-react';
import { useI18n } from '../i18n';

const copy = {
  ru: {
    eyebrow: 'Онлайн-инструменты для электроники',
    title: 'RadioCalc: инженерные калькуляторы для радиолюбителей, пайки и PCB',
    lead: 'Быстрые расчеты для макетирования, ремонта и разводки плат: закон Ома, подбор резистора, ширина дорожки, маркировка компонентов, делители и фильтры.',
    primaryCta: 'Открыть калькуляторы',
    secondaryCta: 'Посмотреть инструменты',
    stats: [
      ['9', 'практических калькуляторов'],
      ['IPC-2221', 'оценка ширины дорожек'],
      ['E12/E24', 'ряды резисторов под рукой'],
    ],
    sectionTitle: 'Что можно посчитать',
    sectionLead: 'Каждый инструмент заточен под конкретную радиолюбительскую задачу, а не под абстрактную формулу.',
    audienceTitle: 'Для каких задач',
    audience: [
      'подобрать номинал резистора и запас мощности перед пайкой',
      'проверить ток, напряжение, сопротивление и рассеиваемую мощность',
      'быстро расшифровать цветовые кольца или SMD-код на детали',
      'оценить дорожку PCB до отправки платы в производство',
    ],
    seoTitle: 'Калькуляторы без лишней теории',
    seoText: 'RadioCalc помогает быстро перейти от параметров схемы к рабочему номиналу. Это удобно для макетных плат, ремонта аппаратуры, подбора светодиодных резисторов, делителей напряжения, RC/LC-фильтров и первичной проверки трассировки печатных плат.',
  },
  en: {
    eyebrow: 'Online tools for electronics',
    title: 'RadioCalc: engineering calculators for hobby electronics, soldering, and PCB work',
    lead: 'Fast calculations for prototyping, repair, and board layout: Ohm\'s law, LED resistor, PCB trace width, component markings, dividers, and filters.',
    primaryCta: 'Open calculators',
    secondaryCta: 'Browse tools',
    stats: [
      ['9', 'practical calculators'],
      ['IPC-2221', 'trace width estimate'],
      ['E12/E24', 'resistor series at hand'],
    ],
    sectionTitle: 'What you can calculate',
    sectionLead: 'Each tool focuses on a real electronics bench task, not an abstract formula dump.',
    audienceTitle: 'Useful when you need to',
    audience: [
      'choose resistor values and power margin before soldering',
      'check current, voltage, resistance, and dissipated power',
      'decode color bands or SMD codes on components quickly',
      'estimate PCB traces before sending a board to production',
    ],
    seoTitle: 'Calculators without unnecessary theory',
    seoText: 'RadioCalc helps you move from circuit parameters to usable values quickly. It is useful for breadboards, electronics repair, LED resistor selection, voltage dividers, RC/LC filters, and first-pass PCB trace checks.',
  },
};

const tools = {
  ru: [
    { id: 'ohm', icon: Gauge, title: 'Калькулятор закона Ома', text: 'Напряжение, ток, сопротивление и мощность по двум известным величинам.', tag: 'U I R P' },
    { id: 'led', icon: Lightbulb, title: 'Подобрать резистор', text: 'Расчет ограничительного резистора для LED и других последовательных нагрузок.', tag: 'LED' },
    { id: 'pcb', icon: Layers3, title: 'Ширина дорожки PCB', text: 'Оценка ширины медной дорожки по току, толщине меди и допустимому нагреву.', tag: 'PCB' },
    { id: 'markings', icon: Cpu, title: 'Маркировка резисторов и SMD', text: 'Цветовые кольца, SMD-коды и быстрый перевод маркировки в номинал.', tag: 'SMD' },
    { id: 'resistors', icon: List, title: 'Номиналы и мощность резисторов', text: 'Ряды E12/E24 и подсказки по выбору допустимой рассеиваемой мощности.', tag: 'E24' },
    { id: 'dividers', icon: Split, title: 'Делители напряжения и тока', text: 'Расчет выходного напряжения, нагрузки, коэффициента и мощности плеч делителя.', tag: 'R1/R2' },
    { id: 'filters', icon: Waves, title: 'RC и LC фильтры', text: 'Частота среза, резонанс и базовые параметры простых аналоговых фильтров.', tag: 'RC/LC' },
    { id: 'soldering', icon: Thermometer, title: 'Температура пайки', text: 'Стартовые температуры для SnPb, бессвинцового припоя, SMD и демонтажа.', tag: '°C' },
    { id: 'pot', icon: SlidersHorizontal, title: 'Потенциометр в нагрузке', text: 'Подбор потенциометра и защитного резистора для регулируемого тока.', tag: 'POT' },
  ],
  en: [
    { id: 'ohm', icon: Gauge, title: 'Ohm\'s law calculator', text: 'Voltage, current, resistance, and power from any two known values.', tag: 'U I R P' },
    { id: 'led', icon: Lightbulb, title: 'Pick a resistor', text: 'Calculate a limiting resistor for LEDs and other series loads.', tag: 'LED' },
    { id: 'pcb', icon: Layers3, title: 'PCB trace width', text: 'Estimate copper trace width from current, copper thickness, and temperature rise.', tag: 'PCB' },
    { id: 'markings', icon: Cpu, title: 'Resistor and SMD markings', text: 'Color bands, SMD codes, and quick conversion from marking to value.', tag: 'SMD' },
    { id: 'resistors', icon: List, title: 'Resistor values and power', text: 'E12/E24 series and guidance for safe resistor power ratings.', tag: 'E24' },
    { id: 'dividers', icon: Split, title: 'Voltage and current dividers', text: 'Output voltage, load effect, divider ratio, and resistor dissipation.', tag: 'R1/R2' },
    { id: 'filters', icon: Waves, title: 'RC and LC filters', text: 'Cutoff frequency, resonance, and basic parameters for simple analog filters.', tag: 'RC/LC' },
    { id: 'soldering', icon: Thermometer, title: 'Soldering temperature', text: 'Starting temperatures for SnPb, lead-free solder, SMD, and desoldering.', tag: '°C' },
    { id: 'pot', icon: SlidersHorizontal, title: 'Potentiometer load', text: 'Choose a potentiometer and protection resistor for adjustable current.', tag: 'POT' },
  ],
};

export function LandingPage() {
  const { language } = useI18n();
  const currentCopy = copy[language] ?? copy.ru;
  const currentTools = tools[language] ?? tools.ru;

  return (
    <section className="relative isolate overflow-hidden px-3 pb-8 pt-4 text-slate-100 sm:px-4 sm:pb-10 lg:px-5 xl:px-8 2xl:px-10" aria-labelledby="landing-title">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(circle_at_20%_0%,rgba(45,212,191,0.24),transparent_30rem),radial-gradient(circle_at_85%_12%,rgba(251,191,36,0.14),transparent_24rem)]" />
      <div className="mx-auto max-w-[1560px] rounded-[2rem] border border-white/10 bg-slate-950/55 p-4 shadow-2xl shadow-black/40 backdrop-blur sm:p-6 lg:rounded-[2.75rem] lg:p-8 xl:p-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-end xl:gap-10">
          <div className="max-w-4xl">
            <p className="mb-4 inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-100 sm:text-xs">
              {currentCopy.eyebrow}
            </p>
            <h1 id="landing-title" className="font-display text-4xl font-bold leading-[0.95] tracking-[-0.09em] text-white sm:text-5xl md:text-6xl xl:text-7xl">
              {currentCopy.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg lg:text-xl lg:leading-8">
              {currentCopy.lead}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3 font-display text-sm font-bold uppercase tracking-[0.14em] text-slate-950 shadow-glow transition hover:-translate-y-0.5 hover:bg-cyan-200" href="#calculator">
                {currentCopy.primaryCta}
                <ArrowDown size={18} />
              </a>
              <a className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 font-display text-sm font-bold uppercase tracking-[0.14em] text-slate-100 transition hover:border-cyan-300/30 hover:text-cyan-100" href="#tools">
                {currentCopy.secondaryCta}
              </a>
            </div>
          </div>

          <dl className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {currentCopy.stats.map(([value, label]) => (
              <div key={value} className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-4">
                <dt className="font-display text-2xl font-bold tracking-[-0.06em] text-amber-200 sm:text-3xl">{value}</dt>
                <dd className="mt-2 text-sm leading-5 text-slate-400">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <section id="tools" className="mt-8 border-t border-white/10 pt-7 sm:mt-10 sm:pt-8" aria-labelledby="tools-title">
          <div className="mb-5 grid gap-3 lg:grid-cols-[minmax(0,0.7fr)_minmax(320px,0.3fr)] lg:items-end">
            <div>
              <h2 id="tools-title" className="font-display text-3xl font-bold tracking-[-0.07em] text-white sm:text-4xl">
                {currentCopy.sectionTitle}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
                {currentCopy.sectionLead}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-amber-200/15 bg-amber-200/[0.07] p-4 text-sm leading-6 text-amber-50/85">
              <strong className="font-display text-amber-100">{currentCopy.seoTitle}.</strong> {currentCopy.seoText}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {currentTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <a key={tool.id} className="group rounded-[1.5rem] border border-white/10 bg-slate-900/55 p-4 transition hover:-translate-y-1 hover:border-cyan-300/35 hover:bg-slate-900/80 sm:p-5" href={`#${tool.id}`}>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <span className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-2.5 text-cyan-100 transition group-hover:border-cyan-200/40 group-hover:bg-cyan-300/15">
                      <Icon size={20} />
                    </span>
                    <span className="rounded-full border border-white/10 px-2.5 py-1 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      {tool.tag}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold tracking-[-0.06em] text-white">{tool.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{tool.text}</p>
                </a>
              );
            })}
          </div>
        </section>

        <section className="mt-7 grid gap-4 rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-center" aria-labelledby="audience-title">
          <h2 id="audience-title" className="font-display text-2xl font-bold tracking-[-0.07em] text-white sm:text-3xl">
            {currentCopy.audienceTitle}
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {currentCopy.audience.map((item) => (
              <li key={item} className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm leading-6 text-slate-300">
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}
