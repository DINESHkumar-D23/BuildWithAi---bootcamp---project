/* ============================================================
   CYBER ESCAPE ROOM — game.js
   Complete game logic for all 10 levels + 5 bonus mini-games
   ============================================================ */

'use strict';

/* ─────────────────────────────────────────
   CONSTANTS & CONFIG
───────────────────────────────────────── */
const TOTAL_TIME = 60 * 60; // 60 minutes in seconds
const SAVE_KEY   = 'cyberEscapeRoom_save';

const LEVELS = [
  {
    id: 1,
    name: 'Password Vault',
    icon: '🔐',
    color: '#00d4ff',
    desc: 'Crack the password from given hints',
    concepts: ['Password Security', 'Brute Force'],
    clue: { type: 'IP FRAGMENT', value: '203.0.___._5' },
    scoreMax: 1000
  },
  {
    id: 2,
    name: 'Caesar Cipher',
    icon: '🔄',
    color: '#b400ff',
    desc: 'Decrypt the encrypted message',
    concepts: ['Classical Cryptography', 'Substitution Cipher'],
    clue: { type: 'USERNAME FRAGMENT', value: 'SHADOW___' },
    scoreMax: 1200
  },
  {
    id: 3,
    name: 'Binary Decoder',
    icon: '01',
    color: '#00ff88',
    desc: 'Convert binary to readable text',
    concepts: ['Data Representation', 'ASCII Encoding'],
    clue: { type: 'ENCRYPTION KEY', value: '___K_T' },
    scoreMax: 1100
  },
  {
    id: 4,
    name: 'QR Threat Hunt',
    icon: '📷',
    color: '#ffd700',
    desc: 'Identify the malicious QR code',
    concepts: ['Phishing Detection', 'QR Scams'],
    clue: { type: 'IP FRAGMENT', value: '___.0.113._5' },
    scoreMax: 900
  },
  {
    id: 5,
    name: 'Log Analysis',
    icon: '📋',
    color: '#ff6b00',
    desc: 'Find the suspicious IP from logs',
    concepts: ['SOC Monitoring', 'Threat Hunting'],
    clue: { type: 'IP ADDRESS', value: '203.0.113.45' },
    scoreMax: 1000
  },
  {
    id: 6,
    name: 'Phishing Detective',
    icon: '🎣',
    color: '#ff003c',
    desc: 'Identify red flags in phishing email',
    concepts: ['Email Security', 'Social Engineering'],
    clue: { type: 'DOMAIN', value: 'amaz0n-security.com' },
    scoreMax: 1300
  },
  {
    id: 7,
    name: 'Hash Verifier',
    icon: '#',
    color: '#00ff88',
    desc: 'Verify file integrity using hashes',
    concepts: ['Integrity Checking', 'SHA Hashing'],
    clue: { type: 'USERNAME FRAGMENT', value: 'SHADOW_O_' },
    scoreMax: 1000
  },
  {
    id: 8,
    name: 'SQL Defense',
    icon: '💉',
    color: '#b400ff',
    desc: 'Identify the SQL injection attack',
    concepts: ['Web Security', 'Input Validation'],
    clue: { type: 'ALIAS', value: '___DOWFOX' },
    scoreMax: 1100
  },
  {
    id: 9,
    name: 'Network Maze',
    icon: '🌐',
    color: '#00d4ff',
    desc: 'Choose the safe route to isolate attacker',
    concepts: ['Network Security', 'Segmentation'],
    clue: { type: 'LOCATION', value: 'NODE: 203.0.___.45' },
    scoreMax: 1200
  },
  {
    id: 10,
    name: 'Trace the Hacker',
    icon: '🎯',
    color: '#ff003c',
    desc: 'FINAL BOSS — Identify and capture the attacker',
    concepts: ['Digital Forensics', 'Threat Intelligence'],
    clue: { type: 'FULL IDENTITY', value: '203.0.113.45 | SHADOWFOX' },
    scoreMax: 2000
  }
];

const BONUS_GAMES = [
  { id: 'cracker',  name: 'Password Cracker', icon: '🔓', desc: 'See how long your password takes to crack' },
  { id: 'morse',    name: 'Morse Code',        icon: '📡', desc: 'Decode secret Morse messages' },
  { id: 'memory',   name: 'Cyber Memory Match', icon: '🧩', desc: 'Match cybersecurity terms & definitions' },
  { id: 'forensics',name: 'Digital Forensics',  icon: '🔍', desc: 'Find hidden evidence in digital artifacts' },
  { id: 'firewall', name: 'Firewall Builder',   icon: '🛡️', desc: 'Drag & drop firewall rules' }
];

/* ─────────────────────────────────────────
   GAME STATE
───────────────────────────────────────── */
let state = {
  currentLevel: 1,
  completedLevels: [],
  score: 0,
  attempts: {},
  clues: [],
  timerSeconds: TOTAL_TIME,
  timerInterval: null,
  isPaused: false,
  gameStarted: false
};

/* ─────────────────────────────────────────
   DOM HELPERS
───────────────────────────────────────── */
const $ = id => document.getElementById(id);
const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
};

/* ─────────────────────────────────────────
   MATRIX RAIN
───────────────────────────────────────── */
(function initMatrix() {
  const canvas = $('matrixCanvas');
  const ctx = canvas.getContext('2d');
  let drops = [];
  const chars = '01アイウエオカキクケコ0011HACKERSHADOWFOX';

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const cols = Math.floor(canvas.width / 14);
    drops = Array.from({ length: cols }, () => Math.random() * -canvas.height / 14);
  }

  function draw() {
    ctx.fillStyle = 'rgba(5, 10, 15, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff88';
    ctx.font = '12px Share Tech Mono';
    drops.forEach((y, i) => {
      const char = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(char, i * 14, y * 14);
      if (y * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i] += 0.5;
    });
  }

  resize();
  window.addEventListener('resize', resize);
  setInterval(draw, 50);
})();

/* ─────────────────────────────────────────
   GLITCH EFFECT
───────────────────────────────────────── */
function triggerGlitch() {
  const overlay = $('glitchOverlay');
  overlay.style.opacity = '1';
  overlay.style.background = `rgba(${Math.random() > 0.5 ? '0,255,136' : '180,0,255'},0.04)`;
  overlay.style.transform = `translateX(${(Math.random()-0.5)*6}px)`;
  setTimeout(() => {
    overlay.style.opacity = '0';
    overlay.style.transform = 'none';
  }, 80);
}

setInterval(() => { if (Math.random() < 0.15) triggerGlitch(); }, 2000);

/* ─────────────────────────────────────────
   TYPEWRITER
───────────────────────────────────────── */
function typeWriter(el, text, speed = 35, cb) {
  el.innerHTML = '';
  let i = 0;
  const cursor = '<span style="color:var(--neon-green);animation:timerPulse 0.8s infinite">▋</span>';
  const interval = setInterval(() => {
    el.innerHTML = text.substring(0, i) + cursor;
    i++;
    if (i > text.length) {
      clearInterval(interval);
      el.innerHTML = text;
      if (cb) cb();
    }
  }, speed);
}

/* ─────────────────────────────────────────
   INTRO SCREEN
───────────────────────────────────────── */
const storyLines = [
  '> INCOMING TRANSMISSION...',
  '> YEAR: 2030',
  '> CLASSIFICATION: CRITICAL',
  '',
  'You are a junior cyber analyst.',
  'Unknown attackers have breached the corporate network.',
  '',
  '"You have 60 minutes before all company data',
  ' is encrypted. Solve the challenges,',
  ' trace the attacker, and stop the breach."',
  '',
  '> MISSION: BREACH PROTOCOL ACTIVATED',
  '> GOOD LUCK, AGENT.'
];

function initIntro() {
  const saved = loadSave();
  if (saved) $('continueBtn').style.display = 'inline-block';

  const storyEl = $('storyText');
  const fullText = storyLines.join('\n');
  typeWriter(storyEl, fullText, 30);

  $('startBtn').addEventListener('click', startNewGame);
  $('continueBtn').addEventListener('click', () => {
    restoreState(saved);
    showGame();
  });
}

