// ========== YAHOO FINANCE API ==========
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url='
];
let currentProxy = 0;

const TICKER_RE = /^[\^A-Z0-9.\-]{1,12}$/i;

export function isValidTicker(ticker) {
  return typeof ticker === 'string' && TICKER_RE.test(ticker);
}

export async function yahooFetch(url) {
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    try {
      const proxyUrl = CORS_PROXIES[(currentProxy + i) % CORS_PROXIES.length] + encodeURIComponent(url);
      const res = await fetch(proxyUrl);
      if (res.ok) {
        currentProxy = (currentProxy + i) % CORS_PROXIES.length;
        const data = await res.json();
        if (data && typeof data === 'object') return data;
        return null;
      }
    } catch(e) { /* try next proxy */ }
  }
  return null;
}

export async function fetchQuote(ticker) {
  if (!isValidTicker(ticker)) return null;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=5d`;
  return await yahooFetch(url);
}

export async function fetchSummary(ticker) {
  if (!isValidTicker(ticker)) return null;
  const modules = 'price,summaryDetail,defaultKeyStatistics,financialData,earningsTrend';
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=${modules}`;
  return await yahooFetch(url);
}

export async function fetchChart(ticker, range = '3mo') {
  if (!isValidTicker(ticker)) return null;
  const interval = range === '5d' ? '15m' : '1d';
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=${interval}&range=${range}`;
  return await yahooFetch(url);
}
