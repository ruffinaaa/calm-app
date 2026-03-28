// ─────────────────────────────────────────────
//  CALM — Angstbewältigung PWA
// ─────────────────────────────────────────────

// ── State ──────────────────────────────────────
const state = {
  apiKey: localStorage.getItem('calm_api_key') || '',
  currentView: 'home',
  breath: {
    running: false,
    phase: 'idle',   // idle | inhale | hold | exhale
    count: 0,
    cycles: 0,
    timer: null,
    pattern: '4-7-8', // '4-7-8' | 'box' | '2-1-4'
    patterns: {
      '4-7-8':  { inhale: 4, hold: 7, exhale: 8, label: '4-7-8 Beruhigung' },
      'box':    { inhale: 4, hold: 4, exhale: 4, label: 'Box Breathing' },
      '2-1-4':  { inhale: 2, hold: 1, exhale: 4, label: '2-1-4 Schnell' },
    }
  },
  journal: JSON.parse(localStorage.getItem('calm_journal') || '[]'),
  affirmations: [
    'Ich bin sicher. Dieser Moment geht vorbei.',
    'Mein Atem ist mein Anker.',
    'Ich vertraue meiner Stärke.',
    'Ich bin mehr als meine Angst.',
    'Jeder Atemzug bringt mich näher zur Ruhe.',
    'Ich bin sanft mit mir selbst.',
    'Dieser Moment ist alles, was ich brauche.',
    'Ich bin fähig, mit Schwierigkeiten umzugehen.',
    'Mein Körper weiß, wie er sich beruhigt.',
    'Ich bin würdig, Frieden zu fühlen.',
  ],
  currentAffirmation: 0,
  contacts: JSON.parse(localStorage.getItem('calm_contacts') || '[]'),
};

// ── API ────────────────────────────────────────
async function callClaude(userMessage, systemPrompt) {
  if (!state.apiKey) return null;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': state.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }]
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.content?.[0]?.text || null;
  } catch {
    return null;
  }
}

// ── Navigation ─────────────────────────────────
function navigate(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.getElementById(`view-${view}`).classList.add('active');
  document.getElementById(`nav-${view}`)?.classList.add('active');
  state.currentView = view;

  if (view !== 'breath' && state.breath.running) stopBreathing();
  if (view === 'affirmations') showAffirmation();
}

// ── Home ───────────────────────────────────────
function renderDailyQuote() {
  const el = document.getElementById('daily-quote');
  const q = state.affirmations[new Date().getDate() % state.affirmations.length];
  el.textContent = `„${q}"`;
}

// ── Breathing ──────────────────────────────────
function updateBreathUI() {
  const orb = document.getElementById('breath-orb');
  const phase = document.getElementById('breath-phase');
  const count = document.getElementById('breath-count');
  const cycleEl = document.getElementById('breath-cycles');

  orb.classList.remove('inhale', 'exhale');
  if (state.breath.phase === 'inhale') orb.classList.add('inhale');
  if (state.breath.phase === 'exhale') orb.classList.add('exhale');

  const phaseLabels = { idle: '', inhale: 'Einatmen', hold: 'Halten', exhale: 'Ausatmen' };
  phase.textContent = phaseLabels[state.breath.phase] || '';
  count.textContent = state.breath.count > 0 ? state.breath.count : '';
  cycleEl.textContent = state.breath.cycles > 0 ? `${state.breath.cycles} Zyklus abgeschlossen` : '';
}

function runPhase(duration, phaseName, callback) {
  state.breath.phase = phaseName;
  state.breath.count = duration;
  updateBreathUI();

  let remaining = duration - 1;
  state.breath.timer = setInterval(() => {
    if (!state.breath.running) { clearInterval(state.breath.timer); return; }
    state.breath.count = remaining;
    updateBreathUI();
    if (remaining <= 0) {
      clearInterval(state.breath.timer);
      callback();
    }
    remaining--;
  }, 1000);
}

function runCycle() {
  if (!state.breath.running) return;
  const p = state.breath.patterns[state.breath.pattern];

  runPhase(p.inhale, 'inhale', () => {
    if (!state.breath.running) return;
    runPhase(p.hold, 'hold', () => {
      if (!state.breath.running) return;
      runPhase(p.exhale, 'exhale', () => {
        if (!state.breath.running) return;
        state.breath.cycles++;
        runCycle();
      });
    });
  });
}

