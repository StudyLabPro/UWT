import type { MouseEvent } from 'react'
import { navigateToTab, type Tab } from '../data/navigation'
import { loc, useLang, type Localized } from '../i18n/language'
import { CredibilityBadge } from './CredibilityBadge'

type BridgeRow = {
  uwt: Localized
  act: Localized
  magicbrain: Localized
}

const bridgeRows: BridgeRow[] = [
  {
    uwt: loc('Часть Aᵢ, отношение R(Aᵢ,Aⱼ)', 'Part Aᵢ, relation R(Aᵢ,Aⱼ)'),
    act: loc('AbsoluteValue, compensated_add / compensated_multiply', 'AbsoluteValue, compensated_add / compensated_multiply'),
    magicbrain: loc('Нейрон, синапс', 'Neuron, synapse'),
  },
  {
    uwt: loc('Состояние S — набор всех R(Aᵢ,Aⱼ)', 'State S — the set of all R(Aᵢ,Aⱼ)'),
    act: loc('sequence_sum по отношениям (компенсированная сумма)', 'sequence_sum over relations (compensated sum)'),
    magicbrain: loc('Sparse top-k активация SNN-ядра TextBrain', 'Sparse top-k activation of the TextBrain SNN core'),
  },
  {
    uwt: loc('Устойчивость Stab(Aᵢ), масса m(Aᵢ)=M(Stab(Aᵢ))', 'Stability Stab(Aᵢ), mass m(Aᵢ)=M(Stab(Aᵢ))'),
    act: loc('Компенсация типа STABILITY, analyze_stability', 'STABILITY-type compensation, analyze_stability'),
    magicbrain: loc('Память как устойчивые кластеры отношений', 'Memory as stable relation clusters'),
  },
  {
    uwt: loc('Изменение ΔR, внутреннее время τ(Sᵢ,Sⱼ)', 'Change ΔR, internal time τ(Sᵢ,Sⱼ)'),
    act: loc('Компенсация в цепочке сложений, compensate_sequence', 'Compensation across a chain of additions, compensate_sequence'),
    magicbrain: loc('Hebbian-обучение, синаптические задержки', 'Hebbian learning, synaptic delays'),
  },
  {
    uwt: loc('Резкие события: скачок энергии E или скорости τ', 'Sharp events: a jump in energy E or in speed τ'),
    act: loc('Компенсация SINGULARITY / OVERFLOW на границах', 'SINGULARITY / OVERFLOW compensation at the edges'),
    magicbrain: loc('Дофамин-модулируемый сигнал пластичности', 'Dopamine-modulated plasticity signal'),
  },
  {
    uwt: loc('Локальный центр описания Aᵢ', 'Local descriptive center Aᵢ'),
    act: loc('Компенсация BALANCE между операндами', 'BALANCE compensation between operands'),
    magicbrain: loc('Цифровой двойник: mastery и cognitive state ученика', 'Digital twin: a student’s mastery and cognitive state'),
  },
]

type LayerId = 'L0' | 'L1' | 'L2'

const layers: { id: LayerId; accent: string; title: Localized; caption: Localized }[] = [
  {
    id: 'L0',
    accent: 'var(--blue)',
    title: loc('UWT · реляционная онтология', 'UWT · relational ontology'),
    caption: loc('части, отношения, состояния, время', 'parts, relations, states, time'),
  },
  {
    id: 'L1',
    accent: 'var(--amber)',
    title: loc('ACT / Balansis · компенсированная арифметика', 'ACT / Balansis · compensated arithmetic'),
    caption: loc('устойчивость вычислений, явные компенсации', 'computational stability, explicit compensations'),
  },
  {
    id: 'L2',
    accent: 'var(--green)',
    title: loc('MagicBrain · когнитивные структуры', 'MagicBrain · cognitive structures'),
    caption: loc('нейроны, синапсы, устойчивая память', 'neurons, synapses, stable memory'),
  },
]

