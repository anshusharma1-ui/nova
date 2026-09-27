import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Activity,
  AudioLines,
  Gauge,
  Layers3,
  Menu,
  Sparkles,
  Waypoints,
  X,
} from 'lucide-react'
import heroSmall from './assets/nova-hero-640.webp'
import heroLarge from './assets/nova-hero-1280.webp'
import horizonSmall from './assets/nova-horizon-480.webp'
import horizonLarge from './assets/nova-horizon-960.webp'
import { deriveIntelligenceViews, intelligenceDemoScenarios, type DerivedView, type IntelligenceViewId } from './intelligenceDemo'
import CsvAnalyzer from './CsvUploadAnalyzer'
import './App.css'

const navigation = [
  { label: 'Approach', href: '#approach' },
  { label: 'Platform', href: '#platform' },
  { label: 'Signals', href: '#showcase' },
  { label: 'Analyze', href: '#csv-analyzer' },
  { label: 'Perspective', href: '#perspective' },
]

function Brand() {
  return (
    <a className="brand" href="#home" aria-label="NOVA home">
      <span className="brand-mark" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span>NOVA</span>
    </a>
  )
}

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuToggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isMenuOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape' || !window.matchMedia('(max-width: 700px)').matches) return

      setIsMenuOpen(false)
      menuToggleRef.current?.focus()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen])

  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <button
          ref={menuToggleRef}
          className="menu-toggle"
          type="button"
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <nav
          className={`primary-nav${isMenuOpen ? ' is-open' : ''}`}
          id="primary-navigation"
          aria-label="Main navigation"
        >
          {navigation.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}>
              {item.label}
            </a>
          ))}
          <a className="nav-contact" href="#contact" onClick={() => setIsMenuOpen(false)}>
            Let’s talk <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </nav>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="hero" id="home" aria-labelledby="hero-title">
      <div className="hero-grid page-shell">
        <div className="hero-copy">
          <p className="eyebrow hero-eyebrow"><span /> Intelligence for what’s next</p>
          <h1 id="hero-title">Make the next move <em>obvious.</em></h1>
          <p className="hero-description">
            NOVA turns market and customer signals into clear direction, so your
            team can make confident decisions while there is still time to act.
          </p>
          <div className="hero-actions">
            <a className="button button-lime" href="#showcase">
              Explore the platform <ArrowDown size={16} aria-hidden="true" />
            </a>
            <a className="text-link light-link" href="#approach">
              How we think <ArrowDown size={15} aria-hidden="true" />
            </a>
          </div>
          <p className="hero-footnote"><span className="live-dot" /> Built for a world that won’t sit still</p>
        </div>
        <div className="hero-visual">
          <img
            className="hero-image"
            src={heroLarge}
            srcSet={`${heroSmall} 640w, ${heroLarge} 1280w`}
            sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1024px) 42vw, 45vw"
            width="1280"
            height="854"
            alt="Sculptural glass towers rising into a bright open sky"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            onError={(event) => { event.currentTarget.hidden = true }}
          />
          <div className="image-index" aria-hidden="true"><span>01</span><span>06</span></div>
          <div className="image-caption">
            <span className="caption-rule" />
            <span>See beyond the surface</span>
          </div>
          <div className="signal-note" aria-hidden="true">
            <AudioLines size={17} />
            <span>Signal detected</span>
            <span className="signal-pulse" />
          </div>
          <div className="hero-insight" aria-label="Example signal: customer preference is shifting toward flexible options">
            <div className="hero-insight-heading"><span>EXAMPLE SIGNAL</span><Activity size={14} aria-hidden="true" /></div>
            <strong>Customer preference is shifting</strong>
            <div className="hero-insight-detail"><span>Flexible options</span><b>+18%</b></div>
            <div className="hero-sparkline" aria-hidden="true">
              {[25, 38, 32, 48, 43, 64, 58, 78, 72, 94].map((height, index) => (
                <i key={index} style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        </div>
        <div className="hero-index" aria-hidden="true">01 / A clearer kind of intelligence</div>
      </div>
      <div className="hero-bottom page-shell" aria-hidden="true">
        <span>Independent by design</span>
        <span>New York · Everywhere</span>
      </div>
    </section>
  )
}

function Approach() {
  return (
    <section className="approach section-shell" id="approach" aria-labelledby="approach-title">
      <div className="section-kicker"><span>01</span><span>Our point of view</span></div>
      <div className="approach-content">
        <h2 id="approach-title">The future isn’t a place you arrive at. <em>It’s a pattern you learn to see.</em></h2>
        <div className="approach-aside">
          <p>
            We bring human judgment and machine intelligence into the same room.
            Not to predict every turn, but to help you take the right one.
          </p>
          <a className="text-link" href="#platform">
            Meet your new perspective <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  )
}

const capabilities = [
  {
    number: '01',
    title: 'Find the signal',
    description: 'See the small shifts that change the shape of what comes next.',
    icon: Waypoints,
    label: 'Sensemaking',
  },
  {
    number: '02',
    title: 'Connect the dots',
    description: 'Turn scattered information into a shared, sharper point of view.',
    icon: Layers3,
    label: 'Intelligence',
  },
  {
    number: '03',
    title: 'Move with intent',
    description: 'Make clear decisions at the pace your world is actually moving.',
    icon: Gauge,
    label: 'Momentum',
  },
]

function Platform() {
  return (
    <section className="platform" id="platform" aria-labelledby="platform-title">
      <div className="section-shell platform-inner">
        <div className="section-kicker"><span>02</span><span>One system. More possibility.</span></div>
        <div className="platform-heading">
          <h2 id="platform-title">Clarity, with <em>consequence.</em></h2>
          <p>Less noise between knowing and doing.</p>
        </div>
        <section className="illustrative-scenario" aria-labelledby="scenario-title">
          <div className="scenario-heading">
            <h3 id="scenario-title">ILLUSTRATIVE SCENARIO</h3>
            <p>Hypothetical provider · No customer or live data</p>
          </div>
          <ol className="scenario-flow">
            <li>
              <span className="scenario-number" aria-hidden="true">01</span>
              <h4>Signal</h4>
              <p>More questions are appearing about shorter contracts.</p>
              <ArrowRight className="scenario-connector" size={17} aria-hidden="true" />
            </li>
            <li>
              <span className="scenario-number" aria-hidden="true">02</span>
              <h4>Context</h4>
              <p>Queries cluster around plan comparisons ahead of a move.</p>
              <ArrowRight className="scenario-connector" size={17} aria-hidden="true" />
            </li>
            <li>
              <span className="scenario-number" aria-hidden="true">03</span>
              <h4>Insight</h4>
              <p>Flexibility may be the friction point, not headline price.</p>
              <ArrowRight className="scenario-connector" size={17} aria-hidden="true" />
            </li>
            <li>
              <span className="scenario-number" aria-hidden="true">04</span>
              <h4>Suggested action</h4>
              <p>Test a month-to-month message with a limited audience; use the response to decide whether to refine or expand.</p>
            </li>
          </ol>
        </section>
        <div className="capability-list">
          {capabilities.map(({ number, title, description, icon: Icon, label }) => (
            <article className="capability-row" key={number}>
              <span className="capability-number">{number}</span>
              <div className="capability-title">
                <Icon size={21} strokeWidth={1.5} aria-hidden="true" />
                <h3>{title}</h3>
              </div>
              <p>{description}</p>
              <span className="capability-label">{label}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function TrendChart({ view }: { view: DerivedView }) {
  const chartValues = [...view.series, ...view.comparison]
  const chartMinimum = Math.min(...chartValues)
  const chartSpan = Math.max(...chartValues) - chartMinimum || 1
  const toPoints = (values: readonly number[]) =>
    values.map((value, index) => `${(index / (values.length - 1)) * 1000},${220 - ((value - chartMinimum) / chartSpan) * 180}`).join(' ')
  const endpointY = 220 - ((view.series[view.series.length - 1] - chartMinimum) / chartSpan) * 180

  return (
    <div className="trend-chart">
      <div className="chart-legend" aria-hidden="true">
        <span><i className="legend-current" /> Current</span>
        <span><i className="legend-baseline" /> Baseline</span>
      </div>
      <svg
        className="trend-svg"
        viewBox="0 0 1000 250"
        role="img"
        aria-label={`Illustrative ${view.label.toLowerCase()} trend from ${view.series[0]} to ${view.series[view.series.length - 1]} across four periods`}
        preserveAspectRatio="none"
      >
        {[35, 85, 135, 185, 235].map((y) => <line key={y} x1="0" y1={y} x2="1000" y2={y} className="chart-gridline" />)}
        <polyline points={toPoints(view.comparison)} className="chart-comparison" />
        <polyline points={toPoints(view.series)} className="chart-current" />
        <circle cx="1000" cy={endpointY} r="7" className="chart-endpoint" />
      </svg>
      <div className="chart-axis" aria-hidden="true"><span>WEEK 01</span><span>WEEK 02</span><span>WEEK 03</span><span>WEEK 04</span></div>
    </div>
  )
}

function Showcase() {
  const [activeView, setActiveView] = useState<IntelligenceViewId>('signals')
  const [selectedScenarioId, setSelectedScenarioId] = useState(intelligenceDemoScenarios[0].id)
  const scenario = intelligenceDemoScenarios.find((item) => item.id === selectedScenarioId) ?? intelligenceDemoScenarios[0]
  const views = deriveIntelligenceViews(scenario)
  const activeViewIndex = views.findIndex((item) => item.id === activeView)
  const view = views[activeViewIndex]

  function handleTabKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    let nextIndex = activeViewIndex
    if (event.key === 'ArrowRight') nextIndex = (activeViewIndex + 1) % views.length
    else if (event.key === 'ArrowLeft') nextIndex = (activeViewIndex - 1 + views.length) % views.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = views.length - 1
    else return

    event.preventDefault()
    setActiveView(views[nextIndex].id)
    document.getElementById(`showcase-tab-${views[nextIndex].id}`)?.focus()
  }

  return (
    <section className="showcase section-shell" id="showcase" aria-labelledby="showcase-title">
      <div className="section-kicker"><span>03</span><span>Inside the intelligence</span></div>
      <div className="showcase-heading">
        <h2 id="showcase-title">See what’s <em>taking shape.</em></h2>
        <p>An illustrative preview of market and customer signals.</p>
      </div>
      <div className="command-center">
        <header className="command-topbar">
          <div className="command-brand"><span className="command-mark" aria-hidden="true"><i /><i /><i /></span><span>NOVA <b>/</b> INTELLIGENCE</span></div>
          <div className="command-workspace"><span>WORKSPACE</span><strong>Northstar Group</strong></div>
          <span className="sample-label">SAMPLE DATA</span>
        </header>
        <div className="command-body">
          <div className="command-title-row">
            <div>
              <p className="command-breadcrumb">OVERVIEW <span>/</span> STRATEGIC INTELLIGENCE</p>
              <h3>Market &amp; customer signals<span>.</span></h3>
            </div>
            <div className="scenario-picker">
              <label htmlFor="showcase-scenario">ILLUSTRATIVE SCENARIO</label>
              <select
                id="showcase-scenario"
                value={scenario.id}
                onChange={(event) => setSelectedScenarioId(event.currentTarget.value)}
              >
                {intelligenceDemoScenarios.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
          </div>
          <div className="showcase-tabs" role="tablist" aria-label="Intelligence views">
            {views.map((item, index) => (
              <button
                key={item.id}
                id={`showcase-tab-${item.id}`}
                className={`showcase-tab${activeViewIndex === index ? ' is-active' : ''}`}
                type="button"
                role="tab"
                aria-selected={activeViewIndex === index}
                aria-controls="showcase-panel"
                tabIndex={activeViewIndex === index ? 0 : -1}
                onClick={() => setActiveView(item.id)}
                onKeyDown={handleTabKeyDown}
              >
                {item.label}
              </button>
            ))}
            <span className="tabs-period"><span>PERIOD</span>{view.period}</span>
          </div>
          <div className="command-panel" key={view.id} id="showcase-panel" role="tabpanel" aria-labelledby={`showcase-tab-${view.id}`}>
            <div className="metric-strip">
              {view.metrics.map((metric) => (
                <article className="metric-cell" key={metric.label}>
                  <p>{metric.label}</p>
                  <div className="metric-value-row"><strong>{metric.value}</strong><span className="metric-change">{metric.change}</span></div>
                </article>
              ))}
            </div>
            <div className="command-grid">
              <section className="trend-module" aria-labelledby="trend-title">
                <div className="module-heading">
                  <div><h4 id="trend-title">{view.title}</h4><p>{view.subtitle}</p></div>
                  <span className="range-label">{view.range}</span>
                </div>
                <TrendChart view={view} />
              </section>
              <aside className="insight-module" aria-labelledby="insight-title">
                <div className="insight-label"><Sparkles size={14} aria-hidden="true" /><span>Worth a closer look</span></div>
                <h4 id="insight-title">A pattern is forming.</h4>
                <p>{view.insight}</p>
                <div className="suggested-action">
                  <span>Suggested action · illustrative</span>
                  <p>{view.action}</p>
                </div>
                <div className="insight-source"><Activity size={13} aria-hidden="true" />{view.source}</div>
                <a className="insight-link" href="#contact">Explore the signal <ArrowUpRight size={14} aria-hidden="true" /></a>
              </aside>
            </div>
            <section className="signal-stream" aria-labelledby="stream-title">
              <div className="stream-heading"><div><h4 id="stream-title">Illustrative examples</h4><span>Sample shifts calculated from this scenario</span></div><span className="stream-count">{String(view.updates.length).padStart(2, '0')} EXAMPLES</span></div>
              <ul>
                {view.updates.map((update) => (
                  <li key={update.text}>
                    <span className="stream-indicator" aria-hidden="true">{update.direction === 'up' ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}</span>
                    <span className="stream-text">{update.text}</span>
                    <span className="stream-tag">{update.tag}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
          <p className="sample-disclaimer">All figures, patterns, and suggested actions are illustrative sample calculations, not live data or real-world results.</p>
          <p className="showcase-live-summary" aria-live="polite" aria-atomic="true">
            Showing illustrative {scenario.name} scenario, {view.label} view. {view.insight} Suggested action: {view.action}
          </p>
        </div>
      </div>
    </section>
  )
}

function Perspective() {
  return (
    <section className="perspective" id="perspective" aria-labelledby="perspective-title">
      <div className="perspective-image">
        <picture>
          <source
            type="image/webp"
            srcSet={`${horizonSmall} 480w, ${horizonLarge} 960w`}
            sizes="(max-width: 700px) 100vw, 50vw"
          />
          <img
            src={horizonLarge}
            width="960"
            height="640"
            alt="A quiet, geometric horizon at dusk"
            loading="lazy"
            decoding="async"
            onError={(event) => { event.currentTarget.hidden = true }}
          />
        </picture>
      </div>
      <div className="perspective-copy">
        <div className="section-kicker"><span>04</span><span>A different vantage</span></div>
        <h2 id="perspective-title">A little more <em>wide awake.</em></h2>
        <p>
          The advantage isn’t having more information. It’s seeing what matters
          while there’s still time to do something about it.
        </p>
        <a className="text-link light-link" href="#contact">
          Find your vantage <ArrowRight size={16} aria-hidden="true" />
        </a>
        <span className="perspective-coordinate" aria-hidden="true">40° 42′ 46″ N&nbsp; / &nbsp;74° 00′ 21″ W</span>
      </div>
    </section>
  )
}

type ContactField = 'name' | 'email' | 'message'

type ContactValues = Record<ContactField, string>

type ContactErrors = Partial<Record<ContactField, string>>

function Contact() {
  const [values, setValues] = useState<ContactValues>({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<ContactErrors>({})
  const [submissionStatus, setSubmissionStatus] = useState<'success' | 'error' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isSubmittingRef = useRef(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)

  function updateField(field: ContactField, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      const nextErrors = { ...current }
      delete nextErrors[field]
      return nextErrors
    })
    setSubmissionStatus(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmittingRef.current) return

    const nextErrors: ContactErrors = {}
    if (!values.name.trim()) nextErrors.name = 'Enter your name.'
    if (!values.email.trim()) {
      nextErrors.email = 'Enter your email address.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      nextErrors.email = 'Enter an email address in the format name@example.com.'
    }
    if (!values.message.trim()) nextErrors.message = 'Add a message so we know what is on your mind.'

    setErrors(nextErrors)
  setSubmissionStatus(null)

    const firstInvalidField = (Object.keys(nextErrors) as ContactField[])[0]
    if (firstInvalidField) {
      const fieldRefs = { name: nameRef, email: emailRef, message: messageRef }
      fieldRefs[firstInvalidField].current?.focus()
      return
    }

    isSubmittingRef.current = true
    setIsSubmitting(true)

    try {
      const response = await fetch('https://formspree.io/f/mrpbyvrn', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          message: values.message.trim(),
        }),
      })

      if (!response.ok) throw new Error('Contact submission failed')

      setValues({ name: '', email: '', message: '' })
      setErrors({})
      setSubmissionStatus('success')
    } catch {
      setSubmissionStatus('error')
    } finally {
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }

  return (
    <section className="contact section-shell" id="contact" aria-labelledby="contact-title">
      <div className="contact-topline"><span>Good things start with a better question.</span><span>05 / Begin</span></div>
      <div className="contact-content">
        <h2 id="contact-title">What could you see <em>from here?</em></h2>
      </div>
      <p className="contact-note" id="contact-form-note">
        Tell us what you are exploring. We’ll get back to you by email.
      </p>
      <form className="contact-form" onSubmit={handleSubmit} noValidate aria-describedby="contact-form-note" aria-busy={isSubmitting}>
        {Object.keys(errors).length > 0 && (
          <div className="contact-error-summary" role="alert" aria-live="assertive">
            <h3>There are a few things to check:</h3>
            <ul>
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        {submissionStatus === 'error' && (
          <div className="contact-error-summary" role="alert" aria-live="assertive">
            <h3>Your message couldn’t be sent.</h3>
            <ul><li>Your details are still here. Please try again.</li></ul>
          </div>
        )}
        <div className="contact-field">
          <label htmlFor="contact-name">Name <span aria-hidden="true">*</span></label>
          <input
            ref={nameRef}
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={100}
            required
            value={values.name}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'contact-name-error' : undefined}
            onChange={(event) => updateField('name', event.currentTarget.value)}
          />
          {errors.name && <p className="contact-field-error" id="contact-name-error">{errors.name}</p>}
        </div>
        <div className="contact-field">
          <label htmlFor="contact-email">Email <span aria-hidden="true">*</span></label>
          <input
            ref={emailRef}
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            value={values.email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'contact-email-error' : undefined}
            onChange={(event) => updateField('email', event.currentTarget.value)}
          />
          {errors.email && <p className="contact-field-error" id="contact-email-error">{errors.email}</p>}
        </div>
        <div className="contact-field contact-message-field">
          <label htmlFor="contact-message">What is on your mind? <span aria-hidden="true">*</span></label>
          <textarea
            ref={messageRef}
            id="contact-message"
            name="message"
            rows={5}
            maxLength={3000}
            required
            value={values.message}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? 'contact-message-error' : undefined}
            onChange={(event) => updateField('message', event.currentTarget.value)}
          />
          {errors.message && <p className="contact-field-error" id="contact-message-error">{errors.message}</p>}
        </div>
        <div className="contact-form-footer">
          <button className="contact-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending…' : 'Send message'} <ArrowUpRight size={17} aria-hidden="true" />
          </button>
          {submissionStatus === 'success' && (
            <p className="contact-success" role="status" aria-live="polite">
              Your message has been sent. Thank you for reaching out.
            </p>
          )}
        </div>
      </form>
    </section>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner section-shell">
        <Brand />
        <span className="footer-note">Independent minds. Shared direction.</span>
        <span className="footer-legal">© NOVA 2026</span>
      </div>
    </footer>
  )
}

function App() {

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Header />
      <main id="main-content">
        <Hero />
        <Approach />
        <Platform />
        <Showcase />
        <CsvAnalyzer />
        <Perspective />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default App
