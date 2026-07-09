import { actConcepts } from '../data/tasks'

export function ActBalansisPage() {
  return (
    <section className="page actPage">
      <div className="sectionHeader narrow">
        <p className="kicker">Вкладка 3 · АКТ и Balansis</p>
        <h1>Абсолютно Компенсационная Теория</h1>
        <p>АКТ делает численную потерю видимой: результат и компенсация существуют рядом, а не прячутся в округлении.</p>
      </div>
      <div className="compensationStage">
        <div className="calcBox danger">
          <small>Обычная арифметика</small>
          <code>1e16 + 1 - 1e16</code>
          <strong>0</strong>
          <p>Малый остаток потерян.</p>
        </div>
        <div className="calcBox success">
          <small>Balansis / ACT</small>
          <code>sequence_sum([...])</code>
          <strong>result + compensation</strong>
          <p>Остаток становится частью вычисления.</p>
        </div>
      </div>
      <div className="conceptGrid">
        {actConcepts.map((concept) => (
          <article key={concept.title} className="conceptCard">
            <span>{concept.title.slice(0, 2)}</span>
            <h3>{concept.title}</h3>
            <p>{concept.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
