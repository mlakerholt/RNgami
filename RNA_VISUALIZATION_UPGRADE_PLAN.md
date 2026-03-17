# RNA Visualization Upgrade Plan

## Goal
Make the RNA viewer easier to interpret by emphasizing structural motifs (stems, loops, long-range pairs) and by adding curated examples from well-known RNAs.

## 1) Visualization Priorities
1. **Better pair rendering**
   - Replace straight pair segments with smooth curved links.
   - Vary curve opacity by pair span (long-range interactions become more visible).
2. **Structural context overlays**
   - Show stem/loop segmentation derived from pair map.
   - Highlight selected nucleotide, its pair partner, and local neighborhood.
3. **Readability controls**
   - Toggle nucleotide labels.
   - Toggle pair links/backbone independently.
   - Add color themes (base identity vs paired/unpaired).
4. **Scalable layouts**
   - Keep circular layout as default.
   - Add a radial stem-loop layout mode for larger RNAs.

## 2) Interaction Upgrades
- Hover: show index, residue, partner, and pair distance.
- Click: pin selection so users can inspect base-pair context.
- Zoom presets: fit-to-structure, 1x, and detail mode.
- Export snapshot to PNG.

## 3) Example Library Expansion
Ship built-in examples (sequence + short context note):
- Yeast tRNA-Phe (classical cloverleaf architecture).
- 5S rRNA fragment (compact helical segments).
- Hammerhead ribozyme core motif.
- Purine riboswitch aptamer fragment.

Each example should:
- Autoload in one click.
- Include expected structural characteristics in a short note.
- Be suitable for quick visual demo (<150 nt for responsiveness).

## 4) Algorithm/Model Extensions (Post-MVP)
- Optional constraints mode for forced base pairs.
- Optional external prediction import (dot-bracket input).
- Pseudoknot display layer (visual only) for future algorithm support.

## 5) Quality & Validation
- Unit tests for example loading and parser validation.
- Visual regression screenshots for each built-in example.
- Manual QA checklist for hover, zoom, pan, and selection states.

## 6) Delivery Milestones
1. Curved pair links + example selector + notes.
2. Label and overlay toggles.
3. Selection pinning + export image.
4. Alternate layout mode + visual polish.
