// CALM v3 — maximally chill

const S = {
  apiKey: localStorage.getItem('calm_key') || '',
  mood: null,
  currentKey: null,
  breath: { on: false, phase: 'idle', count: 0, cycles: 0, timer: null, pattern: '4-7-8' },
  patterns: {
    '4-7-8': { inhale: 4, hold: 7, exhale: 8 },
    'box':   { inhale: 4, hold: 4, exhale: 4 },
    '2-1-4': { inhale: 2, hold: 1, exhale: 4 },
  },
  journal: JSON.parse(localStorage.getItem('calm_j') || '[]'),
  affs: [
    'Ich bin sicher. Dieser Moment geht vorbei.',
    'Mein Atem ist mein Anker.',
    'Ich vertraue meiner Stärke.',
    'Ich bin mehr als meine Angst.',
    'Jeder Atemzug bringt mich näher zur Ruhe.',
    'Ich bin sanft mit mir selbst.',
    'Dieser Moment ist alles, was ich brauche.',
    'Mein Körper weiß, wie er sich beruhigt.',
    'Ich bin würdig, Frieden zu fühlen.',
    'Ich lasse los, was ich nicht kontrollieren kann.',
  ],
  affIdx: 0,
  contacts: JSON.parse(localStorage.getItem('calm_c') || '[]'),
  sound: { ctx: null, nodes: {}, current: null, vol: 0.18 },
  med: { on: false, key: null, step: 0, timer: null, total: 0 },
};

const MEDS = {
  ankommen: { title: 'Ankommen', steps: [
    { text: 'Komm zur Ruhe. Setz dich bequem hin und schließe sanft die Augen.', d: 20 },
    { text: 'Spüre, wie dein Körper von der Unterlage getragen wird.', d: 20 },
    { text: 'Atme tief ein… und langsam aus. Lass jeden Atemzug dich tiefer ankommen.', d: 25 },
    { text: 'Du musst jetzt nichts tun. Du darfst einfach sein.', d: 20 },
    { text: 'Beobachte deine Gedanken wie Wolken — ohne sie festzuhalten.', d: 25 },
    { text: 'Dein Atem fließt ganz natürlich. Ein und aus.', d: 20 },
    { text: 'Du bist hier. Du bist sicher. Du bist im richtigen Moment.', d: 25 },
    { text: 'Öffne langsam die Augen. Nimm diese Stille mit in deinen Tag.', d: 15 },
  ]},
  angst: { title: 'Angst loslassen', steps: [
    { text: 'Erkenne, was du gerade fühlst — ohne es zu bewerten. Es ist okay.', d: 20 },
    { text: 'Lege eine Hand auf dein Herz. Spüre seinen ruhigen Rhythmus.', d: 20 },
    { text: 'Atme tief in den Bauch — zähle bis 4. Halte — bis 4. Ausatmen — bis 6.', d: 30 },
    { text: 'Angst ist eine Welle. Sie steigt auf… und sie fällt auch wieder.', d: 25 },
    { text: 'Nenne 5 Dinge, die du gerade siehst. Bleib im Hier und Jetzt.', d: 30 },
    { text: 'Nenne 4 Dinge, die du berühren kannst. Fühle ihre Textur.', d: 25 },
    { text: 'Du hast Angst schon oft überstanden. Du bist stärker als du glaubst.', d: 25 },
    { text: 'Lass die Spannung mit jedem Ausatmen ein Stückchen mehr los.', d: 25 },
    { text: 'Du bist sicher. Dieser Moment geht vorbei.', d: 25 },
  ]},
  koerper: { title: 'Body Scan', steps: [
    { text: 'Leg dich oder sitz bequem. Schließe die Augen.', d: 15 },
    { text: 'Bringe deine Aufmerksamkeit zu den Zehen. Spüre sie. Entspanne sie.', d: 25 },
    { text: 'Wandere hinauf zu den Füßen und Knöcheln. Lass jede Spannung los.', d: 25 },
    { text: 'Die Waden, Knie, Oberschenkel — alles wird weich und schwer.', d: 25 },
    { text: 'Der Bauch. Atme tief hinein. Lass ihn sich weit machen und sanft fallen.', d: 30 },
    { text: 'Die Brust. Das Herz. Jeder Herzschlag ist ein Zeichen deiner Lebendigkeit.', d: 25 },
    { text: 'Schultern, Arme, Hände. Lass alle Last fallen.', d: 25 },
    { text: 'Der Nacken, das Gesicht. Entspanne Kiefer, Augen, Stirn.', d: 25 },
    { text: 'Dein ganzer Körper ist ruhig. Genieße diese Stille.', d: 30 },
  ]},
  schlaf: { title: 'Einschlafen', steps: [
    { text: 'Leg dich bequem hin. Lass alle Gedanken des Tages los.', d: 20 },
    { text: 'Atme langsam ein… und noch langsamer aus. Dein Körper wird schwer.', d: 25 },
    { text: 'Du bist sicher. Die Nacht hält dich. Du musst jetzt nichts mehr tun.', d: 25 },
    { text: 'Stell dir einen ruhigen Ort vor — einen Ort, der sich wie Zuhause anfühlt.', d: 30 },
    { text: 'Jeder Atemzug trägt dich tiefer in die Ruhe. Tiefer… und tiefer.', d: 30 },
    { text: 'Deine Augen werden schwer. Dein Geist wird still.', d: 25 },
    { text: 'Gute Nacht. Du hast heute genug getan. Jetzt ist Zeit zum Ruhen.', d: 25 },
  ]},
  dankbarkeit: { title: 'Dankbarkeit', steps: [
    { text: 'Schließe die Augen und atme dreimal tief durch.', d: 20 },
    { text: 'Denke an eine Person, die dir gut tut. Spüre die Wärme dieser Verbindung.', d: 25 },
    { text: 'Denke an etwas in deinem Körper, das dir dient — dein Atem, dein Herz.', d: 25 },
    { text: 'Denke an einen kleinen Moment heute, der schön war.', d: 30 },
    { text: 'Lass dieses Gefühl der Dankbarkeit sich in deiner Brust ausbreiten.', d: 25 },
    { text: 'Du hast mehr, als du manchmal siehst. Das Leben trägt dich.', d: 25 },
  ]},
};

