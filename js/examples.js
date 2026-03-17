export const RNA_EXAMPLES = [
  {
    id: 'trna_phe',
    label: 'Yeast tRNA-Phe (classic cloverleaf)',
    sequence: 'GCGGAUUUAGCUCAGUUGGGAGAGCGCCAGACUGAAGAUCUGGAGGUCCUGUGUUCGAUCCACAGAAUUCGCACCA',
    note: 'Transfer RNA example with a well-known cloverleaf secondary structure.',
  },
  {
    id: '5s_rrna_frag',
    label: '5S rRNA fragment',
    sequence: 'GGUCCGAUAGCUCAGUUGGUAGAGCACCGUGAUUCGAAUCAUCACGGUUCGAUCCCGGCU',
    note: 'rRNA-derived fragment showing multiple compact helical segments.',
  },
  {
    id: 'hammerhead',
    label: 'Hammerhead ribozyme core',
    sequence: 'CUGAUGAGUCCGUGAGGACGAAACUCGGUGAAGCU',
    note: 'Catalytic RNA core motif often used in RNA structure studies.',
  },
  {
    id: 'purine_riboswitch_frag',
    label: 'Purine riboswitch aptamer fragment',
    sequence: 'GGGAAAUCCCGAAAGGGCCCUUGAAACCC',
    note: 'Short aptamer-like fragment with stem-loop dominated architecture.',
  },
];

export function getExampleById(id) {
  return RNA_EXAMPLES.find((example) => example.id === id) ?? RNA_EXAMPLES[0];
}
