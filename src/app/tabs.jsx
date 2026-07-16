import {
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
import { DividersPanel } from '../features/dividers/DividersPanel.jsx';
import { FiltersPanel } from '../features/filters/FiltersPanel.jsx';
import { LedPanel } from '../features/led-resistor/LedPanel.jsx';
import { MarkingsPanel } from '../features/markings/MarkingsPanel.jsx';
import { OhmsLawPanel } from '../features/ohms-law/OhmsLawPanel.jsx';
import { PcbPanel } from '../features/pcb-trace/PcbPanel.jsx';
import { PotentiometerPanel } from '../features/potentiometer/PotentiometerPanel.jsx';
import { ResistorsPanel } from '../features/resistors/ResistorsPanel.jsx';
import { SolderingPanel } from '../features/soldering/SolderingPanel.jsx';

export const tabs = [
  { id: 'ohm', label: 'Закон Ома', icon: Gauge, component: OhmsLawPanel },
  { id: 'led', label: 'Ограничительный R', icon: Lightbulb, component: LedPanel },
  { id: 'pot', label: 'Потенциометр', icon: SlidersHorizontal, component: PotentiometerPanel },
  { id: 'soldering', label: 'Пайка', icon: Thermometer, component: SolderingPanel },
  { id: 'pcb', label: 'Ширина дорожки', icon: Layers3, component: PcbPanel },
  { id: 'markings', label: 'Маркировка', icon: Cpu, component: MarkingsPanel },
  { id: 'resistors', label: 'Резисторы', icon: List, component: ResistorsPanel },
  { id: 'dividers', label: 'Делители', icon: Split, component: DividersPanel },
  { id: 'filters', label: 'Фильтры', icon: Waves, component: FiltersPanel },
];
