/**
 * Post-generation grounding checks and document-language detection. Pure functions, no AI calls.
 */

export type CitationCheck = {
  /** The answer with every citation that points at a non-existent excerpt removed. */
  text: string;
  /** Citation numbers that were removed because no such excerpt was sent. */
  removed: number[];
  /** Valid citation numbers that remain, in order of first use. */
  cited: number[];
  /** True when at least one valid citation remains. */
  grounded: boolean;
};

/**
 * Keeps only citations [1]..[passageCount]. Up to three digits, so a bracketed year such as
 * "[2024]" is never touched. An answer with no valid citation left is reported as ungrounded.
 */
export function checkCitations(answer: string, passageCount: number): CitationCheck {
  const removed = new Set<number>();
  const cited: number[] = [];
  const text = answer
    .replace(/[ \t]?\[(\d{1,3})\]/g, (m, d) => {
      const n = Number(d);
      if (n >= 1 && n <= passageCount) {
        if (!cited.includes(n)) cited.push(n);
        return m;
      }
      removed.add(n);
      return '';
    })
    // A removed citation can leave "kalimat ." behind.
    .replace(/[ \t]+([.,;:!?])/g, '$1');
  return { text: removed.size ? text : answer, removed: [...removed], cited, grounded: cited.length > 0 };
}

const ID_WORDS = new Set('yang dan di ke dari untuk dengan pada adalah ini itu atau juga tidak akan dalam oleh sebagai dapat bisa harus kami anda'.split(' '));
const EN_WORDS = new Set('the and of to is are for with that this from by be or not will can you your our on as it an'.split(' '));

/** Rough document language from its most common function words: 'en' or 'id'. */
export function detectDocLang(texts: string[]): 'id' | 'en' {
  let id = 0,
    en = 0;
  for (const t of texts) {
    for (const w of t.toLowerCase().match(/\p{L}+/gu) || []) {
      if (ID_WORDS.has(w)) id++;
      else if (EN_WORDS.has(w)) en++;
    }
  }
  return en >= 20 && en > id * 1.5 ? 'en' : 'id';
}