// ── AUDIO ──────────────────────────────────────
function ctx() {
  if (!S.sound.ctx) S.sound.ctx = new (window.AudioContext || window.webkitAudioContext)();
  return S.sound.ctx;
}

function brownBuffer(c) {
  const size = c.sampleRate * 4;
  const buf = c.createBuffer(1, size, c.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < size; i++) {
    const w = Math.random() * 2 - 1;
    d[i] = (last + 0.02 * w) / 1.02;
    last = d[i];
    d[i] *= 3.5;
  }
  return buf;
}

function noiseBuffer(c) {
  const size = c.sampleRate * 2;
  const buf = c.createBuffer(1, size, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < size; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

function makeSound(type) {
  const c = ctx();
  const gain = c.createGain();
  gain.gain.setValueAtTime(S.sound.vol, c.currentTime);
  gain.connect(c.destination);
  const extras = [];

  if (type === 'drone') {
    // 432 Hz — deep healing sine with ultra-slow tremolo
    [432, 648, 864].forEach((f, i) => {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      g.gain.value = [0.55, 0.18, 0.07][i];
      const lfo = c.createOscillator();
      const lg = c.createGain();
      lfo.frequency.value = 0.04; // extremely slow — one cycle per 25s
      lg.gain.value = 0.03;
      lfo.connect(lg); lg.connect(g.gain);
      lfo.start(); osc.connect(g); g.connect(gain); osc.start();
      extras.push(osc, lfo);
    });
    return { source: extras[0], gainNode: gain, extras };
  }

  if (type === 'binaural') {
    // Theta 6Hz — use headphones. Left 200Hz, Right 206Hz
    const merger = c.createChannelMerger(2);
    merger.connect(gain);
    [[200, 0], [206, 1]].forEach(([f, ch]) => {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'sine'; osc.frequency.value = f; g.gain.value = 0.38;
      osc.connect(g); g.connect(merger, 0, ch); osc.start();
      extras.push(osc);
    });
    return { source: extras[0], gainNode: gain, extras };
  }

  if (type === 'brown') {
    const src = c.createBufferSource();
    src.buffer = brownBuffer(c); src.loop = true;
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 250;
    src.connect(lp); lp.connect(gain); src.start();
    return { source: src, gainNode: gain, extras };
  }

  if (type === 'rain') {
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c); src.loop = true;
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420;
    const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 60;
    // ultra-slow swell
    const lfo = c.createOscillator();
    const lg = c.createGain();
    lfo.frequency.value = 0.03; lg.gain.value = 0.06;
    lfo.connect(lg); lg.connect(gain.gain); lfo.start();
    src.connect(lp); lp.connect(hp); hp.connect(gain); src.start();
    extras.push(lfo);
    return { source: src, gainNode: gain, extras };
  }

  if (type === 'space') {
    // Very deep ambient pad — sub-bass drones with slow LFOs
    [55, 82, 110].forEach((f, i) => {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'sine'; osc.frequency.value = f;
      g.gain.value = [0.35, 0.18, 0.09][i];
      const lfo = c.createOscillator();
      const lg = c.createGain();
      lfo.frequency.value = 0.02 + i * 0.008;
      lg.gain.value = 0.05;
      lfo.connect(lg); lg.connect(g.gain);
      lfo.start(); osc.connect(g); g.connect(gain); osc.start();
      extras.push(osc, lfo);
    });
    return { source: extras[0], gainNode: gain, extras };
  }

  return null;
}

function toggleSound(type) {
  if (S.sound.current === type) { stopAllSounds(); return; }
  stopAllSounds();
  try {
    const nodes = makeSound(type);
    if (!nodes) return;
    S.sound.nodes = nodes;
    S.sound.current = type;
    document.getElementById(`snd-${type}`)?.classList.add('playing');
  } catch(e) { console.error(e); }
}

function stopAllSounds() {
  const n = S.sound.nodes;
  [n.source, ...(n.extras || [])].forEach(x => { try { x?.stop(); } catch(e) {} });
  S.sound.nodes = {}; S.sound.current = null;
  document.querySelectorAll('.sound-btn').forEach(b => b.classList.remove('playing'));
}

function setVolume(v) {
  S.sound.vol = parseFloat(v);
  if (S.sound.nodes.gainNode) S.sound.nodes.gainNode.gain.setValueAtTime(S.sound.vol, ctx().currentTime);
}

// ── NAVIGATION ─────────────────────────────────
function navigate(view) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.getElementById(`view-${view}`).classList.add('active');
  document.getElementById(`nav-${view}`)?.classList.add('active');
  if (view !== 'breath' && S.breath.on) stopBreathing();
}

