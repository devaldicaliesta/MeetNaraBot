// Small talk ("halo", "terima kasih", "kamu siapa?") never matches the document, so without this
// the retrieval gate would answer a greeting with the refusal message. These messages are caught
// before retrieval and answered from fixed, bilingual templates: no LLM call, no quota, instant.
// Only short messages that consist of small talk alone are caught; "halo, berapa biayanya?" still
// goes through the normal RAG pipeline.

import type { Lang } from './settings';

export type SmallTalkKind = 'greeting' | 'thanks' | 'bye' | 'identity' | 'ack';

// Each pattern must match the WHOLE normalised message. `lang` is set only when the wording is
// clearly one language; otherwise the visitor's interface language is used (Indonesian visitors
// often type "hi", "thanks" or "ok" too).
const PATTERNS: { kind: SmallTalkKind; lang: Lang | null; re: RegExp }[] = [
  // Indonesian greetings, with optional polite address terms (kak, min, pak, bu, ...).
  { kind: 'greeting', lang: 'id', re: /^(?:(?:hai+|hay|halo+|hallo+|helo+|alo+|permisi|punten|tes|test|ping|p|assalamu ?alaikum(?: wr wb)?|asalamualaikum|salam|selamat (?:pagi|siang|sore|malam)|pagi|siang|sore|malam|met (?:pagi|siang|sore|malam))(?: (?:kak|ka|kakak|min|mimin|admin|bot|pak|bu|bang|mas|mbak|sis|gan|semua|semuanya|bro|sob))*)$/ },
  { kind: 'greeting', lang: null, re: /^(?:(?:hi+|hello+|hey+|heya|hiya|yo|good (?:morning|afternoon|evening|day)|greetings|howdy)(?: (?:there|bot|everyone|all|team))*)$/ },
  { kind: 'greeting', lang: 'id', re: /^(?:apa kabar|gimana kabar(?:nya)?|kabar(?:nya)? (?:gimana|bagaimana)|(?:hai|halo) apa kabar)(?: (?:kak|min|bot))?$/ },
  { kind: 'greeting', lang: 'en', re: /^(?:how are you(?: doing)?|how is it going|hows it going|whats up|sup)$/ },
  // "I'd like to ask something" with no actual question yet.
  { kind: 'greeting', lang: 'id', re: /^(?:(?:hai|halo|hallo|permisi|selamat (?:pagi|siang|sore|malam))(?: (?:kak|min|pak|bu|bot))? )?(?:(?:saya|aku|sy) )?(?:mau|boleh|ingin|izin|ijin|pengen|pingin) (?:tanya|bertanya|nanya)(?: (?:dong|nih|ya|kak|min|pak|bu|sesuatu|boleh))*$/ },
  { kind: 'greeting', lang: 'en', re: /^(?:(?:hi|hello|hey) )?(?:i have a question|can i ask (?:you )?(?:a question|something)|i want to ask (?:a question|something))$/ },
  // Thanks
  { kind: 'thanks', lang: 'id', re: /^(?:(?:oke |ok |baik |sip )?(?:terima ?kasih|makasih|makasi|trims|trimakasih|tengkyu|matur nuwun|hatur nuhun|thx|tq|ty)(?: (?:banyak|ya|yah|kak|ka|min|bot|ya kak|ya min|atas (?:infonya|informasinya|bantuannya)|infonya|bantuannya))*)$/ },
  { kind: 'thanks', lang: null, re: /^(?:(?:ok |okay |great |cool )?(?:thanks|thank you|thank u|thx|ty|cheers|much appreciated)(?: (?:so much|a lot|very much|again|bot))*)$/ },
  // Goodbyes
  { kind: 'bye', lang: 'id', re: /^(?:dadah|dah|da+h|sampai jumpa(?: lagi)?|sampai ketemu(?: lagi)?|selamat tinggal|pamit(?: dulu)?)(?: (?:kak|min|bot|ya))*$/ },
  { kind: 'bye', lang: 'en', re: /^(?:bye+|goodbye|good bye|see (?:you|ya)(?: later)?|later|cya)(?: (?:bot|then))*$/ },
  // Questions about the bot itself
  { kind: 'identity', lang: 'id', re: /^(?:(?:kamu|anda|ini) siapa|siapa (?:kamu|anda|ini)|kamu (?:itu )?apa|(?:kamu|anda) bisa (?:apa|bantu apa)(?: saja| aja)?|bisa bantu apa(?: saja| aja)?|apa yang bisa (?:kamu|anda) (?:bantu|lakukan)|bisa tanya apa(?: saja| aja)?|aku bisa tanya apa(?: saja| aja)?|ini bot apa|bot apa ini|apa ini)$/ },
  { kind: 'identity', lang: 'en', re: /^(?:who are you|what are you|who is this|what is this|what can you do|what can i ask(?: you)?|how can you help(?: me)?|what do you do)$/ },
  // Bare acknowledgements
  { kind: 'ack', lang: 'id', re: /^(?:ok(?= )|oke+|okey|baik|baiklah|sip+|siap|mantap|mantab|noted|paham|oh begitu|oh gitu|ohh?|o+h? (?:ok|oke)|wah|hmm+|iya|ya+|yap|yup)(?: (?:kak|min|bot|deh|dong|ya))*$/ },
  { kind: 'ack', lang: null, re: /^(?:okay|ok|alright|got it|i see|cool|nice|great|sure|yes|yeah|yep)$/ },
];

