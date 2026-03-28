// ─────────────────────────────────────────────
//  CALM — Angstbewältigung PWA v2
// ─────────────────────────────────────────────

// ── State ──────────────────────────────────────
const state = {
  apiKey: localStorage.getItem('calm_api_key') || '',
  currentView: 'home',
  breath: {
    running: false, phase: 'idle', count: 0, cycles: 0, timer: null, pattern: '4-7-8',
    patterns: {
      '4-7-8': { inhale: 4, hold: 7, exhale: 8 },
      'box':   { inhale: 4, hold: 4, exhale: 4 },
      '2-1-4': { inhale: 2, hold: 1, exhale: 4 },
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
  selectedMood: null,
  sound: { ctx: null, nodes: {}, current: null, volume: 0.5 },
  meditation: { running: false, timer: null, stepIndex: 0, elapsed: 0, total: 0 },
};

// ── Meditations ────────────────────────────────
const MEDITATIONS = {
  ankommen: {
    title: 'Ankommen',
    steps: [
      { text: 'Komm zur Ruhe. Setz dich bequem hin und schließe sanft die Augen.', duration: 20 },
      { text: 'Spüre, wie dein Körper von der Unterlage getragen wird.', duration: 20 },
      { text: 'Atme tief ein… und langsam aus. Lass jeden Atemzug dich tiefer ankommen.', duration: 25 },
      { text: 'Du musst jetzt nichts tun. Du darfst einfach sein.', duration: 20 },
      { text: 'Beobachte deine Gedanken wie vorbeiziehende Wolken – ohne sie festzuhalten.', duration: 25 },
      { text: 'Dein Atem fließt ganz natürlich. Ein und aus.', duration: 20 },
      { text: 'Du bist hier. Du bist sicher. Du bist im richtigen Moment.', duration: 25 },
      { text: 'Öffne langsam die Augen. Nimm dieses Gefühl mit in deinen Tag.', duration: 15 },
    ]
  },
  angst: {
    title: 'Angst loslassen',
    steps: [
      { text: 'Erkenne, was du gerade fühlst – ohne es zu bewerten. Es ist okay.', duration: 20 },
      { text: 'Lege eine Hand auf dein Herz. Spüre seinen Rhythmus.', duration: 20 },
      { text: 'Atme tief in den Bauch – zähle bis 4. Halte – zähle bis 4. Aus – zähle bis 6.', duration: 30 },
      { text: 'Angst ist eine Welle. Sie steigt auf… und sie fällt auch wieder.', duration: 25 },
      { text: 'Nenne 5 Dinge, die du gerade siehst. Bleib im Hier und Jetzt.', duration: 30 },
      { text: 'Nenne 4 Dinge, die du berühren kannst. Fühle ihre Textur.', duration: 25 },
      { text: 'Du hast Angst schon oft überstanden. Du bist stärker als du glaubst.', duration: 25 },
      { text: 'Lass die Spannung mit jedem Ausatmen ein Stückchen mehr los.', duration: 25 },
      { text: 'Du bist sicher. Dieser Moment geht vorbei. Du bist nicht allein.', duration: 25 },
    ]
  },
  koerper: {
    title: 'Body Scan',
    steps: [
      { text: 'Leg dich oder sitz bequem. Schließe die Augen.', duration: 15 },
      { text: 'Bring deine Aufmerksamkeit zu den Zehen. Spüre sie. Entspanne sie.', duration: 25 },
      { text: 'Wandere hinauf zu den Füßen und Knöcheln. Lass jede Spannung los.', duration: 25 },
      { text: 'Die Waden, Knie, Oberschenkel – alles wird weich und schwer.', duration: 25 },
      { text: 'Der Bauch. Atme tief hinein. Lass ihn sich weit machen und sanft fallen.', duration: 30 },
      { text: 'Die Brust. Das Herz. Jeder Herzschlag ist ein Zeichen deiner Lebendigkeit.', duration: 25 },
      { text: 'Schultern, Arme, Hände. Lass alle Last fallen.', duration: 25 },
      { text: 'Der Nacken, das Gesicht. Entspanne Kiefer, Augen, Stirn.', duration: 25 },
      { text: 'Dein ganzer Körper ist ruhig. Du bist vollständig entspannt.', duration: 30 },
      { text: 'Bleib noch einen Moment so. Genieße diese Stille.', duration: 30 },
    ]
  },
  schlaf: {
    title: 'Einschlafen',
    steps: [
      { text: 'Leg dich bequem hin. Lass alle Gedanken des Tages los.', duration: 20 },
      { text: 'Atme langsam ein… und noch langsamer aus. Dein Körper wird schwer.', duration: 25 },
      { text: 'Du bist sicher. Die Nacht hält dich. Du musst jetzt nichts mehr tun.', duration: 25 },
      { text: 'Stell dir einen ruhigen Ort vor – einen Ort, der sich wie Zuhause anfühlt.', duration: 30 },
      { text: 'Jeder Atemzug trägt dich tiefer in die Ruhe. Tiefer… und tiefer.', duration: 30 },
      { text: 'Deine Augen werden schwer. Dein Geist wird still.', duration: 25 },
      { text: 'Gute Nacht. Du hast heute genug getan. Jetzt ist Zeit zum Ruhen.', duration: 25 },
    ]
  },
  dankbarkeit: {
    title: 'Dankbarkeit',
    steps: [
      { text: 'Schließe die Augen und atme dreimal tief durch.', duration: 20 },
      { text: 'Denke an eine Person, die dir gut tut. Spüre die Wärme dieser Verbindung.', duration: 25 },
      { text: 'Denke an etwas in deinem Körper, das dir dient – dein Herz, deine Lungen.', duration: 25 },
      { text: 'Denke an einen kleinen Moment heute, der schön war – auch wenn er klein ist.', duration: 30 },
      { text: 'Denke an etwas, das du weißt oder kannst. Dankbarkeit für dein Wachstum.', duration: 25 },
      { text: 'Lass dieses Gefühl der Dankbarkeit sich in deiner Brust ausbreiten.', duration: 25 },
      { text: 'Du hast mehr, als du manchmal siehst. Das Leben trägt dich.', duration: 25 },
    ]
  }
};

// ── Web Audio Sounds ───────────────────────────
function getAudioCtx() {
  if (!state.sound.ctx) {
    state.sound.ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return state.sound.ctx;
}

function createNoiseBuffer(ctx) {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function createSound(type) {
  const ctx = getAudioCtx();
  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(state.sound.volume, ctx.currentTime);
  gainNode.connect(ctx.destination);

  let source;

  if (type === 'rain') {
    source = ctx.createBufferSource();
    source.buffer = createNoiseBuffer(ctx);
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.Q.setValueAtTime(0.5, ctx.currentTime);
    source.connect(filter);
    filter.connect(gainNode);
  } else if (type === 'ocean') {
    source = ctx.createBufferSource();
    source.buffer = createNoiseBuffer(ctx);
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.08, ctx.currentTime);
    lfoGain.gain.setValueAtTime(200, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    source.connect(filter);
    filter.connect(gainNode);
  } else if (type === 'forest') {
    source = ctx.createBufferSource();
    source.buffer = createNoiseBuffer(ctx);
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, ctx.currentTime);
    filter.Q.setValueAtTime(2, ctx.currentTime);
    source.connect(filter);
    filter.connect(gainNode);
  } else if (type === 'wind') {
    source = ctx.createBufferSource();
    source.buffer = createNoiseBuffer(ctx);
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, ctx.currentTime);
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(0.15, ctx.currentTime);
    lfoGain.gain.setValueAtTime(300, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
    source.connect(filter);
    filter.connect(gainNode);
  } else if (type === 'fire') {
    source = ctx.createBufferSource();
    source.buffer = createNoiseBuffer(ctx);
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, ctx.currentTime);
    filter.Q.setValueAtTime(0.8, ctx.currentTime);
    source.connect(filter);
    filter.connect(gainNode);
  }

  source.start();
  return { source, gainNode };
}

function toggleSound(type) {
  if (state.sound.current === type) {
    stopAllSounds();
    return;
  }
  stopAllSounds();
  try {
    const nodes = createSound(type);
    state.sound.nodes = nodes;
    state.sound.current = type;
    document.getElementById(`snd-${type}`)?.classList.add('playing');
  } catch(e) {
    console.error('Sound error:', e);
  }
}

function stopAllSounds() {
  if (state.sound.nodes.source) {
    try { state.sound.nodes.source.stop(); } catch(e) {}
  }
  state.sound.nodes = {};
  state.sound.current = null;
  document.querySelectorAll('.sound-btn').forEach(b => b.classList.remove('playing'));
}

function setVolume(val) {
  state.sound.volume = parseFloat(val);
  if (state.sound.nodes.gainNode) {
    state.sound.nodes.gainNode.gain.setValueAtTime(state.sound.volume, getAudioCtx().currentTime);
  }
}

// ── Wave Animation ─────────────────────────────
function initWaves() {
  const canvas = document.getElementById('wave-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, t = 0;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = canvas.offsetHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  const waves = [
    { amp: 18, period: 0.012, speed: 0.0025, color: 'rgba(255,107,157,0.35)', y: 0.55 },
    { amp: 14, period: 0.018, speed: 0.0018, color: 'rgba(192,132,252,0.3)', y: 0.65 },
    { amp: 10, period: 0.022, speed: 0.003,  color: 'rgba(251,146,60,0.25)', y: 0.75 },
    { amp: 8,  period: 0.028, speed: 0.0012, color: 'rgba(244,114,182,0.2)', y: 0.85 },
  ];

  function draw() {
    ctx.clearRect(0, 0, w, h);
    waves.forEach(wave => {
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 2) {
        const y = wave.y * h + Math.sin(x * wave.period + t * wave.speed * 100) * wave.amp
                              + Math.sin(x * wave.period * 1.5 + t * wave.speed * 80 + 1) * (wave.amp * 0.5);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fillStyle = wave.color;
      ctx.fill();
    });
    t++;
    requestAnimationFrame(draw);
  }
  draw();
}

// ── Meditation ─────────────────────────────────
function startMeditation(key) {
  const med = MEDITATIONS[key];
  if (!med) return;

  state.meditation.running = true;
  state.meditation.stepIndex = 0;
  state.meditation.currentKey = key;
  state.meditation.total = med.steps.reduce((s, step) => s + step.duration, 0);

  document.getElementById('meditation-title-active').textContent = med.title;
  document.getElementById('meditation-player').classList.add('active');
  document.getElementById('meditation-cards').style.display = 'none';
  document.getElementById('meditation-bar').style.width = '0%';
  document.getElementById('view-meditation').scrollTo({ top: 0, behavior: 'smooth' });

  runMeditationStep(key);
}

function runMeditationStep(key) {
  const med = MEDITATIONS[key];
  const step = med.steps[state.meditation.stepIndex];
  if (!step || !state.meditation.running) return;

  document.getElementById('meditation-step-text').textContent = step.text;
  document.getElementById('meditation-step-counter').textContent =
    `Schritt ${state.meditation.stepIndex + 1} von ${med.steps.length}`;

  let elapsed = 0;
  const totalPrev = med.steps.slice(0, state.meditation.stepIndex).reduce((s, s2) => s + s2.duration, 0);

  clearInterval(state.meditation.timer);
  state.meditation.timer = setInterval(() => {
    elapsed++;
    const totalElapsed = totalPrev + elapsed;
    const pct = (totalElapsed / state.meditation.total) * 100;
    document.getElementById('meditation-bar').style.width = pct + '%';

    if (elapsed >= step.duration) {
      clearInterval(state.meditation.timer);
      state.meditation.stepIndex++;
      if (state.meditation.stepIndex < med.steps.length) {
        runMeditationStep(key);
      } else {
        finishMeditation();
      }
    }
  }, 1000);
}

function finishMeditation() {
  state.meditation.running = false;
  document.getElementById('meditation-step-text').textContent = 'Wunderbar. Du hast es geschafft. 🌸';
  document.getElementById('meditation-step-counter').textContent = 'Meditation abgeschlossen';
  document.getElementById('meditation-bar').style.width = '100%';
}

function stopMeditation() {
  state.meditation.running = false;
  clearInterval(state.meditation.timer);
  document.getElementById('meditation-player').classList.remove('active');
  document.getElementById('meditation-bar').style.width = '0%';
  document.getElementById('meditation-cards').style.display = 'block';
}

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
  } catch { return null; }
}

