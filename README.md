# RNA Fold Predictor (HTML/JS + Canvas)

Client-side RNA secondary structure predictor and visualizer with interactive canvas rendering.

## Run
Open `index.html` in a browser.

## Test
```bash
npm test
```

## Included examples
- Yeast tRNA-Phe
- 5S rRNA fragment
- Hammerhead ribozyme core
- Purine riboswitch aptamer fragment

## Visualization features
- Curved base-pair arcs with span-based visual emphasis.
- Hover + click-to-pin nucleotide inspection with partner/span details.
- Toggle controls for backbone, pair arcs, and residue labels.
- Canvas pan/zoom with reset view and PNG export.

## Notes
- Uses a Nussinov-style dynamic programming algorithm for base pairing.
- Visualization-focused upgrade roadmap is documented in `RNA_VISUALIZATION_UPGRADE_PLAN.md`.
