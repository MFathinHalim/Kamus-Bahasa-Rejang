const consonants = [
  "b",
  "c",
  "d",
  "g",
  "h",
  "j",
  "k",
  "l",
  "m",
  "n",
  "p",
  "q",
  "r",
  "s",
  "t",
  "v",
  "w",
  "y",
];

/**
 * ai:
 * bai -> Ab
 * lai -> Al
 */
function buildAiRules(chars: string[]): [string, string][] {
  return chars.map((c) => [`${c}ai`, `__A${c.toUpperCase()}__`]);
}

/**
 * au:
 * bau -> Ub
 * lau -> Ul
 */
function buildAuRules(chars: string[]): [string, string][] {
  return chars.map((c) => [`${c}au`, `__U${c.toUpperCase()}__`]);
}

/**
 * finalize placeholder
 */
function buildFinalizeRules(chars: string[]): [string, string][] {
  return chars.flatMap((c) => [
    [`__A${c.toUpperCase()}__`, `A${c}`],
    [`__U${c.toUpperCase()}__`, `U${c}`],
  ]);
}

const aiRules = buildAiRules(consonants);
const auRules = buildAuRules(consonants);
const finalizeRules = buildFinalizeRules(consonants);

const rules: [string, string][] = [
  // diftong
  ...aiRules,
  ...auRules,

  // pasangan awal
  ["nd", "Dx"],
  ["mb", "Bx"],
  ["nj", "Jx"],
  ["ngg", "Gx"],
  ["ngk", "Qx"],
  ["nc", "Cx"],
  ["nt", "Tx"],
  ["mp", "Px"],
  ["gh", "qx"],
  ["ng", "F"],
  ["ny", "v"],

  // nasal
  ["n", "N"],

  // khusus
  ["eak", "K"],

  // konsonan dasar
  ["k", "kx"],
  ["g", "gx"],
  ["t", "tx"],
  ["d", "dx"],
  ["p", "px"],
  ["b", "bx"],
  ["m", "M"],
  ["c", "cx"],
  ["j", "jx"],
  ["s", "sx"],
  ["r", "rx"],
  ["l", "lx"],
  ["y", "yx"],
  ["w", "wx"],
  ["h", "hx"],

  // vokal
  ["i", "ia"],
  ["u", "ua"],
  ["e", "ea"],
  ["o", "oa"],

  // normalisasi M
  ["Ma", "m"],
  ["Mia", "im"],
  ["Mua", "um"],
  ["Mea", "em"],
  ["Moa", "om"],

  // normalisasi N
  ["Na", "n"],
  ["Nia", "in"],
  ["Nua", "un"],
  ["Nea", "en"],
  ["Noa", "on"],

  // normalisasi F
  ["Fa", "f"],
  ["Fia", "if"],
  ["Fua", "uf"],
  ["Fea", "ef"],
  ["Foa", "of"],
];

function buildFamily(symbol: string, base: string): [string, string][] {
  return [
    // vokal
    [`${symbol}xa`, base],
    [`${symbol}xia`, `i${base}`],
    [`${symbol}xua`, `u${base}`],
    [`${symbol}xea`, `e${base}`],
    [`${symbol}xoa`, `o${base}`],

    // pasangan F
    [`${base}F`, `F${base}`],
    [`i${base}F`, `Fi${base}`],
    [`u${base}F`, `Fu${base}`],
    [`e${base}F`, `Fe${base}`],
    [`o${base}F`, `Fo${base}`],

    // pasangan K
    [`${symbol}xK`, `${base}K`],

    // pasangan N
    [`${base}N`, `N${base}`],
    [`i${base}N`, `Ni${base}`],
    [`u${base}N`, `Nu${base}`],
    [`e${base}N`, `Ne${base}`],
    [`o${base}N`, `No${base}`],

    // pasangan M
    [`${base}M`, `M${base}`],
    [`i${base}M`, `Mi${base}`],
    [`u${base}M`, `Mu${base}`],
    [`e${base}M`, `Me${base}`],
    [`o${base}M`, `Mo${base}`],
  ];
}

const generatedRules: [string, string][] = [
  ...buildFamily("t", "t"),
  ...buildFamily("b", "b"),
  ...buildFamily("c", "c"),
  ...buildFamily("d", "d"),
  ...buildFamily("j", "j"),
  ...buildFamily("k", "k"),
  ...buildFamily("g", "g"),
  ...buildFamily("s", "s"),
  ...buildFamily("r", "r"),
  ...buildFamily("l", "l"),
  ...buildFamily("y", "y"),
  ...buildFamily("w", "w"),
  ...buildFamily("h", "h"),
  ...buildFamily("p", "p"),

  // spesial kapital
  ...buildFamily("B", "B"),
  ...buildFamily("J", "J"),
  ...buildFamily("G", "G"),
  ...buildFamily("Q", "Q"),
  ...buildFamily("C", "C"),
  ...buildFamily("T", "T"),
  ...buildFamily("P", "P"),
  ...buildFamily("D", "D"),
  ...buildFamily("q", "q"),
  ...buildFamily("v", "v"),
];

const allRules: [string, string][] = [
  ...rules,
  ...generatedRules,
  ...finalizeRules,
];

function applyRules(text: string, rules: [string, string][]): string {
  for (const [from, to] of rules) {
    text = text.replaceAll(from, to);
  }

  return text;
}

export default function kaganga(text: string): string {
  text = text.toLowerCase();

  return applyRules(text, allRules);
}