// ── Navigation ─────────────────────────────────
function navigate(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.getElementById(`view-${view}`).classList.add('active');
  document.getElementById(`nav-${view}`)?.classList.add('active');
  state.currentView = view;
  if (view !== 'breath' && state.breath.running) stopBreathing();
}

// ── Home ───────────────────────────────────────
function renderDailyQuote() {
  const q = state.affirmations[new Date().getDate() % state.affirmations.length];
  document.getElementById('daily-quote').textContent = `„${q}"`;
}

// ── Breathing ──────────────────────────────────
function updateBreathUI() {
  const orb = document.getElementById('breath-orb');
  const phase = document.getElementById('breath-phase');
  const count = document.getElementById('breath-count');
  orb.classList.remove('inhale', 'exhale');
  if (state.breath.phase === 'inhale') orb.classList.add('inhale');
  if (state.breath.phase === 'exhale') orb.classList.add('exhale');
  const labels = { idle: '', inhale: 'Einatmen', hold: 'Halten', exhale: 'Ausatmen' };
  phase.textContent = labels[state.breath.phase] || '';
  count.textContent = state.breath.count > 0 ? state.breath.count : '';
  document.getElementById('breath-cycles').textContent =
    state.breath.cycles > 0 ? `${state.breath.cycles} Zyklus abgeschlossen` : '';
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
    if (remaining <= 0) { clearInterval(state.breath.timer); callback(); }
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
}