function startBreathing() {
  state.breath.running = true;
  state.breath.cycles = 0;
  document.getElementById('btn-breath-start').style.display = 'none';
  document.getElementById('btn-breath-stop').style.display = 'inline-flex';
  document.getElementById('breath-ring').classList.add('pulse');
  runCycle();
}

function stopBreathing() {
  state.breath.running = false;
  clearInterval(state.breath.timer);
  state.breath.phase = 'idle';
  state.breath.count = 0;
  updateBreathUI();
  document.getElementById('btn-breath-start').style.display = 'inline-flex';
  document.getElementById('btn-breath-stop').style.display = 'none';
  document.getElementById('breath-ring').classList.remove('pulse');
}

function selectPattern(key) {
  state.breath.pattern = key;
  document.querySelectorAll('.pattern-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.pattern === key);
  });
  if (state.breath.running) { stopBreathing(); startBreathing(); }
}

// ── Journal ────────────────────────────────────
function saveJournal() {
  localStorage.setItem('calm_journal', JSON.stringify(state.journal));
}

function getMoodEmoji(mood) {
  const map = { calm: '😌', anxious: '😰', sad: '😔', angry: '😤', neutral: '😐' };
  return map[mood] || '';
}

function selectMood(mood) {
  document.querySelectorAll('.mood-btn').forEach(b => {
    b.classList.toggle('selected', b.dataset.mood === mood);
  });
  state.selectedMood = mood;
}

async function submitJournal() {
  const text = document.getElementById('journal-input').value.trim();
  if (!text) return;

  const mood = state.selectedMood || 'neutral';
  const entry = {
    id: Date.now(),
    text,
    mood,
    date: new Date().toLocaleDateString('de-DE', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }),
    aiResponse: null
  };

  state.journal.unshift(entry);
  saveJournal();
  document.getElementById('journal-input').value = '';
  state.selectedMood = null;
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
  renderJournalEntries();

  // AI response
  if (state.apiKey) {
    const firstEntryEl = document.querySelector('.entry-card');
    if (firstEntryEl) {
      const aiEl = firstEntryEl.querySelector('.ai-response');
      aiEl.innerHTML = `<div class="ai-loading"><div class="dot-bounce"><span></span><span></span><span></span></div> Claude antwortet…</div>`;
      const response = await callClaude(
        `Meine aktuelle Stimmung: ${mood}. Mein Tagebucheintrag: "${text}"`,
        `Du bist ein mitfühlender, einfühlsamer psychologischer Begleiter. Du antwortest auf Tagebucheinträge von Menschen mit Angstzuständen kurz (2-3 Sätze), warmherzig, ohne Ratschläge zu erteilen – du validierst Gefühle und bietest sanfte Perspektiven. Antworte auf Deutsch.`
      );
      entry.aiResponse = response;
      saveJournal();
      aiEl.innerHTML = response
        ? `<span style="color:var(--text3);font-size:0.72rem;display:block;margin-bottom:4px;">✦ Claude</span>${response}`
        : '';
    }
  }
}

function renderJournalEntries() {
  const container = document.getElementById('journal-entries');
  if (!state.journal.length) {
    container.innerHTML = `<p style="text-align:center;padding:20px;color:var(--text3);">Noch keine Einträge. Schreib deinen ersten Gedanken.</p>`;
    return;
  }
  container.innerHTML = state.journal.map(e => `
    <div class="entry-card">
      <div class="entry-date">
        ${getMoodEmoji(e.mood)} ${e.date}
        <button onclick="deleteEntry(${e.id})" style="margin-left:auto;background:none;border:none;color:var(--text3);cursor:pointer;font-size:0.75rem;">✕</button>
      </div>
      <div class="entry-text">${escapeHtml(e.text)}</div>
      ${e.aiResponse ? `<div class="ai-response"><span style="color:var(--text3);font-size:0.72rem;display:block;margin-bottom:4px;">✦ Claude</span>${escapeHtml(e.aiResponse)}</div>` : '<div class="ai-response" style="display:none"></div>'}
    </div>
  `).join('');
}

