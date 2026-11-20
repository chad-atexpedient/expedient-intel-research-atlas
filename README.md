# Expedient + Intel Research Atlas

A public, work-in-progress field report exploring large-model inference on four Intel Arc Pro B70 GPUs with Qwen3.8-Flash-Next.

**Thank you to the Intel team for loaning the gear and making this joint research possible.**

The atlas brings together dated findings, conceptual experiment animations, a research journal, and curated source notes. It is not a live view of the hardware, a product performance guarantee, or a deployment recommendation.

## Read the evidence with its limits

- Measurement validity, research findings, and deployment eligibility are separate judgments.
- The featured Q6/Q4 chart preserves a historical matched comparison. Later observations do not silently replace its values.
- The animations illustrate mechanisms; their timing, packet counts, and geometry are not recorded traces or telemetry.
- Failed checks, negative results, and limitations remain part of the record.
- `research.json` separates the historical numeric `snapshot` from the latest `reviewedThrough` evidence cutoff. Neither represents live status.
- This public repository contains authored website files and curated evidence only. The underlying research repository, raw artifacts, operational configuration, and working notes remain private and are not fetched by the site.

## Run locally

No package installation, framework, or build pipeline is required.

```sh
python -I -m http.server 8086 --bind 127.0.0.1
```

Open http://127.0.0.1:8086. Use HTTP rather than opening the HTML as a local file, so the browser can load `research.json`.

The core narrative, historical chart, source disclosures, and a journal fallback remain readable without JavaScript.

## Checks

Use a current Node.js release with native ES module support (Node 24 or newer recommended):

```sh
node check.mjs
node --check app.js
node --check experiments.js
```

These checks cover curated measurement invariants, comparison arithmetic, input rejection, archive filtering, source/scene links, static anchors, local assets, and basic privacy guards. They do not replace evidence review or human visual review.

## Maintain the atlas

- `index.html`: page structure, current briefing, and static fallback content.
- `research.json`: curated sources and dated journal entries, newest first.
- `app.js`: safe text-node rendering, comparison controls, compact journal, and deep links.
- `experiments.js`: conceptual SVG scenes and motion controls.
- `styles.css`: responsive Expedient presentation.
- `assets/`: local logos, fonts, and illustrative infrastructure photography.

Keep observations, sample/workload bases, limitations, and provenance together. Update the static fallback and focused assertions whenever a claim changes. Never copy entire private exports, prompts, generated responses, credentials, process identifiers, or raw logs into this repository.

New sources need both a `research.json` entry, an ordering entry in `app.js`, and a static disclosure anchor in `index.html`. Bump local script/style version URLs only when those files change.

## Publication

GitHub Pages serves this static repository from the root of `main`, using GitHub's built-in Pages publishing. No custom workflow or build dependency is needed. The repository contains only reviewed site files, assets, checks, and public documentation.

Run the checks above before pushing. Future pushes to `main` publish a new site version. Research updates in a separate private workspace do **not** automatically publish here: only reviewed, explicitly promoted changes should be pushed.

The page retains `noindex, nofollow` while research continues. **That is not access control:** this repository and its Pages site are public, and content may be copied or cached.

## Assets and review limitations

See [NOTICE.md](NOTICE.md) and the bundled font licenses for attribution and rights boundaries. Infrastructure photography is illustrative, not a photograph of the loaned hardware.

Content and interaction checks have passed locally, including responsive overflow checks. Automated screenshot capture was unavailable during the latest visual pass; no independent visual or partner-approval sign-off is claimed by this repository.
