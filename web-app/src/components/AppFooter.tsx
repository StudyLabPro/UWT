import { useState } from 'react'
import { useLang } from '../i18n/language'
import { footerGithubLinks, ui } from '../i18n/strings'

const CONTACT_EMAIL = 'uwt@xteam.pro'

/** Библиографическая запись, сформированная из CITATION.cff в корне репозитория. */
const CITATION_TEXT =
  'Tikhonov, Andrey (Тихонов Андрей). UWT [Computer software]. 2026. ' +
  'AGPL-3.0-only. https://github.com/AndrewHakmi/UWT'

export function AppFooter() {
  const { t } = useLang()
  const [copied, setCopied] = useState(false)
  const year = new Date().getFullYear()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const copyCitation = async () => {
    try {
      await navigator.clipboard.writeText(CITATION_TEXT)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard может быть недоступен (нет HTTPS/разрешений) — просто не показываем «скопировано».
    }
  }

  return (
    <footer className="appFooter" aria-labelledby="footer-title">
      <div className="footerInner">
        <section className="footerIntro">
          <p className="kicker">{t(ui.footer.kicker)}</p>
          <h2 id="footer-title">{t(ui.footer.title)}</h2>
          <p>{t(ui.footer.intro)}</p>
        </section>

        <nav className="footerLinks" aria-label={t(ui.footer.linksAriaLabel)}>
          {footerGithubLinks.map((link) => (
            <a key={link.href} className="footerLink" href={link.href} target="_blank" rel="noreferrer">
              <span>
                <strong>{t(link.label)}</strong>
                <small>{t(link.description)}</small>
              </span>
              <b aria-hidden="true">↗</b>
            </a>
          ))}
        </nav>

        <section className="footerIntro">
          <p className="kicker">{t(ui.footer.contactsKicker)}</p>
          <h2>{t(ui.footer.contactsTitle)}</h2>
          <p>
            {t(ui.footer.contactEmailLabel)}:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
          <h3>{t(ui.footer.citationTitle)}</h3>
          <p>{t(ui.footer.citationIntro)}</p>
          <pre className="codeBlock">
            <code>{CITATION_TEXT}</code>
          </pre>
          <button type="button" onClick={copyCitation}>
            {copied ? t(ui.footer.citationCopied) : t(ui.footer.citationCopy)}
          </button>
        </section>

        <div className="footerMeta">
          <span>© {year} Unified Whole Theory</span>
          <a
            href="https://github.com/AndrewHakmi/UWT/blob/main/LICENSE"
            target="_blank"
            rel="noreferrer"
            title={t(ui.footer.licenseDescription)}
          >
            {t(ui.footer.licenseLabel)}
          </a>
          <a
            href="https://github.com/AndrewHakmi/UWT/blob/main/LICENSING.md"
            target="_blank"
            rel="noreferrer"
            title={t(ui.footer.licensingDescription)}
          >
            {t(ui.footer.licensingLabel)}
          </a>
          <button type="button" onClick={scrollToTop}>
            {t(ui.footer.backToTop)}
          </button>
        </div>
      </div>
    </footer>
  )
}
