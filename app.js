import { chapters, mountExperiments } from './experiments.js?v=22';

const metrics = {
  prefill: { title: 'Prompt processing', direction: 'Higher is better', unit: 'tok/s', description: 'prefill throughput' },
  decode: { title: 'Token generation', direction: 'Higher is better', unit: 'tok/s', description: 'decode throughput' },
  ttft: { title: 'Time to first token', direction: 'Lower is better', unit: 's', description: 'time to first token' }
};

export function validateResearch(data) {
  const text = value => typeof value === 'string' && value.trim().length > 0 && value.length < 6000;
  const positive = value => typeof value === 'number' && Number.isFinite(value) && value > 0;
  if (!data || !text(data.snapshot) || !Number.isFinite(Date.parse(data.snapshot)) || !Array.isArray(data.sources) || !Array.isArray(data.journal)) throw new Error('Missing research metadata');
  if (!text(data.reviewedThrough) || !Number.isFinite(Date.parse(data.reviewedThrough)) || Date.parse(data.reviewedThrough) < Date.parse(data.snapshot)) throw new Error('Invalid review cutoff');
  const sourceIds = new Set();
  for (const source of data.sources) {
    if (!source || !/^[a-z][a-z0-9-]*$/.test(source.id) || sourceIds.has(source.id) || !text(source.title) || !text(source.detail)) throw new Error('Invalid research source');
    sourceIds.add(source.id);
  }
  const comparison = data.comparison;
  if (!comparison || ![comparison.promptTokens, comparison.outputTokens, comparison.requestsPerVariant].every(value => Number.isInteger(value) && value > 0) || !sourceIds.has(comparison.source) || !text(comparison.caveat) || !text(comparison.control) || !Array.isArray(comparison.variants) || comparison.variants.length !== 2) throw new Error('Invalid comparison basis');
  const names = new Set();
  for (const variant of comparison.variants) {
    if (!variant || !text(variant.name) || names.has(variant.name) || !Object.keys(metrics).every(key => positive(variant[key]))) throw new Error('Invalid measurement');
    names.add(variant.name);
  }
  const ids = new Set();
  for (const entry of data.journal) {
    if (!entry || !/^[a-z][a-z0-9-]*$/.test(entry.id) || ids.has(entry.id) || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date) || !Number.isFinite(Date.parse(entry.date)) || !['measured', 'investigating', 'next'].includes(entry.category) || !sourceIds.has(entry.source) || !['title', 'summary', 'status', 'observation', 'limitation', 'next'].every(key => text(entry[key]))) throw new Error('Invalid journal entry');
    if (entry.mechanism !== undefined && !chapters.some(chapter => chapter.id === entry.mechanism)) throw new Error('Invalid experiment mechanism');
    ids.add(entry.id);
  }
  return data;
}

export function comparisonView(comparison, metric) {
  if (!Object.hasOwn(metrics, metric)) throw new Error('Unknown comparison metric');
  const [baseline, candidate] = comparison.variants.map(variant => variant[metric]);
  const difference = metric === 'ttft' ? (baseline - candidate) / baseline : (candidate - baseline) / baseline;
  const max = Math.max(baseline, candidate);
  const step = 10 ** Math.floor(Math.log10(max));
  const ceiling = Math.ceil(max / step) * step;
  const description = metrics[metric];
  return { ...description, ceiling, difference, values: comparison.variants.map(variant => ({ name: variant.name, value: variant[metric], width: variant[metric] / ceiling * 100 })) };
}

export function journalView(entries, category = 'all', expanded = false) {
  if (!['all', 'measured', 'investigating', 'next'].includes(category)) throw new Error('Unknown journal category');
  const matching = entries.filter(entry => category === 'all' || entry.category === category);
  return { visibleIds: (expanded ? matching : matching.slice(0, 6)).map(entry => entry.id), total: matching.length };
}

function revealHash() {
  const id = location.hash.slice(1);
  const target = document.getElementById(id);
  if (!target) return;
  const entry = target.closest('.journal-entry');
  if (entry?.hidden) {
    document.querySelector('[data-filter="all"]')?.click();
    const more = document.getElementById('journal-more');
    if (entry.hidden && more && !more.hidden) more.click();
  }
  for (let details = target.closest('details'); details; details = details.parentElement?.closest('details')) details.open = true;
  // Opening a collapsed ancestor can move the anchor after the browser's initial scroll.
  requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
}

