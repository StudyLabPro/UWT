import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { slides } from '../data/slides'
import { useLang } from '../i18n/language'

const total = slides.length

export function HomeSlides() {
  const { t } = useLang()
  const [index, setIndex] = useState(0)
  const [trackHeight, setTrackHeight] = useState<number>()
  const cardRefs = useRef<Array<HTMLElement | null>>([])
  const touchX = useRef<number | null>(null)

  const goTo = (next: number) => setIndex(((next % total) + total) % total)
  const prev = () => goTo(index - 1)
  const next = () => goTo(index + 1)

  useLayoutEffect(() => {
    const node = cardRefs.current[index]
    if (node) setTrackHeight(node.offsetHeight)
  }, [index])

  useEffect(() => {
    const onResize = () => {
      const node = cardRefs.current[index]
      if (node) setTrackHeight(node.offsetHeight)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [index])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') setIndex((i) => (i + 1) % total)
      if (event.key === 'ArrowLeft') setIndex((i) => (i - 1 + total) % total)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const handleTouchStart = (event: React.TouchEvent) => {
    touchX.current = event.touches[0].clientX
  }
  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchX.current === null) return
    const delta = event.changedTouches[0].clientX - touchX.current
    if (Math.abs(delta) > 44) {
      if (delta < 0) next()
      else prev()
    }
    touchX.current = null
  }

  const progress = ((index + 1) / total) * 100

  return (
    <section className="page homePage">
      <div className="homeHero">
        <div className="heroCopy">
          <p className="kicker">Unified Whole Theory · ТЕЦ — Теория Единого Целого</p>
          <h1>Пространство и время рождаются из отношений</h1>
          <p className="heroLead">
            UWT — реляционная физическая программа: Единое Целое → части → различимость → отношения → пространство,
            время, движение. Ни одна из этих сущностей не постулируется заранее — каждая выводится из истории
            изменений отношений между частями.
          </p>
          <p className="heroLead">
            Этот атлас проводит через теорию за {total} шагов: от одной неразличимой точки — до проверяемой
            вычислительной модели с волновой функцией, массой-как-устойчивостью и прогнозом будущего состояния.
          </p>
          <div className="homeStats">
            <div><strong>{total}</strong><span>шагов теории</span></div>
            <div><strong>9</strong><span>выведенных величин</span></div>
            <div><strong>1</strong><span>финальная формула</span></div>
          </div>
        </div>
        <div className="relationGlyph" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => <span key={i} style={{ '--i': i } as React.CSSProperties} />)}
        </div>
      </div>

      <div className="slideCarousel">
        <div className="carouselHead">
          <div>
            <p className="kicker">Путешествие по теории</p>
            <h2>{total} слайдов, один вывод</h2>
          </div>
          <p className="carouselHint">← → пролистать · клик по точке · свайп</p>
        </div>

        <div className="carouselStage">
          <button className="carouselArrow prev" onClick={prev} aria-label="Предыдущий слайд">‹</button>

          <div
            className="carouselViewport"
            style={{ height: trackHeight ? `${trackHeight}px` : undefined }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="carouselTrack" style={{ transform: `translateX(-${index * 100}%)` }}>
              {slides.map((item, i) => (
                <article
                  key={item.id}
                  className="slideCard"
                  ref={(node) => { cardRefs.current[i] = node }}
                  aria-hidden={i !== index}
                >
                  <div className="slideCardHead">
                    <span className="slideIndex">{String(item.id).padStart(2, '0')}</span>
                    <p className="kicker">{t(item.eyebrow)}</p>
                  </div>
                  <h2>{t(item.title)}</h2>
                  {t(item.body).map((paragraph, pi) => <p key={pi}>{paragraph}</p>)}
                  <blockquote className="slideInsight">{t(item.insight)}</blockquote>
                  {item.formula && <code>{item.formula}</code>}
                </article>
              ))}
            </div>
          </div>

          <button className="carouselArrow next" onClick={next} aria-label="Следующий слайд">›</button>
        </div>

        <div className="carouselFoot">
          <div className="progressLine"><span style={{ width: `${progress}%` }} /></div>
          <div className="carouselDots">
            {slides.map((item, i) => (
              <button
                key={item.id}
                className={i === index ? 'dot active' : 'dot'}
                onClick={() => goTo(i)}
                aria-label={`Слайд ${i + 1} из ${total}: ${t(item.eyebrow)}`}
                title={t(item.title)}
              />
            ))}
          </div>
          <span className="carouselCount">{String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
        </div>
      </div>
    </section>
  )
}