// ── HOME CHECK-IN ───────────────────────────────
async function sendCheckin() {
  const text = document.getElementById('checkin-input').value.trim();
  if (!text) return;
  const btn = document.getElementById('checkin-btn');
  btn.disabled = true; btn.style.opacity = '0.5';

  const reply = document.getElementById('checkin-reply');
  const chips = document.getElementById('checkin-chips');
  reply.style.display = 'block';
  reply.innerHTML = '<div class="dots"><span></span><span></span><span></span></div>';
  chips.innerHTML = '';

  const res = await claude(text,
    `Du bist ein einfühlsamer, ruhiger Begleiter in einer Calm-App. Der Nutzer beschreibt wie er sich fühlt. Antworte in 2 ruhigen Sätzen: validiere das Gefühl warmherzig und empfehle sanft eine Funktion (Atemübung, Journal, Meditation oder Affirmation). Ton: warm, menschlich, niemals klinisch. Nur auf Deutsch.`
  );

  btn.disabled = false; btn.style.opacity = '1';
  reply.textContent = res || 'Ich bin für dich da. Was würde dir jetzt gut tun?';

  const lower = (res || '').toLowerCase();
  const suggestions = [];
  if (lower.includes('atem')) suggestions.push({ label: '🌬️ Atemübung', view: 'breath' });
  if (lower.includes('journal') || lower.includes('schreib')) suggestions.push({ label: '📓 Journal', view: 'journal' });
  if (lower.includes('meditation') || lower.includes('ruhe')) suggestions.push({ label: '🧘 Meditation', view: 'meditation' });
  if (lower.includes('affirmation') || lower.includes('stärke')) suggestions.push({ label: '✦ Affirmation', view: 'affirmations' });

  if (suggestions.length) {
    chips.innerHTML = suggestions.map(s =>
      `<button class="checkin-chip" onclick="navigate('${s.view}')">${s.label}</button>`
    ).join('');
  }
  document.getElementById('checkin-input').value = '';
}

