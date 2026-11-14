/** Content of each section panel. Text comes from src/config/content.ts. */
import { about, blackBelts, contact, cta, danNames, dojo, instructors, linkGroups, schedule, type BlackBelt } from '../../config/content'
import { SECTIONS, type Lang } from '../../config/site'
import { UI } from '../../i18n/ui'
import { navigate } from '../../router/router'
import { ComingSoon, ExampleBadge, OrSoon, Photo } from '../Placeholder'
import { IconExternal, IconPin } from '../Icons'

function TrialNote({ lang }: { lang: Lang }) {
  return (
    <div className="note-cta">
      <p>{cta.primary[lang]}</p>
      <button type="button" className="btn btn--ghost btn--sm" onClick={() => navigate({ lang, section: 'contact' })}>
        {SECTIONS.contact.label[lang]}
      </button>
    </div>
  )
}

export function AboutSection({ lang }: { lang: Lang }) {
  return (
    <>
      <p className="badge badge--style">{dojo.style[lang]}</p>
      <p className="lead">{about.lead[lang]}</p>
      {about.paragraphs.map((p, i) => (
        <p key={i}>{p[lang]}</p>
      ))}
      <h3 className="subhead">{about.dojoKun.title[lang]}</h3>
      <ol className="dojo-kun">
        {about.dojoKun.items.map((item, i) => (
          <li key={i}>
            <span className="dojo-kun__romaji" lang="ja-Latn">
              {item.romaji}
            </span>
            <span className="dojo-kun__tr">{item[lang]}</span>
          </li>
        ))}
      </ol>
      <TrialNote lang={lang} />
    </>
  )
}

