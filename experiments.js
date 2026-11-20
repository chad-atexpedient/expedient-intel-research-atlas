export const chapters = [
  {
    id: 'routing', label: 'Token routing', title: 'Follow A Token, Not A GPU Meter.',
    foundation: 'A mixture-of-experts model routes each token to a selected subset of experts. Prefill can group many token rows; decode often has much smaller work units.',
    variable: 'Compare the work available during prompt processing and token-by-token generation.',
    discovery: 'By the November 19, 16:17 UTC check-in, the diagnostic pass had produced 15,462 routing summaries with conservation checks passed. Execution phase, dispatch, copy, and host-wait metadata were also captured; GPU durations remain a separate question.',
    limit: 'Expert choices and token counts here are illustrative, not a recorded routing distribution or the model’s full topology.',
    source: 'checkin-v3', journal: 'execution-capture',
    steps: [
      ['A Token Arrives', 'The token carries a representation into a layer. The router decides which experts participate.'],
      ['Select, Don’t Use Everything', 'Only a subset of the illustrated experts receives this token. Unselected experts are not shown doing work.'],
      ['Group The Selected Work', 'A prefill batch can bring more rows to selected experts. The actual distribution depends on the input.'],
      ['Combine And Continue', 'Selected expert outputs are combined. This repeats through the model; it is not independent all-to-all GPU expert parallelism.']
    ]
  },
  {
    id: 'layout', label: 'GPU layout & batching', title: 'Stored Evenly Isn’t Working Evenly.',
    foundation: 'Layer splitting keeps a layer’s experts with that layer. Tensor splitting divides matrix work and introduces exchanges or reductions.',
    variable: 'Compare layer and tensor layouts, then increase physical microbatch size separately from the logical batch limit.',
    discovery: 'By November 20,02:48:06UTC, source-backed probes explain the tested BOOTTIME/RAW conversion defect. Existing native RAW mode then passed16/16markers across two four-device captures with10-second phase separation. No profiler rebuild,model gain or precise cross-device overlap certification.',
    limit: 'This is a conceptual schematic, not a replay. The pinned buffer flushes when full; historical full-model traces remain unqualified. Millisecond probe brackets do not establish fine-grained GPU overlap. Durations and packet spacing here are illustrative.',
    source: 'clock-validation', journal: 'clock-domain-validation',
    steps: [
      ['Place The Layers', 'The main weights fit across four GPUs. Keeping weight bytes balanced does not establish balanced execution.'],
      ['Pass Layer Boundaries', 'In layer mode, dependent layer groups pass activations onward. One request does not automatically use the sum of all four memory bandwidths.'],
      ['Split, Then Combine', 'Tensor mode divides work within a layer and needs reductions. This is not expert parallelism. Communication is a question to measure, not a diagnosed bottleneck.'],
      ['Batch The Prompt', 'Larger physical microbatches can give kernels more work. They also need headroom and can interfere with another user’s decode.']
    ]
  },
  {
    id: 'precision', label: 'Weight precision', title: 'Change The Weights. Keep The Control.',
    foundation: 'The main model weights and the Engram lookup table are separate parts of the comparison.',
    variable: 'Use UD-Q6_K_XL or UD-Q4_K_XL main weights while keeping the identical external Q8_0 lookup table.',
    discovery: 'Q4 improved prefill in the small matched screen shown below. Its general quality equivalence and service qualification remain unproven.',
    limit: 'Payloads are symbolic, not to scale. GGUF storage names do not establish native INT4 arithmetic or which hardware kernel executed.',
    source: 'measurements', journal: 'precision',
    steps: [
      ['Keep The Lookup Fixed', 'The same external Q8_0 Engram table is used in both arms. Changing table precision too would change a second variable.'],
      ['Load The Q6 Arm', 'UD-Q6_K_XL is a mixed-precision checkpoint, not a uniformly six-bit model.'],
      ['Change Main Weights To Q4', 'Only the main-weight choice changes in the matched comparison. The smaller drawing indicates a reduced payload, not a measured ratio.'],
      ['Measure, Then Qualify', 'Compare matched requests, then evaluate quality and the intended service workload. Smaller weights alone are not a promotion gate.']
    ]
  },
  {
    id: 'engram', label: 'Engram residency', title: 'A File Mapping Has More Than One Path.',
    foundation: 'The lookup table is file-backed and CPU-accessible. Linux may serve a lookup from a resident page or read the page from storage.',
    variable: 'Compare natural lazy loading, manual warming, and eager CPU placement while holding lookup precision fixed.',
    discovery: 'The short screens were close. Manual warming produced only partial file residency, so a full-DRAM-versus-cold-SSD result was not established.',
    limit: 'Cache hit and miss are conceptual alternatives, not a captured sequence. This does not depict a GPU directly reading the SSD.',
    source: 'methodology', journal: 'engram',
    steps: [
      ['Ask For A Lookup Row', 'The model requests an n-gram lookup. A file mapping describes an address relationship, not the physical source of every read.'],
      ['If The Page Is Resident', 'The OS can serve the page from host RAM. A mapped file does not imply a storage read on this lookup.'],
      ['If The Page Is Missing', 'The OS reads the needed page from the file-backed store. Illustrative arrows do not show measured I/O latency.'],
      ['Observe Residency And I/O', 'Hot pages may remain cached for later requests. Residency, faults, and disk reads must be measured together.']
    ]
  },
  {
    id: 'context', label: 'Long context', title: 'Loading Context Isn’t Qualifying A Service.',
    foundation: 'A long prompt must be processed before sustained generation. Context capacity, recall, and usable latency answer different questions.',
    variable: 'Increase context in safe tiers, test recall, and follow real prefill with generated output.',
    discovery: 'A one-user native-context recall screen passed. It did not establish a two-user service; the largest two-user tier hit the headroom safety limit.',
    limit: 'Document lengths and progress here are symbolic. Some earlier long-context timings overlapped compilation and need clean repeats.',
    source: 'session', journal: 'context',
    steps: [
      ['A Long Document Arrives', 'Input length is actual work, not just an allocation setting. Runtime context must also be checked per slot.'],
      ['Process Before Generating', 'Prefill handles the prompt in physical work chunks. The logical batch limit is not the size of every executed chunk.'],
      ['Recall Is A Separate Check', 'A bounded beginning/middle/end recall test asks whether selected facts were retained. It is not broad quality proof.'],
      ['Test The Service Boundary', 'Now test sustained decode, time to first token, concurrency, and memory reserves. Stop at the safety boundary rather than treating a load as a pass.']
    ]
  },
  {
    id: 'fairness', label: 'Two-user fairness', title: 'Don’t Let An Average Hide A User.',
    foundation: 'One/two-user workloads expose interference and scheduling questions. Service eligibility is separate from the research value of a measured trade-off.',
    variable: 'Measure explicit user/slot results and decode stalls, not just a pooled score.',
    discovery: 'The local13:48:17UTCcheck-in reports108confirmation requests complete:17.491aggregate tokens/s candidate versus16.186/16.232references,a7.8–8.1%gain. Small gap regressions and the FIFO quality failure still prevent service qualification. Raw backup verification and independent request-level audit remain pending.',
    limit: 'Tracks are illustrative, not captured timings or proven slot identities. Packet counts do not encode measured throughput.',
    source: 'confirmation-checkin', journal: 'confirmation-completed-checkin',
    steps: [
      ['One User Is Decoding', 'Generation is proceeding for the first user. Its experience is a separate acceptance criterion.'],
      ['Another Prompt Arrives', 'The second user’s prefill shares resources with the first user’s decode. How work is scheduled can change both experiences.'],
      ['Inspect Both Tracks', 'An improving pooled number can coexist with a slower stream. Identify users and slots before applying per-user gates.'],
      ['Keep Both Judgments', 'The completed-run check-in reports a gain,but quality and stall gates still fail. Preserve the raw-audit caveat and per-user evidence. A useful research result is not automatically deployment qualification or a landmark.']
    ]
  },
  {
    id: 'kernels', label: 'Kernels & backends', title: 'Follow The Path Before Naming The Cause.',
    foundation: 'Prefill and decode can use different compute paths. A source-code possibility is not proof that the runtime executed it.',
    variable: 'Disable selected gather/dequant-GEMM paths as a control, then verify alternative builds before matched comparisons.',
    discovery: 'The later local check-in reports four legacy-adapter cases complete with RAW-window containment and zero profiler errors. Reported device-event counts are not kernel counts;whole-request overhead is not per-window cost. No precise GPU overlap or exact user-phase attribution is certified,and raw backup/audit remain pending.',
    limit: 'These branches explain the investigation, not GPU occupancy or execution durations. Build prerequisites are not a passed backend probe.',
    source: 'confirmation-checkin', journal: 'confirmation-completed-checkin',
    steps: [
      ['Separate The Work Phases', 'Prompt batches and token generation have different shapes. They need not choose the same kernel path.'],
      ['Change A Specific Path', 'The control disables selected XMX gather/dequant-GEMM paths, not all XMX operations.'],
      ['Trace The Actual Dispatch', 'Correlate requests, dispatch choices, copies, and host waits. Host timing is not GPU-kernel execution time.'],
      ['Test A Bounded Hypothesis', 'Separate measurement validity, research findings and deployment eligibility. Use comparable controls and objective correctness checks. Custom kernels and drivers are research questions, not promised gains or permission to change the system.']
    ]
  }
];

