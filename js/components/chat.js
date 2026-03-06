// ========== CHAT COMPONENT ==========
import { getState, setState } from '../core/state.js';
import { GLOSSARY } from '../data/glossary-data.js';
import { KNOWLEDGE_BASE } from '../data/knowledge-base.js';

let chatMode = 'local';

export function render(container) {
  container.textContent = '';

  const wrap = document.createElement('div');
  wrap.className = 'chat-widget';
  wrap.id = 'chat-widget';

  // Header
  const header = document.createElement('div');
  header.className = 'chat-header';

  const title = document.createElement('span');
  title.textContent = 'עוזר מקפצה';
  title.style.fontWeight = '600';
  header.appendChild(title);

  // Mode toggle
  const modeRow = document.createElement('div');
  modeRow.style.cssText = 'display:flex;gap:6px';
  const localBtn = document.createElement('button');
  localBtn.id = 'mode-local';
  localBtn.className = 'btn btn-primary';
  localBtn.textContent = 'מקומי';
  localBtn.style.cssText = 'font-size:12px;padding:4px 10px';
  localBtn.addEventListener('click', () => setMode('local'));
  modeRow.appendChild(localBtn);

  const grokBtn = document.createElement('button');
  grokBtn.id = 'mode-grok';
  grokBtn.className = 'btn';
  grokBtn.textContent = 'Grok AI';
  grokBtn.style.cssText = 'font-size:12px;padding:4px 10px';
  grokBtn.addEventListener('click', () => setMode('grok'));
  modeRow.appendChild(grokBtn);

  header.appendChild(modeRow);
  wrap.appendChild(header);

  // Mode label
  const modeLabel = document.createElement('div');
  modeLabel.id = 'chat-mode-label';
  modeLabel.style.cssText = 'padding:6px 12px;font-size:12px;color:var(--text3);background:var(--bg2)';
  modeLabel.textContent = 'חיפוש בבסיס הידע המקומי';
  wrap.appendChild(modeLabel);

  // Messages area
  const messages = document.createElement('div');
  messages.id = 'chat-messages';
  messages.style.cssText = 'flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px;min-height:200px;max-height:400px';
  wrap.appendChild(messages);

  // Input area
  const inputRow = document.createElement('div');
  inputRow.style.cssText = 'display:flex;gap:8px;padding:12px;border-top:1px solid var(--border)';
  const input = document.createElement('input');
  input.type = 'text';
  input.id = 'chat-input';
  input.className = 'input';
  input.style.flex = '1';
  input.placeholder = 'שאל שאלה...';
  input.addEventListener('keypress', e => { if (e.key === 'Enter') sendChat(); });
  inputRow.appendChild(input);

  const sendBtn = document.createElement('button');
  sendBtn.className = 'btn btn-primary';
  sendBtn.textContent = 'שלח';
  sendBtn.addEventListener('click', () => sendChat());
  inputRow.appendChild(sendBtn);

  wrap.appendChild(inputRow);
  container.appendChild(wrap);
}

function setMode(mode) {
  chatMode = mode;
  const localBtn = document.getElementById('mode-local');
  const grokBtn = document.getElementById('mode-grok');
  const label = document.getElementById('chat-mode-label');
  if (localBtn) localBtn.className = mode === 'local' ? 'btn btn-primary' : 'btn';
  if (grokBtn) grokBtn.className = mode === 'grok' ? 'btn btn-primary' : 'btn';
  if (label) label.textContent = mode === 'local' ? 'חיפוש בבסיס הידע המקומי' : 'Grok AI - תשובות מבוססות מקורות';

  if (mode === 'grok' && !getState('settings.grokKey')) {
    alert('יש להגדיר מפתח Grok API בהגדרות');
    setMode('local');
  }
}

function addMessage(text, isUser, source) {
  const c = document.getElementById('chat-messages');
  if (!c) return;
  const div = document.createElement('div');
  div.className = 'chat-msg ' + (isUser ? 'user' : 'bot');
  div.textContent = text;
  if (source) {
    const srcSpan = document.createElement('span');
    srcSpan.className = 'source-tag';
    srcSpan.style.cssText = 'display:block;font-size:11px;color:var(--text3);margin-top:4px';
    srcSpan.textContent = source;
    div.appendChild(srcSpan);
  }
  c.appendChild(div);
  c.scrollTop = c.scrollHeight;
  return div;
}

function searchKnowledgeBase(query) {
  const q = query.toLowerCase();
  const results = [];

  // Search glossary
  GLOSSARY.forEach(g => {
    const score = (g.tags.includes(q) ? 3 : 0) + (g.term.toLowerCase().includes(q) ? 2 : 0) + (g.def.toLowerCase().includes(q) ? 1 : 0);
    if (score > 0) results.push({ text: g.term + '\n' + g.def, source: 'מילון מושגים', score });
  });

  // Search extended knowledge
  KNOWLEDGE_BASE.forEach(k => {
    const words = q.split(/\s+/);
    let score = 0;
    words.forEach(w => {
      if (w.length < 2) return;
      if (k.tags.includes(w)) score += 3;
      if (k.content.toLowerCase().includes(w)) score += 1;
    });
    if (score > 0) results.push({ text: k.content, source: k.source, score });
  });

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, 5);
}

async function sendChat() {
  const input = document.getElementById('chat-input');
  if (!input) return;
  const query = input.value.trim();
  if (!query) return;
  input.value = '';

  addMessage(query, true);

  if (chatMode === 'local') {
    const results = searchKnowledgeBase(query);
    if (results.length) {
      const response = results.map(r => r.text).join('\n\n');
      const sources = [...new Set(results.map(r => r.source))].join(', ');
      addMessage(response.trim(), false, 'מקור: ' + sources);
    } else {
      addMessage('לא מצאתי מידע רלוונטי בבסיס הידע. נסה לנסח את השאלה אחרת, או עבור למצב Grok AI.', false, 'מערכת');
    }
  } else {
    // Grok AI mode
    const results = searchKnowledgeBase(query);
    const context = results.map(r => '[' + r.source + ']: ' + r.text).join('\n\n');

    const thinkingMsg = addMessage('חושב...', false);

    try {
      const res = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + getState('settings.grokKey')
        },
        body: JSON.stringify({
          model: getState('settings.grokModel') || 'grok-3-mini',
          messages: [
            { role: 'system', content: 'אתה יועץ השקעות מבוסס על תוכנית "המקפצה הפיננסית". ענה בעברית. היה מעשי וברור.' },
            { role: 'user', content: 'הקשר מהמקורות:\n' + context + '\n\nשאלה: ' + query }
          ],
          temperature: 0.3
        })
      });
      const data = await res.json();
      const answer = data.choices?.[0]?.message?.content || 'שגיאה בקבלת תשובה מ-Grok';
      if (thinkingMsg) thinkingMsg.textContent = answer;
    } catch(e) {
      if (thinkingMsg) thinkingMsg.textContent = 'שגיאה בחיבור ל-Grok API: ' + e.message;
    }
  }

  // Save chat history
  const history = getState('chatHistory') || [];
  history.push({ query, mode: chatMode, time: Date.now() });
  setState('chatHistory', history);
}
