import { useEffect, useRef } from 'react'
import { dojo } from './config/content'
import { LANGS, SECTIONS, SECTION_IDS } from './config/site'
import { UI } from './i18n/ui'
import { linkClick, routeToPath, useRoute } from './router/router'
import { Home } from './ui/Home'
import { SectionPage } from './ui/SectionPage'
import { SiteHeader } from './ui/SiteHeader'

export function App() {
  const route = useRoute()
  const ui = UI[route.lang]
  const first = useRef(true)

  // Title, language, and — when changing page — back to the top with focus on the new heading
  useEffect(() => {
    document.documentElement.lang = route.lang
    const name = dojo.name[route.lang]
    document.title = route.section ? `${SECTIONS[route.section].label[route.lang]} · ${name}` : name
    if (first.current) {
      first.current = false
      return
    }
    window.scrollTo({ top: 0 })
    document.querySelector<HTMLElement>('#page-title, .home__title')?.focus({ preventScroll: true })
  }, [route])

  const home = route.section === null

  return (
    <div className={home ? 'is-home' : 'is-page'}>
      <SiteHeader />
      <main id="main" tabIndex={-1} key={`${route.lang}-${route.section ?? 'home'}`} className="view">
        {home ? <Home lang={route.lang} /> : <SectionPage id={route.section!} lang={route.lang} />}
      </main>
      {!home && (
        <footer className="footer">
          <div className="footer__inner">
            <div>
              <p className="footer__kanji" lang="ja" aria-hidden="true">
                {dojo.calligraphy}
              </p>
              <p className="footer__name">{dojo.name[route.lang]}</p>
              <p className="footer__tag">{dojo.tagline[route.lang]}</p>
            </div>
            <nav aria-label={ui.sections}>
              <ul className="footer__nav">
                {SECTION_IDS.map((id) => (
                  <li key={id}>
                    <a href={routeToPath({ lang: route.lang, section: id })} onClick={(e) => linkClick(e, { lang: route.lang, section: id })}>
                      {SECTIONS[id].label[route.lang]}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="footer__meta">
              <a href={routeToPath({ lang: route.lang, section: null })} onClick={(e) => linkClick(e, { lang: route.lang, section: null })}>
                {ui.home}
              </a>
              {LANGS.filter((l) => l !== route.lang).map((l) => (
                <a key={l} href={routeToPath({ lang: l, section: route.section })} hrefLang={l} lang={l} onClick={(e) => linkClick(e, { lang: l, section: route.section })}>
                  {ui.switchTo}
                </a>
              ))}
              <p className="footer__note">{ui.footerNote}</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}
