import { loc, useLang, type Localized } from '../i18n/language'

/**
 * Credibility markers used across the UWT atlas (see SKILL.md, section "Уровень достоверности"):
 * THEORY / HYPOTHESIS / DEMO / MODEL / VERIFIED / EXPERIMENT / INTERPRETATION.
 * Every interactive or interpretive block should carry one so readers know how much
 * epistemic weight to put on it.
 */
export type CredibilityMarker = 'THEORY' | 'HYPOTHESIS' | 'DEMO' | 'MODEL' | 'VERIFIED' | 'EXPERIMENT' | 'INTERPRETATION'

const labels: Record<CredibilityMarker, Localized> = {
  THEORY: loc('Теория', 'Theory'),
  HYPOTHESIS: loc('Гипотеза', 'Hypothesis'),
  DEMO: loc('Демо', 'Demo'),
  MODEL: loc('Модель', 'Model'),
  VERIFIED: loc('Проверено', 'Verified'),
  EXPERIMENT: loc('Эксперимент', 'Experiment'),
  INTERPRETATION: loc('Интерпретация', 'Interpretation'),
}

export function CredibilityBadge({ marker, className }: { marker: CredibilityMarker; className?: string }) {
  const { t } = useLang()
  const classes = ['credBadge', `credBadge-${marker.toLowerCase()}`, className].filter(Boolean).join(' ')

  return (
    <span className={classes} title={marker}>
      {t(labels[marker])}
    </span>
  )
}
