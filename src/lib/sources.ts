// Citation-ready sources for science notes.
// Maps a science-note title prefix to high-credibility links (PubMed/DOI/journals).

export interface Source {
  label: string;
  url: string;
}

const SOURCES: Record<string, Source[]> = {
  'BMR Calculation': [
    { label: 'Mifflin-St Jeor (Am J Clin Nutr, 1990)', url: 'https://pubmed.ncbi.nlm.nih.gov/2305711/' },
    { label: 'Katch-McArdle Exercise Physiology', url: 'https://www.lww.co.uk/9781496361226/exercise-physiology' },
  ],
  'TDEE & Activity Factor': [
    { label: 'Levine — NEAT (Science, 2005)', url: 'https://pubmed.ncbi.nlm.nih.gov/15681386/' },
    { label: 'Cunningham — RMR & FFM (Am J Clin Nutr, 1991)', url: 'https://pubmed.ncbi.nlm.nih.gov/1957828/' },
  ],
  'Protein Target': [
    { label: 'Morton et al. — Protein meta-analysis (BJSM, 2018)', url: 'https://pubmed.ncbi.nlm.nih.gov/28698222/' },
    { label: 'Helms et al. — Natural bodybuilding (JISSN, 2014)', url: 'https://pubmed.ncbi.nlm.nih.gov/24864135/' },
  ],
  'Caloric Deficit Strategy': [
    { label: 'Helms et al. — Contest prep nutrition (JISSN, 2014)', url: 'https://pubmed.ncbi.nlm.nih.gov/24864135/' },
    { label: 'Trexler — Metabolic adaptation (JISSN, 2014)', url: 'https://pubmed.ncbi.nlm.nih.gov/24571926/' },
  ],
  'Caloric Surplus Strategy': [
    { label: 'Iraki — Off-season nutrition (JISSN, 2019)', url: 'https://pubmed.ncbi.nlm.nih.gov/31200714/' },
    { label: 'Slater et al. — Hypertrophy nutrition (Sports Med, 2019)', url: 'https://pubmed.ncbi.nlm.nih.gov/31368029/' },
  ],
  'Body Recomposition Strategy': [
    { label: 'Barakat — Recomp review (Strength Cond J, 2020)', url: 'https://journals.lww.com/nsca-scj/Fulltext/2020/10000/Body_Recomposition__Can_Trained_Individuals_Build.2.aspx' },
    { label: 'Campbell et al. — Recomp in athletes (IJSNEM, 2020)', url: 'https://pubmed.ncbi.nlm.nih.gov/32422591/' },
  ],
  'Progressive Overload': [
    { label: 'Schoenfeld — Hypertrophy mechanisms (JSCR, 2010)', url: 'https://pubmed.ncbi.nlm.nih.gov/20847704/' },
    { label: 'Rhea et al. — Periodization meta (MSSE, 2003)', url: 'https://pubmed.ncbi.nlm.nih.gov/12618576/' },
  ],
};

export function getSourcesFor(noteTitle: string): Source[] {
  return SOURCES[noteTitle] ?? [];
}
