export type IntelligenceViewId = 'signals' | 'market' | 'momentum'

type PatternCategory = 'demand' | 'pricing' | 'service' | 'access' | 'retention' | 'capacity' | 'execution' | 'position'
type PatternMeasure = 'volume' | 'progress'
type FourValues = readonly [number, number, number, number]

interface Observation {
  topic: string
  context: string
  category: PatternCategory
  currentCount: number
  baselineCount: number
  leadDays: number
  baselineLeadDays: number
}

interface Initiative {
  name: string
  category: PatternCategory
  progress: number
  plannedProgress: number
  daysToAction: number
  baselineDaysToAction: number
}

export interface IntelligenceDemoScenario {
  id: string
  name: string
  sector: string
  observations: readonly Observation[]
  signalsTrend: { actual: FourValues; baseline: FourValues }
  market: {
    demandActual: FourValues
    demandBaseline: FourValues
    currentShare: number
    baselineShare: number
    currentPriceConcern: number
    baselinePriceConcern: number
  }
  initiatives: readonly Initiative[]
  momentumTrend: { actual: FourValues; baseline: FourValues }
}

export interface DerivedMetric {
  label: string
  value: string
  change: string
}

export interface DerivedUpdate {
  text: string
  tag: string
  direction: 'up' | 'down'
}

export interface DerivedView {
  id: IntelligenceViewId
  label: string
  title: string
  subtitle: string
  period: string
  range: string
  metrics: readonly DerivedMetric[]
  series: FourValues
  comparison: FourValues
  insight: string
  action: string
  source: string
  updates: readonly DerivedUpdate[]
}

interface Pattern {
  topic: string
  context: string
  category: PatternCategory
  current: number
  baseline: number
  delta: number
  relativeDelta: number
  measure: PatternMeasure
}

