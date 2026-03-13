# RNA Folding Web App Plan (HTML/JS + Canvas)

## 1) Goals and Scope
- Build a browser-based app that predicts RNA secondary structure from a user-provided RNA sequence.
- Visualize the folded RNA on an HTML `<canvas>` element.
- Keep first version fully client-side (no mandatory backend), then optionally add server-based advanced prediction.

## 2) MVP Feature Set
1. **Sequence Input**
   - Text area for RNA sequence (A, U, G, C).
   - Validation (invalid characters, sequence length limits).
2. **Fold Prediction**
   - MVP algorithm options:
     - Start with a simple Nussinov-style dynamic programming implementation in JavaScript.
     - Optionally support energy-based constraints later.
3. **Canvas Visualization**
   - Draw nucleotides as nodes along a path/circle.
   - Draw base pairs as arcs/lines.
   - Color coding by base type and/or pair type.
4. **Result Panel**
   - Dot-bracket notation output.
   - Basic metrics (length, number of pairs, predicted score).
5. **Interaction**
   - Zoom and pan on canvas.
   - Hover/select nucleotide to highlight paired base.

## 3) Technical Architecture
### Frontend Stack
- Vanilla HTML/CSS/JavaScript (no framework required for MVP).
- Modules:
  - `input.js`: parsing + validation.
  - `folding.js`: RNA folding algorithm(s).
  - `layout.js`: coordinate generation for drawing.
  - `render.js`: canvas draw logic + interaction handlers.
  - `app.js`: orchestrates UI actions and state.

### Data Model
- `sequence: string`
- `pairs: Array<[i, j]>` (0-based indices)
- `dotBracket: string`
- `layout: Array<{x: number, y: number}>`
- `meta: { score?: number, algorithm: string, runtimeMs: number }`

### Optional Backend (Future)
- Add API integration for stronger predictors (e.g., ViennaRNA service wrapper).
- Keep frontend contract stable with JSON response format identical to client-side model.

## 4) Folding Algorithm Roadmap
1. **Phase A (MVP)**
   - Implement Nussinov DP with valid pair rules (A-U, G-C, optional G-U wobble).
   - Traceback to produce base-pair list.
   - Convert pair list to dot-bracket notation.
2. **Phase B**
   - Add minimum loop length constraint.
   - Add optional wobble toggle.
3. **Phase C**
   - Add nearest-neighbor energy model or backend integration for better thermodynamics.

## 5) Canvas Visualization Roadmap
1. **Layout Strategy**
   - Start with circular layout for simplicity and readability.
   - Later add force-directed / radial stem-loop layout.
2. **Drawing Pipeline**
   - Clear canvas.
   - Draw backbone edges in sequence order.
   - Draw pair edges (arc/line style distinct from backbone).
   - Draw base nodes + labels.
3. **Interactivity**
   - Hit testing for node hover.
   - Tooltip with index/base/pair partner.
   - Highlight selected stem.

## 6) UX Design Plan
- Simple one-page layout:
  - Left panel: input + algorithm options + "Predict Fold" button.
  - Right panel: canvas visualization.
  - Bottom or side area: dot-bracket and metadata.
- Include examples (short RNA sequences) with one-click load.
- Add loading/progress state for long sequences.
- Add friendly validation and error messages.

## 7) Performance & Limits
- MVP recommended sequence limit: 300-500 nt for pure JS DP responsiveness.
- Use typed arrays where useful for DP matrix memory efficiency.
- Defer expensive redraws via `requestAnimationFrame`.
- Add warning when input exceeds tested limits.

## 8) Validation & Testing Plan
1. **Unit Tests**
   - Pairing rules.
   - DP recurrence outputs on known toy sequences.
   - Dot-bracket conversion correctness.
2. **Integration Tests**
   - End-to-end flow: input -> fold -> render state.
3. **Visual Checks**
   - Confirm arcs/nodes align and interactions work.
4. **Reference Checks**
   - Compare outputs for known sequences against trusted tool results for sanity.

## 9) Project Milestones
1. **Milestone 1 (1-2 days)**
   - Basic UI shell + input validation.
2. **Milestone 2 (2-4 days)**
   - Nussinov implementation + dot-bracket output.
3. **Milestone 3 (2-3 days)**
   - Canvas rendering with circular layout.
4. **Milestone 4 (2-3 days)**
   - Interactivity (hover/select/zoom/pan).
5. **Milestone 5 (1-2 days)**
   - Testing, polish, sample presets, docs.

## 10) Stretch Features
- Animate folding transitions.
- Export to PNG/SVG and CT/BPSEQ-like data formats.
- Multi-structure comparison mode.
- Overlay confidence/energy annotations.

## 11) First Implementation Checklist
- [ ] Create `index.html` with input panel, controls, output panel, and `<canvas>`.
- [ ] Add sequence validator and normalization (uppercase, U/T handling policy).
- [ ] Implement MVP folding algorithm and traceback.
- [ ] Implement dot-bracket generator.
- [ ] Implement circular layout generator.
- [ ] Implement canvas renderer for backbone, pairs, and bases.
- [ ] Add interaction handlers (hover, select, zoom, pan).
- [ ] Add sample sequences + reset button.
- [ ] Add tests for algorithm core.
- [ ] Document usage and limitations.
