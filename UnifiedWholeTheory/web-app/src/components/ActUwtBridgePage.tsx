export function ActUwtBridgePage() {
  const steps = ['UWT: части Aᵢ', 'отношения R', 'состояния S', 'изменение ΔR', 'ACT: компенсация', 'Balansis: аудит', 'прогноз E, m, v']
  return (
    <section className="page bridgePage">
      <div className="sectionHeader">
        <p className="kicker">Вкладка 4 · связь АКТ + UWT</p>
        <h1>UWT даёт смысл отношений, ACT даёт честность вычислений</h1>
        <p>Реляционная теория создаёт модель мира как сеть изменений. Компенсационная теория помогает считать эту модель без скрытой потери численного смысла.</p>
      </div>
      <div className="bridgeDiagram">
        {steps.map((step, i) => (
          <div key={step} className="bridgeNode" style={{ '--delay': `${i * 70}ms` } as React.CSSProperties}>
            <small>{String(i + 1).padStart(2, '0')}</small>
            <strong>{step}</strong>
          </div>
        ))}
      </div>
      <div className="bridgeGrid">
        <article className="glass"><h3>Что даёт UWT</h3><p>Язык: части, различимость, отношения, состояния, пространство, время, физические величины.</p></article>
        <article className="glass"><h3>Что даёт АКТ</h3><p>Вычислительную дисциплину: компенсация, явные остатки, проверяемая численная семантика.</p></article>
        <article className="glass"><h3>Что получается вместе</h3><p>Модель, где отношения не только философски осмыслены, но и численно проверяемы.</p></article>
      </div>
      <div className="finalEquation">U → A → Disc → R → S → ACT/Balansis → прогноз</div>
    </section>
  )
}