// These records are fictional, illustrative inputs for the client-side demo only.
export const intelligenceDemoScenarios: readonly IntelligenceDemoScenario[] = [
  {
    id: 'regional-connectivity',
    name: 'Regional connectivity',
    sector: 'Connectivity',
    observations: [
      { topic: 'Flexible plans', context: 'small businesses comparing regional coverage', category: 'pricing', currentCount: 68, baselineCount: 42, leadDays: 16, baselineLeadDays: 21 },
      { topic: 'Service reliability', context: 'customers in outer districts', category: 'service', currentCount: 51, baselineCount: 59, leadDays: 24, baselineLeadDays: 22 },
      { topic: 'Coverage availability', context: 'newly connected business parks', category: 'access', currentCount: 44, baselineCount: 29, leadDays: 13, baselineLeadDays: 18 },
      { topic: 'Installation windows', context: 'teams planning office moves', category: 'capacity', currentCount: 35, baselineCount: 31, leadDays: 19, baselineLeadDays: 20 },
    ],
    signalsTrend: { actual: [39, 47, 54, 66], baseline: [37, 41, 44, 48] },
    market: {
      demandActual: [82, 89, 101, 112],
      demandBaseline: [80, 85, 91, 96],
      currentShare: 18.4,
      baselineShare: 16.9,
      currentPriceConcern: 38,
      baselinePriceConcern: 45,
    },
    initiatives: [
      { name: 'Flexible plan pilot', category: 'pricing', progress: 72, plannedProgress: 68, daysToAction: 4, baselineDaysToAction: 6 },
      { name: 'Outer-district service review', category: 'service', progress: 54, plannedProgress: 66, daysToAction: 8, baselineDaysToAction: 7 },
      { name: 'Business-park onboarding', category: 'access', progress: 81, plannedProgress: 76, daysToAction: 3, baselineDaysToAction: 5 },
    ],
    momentumTrend: { actual: [33, 42, 57, 69], baseline: [35, 42, 49, 57] },
  },
  {
    id: 'retail-marketplace',
    name: 'Retail marketplace',
    sector: 'Retail',
    observations: [
      { topic: 'Local assortment', context: 'shoppers seeking neighborhood-specific products', category: 'demand', currentCount: 74, baselineCount: 48, leadDays: 12, baselineLeadDays: 17 },
      { topic: 'Delivery confidence', context: 'orders placed outside city centers', category: 'service', currentCount: 57, baselineCount: 63, leadDays: 20, baselineLeadDays: 18 },
      { topic: 'Repeat-purchase rewards', context: 'frequent buyers comparing seller benefits', category: 'retention', currentCount: 62, baselineCount: 45, leadDays: 14, baselineLeadDays: 19 },
      { topic: 'Bundle pricing', context: 'value comparisons across everyday categories', category: 'pricing', currentCount: 39, baselineCount: 43, leadDays: 22, baselineLeadDays: 21 },
    ],
    signalsTrend: { actual: [42, 49, 61, 73], baseline: [40, 44, 48, 53] },
    market: {
      demandActual: [91, 97, 105, 119],
      demandBaseline: [89, 94, 98, 103],
      currentShare: 24.1,
      baselineShare: 23.3,
      currentPriceConcern: 57,
      baselinePriceConcern: 53,
    },
    initiatives: [
      { name: 'Neighborhood assortment test', category: 'demand', progress: 64, plannedProgress: 70, daysToAction: 6, baselineDaysToAction: 5 },
      { name: 'Repeat-buyer rewards', category: 'retention', progress: 83, plannedProgress: 74, daysToAction: 4, baselineDaysToAction: 6 },
      { name: 'Delivery confidence study', category: 'service', progress: 48, plannedProgress: 61, daysToAction: 9, baselineDaysToAction: 8 },
    ],
    momentumTrend: { actual: [37, 46, 53, 64], baseline: [36, 43, 51, 60] },
  },
  {
    id: 'urban-mobility',
    name: 'Urban mobility',
    sector: 'Mobility',
    observations: [
      { topic: 'Station availability', context: 'commuters near employment hubs', category: 'capacity', currentCount: 83, baselineCount: 54, leadDays: 11, baselineLeadDays: 15 },
      { topic: 'Monthly passes', context: 'riders balancing hybrid work schedules', category: 'pricing', currentCount: 66, baselineCount: 71, leadDays: 18, baselineLeadDays: 17 },
      { topic: 'Late-evening routes', context: 'workers traveling after standard service hours', category: 'access', currentCount: 58, baselineCount: 36, leadDays: 15, baselineLeadDays: 20 },
      { topic: 'Trip reliability', context: 'riders transferring between lines', category: 'service', currentCount: 47, baselineCount: 50, leadDays: 21, baselineLeadDays: 22 },
    ],
    signalsTrend: { actual: [35, 46, 58, 71], baseline: [36, 41, 45, 51] },
    market: {
      demandActual: [76, 88, 99, 116],
      demandBaseline: [78, 84, 92, 101],
      currentShare: 31.7,
      baselineShare: 29.6,
      currentPriceConcern: 42,
      baselinePriceConcern: 49,
    },
    initiatives: [
      { name: 'Employment-hub capacity pilot', category: 'capacity', progress: 77, plannedProgress: 69, daysToAction: 4, baselineDaysToAction: 7 },
      { name: 'Late-evening route review', category: 'access', progress: 59, plannedProgress: 72, daysToAction: 8, baselineDaysToAction: 7 },
      { name: 'Hybrid rider pass test', category: 'pricing', progress: 68, plannedProgress: 65, daysToAction: 5, baselineDaysToAction: 6 },
    ],
    momentumTrend: { actual: [32, 45, 56, 70], baseline: [34, 42, 50, 59] },
  },
]

const percentage = (value: number, digits = 0) => `${value.toFixed(digits)}%`
const signed = (value: number, digits = 0) => `${value > 0 ? '+' : ''}${value.toFixed(digits)}`

function relativeChange(current: number, baseline: number) {
  return baseline === 0 ? current * 100 : ((current - baseline) / Math.abs(baseline)) * 100
}

function makePattern(
  topic: string,
  context: string,
  category: PatternCategory,
  current: number,
  baseline: number,
  measure: PatternMeasure = 'volume',
): Pattern {
  return {
    topic,
    context,
    category,
    current,
    baseline,
    delta: current - baseline,
    relativeDelta: relativeChange(current, baseline),
    measure,
  }
}

function strongestPattern(patterns: readonly Pattern[]): Pattern {
  return [...patterns].sort((left, right) => Math.abs(right.relativeDelta) - Math.abs(left.relativeDelta))[0]
}

