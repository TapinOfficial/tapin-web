/* ===================== TAP IN — app.js ===================== */
(function () {
  'use strict';

  // ---- State ----
  const VALID_CODES = ['ELSEWHERE', 'TAPIN2026'];
  const VIBES = [
    'first time downtown', 'show me your spot', 'here for the music',
    'looking for my people', 'down for whatever', 'industry night',
    'i know the bartender', 'making rounds', 'post-dinner',
    'been here since 9', 'bring a friend', 'just moved here'
  ];
  const VIBE_EMOJIS = {
    'first time downtown': '🌃', 'show me your spot': '📍', 'here for the music': '🎵',
    'looking for my people': '👀', 'down for whatever': '🤷', 'industry night': '🍸',
    'i know the bartender': '🤝', 'making rounds': '🔄', 'post-dinner': '🍽️',
    'been here since 9': '⏰', 'bring a friend': '👯', 'just moved here': '📦'
  };
  const APPLY_QUESTIONS = [
    'what bar do you consider your living room?',
    'who would you bring in?',
    'what do you add to a room?',
    'how did you find out about this?',
    'email address'
  ];
  const DEMO_PROFILES = [
    { name: 'Maya', age: 26, vibes: ['here for the music', 'making rounds', 'down for whatever'], time: 23 },
    { name: 'Jordan', age: 29, vibes: ['industry night', 'i know the bartender', 'post-dinner'], time: 14 },
    { name: 'Ari', age: 24, vibes: ['first time downtown', 'looking for my people', 'bring a friend'], time: 31 },
    { name: 'Sam', age: 27, vibes: ['show me your spot', 'down for whatever', 'been here since 9'], time: 8 },
    { name: 'Kai', age: 25, vibes: ['here for the music', 'just moved here', 'looking for my people'], time: 45 },
    { name: 'Nico', age: 28, vibes: ['making rounds', 'industry night', 'post-dinner'], time: 19 },
    { name: 'Lena', age: 23, vibes: ['bring a friend', 'down for whatever', 'first time downtown'], time: 37 },
    { name: 'River', age: 30, vibes: ['i know the bartender', 'been here since 9', 'show me your spot'], time: 5 },
    { name: 'Zara', age: 26, vibes: ['here for the music', 'making rounds', 'industry night'], time: 12 },
    { name: 'Dex', age: 27, vibes: ['post-dinner', 'down for whatever', 'looking for my people'], time: 28 },
    { name: 'Blue', age: 22, vibes: ['just moved here', 'first time downtown', 'bring a friend'], time: 41 },
  ];

  let selectedVibes = [];
  let applyStep = 0;
  let applyAnswers = [];
  let pointsBalance = 340;
  let previousScreen = 'map';
  let inboxTimerSeconds = 28 * 60;
  let inboxTimerInterval = null;

  // ---- DOM refs ----
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ---- Screens ----
  const SCREENS_WITH_NAV = ['map', 'inbox', 'chat', 'points', 'reverb'];
  const SCREENS_WITH_TOPBAR = ['map', 'inbox', 'chat', 'points', 'reverb', 'settings'];

  function navigate(screen) {
    // Close overlays
    $('#peek-overlay').classList.remove('active');
    $('#drink-overlay').classList.remove('active');
    $('#drink-success').classList.remove('active');

    // Hide all screens
    $$('.screen').forEach(s => {
      s.classList.remove('active');
      s.style.opacity = '0';
    });

    // Show target
    const el = document.getElementById(screen);
    if (!el) return;
    el.classList.add('active');
    requestAnimationFrame(() => { el.style.opacity = '1'; });

    // Nav bar
    const showNav = SCREENS_WITH_NAV.includes(screen);
    $('#navbar').classList.toggle('visible', showNav);

    // Top bar
    const showTop = SCREENS_WITH_TOPBAR.includes(screen);
    $('#topbar').classList.toggle('visible', showTop);

    // Active nav item
    $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.screen === screen));

    // Hash
    window.location.hash = '#' + screen;
    previousScreen = screen;
  }

  // ---- 1. Landing ----
  $('#btn-enter').addEventListener('click', () => {
    const code = $('#invite-code').value.trim().toUpperCase();
    if (VALID_CODES.includes(code)) {
      navigate('vibes');
    } else {
      $('#invite-code').style.borderColor = '#8B3A3A';
      setTimeout(() => { $('#invite-code').style.borderColor = ''; }, 1500);
    }
  });

  $('#invite-code').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('#btn-enter').click();
  });

  $('#btn-apply-link').addEventListener('click', () => {
    applyStep = 0;
    showApplyStep();
    navigate('apply');
  });

  // ---- 2. Apply ----
  function showApplyStep() {
    $('#apply-question').textContent = APPLY_QUESTIONS[applyStep];
    $('#apply-progress').textContent = (applyStep + 1) + '/5';
    $('#apply-input').value = '';
    $('#apply-input').placeholder = applyStep === 4 ? 'you@email.com' : 'type here...';
    $('#apply-input').type = applyStep === 4 ? 'email' : 'text';
    $('#btn-apply-next').textContent = applyStep === 4 ? 'submit' : 'next';
    setTimeout(() => $('#apply-input').focus(), 100);
  }

  $('#btn-apply-next').addEventListener('click', () => {
    const val = $('#apply-input').value.trim();
    if (!val) return;
    applyAnswers[applyStep] = val;
    if (applyStep < 4) {
      applyStep++;
      showApplyStep();
    } else {
      navigate('pending');
    }
  });

  $('#apply-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('#btn-apply-next').click();
  });

  // ---- 3. Vibes ----
  function buildVibesGrid() {
    const grid = $('#vibes-grid');
    grid.innerHTML = '';
    VIBES.forEach(v => {
      const btn = document.createElement('button');
      btn.className = 'btn-pill';
      btn.textContent = v;
      btn.addEventListener('click', () => toggleVibe(v, btn));
      grid.appendChild(btn);
    });
  }

  function toggleVibe(vibe, btn) {
    const idx = selectedVibes.indexOf(vibe);
    if (idx > -1) {
      selectedVibes.splice(idx, 1);
      btn.classList.remove('selected');
    } else if (selectedVibes.length < 3) {
      selectedVibes.push(vibe);
      btn.classList.add('selected');
    }
    $('#vibes-count').textContent = 3 - selectedVibes.length;
    $('#btn-vibes-continue').disabled = selectedVibes.length !== 3;
  }

  $('#btn-vibes-continue').addEventListener('click', () => {
    if (selectedVibes.length === 3) {
      populateMapVibes();
      buildMapDots();
      navigate('map');
    }
  });

  // ---- 4. Map ----
  function populateMapVibes() {
    const container = $('#map-vibes');
    container.innerHTML = '';
    selectedVibes.forEach(v => {
      const span = document.createElement('span');
      span.textContent = VIBE_EMOJIS[v] || '✨';
      container.appendChild(span);
    });
  }

  function buildMapDots() {
    const container = $('#map-dots');
    container.innerHTML = '';
    // Your dot
    const youDot = document.createElement('div');
    youDot.className = 'map-dot you';
    youDot.style.left = '48%';
    youDot.style.top = '55%';
    container.appendChild(youDot);

    // Other dots
    const positions = [
      [22, 25], [68, 20], [35, 40], [72, 45], [15, 60],
      [58, 30], [40, 70], [80, 65], [25, 80], [65, 75], [50, 15]
    ];
    DEMO_PROFILES.forEach((profile, i) => {
      const dot = document.createElement('div');
      dot.className = 'map-dot';
      dot.style.left = positions[i][0] + '%';
      dot.style.top = positions[i][1] + '%';
      dot.dataset.profileIdx = i;
      dot.addEventListener('click', () => openPeek(i));
      container.appendChild(dot);
    });
  }

  // ---- 5. Profile Peek ----
  let currentPeekIdx = -1;

  function openPeek(idx) {
    const p = DEMO_PROFILES[idx];
    currentPeekIdx = idx;
    $('#peek-avatar').textContent = p.name[0];
    $('#peek-name').textContent = p.name;
    $('#peek-age').textContent = p.age;
    $('#peek-venue').textContent = 'at Elsewhere · ' + p.time + ' min';
    $('#peek-tap-confirm').textContent = '';

    const vibesContainer = $('#peek-vibes');
    vibesContainer.innerHTML = '';
    p.vibes.forEach(v => {
      const pill = document.createElement('span');
      pill.className = 'btn-pill';
      pill.textContent = v;
      vibesContainer.appendChild(pill);
    });

    $('#peek-overlay').classList.add('active');
  }

  $('#btn-peek-close').addEventListener('click', () => {
    $('#peek-overlay').classList.remove('active');
  });

  $('#peek-overlay').addEventListener('click', (e) => {
    if (e.target === $('#peek-overlay')) {
      $('#peek-overlay').classList.remove('active');
    }
  });

  $('#btn-tap').addEventListener('click', () => {
    if (currentPeekIdx >= 0) {
      const dot = document.querySelector(`.map-dot[data-profile-idx="${currentPeekIdx}"]`);
      if (dot) dot.classList.add('tapped');
      $('#peek-tap-confirm').textContent = 'tap sent.';
      $('#btn-tap').disabled = true;
      setTimeout(() => { $('#btn-tap').disabled = false; }, 2000);
    }
  });

  // ---- 6. Drink Modal ----
  let selectedDrink = null;
  let selectedPayment = 'card';

  $('#btn-send-drink').addEventListener('click', () => {
    $('#peek-overlay').classList.remove('active');
    selectedDrink = null;
    $$('.drink-card').forEach(c => c.classList.remove('selected'));
    $('#drink-message').value = '';
    $('#drink-msg-counter').textContent = '140';
    $('#drink-overlay').classList.add('active');
  });

  $$('.drink-card').forEach(card => {
    card.addEventListener('click', () => {
      $$('.drink-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedDrink = card.dataset.drink;
    });
  });

  $('#drink-message').addEventListener('input', () => {
    const remaining = 140 - $('#drink-message').value.length;
    $('#drink-msg-counter').textContent = remaining;
  });

  $$('.drink-pay-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.drink-pay-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedPayment = btn.dataset.pay;
    });
  });

  $('#btn-send-drink-confirm').addEventListener('click', () => {
    if (!selectedDrink) return;
    $('#drink-overlay').classList.remove('active');
    $('#drink-success').classList.add('active');
    setTimeout(() => {
      $('#drink-success').classList.remove('active');
      navigate('map');
    }, 2000);
  });

  $('#btn-drink-cancel').addEventListener('click', () => {
    $('#drink-overlay').classList.remove('active');
  });

  // Toggle (generic)
  $$('.toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('on');
    });
  });

  // ---- 7. Drink Inbox ----
  function startInboxTimer() {
    if (inboxTimerInterval) clearInterval(inboxTimerInterval);
    inboxTimerInterval = setInterval(() => {
      if (inboxTimerSeconds <= 0) {
        clearInterval(inboxTimerInterval);
        return;
      }
      inboxTimerSeconds--;
      const m = Math.floor(inboxTimerSeconds / 60);
      const s = inboxTimerSeconds % 60;
      const timerEl = $('#inbox-timer');
      if (timerEl) timerEl.textContent = m + ':' + String(s).padStart(2, '0');
    }, 1000);
  }

  $('#btn-accept-drink').addEventListener('click', () => {
    const card = $('#inbox-demo-card');
    card.innerHTML = '<div class="inbox-card-title" style="color:var(--accent)">chat opens.</div>';
    setTimeout(() => navigate('chat'), 1200);
  });

  $('#btn-decline-drink').addEventListener('click', () => {
    const card = $('#inbox-demo-card');
    card.style.opacity = '0';
    setTimeout(() => {
      card.style.display = 'none';
      const empty = document.createElement('div');
      empty.className = 'inbox-empty';
      empty.textContent = 'nothing yet. the night is young.';
      $('#inbox-content').appendChild(empty);
    }, 300);
  });

  // ---- 8. Chat ----
  $('#btn-chat-send').addEventListener('click', sendChatMessage);
  $('#chat-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });

  function sendChatMessage() {
    const input = $('#chat-input');
    const val = input.value.trim();
    if (!val) return;
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble you';
    bubble.textContent = val;
    $('#chat-messages').appendChild(bubble);
    input.value = '';
    $('#chat-messages').scrollTop = $('#chat-messages').scrollHeight;
  }

  // ---- 9. Reverb ----
  $$('.reverb-card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (pointsBalance < 10) return;
      pointsBalance -= 10;
      btn.textContent = 'reverb sent.';
      btn.style.color = 'var(--accent)';
      btn.disabled = true;
      updatePointsDisplay();
    });
  });

  function updatePointsDisplay() {
    $('#points-total').textContent = pointsBalance;
    $('#reverb-balance').textContent = 'points balance: ' + pointsBalance;
  }

  // ---- Nav ----
  $$('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      navigate(item.dataset.screen);
    });
  });

  // ---- Settings ----
  $('#btn-settings').addEventListener('click', () => {
    navigate('settings');
  });

  $('#btn-settings-back').addEventListener('click', () => {
    navigate(SCREENS_WITH_NAV.includes(previousScreen) ? previousScreen : 'map');
  });

  $('#btn-delete-account').addEventListener('click', () => {
    if (confirm('Are you sure? This cannot be undone.')) {
      navigate('landing');
    }
  });

  // ---- Hash routing ----
  function handleHash() {
    const hash = window.location.hash.replace('#', '') || 'landing';
    const valid = ['landing', 'apply', 'pending', 'vibes', 'map', 'inbox', 'chat', 'reverb', 'points', 'settings'];
    if (valid.includes(hash)) {
      navigate(hash);
    }
  }

  window.addEventListener('hashchange', handleHash);

  // ---- Theme ----
  function applyTheme(t) {
    const themes = ['amber', 'velvet', 'noir'];
    const root = document.documentElement;
    // Remove theme attr for amber (default), set for others
    if (t === 'amber') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', t);
    // Update swatch active state
    document.querySelectorAll('.theme-swatch').forEach(s => {
      s.classList.toggle('active', s.dataset.t === t);
    });
    // Update meta theme-color
    const colors = { amber: '#080810', velvet: '#07050C', noir: '#050505' };
    document.querySelector('meta[name="theme-color"]').content = colors[t] || '#080810';
    localStorage.setItem('tapin-theme', t);
  }

  document.querySelectorAll('.theme-swatch').forEach(s => {
    s.addEventListener('click', () => applyTheme(s.dataset.t));
  });

  // Restore saved theme — default noir
  applyTheme(localStorage.getItem('tapin-theme') || 'noir');

  // ---- Init ----
  buildVibesGrid();
  startInboxTimer();

  // Start at landing unless hash says otherwise
  if (window.location.hash && window.location.hash !== '#landing') {
    handleHash();
  }
})();