export function experimentState(id, step = 0) {
  const chapter = chapters.find(item => item.id === id);
  if (!chapter || !Number.isInteger(step)) throw new Error('Invalid experiment state');
  return { chapter, step: Math.max(0, Math.min(chapter.steps.length - 1, step)) };
}

export function motionAllowed({ reduced, hidden, inView }) {
  return !reduced && !hidden && inView;
}

const svgNS = 'http://www.w3.org/2000/svg';

// Presentation time only: the animation never derives timing from benchmark data.
export const sceneDuration = 5200;
export const handoffDuration = 720;
export function flowFrame(progress) {
  if (!Number.isFinite(progress)) throw new Error('Invalid flow progress');
  const phase = Math.max(0, Math.min(1, progress));
  const fade = Math.max(0, Math.min(1, phase / .14, (1 - phase) / .14));
  return { phase, opacity: fade * fade * (3 - 2 * fade) };
}

export function loopPhase(time, duration) {
  if (!Number.isFinite(time) || !Number.isFinite(duration) || duration <= 0) throw new Error('Invalid animation clock');
  return ((time % duration) + duration) % duration / duration;
}

function drawScene(id, step) {
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 760 430');
  svg.setAttribute('aria-hidden', 'true');
  const flows = [];
  const pulses = [];
  const routes = document.createElementNS(svgNS, 'g');
  const buildings = document.createElementNS(svgNS, 'g');
  const packets = document.createElementNS(svgNS, 'g');
  const annotations = document.createElementNS(svgNS, 'g');
  svg.append(routes, buildings, packets, annotations);
  const shape = (tag, attributes, parent = buildings, text) => {
    const element = document.createElementNS(svgNS, tag);
    for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, String(value));
    if (text !== undefined) element.textContent = text;
    parent.append(element);
    return element;
  };
  const label = (x, y, text, centered = false, small = false) => shape('text', { x, y, class: `scene-label${centered ? ' scene-centered' : ''}${small ? ' scene-note' : ''}` }, annotations, text);
  const route = (d, active = true, count = 3, secondary = false, duration = 2200) => {
    const path = shape('path', { d, class: `scene-route${active ? ' is-active' : ''}` }, routes);
    if (active) {
      for (let index = 0; index < count; index++) {
        const packet = shape('g', { class: `scene-packet${secondary ? ' is-secondary' : ''}` }, packets);
        shape('path', { d: 'M-7 0 0-4 7 0 0 4Z', class: 'packet-top' }, packet);
        shape('path', { d: 'M-7 0 0 4 7 0V5L0 9-7 5Z', class: 'packet-side' }, packet);
        flows.push({ packet, path, phase: index / count, duration, key: `${d}:${secondary}:${index}` });
      }
    }
    return path;
  };
  const tile = (x, y, name, active = false, tall = 24, width = 70) => {
    const depth = width * .43;
    const group = shape('g', { class: `scene-tile${active ? ' is-active' : ''}` });
    shape('path', { d: `M${x - width} ${y}L${x} ${y + depth}L${x + width} ${y}V${y + tall}L${x} ${y + depth + tall}L${x - width} ${y + tall}Z`, class: 'tile-base' }, group);
    shape('path', { d: `M${x} ${y + depth}V${y + depth + tall}L${x + width} ${y + tall}V${y}Z`, class: 'tile-side' }, group);
    shape('path', { d: `M${x - width} ${y}L${x} ${y - depth}L${x + width} ${y}L${x} ${y + depth}Z`, class: 'tile-top' }, group);
    const ring = shape('path', { d: `M${x - width + 9} ${y}L${x} ${y - depth + 5}L${x + width - 9} ${y}L${x} ${y + depth - 5}Z`, class: 'tile-ring' }, group);
    if (active) pulses.push({ element: ring, delay: pulses.length * 180 });
    for (let row = 0; row < 3; row++) for (let column = 0; column < 3; column++) {
      const cx = x + (column - row) * 13;
      const cy = y + (column + row - 2) * 5.6;
      const chip = shape('path', { d: `M${cx - 7} ${cy}l7-3 7 3-7 3Z`, class: 'tile-cell' }, group);
      if (active && (row + column) % 2 === 0) pulses.push({ element: chip, delay: (row * 3 + column) * 130 });
    }
    label(x, y + depth + tall + 24, name, true);
    return group;
  };
  // The shallow grid gives the motion a physical plane without implying hardware wiring.
  for (let index = 0; index < 8; index++) {
    shape('path', { d: `M${25 + index * 86} 366l190-82M${35 + index * 86} 110l-10 256`, class: 'scene-ground' }, routes);
  }
  label(26, 29, chapters.find(chapter => chapter.id === id).label, false, true);

  if (id === 'routing') {
    tile(83, 226, 'Tokens', true, 12, 48);
    tile(256, 226, 'Router', step < 2, 28, 55);
    const experts = [[434, 104], [600, 173], [434, 246], [600, 315]];
    experts.forEach(([x, y], index) => {
      const selected = index === 0 || index === 2;
      route(`M303 226L348 207L${x - 68} ${y}`, step >= 1 && selected, step === 2 ? 6 : 3);
      tile(x, y, `Expert ${String.fromCharCode(65 + index)}`, step >= 1 && selected, selected && step >= 2 ? 36 : 19, 62);
    });
    route('M126 226L205 226', true, step === 2 ? 6 : 3);
    route('M496 104L690 186L690 277L716 288', step === 3, 4);
    route('M496 246L640 308L690 286L716 288', step === 3, 4, true);
    if (step === 3) { tile(690, 199, 'Combine', true, 18, 43); route('M690 277V222', true, 3); }
    label(30, 408, step === 2 ? 'Prompt batch: more rows can reach selected experts' : 'Illustrative subset; inactive experts remain idle', false, true);
  } else if (id === 'layout') {
    const devices = [[116, 128], [292, 199], [468, 270], [644, 341]];
    devices.forEach(([x, y], index) => tile(x, y, `B70 / GPU ${index}`, step > 0, 30, 66));
    if (step === 2) {
      label(415, 65, 'Tensor slices + reduction', true);
      devices.forEach(([x, y], index) => {
        route(`M382 84L${x} ${y - 35}`, true, 3, false);
        route(`M${x + 55} ${y}L714 ${y + 28}V376H400`, true, 3, index % 2 === 1);
      });
    } else {
      route('M27 91L60 111', true, 3);
      for (let index = 0; index < 3; index++) {
        const [x, y] = devices[index];
        const [nextX, nextY] = devices[index + 1];
        route(`M${x + 64} ${y}L${nextX - 64} ${nextY}`, step > 0, step === 3 ? 7 : 3);
      }
      label(480, 90, step === 3 ? 'Larger physical work chunks' : 'Layer groups pass activations onward', true);
    }
    label(26, 408, step === 2 ? 'Exchanges are part of the work, not a diagnosed bottleneck' : 'Four devices do not automatically deliver four times the bandwidth', false, true);
  } else if (id === 'precision') {
    const q4 = step >= 2;
    tile(144, 152, q4 ? 'UD-Q4_K_XL' : 'UD-Q6_K_XL', step === 1 || step === 2, q4 ? 15 : 51, 81);
    tile(546, 127, 'Fixed Q8_0 Engram', true, 24, 80);
    tile(350, 298, 'Matched requests', step > 0, 22, 76);
    route(`M${q4 ? 144 : 144} ${q4 ? 202 : 240}L230 274L274 298`, step > 0, q4 ? 3 : 5, false);
    route('M546 186L462 222L426 298', true, 4, true);
    if (step === 3) { tile(619, 303, 'Quality gate', true, 24, 63); route('M426 298L556 303', true, 3); }
    label(33, 65, 'Main weights change', false, true); label(475, 65, 'Same lookup precision', false, true);
    label(26, 408, 'Payload heights are symbolic, not a measured size ratio', false, true);
  } else if (id === 'engram') {
    tile(99, 194, 'Lookup', true, 20, 58);
    tile(338, 150, 'Host RAM / page cache', step !== 2, 27, 82);
    tile(582, 282, 'File-backed SSD', step === 2, 35, 83);
    route('M157 194L222 166L256 150', step !== 2, 4);
    route('M338 212L225 261L99 214', step === 1 || step === 3, 4, true);
    route('M420 150L582 220V246', step === 2, 4, false, 3000);
    route('M499 282L338 258V211', step === 2, 4, true, 3000);
    if (step === 3) route('M278 151L338 125L398 151L338 177Z', true, 6);
    label(87, 95, step === 2 ? 'Missing page: read the file' : 'Resident page: serve from RAM', false);
    label(26, 408, 'Alternative paths, not an observed hit/miss sequence', false, true);
  } else if (id === 'context') {
    for (let index = 3; index >= 0; index--) tile(92, 121 + index * 17, index === 0 ? 'Long document' : '', step === 0, 6, 55);
    tile(320, 226, 'Prefill chunks', step === 1, 33, 72);
    tile(576, 170, step < 3 ? 'Recall check' : 'Service checks', step >= 2, 25, 78);
    route('M147 172L215 201L248 226', step <= 1, step === 1 ? 9 : 4, false, 2700);
    route('M392 226L475 190L498 170', step >= 1, step === 1 ? 6 : 3);
    if (step >= 2) { route('M576 229V301H363', true, 3, true); tile(288, 301, step === 2 ? 'Bounded recall' : 'Each user + reserves', true, 13, 75); }
    label(26, 408, 'Prefill first; recall and service qualification are separate gates', false, true);
  } else if (id === 'fairness') {
    label(28, 104, 'User A / decode'); label(28, 279, 'User B / prefill');
    tile(378, 183, 'Shared platform', step < 3, 34, 99);
    tile(633, 114, 'User A', step !== 2, 17, 48);
    tile(633, 289, 'User B', step > 0, 17, 48);
    route('M29 123H158L284 177', true, 5, false, step === 2 ? 3700 : 2300);
    route('M476 183L534 159L587 114', true, 5, false, step === 2 ? 3700 : 2300);
    route('M29 298H158L284 207', step >= 1, 8, true);
    route('M476 212L534 238L587 289', step >= 1, 7, true);
    if (step === 2) { shape('path', { d: 'M197 135v23m9-19v23', class: 'scene-hold-mark' }, annotations); label(171, 117, 'Inspect stalls', false, true); }
    if (step === 3) { shape('rect', { x: 258, y: 346, width: 286, height: 30, class: 'scene-hold' }, annotations); label(401, 366, 'Hold: both users must qualify', true); }
    label(26, 408, 'Track speed is illustrative, not a throughput comparison', false, true);
  } else if (id === 'kernels') {
    tile(99, 111, 'Prefill', step < 2, 19, 54); tile(99, 277, 'Decode', true, 19, 54);
    tile(358, 111, step === 1 ? 'Path disabled' : 'Gather / dequant-GEMM', step !== 1, 29, 89);
    tile(358, 277, 'Other eligible paths', true, 24, 89);
    route('M153 111H269', step !== 1, 6);
    route(step === 1 ? 'M153 111L205 133V255L269 277' : 'M153 277H269', true, 4, true);
    tile(638, 195, step === 3 ? 'Build / verify / compare' : 'Validate dispatch', step >= 2, 21, 80);
    route('M447 111L505 136L558 195', step !== 1, 4);
    route('M447 277L505 252L558 195', true, 3, true);
    if (step === 1) shape('path', { d: 'M313 82l90 58m0-58-90 58', class: 'scene-hold-mark' }, annotations);
    label(26, 408, 'Path activity is conceptual; it is not measured GPU occupancy', false, true);
  }
  // Place static packet markers too, so reduced-motion and paused views remain legible.
  for (const flow of flows) {
    const point = flow.path.getPointAtLength(flow.path.getTotalLength() * flow.phase);
    flow.packet.setAttribute('transform', `translate(${point.x} ${point.y})`);
  }
  return { svg, flows, pulses };
}

