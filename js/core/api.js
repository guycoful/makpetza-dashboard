// ========== YAHOO FINANCE API ==========
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url='
];
let currentProxy = 0;

export async function yahooFetch(url) {
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    try {
      const proxyUrl = CORS_PROXIES[(currentProxy + i) % CORS_PROXIES.length] + encodeURIComponent(url);
      const res = await fetch(proxyUrl);
      if (res.ok) {
        currentProxy = (currentProxy + i) % CORS_PROXIES.length;
        return await res.json();
      }
    } catch(e) { /* try next proxy */ }
  }
  return null;
}

export async function fetchQuote(ticker) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=5d`;
  return await yahooFetch(url);
}

export async function fetchSummary(ticker) {
  const modules = 'price,summaryDetail,defaultKeyStatistics,financialData,earningsTrend';
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=${modules}`;
  return await yahooFetch(url);
}

export async function fetchChart(ticker, range = '3mo') {
  const interval = range === '5d' ? '15m' : '1d';
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=${interval}&range=${range}`;
  return await yahooFetch(url);
}