// ── HOME QUOTE ──────────────────────────────────
function renderQuote() {
  document.getElementById('daily-quote').textContent =
    `„${S.affs[new Date().getDate() % S.affs.length]}"`;
}

// ── BREATHING ──────────────────────────────────
function updateBreath() {
  const orb = document.getElementById('breath-orb');
  orb.classList.remove('inhale', 'exhale');
  if (S.breath.phase === 'inhale') orb.classList.add('inhale');
  if (S.breath.phase === 'exhale') orb.classList.add('exhale');
  const labels = { idle: 'Tippen', inhale: 'Einatmen', hold: 'Halten', exhale: 'Ausatmen' };
  document.getElementById('breath-phase').textContent = labels[S.breath.phase] || '';
  document.getElementById('breath-count').textContent = S.breath.count > 0 ? S.breath.count : (S.breath.phase === 'idle' ? '▷' : '');
  document.getElementById('breath-cycles').textContent = S.breath.cycles > 0 ? `${S.breath.cycles} Zyklen` : '';
}

function phase(dur, name, cb) {
  S.breath.phase = name; S.breath.count = dur; updateBreath();
  let r = dur - 1;
  S.breath.timer = setInterval(() => {
    if (!S.breath.on) { clearInterval(S.breath.timer); return; }
    S.breath.count = r; updateBreath();
    if (r-- <= 0) { clearInterval(S.breath.timer); cb(); }
  }, 1000);
}

function cycle() {
  if (!S.breath.on) return;
  const p = S.patterns[S.breath.pattern];
  phase(p.inhale, 'inhale', () => phase(p.hold, 'hold', () =>
    phase(p.exhale, 'exhale', () => { S.breath.cycles++; cycle(); })
  ));
}

function startBreathing() {
  S.breath.on = true; S.breath.cycles = 0;
  document.getElementById('btn-start').style.display = 'none';
  document.getElementById('btn-stop').style.display = 'inline-flex';
  cycle();
}

function stopBreathing() {
  S.breath.on = false; clearInterval(S.breath.timer);
  S.breath.phase = 'idle'; S.breath.count = 0; updateBreath();
  document.getElementById('btn-start').style.display = 'inline-flex';
  document.getElementById('btn-stop').style.display = 'none';
}

function selectPattern(key) {
  S.breath.pattern = key;
  document.querySelectorAll('.pattern-chip').forEach(c => c.classList.toggle('active', c.dataset.pattern === key));
  if (S.breath.on) { stopBreathing(); startBreathing(); }
}

// ── MEDITATION ─────────────────────────────────
function startMeditation(key) {
  const med = MEDS[key];
  S.med = { on: true, key, step: 0, timer: null, total: med.steps.reduce((a, s) => a + s.d, 0) };
  document.getElementById('med-title').textContent = med.title;
  document.getElementById('med-list').style.display = 'none';
  document.getElementById('med-player').style.display = 'block';
  document.getElementById('view-meditation').scrollTo({ top: 0, behavior: 'smooth' });
  renderMedStep(); startStepTimer();
}

function renderMedStep() {
  const med = MEDS[S.med.key];
  const i = S.med.step;
  const step = med.steps[i];
  const el = document.getElementById('med-step-txt');
  el.style.opacity = '0';
  setTimeout(() => { el.textContent = step.text; el.style.opacity = '1'; }, 180);
  document.getElementById('med-counter').textContent = `${i + 1} / ${med.steps.length}`;

  // dots
  document.getElementById('med-dots').innerHTML = med.steps.map((_, j) =>
    `<span class="med-dot${j === i ? ' on' : ''}"></span>`).join('');

  document.getElementById('med-prev').disabled = i === 0;
  const isLast = i === med.steps.length - 1;
  document.getElementById('med-next').innerHTML = isLast
    ? 'Abschließen'
    : `Weiter <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>`;

  const prev = med.steps.slice(0, i).reduce((a, s) => a + s.d, 0);
  document.getElementById('med-bar').style.width = ((prev / S.med.total) * 100) + '%';
}