function selectPattern(key) {
  state.breath.pattern = key;
  document.querySelectorAll('.pattern-chip').forEach(c => c.classList.toggle('active', c.dataset.pattern === key));
  if (state.breath.running) { stopBreathing(); startBreathing(); }
}

// ── Journal ────────────────────────────────────
function saveJournal() { localStorage.setItem('calm_journal', JSON.stringify(state.journal)); }
function getMoodEmoji(m) { return { calm:'😌', anxious:'😰', sad:'😔', angry:'😤', neutral:'😐' }[m] || ''; }
function selectMood(mood) {
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.toggle('selected', b.dataset.mood === mood));
  state.selectedMood = mood;
}

async function submitJournal() {
  const text = document.getElementById('journal-input').value.trim();
  if (!text) return;
  const mood = state.selectedMood || 'neutral';
  const entry = { id: Date.now(), text, mood, date: new Date().toLocaleDateString('de-DE', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }), aiResponse: null };
  state.journal.unshift(entry);
  saveJournal();
  document.getElementById('journal-input').value = '';
  state.selectedMood = null;
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
  renderJournalEntries();

  if (state.apiKey) {
    const aiEl = document.querySelector('.entry-card .ai-response');
    if (aiEl) {
      aiEl.style.display = 'block';
      aiEl.innerHTML = `<div class="ai-loading"><div class="dot-bounce"><span></span><span></span><span></span></div> Claude antwortet…</div>`;
      const response = await callClaude(
        `Stimmung: ${mood}. Eintrag: "${text}"`,
        `Du bist ein mitfühlender psychologischer Begleiter. Antworte auf Tagebucheinträge von Menschen mit Angstzuständen kurz (2-3 Sätze), warmherzig, validiere Gefühle. Antworte auf Deutsch.`
      );
      entry.aiResponse = response;
      saveJournal();
      aiEl.innerHTML = response ? `<span style="color:var(--text3);font-size:0.72rem;display:block;margin-bottom:4px;">✦ Claude</span>${response}` : '';
      if (!response) aiEl.style.display = 'none';
    }
  }
}

