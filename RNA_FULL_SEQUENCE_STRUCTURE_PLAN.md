# Full-Sequence RNA Structure Prediction & Visualization Plan

## Objective
Extend the app from basic pair visualization to **full-sequence structure analysis** with explicit motif detection and rendering, including:
- hairpins
- internal loops
- bulges
- multibranch joints (junctions)
- pseudoknots/knots (visual + optional constrained prediction)

Also expand built-in examples so users can quickly inspect different motif classes.

---

## 1) Product Scope

### In scope (next major upgrade)
1. Predict structure for full RNA input and classify motif regions.
2. Visualize motifs with distinct geometry and color semantics.
3. Add richer per-motif metadata panel and interaction.
4. Expand example library to cover canonical motif families.

### Out of scope (for first pass)
- 3D tertiary modeling.
- Full thermodynamic pseudoknot search at very long lengths without backend support.

---

## 2) Prediction Architecture Upgrade

### 2.1 Dual-mode predictor
Implement a two-track prediction system:
1. **Fast client mode (default)**
   - Nussinov/energy-lite approach for fast feedback and larger sequence interactivity.
2. **Accurate mode (optional)**
   - Backend or WASM integration (e.g., ViennaRNA-like folding output).
   - Optional pseudoknot-capable engine for knot-rich examples.

### 2.2 Unified structure graph format
Define a shared output format for rendering and motif parsing:
- `sequence: string`
- `pairs: Array<[i, j]>`
- `dotBracket: string` (extended brackets for pseudoknots where needed)
- `motifs: Motif[]`
- `stems: Stem[]`
- `metadata: { score, mfe?, algorithm, runtimeMs, warnings[] }`

### 2.3 Motif detection pass
After pair generation, run a deterministic parser to annotate:
- **Hairpin loop**: terminal loop enclosed by one stem end.
- **Internal loop**: unpaired residues on both sides between paired stem segments.
- **Bulge**: unpaired residues on one side only.
- **Multibranch joint/junction**: 3+ stem branches.
- **External loop**: unpaired regions outside enclosed stems.
- **Pseudoknot/knot**: crossing pairs in index order.

---

## 3) Visualization Upgrade Plan

### 3.1 Layout modes
Provide user-selectable layouts:
1. **Circular overview** (current default) for global pair distribution.
2. **Stem-loop radial layout** for motif readability.
3. **Linear arc diagram mode** to inspect long-range pairs and crossing knots.

### 3.2 Motif-aware rendering
- Hairpins: loop caps/highlighted loop polygons.
- Internal loops: paired stem blocks with bilateral loop shading.
- Bulges: asymmetric side markers.
- Junctions: central nodes with branch spokes.
- Knots/pseudoknots: dedicated color family + crossing emphasis.

### 3.3 Interaction model
- Hover nucleotide -> show motif membership + paired partner.
- Hover motif -> highlight full motif extent and connected stems.
- Click motif -> pin details panel (type, span, size, stems, estimated stability).
- Filters: show/hide motif classes.

### 3.4 Accessibility and clarity
- Distinct palettes for motif types (colorblind-safe set).
- Adjustable label density for long sequences.
- Legend keyed to motif class and pair type.

---

## 4) Motif Analytics Panel

Add a side panel summarizing structure content:
- total stems
- hairpin count + loop sizes
- internal loop count
- bulge count
- junction count
- pseudoknot count
- largest loop, longest stem

Allow clicking each summary entry to select corresponding motifs on canvas.

---

## 5) Expanded Example Library

Increase built-in examples from a few demo fragments to a broader curated set covering motif diversity.

### 5.1 Required example categories
1. tRNA (cloverleaf, multiple hairpins/junction-like connectivity)
2. 5S rRNA segment (mixed stems/internal loops)
3. Hammerhead ribozyme (junction motif)
4. Purine riboswitch aptamer (loop-rich compact fold)
5. SRP RNA fragment (internal loops and long helices)
6. RNase P fragment (multibranch architecture)
7. Telomerase RNA motif fragment (bulges/internal loops)
8. Viral frameshift stimulatory pseudoknot (knot example)
9. HCV IRES domain fragment (complex loops/junctions)
10. Group I intron core fragment (multi-branch regions)

### 5.2 Example metadata schema
For each example store:
- `id`, `name`, `organism/context`
- `sequence`
- `expected motifs` (tags)
- `length`
- `notes`
- optional `reference dot-bracket`

### 5.3 UX additions for examples
- Search examples by motif tags (e.g., `hairpin`, `pseudoknot`).
- “Load + center first motif” action.
- Include one-line educational context for each example.

---

## 6) Engineering Work Breakdown

### Phase 1: Data + parser foundations
- Implement motif parser from pair list.
- Add motif data structures + tests.

### Phase 2: Renderer evolution
- Add motif overlays and legend.
- Add motif selection/filter interactions.

### Phase 3: Layout expansion
- Add radial and linear arc layouts.
- Add layout switcher and animated transitions.

### Phase 4: Accuracy upgrades
- Add optional high-accuracy predictor integration.
- Add pseudoknot-aware import path.

### Phase 5: Example expansion
- Add 10+ curated examples with tags and notes.
- Add example search/filter UI.

---

## 7) Testing & Validation Plan

### Unit tests
- Motif classification correctness from known pair maps.
- Crossing-pair detection for pseudoknots.
- Example metadata validation.

### Golden/reference tests
- Compare motif counts against curated expected outputs.
- Snapshot test motif panel summaries.

### Visual regression
- Per-example screenshots in each layout mode.
- Verify motif colors, labels, and highlight states.

### Performance benchmarks
- Time-to-predict and time-to-render for lengths: 100, 300, 600, 1000.
- Interaction FPS checks during pan/zoom with motif overlays enabled.

---

## 8) Delivery Milestones

1. **M1**: Motif parser + motif data model + tests.
2. **M2**: Motif-aware canvas overlays + legend + hover details.
3. **M3**: Radial + arc layouts + layout switcher.
4. **M4**: Expanded example set and motif-tag search.
5. **M5**: Optional high-accuracy/pseudoknot prediction integration.

---

## 9) Immediate Next Implementation Checklist

- [ ] Add `motifParser.js` with motif detection functions.
- [ ] Define `Motif` and `Stem` types/interfaces (JSDoc).
- [ ] Add motif summary panel in UI.
- [ ] Add motif legend and filter controls.
- [ ] Add layout mode selector (circular/radial/arc).
- [ ] Add 10+ curated examples with motif tags.
- [ ] Add tests for motif detection and example schema.
- [ ] Add visual regression screenshot script.