function startStepTimer() {
  const med = MEDS[S.med.key];
  const step = med.steps[S.med.step];
  let elapsed = 0;
  clearInterval(S.med.timer);
  S.med.timer = setInterval(() => {
    elapsed++;
    const prev = med.steps.slice(0, S.med.step).reduce((a, s) => a + s.d, 0);
    document.getElementById('med-bar').style.width = (((prev + elapsed) / S.med.total) * 100) + '%';
    if (elapsed >= step.d) {
      clearInterval(S.med.timer);
      if (S.med.step < med.steps.length - 1) { S.med.step++; renderMedStep(); startStepTimer(); }
      else finishMed();
    }
  }, 1000);
}

function medNext() {
  const med = MEDS[S.med.key];
  clearInterval(S.med.timer);
  if (S.med.step < med.steps.length - 1) { S.med.step++; renderMedStep(); startStepTimer(); }
  else finishMed();
}

function medPrev() {
  if (S.med.step > 0) { clearInterval(S.med.timer); S.med.step--; renderMedStep(); startStepTimer(); }
}

function finishMed() {
  S.med.on = false;
  const el = document.getElementById('med-step-txt');
  el.style.opacity = '0';
  setTimeout(() => { el.textContent = 'Wunderbar. Du hast es geschafft. 🌸'; el.style.opacity = '1'; }, 200);
  document.getElementById('med-bar').style.width = '100%';
  document.getElementById('med-counter').textContent = 'Abgeschlossen';
}

function stopMeditation() {
  S.med.on = false; clearInterval(S.med.timer);
  document.getElementById('med-player').style.display = 'none';
  document.getElementById('med-list').style.display = 'block';
  document.getElementById('med-bar').style.width = '0%';
}

// ── JOURNAL ────────────────────────────────────
function setMood(m) {
  S.mood = m;
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.toggle('on', b.dataset.mood === m));
}

function saveJournal() { localStorage.setItem('calm_j', JSON.stringify(S.journal)); }

async function saveEntry() {
  const text = document.getElementById('j-input').value.trim();
  if (!text) return;
  const entry = { id: Date.now(), text, mood: S.mood || 'neutral', date: new Date().toLocaleDateString('de-DE', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }), ai: null };
  S.journal.unshift(entry); saveJournal();
  document.getElementById('j-input').value = '';
  S.mood = null;
  document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('on'));
  renderEntries();

  if (S.apiKey) {
    const aiEl = document.querySelector('.entry-ai');
    if (aiEl) {
      aiEl.style.display = 'block';
      aiEl.innerHTML = '<div class="dots"><span></span><span></span><span></span></div>';
      const res = await claude(`Stimmung: ${entry.mood}. Eintrag: "${text}"`,
        `Du bist ein mitfühlender Begleiter. Antworte auf Tagebucheinträge kurz (2 Sätze), warmherzig, validiere Gefühle. Kein Rat, nur Verständnis. Auf Deutsch.`);
      entry.ai = res; saveJournal();
      aiEl.innerHTML = res ? `<span style="font-size:0.7rem;color:var(--text3);display:block;margin-bottom:3px;">✦ Claude</span>${esc(res)}` : '';
      if (!res) aiEl.style.display = 'none';
    }
  }
}

const moods = { calm:'😌', anxious:'😰', sad:'😔', angry:'😤', neutral:'😐' };

function renderEntries() {
  const el = document.getElementById('entries');
  if (!S.journal.length) { el.innerHTML = `<p style="text-align:center;padding:20px;color:var(--text3);">Noch keine Einträge.</p>`; return; }
  el.innerHTML = S.journal.map(e => `
    <div class="entry">
      <div class="entry-meta">${moods[e.mood] || ''} ${e.date}<button onclick="delEntry(${e.id})" style="margin-left:auto;background:none;border:none;color:var(--text3);cursor:pointer;font-size:0.72rem;">✕</button></div>
      <div class="entry-text">${esc(e.text)}</div>
      ${e.ai ? `<div class="entry-ai"><span style="font-size:0.7rem;color:var(--text3);display:block;margin-bottom:3px;">✦ Claude</span>${esc(e.ai)}</div>` : '<div class="entry-ai" style="display:none"></div>'}
    </div>`).join('');
}