function renderJournalEntries() {
  const container = document.getElementById('journal-entries');
  if (!state.journal.length) {
    container.innerHTML = `<p style="text-align:center;padding:20px;color:var(--text3);">Noch keine Einträge.</p>`;
    return;
  }
  container.innerHTML = state.journal.map(e => `
    <div class="entry-card">
      <div class="entry-date">${getMoodEmoji(e.mood)} ${e.date}<button onclick="deleteEntry(${e.id})" style="margin-left:auto;background:none;border:none;color:var(--text3);cursor:pointer;font-size:0.75rem;">✕</button></div>
      <div class="entry-text">${escapeHtml(e.text)}</div>
      ${e.aiResponse ? `<div class="ai-response"><span style="color:var(--text3);font-size:0.72rem;display:block;margin-bottom:4px;">✦ Claude</span>${escapeHtml(e.aiResponse)}</div>` : '<div class="ai-response" style="display:none"></div>'}
    </div>`).join('');
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
  setTimeout(() => { el.textContent = state.affirmations[idx]; el.style.opacity = '1'; el.style.transition = 'opacity 0.4s ease'; }, 150);
}

function nextAffirmation() { state.currentAffirmation = (state.currentAffirmation + 1) % state.affirmations.length; showAffirmation(); }
function prevAffirmation() { state.currentAffirmation = (state.currentAffirmation - 1 + state.affirmations.length) % state.affirmations.length; showAffirmation(); }