export function mountExperiments(root) {
  if (!root) return;
  let { chapter, step } = experimentState('routing');
  let playing = false;
  let timer;
  let animations = [];
  let flowAnimations = new Map();
  let handoff = null;
  let textAnimations = [];
  let inView = false;
  let introduced = false;
  let remaining = sceneDuration;
  let startedAt = 0;
  let speed = 1;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const find = name => root.querySelector(`[data-experiment-${name}]`);
  const play = find('play');
  const range = find('range');
  const allowed = () => {
    const bounds = find('diagram').getBoundingClientRect();
    inView = bounds.bottom > 0 && bounds.top < innerHeight && bounds.right > 0 && bounds.left < innerWidth;
    return motionAllowed({ reduced: preference.matches, hidden: document.hidden, inView });
  };
  const setPlayback = () => {
    root.dataset.playing = String(playing);
    play.textContent = preference.matches ? 'Motion reduced' : playing ? 'Pause sequence' : 'Play sequence';
    play.disabled = !allowed();
    play.setAttribute('aria-pressed', String(playing));
  };
  const finishHandoff = () => {
    if (!handoff) return;
    const previous = handoff;
    handoff = null;
    previous.exit.cancel();
    previous.enter.cancel();
    for (const animation of previous.motion) animation.cancel();
    previous.svg.remove();
  };
  const pause = reason => {
    if (playing) remaining = Math.max(0, remaining - (performance.now() - startedAt) * speed);
    playing = false;
    clearTimeout(timer);
    for (const animation of animations) animation.pause();
    if (handoff) {
      handoff.exit.pause();
      handoff.enter.pause();
      for (const animation of handoff.motion) animation.pause();
    }
    for (const animation of textAnimations) animation.pause();
    setPlayback();
    if (reason) find('announcement').textContent = reason;
  };
  const render = (smooth = true) => {
    finishHandoff();
    const diagram = find('diagram');
    const outgoing = diagram.querySelector('svg');
    const outgoingMotion = animations;
    const previousPhases = new Map([...flowAnimations].map(([key, animation]) => [key, loopPhase(Number(animation.currentTime ?? 0), Number(animation.effect.getTiming().duration))]));
    const blend = Boolean(smooth && outgoing && allowed());
    animations = [];
    flowAnimations = new Map();
    remaining = sceneDuration;
    const next = drawScene(chapter.id, step);
    if (blend) {
      diagram.append(next.svg);
      const options = { duration: handoffDuration, easing: 'cubic-bezier(.22,1,.36,1)' };
      const exit = outgoing.animate([{ opacity: 1 }, { opacity: 0 }], { ...options, fill: 'forwards' });
      const enter = next.svg.animate([{ opacity: 0 }, { opacity: 1 }], options);
      handoff = { svg: outgoing, motion: outgoingMotion, exit, enter };
      exit.onfinish = () => { if (handoff?.exit === exit) finishHandoff(); };
      if (playing) for (const animation of outgoingMotion) animation.play();
    } else {
      for (const animation of outgoingMotion) animation.cancel();
      diagram.replaceChildren(next.svg);
    }
    if (!preference.matches) {
      for (const flow of next.flows) {
        const length = flow.path.getTotalLength();
        // ponytail: 65 samples approximate bends; use native offset-path if future scenes need curved tracks.
        const frames = Array.from({ length: 65 }, (_, index) => {
          const progress = index / 64;
          const point = flow.path.getPointAtLength(length * progress);
          return { transform: `translate(${point.x}px, ${point.y}px)`, opacity: flowFrame(progress).opacity, offset: progress };
        });
        const animation = flow.packet.animate(frames, { duration: flow.duration, iterations: Infinity, easing: 'linear' });
        animation.pause();
        animation.currentTime = (previousPhases.get(flow.key) ?? flow.phase) * flow.duration;
        animation.playbackRate = speed;
        animations.push(animation);
        flowAnimations.set(flow.key, animation);
      }
      for (const pulse of next.pulses) {
        const key = `pulse:${pulse.element.getAttribute('d')}`;
        const animation = pulse.element.animate([{ opacity: .3 }, { opacity: .85 }, { opacity: .3 }], { duration: 2200, iterations: Infinity, easing: 'ease-in-out' });
        animation.pause();
        animation.currentTime = (previousPhases.get(key) ?? pulse.delay / 2200) * 2200;
        animation.playbackRate = speed;
        animations.push(animation);
        flowAnimations.set(key, animation);
      }
      if (playing && allowed()) for (const animation of animations) animation.play();
    }
    for (const animation of textAnimations) animation.cancel();
    textAnimations = [];
    const copyChanged = find('step-title').textContent !== chapter.steps[step][0];
    find('title').textContent = chapter.title;
    find('foundation').textContent = chapter.foundation;
    find('variable').textContent = chapter.variable;
    find('discovery').textContent = chapter.discovery;
    find('limit').textContent = chapter.limit;
    find('step-title').textContent = chapter.steps[step][0];
    find('step-copy').textContent = chapter.steps[step][1];
    if (blend && copyChanged) {
      for (const name of ['step-title', 'step-copy']) textAnimations.push(find(name).animate([{ opacity: .35 }, { opacity: 1 }], { duration: handoffDuration, easing: 'ease-out' }));
    }
    find('step-count').textContent = `Step ${step + 1} of ${chapter.steps.length}`;
    find('source').href = `#source-${chapter.source}`;
    find('journal').href = `#study-${chapter.journal}`;
    find('previous').disabled = step === 0;
    find('next').disabled = step === chapter.steps.length - 1;
    range.max = String(chapter.steps.length - 1);
    range.value = String(step);
    range.setAttribute('aria-valuetext', `Step ${step + 1}: ${chapter.steps[step][0]}`);
    root.dataset.chapter = chapter.id;
    root.dataset.step = String(step);
    for (const button of root.querySelectorAll('[data-experiment-chapter]')) button.setAttribute('aria-pressed', String(button.dataset.experimentChapter === chapter.id));
    find('announcement').textContent = `${chapter.label}. Step ${step + 1} of ${chapter.steps.length}. ${chapter.steps[step][0]}. ${chapter.steps[step][1]}`;
    find('motion-note').textContent = preference.matches ? 'Reduced motion is on. Use the step controls to explore every state without animation.' : 'Illustrative movement only. Timing and token spacing are not performance data.';
    setPlayback();
  };
  const schedule = () => {
    clearTimeout(timer);
    startedAt = performance.now();
    timer = setTimeout(() => {
      if (!playing || !allowed()) return pause();
      if (step === chapter.steps.length - 1 && !find('loop').checked) return pause('Sequence complete. Replay or choose another experiment.');
      step = (step + 1) % chapter.steps.length;
      render();
      schedule();
    }, remaining / speed);
  };
  const resume = () => {
    if (!allowed()) return;
    playing = true;
    for (const animation of animations) animation.play();
    if (handoff) {
      handoff.exit.play();
      handoff.enter.play();
      for (const animation of handoff.motion) animation.play();
    }
    for (const animation of textAnimations) if (animation.playState === 'paused') animation.play();
    setPlayback();
    schedule();
  };
  const select = (id, preview = false) => {
    const next = experimentState(id);
    pause();
    chapter = next.chapter;
    step = next.step;
    render();
    if (preview && allowed()) resume();
  };
  const chapterFromHash = () => {
    const id = location.hash.replace(/^#experiment-/, '');
    if (location.hash.startsWith('#experiment-') && chapters.some(item => item.id === id)) select(id);
  };
  root.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || !root.contains(button)) return;
    if (button.dataset.experimentChapter) { introduced = true; select(button.dataset.experimentChapter, true); return; }
    if (button === play) {
      introduced = true;
      if (playing) return pause('Sequence paused.');
      if (remaining <= 0) { step = 0; render(); }
      resume();
    } else if (button === find('replay')) {
      introduced = true;
      pause(); step = 0; render(); resume();
    } else if (button === find('previous') || button === find('next')) {
      introduced = true;
      const preview = playing;
      pause();
      step = experimentState(chapter.id, step + (button === find('next') ? 1 : -1)).step;
      render();
      if (preview) resume();
    }
  });
  range.addEventListener('input', () => { introduced = true; pause(); step = experimentState(chapter.id, Number(range.value)).step; render(false); });
  find('speed').addEventListener('change', event => {
    const nextSpeed = Number(event.target.value);
    if (![0.5, 1, 1.5, 2].includes(nextSpeed)) return;
    const wasPlaying = playing;
    pause();
    speed = nextSpeed;
    for (const animation of animations) animation.playbackRate = speed;
    if (wasPlaying) resume();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause('Sequence paused while the page is hidden.'); else setPlayback(); });
  preference.addEventListener('change', () => { pause(); render(false); });
  let visibilityFrame = 0;
  const checkVisibility = () => {
    visibilityFrame = 0;
    if (!allowed()) pause();
    else {
      setPlayback();
      if (!introduced) { introduced = true; resume(); }
    }
  };
  const queueVisibility = () => { if (!visibilityFrame) visibilityFrame = requestAnimationFrame(checkVisibility); };
  window.addEventListener('scroll', queueVisibility, { passive: true });
  window.addEventListener('resize', queueVisibility);
  window.addEventListener('hashchange', chapterFromHash);
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#experiment-"]');
    if (link && link.hash === location.hash) chapterFromHash();
  });
  find('controls').hidden = false;
  find('chapters').hidden = false;
  render();
  chapterFromHash();
  queueVisibility();
}