function patternInsight(pattern: Pattern) {
  if (pattern.measure === 'progress') {
    const position = pattern.delta >= 0 ? 'ahead of' : 'behind'
    return `In this illustrative sample, ${pattern.topic} is ${Math.abs(pattern.delta).toFixed(0)} points ${position} plan (${pattern.current}% actual vs. ${pattern.baseline}% planned progress).`
  }

  const change = Math.abs(pattern.relativeDelta).toFixed(0)
  const direction = pattern.delta >= 0 ? 'more' : 'fewer'
  return `In this illustrative sample, ${pattern.topic.toLowerCase()} is ${change}% ${direction} than its comparison baseline among ${pattern.context}.`
}

function suggestedAction(pattern: Pattern) {
  if (pattern.measure === 'progress') {
    return pattern.delta < 0
      ? `Review blockers for ${pattern.topic.toLowerCase()} and agree on one next step before changing scope.`
      : `Review what is helping ${pattern.topic.toLowerCase()} stay ahead of plan before applying the approach elsewhere.`
  }

  const direction = pattern.delta >= 0 ? 'increase' : 'decrease'
  const actions: Record<PatternCategory, string> = {
    demand: `Validate the ${direction} in ${pattern.topic.toLowerCase()} with a small, time-boxed audience test before expanding.`,
    pricing: `Test one focused pricing or plan message around ${pattern.topic.toLowerCase()} and compare responses with the baseline.`,
    service: `Review service feedback for ${pattern.context}, then pilot one targeted improvement before scaling.`,
    access: `Check availability for ${pattern.context} and trial a focused access adjustment with a limited group.`,
    retention: `Test a small retention offer tied to ${pattern.topic.toLowerCase()} and compare repeat behavior with the baseline.`,
    capacity: `Compare capacity around ${pattern.context} and run a limited pilot where the gap is clearest.`,
    execution: `Review the blockers affecting ${pattern.topic.toLowerCase()} and agree on one measurable next step.`,
    position: `Check whether the ${direction} in ${pattern.topic.toLowerCase()} holds across the next comparison period.`,
  }
  return actions[pattern.category]
}

function makeView(
  scenario: IntelligenceDemoScenario,
  details: Omit<DerivedView, 'insight' | 'action' | 'source'>,
  pattern: Pattern,
): DerivedView {
  return {
    ...details,
    insight: patternInsight(pattern),
    action: suggestedAction(pattern),
    source: `Illustrative sample inputs · ${scenario.sector}`,
  }
}

