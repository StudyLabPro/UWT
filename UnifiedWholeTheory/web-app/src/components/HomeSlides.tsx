import { useMemo, useState } from 'react'
import { slides } from '../data/slides'

export function HomeSlides() {
  const [index, setIndex] = useState(0)
  const slide = slides[index]
  const progress = useMemo(() => ((index + 1) / slides.length) * 100, [index])

  return (
    <section className="page homePage">
      <div className="orbitalHero">
        <div className="heroCopy">
          <p className="kicker">Unified Whole Theory · простыми словами</p>
          <h1>Пространство и время рождаются из отношений</h1>
          <p>
            Интерактивный атлас UWT: 17 слайдов, мини-вселенные, практические задачи,
            АКТ/Balansis и связь компенсационных вычислений с реляционной физикой.
          </p>
        </div>
        <div className="relationGlyph" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => <span key={i} style={{ '--i': i } as React.CSSProperties} />)}
        </div>
      </div>

      <div className="slideDeck">
        <aside className="slideRail">
          {slides.map((item, i) => (
            <button key={item.id} className={i === index ? 'railDot active' : 'railDot'} onClick={() => setIndex(i)}>
              <span>{String(item.id).padStart(2, '0')}</span>
              <small>{item.eyebrow}</small>
            </button>
          ))}
        </aside>

        <article className="slideCard">
          <div className="progressLine"><span style={{ width: `${progress}%` }} /></div>
          <p className="kicker">{slide.eyebrow} · {slide.id}/17</p>
          <h2>{slide.title}</h2>
          <p>{slide.body}</p>
          {slide.formula && <code>{slide.formula}</code>}
          <div className="slideActions">
            <button onClick={() => setIndex((index + slides.length - 1) % slides.length)}>Назад</button>
            <button onClick={() => setIndex((index + 1) % slides.length)}>Вперёд</button>
          </div>
        </article>
      </div>
    </section>
  )
}