function LayerDiagram() {
  const { t } = useLang()
  const layerHeight = 92
  const gap = 46
  const width = 720

  return (
    <svg
      className="bridgeLayerSvg"
      viewBox={`0 0 ${width} ${layers.length * layerHeight + (layers.length - 1) * gap + 8}`}
      role="img"
      aria-label={t(loc('Схема слоёв UWT, ACT/Balansis и MagicBrain', 'Diagram of the UWT, ACT/Balansis, and MagicBrain layers'))}
    >
      {layers.map((layer, index) => {
        const y = index * (layerHeight + gap) + 4
        return (
          <g key={layer.id}>
            <rect
              x={4}
              y={y}
              width={width - 8}
              height={layerHeight}
              rx={22}
              fill="rgba(255,255,255,.035)"
              stroke={layer.accent}
              strokeOpacity={0.55}
              strokeWidth={1.4}
            />
            <text x={30} y={y + 34} className="bridgeLayerCode" fill={layer.accent}>
              {layer.id}
            </text>
            <text x={92} y={y + 32} className="bridgeLayerTitle">
              {t(layer.title)}
            </text>
            <text x={92} y={y + 60} className="bridgeLayerCaption">
              {t(layer.caption)}
            </text>
            {index < layers.length - 1 && (
              <line
                x1={width / 2}
                y1={y + layerHeight}
                x2={width / 2}
                y2={y + layerHeight + gap}
                stroke="rgba(244,241,232,.4)"
                strokeWidth={1.5}
                markerEnd="url(#bridgeArrow)"
              />
            )}
          </g>
        )
      })}
      <defs>
        <marker id="bridgeArrow" markerWidth="10" markerHeight="10" refX="5" refY="8" orient="auto">
          <path d="M0,0 L10,8 L0,16 Z" fill="rgba(244,241,232,.55)" />
        </marker>
      </defs>
    </svg>
  )
}