export function deriveIntelligenceViews(scenario: IntelligenceDemoScenario): readonly DerivedView[] {
  const observationPatterns = scenario.observations.map((observation) =>
    makePattern(observation.topic, observation.context, observation.category, observation.currentCount, observation.baselineCount),
  )
  const totalCurrent = scenario.observations.reduce((sum, observation) => sum + observation.currentCount, 0)
  const totalBaseline = scenario.observations.reduce((sum, observation) => sum + observation.baselineCount, 0)
  const leadDays = scenario.observations.reduce((sum, observation) => sum + observation.leadDays, 0) / scenario.observations.length
  const baselineLeadDays = scenario.observations.reduce((sum, observation) => sum + observation.baselineLeadDays, 0) / scenario.observations.length
  const thresholdPatterns = observationPatterns.filter((pattern) => Math.abs(pattern.relativeDelta) >= 20).length

  const signalView = makeView(scenario, {
    id: 'signals',
    label: 'Signals',
    title: 'Emerging signals',
    subtitle: 'Sample observations across this scenario',
    period: '4 periods',
    range: '4P',
    metrics: [
      { label: 'Signal volume index', value: (totalCurrent / totalBaseline * 100).toFixed(0), change: `${signed(relativeChange(totalCurrent, totalBaseline))}% vs baseline` },
      { label: 'Patterns above threshold', value: String(thresholdPatterns), change: `of ${scenario.observations.length} observations` },
      { label: 'Average lead time', value: `${leadDays.toFixed(1)} days`, change: `${signed(leadDays - baselineLeadDays, 1)} days vs baseline` },
    ],
    series: scenario.signalsTrend.actual,
    comparison: scenario.signalsTrend.baseline,
    updates: [...scenario.observations]
      .sort((left, right) => Math.abs(relativeChange(right.currentCount, right.baselineCount)) - Math.abs(relativeChange(left.currentCount, left.baselineCount)))
      .slice(0, 3)
      .map((observation) => ({
        text: `${observation.topic} ${observation.currentCount >= observation.baselineCount ? 'gains' : 'eases'} in sample mentions`,
        tag: observation.category.toUpperCase(),
        direction: observation.currentCount >= observation.baselineCount ? 'up' : 'down',
      })),
  }, strongestPattern(observationPatterns))

  const demandCurrent = scenario.market.demandActual[3]
  const demandBaseline = scenario.market.demandBaseline[3]
  const marketPatterns = [
    makePattern('Market demand', 'the selected sample category', 'demand', demandCurrent, demandBaseline),
    makePattern('Relative share', 'the selected sample category', 'position', scenario.market.currentShare, scenario.market.baselineShare),
    makePattern('Price concern', 'sample price-related feedback', 'pricing', scenario.market.currentPriceConcern, scenario.market.baselinePriceConcern),
  ]
  const shareChange = scenario.market.currentShare - scenario.market.baselineShare
  const priceConcern = scenario.market.currentPriceConcern
  const pricePressure = priceConcern <= 35 ? 'Low' : priceConcern <= 65 ? 'Moderate' : 'High'
  const priceConcernChange = priceConcern - scenario.market.baselinePriceConcern

  const marketView = makeView(scenario, {
    id: 'market',
    label: 'Market',
    title: 'Market movement',
    subtitle: 'Sample demand compared with its baseline',
    period: '4 periods',
    range: '4P',
    metrics: [
      { label: 'Demand index', value: (demandCurrent / demandBaseline * 100).toFixed(1), change: `${signed(relativeChange(demandCurrent, demandBaseline), 1)}% vs baseline` },
      { label: 'Current share', value: `${scenario.market.currentShare.toFixed(1)}%`, change: `${signed(shareChange, 1)} pts vs baseline` },
      { label: 'Price pressure', value: pricePressure, change: `${signed(priceConcernChange)} pts concern` },
    ],
    series: scenario.market.demandActual,
    comparison: scenario.market.demandBaseline,
    updates: marketPatterns.map((pattern) => ({
      text: `${pattern.topic} ${pattern.delta >= 0 ? 'is above' : 'is below'} its sample baseline`,
      tag: pattern.category.toUpperCase(),
      direction: pattern.delta >= 0 ? 'up' : 'down',
    })),
  }, strongestPattern(marketPatterns))

  const initiativePatterns = scenario.initiatives.map((initiative) =>
    makePattern(initiative.name, 'the illustrative initiative plan', initiative.category, initiative.progress, initiative.plannedProgress, 'progress'),
  )
  const onPlanCount = scenario.initiatives.filter((initiative) => initiative.progress >= initiative.plannedProgress).length
  const averageProgressGap = scenario.initiatives.reduce((sum, initiative) => sum + initiative.progress - initiative.plannedProgress, 0) / scenario.initiatives.length
  const averageDays = scenario.initiatives.reduce((sum, initiative) => sum + initiative.daysToAction, 0) / scenario.initiatives.length
  const baselineAverageDays = scenario.initiatives.reduce((sum, initiative) => sum + initiative.baselineDaysToAction, 0) / scenario.initiatives.length

  const momentumView = makeView(scenario, {
    id: 'momentum',
    label: 'Momentum',
    title: 'Execution momentum',
    subtitle: 'Sample initiative progress against plan',
    period: `${scenario.initiatives.length} initiatives`,
    range: '4P',
    metrics: [
      { label: 'Initiatives on plan', value: percentage(onPlanCount / scenario.initiatives.length * 100), change: `${onPlanCount} of ${scenario.initiatives.length} initiatives` },
      { label: 'Average progress gap', value: `${signed(averageProgressGap, 1)} pts`, change: 'actual vs plan' },
      { label: 'Average time to action', value: `${averageDays.toFixed(1)} days`, change: `${signed(averageDays - baselineAverageDays, 1)} days vs baseline` },
    ],
    series: scenario.momentumTrend.actual,
    comparison: scenario.momentumTrend.baseline,
    updates: [...scenario.initiatives]
      .sort((left, right) => Math.abs(right.progress - right.plannedProgress) - Math.abs(left.progress - left.plannedProgress))
      .map((initiative) => ({
        text: `${initiative.name} ${initiative.progress >= initiative.plannedProgress ? 'is ahead of' : 'is behind'} plan by ${Math.abs(initiative.progress - initiative.plannedProgress)} pts`,
        tag: initiative.category.toUpperCase(),
        direction: initiative.progress >= initiative.plannedProgress ? 'up' : 'down',
      })),
  }, strongestPattern(initiativePatterns))

  return [signalView, marketView, momentumView]
}