function delEntry(id) { S.journal = S.journal.filter(e => e.id !== id); saveJournal(); renderEntries(); }
function esc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ── AFFIRMATIONS ────────────────────────────────
function showAff(i) {
  if (i !== undefined) S.affIdx = i;
  const el = document.getElementById('aff-txt');
  el.style.opacity = '0';
  setTimeout(() => { el.textContent = S.affs[S.affIdx]; el.style.opacity = '1'; }, 150);
}
function affNext() { S.affIdx = (S.affIdx + 1) % S.affs.length; showAff(); }
function affPrev() { S.affIdx = (S.affIdx - 1 + S.affs.length) % S.affs.length; showAff(); }

async function genAffirmation() {
  const topic = document.getElementById('aff-topic').value.trim() || 'Angstbewältigung';
  const btn = document.getElementById('aff-btn');
  btn.textContent = '…'; btn.disabled = true;
  const res = await claude(`Thema: ${topic}`,
    `Erstelle eine kurze kraftvolle Affirmation (max 12 Wörter) auf Deutsch. Beginne mit "Ich". Nur die Affirmation, kein Anführungszeichen.`);
  btn.textContent = 'Generieren'; btn.disabled = false;
  if (res) { S.affs.unshift(res.trim()); S.affIdx = 0; showAff(); }
}

// ── CONTACTS ───────────────────────────────────
function saveContacts() { localStorage.setItem('calm_c', JSON.stringify(S.contacts)); }

function renderContacts() {
  const el = document.getElementById('contacts');
  if (!S.contacts.length) { el.innerHTML = `<p style="text-align:center;padding:16px;color:var(--text3);">Noch keine Kontakte.</p>`; return; }
  el.innerHTML = S.contacts.map((c, i) => `
    <div class="contact-row">
      <div class="contact-av">${c.name[0]?.toUpperCase()}</div>
      <div class="contact-info"><div class="contact-name">${esc(c.name)}</div><div class="contact-rel">${esc(c.rel || '')} · ${esc(c.phone)}</div></div>
      <a href="tel:${c.phone}" class="icon-btn">📞</a>
      <button class="icon-btn" onclick="delContact(${i})">✕</button>
    </div>`).join('');
}

function addContact() {
  const name = document.getElementById('c-name').value.trim();
  const phone = document.getElementById('c-phone').value.trim();
  const rel = document.getElementById('c-rel').value.trim();
  if (!name || !phone) return;
  S.contacts.push({ name, phone, rel }); saveContacts(); renderContacts();
  ['c-name','c-phone','c-rel'].forEach(id => document.getElementById(id).value = '');
  toggleForm(false);
}

function delContact(i) { S.contacts.splice(i, 1); saveContacts(); renderContacts(); }
function toggleForm(show) { document.getElementById('add-form').classList.toggle('open', show); }

// ── SETTINGS ───────────────────────────────────
function saveApiKey() {
  S.apiKey = document.getElementById('api-key-input').value.trim();
  localStorage.setItem('calm_key', S.apiKey);
  document.getElementById('api-banner').style.display = 'none';
  toast('API-Key gespeichert ✓');
}

function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}

// ── CLAUDE API ─────────────────────────────────
async function claude(msg, system) {
  if (!S.apiKey) return null;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': S.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 300, system, messages: [{ role: 'user', content: msg }] }),
    });
    const d = await res.json();
    return d.content?.[0]?.text || null;
  } catch { return null; }
}

// ── INIT ───────────────────────────────────────
function init() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/public/sw.js').catch(() => {});
  if (S.apiKey) document.getElementById('api-banner').style.display = 'none';
  renderQuote(); renderEntries(); renderContacts(); showAff(0); navigate('home');
}

document.addEventListener('DOMContentLoaded', init);

// globals
Object.assign(window, {
  navigate, sendCheckin, saveApiKey,
  startBreathing, stopBreathing, selectPattern,
  toggleSound, stopAllSounds, setVolume,
  startMeditation, stopMeditation, medNext, medPrev,
  setMood, saveEntry, delEntry,
  affNext, affPrev, genAffirmation,
  addContact, delContact, toggleForm,
});