/* ─────────────────────────────────────────
   SAVE / LOAD
───────────────────────────────────────── */
function saveState() {
  const data = {
    currentLevel: state.currentLevel,
    completedLevels: state.completedLevels,
    score: state.score,
    attempts: state.attempts,
    clues: state.clues,
    timerSeconds: state.timerSeconds
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function restoreState(saved) {
  Object.assign(state, saved, { timerInterval: null, isPaused: false, gameStarted: true });
}

function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}

/* ─────────────────────────────────────────
   GAME INIT
───────────────────────────────────────── */
function startNewGame() {
  clearSave();
  state = {
    currentLevel: 1,
    completedLevels: [],
    score: 0,
    attempts: {},
    clues: [],
    timerSeconds: TOTAL_TIME,
    timerInterval: null,
    isPaused: false,
    gameStarted: true
  };
  showGame();
}

function showGame() {
  $('introScreen').classList.add('hidden');
  $('hud').classList.remove('hidden');
  $('levelProgress').classList.remove('hidden');
  $('gameArea').classList.remove('hidden');
  buildLevelProgress();
  buildLevelMap();
  showLevelMap();
  startTimer();
  updateHUD();
}

/* ─────────────────────────────────────────
   TIMER
───────────────────────────────────────── */
function startTimer() {
  if (state.timerInterval) clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    if (state.isPaused) return;
    state.timerSeconds--;
    updateTimerDisplay();
    if (state.timerSeconds % 30 === 0) saveState();
    if (state.timerSeconds <= 0) {
      clearInterval(state.timerInterval);
      gameOver();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const m = Math.floor(state.timerSeconds / 60);
  const s = state.timerSeconds % 60;
  const display = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  const timerEl = $('timerDisplay');
  const fillEl  = $('timerFill');

  timerEl.textContent = display;
  const pct = (state.timerSeconds / TOTAL_TIME) * 100;
  fillEl.style.width = pct + '%';

  timerEl.className = 'timer-value';
  if (pct <= 10) {
    timerEl.classList.add('danger');
    fillEl.style.background = 'var(--neon-red)';
  } else if (pct <= 25) {
    timerEl.classList.add('warning');
    fillEl.style.background = 'linear-gradient(90deg, var(--neon-orange), var(--neon-red))';
  }
}

/* ─────────────────────────────────────────
   HUD
───────────────────────────────────────── */
function updateHUD() {
  const lvl = LEVELS[state.currentLevel - 1];
  $('hudLevel').textContent = state.currentLevel;
  $('hudLevelName').textContent = lvl ? lvl.name.toUpperCase() : 'COMPLETE';
  $('hudScore').textContent = state.score.toLocaleString();
  $('hudClues').textContent = `${state.clues.length}/4`;
  updateTimerDisplay();
}

/* ─────────────────────────────────────────
   LEVEL PROGRESS BAR
───────────────────────────────────────── */
function buildLevelProgress() {
  const stages = $('progressStages');
  stages.innerHTML = '';
  LEVELS.forEach((lvl, i) => {
    const dot = el('div', 'stage-dot');
    dot.title = lvl.name;
    dot.addEventListener('click', () => {
      if (state.completedLevels.includes(lvl.id)) openLevel(lvl.id);
    });
    stages.appendChild(dot);
  });
  refreshProgress();
}

function refreshProgress() {
  const dots = $('progressStages').querySelectorAll('.stage-dot');
  dots.forEach((dot, i) => {
    const lvl = LEVELS[i];
    dot.className = 'stage-dot';
    if (state.completedLevels.includes(lvl.id)) dot.classList.add('completed');
    else if (lvl.id === state.currentLevel) dot.classList.add('active');
  });
}

/* ─────────────────────────────────────────
   LEVEL MAP
───────────────────────────────────────── */
function buildLevelMap() {
  const grid = $('networkGrid');
  grid.innerHTML = '';

  LEVELS.forEach(lvl => {
    const isCompleted = state.completedLevels.includes(lvl.id);
    const isLocked    = lvl.id > state.currentLevel && !isCompleted;
    const isAvailable = lvl.id === state.currentLevel || isCompleted;

    const card = el('div', `network-node ${isLocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`);
    card.innerHTML = `
      <div class="node-header">
        <div class="node-icon" style="background:${lvl.color}22;border:1px solid ${lvl.color}44">
          <span style="font-family:var(--font-display);font-size:${lvl.icon.length > 1 ? '0.8rem' : '1.2rem'};color:${lvl.color}">${lvl.icon}</span>
        </div>
        <div>
          <div class="node-number">LEVEL ${String(lvl.id).padStart(2,'0')}</div>
          <div class="node-name">${lvl.name}</div>
        </div>
      </div>
      <div class="node-desc">${lvl.desc}</div>
      <div class="concept-tags">
        ${lvl.concepts.map(c => `<span class="concept-tag">${c}</span>`).join('')}
      </div>
      <div class="node-status" style="margin-top:0.75rem">
        <div class="status-dot ${isCompleted ? 'status-completed' : isLocked ? 'status-locked' : 'status-available'}"></div>
        <span class="status-${isCompleted ? 'completed' : isLocked ? 'locked' : 'available'}" style="font-family:var(--font-mono);font-size:0.72rem;color:${isCompleted ? 'var(--neon-green)' : isLocked ? 'var(--text-muted)' : 'var(--neon-cyan)'}">
          ${isCompleted ? '✓ CLEARED' : isLocked ? '🔒 LOCKED' : '▶ AVAILABLE'}
        </span>
        ${isCompleted ? `<span class="node-score">+${lvl.scoreMax}</span>` : ''}
      </div>
    `;

    if (isAvailable) {
      card.addEventListener('click', () => openLevel(lvl.id));
    }

    grid.appendChild(card);
  });
}

function showLevelMap() {
  $('levelMap').classList.remove('hidden');
  $('levelContainer').classList.add('hidden');
  $('bonusArea').classList.add('hidden');
  buildLevelMap();
  refreshProgress();
  updateHUD();
}

/* ─────────────────────────────────────────
   OPEN LEVEL
───────────────────────────────────────── */
function openLevel(id) {
  if (id === 10) {
    showFinalBoss();
    return;
  }

  const lvl = LEVELS[id - 1];
  state.currentLevel = id;

  $('levelMap').classList.add('hidden');
  $('levelContainer').classList.remove('hidden');
  $('levelBadge').textContent = String(id).padStart(2,'0');
  $('levelTitle').textContent = lvl.name.toUpperCase();
  $('levelDesc').textContent  = lvl.desc;
  $('attemptsDisplay').textContent = state.attempts[id] || 0;
  $('clueReveal').classList.add('hidden');

  updateHUD();
  renderLevel(id);
}

/* ─────────────────────────────────────────
   LEVEL COMPLETE
───────────────────────────────────────── */
function completeLevel(levelId, earnedScore) {
  if (!state.completedLevels.includes(levelId)) {
    state.completedLevels.push(levelId);
    state.score += earnedScore;
    const lvl = LEVELS[levelId - 1];
    if (lvl.clue && state.clues.length < 4) {
      state.clues.push(lvl.clue);
    }
  }

  if (state.currentLevel < 10) {
    state.currentLevel = Math.max(state.currentLevel, levelId + 1);
  }

  saveState();
  refreshProgress();
  updateHUD();
  showLevelCompleteModal(levelId, earnedScore);
}

function showLevelCompleteModal(levelId, score) {
  const lvl = LEVELS[levelId - 1];
  $('levelCompleteTitle').textContent = `${lvl.name} — CLEARED!`;
  $('levelCompleteScore').textContent = `+${score.toLocaleString()} POINTS`;
  if (lvl.clue && state.clues.find(c => c.type === lvl.clue.type)) {
    $('levelCompleteClue').textContent = `🔍 Clue: ${lvl.clue.type} → ${lvl.clue.value}`;
    $('levelCompleteClue').style.display = 'block';
  } else {
    $('levelCompleteClue').style.display = 'none';
  }

  $('levelCompleteModal').classList.remove('hidden');

  $('nextLevelBtn').onclick = () => {
    $('levelCompleteModal').classList.add('hidden');
    const nextId = levelId + 1;
    if (nextId <= 10) {
      openLevel(nextId);
    } else {
      showLevelMap();
    }
  };

  // Show clue reveal in level
  const clueReveal = $('clueReveal');
  if (lvl.clue) {
    $('clueText').textContent = `${lvl.clue.type}: ${lvl.clue.value}`;
    clueReveal.classList.remove('hidden');
  }
}

function calcScore(levelId, attempts, timeBonus) {
  const max = LEVELS[levelId-1].scoreMax;
  const attemptPenalty = Math.min(attempts * 100, max * 0.5);
  const base = max - attemptPenalty;
  return Math.max(100, Math.round(base + timeBonus));
}

function getTimeBonus() {
  return Math.round((state.timerSeconds / TOTAL_TIME) * 200);
}

function incAttempts(levelId) {
  state.attempts[levelId] = (state.attempts[levelId] || 0) + 1;
  $('attemptsDisplay').textContent = state.attempts[levelId];
}

/* ─────────────────────────────────────────
   RENDER LEVEL — DISPATCHER
───────────────────────────────────────── */
function renderLevel(id) {
  const content = $('levelContent');
  content.innerHTML = '';
  const fns = [
    null,
    renderLevel1, renderLevel2, renderLevel3, renderLevel4, renderLevel5,
    renderLevel6, renderLevel7, renderLevel8, renderLevel9
  ];
  if (fns[id]) fns[id](content);
}

/* ─────────────────────────────────────────
   LEVEL 1 — PASSWORD VAULT
───────────────────────────────────────── */
function renderLevel1(container) {
  container.innerHTML = `
    <div class="challenge-box">
      <h3 style="font-family:var(--font-mono);color:var(--text-secondary);margin-bottom:1rem;font-size:0.85rem;letter-spacing:0.1em;">SECURITY VAULT — PASSWORD REQUIRED</h3>
      <p style="font-family:var(--font-mono);font-size:0.85rem;color:var(--text-secondary);margin-bottom:1rem;">
        The vault AI has provided you with password hints. Crack the password:
      </p>
      <ul class="password-hints">
        <li>Exactly 8 characters long</li>
        <li>Starts with the letter <strong style="color:var(--neon-cyan)">C</strong></li>
        <li>Ends with the number <strong style="color:var(--neon-cyan)">3</strong></li>
        <li>Contains the string <strong style="color:var(--neon-cyan)">"ber"</strong></li>
        <li>No special characters</li>
      </ul>
    </div>
    <div class="hint-box">
      Think about words containing "ber" that start with C... like a month or a tech term?
    </div>
    <div class="strength-meter-wrap">
      <div class="strength-label">PASSWORD STRENGTH METER</div>
      <div class="strength-bar"><div class="strength-fill" id="strengthFill"></div></div>
      <div class="strength-text" id="strengthText" style="color:var(--text-muted)">Enter a password to analyze</div>
    </div>
    <div class="answer-input-group">
      <input type="password" id="lvl1Input" class="cyber-input" placeholder="Enter password..." maxlength="20" autocomplete="off" />
      <button class="btn-submit" id="lvl1Submit">UNLOCK</button>
    </div>
    <div class="feedback" id="lvl1Feedback"></div>
    <div class="concept-tags" style="margin-top:1rem">
      <span class="concept-tag">Password Security</span>
      <span class="concept-tag">Brute Force</span>
      <span class="concept-tag">Hint Analysis</span>
    </div>
  `;

  const input = $('lvl1Input');
  const fill  = $('strengthFill');
  const txt   = $('strengthText');

  input.addEventListener('input', () => {
    const v = input.value;
    let str = 0;
    if (v.length >= 8)          str += 20;
    if (/[A-Z]/.test(v))        str += 20;
    if (/[a-z]/.test(v))        str += 20;
    if (/[0-9]/.test(v))        str += 20;
    if (/[^A-Za-z0-9]/.test(v)) str += 20;
    fill.style.width = str + '%';
    fill.style.background = str < 40 ? 'var(--neon-red)' : str < 70 ? 'var(--neon-orange)' : 'var(--neon-green)';
    txt.style.color = str < 40 ? 'var(--neon-red)' : str < 70 ? 'var(--neon-orange)' : 'var(--neon-green)';
    txt.textContent = str < 40 ? '⚠ WEAK' : str < 70 ? '⚡ MODERATE' : '✓ STRONG';
  });

  $('lvl1Submit').addEventListener('click', () => checkLevel1(input));
  input.addEventListener('keydown', e => { if (e.key === 'Enter') checkLevel1(input); });
  input.focus();
}

function checkLevel1(input) {
  const val = input.value.trim();
  const fb  = $('lvl1Feedback');
  incAttempts(1);

  // Valid answers: Cyber123, October3 (starts C, ends 3, contains ber, 8 chars)
  const correct = /^C[A-Za-z0-9]*ber[A-Za-z0-9]*3$/.test(val) && val.length === 8;

  if (correct || val.toLowerCase() === 'cyber123') {
    fb.className = 'feedback success visible';
    fb.textContent = `✓ ACCESS GRANTED! Password "${val}" accepted. Vault unlocked.`;
    completeLevel(1, calcScore(1, state.attempts[1] || 1, getTimeBonus()));
  } else {
    fb.className = 'feedback error visible';
    if (val.length !== 8) fb.textContent = '✗ Incorrect length. Must be exactly 8 characters.';
    else if (!val.startsWith('C')) fb.textContent = '✗ Must start with "C".';
    else if (!val.endsWith('3')) fb.textContent = '✗ Must end with "3".';
    else if (!val.includes('ber')) fb.textContent = '✗ Must contain "ber".';
    else fb.textContent = '✗ Wrong password. Check all hints carefully.';
  }
}

/* ─────────────────────────────────────────
   LEVEL 2 — CAESAR CIPHER
───────────────────────────────────────── */
function renderLevel2(container) {
  const encrypted = 'KHOOR DJHQW';
  const answer    = 'HELLO AGENT';

  container.innerHTML = `
    <div class="challenge-box">
      <p style="font-family:var(--font-mono);font-size:0.85rem;color:var(--text-secondary);margin-bottom:1rem;">
        An intercepted message has been encrypted with a Caesar cipher. Decrypt it:
      </p>
      <div class="cipher-display cipher-encrypted" id="encryptedMsg">${encrypted}</div>
      <p style="font-family:var(--font-mono);font-size:0.78rem;color:var(--text-muted);text-align:center;margin-top:0.5rem;">
        ↑ ENCRYPTED MESSAGE
      </p>
    </div>
    <div class="hint-box">
      Caesar cipher shifts each letter by a fixed number. Try Shift = 3.
    </div>
    <div style="text-align:center;">
      <div class="shift-control">
        <button class="shift-btn" id="shiftDown">◀</button>
        <div>
          <div style="font-family:var(--font-mono);font-size:0.7rem;color:var(--text-muted);letter-spacing:0.2em">SHIFT</div>
          <div class="shift-value" id="shiftVal">0</div>
        </div>
        <button class="shift-btn" id="shiftUp">▶</button>
      </div>
      <div class="cipher-display cipher-decrypted" id="decryptedMsg">${encrypted}</div>
      <p style="font-family:var(--font-mono);font-size:0.78rem;color:var(--text-muted);margin-top:0.5rem;">
        ↑ DECRYPTED RESULT
      </p>
    </div>
    <div class="answer-input-group">
      <input type="text" id="lvl2Input" class="cyber-input" placeholder="Type the decrypted message..." maxlength="30" autocomplete="off" style="text-transform:uppercase" />
      <button class="btn-submit" id="lvl2Submit">VERIFY</button>
    </div>
    <div class="feedback" id="lvl2Feedback"></div>
    <div class="concept-tags" style="margin-top:1rem">
      <span class="concept-tag">Caesar Cipher</span>
      <span class="concept-tag">Substitution</span>
      <span class="concept-tag">Cryptography</span>
    </div>
  `;

  let shift = 0;

  function decryptCaesar(text, n) {
    return text.replace(/[A-Z]/g, c => {
      return String.fromCharCode(((c.charCodeAt(0) - 65 - n + 26) % 26) + 65);
    });
  }

  function updateCipher() {
    $('shiftVal').textContent = shift;
    $('decryptedMsg').textContent = decryptCaesar(encrypted, shift);
    $('lvl2Input').value = decryptCaesar(encrypted, shift);
  }

  $('shiftDown').addEventListener('click', () => { shift = (shift - 1 + 26) % 26; updateCipher(); });
  $('shiftUp').addEventListener('click',   () => { shift = (shift + 1) % 26; updateCipher(); });
  $('lvl2Input').addEventListener('input', e => { e.target.value = e.target.value.toUpperCase(); });

  $('lvl2Submit').addEventListener('click', () => checkLevel2());
  $('lvl2Input').addEventListener('keydown', e => { if (e.key === 'Enter') checkLevel2(); });

  function checkLevel2() {
    const val = $('lvl2Input').value.trim().toUpperCase();
    const fb  = $('lvl2Feedback');
    incAttempts(2);
    if (val === answer) {
      fb.className = 'feedback success visible';
      fb.textContent = `✓ DECRYPTED! The message is "${answer}". Cipher broken!`;
      completeLevel(2, calcScore(2, state.attempts[2] || 1, getTimeBonus()));
    } else {
      fb.className = 'feedback error visible';
      fb.textContent = `✗ "${val}" is incorrect. Adjust the shift value and try again.`;
    }
  }
}

/* ─────────────────────────────────────────
   LEVEL 3 — BINARY DECODER
───────────────────────────────────────── */
function renderLevel3(container) {
  const binaryGroups = ['01001000', '01000001', '01000011', '01001011'];
  const answer = 'HACK';

  const refRows = [];
  for (let i = 65; i <= 90; i++) {
    refRows.push(`<div class="binary-ref-item"><span class="ref-char">${String.fromCharCode(i)}</span><span class="ref-bin">${i.toString(2).padStart(8,'0')}</span></div>`);
  }
  for (let i = 48; i <= 57; i++) {
    refRows.push(`<div class="binary-ref-item"><span class="ref-char">${String.fromCharCode(i)}</span><span class="ref-bin">${i.toString(2).padStart(8,'0')}</span></div>`);
  }

  container.innerHTML = `
    <div class="challenge-box">
      <p style="font-family:var(--font-mono);font-size:0.85rem;color:var(--text-secondary);margin-bottom:1rem;">
        A hidden message was found in binary form. Convert it to text:
      </p>
      <div class="binary-display" id="binaryDisplay">
        ${binaryGroups.map(g => `<span class="binary-group" title="= ${parseInt(g,2)} = ${String.fromCharCode(parseInt(g,2))}">${g}</span>`).join(' ')}
      </div>
      <p style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-muted);text-align:center">
        💡 Hover over binary groups to reveal ASCII values
      </p>
    </div>
    <div class="hint-box">
      Each 8-bit binary group = 1 ASCII character. Use the reference table below.
    </div>
    <details style="margin-bottom:1rem;">
      <summary style="cursor:pointer;font-family:var(--font-mono);font-size:0.8rem;color:var(--neon-cyan);padding:0.5rem;">
        📖 Binary Reference Chart (click to expand)
      </summary>
      <div class="binary-reference">${refRows.join('')}</div>
    </details>
    <div style="font-family:var(--font-mono);font-size:0.85rem;color:var(--text-secondary);margin-bottom:0.5rem;">
      Real-time decoder: <span id="rtDecoder" style="color:var(--neon-green);letter-spacing:0.2em"></span>
    </div>
    <div class="answer-input-group">
      <input type="text" id="lvl3Input" class="cyber-input" placeholder="Type the decoded text..." maxlength="20" autocomplete="off" style="text-transform:uppercase" />
      <button class="btn-submit" id="lvl3Submit">DECODE</button>
    </div>
    <div class="feedback" id="lvl3Feedback"></div>
    <div class="concept-tags" style="margin-top:1rem">
      <span class="concept-tag">Binary</span>
      <span class="concept-tag">ASCII</span>
      <span class="concept-tag">Data Representation</span>
    </div>
  `;

  $('lvl3Input').addEventListener('input', e => {
    e.target.value = e.target.value.toUpperCase();
    // real-time decode
    const v = e.target.value;
    // try converting each char to binary and show
    $('rtDecoder').textContent = v.split('').map(c =>
      c.charCodeAt(0).toString(2).padStart(8,'0')
    ).join(' ');
  });

  $('lvl3Submit').addEventListener('click', () => checkLevel3());
  $('lvl3Input').addEventListener('keydown', e => { if (e.key === 'Enter') checkLevel3(); });

  function checkLevel3() {
    const val = $('lvl3Input').value.trim().toUpperCase();
    const fb  = $('lvl3Feedback');
    incAttempts(3);
    if (val === answer) {
      fb.className = 'feedback success visible';
      fb.textContent = `✓ CORRECT! Binary decoded to "${answer}". Message intercepted!`;
      completeLevel(3, calcScore(3, state.attempts[3] || 1, getTimeBonus()));
    } else {
      fb.className = 'feedback error visible';
      fb.textContent = `✗ "${val}" is wrong. Convert each 8-bit group using the reference chart.`;
    }
  }
}

/* ─────────────────────────────────────────
   LEVEL 4 — QR THREAT INVESTIGATION
───────────────────────────────────────── */
function renderLevel4(container) {
  const qrCodes = [
    { url: 'https://amazon.com', type: 'legit', label: 'QR Code A' },
    { url: 'https://google.com/security', type: 'legit', label: 'QR Code B' },
    { url: 'https://amaz0n-login-security.com', type: 'malicious', label: 'QR Code C' },
    { url: 'https://paypa1-verification.net', type: 'malicious', label: 'QR Code D' },
    { url: 'https://github.com/security', type: 'legit', label: 'QR Code E' },
    { url: 'https://secure-bank-auth0.xyz', type: 'malicious', label: 'QR Code F' }
  ];

  function makeQR(seed, isLegit) {
    const grid = [];
    const rng = (n) => { seed = (seed * 1664525 + 1013904223) & 0xFFFFFFFF; return Math.abs(seed % n); };
    for (let i = 0; i < 49; i++) {
      // corners are always filled (finder patterns)
      const row = Math.floor(i / 7), col = i % 7;
      const inCorner = (row < 3 && col < 3) || (row < 3 && col > 3) || (row > 3 && col < 3);
      grid.push(inCorner ? true : rng(100) < (isLegit ? 45 : 55));
    }
    return grid;
  }

  let selectedMalicious = new Set();
  let selectedLegit = new Set();

  container.innerHTML = `
    <div class="challenge-box">
      <p style="font-family:var(--font-mono);font-size:0.85rem;color:var(--text-secondary);margin-bottom:1rem;">
        Security team found several QR codes in the office. Identify the <strong style="color:var(--neon-red)">MALICIOUS</strong> ones
        (phishing URLs) and the <strong style="color:var(--neon-green)">LEGITIMATE</strong> ones.
      </p>
    </div>
    <div class="hint-box">
      Look for: typosquatting (amaz0n vs amazon), suspicious domains (.xyz, .net for banks), fake security pages.
    </div>
    <div class="qr-grid" id="qrGrid"></div>
    <div style="font-family:var(--font-mono);font-size:0.82rem;color:var(--text-secondary);margin-bottom:1rem;">
      Selected: <span id="qrCount" style="color:var(--neon-cyan)">0 malicious, 0 legit</span>
    </div>
    <button class="btn-submit" id="lvl4Submit" style="width:100%">SUBMIT ANALYSIS</button>
    <div class="feedback" id="lvl4Feedback"></div>
    <div class="concept-tags" style="margin-top:1rem">
      <span class="concept-tag">Phishing Detection</span>
      <span class="concept-tag">QR Scams</span>
      <span class="concept-tag">Typosquatting</span>
    </div>
  `;

  const grid = $('qrGrid');
  qrCodes.forEach((qr, idx) => {
    const card = el('div', 'qr-card');
    const pixels = makeQR(idx * 12345 + 67890, qr.type === 'legit');

    card.innerHTML = `
      <div style="font-family:var(--font-mono);font-size:0.7rem;color:var(--text-muted);margin-bottom:0.5rem;letter-spacing:0.1em">${qr.label}</div>
      <div class="qr-image" id="qr-img-${idx}"></div>
      <div class="qr-url ${qr.type}">${qr.url}</div>
      <div style="display:flex;gap:0.4rem;margin-top:0.5rem">
        <button class="qr-select-btn" data-idx="${idx}" data-type="malicious" style="border-color:rgba(255,0,60,0.3);color:var(--neon-red)">🚨 MALICIOUS</button>
        <button class="qr-select-btn" data-idx="${idx}" data-type="legit" style="border-color:rgba(0,255,136,0.3);color:var(--neon-green)">✓ LEGIT</button>
      </div>
    `;

    grid.appendChild(card);

    // Draw QR pixels
    const imgDiv = card.querySelector(`#qr-img-${idx}`);
    pixels.forEach(filled => {
      const px = el('div', 'qr-pixel');
      px.style.background = filled ? (qr.type === 'legit' ? '#00ff88' : '#ff003c') : 'rgba(255,255,255,0.05)';
      imgDiv.appendChild(px);
    });
  });

  grid.addEventListener('click', e => {
    const btn = e.target.closest('[data-idx]');
    if (!btn) return;
    const idx  = parseInt(btn.dataset.idx);
    const type = btn.dataset.type;

    if (type === 'malicious') {
      if (selectedMalicious.has(idx)) selectedMalicious.delete(idx);
      else selectedMalicious.add(idx);
      selectedLegit.delete(idx);
    } else {
      if (selectedLegit.has(idx)) selectedLegit.delete(idx);
      else selectedLegit.add(idx);
      selectedMalicious.delete(idx);
    }

    // Update card styling
    grid.querySelectorAll('.qr-card').forEach((c, i) => {
      c.className = 'qr-card';
      if (selectedMalicious.has(i)) c.classList.add('selected-malicious');
      else if (selectedLegit.has(i)) c.classList.add('selected-legit');
    });

    $('qrCount').textContent = `${selectedMalicious.size} malicious, ${selectedLegit.size} legit`;
  });

  $('lvl4Submit').addEventListener('click', () => {
    const maliciousIds = new Set(qrCodes.map((q,i) => q.type === 'malicious' ? i : -1).filter(i => i !== -1));
    let correct = 0;
    let total   = qrCodes.length;

    qrCodes.forEach((qr, i) => {
      if (qr.type === 'malicious' && selectedMalicious.has(i)) correct++;
      if (qr.type === 'legit'     && selectedLegit.has(i))     correct++;
    });

    const fb = $('lvl4Feedback');
    incAttempts(4);
    if (correct === total) {
      fb.className = 'feedback success visible';
      fb.textContent = `✓ PERFECT! All ${total} QR codes correctly identified. Phishing threat neutralized!`;
      completeLevel(4, calcScore(4, state.attempts[4] || 1, getTimeBonus()));
    } else {
      fb.className = 'feedback error visible';
      fb.textContent = `✗ ${correct}/${total} correct. Look for subtle URL differences like numbers replacing letters.`;
    }
  });
}

/* ─────────────────────────────────────────
   LEVEL 5 — LOG ANALYSIS
───────────────────────────────────────── */
function renderLevel5(container) {
  const logs = [
    { ip: '192.168.1.20', action: 'LOGIN', result: 'SUCCESS', cls: 'log-success' },
    { ip: '192.168.1.20', action: 'FILE_ACCESS', result: 'SUCCESS', cls: 'log-success' },
    { ip: '10.0.0.5',     action: 'LOGIN', result: 'SUCCESS', cls: 'log-success' },
    { ip: '203.0.113.45', action: 'LOGIN', result: 'FAILED', cls: 'log-fail' },
    { ip: '203.0.113.45', action: 'LOGIN', result: 'FAILED', cls: 'log-fail' },
    { ip: '203.0.113.45', action: 'LOGIN', result: 'FAILED', cls: 'log-fail' },
    { ip: '203.0.113.45', action: 'LOGIN', result: 'FAILED', cls: 'log-fail' },
    { ip: '203.0.113.45', action: 'LOGIN', result: 'FAILED', cls: 'log-fail' },
    { ip: '192.168.1.20', action: 'LOGOUT', result: 'SUCCESS', cls: 'log-success' },
    { ip: '172.16.0.1',   action: 'LOGIN', result: 'SUCCESS', cls: 'log-success' },
    { ip: '203.0.113.45', action: 'PORT_SCAN', result: 'DETECTED', cls: 'log-fail' },
  ];

  const ips = ['192.168.1.20', '203.0.113.45', '10.0.0.5', '172.16.0.1'];

  container.innerHTML = `
    <div class="challenge-box">
      <p style="font-family:var(--font-mono);font-size:0.85rem;color:var(--text-secondary);margin-bottom:1rem;">
        Analyze the network logs below. Identify the <strong style="color:var(--neon-red)">suspicious IP address</strong>.
      </p>
      <div class="log-terminal" id="logTerminal"></div>
    </div>
    <div class="hint-box">
      Look for: multiple failed logins from the same IP, unusual activity like port scans, external IP addresses.
    </div>
    <p style="font-family:var(--font-mono);font-size:0.85rem;color:var(--text-secondary);margin-bottom:0.75rem;">
      Which IP address is suspicious?
    </p>
    <div class="ip-choices" id="ipChoices"></div>
    <div class="feedback" id="lvl5Feedback"></div>
    <div class="concept-tags" style="margin-top:1rem">
      <span class="concept-tag">SOC Monitoring</span>
      <span class="concept-tag">Threat Hunting</span>
      <span class="concept-tag">Log Analysis</span>
    </div>
  `;

  const logTerminal = $('logTerminal');
  logs.forEach((log, i) => {
    setTimeout(() => {
      const entry = el('div', `log-entry ${log.cls}`);
      entry.innerHTML = `
        <span class="log-ip">${log.ip}</span>
        <span class="log-action">${log.action}</span>
        <span class="log-result">${log.result}</span>
      `;
      logTerminal.appendChild(entry);
      logTerminal.scrollTop = logTerminal.scrollHeight;
    }, i * 120);
  });

  const choicesDiv = $('ipChoices');
  ips.forEach(ip => {
    const btn = el('button', 'ip-choice', ip);
    btn.addEventListener('click', () => {
      incAttempts(5);
      const fb = $('lvl5Feedback');
      if (ip === '203.0.113.45') {
        btn.classList.add('correct');
        fb.className = 'feedback success visible';
        fb.textContent = `✓ CORRECT! 203.0.113.45 — 5 failed login attempts + port scan = brute force attack detected!`;
        completeLevel(5, calcScore(5, state.attempts[5] || 1, getTimeBonus()));
      } else {
        btn.classList.add('wrong');
        fb.className = 'feedback error visible';
        fb.textContent = `✗ ${ip} is an internal network address with normal activity. Check for repeated failures.`;
        setTimeout(() => btn.classList.remove('wrong'), 1500);
      }
    });
    choicesDiv.appendChild(btn);
  });
}

/* ─────────────────────────────────────────
   LEVEL 6 — PHISHING EMAIL DETECTIVE
───────────────────────────────────────── */
function renderLevel6(container) {
  const redFlags = [
    { id: 'sender',  text: 'Suspicious sender: support@amaz0n-security.com', found: false },
    { id: 'urgency', text: 'Urgent/threatening language: "IMMEDIATE ACTION REQUIRED"', found: false },
    { id: 'link',    text: 'Fake link: http://amaz0n-verify.xyz/login', found: false },
    { id: 'generic', text: 'Generic greeting: "Dear Valued Customer"', found: false },
  ];

  container.innerHTML = `
    <div class="challenge-box">
      <p style="font-family:var(--font-mono);font-size:0.85rem;color:var(--text-secondary);margin-bottom:1rem;">
        Analyze this suspicious email and identify all the phishing red flags.
        <strong style="color:var(--neon-cyan)">Click on suspicious elements</strong> in the email.
      </p>
      <div class="email-container">
        <div class="email-toolbar">
          <span style="font-size:1rem">📧</span>
          <span style="font-family:var(--font-mono);font-size:0.72rem;color:var(--text-muted)">INBOX — SUSPICIOUS MESSAGE</span>
        </div>
        <div class="email-header-field">
          <span class="email-field-label">FROM:</span>
          <span class="email-field-value email-clickable" id="ef-sender" onclick="flagEmail('sender')">
            support@amaz0n-security.com
          </span>
        </div>
        <div class="email-header-field">
          <span class="email-field-label">TO:</span>
          <span class="email-field-value">employee@company.com</span>
        </div>
        <div class="email-header-field">
          <span class="email-field-label">SUBJ:</span>
          <span class="email-field-value">⚠ Your Amazon account has been compromised!</span>
        </div>
        <div class="email-body">
          <p class="email-clickable" id="ef-generic" onclick="flagEmail('generic')">Dear Valued Customer,</p>
          <br>
          <p>We have detected suspicious activity on your Amazon account. 
          <span class="email-clickable" id="ef-urgency" onclick="flagEmail('urgency')">IMMEDIATE ACTION REQUIRED</span> 
          to secure your account.</p>
          <br>
          <p>Please verify your identity by clicking the link below within 24 hours or your account will be permanently suspended:</p>
          <br>
          <p>🔗 <a class="email-clickable" id="ef-link" onclick="flagEmail('link')" href="#">http://amaz0n-verify.xyz/login</a></p>
          <br>
          <p style="color:var(--text-muted);font-size:0.82rem">Amazon Security Team<br>© 2030 Amazon.com, Inc.</p>
        </div>
      </div>
    </div>
    <div class="hint-box">
      Red flags: typosquatted domains, urgency/threats, generic greetings, suspicious links.
    </div>
    <p style="font-family:var(--font-mono);font-size:0.85rem;color:var(--text-secondary);margin-bottom:0.75rem;">
      ✓ Flagged Red Flags: <span id="flagCount" style="color:var(--neon-red)">0/4</span>
    </p>
    <div class="phishing-checklist" id="phishingChecklist"></div>
    <button class="btn-submit" id="lvl6Submit" style="width:100%;margin-top:1rem">SUBMIT ANALYSIS</button>
    <div class="feedback" id="lvl6Feedback"></div>
    <div class="concept-tags" style="margin-top:1rem">
      <span class="concept-tag">Email Security</span>
      <span class="concept-tag">Social Engineering</span>
      <span class="concept-tag">Phishing</span>
    </div>
  `;

  const checklist = $('phishingChecklist');
  redFlags.forEach(flag => {
    const item = el('div', 'phishing-item', `
      <div class="phishing-checkbox" id="chk-${flag.id}"></div>
      <span>${flag.text}</span>
    `);
    item.dataset.id = flag.id;
    item.addEventListener('click', () => flagEmail(flag.id));
    checklist.appendChild(item);
  });

  window.flagEmail = function(id) {
    const flag = redFlags.find(f => f.id === id);
    if (!flag) return;
    flag.found = !flag.found;

    const emailEl = document.getElementById(`ef-${id}`);
    const chk     = document.getElementById(`chk-${id}`);
    const listItem = $('phishingChecklist').querySelector(`[data-id="${id}"]`);

    if (flag.found) {
      emailEl && emailEl.classList.add('flagged');
      chk && (chk.textContent = '✓');
      listItem && listItem.classList.add('checked');
    } else {
      emailEl && emailEl.classList.remove('flagged');
      chk && (chk.textContent = '');
      listItem && listItem.classList.remove('checked');
    }

    const count = redFlags.filter(f => f.found).length;
    $('flagCount').textContent = `${count}/4`;
  };

  $('lvl6Submit').addEventListener('click', () => {
    const found = redFlags.filter(f => f.found).length;
    const fb = $('lvl6Feedback');
    incAttempts(6);
    if (found === 4) {
      fb.className = 'feedback success visible';
      fb.textContent = `✓ EXCELLENT! All 4 phishing indicators identified. Email quarantined!`;
      completeLevel(6, calcScore(6, state.attempts[6] || 1, getTimeBonus()));
    } else {
      fb.className = 'feedback error visible';
      fb.textContent = `✗ Found ${found}/4 red flags. Click directly on suspicious elements in the email AND check the list.`;
    }
  });
}

/* ─────────────────────────────────────────
   LEVEL 7 — HASH VERIFICATION
───────────────────────────────────────── */
function renderLevel7(container) {
  const fileHash     = 'A94A8FE5CCB19BA61C4C0873D391E987982FBBD3';
  const trustedHash  = 'B1B3773A05C0ED0176787A4F1574FF0075F7521E';

  container.innerHTML = `
    <div class="challenge-box">
      <p style="font-family:var(--font-mono);font-size:0.85rem;color:var(--text-secondary);margin-bottom:1rem;">
        A critical system file was found on the server. Verify its integrity by comparing its SHA-1 hash against the trusted database.
      </p>
      <div style="display:flex;gap:1rem;flex-wrap:wrap;">
        <div style="flex:1;min-width:250px">
          <div style="font-family:var(--font-mono);font-size:0.7rem;color:var(--text-muted);margin-bottom:0.25rem;letter-spacing:0.2em">FILE HASH (found on server)</div>
          <div class="hash-display" id="fileHashDisplay">${fileHash}</div>
        </div>
        <div style="flex:1;min-width:250px">
          <div style="font-family:var(--font-mono);font-size:0.7rem;color:var(--text-muted);margin-bottom:0.25rem;letter-spacing:0.2em">TRUSTED HASH (official database)</div>
          <div class="hash-display" style="color:var(--neon-green)">${trustedHash}</div>
        </div>
      </div>
    </div>
    <div class="hint-box">
      If two files are identical, their hash values are identical. Even 1 byte difference = completely different hash.
    </div>
    <table class="hash-table">
      <thead>
        <tr>
          <th>FILE</th>
          <th>HASH TYPE</th>
          <th>STATUS</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>system32.dll</td>
          <td>SHA-1</td>
          <td class="hash-mismatch">⚠ MISMATCH</td>
        </tr>
        <tr>
          <td>kernel.bin</td>
          <td>MD5</td>
          <td class="hash-match">✓ VERIFIED</td>
        </tr>
        <tr>
          <td>netdriver.sys</td>
          <td>SHA-256</td>
          <td class="hash-match">✓ VERIFIED</td>
        </tr>
      </tbody>
    </table>
    <p style="font-family:var(--font-mono);font-size:0.85rem;color:var(--text-secondary);margin-bottom:0.75rem;">
      Based on the hash comparison, has the <strong style="color:var(--neon-cyan)">system32.dll</strong> file been modified?
    </p>
    <div class="hash-choices" id="hashChoices">
      <button class="hash-choice" data-answer="yes">⚠ YES — File Modified</button>
      <button class="hash-choice" data-answer="no">✓ NO — File Intact</button>
    </div>
    <div class="feedback" id="lvl7Feedback"></div>
    <div class="concept-tags" style="margin-top:1rem">
      <span class="concept-tag">SHA Hashing</span>
      <span class="concept-tag">Integrity Checking</span>
      <span class="concept-tag">File Forensics</span>
    </div>
  `;

  // Animate hash comparison
  const fileEl = $('fileHashDisplay');
  let idx = 0;
  const interval = setInterval(() => {
    const highlighted = fileHash.split('').map((c, i) => {
      if (c !== trustedHash[i]) return `<span style="color:var(--neon-red);background:rgba(255,0,60,0.1)">${c}</span>`;
      return c;
    }).join('');
    fileEl.innerHTML = highlighted;
    clearInterval(interval);
  }, 800);

  $('hashChoices').addEventListener('click', e => {
    const btn = e.target.closest('[data-answer]');
    if (!btn) return;
    incAttempts(7);
    const fb = $('lvl7Feedback');
    if (btn.dataset.answer === 'yes') {
      btn.classList.add('correct');
      fb.className = 'feedback success visible';
      fb.textContent = `✓ CORRECT! The hashes don't match — system32.dll has been tampered with! Possible rootkit detected.`;
      completeLevel(7, calcScore(7, state.attempts[7] || 1, getTimeBonus()));
    } else {
      btn.classList.add('wrong');
      fb.className = 'feedback error visible';
      fb.textContent = `✗ Incorrect. The two hashes are completely different — the file has been modified.`;
      setTimeout(() => btn.classList.remove('wrong'), 1500);
    }
  });
}

/* ─────────────────────────────────────────
   LEVEL 8 — SQL INJECTION DEFENSE
───────────────────────────────────────── */
function renderLevel8(container) {
  const attacks = [
    'SQL Injection',
    'Cross-Site Scripting (XSS)',
    'Buffer Overflow',
    'DDoS Attack',
    'Man-in-the-Middle'
  ];

  container.innerHTML = `
    <div class="challenge-box">
      <p style="font-family:var(--font-mono);font-size:0.85rem;color:var(--text-secondary);margin-bottom:1rem;">
        An attacker is attempting to bypass the login form with a malicious input. 
        Analyze the attack and identify the vulnerability type.
      </p>
      <div class="sql-form">
        <h3>🔐 CORPORATE LOGIN PORTAL</h3>
        <div class="sql-field">
          <label>USERNAME</label>
          <input type="text" value="admin" readonly />
        </div>
        <div class="sql-field">
          <label>PASSWORD</label>
          <input type="text" value="' OR '1'='1" readonly style="color:var(--neon-red)" />
        </div>
      </div>
      <p style="font-family:var(--font-mono);font-size:0.78rem;color:var(--text-secondary);margin-bottom:0.5rem;">
        The database receives this query:
      </p>
      <div class="sql-query-display">
        <span class="sql-keyword">SELECT</span> * <span class="sql-keyword">FROM</span> users<br>
        <span class="sql-keyword">WHERE</span> username = <span class="sql-string">'admin'</span><br>
        <span class="sql-keyword">AND</span> password = <span class="sql-string">'</span><span class="sql-inject">' OR '1'='1</span><span class="sql-string">'</span><br>
        <span style="color:var(--text-muted)">-- Result: Always TRUE! Bypasses authentication</span>
      </div>
    </div>
    <div class="hint-box">
      The attacker's input is being interpreted as SQL code rather than data. The condition '1'='1' is always true.
    </div>
    <p style="font-family:var(--font-mono);font-size:0.85rem;color:var(--text-secondary);margin-bottom:0.75rem;">
      What type of attack is this?
    </p>
    <div class="attack-choices" id="attackChoices">
      ${attacks.map(a => `<button class="attack-choice" data-attack="${a}">${a}</button>`).join('')}
    </div>
    <div style="margin-top:1.5rem;padding:1rem;background:rgba(0,212,255,0.05);border:1px solid rgba(0,212,255,0.15);border-radius:6px">
      <p style="font-family:var(--font-mono);font-size:0.78rem;color:var(--text-secondary);margin-bottom:0.5rem">🛡️ DEFENSE STRATEGY:</p>
      <div id="defenseHint" style="font-family:var(--font-mono);font-size:0.78rem;color:var(--text-muted)">Select the attack type to see defense strategies.</div>
    </div>
    <div class="feedback" id="lvl8Feedback"></div>
    <div class="concept-tags" style="margin-top:1rem">
      <span class="concept-tag">Web Security</span>
      <span class="concept-tag">Input Validation</span>
      <span class="concept-tag">OWASP Top 10</span>
    </div>
  `;

  const defenses = {
    'SQL Injection':            'Use parameterized queries/prepared statements. Validate and sanitize all inputs. Apply principle of least privilege.',
    'Cross-Site Scripting (XSS)': 'Encode output, use Content Security Policy (CSP), validate inputs.',
    'Buffer Overflow':          'Use memory-safe languages, input length validation, ASLR/DEP protection.',
    'DDoS Attack':              'Rate limiting, CDN protection, traffic filtering, load balancing.',
    'Man-in-the-Middle':        'Use TLS/SSL encryption, certificate pinning, network monitoring.'
  };

  $('attackChoices').addEventListener('click', e => {
    const btn = e.target.closest('[data-attack]');
    if (!btn) return;
    const attack = btn.dataset.attack;
    $('defenseHint').textContent = defenses[attack] || '';
    incAttempts(8);
    const fb = $('lvl8Feedback');
    if (attack === 'SQL Injection') {
      btn.classList.add('correct');
      fb.className = 'feedback success visible';
      fb.textContent = `✓ CORRECT! This is SQL Injection — the attacker's input manipulates the SQL query logic!`;
      completeLevel(8, calcScore(8, state.attempts[8] || 1, getTimeBonus()));
    } else {
      btn.classList.add('wrong');
      fb.className = 'feedback error visible';
      fb.textContent = `✗ Not quite. The attack manipulates database queries through malicious input in form fields.`;
      setTimeout(() => btn.classList.remove('wrong'), 1500);
    }
  });
}

/* ─────────────────────────────────────────
   LEVEL 9 — NETWORK MAZE
───────────────────────────────────────── */
function renderLevel9(container) {
  const routes = [
    { label: 'Route A: Disable all servers and block all traffic', correct: false },
    { label: 'Route B: Isolate compromised segment, keep clean segments online', correct: true },
    { label: 'Route C: Allow all traffic to continue, monitor only', correct: false },
    { label: 'Route D: Shut down the firewall to trace the attacker', correct: false },
  ];

  container.innerHTML = `
    <div class="challenge-box">
      <p style="font-family:var(--font-mono);font-size:0.85rem;color:var(--text-secondary);margin-bottom:1rem;">
        The attacker has infiltrated the SERVER ZONE. Choose the safest isolation route to contain the breach 
        without disrupting all operations.
      </p>
      <div class="network-diagram" id="networkDiagram">
        <div class="net-node safe">🌍 INTERNET</div>
        <div class="net-connector"></div>
        <div class="net-node safe" style="border-color:rgba(0,255,136,0.4)">🛡️ FIREWALL (ACTIVE)</div>
        <div class="net-connector"></div>
        <div class="net-node safe">📡 CORE ROUTER</div>
        <div class="net-connector"></div>
        <div class="net-row">
          <div>
            <div class="net-node safe" style="background:rgba(0,255,136,0.05)">💼 OFFICE NETWORK</div>
            <div style="font-family:var(--font-mono);font-size:0.65rem;color:var(--neon-green);text-align:center;margin-top:0.3rem">✓ CLEAN</div>
          </div>
          <div>
            <div class="net-node danger">💾 SERVER ZONE</div>
            <div style="font-family:var(--font-mono);font-size:0.65rem;color:var(--neon-red);text-align:center;margin-top:0.3rem">⚠ COMPROMISED</div>
          </div>
          <div>
            <div class="net-node safe" style="background:rgba(0,255,136,0.05)">📊 DATABASE</div>
            <div style="font-family:var(--font-mono);font-size:0.65rem;color:var(--neon-green);text-align:center;margin-top:0.3rem">✓ CLEAN</div>
          </div>
        </div>
      </div>
    </div>
    <div class="hint-box">
      Goal: Contain the attacker in the compromised zone without causing a full network outage. Think "network segmentation."
    </div>
    <p style="font-family:var(--font-mono);font-size:0.85rem;color:var(--text-secondary);margin-bottom:0.75rem;">
      Select the best isolation strategy:
    </p>
    <div class="route-options" id="routeOptions">
      ${routes.map((r,i) => `<button class="route-option" data-idx="${i}">${r.label}</button>`).join('')}
    </div>
    <div class="feedback" id="lvl9Feedback"></div>
    <div class="concept-tags" style="margin-top:1rem">
      <span class="concept-tag">Network Segmentation</span>
      <span class="concept-tag">Incident Response</span>
      <span class="concept-tag">Network Security</span>
    </div>
  `;

  $('routeOptions').addEventListener('click', e => {
    const btn = e.target.closest('[data-idx]');
    if (!btn) return;
    const route = routes[parseInt(btn.dataset.idx)];
    incAttempts(9);
    const fb = $('lvl9Feedback');
    if (route.correct) {
      btn.classList.add('correct');
      fb.className = 'feedback success visible';
      fb.textContent = `✓ PERFECT STRATEGY! Isolate the compromised Server Zone while keeping Office Network and Database online. Attacker contained!`;
      completeLevel(9, calcScore(9, state.attempts[9] || 1, getTimeBonus()));
    } else {
      btn.classList.add('wrong');
      fb.className = 'feedback error visible';
      const hints = {
        0: '✗ Shutting down everything causes unnecessary downtime. Targeted isolation is better.',
        2: '✗ Monitoring alone won\'t stop the breach. The attacker needs to be contained.',
        3: '✗ Never disable the firewall — that would expose the entire network!'
      };
      fb.textContent = hints[btn.dataset.idx] || '✗ Incorrect strategy.';
      setTimeout(() => btn.classList.remove('wrong'), 1500);
    }
  });
}

/* ─────────────────────────────────────────
   FINAL BOSS — TRACE THE HACKER
───────────────────────────────────────── */
function showFinalBoss() {
  $('levelMap').classList.add('hidden');
  $('levelContainer').classList.add('hidden');
  $('finalBossScreen').classList.remove('hidden');
  $('finalBossScreen').classList.add('active');

  // Build clues board
  const board = $('cluesBoard');
  board.innerHTML = '';

  const displayClues = [
    { type: 'IP ADDRESS',       value: state.clues.find(c => c.type === 'IP ADDRESS')?.value || '???'},
    { type: 'ALIAS',            value: state.clues.find(c => c.type === 'ALIAS')?.value || '???' },
    { type: 'DOMAIN',           value: state.clues.find(c => c.type === 'DOMAIN')?.value || '???' },
    { type: 'ENCRYPTION KEY',   value: state.clues.find(c => c.type === 'ENCRYPTION KEY')?.value || '???' },
  ];

  displayClues.forEach(clue => {
    const card = el('div', 'boss-clue-card');
    card.innerHTML = `
      <div class="boss-clue-type">${clue.type}</div>
      <div class="boss-clue-value">${clue.value}</div>
    `;
    board.appendChild(card);
  });

  $('traceBtn').addEventListener('click', checkFinalBoss);
  $('bossIP').addEventListener('keydown', e => { if (e.key === 'Enter') checkFinalBoss(); });
  $('bossAlias').addEventListener('keydown', e => { if (e.key === 'Enter') checkFinalBoss(); });
}

function checkFinalBoss() {
  const ip    = $('bossIP').value.trim();
  const alias = $('bossAlias').value.trim().toUpperCase();
  const fb    = $('bossFeedback');

  const correctIP    = '203.0.113.45';
  const correctAlias = 'SHADOWFOX';

  if (ip === correctIP && alias === correctAlias) {
    fb.style.color = 'var(--neon-green)';
    fb.textContent = '✓ TARGET ACQUIRED! SHADOWFOX at 203.0.113.45 — INITIATING CAPTURE PROTOCOL...';
    state.score += 2000 + getTimeBonus();
    saveState();

    // Build dramatic reveal
    triggerGlitch();
    setTimeout(() => {
      $('finalBossScreen').classList.add('hidden');
      showWinScreen();
    }, 2500);
  } else {
    fb.style.color = 'var(--neon-red)';
    if (ip !== correctIP && alias !== correctAlias) {
      fb.textContent = '✗ Both IP and alias are incorrect. Review your collected clues.';
    } else if (ip !== correctIP) {
      fb.textContent = '✗ IP address is wrong. Revisit Level 5 clue.';
    } else {
      fb.textContent = '✗ Alias is wrong. Revisit your collected fragments.';
    }
    triggerGlitch();
  }
}

/* ─────────────────────────────────────────
   WIN SCREEN
───────────────────────────────────────── */
function showWinScreen() {
  $('winScreen').classList.remove('hidden');
  $('winScreen').classList.add('active');
  clearInterval(state.timerInterval);
  clearSave();

  const timeUsed = TOTAL_TIME - state.timerSeconds;
  const m = Math.floor(timeUsed / 60);
  const s = timeUsed % 60;

  $('winStats').innerHTML = `
    <div class="win-stat"><div class="win-stat-num">${state.score.toLocaleString()}</div><div class="win-stat-label">TOTAL SCORE</div></div>
    <div class="win-stat"><div class="win-stat-num">${state.completedLevels.length}</div><div class="win-stat-label">LEVELS CLEARED</div></div>
    <div class="win-stat"><div class="win-stat-num">${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}</div><div class="win-stat-label">TIME USED</div></div>
    <div class="win-stat"><div class="win-stat-num">${state.clues.length}</div><div class="win-stat-label">CLUES FOUND</div></div>
  `;

  $('winReport').innerHTML = `
    <div style="font-family:var(--font-mono);font-size:0.75rem;color:var(--text-muted);letter-spacing:0.2em;margin-bottom:0.75rem">MISSION DEBRIEF — CLASSIFIED</div>
    <div style="color:var(--neon-green)">✓ ATTACKER IDENTIFIED: SHADOWFOX</div>
    <div style="color:var(--neon-green)">✓ IP TRACED: 203.0.113.45</div>
    <div style="color:var(--neon-green)">✓ RANSOMWARE STOPPED</div>
    <div style="color:var(--neon-green)">✓ NETWORK BREACH CONTAINED</div>
    <div style="color:var(--neon-green)">✓ ALL COMPANY DATA SECURED</div>
    <br>
    <div style="color:var(--neon-cyan)">AGENT STATUS: PROMOTED TO SENIOR ANALYST</div>
  `;

  // Celebrate
  createParticles();
  $('playAgainBtn').addEventListener('click', () => {
    $('winScreen').classList.add('hidden');
    $('introScreen').classList.remove('hidden');
    startNewGame();
  });
}

function createParticles() {
  const container = $('winParticles');
  for (let i = 0; i < 80; i++) {
    const p = el('div');
    p.style.cssText = `
      position:absolute;
      width:${4 + Math.random()*6}px;
      height:${4 + Math.random()*6}px;
      border-radius:50%;
      background:${['#00ff88','#00d4ff','#b400ff','#ffd700','#ff003c'][Math.floor(Math.random()*5)]};
      left:${Math.random()*100}vw;
      top:${Math.random()*100}vh;
      animation:particle ${1.5+Math.random()*3}s ease-out forwards;
      opacity:0.9;
    `;
    container.appendChild(p);
    setTimeout(() => p.remove(), 5000);
  }
}

const particleStyle = document.createElement('style');
particleStyle.textContent = `
  @keyframes particle {
    0%   { transform: translateY(0) scale(1); opacity:0.9; }
    100% { transform: translateY(-${window.innerHeight}px) scale(0); opacity:0; }
  }
`;
document.head.appendChild(particleStyle);

/* ─────────────────────────────────────────
   GAME OVER
───────────────────────────────────────── */
function gameOver() {
  clearSave();
  $('hud').classList.add('hidden');
  $('levelProgress').classList.add('hidden');
  $('gameArea').classList.add('hidden');
  $('finalBossScreen').classList.add('hidden');

  // Show custom game over
  const go = el('div', 'screen active');
  go.innerHTML = `
    <div style="text-align:center;padding:2rem;max-width:600px;width:100%;position:relative;z-index:20">
      <div style="font-family:var(--font-display);font-size:5rem;font-weight:900;color:var(--neon-red);text-shadow:0 0 30px rgba(255,0,60,0.5)">BREACH</div>
      <div style="font-family:var(--font-display);font-size:2rem;color:var(--neon-orange);margin-bottom:1rem">SYSTEM ENCRYPTED</div>
      <div style="font-family:var(--font-mono);color:var(--text-secondary);margin-bottom:2rem">
        Time expired. All company data has been encrypted.<br>The attacker escaped.
      </div>
      <div style="font-family:var(--font-display);font-size:1.2rem;color:var(--text-secondary);margin-bottom:1rem">FINAL SCORE: <span style="color:var(--neon-yellow)">${state.score.toLocaleString()}</span></div>
      <button class="btn-primary" onclick="location.reload()">⟳ TRY AGAIN</button>
    </div>
  `;
  document.body.appendChild(go);
}

/* ─────────────────────────────────────────
   PAUSE MENU
───────────────────────────────────────── */
$('menuBtn').addEventListener('click', () => {
  state.isPaused = true;
  $('pauseMenu').classList.remove('hidden');
});

$('resumeBtn').addEventListener('click', () => {
  state.isPaused = false;
  $('pauseMenu').classList.add('hidden');
});

$('restartBtn').addEventListener('click', () => {
  $('pauseMenu').classList.add('hidden');
  startNewGame();
});

$('quitBtn').addEventListener('click', () => {
  $('pauseMenu').classList.add('hidden');
  clearInterval(state.timerInterval);
  $('hud').classList.add('hidden');
  $('levelProgress').classList.add('hidden');
  $('gameArea').classList.add('hidden');
  $('introScreen').classList.remove('hidden');
  $('introScreen').classList.add('active');
});

$('backToMap').addEventListener('click', showLevelMap);

/* ─────────────────────────────────────────
   BONUS MINI-GAMES
───────────────────────────────────────── */
$('bonusBtn').addEventListener('click', () => {
  $('levelMap').classList.add('hidden');
  $('bonusArea').classList.remove('hidden');
  buildBonusGrid();
});

$('backFromBonus').addEventListener('click', () => {
  $('bonusArea').classList.add('hidden');
  $('levelMap').classList.remove('hidden');
});

function buildBonusGrid() {
  const grid = $('bonusGrid');
  grid.innerHTML = '';
  BONUS_GAMES.forEach(game => {
    const card = el('div', 'bonus-card');
    card.innerHTML = `
      <div class="bonus-icon">${game.icon}</div>
      <div class="bonus-name">${game.name}</div>
      <div class="bonus-desc">${game.desc}</div>
    `;
    card.addEventListener('click', () => openBonusGame(game.id));
    grid.appendChild(card);
  });
  $('bonusGameContainer').classList.add('hidden');
}

function openBonusGame(id) {
  const container = $('bonusGameContainer');
  container.classList.remove('hidden');
  container.innerHTML = '';
  container.scrollIntoView({ behavior: 'smooth' });

  const fns = {
    cracker:   renderCracker,
    morse:     renderMorse,
    memory:    renderMemory,
    forensics: renderForensics,
    firewall:  renderFirewall
  };

  if (fns[id]) fns[id](container);
}

/* ── BONUS 1: PASSWORD CRACKER ── */
function renderCracker(container) {
  container.innerHTML = `
    <div style="font-family:var(--font-display);font-size:1.1rem;color:var(--neon-cyan);margin-bottom:1rem">🔓 PASSWORD CRACKER SIMULATOR</div>
    <p style="font-family:var(--font-mono);font-size:0.82rem;color:var(--text-secondary);margin-bottom:1rem">
      Enter any password to estimate how long it would take to brute-force crack it.
    </p>
    <div class="cracker-input-group">
      <input type="text" id="crackerInput" class="cyber-input" placeholder="Enter a password to analyze..." maxlength="30" />
      <button class="btn-submit" id="crackerBtn">ANALYZE</button>
    </div>
    <div class="cracker-result" id="crackerResult">
      <span style="color:var(--text-muted)">Enter a password above to see how long it would take to crack...</span>
    </div>
  `;

  function analyzePwd() {
    const pwd = $('crackerInput').value;
    if (!pwd) return;
    let charset = 0;
    if (/[a-z]/.test(pwd)) charset += 26;
    if (/[A-Z]/.test(pwd)) charset += 26;
    if (/[0-9]/.test(pwd)) charset += 10;
    if (/[^A-Za-z0-9]/.test(pwd)) charset += 32;
    const combinations = Math.pow(charset, pwd.length);
    const guessesPerSec = 1e12; // 1 trillion/sec (modern GPU)
    const seconds = combinations / guessesPerSec;

    let timeStr, cls, tip;
    if (seconds < 1) {
      timeStr = 'INSTANTLY'; cls = 'crack-time'; tip = '⚠ Never use simple passwords!';
    } else if (seconds < 60) {
      timeStr = `${seconds.toFixed(1)} seconds`; cls = 'crack-time'; tip = '⚠ Too short or simple.';
    } else if (seconds < 3600) {
      timeStr = `${(seconds/60).toFixed(1)} minutes`; cls = 'crack-time'; tip = '⚠ Add more complexity.';
    } else if (seconds < 86400) {
      timeStr = `${(seconds/3600).toFixed(1)} hours`; cls = 'crack-time'; tip = '💡 Better, but not great.';
    } else if (seconds < 31557600) {
      timeStr = `${(seconds/86400).toFixed(0)} days`; cls = 'crack-time'; tip = '💡 Moderate security.';
    } else if (seconds < 3.15e9) {
      timeStr = `${(seconds/31557600).toFixed(1)} years`; cls = 'crack-safe'; tip = '✓ Good password!';
    } else {
      timeStr = `${(seconds/3.15e9).toFixed(0)} billion years`; cls = 'crack-safe'; tip = '✓ EXCELLENT! Very secure.';
    }

    $('crackerResult').innerHTML = `
      <div style="font-family:var(--font-mono);font-size:0.78rem;color:var(--text-muted)">Estimated crack time (1T guesses/sec):</div>
      <div class="${cls}">${timeStr}</div>
      <div style="font-family:var(--font-mono);font-size:0.78rem;color:var(--text-muted)">
        Charset: ${charset} | Length: ${pwd.length} | Combinations: ${combinations.toExponential(2)}
      </div>
      <div class="crack-tip">${tip}</div>
    `;
  }

  $('crackerBtn').addEventListener('click', analyzePwd);
  $('crackerInput').addEventListener('keydown', e => { if (e.key === 'Enter') analyzePwd(); });
}

/* ── BONUS 2: MORSE CODE ── */
function renderMorse(container) {
  const morseCode = {
    'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....','I':'..','J':'.---',
    'K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.','S':'...','T':'-',
    'U':'..-','V':'...-','W':'.--','X':'-..-','Y':'-.--','Z':'--..',
    '0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.'
  };

  const challenges = [
    { morse: '.... . .-.. .--', answer: 'HELP' },
    { morse: '... --- ...', answer: 'SOS' },
    { morse: '.... .- -.-. -.-', answer: 'HACK' },
    { morse: '..-. --- -..-', answer: 'FOX' },
  ];

  let current = 0;

  const morseRef = Object.entries(morseCode).map(([k,v]) =>
    `<div class="morse-ref-item"><span class="morse-char">${k}</span><span class="morse-code">${v}</span></div>`
  ).join('');

  container.innerHTML = `
    <div style="font-family:var(--font-display);font-size:1.1rem;color:var(--neon-cyan);margin-bottom:1rem">📡 MORSE CODE CHALLENGE</div>
    <p style="font-family:var(--font-mono);font-size:0.82rem;color:var(--text-secondary);margin-bottom:1rem">
      Decode the Morse code messages intercepted from the attacker.
    </p>
    <div style="font-family:var(--font-mono);font-size:0.78rem;color:var(--text-muted);margin-bottom:0.25rem">CHALLENGE <span id="morseNum">1</span>/4</div>
    <div class="morse-display" id="morseDisplay">${challenges[0].morse}</div>
    <details style="margin-bottom:1rem">
      <summary style="cursor:pointer;font-family:var(--font-mono);font-size:0.78rem;color:var(--neon-cyan);padding:0.3rem">📖 Morse Reference</summary>
      <div class="morse-reference">${morseRef}</div>
    </details>
    <div class="answer-input-group">
      <input type="text" id="morseInput" class="cyber-input" placeholder="Type decoded text..." maxlength="20" style="text-transform:uppercase" autocomplete="off" />
      <button class="btn-submit" id="morseSubmit">DECODE</button>
    </div>
    <div class="feedback" id="morseFeedback"></div>
    <div style="font-family:var(--font-mono);font-size:0.78rem;color:var(--neon-yellow);margin-top:0.5rem">Score: <span id="morseScore">0</span></div>
  `;

  let morseScore = 0;

  $('morseInput').addEventListener('input', e => { e.target.value = e.target.value.toUpperCase(); });

  $('morseSubmit').addEventListener('click', () => {
    const val = $('morseInput').value.trim().toUpperCase();
    const fb  = $('morseFeedback');
    const ch  = challenges[current];
    if (val === ch.answer) {
      morseScore += 250;
      $('morseScore').textContent = morseScore;
      state.score += 250;
      fb.className = 'feedback success visible';
      fb.textContent = `✓ Correct! "${ch.answer}"`;
      current++;
      if (current < challenges.length) {
        setTimeout(() => {
          $('morseDisplay').textContent = challenges[current].morse;
          $('morseNum').textContent = current + 1;
          $('morseInput').value = '';
          fb.className = 'feedback';
        }, 1000);
      } else {
        fb.textContent = `✓ All messages decoded! +${morseScore} bonus points!`;
      }
    } else {
      fb.className = 'feedback error visible';
      fb.textContent = `✗ "${val}" is wrong. Use the reference table.`;
    }
  });

  $('morseInput').addEventListener('keydown', e => { if (e.key === 'Enter') $('morseSubmit').click(); });
}

/* ── BONUS 3: CYBER MEMORY MATCH ── */
function renderMemory(container) {
  const pairs = [
    ['Phishing',   'Email Scam'],
    ['Malware',    'Malicious Software'],
    ['DDoS',       'Traffic Flood'],
    ['Firewall',   'Traffic Filter'],
    ['VPN',        'Encrypted Tunnel'],
    ['Ransomware', 'File Encryptor'],
    ['Zero-Day',   'Unknown Exploit'],
    ['Botnet',     'Infected Device Army'],
  ];

  const cards = [...pairs.flatMap((p, i) => [
    { text: p[0], pairId: i },
    { text: p[1], pairId: i }
  ])].sort(() => Math.random() - 0.5);

  let flipped = [], matched = new Set(), moves = 0, memScore = 0;
  let isLocked = false;

  container.innerHTML = `
    <div style="font-family:var(--font-display);font-size:1.1rem;color:var(--neon-cyan);margin-bottom:1rem">🧩 CYBER MEMORY MATCH</div>
    <p style="font-family:var(--font-mono);font-size:0.82rem;color:var(--text-secondary);margin-bottom:0.5rem">
      Match cybersecurity terms with their definitions. Find all 8 pairs!
    </p>
    <div style="display:flex;gap:1rem;margin-bottom:0.75rem;font-family:var(--font-mono);font-size:0.78rem">
      <span style="color:var(--text-muted)">Moves: <span id="moveCount" style="color:var(--neon-cyan)">0</span></span>
      <span style="color:var(--text-muted)">Matched: <span id="matchCount" style="color:var(--neon-green)">0</span>/8</span>
      <span style="color:var(--text-muted)">Score: <span id="memScore" style="color:var(--neon-yellow)">0</span></span>
    </div>
    <div class="memory-grid" id="memoryGrid"></div>
    <div class="feedback" id="memFeedback"></div>
  `;

  const grid = $('memoryGrid');

  cards.forEach((card, idx) => {
    const cardEl = el('div', 'memory-card');
    cardEl.dataset.pair = card.pairId;
    cardEl.dataset.idx  = idx;
    cardEl.textContent  = card.text;
    cardEl.addEventListener('click', () => flipCard(cardEl, idx));
    grid.appendChild(cardEl);
  });

  function flipCard(cardEl, idx) {
    if (isLocked || flipped.includes(idx) || matched.has(cards[idx].pairId)) return;
    cardEl.classList.add('flipped');
    flipped.push(idx);
    if (flipped.length === 2) {
      isLocked = true;
      moves++;
      $('moveCount').textContent = moves;
      const [a, b] = flipped;
      if (cards[a].pairId === cards[b].pairId) {
        grid.querySelectorAll('.memory-card')[a].classList.add('matched');
        grid.querySelectorAll('.memory-card')[b].classList.add('matched');
        matched.add(cards[a].pairId);
        memScore += Math.max(50, 200 - moves * 10);
        $('memScore').textContent = memScore;
        $('matchCount').textContent = matched.size;
        flipped = [];
        isLocked = false;
        if (matched.size === 8) {
          state.score += memScore;
          $('memFeedback').className = 'feedback success visible';
          $('memFeedback').textContent = `🏆 All matched! Bonus: +${memScore} points in ${moves} moves!`;
        }
      } else {
        setTimeout(() => {
          grid.querySelectorAll('.memory-card')[a].classList.remove('flipped');
          grid.querySelectorAll('.memory-card')[b].classList.remove('flipped');
          flipped = [];
          isLocked = false;
        }, 900);
      }
    }
  }
}

/* ── BONUS 4: DIGITAL FORENSICS ── */
function renderForensics(container) {
  container.innerHTML = `
    <div style="font-family:var(--font-display);font-size:1.1rem;color:var(--neon-cyan);margin-bottom:1rem">🔍 DIGITAL FORENSICS</div>
    <p style="font-family:var(--font-mono);font-size:0.82rem;color:var(--text-secondary);margin-bottom:1rem">
      Examine the digital artifact below. Find hidden evidence by clicking suspicious elements.
    </p>
    <div style="background:#000;border:1px solid var(--border-color);border-radius:8px;padding:1.5rem;font-family:var(--font-mono);font-size:0.82rem;margin-bottom:1rem;position:relative">
      <div style="color:var(--text-muted);font-size:0.65rem;letter-spacing:0.2em;margin-bottom:1rem">RECOVERED FILE — network_log_archive.txt</div>
      <div style="color:var(--neon-green)">
        [2030-06-19 02:14:33] Connection established<br>
        [2030-06-19 02:14:45] User: <span class="email-clickable" id="f1" onclick="markForensic('f1','Hidden Username: shadowfox')">admin_temp_9x</span> logged in<br>
        [2030-06-19 02:15:01] File download: <span class="email-clickable" id="f2" onclick="markForensic('f2','Stolen file: customer_data.db')">report.pdf</span><br>
        [2030-06-19 02:15:22] Destination: <span class="email-clickable" id="f3" onclick="markForensic('f3','Attacker IP: 203.0.113.45')">203.0.113.45</span>:4444<br>
        [2030-06-19 02:15:45] Encoding: <span class="email-clickable" id="f4" onclick="markForensic('f4','Data exfiltration via Base64')">aGFja2Vk</span><br>
        [2030-06-19 02:16:00] Connection terminated<br>
      </div>
      <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border-color);font-size:0.7rem;color:var(--text-muted)">
        METADATA: Created: 2030-06-19 | Modified: 2030-06-19 02:16:05 | 
        <span class="email-clickable" id="f5" onclick="markForensic('f5','File hidden in /tmp/.shadow/')">Owner: www-data</span>
      </div>
    </div>
    <div id="forensicsFindings" style="background:rgba(0,212,255,0.05);border:1px solid rgba(0,212,255,0.2);border-radius:6px;padding:1rem;font-family:var(--font-mono);font-size:0.78rem;min-height:80px">
      <div style="color:var(--text-muted);font-size:0.7rem;letter-spacing:0.2em;margin-bottom:0.5rem">FINDINGS LOG</div>
      <div id="findingsList" style="color:var(--neon-green)">Click on suspicious elements to reveal hidden evidence...</div>
    </div>
    <div style="font-family:var(--font-mono);font-size:0.78rem;color:var(--neon-yellow);margin-top:0.5rem">Evidence: <span id="evidenceCount">0</span>/5</div>
  `;

  let found = 0;
  const findings = [];

  window.markForensic = function(id, finding) {
    const el = document.getElementById(id);
    if (el && !el.classList.contains('flagged')) {
      el.classList.add('flagged');
      found++;
      findings.push(finding);
      $('evidenceCount').textContent = found;
      $('findingsList').innerHTML = findings.map(f => `<div>► ${f}</div>`).join('');
      if (found === 5) {
        state.score += 500;
        $('findingsList').innerHTML += `<br><span style="color:var(--neon-cyan)">🏆 All evidence found! +500 points!</span>`;
      }
    }
  };
}

/* ── BONUS 5: FIREWALL RULE BUILDER ── */
function renderFirewall(container) {
  const presetRules = [
    { action: 'ALLOW', ip: '192.168.1.*', note: 'Internal LAN' },
    { action: 'ALLOW', ip: '10.0.0.*', note: 'VPN subnet' },
    { action: 'BLOCK', ip: '203.0.113.*', note: 'Attacker subnet' },
  ];

  let rules = [...presetRules];
  let fwScore = 0;

  function render() {
    container.innerHTML = `
      <div style="font-family:var(--font-display);font-size:1.1rem;color:var(--neon-cyan);margin-bottom:1rem">🛡️ FIREWALL RULE BUILDER</div>
      <p style="font-family:var(--font-mono);font-size:0.82rem;color:var(--text-secondary);margin-bottom:1rem">
        Manage firewall rules. Add ALLOW/BLOCK rules and test your configuration.
      </p>
      <div class="rule-builder">
        <select class="rule-select" id="ruleAction">
          <option value="ALLOW">ALLOW</option>
          <option value="BLOCK">BLOCK</option>
        </select>
        <input type="text" id="ruleIP" class="cyber-input" placeholder="IP or range (e.g. 192.168.1.*)" maxlength="30" style="flex:1" />
        <input type="text" id="ruleNote" class="cyber-input" placeholder="Note" maxlength="30" style="flex:1" />
        <button class="btn-submit" id="addRule">+ ADD</button>
      </div>
      <div class="firewall-rules" id="firewallRules">
        ${rules.map((r, i) => `
          <div class="firewall-rule ${r.action.toLowerCase()}">
            <span class="rule-action ${r.action.toLowerCase()}">${r.action}</span>
            <span class="rule-ip">${r.ip}</span>
            <span style="color:var(--text-muted);font-size:0.75rem;margin-left:0.5rem"># ${r.note}</span>
            <span class="rule-delete" onclick="deleteRule(${i})">✕</span>
          </div>
        `).join('')}
        ${rules.length === 0 ? '<div style="color:var(--text-muted);font-family:var(--font-mono);font-size:0.82rem;text-align:center;padding:1rem">No rules defined</div>' : ''}
      </div>
      <div style="display:flex;gap:0.75rem;margin-top:0.75rem;flex-wrap:wrap">
        <button class="btn-submit" id="testFW">▶ TEST CONFIGURATION</button>
        <button class="btn-secondary" id="clearRules">CLEAR ALL</button>
      </div>
      <div class="feedback" id="fwFeedback"></div>
    `;

    window.deleteRule = (i) => { rules.splice(i, 1); render(); };

    $('addRule').addEventListener('click', () => {
      const action = $('ruleAction').value;
      const ip     = $('ruleIP').value.trim();
      const note   = $('ruleNote').value.trim() || 'No description';
      if (ip) {
        rules.push({ action, ip, note });
        render();
      }
    });

    $('clearRules').addEventListener('click', () => { rules = []; render(); });

    $('testFW').addEventListener('click', () => {
      const hasAllow  = rules.some(r => r.action === 'ALLOW');
      const hasBlock  = rules.some(r => r.action === 'BLOCK');
      const blocksAtk = rules.some(r => r.action === 'BLOCK' && (r.ip.includes('203.0.113') || r.ip.includes('*')));
      const fb = $('fwFeedback');

      if (!hasAllow) {
        fb.className = 'feedback error visible';
        fb.textContent = '✗ No ALLOW rules! All traffic would be blocked.';
      } else if (!hasBlock) {
        fb.className = 'feedback error visible';
        fb.textContent = '✗ No BLOCK rules! Attacker subnet is still accessible.';
      } else if (!blocksAtk) {
        fb.className = 'feedback error visible';
        fb.textContent = '✗ Attacker subnet 203.0.113.* is not blocked! Add a BLOCK rule.';
      } else {
        fwScore += 300;
        state.score += 300;
        fb.className = 'feedback success visible';
        fb.textContent = `✓ FIREWALL CONFIGURED! Rules: ${rules.length}. Attacker blocked. Network secured! +300 points`;
      }
    });
  }

  render();
}

/* ─────────────────────────────────────────
   INIT
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', initIntro);
