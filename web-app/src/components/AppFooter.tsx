const githubLinks = [
  {
    label: 'Репозиторий',
    description: 'Исходный код UWT, лицензии и история изменений.',
    href: 'https://github.com/AndrewHakmi/UWT',
  },
  {
    label: 'Web app',
    description: 'React/Vite фронтенд этого цифрового атласа.',
    href: 'https://github.com/AndrewHakmi/UWT/tree/main/web-app',
  },
  {
    label: 'Modeling',
    description: 'Вычислительные модели, тесты и эксперименты.',
    href: 'https://github.com/AndrewHakmi/UWT/tree/main/modeling',
  },
  {
    label: 'Theory',
    description: 'Монография, LaTeX-источники и PDF-сборки.',
    href: 'https://github.com/AndrewHakmi/UWT/tree/main/theory',
  },
]

export function AppFooter() {
  const year = new Date().getFullYear()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="appFooter" aria-labelledby="footer-title">
      <div className="footerInner">
        <section className="footerIntro">
          <p className="kicker">Open research · GitHub</p>
          <h2 id="footer-title">UWT открыт для чтения, проверки и форков</h2>
          <p>
            Вся публичная часть проекта собрана в GitHub: фронтенд, модельные эксперименты, теория и лицензирование.
            Ссылки открываются в новой вкладке, чтобы не сбивать текущую навигацию по атласу.
          </p>
        </section>

        <nav className="footerLinks" aria-label="Ссылки UWT на GitHub">
          {githubLinks.map((link) => (
            <a key={link.href} className="footerLink" href={link.href} target="_blank" rel="noreferrer">
              <span>
                <strong>{link.label}</strong>
                <small>{link.description}</small>
              </span>
              <b aria-hidden="true">↗</b>
            </a>
          ))}
        </nav>

        <div className="footerMeta">
          <span>© {year} Unified Whole Theory</span>
          <a href="https://github.com/AndrewHakmi/UWT/blob/main/LICENSE" target="_blank" rel="noreferrer">
            AGPL-3.0
          </a>
          <button type="button" onClick={scrollToTop}>
            Наверх ↑
          </button>
        </div>
      </div>
    </footer>
  )
}