/** Lowercases, strips diacritics, punctuation and emoji, and squeezes whitespace. */
function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/[’'`]/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function detectSmallTalk(question: string): { kind: SmallTalkKind; lang: Lang | null } | null {
  const q = normalise(question);
  if (!q || q.length > 60 || q.split(' ').length > 7) return null;
  for (const p of PATTERNS) if (p.re.test(q)) return { kind: p.kind, lang: p.lang };
  return null;
}

export function smallTalkReply(kind: SmallTalkKind, lang: Lang, name: string, document: string, examples: string[]): string {
  const en = lang === 'en';
  const doc = `**${document}**`;
  const ex = examples.slice(0, 3).filter(Boolean);
  const tryList = ex.length ? (en ? '\n\nYou could ask, for example:\n' : '\n\nKamu bisa tanya, misalnya:\n') + ex.map((q) => `- ${q}`).join('\n') : '';
  switch (kind) {
    case 'greeting':
      return en
        ? `Hi, I'm **${name}**. I answer questions about ${doc}, using only what the document says and showing the source. What would you like to know?${tryList}`
        : `Halo, aku **${name}**. Aku menjawab pertanyaan seputar ${doc}, hanya dari isi dokumennya dan lengkap dengan sumbernya. Ada yang ingin kamu tanyakan?${tryList}`;
    case 'identity':
      return en
        ? `I'm **${name}**, an assistant that answers from ${doc}. Every answer comes with numbered sources so you can check it. If something isn't in the document, I'll tell you plainly.${tryList}`
        : `Aku **${name}**, asisten yang menjawab dari ${doc}. Setiap jawaban disertai nomor sumber supaya bisa kamu cek. Kalau informasinya tidak ada di dokumen, aku akan bilang terus terang.${tryList}`;
    case 'thanks':
      return en
        ? 'You\'re welcome. Ask me anything else about the document whenever you need to.'
        : 'Sama-sama. Kalau ada hal lain tentang dokumen ini yang ingin kamu tanyakan, silakan saja.';
    case 'bye':
      return en ? 'Goodbye, and thanks for stopping by. Come back any time you have a question.' : 'Sampai jumpa, terima kasih sudah mampir. Silakan kembali kapan saja kalau ada pertanyaan.';
    case 'ack':
    default:
      return en ? 'Got it. Is there anything else you\'d like to ask about the document?' : 'Baik. Ada lagi yang ingin kamu tanyakan tentang dokumen ini?';
  }
}
