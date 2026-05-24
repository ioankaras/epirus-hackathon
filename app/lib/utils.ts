const GREEKLISH_MAP: [string, string][] = [
  // digraphs must come before single chars
  ["th", "θ"], ["ph", "φ"], ["ps", "ψ"], ["ks", "ξ"], ["ch", "χ"],
  ["ou", "ου"], ["mp", "μπ"], ["nt", "ντ"], ["gk", "γκ"],
  // single chars
  ["a", "α"], ["b", "β"], ["c", "κ"], ["d", "δ"], ["e", "ε"],
  ["f", "φ"], ["g", "γ"], ["h", "η"], ["i", "ι"], ["j", "τζ"],
  ["k", "κ"], ["l", "λ"], ["m", "μ"], ["n", "ν"], ["o", "ο"],
  ["p", "π"], ["q", "κ"], ["r", "ρ"], ["s", "σ"], ["t", "τ"],
  ["u", "υ"], ["v", "β"], ["w", "ω"], ["x", "χ"], ["y", "υ"],
  ["z", "ζ"],
];

const PHONETIC_MAP: [string, string][] = [
  ["ει", "ι"], ["οι", "ι"], ["υι", "ι"], ["αι", "ε"],
  ["ω", "ο"], ["η", "ι"], ["υ", "ι"], ["ς", "σ"],
];

function phoneticNormalize(s: string): string {
  let r = s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  for (const [from, to] of PHONETIC_MAP) r = r.replaceAll(from, to);
  return r;
}

export function matchesContactSearch(name: string, query: string): boolean {
  if (!query) return true;
  const normName = phoneticNormalize(name);
  const normQuery = phoneticNormalize(query);
  if (normName.includes(normQuery)) return true;
  if (/[a-z]/.test(normQuery)) {
    let greek = normQuery;
    for (const [lat, gr] of GREEKLISH_MAP) greek = greek.replaceAll(lat, gr);
    return normName.includes(phoneticNormalize(greek));
  }
  return false;
}

export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("el-GR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("el-GR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatTransactionDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("el-GR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("el-GR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