async function generateAffirmation() {
  const topic = document.getElementById('affirmation-topic').value.trim() || 'Angstbewältigung';
  const btn = document.getElementById('btn-gen-affirmation');
  btn.textContent = '…'; btn.disabled = true;
  const result = await callClaude(`Thema: ${topic}`, `Erstelle genau eine kurze, kraftvolle Affirmation (max. 15 Wörter) auf Deutsch für Menschen mit Angstzuständen. Beginne mit "Ich". Gib NUR die Affirmation zurück, ohne Anführungszeichen.`);
  btn.textContent = 'Generieren'; btn.disabled = false;
  if (result) { state.affirmations.unshift(result.trim()); state.currentAffirmation = 0; showAffirmation(0); }
}

// ── Contacts ───────────────────────────────────
function saveContacts() { localStorage.setItem('calm_contacts', JSON.stringify(state.contacts)); }

function renderContacts() {
  const container = document.getElementById('contacts-list');
  if (!state.contacts.length) { container.innerHTML = `<p style="text-align:center;padding:20px;color:var(--text3);">Noch keine Kontakte.</p>`; return; }
  container.innerHTML = state.contacts.map((c, i) => `
    <div class="contact-card">
      <div class="contact-avatar">${c.name[0]?.toUpperCase() || '?'}</div>
      <div class="contact-info"><div class="contact-name">${escapeHtml(c.name)}</div><div class="contact-rel">${escapeHtml(c.relation || '')} · ${escapeHtml(c.phone)}</div></div>
      <div class="contact-actions"><a href="tel:${c.phone}" class="icon-btn">📞</a><button class="icon-btn danger" onclick="deleteContact(${i})">✕</button></div>
    </div>`).join('');
}

function addContact() {
  const name = document.getElementById('contact-name').value.trim();
  const phone = document.getElementById('contact-phone').value.trim();
  const relation = document.getElementById('contact-relation').value.trim();
  if (!name || !phone) return;
  state.contacts.push({ name, phone, relation });
  saveContacts(); renderContacts();
  document.getElementById('contact-name').value = '';
  document.getElementById('contact-phone').value = '';
  document.getElementById('contact-relation').value = '';
  toggleContactForm(false);
}

function deleteContact(i) { state.contacts.splice(i, 1); saveContacts(); renderContacts(); }
function toggleContactForm(show) { document.getElementById('add-contact-form').classList.toggle('open', show); }

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
  t.style.cssText = `position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#ff6b9d,#c084fc);color:white;padding:10px 20px;border-radius:50px;font-size:0.82rem;font-weight:500;z-index:999;animation:fadeUp 0.3s ease`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

// ── Init ────────────────────────────────────────
function init() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/public/sw.js').catch(() => {});
  initWaves();
  renderDailyQuote();
  renderJournalEntries();
  renderContacts();
  showAffirmation(0);
  if (state.apiKey) document.getElementById('api-banner').style.display = 'none';
  navigate('home');
}

document.addEventListener('DOMContentLoaded', init);

// Globals
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
window.toggleSound = toggleSound;
window.stopAllSounds = stopAllSounds;
window.setVolume = setVolume;
window.startMeditation = startMeditation;
window.stopMeditation = stopMeditation;