export function SenseiSection({ lang }: { lang: Lang }) {
  const ui = UI[lang]
  return (
    <ul className="people">
      {instructors.map((p, i) => (
        <li key={i} className="person">
          <Photo src={p.photo} alt={`${ui.photoOf} ${p.name[lang]}`} />
          <div className="person__body">
            <h3 className="person__name">
              {p.name[lang]} <ExampleBadge lang={lang} show={p.placeholder} />
            </h3>
            <p className="person__meta">
              <OrSoon value={p.role} lang={lang}>
                {p.role?.[lang]}
              </OrSoon>
              <span aria-hidden="true"> · </span>
              <OrSoon value={p.rank} lang={lang}>
                {p.rank?.[lang]}
              </OrSoon>
            </p>
            <p>
              <OrSoon value={p.bio} lang={lang}>
                {p.bio?.[lang]}
              </OrSoon>
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}

export function ScheduleSection({ lang }: { lang: Lang }) {
  const ui = UI[lang]
  const anyPlaceholder = schedule.classes.some((c) => c.placeholder)
  return (
    <>
      {schedule.note && (
        <p className="notice">
          {anyPlaceholder && <ExampleBadge lang={lang} />} {schedule.note[lang]}
        </p>
      )}
      <ul className="week">
        {ui.days.map((dayName, day) => {
          const classes = schedule.classes.filter((c) => c.day === day).sort((a, b) => a.start.localeCompare(b.start))
          return (
            <li key={day} className={`week__day${classes.length ? '' : ' is-empty'}`}>
              <h3 className="week__name">{dayName}</h3>
              {classes.length === 0 ? (
                <p className="week__none">{ui.noClass}</p>
              ) : (
                <ul className="week__classes">
                  {classes.map((c, i) => (
                    <li key={i} className="class">
                      <span className="class__time">
                        <time>{c.start}</time>–<time>{c.end}</time>
                      </span>
                      <span className="class__title">{c.title[lang]}</span>
                      <span className="class__level">{c.level ? c.level[lang] : <ComingSoon lang={lang} />}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
      <TrialNote lang={lang} />
    </>
  )
}

export function BlackBeltsSection({ lang }: { lang: Lang }) {
  const ui = UI[lang]
  const byDan = new Map<number, BlackBelt[]>()
  ;[...blackBelts].sort((a, b) => b.dan - a.dan).forEach((b) => byDan.set(b.dan, [...(byDan.get(b.dan) ?? []), b]))
  const anyPlaceholder = blackBelts.some((b) => b.placeholder)
  return (
    <>
      {anyPlaceholder && (
        <p className="notice">
          <ExampleBadge lang={lang} /> {ui.placeholderNote}
        </p>
      )}
      {[...byDan.entries()].map(([dan, people]) => {
        const name = danNames[dan] ?? { jp: `${dan}段`, fr: `${dan}e dan`, en: `${dan} dan` }
        return (
          <section key={dan} className="dan" aria-labelledby={`dan-${dan}`}>
            <h3 id={`dan-${dan}`} className="dan__title">
              <span lang="ja" className="dan__jp">
                {name.jp}
              </span>
              <span>{name[lang]}</span>
            </h3>
            <ul className="belts">
              {people.map((b, i) => (
                <li key={i} className="belt">
                  <Photo src={b.photo} alt={`${ui.photoOf} ${b.name}`} />
                  <p className="belt__name">{b.name}</p>
                  <p className="belt__dan">{name[lang]}</p>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </>
  )
}

export function LinksSection({ lang }: { lang: Lang }) {
  const ui = UI[lang]
  return (
    <>
      {linkGroups.map((g, gi) => (
        <section key={gi} className="link-group" aria-labelledby={`lg-${gi}`}>
          <h3 id={`lg-${gi}`} className="subhead">
            {g.title[lang]}
          </h3>
          <ul className="links">
            {g.links.map((l, i) => (
              <li key={i}>
                {l.url ? (
                  <a className="link-card" href={l.url} target="_blank" rel="noopener noreferrer">
                    <span className="link-card__title">{l.title[lang]}</span>
                    {l.description && <span className="link-card__desc">{l.description[lang]}</span>}
                    <IconExternal />
                    <span className="sr-only">{ui.opensNewTab}</span>
                  </a>
                ) : (
                  <div className="link-card is-soon">
                    <span className="link-card__title">{l.title[lang]}</span>
                    {l.description && <span className="link-card__desc">{l.description[lang]}</span>}
                    <span className="badge">{ui.linkComingSoon}</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  )
}

/**
 * Future contact form goes here.
 * Integration point: render a <form> that posts to a real service (Formspree, Netlify Forms,
 * a PHP mailer…) and set `contact.formEnabled = true` in content.ts. Never show a form
 * that doesn't actually deliver messages.
 */
function ContactFormSlot({ lang }: { lang: Lang }) {
  if (contact.formEnabled) return null
  return <p className="notice">{UI[lang].formSoon}</p>
}

export function ContactSection({ lang }: { lang: Lang }) {
  const ui = UI[lang]
  return (
    <>
      <dl className="facts">
        <div>
          <dt>{ui.address}</dt>
          <dd>
            <OrSoon value={contact.address} lang={lang}>
              <address>
                {contact.address?.map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </address>
            </OrSoon>
          </dd>
        </div>
        <div>
          <dt>{ui.phone}</dt>
          <dd>
            <OrSoon value={contact.phone} lang={lang}>
              <a href={`tel:${contact.phone?.replace(/[^+\d]/g, '')}`}>{contact.phone}</a>
            </OrSoon>
          </dd>
        </div>
        <div>
          <dt>{ui.email}</dt>
          <dd>
            <OrSoon value={contact.email} lang={lang}>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            </OrSoon>
          </dd>
        </div>
        <div>
          <dt>{ui.hours}</dt>
          <dd>
            <OrSoon value={contact.hours} lang={lang}>
              {contact.hours?.[lang]}
            </OrSoon>
          </dd>
        </div>
        <div>
          <dt>{ui.directions}</dt>
          <dd>
            <OrSoon value={contact.directions} lang={lang}>
              {contact.directions?.[lang]}
            </OrSoon>
          </dd>
        </div>
      </dl>
      {contact.mapUrl ? (
        <a className="btn btn--ghost" href={contact.mapUrl} target="_blank" rel="noopener noreferrer">
          <IconPin /> {ui.openMap} <span className="sr-only">{ui.opensNewTab}</span>
        </a>
      ) : (
        <div className="map-placeholder" aria-hidden="true">
          <IconPin />
          <span>{ui.comingSoon}</span>
        </div>
      )}
      <ContactFormSlot lang={lang} />
    </>
  )
}