async function start() {
  try {
    const response = await fetch('research.json', { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Research file returned ${response.status}`);
    const data = validateResearch(await response.json());
    const make = (tag, className, text) => {
      const element = document.createElement(tag);
      if (className) element.className = className;
      if (text !== undefined) element.textContent = text;
      return element;
    };
    const renderChart = metric => {
      const view = comparisonView(data.comparison, metric);
      const title = document.getElementById('chart-title');
      title.replaceChildren(document.createTextNode(view.title), make('span', '', `${view.unit === 's' ? 'Seconds' : 'Tokens/s'} · ${view.direction}`));
      const bars = view.values.map(variant => {
        const row = make('div', 'bar-row');
        const top = make('div', 'bar-top');
        const value = make('strong', '', `${variant.value.toFixed(3)} `);
        value.append(make('small', '', view.unit));
        top.append(make('span', '', variant.name), value);
        const track = make('div', 'bar-track');
        const bar = make('div', `bar ${variant.name === data.comparison.variants[0].name ? 'bar-q6' : 'bar-q4'}`);
        bar.style.width = `${variant.width}%`;
        track.append(bar);
        row.append(top, track);
        return row;
      });
      document.getElementById('chart-bars').replaceChildren(...bars);
      document.getElementById('axis-middle').textContent = String(view.ceiling / 2);
      document.getElementById('axis-max').textContent = `${view.ceiling} ${view.unit}`;
      document.getElementById('delta-number').textContent = `${Math.abs(view.difference * 100).toFixed(1)}%`;
      const lower = (metric === 'ttft') === (view.difference >= 0);
      document.getElementById('delta-description').textContent = `${lower ? 'lower' : 'higher'} ${view.description}`;
      for (const button of document.querySelectorAll('[data-metric]')) button.setAttribute('aria-pressed', String(button.dataset.metric === metric));
      document.getElementById('results-announcement').textContent = `${view.title}. ${view.values.map(value => `${value.name}: ${value.value.toFixed(3)} ${view.unit}`).join('. ')}. ${view.direction}.`;
    };
    const entries = data.journal.map(entry => {
      const details = make('details', 'journal-entry');
      details.id = `study-${entry.id}`;
      details.dataset.category = entry.category;
      details.dataset.date = entry.date;
      const summary = make('summary');
      const date = make('time', 'entry-date', new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(entry.date)));
      date.dateTime = entry.date;
      const main = make('span', 'entry-main');
      main.append(make('span', 'entry-status', entry.status), make('span', 'entry-title', entry.title), make('span', 'entry-summary', entry.summary));
      const expand = make('span', 'expand-mark');
      expand.setAttribute('aria-hidden', 'true');
      summary.append(date, main, expand);
      const body = make('div', 'entry-detail');
      const definition = make('dl');
      for (const [label, key] of [['Observed', 'observation'], ['Limits', 'limitation'], ['Next question', 'next']]) definition.append(make('dt', '', label), make('dd', '', entry[key]));
      const source = make('a', 'source-ref', 'Evidence and context');
      source.href = `#source-${entry.source}`;
      body.append(definition, source);
      if (entry.mechanism) {
        const mechanism = make('a', 'mechanism-link', 'See the mechanism');
        mechanism.href = `#experiment-${entry.mechanism}`;
        body.append(mechanism);
      }
      details.append(summary, body);
      return details;
    });
    document.getElementById('journal-entries').replaceChildren(...entries);
    const order = ['hardware', 'measurements', 'methodology', 'session', 'validation-v3', 'checkin-v3', 'context-export', 'continuation-v4', 'corrected-validation', 'backend-screens', 'trace-status', 'speculative-screen', 'speculative-audit', 'token-diagnosis', 'probability-analysis', 'trace-review', 'quality-progress', 'research-audit', 'research-charter', 'clock-validation', 'scheduling-progress', 'scheduling-results', 'followup-blockers', 'reference-quality-failure', 'blocker-diagnostics', 'blocker-resolution', 'confirmation-progress', 'confirmation-checkin'];
    document.getElementById('source-list').replaceChildren(...order.map((id, index) => {
      const source = data.sources.find(item => item.id === id);
      if (!source) throw new Error('Missing page evidence source');
      const item = make('li');
      const details = make('details', 'source-entry');
      details.id = `source-${id}`;
      const summary = make('summary');
      const expand = make('span', 'expand-mark');
      expand.setAttribute('aria-hidden', 'true');
      summary.append(make('h3', '', `[${index + 1}] ${source.title}`), expand);
      details.append(summary, make('p', '', source.detail));
      item.append(details);
      return item;
    }));
    let journalCategory = 'all';
    let journalExpanded = false;
    const more = document.getElementById('journal-more');
    const filterJournal = category => {
      journalCategory = category;
      const view = journalView(data.journal, category, journalExpanded);
      const visible = new Set(view.visibleIds.map(id => `study-${id}`));
      let previousDate;
      for (const entry of entries) {
        entry.hidden = !visible.has(entry.id);
        entry.dataset.dateStart = String(!entry.hidden && previousDate !== undefined && entry.dataset.date !== previousDate);
        if (!entry.hidden) previousDate = entry.dataset.date;
      }
      for (const button of document.querySelectorAll('[data-filter]')) button.setAttribute('aria-pressed', String(button.dataset.filter === category));
      document.getElementById('journal-count').textContent = `Showing ${view.visibleIds.length} of ${view.total} matching ${view.total === 1 ? 'note' : 'notes'} · Dated observations`;
      more.hidden = view.total <= 6;
      more.textContent = journalExpanded ? 'Show fewer notes' : 'Show all matching notes';
      more.setAttribute('aria-expanded', String(journalExpanded));
    };
    more.addEventListener('click', () => {
      journalExpanded = !journalExpanded;
      filterJournal(journalCategory);
    });
    document.getElementById('metric-controls').addEventListener('click', event => {
      const button = event.target.closest('button[data-metric]');
      if (button) renderChart(button.dataset.metric);
    });
    document.getElementById('journal-filters').addEventListener('click', event => {
      const button = event.target.closest('button[data-filter]');
      if (button) {
        journalExpanded = false;
        filterJournal(button.dataset.filter);
      }
    });
    renderChart('prefill');
    filterJournal('all');
    document.getElementById('metric-controls').hidden = false;
    document.getElementById('journal-filters').hidden = false;
    revealHash();
  } catch (error) {
    console.error('Research enhancement unavailable:', error);
    const message = document.getElementById('data-message');
    message.textContent = 'The full journal could not load. The dated findings and source notes above remain available. Serve this folder over HTTP, then reload to retry.';
    message.hidden = false;
  }
}

if (typeof document !== 'undefined') {
  mountExperiments(document.querySelector('[data-experiment-root]'));
  start();
  window.addEventListener('hashchange', revealHash);
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (link && link.hash && link.hash === location.hash) revealHash();
  });
}
