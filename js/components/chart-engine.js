// ========== CANDLESTICK CHART ENGINE ==========
import { yahooFetch } from '../core/api.js';

// Fetch chart data from Yahoo Finance
export async function fetchChartData(ticker, range) {
  const interval = '1d';
  const url = 'https://query1.finance.yahoo.com/v8/finance/chart/' + ticker + '?range=' + range + '&interval=' + interval;
  const data = await yahooFetch(url);
  if (!data || !data.chart || !data.chart.result) return null;
  const r = data.chart.result[0];
  const ts = r.timestamp || [];
  const q = r.indicators.quote[0];
  const candles = [];
  for (let i = 0; i < ts.length; i++) {
    if (q.open[i] == null) continue;
    candles.push({
      date: new Date(ts[i] * 1000),
      open: q.open[i], high: q.high[i], low: q.low[i], close: q.close[i],
      volume: q.volume[i] || 0
    });
  }
  return candles;
}

// Calculate Moving Average
export function calcMA(candles, period) {
  const ma = [];
  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) { ma.push(null); continue; }
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += candles[j].close;
    ma.push(sum / period);
  }
  return ma;
}

// Draw candlestick chart on canvas
export function drawCandlestickChart(canvasId, candles, options = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !candles || !candles.length) return;
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = (options.height || 400) * dpr;
  canvas.style.height = (options.height || 400) + 'px';
  ctx.scale(dpr, dpr);
  const W = rect.width;
  const H = options.height || 400;
  ctx.clearRect(0, 0, W, H);

  const pad = { top: 10, right: 60, bottom: 30, left: 10 };
  const chartH = H * 0.7 - pad.top;
  const volH = H * 0.2;
  const volTop = H * 0.75;

  // Price range
  let minP = Infinity, maxP = -Infinity, maxVol = 0;
  candles.forEach(c => {
    if (c.low < minP) minP = c.low;
    if (c.high > maxP) maxP = c.high;
    if (c.volume > maxVol) maxVol = c.volume;
  });
  const pRange = maxP - minP || 1;
  const pPad = pRange * 0.05;
  minP -= pPad; maxP += pPad;

  const priceToY = p => pad.top + chartH - ((p - minP) / (maxP - minP)) * chartH;
  const candleW = Math.max(2, (W - pad.left - pad.right) / candles.length * 0.7);
  const gap = (W - pad.left - pad.right) / candles.length;

  // Grid
  const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || '#d8dde6';
  const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text3').trim() || '#8896a6';
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 0.5;
  const gridLines = 5;
  for (let i = 0; i <= gridLines; i++) {
    const y = pad.top + (chartH / gridLines) * i;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
    const price = maxP - ((maxP - minP) / gridLines) * i;
    ctx.fillStyle = textColor;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(price.toFixed(2), W - pad.right + 4, y + 4);
  }

  // Volume bars
  candles.forEach((c, i) => {
    const x = pad.left + i * gap + gap / 2;
    const vH = maxVol > 0 ? (c.volume / maxVol) * volH : 0;
    ctx.fillStyle = c.close >= c.open ? 'rgba(22,163,74,0.25)' : 'rgba(220,38,38,0.25)';
    ctx.fillRect(x - candleW / 2, volTop + volH - vH, candleW, vH);
  });

  // Candles
  candles.forEach((c, i) => {
    const x = pad.left + i * gap + gap / 2;
    const isGreen = c.close >= c.open;
    const color = isGreen ? '#16a34a' : '#dc2626';

    // Wick
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, priceToY(c.high));
    ctx.lineTo(x, priceToY(c.low));
    ctx.stroke();

    // Body
    const bodyTop = priceToY(Math.max(c.open, c.close));
    const bodyBot = priceToY(Math.min(c.open, c.close));
    const bodyH = Math.max(1, bodyBot - bodyTop);
    ctx.fillStyle = color;
    ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyH);
  });

  // Moving Averages
  const ma20 = calcMA(candles, 20);
  const ma50 = calcMA(candles, 50);

  function drawMA(ma, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    let started = false;
    ma.forEach((v, i) => {
      if (v == null) return;
      const x = pad.left + i * gap + gap / 2;
      const y = priceToY(v);
      if (!started) { ctx.moveTo(x, y); started = true; }
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }
  drawMA(ma20, '#d97706');
  drawMA(ma50, '#2563eb');

  // Date labels
  ctx.fillStyle = textColor;
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  const labelEvery = Math.max(1, Math.floor(candles.length / 6));
  candles.forEach((c, i) => {
    if (i % labelEvery !== 0) return;
    const x = pad.left + i * gap + gap / 2;
    const d = c.date;
    ctx.fillText(d.getDate() + '/' + (d.getMonth() + 1), x, H - 5);
  });

  // Store for hover
  canvas._chartData = { candles, pad, gap, priceToY, W, H, candleW };
}

// Setup hover tooltip for chart
export function setupChartHover(canvasId, tooltipId) {
  const canvas = document.getElementById(canvasId);
  const tooltip = document.getElementById(tooltipId);
  if (!canvas || !tooltip) return;
  canvas.addEventListener('mousemove', e => {
    const data = canvas._chartData;
    if (!data) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const idx = Math.floor((mx - data.pad.left) / data.gap);
    if (idx < 0 || idx >= data.candles.length) { tooltip.classList.remove('show'); return; }
    const c = data.candles[idx];
    tooltip.classList.add('show');
    const fields = tooltip.querySelectorAll('[data-field]');
    fields.forEach(f => {
      const key = f.dataset.field;
      if (key === 'date') f.textContent = c.date.toLocaleDateString('he-IL');
      else if (key === 'vol') f.textContent = (c.volume / 1e6).toFixed(1) + 'M';
      else if (c[key] != null) f.textContent = c[key].toFixed(2);
    });
  });
  canvas.addEventListener('mouseleave', () => tooltip.classList.remove('show'));
}