function deleteEntry(id) {
  state.journal = state.journal.filter(e => e.id !== id);
  saveJournal();
  renderJournalEntries();
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Affirmations ────────────────────────────────
function showAffirmation(idx) {
  if (idx === undefined) idx = state.currentAffirmation;
  state.currentAffirmation = idx;
  const el = document.getElementById('affirmation-text');
  el.style.opacity = '0';
  setTimeout(() => {
    el.textContent = state.affirmations[idx];
    el.style.opacity = '1';
    el.style.transition = 'opacity 0.4s ease';
  }, 150);
}

function nextAffirmation() {
  state.currentAffirmation = (state.currentAffirmation + 1) % state.affirmations.length;
  showAffirmation();
}

function prevAffirmation() {
  state.currentAffirmation = (state.currentAffirmation - 1 + state.affirmations.length) % state.affirmations.length;
  showAffirmation();
}

async function generateAffirmation() {
  const topic = document.getElementById('affirmation-topic').value.trim() || 'allgemeine Angstbewältigung';
  const btn = document.getElementById('btn-gen-affirmation');
  btn.textContent = '…';
  btn.disabled = true;

  const result = await callClaude(
    `Thema: ${topic}`,
    `Erstelle genau eine kurze, kraftvolle Affirmation (max. 15 Wörter) auf Deutsch für Menschen mit Angstzuständen. Beginne mit "Ich" oder einem direkten Wort. Gib NUR die Affirmation zurück, ohne Anführungszeichen, ohne Erklärung.`
  );

  btn.textContent = 'Generieren';
  btn.disabled = false;

  if (result) {
    state.affirmations.unshift(result.trim());
    state.currentAffirmation = 0;
    showAffirmation(0);
  }
}

// ── Contacts / SOS ──────────────────────────────
function saveContacts() {
  localStorage.setItem('calm_contacts', JSON.stringify(state.contacts));
}

function renderContacts() {
  const container = document.getElementById('contacts-list');
  if (!state.contacts.length) {
    container.innerHTML = `<p style="text-align:center;padding:20px;color:var(--text3);">Noch keine Kontakte hinzugefügt.</p>`;
    return;
  }
  container.innerHTML = state.contacts.map((c, i) => `
    <div class="contact-card">
      <div class="contact-avatar">${c.name[0]?.toUpperCase() || '?'}</div>
      <div class="contact-info">
        <div class="contact-name">${escapeHtml(c.name)}</div>
        <div class="contact-rel">${escapeHtml(c.relation || '')} · ${escapeHtml(c.phone)}</div>
      </div>
      <div class="contact-actions">
        <a href="tel:${c.phone}" class="icon-btn" title="Anrufen">📞</a>
        <button class="icon-btn danger" onclick="deleteContact(${i})" title="Löschen">✕</button>
      </div>
    </div>
  `).join('');
}

function addContact() {
  const name = document.getElementById('contact-name').value.trim();
  const phone = document.getElementById('contact-phone').value.trim();
  const relation = document.getElementById('contact-relation').value.trim();
  if (!name || !phone) return;
  state.contacts.push({ name, phone, relation });
  saveContacts();
  renderContacts();
  document.getElementById('contact-name').value = '';
  document.getElementById('contact-phone').value = '';
  document.getElementById('contact-relation').value = '';
  toggleContactForm(false);
}

function deleteContact(i) {
  state.contacts.splice(i, 1);
  saveContacts();
  renderContacts();
}

function toggleContactForm(show) {
  document.getElementById('add-contact-form').classList.toggle('open', show);
}

// ── Settings ────────────────────────────────────
function saveApiKey() {
  const key = document.getElementById('api-key-input').value.trim();
  state.apiKey = key;
  localStorage.setItem('calm_api_key', key);
  document.getElementById('api-banner').style.display = 'none';
  showToast('API-Key gespeichert ✓');
}

function showToast(msg) {
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:var(--accent);color:#0d1117;padding:10px 20px;border-radius:50px;font-size:0.82rem;font-weight:500;z-index:999;animation:fadeUp 0.3s ease`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

// ── Init ────────────────────────────────────────
function init() {
  // Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/public/sw.js').catch(() => {});
  }

  renderDailyQuote();
  renderJournalEntries();
  renderContacts();

  if (state.apiKey) {
    document.getElementById('api-key-input').value = '••••••••••••••••';
    document.getElementById('api-key-input').type = 'password';
    document.getElementById('api-banner').style.display = 'none';
  }

  navigate('home');
}

document.addEventListener('DOMContentLoaded', init);

// Expose globally for inline handlers
window.navigate = navigate;
window.startBreathing = startBreathing;
window.stopBreathing = stopBreathing;
window.selectPattern = selectPattern;
window.selectMood = selectMood;
window.submitJournal = submitJournal;
window.deleteEntry = deleteEntry;
window.nextAffirmation = nextAffirmation;
window.prevAffirmation = prevAffirmation;
window.generateAffirmation = generateAffirmation;
window.addContact = addContact;
window.deleteContact = deleteContact;
window.toggleContactForm = toggleContactForm;
window.saveApiKey = saveApiKey;