export function ActUwtBridgePage() {
  const { t } = useLang()
  const steps = [
    loc('UWT: части Aᵢ', 'UWT: parts Aᵢ'),
    loc('отношения R', 'relations R'),
    loc('состояния S', 'states S'),
    loc('изменение ΔR', 'change ΔR'),
    loc('ACT: компенсация', 'ACT: compensation'),
    loc('Balansis: аудит', 'Balansis: audit'),
    loc('прогноз E, m, v', 'forecast E, m, v'),
  ]

  const relatedLinks: { tab: Tab; label: Localized; caption: Localized }[] = [
    { tab: 'act', label: loc('АКТ / Balansis', 'ACT / Balansis'), caption: loc('живая демонстрация компенсации', 'the live compensation demo') },
    { tab: 'magicbrain', label: loc('MagicBrain', 'MagicBrain'), caption: loc('когнитивная платформа MetaBrain', 'the MetaBrain cognitive platform') },
    { tab: 'monograph', label: loc('Монография', 'Monograph'), caption: loc('полный формальный текст UWT', 'the full formal UWT text') },
  ]

  const handleNav = (event: MouseEvent<HTMLAnchorElement>, tab: Tab) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return
    }
    event.preventDefault()
    navigateToTab(tab)
  }

  return (
    <section className="page bridgePage">
      <div className="sectionHeader">
        <p className="kicker">{t(loc('Вкладка 4 · связь АКТ + UWT', 'Tab 4 · the ACT + UWT bridge'))}</p>
        <h1>{t(loc('UWT даёт смысл отношений, ACT даёт честность вычислений', 'UWT gives relations their meaning, ACT gives computation its honesty'))}</h1>
        <p>
          {t(
            loc(
              'Реляционная теория создаёт модель мира как сеть изменений. Компенсационная теория помогает считать эту модель без скрытой потери численного смысла. Ниже — не новый механизм, а карта уже введённых на сайте понятий: как один и тот же язык отношений звучит в UWT, в арифметике ACT/Balansis и в когнитивной платформе MagicBrain.',
              'Relational theory builds a model of the world as a network of changes. Compensation theory lets us compute that model without silently losing numerical meaning. What follows is not a new mechanism — it is a map of concepts already introduced elsewhere on this site: how the same language of relations sounds in UWT, in ACT/Balansis arithmetic, and in the MagicBrain cognitive platform.',
            ),
          )}
        </p>
        <CredibilityBadge marker="INTERPRETATION" />
      </div>

      <div className="bridgeDiagram">
        {steps.map((step, i) => (
          <div key={i} className="bridgeNode" style={{ '--delay': `${i * 70}ms` } as React.CSSProperties}>
            <small>{String(i + 1).padStart(2, '0')}</small>
            <strong>{t(step)}</strong>
          </div>
        ))}
      </div>

      <section className="bridgeCorrespondence glass">
        <div className="sectionHeader compact">
          <p className="kicker">{t(loc('Таблица соответствий', 'Correspondence table'))}</p>
          <h2>{t(loc('Один язык, три этажа реализации', 'One language, three floors of implementation'))}</h2>
          <p>
            {t(
              loc(
                'Каждая строка связывает уже описанное на сайте понятие UWT с соответствующей компенсированной операцией ACT/Balansis и с устойчивой структурой MagicBrain, упомянутой в разделе диагностики платформы.',
                'Each row links a UWT concept already described on this site to the matching ACT/Balansis compensated operation, and to the stable MagicBrain structure mentioned in the platform’s diagnostics section.',
              ),
            )}
          </p>
        </div>
        <div className="bridgeTableWrap">
          <table className="bridgeTable">
            <thead>
              <tr>
                <th>{t(loc('UWT · отношения', 'UWT · relations'))}</th>
                <th>{t(loc('ACT / Balansis · компенсация', 'ACT / Balansis · compensation'))}</th>
                <th>{t(loc('MagicBrain · устойчивая структура', 'MagicBrain · stable structure'))}</th>
              </tr>
            </thead>
            <tbody>
              {bridgeRows.map((row, index) => (
                <tr key={index}>
                  <td>{t(row.uwt)}</td>
                  <td>{t(row.act)}</td>
                  <td>{t(row.magicbrain)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bridgeLayers glass">
        <div className="sectionHeader compact">
          <p className="kicker">{t(loc('Слои', 'Layers'))}</p>
          <h2>{t(loc('L0 → L1 → L2: от отношений до устойчивой памяти', 'L0 → L1 → L2: from relations to stable memory'))}</h2>
          <p>
            {t(
              loc(
                'Каждый следующий слой не заменяет предыдущий, а опирается на него: MagicBrain нуждается в устойчивой арифметике ACT, а ACT нуждается в UWT, чтобы знать, устойчивость чего именно она защищает.',
                'Each next layer does not replace the one below it — it stands on it: MagicBrain needs the stable arithmetic of ACT, and ACT needs UWT to know exactly whose stability it is protecting.',
              ),
            )}
          </p>
        </div>
        <LayerDiagram />
      </section>

      <div className="bridgeGrid">
        <article className="glass">
          <h3>{t(loc('Что даёт UWT', 'What UWT provides'))}</h3>
          <p>{t(loc('Язык: части, различимость, отношения, состояния, пространство, время, физические величины.', 'A language: parts, discernibility, relations, states, space, time, physical quantities.'))}</p>
        </article>
        <article className="glass">
          <h3>{t(loc('Что даёт АКТ', 'What ACT provides'))}</h3>
          <p>{t(loc('Вычислительную дисциплину: компенсация, явные остатки, проверяемая численная семантика.', 'A computational discipline: compensation, explicit residuals, auditable numerical semantics.'))}</p>
        </article>
        <article className="glass">
          <h3>{t(loc('Что получается вместе', 'What comes out of combining them'))}</h3>
          <p>{t(loc('Модель, где отношения не только философски осмыслены, но и численно проверяемы.', 'A model where relations are not only philosophically meaningful, but numerically auditable.'))}</p>
        </article>
      </div>

      <div className="finalEquation">U → A → Disc → R → S → ACT/Balansis → {t(loc('прогноз', 'forecast'))}</div>

      <nav className="bridgeRelated" aria-label={t(loc('Связанные разделы', 'Related sections'))}>
        {relatedLinks.map((link) => (
          <a key={link.tab} href={`/${link.tab === 'act' ? 'act' : link.tab}`} className="bridgeRelatedLink glass" onClick={(event) => handleNav(event, link.tab)}>
            <strong>{t(link.label)}</strong>
            <span>{t(link.caption)}</span>
            <b aria-hidden="true">→</b>
          </a>
        ))}
      </nav>
    </section>
  )
}
