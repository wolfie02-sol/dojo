/** One section = one page: photo banner with the title, the content, then previous / next. */
import type { ComponentType } from 'react'
import { pageBanners, sectionImages } from '../config/media'
import { SECTIONS, SECTION_IDS, type Lang, type SectionId } from '../config/site'
import { UI } from '../i18n/ui'
import { linkClick, routeToPath } from '../router/router'
import { IconChevron } from './Icons'
import { Picture } from './Picture'
import { AboutSection, BlackBeltsSection, ContactSection, LinksSection, ScheduleSection, SenseiSection } from './sections/Sections'
import { CalendarSection } from './sections/CalendarSection'

const CONTENT: Record<SectionId, ComponentType<{ lang: Lang }>> = {
  about: AboutSection,
  sensei: SenseiSection,
  schedule: ScheduleSection,
  calendar: CalendarSection,
  blackBelts: BlackBeltsSection,
  links: LinksSection,
  contact: ContactSection,
}

export function SectionPage({ id, lang }: { id: SectionId; lang: Lang }) {
  const ui = UI[lang]
  const meta = SECTIONS[id]
  const Content = CONTENT[id]
  const i = SECTION_IDS.indexOf(id)
  const prev = i > 0 ? SECTION_IDS[i - 1] : null
  const next = i < SECTION_IDS.length - 1 ? SECTION_IDS[i + 1] : null

  return (
    <article className={`page page--${id}`} aria-labelledby="page-title">
      <div className="page__banner">
        <Picture image={pageBanners[id]} lang={lang} sizes="100vw" className="page__banner-img" eager decorative />
        <div className="page__banner-shade" />
        <div className="page__banner-text">
          <p className="page__crumbs">
            <a href={routeToPath({ lang, section: null })} onClick={(e) => linkClick(e, { lang, section: null })}>
              {ui.home}
            </a>
            <span aria-hidden="true"> / </span>
            <span>{meta.label[lang]}</span>
          </p>
          <p className="page__kanji" lang="ja" aria-hidden="true">
            {meta.kanji}
          </p>
          <h1 id="page-title" tabIndex={-1}>
            {meta.label[lang]}
          </h1>
          <p className="page__hint">{meta.hint[lang]}</p>
        </div>
      </div>

      <div className="page__body">
        {id === 'about' ? (
          <div className="split">
            <div className="split__text">
              <Content lang={lang} />
            </div>
            <Picture image={sectionImages.about} lang={lang} sizes="(min-width: 960px) 40vw, 100vw" className="split__img" />
          </div>
        ) : (
          <Content lang={lang} />
        )}
      </div>

      <nav className="pager" aria-label={ui.otherSections}>
        {prev ? (
          <a className="pager__link" href={routeToPath({ lang, section: prev })} onClick={(e) => linkClick(e, { lang, section: prev })}>
            <IconChevron dir="left" />
            <span>
              <small>{ui.previous}</small>
              {SECTIONS[prev].label[lang]}
            </span>
          </a>
        ) : (
          <span />
        )}
        {next ? (
          <a className="pager__link pager__link--next" href={routeToPath({ lang, section: next })} onClick={(e) => linkClick(e, { lang, section: next })}>
            <span>
              <small>{ui.next}</small>
              {SECTIONS[next].label[lang]}
            </span>
            <IconChevron />
          </a>
        ) : (
          <span />
        )}
      </nav>
    </article>
  )
}
