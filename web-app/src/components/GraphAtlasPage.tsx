import { loc, useLang } from '../i18n/language'

const pageTitle = loc('Полный граф экосистемы UWT', 'Full UWT ecosystem graph')
const pageDescription = loc(
  'Интерактивная карта зависимостей сервисов, репозиториев и слоёв инфраструктуры в одном окне.',
  'Interactive map of service dependencies, repositories, and infrastructure layers in one view.',
)

export function GraphAtlasPage() {
  const { t } = useLang()

  return (
    <section className="page graphAtlasPage">
      <p className="graphAtlasKicker">{t(pageTitle)}</p>
      <h1 className="graphAtlasTitle">{t(pageTitle)}</h1>
      <p className="graphAtlasLead">{t(pageDescription)}</p>
      <iframe
        className="graphAtlasFrame"
        src="/ecosystem.html"
        title={t(pageTitle)}
        loading="lazy"
      />
    </section>
  )
}
