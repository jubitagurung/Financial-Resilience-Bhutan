// ── SECTION NAVIGATION ──
function showSection(id) {
  document.querySelectorAll('section, .overlay').forEach(el => {
    el.classList.remove('active');
    el.style.display = 'none';
  });

  const target = document.getElementById(id);
  if (target) {
    target.style.display = 'flex';
    target.style.flexDirection = 'column';
    target.style.alignItems = 'center';
    target.classList.add('active');
  }

  document.querySelectorAll('nav a').forEach(a => a.classList.remove('active-link'));
  const navLink = document.getElementById('nav-' + id);
  if (navLink) navLink.classList.add('active-link');

  document.getElementById('nav-menu')?.classList.remove('open');
  const t = document.getElementById('nav-toggle');
  if (t) {
    t.classList.remove('open');
    t.setAttribute('aria-expanded', 'false');
  }

  if (id === 'quiz') {
    const isResultsVisible = document.getElementById('quiz-results')?.getAttribute('data-visible') === 'true';
    if (isResultsVisible) {
      showQuizScreen('results');
    } else {
      showQuizScreen('start');
    }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── HAMBURGER TOGGLE ──
(function () {
  const toggle = document.getElementById('nav-toggle');
  const menu   = document.getElementById('nav-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
  });

  document.addEventListener('click', e => {
    if (!menu.contains(e.target) && !toggle.contains(e.target)) {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      menu.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
})();

// ── TOAST ──

function dismissToast() {
  const t = document.getElementById('quiz-toast');
  if (!t) return;
  t.style.transition = 'opacity 0.6s, transform 0.6s';
  t.style.opacity = '0';
  t.style.transform = 'translateX(60px)';
  setTimeout(() => { t.style.display = 'none'; }, 600);
}

function reopenToast() {
  const t = document.getElementById('quiz-toast');
  if (!t) return;
  t.style.display = 'block';
  t.style.opacity = '1';
  t.style.transform = 'translateX(0)';
}

function showToastOnHome() {
  const t = document.getElementById('quiz-toast');
  if (!t) return;
  t.style.display = 'block';
  setTimeout(() => dismissToast(), 30000);
}


// ── CONFETTI ──
function launchConfetti() {
  const wrap = document.getElementById('confetti-wrap');
  if (!wrap) return;
  wrap.style.display = 'block';
  wrap.innerHTML = '';
  const colors = ['#c9a84c','#4caf82','#e25f0e','#f0ead6','#5cb8e4'];
  for (let i = 0; i < 70; i++) {
    const c = document.createElement('div');
    c.className = 'conf';
    c.style.left = Math.random() * 100 + '%';
    c.style.background = colors[Math.floor(Math.random() * colors.length)];
    c.style.animationDuration = (1.8 + Math.random() * 2.2) + 's';
    c.style.animationDelay = (Math.random() * 0.8) + 's';
    c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    wrap.appendChild(c);
  }
  setTimeout(() => { wrap.style.display = 'none'; }, 5000);
}

// ── PLANNER WELCOME BANNER ──
function setPlannerBanner(score, total) {
  const banner = document.getElementById('planner-welcome-banner');
  const text   = document.getElementById('planner-banner-text');
  if (!banner || !text) return;
  const pct = total > 0 ? Math.round(score / total * 100) : -1;

  if (pct === 100) {
    text.innerHTML = '🏆 Perfect score on the quiz! You\'re a financial expert — now build a budget that matches your knowledge.';
  } else if (pct >= 75) {
    text.innerHTML = '⭐ Great quiz result! Now apply what you know with the SmartBudget Planner.';
  } else if (pct >= 50) {
    text.innerHTML = '📈 Good effort on the quiz! The Budget Planner is the perfect next step to build real habits.';
  } else if (pct >= 0) {
    text.innerHTML = '💡 The best way to improve is to practise — the Budget Planner will guide you step by step.';
  } else {
    text.innerHTML = '👋 Welcome! The SmartBudget Planner will help you take control of your finances.';
  }
  banner.style.display = 'block';
}

// ══════════════════════════════════════════════════════════════════════
// ── LOCAL HISTORY ENGINE
// ══════════════════════════════════════════════════════════════════════

const LOCAL_KEY = 'sbb_quiz_history';

function localSaveResult(entry) {
  try {
    const existing = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    existing.push(entry);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(existing));
  } catch (e) {
    console.warn('localStorage save failed:', e);
  }
}

function localLoadHistory(name) {
  try {
    const all = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    return all.filter(r => r.name.toLowerCase() === name.toLowerCase());
  } catch (e) {
    return [];
  }
}

function localClearHistory(name) {
  try {
    const all = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    const filtered = all.filter(r => r.name.toLowerCase() !== name.toLowerCase());
    localStorage.setItem(LOCAL_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn('localStorage clear failed:', e);
  }
}

// Silent background sync to Flask — fire and forget, never blocks UI
async function syncToFlask(entry) {
  try {
    await fetch(`${SBB_API}/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
      signal: AbortSignal.timeout(3000)
    });
  } catch (_) {
    // Server not running — localStorage has the data
  }
}

// Main save: always saves locally, tries server silently in background
function saveQuizResult(name, score, total, points, streak) {
  const entry = {
    name,
    score,
    total,
    pct: Math.round(score / total * 100),
    points,
    streak,
    date: new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }),
    time: new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })
  };
  localSaveResult(entry);
  syncToFlask(entry);
  return entry;
}

// ── RENDER HISTORY (with individual delete buttons) ──
function renderHistoryHTML(results, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;

  if (!results.length) {
    el.innerHTML = `
      <div style="background:rgba(201,168,76,0.06); border:1px solid rgba(201,168,76,0.2);
        border-radius:10px; padding:16px 20px; text-align:center;
        color:var(--muted); font-size:13px; line-height:1.7;">
        No quiz history found yet. Complete the quiz to see your results here!
      </div>`;
    return;
  }

  const best = results.reduce((b, r) => r.points > b.points ? r : b, results[0]);
  const reversed = [...results].reverse();

  el.innerHTML = `
    <div class="pts-summary" style="margin-bottom:16px;">
      <div class="pts-row">
        <div class="pts-item"><div class="pts-val">${results.length}</div><div class="pts-lbl">Attempts</div></div>
        <div class="pts-item"><div class="pts-val">${best.points}</div><div class="pts-lbl">Best Points</div></div>
        <div class="pts-item"><div class="pts-val">${best.pct}%</div><div class="pts-lbl">Best Score</div></div>
        <div class="pts-item"><div class="pts-val">🔥 ${best.streak ?? 0}</div><div class="pts-lbl">Best Streak</div></div>
      </div>
    </div>
    ${reversed.map((r, i) => {
      const actualIndex = results.length - 1 - i;
      return `
      <div class="breakdown-item" id="history-entry-${actualIndex}" style="position:relative; padding-right:44px;">
        <div class="breakdown-icon">${r.pct === 100 ? '🏆' : r.pct >= 75 ? '⭐' : r.pct >= 50 ? '📈' : '📚'}</div>
        <div class="breakdown-q">
          <strong>Attempt ${results.length - i} · ${r.date} ${r.time}</strong>
          <span style="color:var(--green)">${r.score}/${r.total} correct · ${r.points} pts · ${r.pct}%</span>
          ${r.streak ? `<span class="bd-tip">🔥 Best streak: ${r.streak}</span>` : ''}
        </div>
        <button onclick="deleteSingleHistory(${actualIndex})" title="Delete this attempt" style="
          position:absolute; top:50%; right:0;
          transform:translateY(-50%);
          background:transparent;
          border:1px solid rgba(226,95,14,0.35);
          color:#e25f0e; border-radius:6px;
          width:32px; height:32px;
          font-size:15px; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          transition:background 0.2s;"
          onmouseover="this.style.background='rgba(226,95,14,0.15)'"
          onmouseout="this.style.background='transparent'">🗑</button>
      </div>`;
    }).join('')}`;
}

// ── DELETE A SINGLE HISTORY ENTRY ──
function deleteSingleHistory(indexToDelete) {
  const name = sessionStorage.getItem('sbb_player_name');
  if (!name) return;
  if (!confirm('Delete this attempt?')) return;

  try {
    const all = JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
    const userEntries  = all.filter(r => r.name.toLowerCase() === name.toLowerCase());
    const otherEntries = all.filter(r => r.name.toLowerCase() !== name.toLowerCase());

    userEntries.splice(indexToDelete, 1);

    const updated = [...otherEntries, ...userEntries];
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));

    renderHistoryHTML(userEntries, 'history-container');
  } catch (e) {
    console.warn('Delete failed:', e);
  }
}

function toggleHistory() {
  const historyEl = document.getElementById('history-container');
  const resultsEl = document.getElementById('result-breakdown');
  if (!historyEl) return;

  const isOpen = historyEl.style.display === 'block';

  historyEl.style.display = 'none';
  resultsEl.style.display = 'none';

  if (!isOpen) {
    const name = sessionStorage.getItem('sbb_player_name');
    if (!name) {
      alert('No name found. Please start the quiz first and enter your name.');
      return;
    }
    const localResults = localLoadHistory(name);
    renderHistoryHTML(localResults, 'history-container');
    historyEl.style.display = 'block';
  }
}

function toggleResults() {
  const resultsEl = document.getElementById('result-breakdown');
  const historyEl = document.getElementById('history-container');
  if (!resultsEl) return;

  const isOpen = resultsEl.style.display === 'block';

  resultsEl.style.display = 'none';
  historyEl.style.display = 'none';

  if (!isOpen) {
    resultsEl.style.display = 'block';
  }
}

// ══════════════════════════════════════════════
// ── QUIZ ENGINE ──
// ══════════════════════════════════════════════

const QUESTIONS = [
  {
    q: "According to the 50/30/20 budgeting rule, what percentage of income should go towards savings?",
    options: ["10%", "20%", "30%", "50%"],
    correct: 1,
    points: 10,
    explanation: "The 50/30/20 rule allocates 50% to needs, 30% to wants, and 20% to savings. This framework helps ensure you consistently build financial resilience.",
    tip: "💡 Try automating your savings transfer on payday so it happens before you can spend it.",
    example: "If you earn Nu. 30,000/month, Nu. 6,000 should go straight to savings."
  },
  {
    q: "A household earns Nu. 40,000 per month. Using the 50/30/20 rule, what should their monthly savings target be?",
    options: ["Nu. 4,000", "Nu. 6,000", "Nu. 8,000", "Nu. 12,000"],
    correct: 2,
    points: 10,
    explanation: "20% of Nu. 40,000 = Nu. 8,000. This is the recommended savings target for a middle-income household in urban Bhutan.",
    tip: "💡 Open a dedicated savings account so this amount is out of sight, out of mind.",
    example: "20% × Nu. 40,000 = Nu. 8,000/month = Nu. 96,000 saved in a year!"
  },
  {
    q: "What is 'lifestyle creep' in personal finance?",
    options: [
      "Spending more on food as you age",
      "Increasing your savings rate over time",
      "Spending more as your income rises, without increasing savings",
      "Taking on debt to maintain a lifestyle"
    ],
    correct: 2,
    points: 10,
    explanation: "Lifestyle creep means your expenses grow as your income grows, leaving no room for increased savings. The key habit is to save the difference when your income rises.",
    tip: "💡 When you get a raise, increase your savings by at least 50% of the raise amount.",
    example: "Sonam got a Nu. 5,000 raise but started spending Nu. 5,000 more — her savings never grew."
  },
  {
    q: "How many months of living expenses should you ideally have in an emergency fund?",
    options: ["1 month", "2 months", "3–6 months", "12 months"],
    correct: 2,
    points: 10,
    explanation: "Financial advisors recommend keeping 3–6 months of living expenses in an emergency fund. This cushion protects against job loss, medical bills, or urgent repairs.",
    tip: "💡 Start small — even Nu. 500/month builds to Nu. 6,000 in a year.",
    example: "If your monthly expenses are Nu. 20,000, aim for Nu. 60,000–120,000 in emergency savings."
  },
  {
    q: "Which of the following is a 'need' in the 50/30/20 budgeting framework?",
    options: ["Streaming services", "Dining at restaurants", "Rent and electricity", "Gym membership"],
    correct: 2,
    points: 10,
    explanation: "Needs are essential expenses you cannot live without — rent, food, utilities, and transport. Streaming services, dining out, and gym memberships are typically 'wants'.",
    tip: "💡 List your fixed bills — these are your needs. Everything else is likely a want.",
    example: "Rent, electricity, groceries, and transport to work = Needs. Netflix = Want."
  },
  {
    q: "A family saves Nu. 500 per month starting today. How much will they have saved after 1 year?",
    options: ["Nu. 5,000", "Nu. 6,000", "Nu. 7,200", "Nu. 8,000"],
    correct: 1,
    points: 10,
    explanation: "Nu. 500 × 12 months = Nu. 6,000. Even small consistent amounts build meaningful savings — the key is consistency, not size.",
    tip: "💡 Even small amounts add up. Consistency beats size every time.",
    example: "Nu. 500 × 12 = Nu. 6,000. That's a school fee, an emergency fund, or a holiday covered."
  },
  {
    q: "Why is it recommended to keep your savings in a separate bank account from your spending account?",
    options: [
      "Banks charge less fees on separate accounts",
      "It earns a higher interest rate automatically",
      "It reduces temptation to spend your savings",
      "It is required by Bhutanese banking law"
    ],
    correct: 2,
    points: 10,
    explanation: "Keeping savings in a separate account creates a mental and physical barrier between your spending money and your saved money — reducing the temptation to dip into savings.",
    tip: "💡 Use BNB or Bank of Bhutan to open a free second savings account today.",
    example: "Pema kept savings in her main account — she spent it all within 2 weeks without noticing."
  },
  {
    q: "Which of these strategies is an example of 'paying yourself first'?",
    options: [
      "Saving whatever money remains at the end of the month",
      "Transferring your savings target to a savings account on payday, before any other spending",
      "Paying all bills before spending on entertainment",
      "Investing in the stock market every quarter"
    ],
    correct: 1,
    points: 10,
    explanation: "'Pay yourself first' means automatically moving your savings to a separate account as soon as you receive your salary before spending on anything else. This makes saving automatic, not optional.",
    tip: "💡 Set up an automatic transfer on the day your salary arrives so saving is never optional.",
    example: "Karma receives salary on the 1st, she immediately moves Nu. 4,000 to savings before spending."
  },
  {
    q: "🏠 SCENARIO: Tshering earns Nu. 25,000/month. Her rent is Nu. 8,000, groceries Nu. 4,000, phone Nu. 500, and transport Nu. 1,500. She spends Nu. 6,000 on eating out and shopping. How much can she realistically save?",
    options: ["Nu. 2,000", "Nu. 5,000", "Nu. 8,000", "She cannot save anything"],
    correct: 1,
    points: 15,
    explanation: "Total fixed costs: Nu. 14,000. Discretionary spending: Nu. 6,000. That leaves Nu. 5,000 available to save each month.",
    tip: "💡 Track discretionary spending for just one week most people are shocked by what they find.",
    example: "Total fixed costs: Nu. 14,000. Wants: Nu. 6,000. Remaining: Nu. 5,000 available to save."
  },
  {
    q: "🚨 SCENARIO: Dorji lost his job unexpectedly. He has Nu. 10,000 in savings and monthly expenses of Nu. 15,000. How many weeks can he survive without income?",
    options: ["About 2.5 weeks", "About 3 weeks", "Exactly 1 month", "About 6 weeks"],
    correct: 0,
    points: 15,
    explanation: "Nu. 10,000 ÷ Nu. 15,000 = 0.67 months ≈ about 2.5 weeks. Without an emergency fund, even a short job gap creates a crisis.",
    tip: "💡 This is why a 3–6 month emergency fund matters. Start building yours today.",
    example: "Nu. 10,000 ÷ Nu. 15,000 = 0.67 months ≈ about 2.5 weeks. Extremely vulnerable!"
  },
  {
    q: "📈 SCENARIO: Sonam gets a salary raise of Nu. 8,000/month. She currently saves nothing. What is the BEST financial move?",
    options: [
      "Spend the full raise she deserves it",
      "Save Nu. 1,600 (20%) and spend the rest",
      "Save the entire Nu. 8,000 raise for 6 months",
      "Use the raise to take out a bigger loan"
    ],
    correct: 1,
    points: 15,
    explanation: "Saving 20% of the raise applies the 50/30/20 rule to new income painless because she never had that money before.",
    tip: "💡 Saving 20% of a raise is painless you never had that money before, so you won't miss it.",
    example: "Nu. 1,600/month × 12 months = Nu. 19,200 saved in year one just from the raise!"
  },
  {
    q: "🛒 SCENARIO: Kinley has Nu. 3,000 left after bills. He wants new shoes (Nu. 2,500) but also has no emergency fund. What should he do?",
    options: [
      "Buy the shoes, he needs them",
      "Buy the shoes on credit and pay later",
      "Save the Nu. 3,000 and wait to buy shoes next month",
      "Split it: Nu. 1,500 to savings, skip shoes this month"
    ],
    correct: 2,
    points: 15,
    explanation: "Building an emergency fund takes priority over discretionary purchases. Delaying wants now prevents a financial crisis later.",
    tip: "💡 Delaying wants to build an emergency fund first is the foundation of financial resilience.",
    example: "After 4 months of saving Nu. 3,000, Kinley has Nu. 12,000 emergency fund AND can buy shoes."
  }
];

// ── STATE ──
let currentQ = 0;
let score = 0;
let totalPoints = 0;
let streak = 0;
let bestStreak = 0;
let answers = [];
let answeredQuestions;

function showQuizScreen(screen) {
  const startEl    = document.getElementById('quiz-start');
  const questionEl = document.getElementById('quiz-question');
  const resultsEl  = document.getElementById('quiz-results');
  const navBtns    = document.getElementById('quiz-nav-buttons');

  startEl.style.display    = 'none';
  questionEl.style.display = 'none';
  resultsEl.style.display  = 'none';
  navBtns.style.display    = 'none';

  if (screen === 'start') {
    startEl.style.display = 'block';
    resultsEl.setAttribute('data-visible', 'false');
  } else if (screen === 'question') {
    questionEl.style.display = 'block';
    resultsEl.setAttribute('data-visible', 'false');
  } else if (screen === 'results') {
    resultsEl.style.display  = 'flex';
    resultsEl.style.flexDirection = 'column';
    resultsEl.style.alignItems    = 'center';
    resultsEl.setAttribute('data-visible', 'true');
    navBtns.style.display = 'flex';
  }
}

function showQuizResults() {
  document.querySelectorAll('section, .overlay').forEach(el => {
    el.classList.remove('active');
    el.style.display = 'none';
  });
  const quizSection = document.getElementById('quiz');
  if (quizSection) {
    quizSection.style.display = 'flex';
    quizSection.style.flexDirection = 'column';
    quizSection.style.alignItems = 'center';
    quizSection.classList.add('active');
  }

  document.querySelectorAll('nav a').forEach(a => a.classList.remove('active-link'));
  const navLink = document.getElementById('nav-quiz');
  if (navLink) navLink.classList.add('active-link');

  showQuizScreen('results');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function startQuizWithName() {
  const input = document.getElementById('player-name-input');
  const error = document.getElementById('name-error');
  const name  = input.value.trim();

  if (!name) {
    error.style.display = 'block';
    input.focus();
    return;
  }

  error.style.display = 'none';
  sessionStorage.setItem('sbb_player_name', name);
  startQuiz();
}

function startQuiz() {
  currentQ = 0; score = 0; totalPoints = 0; streak = 0; bestStreak = 0;
  answers = [];
  answeredQuestions = new Array(QUESTIONS.length).fill(null);

  const old = document.getElementById('q-prev-btn');
  if (old) old.remove();
  const oldRow = document.getElementById('q-btn-row');
  if (oldRow) oldRow.remove();
  const oldPts = document.getElementById('pts-summary');
  if (oldPts) oldPts.remove();

  const hc = document.getElementById('history-container');
  if (hc) hc.innerHTML = '';

  showQuizScreen('question');
  renderQuestion();
}

function renderQuestion() {
  const q = QUESTIONS[currentQ];
  const total = QUESTIONS.length;
  const pct = ((currentQ + 1) / total) * 100;

  document.getElementById('q-counter').textContent = `Question ${currentQ + 1} of ${total}`;
  document.getElementById('q-progress-fill').style.width = pct + '%';
  document.getElementById('q-number').textContent = `QUESTION ${currentQ + 1}`;
  document.getElementById('q-text').textContent = q.q;

  let ptsBadge = document.getElementById('q-points-badge');
  if (!ptsBadge) {
    ptsBadge = document.createElement('div');
    ptsBadge.id = 'q-points-badge';
    ptsBadge.className = 'q-points-badge';
    document.getElementById('q-number').after(ptsBadge);
  }
  ptsBadge.innerHTML = `+${q.points} pts &nbsp;|&nbsp; 🔥 Streak: <span id="streak-live">${streak}</span>`;

  score = answeredQuestions.filter((a, i) => a !== null && a === QUESTIONS[i].correct).length;
  totalPoints = answeredQuestions.reduce((sum, a, i) => {
    if (a !== null && a === QUESTIONS[i].correct) return sum + QUESTIONS[i].points;
    return sum;
  }, 0);
  document.getElementById('q-score-live').textContent = `Score: ${score} · ${totalPoints} pts`;

  const optionsEl = document.getElementById('q-options');
  optionsEl.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D'];
  const prevAnswer = answeredQuestions[currentQ];

  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.innerHTML = `<span class="option-letter">${letters[i]}</span><span>${opt}</span>`;
    if (prevAnswer !== null) {
      btn.classList.add('disabled');
      if (i === q.correct) btn.classList.add('correct');
      else if (i === prevAnswer && prevAnswer !== q.correct) btn.classList.add('wrong');
    } else {
      btn.onclick = () => selectAnswer(i);
    }
    optionsEl.appendChild(btn);
  });

  const feedback = document.getElementById('q-feedback');
  if (prevAnswer !== null) {
    const isCorrect = prevAnswer === q.correct;
    feedback.className = 'quiz-feedback ' + (isCorrect ? 'correct-fb' : 'wrong-fb');
    feedback.innerHTML = `
      <div class="fb-main">${isCorrect ? '✅' : '❌'} ${q.explanation}</div>
      <div class="fb-example">📌 <strong>Example:</strong> ${q.example}</div>
      <div class="fb-tip">${q.tip}</div>
    `;
    feedback.style.display = 'block';
  } else {
    feedback.style.display = 'none';
    feedback.innerHTML = '';
  }

 // ── Next button (always lives in the card HTML, never moved) ──
  const nextBtn = document.getElementById('q-next-btn');
  nextBtn.style.display = prevAnswer !== null ? 'inline-block' : 'none';
  nextBtn.textContent = currentQ < QUESTIONS.length - 1 ? 'Next Question →' : 'See My Results →';

  // ── Prev button (dynamic, but always re-created fresh if missing) ──
  let prevBtn = document.getElementById('q-prev-btn');
  if (!prevBtn) {
    prevBtn = document.createElement('button');
    prevBtn.id = 'q-prev-btn';
    prevBtn.className = 'quiz-next-btn';
    prevBtn.style.marginTop = '22px';
    prevBtn.textContent = '← Previous';
    prevBtn.onclick = prevQuestion;
    // Insert it right before the next button so they sit side by side
    nextBtn.parentNode.insertBefore(prevBtn, nextBtn);
  }
  prevBtn.style.display = currentQ > 0 ? 'inline-block' : 'none';


  const card = document.getElementById('quiz-q-card');
  card.classList.remove('fade-in');
  void card.offsetWidth;
  card.classList.add('fade-in');
}

function resetQuiz() {
  // Remove dynamically added elements
  const prevBtn = document.getElementById('q-prev-btn');
  if (prevBtn) prevBtn.remove();
  const btnRow = document.getElementById('q-btn-row');
  if (btnRow) btnRow.remove();
  const ptsSummary = document.getElementById('pts-summary');
  if (ptsSummary) ptsSummary.remove();
  const ptsBadge = document.getElementById('q-points-badge');
  if (ptsBadge) ptsBadge.remove();

  // Reset all state
  currentQ = 0; score = 0; totalPoints = 0; streak = 0; bestStreak = 0;
  answers = [];
  answeredQuestions = new Array(QUESTIONS.length).fill(null);

  // Reset next button visibility
  const nextBtn = document.getElementById('q-next-btn');
  if (nextBtn) {
    nextBtn.style.display = 'none';
    nextBtn.textContent = 'Next Question →';
  }

  // Clear feedback
  const feedback = document.getElementById('q-feedback');
  if (feedback) {
    feedback.style.display = 'none';
    feedback.innerHTML = '';
  }

  showQuizScreen('start');
}

function selectAnswer(selectedIndex) {
  const q = QUESTIONS[currentQ];
  answeredQuestions[currentQ] = selectedIndex;
  const opts = document.querySelectorAll('.quiz-option');
  opts.forEach(o => o.classList.add('disabled'));

  const isCorrect = selectedIndex === q.correct;

  opts.forEach((o, i) => {
    if (i === q.correct) o.classList.add('correct');
    else if (i === selectedIndex && !isCorrect) o.classList.add('wrong');
  });

  if (isCorrect) {
    streak++;
    if (streak > bestStreak) bestStreak = streak;
    if (streak >= 3) showStreakToast(streak);
  } else {
    streak = 0;
  }
  const streakEl = document.getElementById('streak-live');
  if (streakEl) streakEl.textContent = streak;

  answers[currentQ] = {
    question: q.q,
    selectedIndex,
    correctIndex: q.correct,
    isCorrect,
    selectedText: q.options[selectedIndex],
    correctText: q.options[q.correct],
    explanation: q.explanation,
    example: q.example,
    tip: q.tip,
    points: q.points
  };

  const feedback = document.getElementById('q-feedback');
  feedback.className = 'quiz-feedback ' + (isCorrect ? 'correct-fb' : 'wrong-fb');
  feedback.innerHTML = `
    <div class="fb-main">${isCorrect ? '✅' : '❌'} ${q.explanation}</div>
    <div class="fb-example">📌 <strong>Example:</strong> ${q.example}</div>
    <div class="fb-tip">${q.tip}</div>
  `;
  feedback.style.display = 'block';

  score = answeredQuestions.filter((a, i) => a !== null && a === QUESTIONS[i].correct).length;
  totalPoints = answeredQuestions.reduce((sum, a, i) => {
    if (a !== null && a === QUESTIONS[i].correct) return sum + QUESTIONS[i].points;
    return sum;
  }, 0);
  document.getElementById('q-score-live').textContent = `Score: ${score} · ${totalPoints} pts`;

  const nextBtn = document.getElementById('q-next-btn');
  nextBtn.style.display = 'inline-block';
  nextBtn.textContent = currentQ < QUESTIONS.length - 1 ? 'Next Question →' : 'See My Results →';
}

function showStreakToast(n) {
  let t = document.getElementById('streak-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'streak-toast';
    t.className = 'streak-toast';
    document.body.appendChild(t);
  }
  t.innerHTML = `🔥 ${n} in a row! Streak Bonus!`;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function prevQuestion() {
  if (currentQ > 0) { currentQ--; renderQuestion(); }
}

function nextQuestion() {
  if (currentQ < QUESTIONS.length - 1) {
    currentQ++;
    renderQuestion();
  } else {
    answers = QUESTIONS.map((q, i) => ({
      question: q.q,
      selectedIndex: answeredQuestions[i],
      correctIndex: q.correct,
      isCorrect: answeredQuestions[i] === q.correct,
      selectedText: answeredQuestions[i] !== null ? q.options[answeredQuestions[i]] : 'Not answered',
      correctText: q.options[q.correct],
      explanation: q.explanation,
      example: q.example,
      tip: q.tip,
      points: q.points
    }));
    score = answers.filter(a => a.isCorrect).length;
    totalPoints = answers.reduce((sum, a) => sum + (a.isCorrect ? a.points : 0), 0);
    showResults();
  }
}

function showResults() {
  const total = QUESTIONS.length;
  const maxPoints = QUESTIONS.reduce((s, q) => s + q.points, 0);
  const pct = Math.round(score / total * 100);

  document.getElementById('result-score').textContent = `${score}/${total}`;

  let ptsSummary = document.getElementById('pts-summary');
  if (!ptsSummary) {
    ptsSummary = document.createElement('div');
    ptsSummary.id = 'pts-summary';
    ptsSummary.className = 'pts-summary';
    document.querySelector('.quiz-score-ring-wrap').insertAdjacentElement('afterend', ptsSummary);
  }
  ptsSummary.innerHTML = `
    <div class="pts-row">
      <div class="pts-item"><div class="pts-val">${totalPoints}</div><div class="pts-lbl">Total Points</div></div>
      <div class="pts-item"><div class="pts-val">${maxPoints}</div><div class="pts-lbl">Max Points</div></div>
      <div class="pts-item"><div class="pts-val">🔥 ${bestStreak}</div><div class="pts-lbl">Best Streak</div></div>
      <div class="pts-item"><div class="pts-val">${score}/${total}</div><div class="pts-lbl">Correct</div></div>
    </div>
  `;

  let title, subtitle;
  if (pct === 100)    { title = 'Financial Expert!';  subtitle = 'Perfect score: you are ready to teach others!'; }
  else if (pct >= 75) { title = 'Great Knowledge!';   subtitle = 'Strong foundation: a few areas to sharpen.'; }
  else if (pct >= 50) { title = 'Good Start!';        subtitle = 'You know the basics: keep building on them.'; }
  else                { title = 'Keep Learning!';     subtitle = 'Explore the Budget and Saving sections to strengthen your skills.'; }

  document.getElementById('result-title').textContent = title;
  document.getElementById('result-subtitle').textContent = subtitle;

  const breakdownEl = document.getElementById('breakdown-list');
  breakdownEl.innerHTML = '';
  answers.forEach((a, i) => {
    const div = document.createElement('div');
    div.className = 'breakdown-item';
    div.innerHTML = `
      <div class="breakdown-icon">${a.isCorrect ? '✅' : '❌'}</div>
      <div class="breakdown-q">
        <strong>Q${i + 1}: ${a.question.substring(0, 70)}${a.question.length > 70 ? '…' : ''}</strong>
        ${a.isCorrect
          ? `<span style="color:var(--green)">Correct: ${a.correctText} (+${a.points} pts)</span>`
          : `<span style="color:#f0955a">Your answer: ${a.selectedText} &nbsp;|&nbsp; Correct: ${a.correctText}</span>`
        }
        <span class="bd-tip">${a.tip}</span>
      </div>`;
    breakdownEl.appendChild(div);
  });

  if (pct === 100) launchConfetti();

  const playerName = sessionStorage.getItem('sbb_player_name');
  if (playerName) saveQuizResult(playerName, score, total, totalPoints, bestStreak);
  setPlannerBanner(score, total);

  document.querySelectorAll('section, .overlay').forEach(el => {
    el.classList.remove('active');
    el.style.display = 'none';
  });

  const quizEl = document.getElementById('quiz');
  quizEl.style.display = 'flex';
  quizEl.style.flexDirection = 'column';
  quizEl.style.alignItems = 'center';
  quizEl.classList.add('active');

  document.querySelectorAll('nav a').forEach(a => a.classList.remove('active-link'));
  const navQuiz = document.getElementById('nav-quiz');
  if (navQuiz) navQuiz.classList.add('active-link');

  showQuizScreen('results');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetQuiz() {
  const prevBtn = document.getElementById('q-prev-btn');
  if (prevBtn) prevBtn.remove();
  const btnRow = document.getElementById('q-btn-row');
  if (btnRow) btnRow.remove();
  const ptsSummary = document.getElementById('pts-summary');
  if (ptsSummary) ptsSummary.remove();
  const ptsBadge = document.getElementById('q-points-badge');
  if (ptsBadge) ptsBadge.remove();

  currentQ = 0; score = 0; totalPoints = 0; streak = 0; bestStreak = 0;
  answers = [];
  answeredQuestions = new Array(QUESTIONS.length).fill(null);

  // Reset next button back to original hidden state
  const nextBtn = document.getElementById('q-next-btn');
  if (nextBtn) {
    nextBtn.style.display = 'none';
    nextBtn.textContent = 'Next Question →';
  }

  const feedback = document.getElementById('q-feedback');
  if (feedback) {
    feedback.style.display = 'none';
    feedback.innerHTML = '';
  }

  showQuizScreen('start');
}

// ── SINGLE DOMContentLoaded ──
document.addEventListener('DOMContentLoaded', () => {

  document.querySelectorAll('section, .overlay').forEach(el => {
    el.classList.remove('active');
    el.style.display = 'none';
  });
  const homeEl = document.getElementById('home');
  if (homeEl) {
    homeEl.style.display = 'flex';
    homeEl.style.flexDirection = 'column';
    homeEl.style.alignItems = 'center';
    homeEl.classList.add('active');
  }
  showQuizScreen('start');

  setTimeout(() => showToastOnHome(), 3000);

  const msg = '🎉 Welcome to SmartBudget Bhutan!';
  const sub = 'Your journey to financial resilience starts here.';

  const welcomeToast = document.createElement('div');
  welcomeToast.id = 'welcome-toast';
  welcomeToast.style.cssText = `
    position: fixed; top: 70px; left: 50%;
    transform: translateX(-50%);
    background: rgba(12,9,2,0.97);
    border: 1px solid rgba(201,168,76,0.35);
    border-top: 3px solid #c9a84c;
    border-radius: 12px;
    padding: 16px 40px 16px 20px;
    z-index: 9998; min-width: 280px; max-width: 360px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.7);
  `;
  welcomeToast.innerHTML = `
    <div style="font-family:'Cinzel',serif; color:#c9a84c; font-size:13px; letter-spacing:1px; margin-bottom:5px;">${msg}</div>
    <div style="font-size:12px; color:#a89e84; line-height:1.55;">${sub}</div>
    <button onclick="document.getElementById('welcome-toast').remove()" style="
      position:absolute; top:8px; right:10px;
      background:transparent; border:none;
      color:#a89e84; cursor:pointer; font-size:13px;">✕</button>
  `;
  document.body.appendChild(welcomeToast);
  setTimeout(() => {
    const el = document.getElementById('welcome-toast');
    if (el) el.remove();
  }, 5000);

  if (window.innerWidth <= 768) {
    const hint = document.getElementById('mobile-scroll-hint');
    if (hint) hint.style.display = 'block';
  }
});

// ══ FINANCIAL TOOLS ══
function switchTab(tab, btn) {
  document.querySelectorAll('.tool-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + tab).classList.add('active');
  btn.classList.add('active');
}

function swapCurrencies() {
  const fromEl = document.getElementById('currency-from');
  const toEl   = document.getElementById('currency-to');
  const temp   = fromEl.value;
  fromEl.value = toEl.value;
  toEl.value   = temp;
}

async function convertCurrency() {
  const amount    = parseFloat(document.getElementById('nu-amount').value);
  const fromCur   = document.getElementById('currency-from').value;
  const toCur     = document.getElementById('currency-to').value;
  const resultBox = document.getElementById('converter-result');
  const output    = document.getElementById('currency-output');
  const rateNote  = document.getElementById('rate-note');

  if (!amount || amount <= 0) {
    output.innerHTML = '<div class="tool-error">Please enter a valid amount.</div>';
    resultBox.classList.add('show'); return;
  }
  if (fromCur === toCur) {
    output.innerHTML = '<div class="tool-error">Please select two different currencies.</div>';
    resultBox.classList.add('show'); return;
  }

  output.innerHTML = '<div class="tool-loading">Fetching live rates…</div>';
  resultBox.classList.add('show');

  const flagMap = {
    BTN:'🇧🇹', USD:'🇺🇸', INR:'🇮🇳', AUD:'🇦🇺', EUR:'🇪🇺',
    GBP:'🇬🇧', SGD:'🇸🇬', JPY:'🇯🇵', CAD:'🇨🇦', CHF:'🇨🇭',
    CNY:'🇨🇳', AED:'🇦🇪', MYR:'🇲🇾', THB:'🇹🇭', KRW:'🇰🇷'
  };
  const nameMap = {
    BTN:'Ngultrum', USD:'US Dollar', INR:'Indian Rupee',
    AUD:'Australian Dollar', EUR:'Euro', GBP:'British Pound',
    SGD:'Singapore Dollar', JPY:'Japanese Yen', CAD:'Canadian Dollar',
    CHF:'Swiss Franc', CNY:'Chinese Yuan', AED:'UAE Dirham',
    MYR:'Malaysian Ringgit', THB:'Thai Baht', KRW:'Korean Won'
  };
  const symMap = {
    BTN:'Nu.', USD:'$', INR:'₹', AUD:'A$', EUR:'€',
    GBP:'£', SGD:'S$', JPY:'¥', CAD:'C$', CHF:'Fr',
    CNY:'¥', AED:'د.إ', MYR:'RM', THB:'฿', KRW:'₩'
  };

  try {
    const apiFrom = fromCur === 'BTN' ? 'INR' : fromCur;
    const res  = await fetch(`https://api.exchangerate-api.com/v4/latest/${apiFrom}`);
    const data = await res.json();
    const apiTo = toCur === 'BTN' ? 'INR' : toCur;
    const rate  = data.rates[apiTo];
    const converted = (amount * rate).toFixed(2);

    output.innerHTML = `
      <div class="currency-item">
        <div class="currency-flag">${flagMap[fromCur]}</div>
        <div class="currency-amount">${symMap[fromCur]} ${Number(amount).toLocaleString('en-IN')}</div>
        <div class="currency-label">${nameMap[fromCur]}</div>
      </div>
      <div class="currency-item">
        <div class="currency-flag">${flagMap[toCur]}</div>
        <div class="currency-amount">${symMap[toCur]} ${Number(converted).toLocaleString('en-IN')}</div>
        <div class="currency-label">${nameMap[toCur]}</div>
      </div>`;
    rateNote.textContent = `Rate: 1 ${fromCur} = ${rate.toFixed(4)} ${toCur}  ·  Live exchange rate`;

  } catch(e) {
    const fallback = {
      BTN: { USD:0.012, INR:1.0,  AUD:0.018, EUR:0.011, GBP:0.0094, SGD:0.016, JPY:1.78,  CAD:0.016, CHF:0.010, CNY:0.086, AED:0.044, MYR:0.056, THB:0.41,  KRW:15.9  },
      USD: { BTN:84.0, INR:84.0,  AUD:1.53,  EUR:0.92,  GBP:0.79,   SGD:1.34,  JPY:149.5, CAD:1.36,  CHF:0.89,  CNY:7.24,  AED:3.67,  MYR:4.72,  THB:35.1,  KRW:1340  },
      INR: { BTN:1.0,  USD:0.012, AUD:0.018, EUR:0.011, GBP:0.0094, SGD:0.016, JPY:1.78,  CAD:0.016, CHF:0.010, CNY:0.086, AED:0.044, MYR:0.056, THB:0.41,  KRW:15.9  },
      AUD: { BTN:55.0, USD:0.65,  INR:55.0,  EUR:0.60,  GBP:0.52,   SGD:0.88,  JPY:97.7,  CAD:0.89,  CHF:0.58,  CNY:4.73,  AED:2.40,  MYR:3.08,  THB:22.9,  KRW:875   },
      EUR: { BTN:91.0, USD:1.08,  INR:91.0,  AUD:1.66,  GBP:0.86,   SGD:1.45,  JPY:161.5, CAD:1.47,  CHF:0.97,  CNY:7.83,  AED:3.97,  MYR:5.10,  THB:37.9,  KRW:1447  },
      GBP: { BTN:106., USD:1.27,  INR:106.,  AUD:1.94,  EUR:1.17,   SGD:1.69,  JPY:188.5, CAD:1.71,  CHF:1.13,  CNY:9.14,  AED:4.63,  MYR:5.95,  THB:44.2,  KRW:1688  },
      SGD: { BTN:62.5, USD:0.74,  INR:62.5,  AUD:1.14,  EUR:0.69,   GBP:0.59,  JPY:111.4, CAD:1.01,  CHF:0.66,  CNY:5.40,  AED:2.74,  MYR:3.52,  THB:26.1,  KRW:998   },
      JPY: { BTN:0.56, USD:0.0067,INR:0.56,  AUD:0.010, EUR:0.0062, GBP:0.0053,SGD:0.0090,CAD:0.0091,CHF:0.0060,CNY:0.048, AED:0.025, MYR:0.032, THB:0.235, KRW:8.97  },
      CAD: { BTN:61.8, USD:0.73,  INR:61.8,  AUD:1.12,  EUR:0.68,   GBP:0.58,  SGD:0.99,  JPY:110.0, CHF:0.65,  CNY:5.33,  AED:2.70,  MYR:3.47,  THB:25.8,  KRW:985   },
      CHF: { BTN:94.5, USD:1.12,  INR:94.5,  AUD:1.72,  EUR:1.03,   GBP:0.88,  SGD:1.51,  JPY:168.0, CAD:1.53,  CNY:8.14,  AED:4.12,  MYR:5.30,  THB:39.3,  KRW:1503  },
      CNY: { BTN:11.6, USD:0.138, INR:11.6,  AUD:0.211, EUR:0.128,  GBP:0.109, SGD:0.185, JPY:20.65, CAD:0.188, CHF:0.123, AED:0.507, MYR:0.652, THB:4.84,  KRW:185   },
      AED: { BTN:22.9, USD:0.272, INR:22.9,  AUD:0.417, EUR:0.252,  GBP:0.216, SGD:0.365, JPY:40.7,  CAD:0.371, CHF:0.243, CNY:1.97,  MYR:1.285, THB:9.56,  KRW:365   },
      MYR: { BTN:17.8, USD:0.212, INR:17.8,  AUD:0.325, EUR:0.196,  GBP:0.168, SGD:0.284, JPY:31.7,  CAD:0.289, CHF:0.189, CNY:1.533, AED:0.778, THB:7.44,  KRW:284   },
      THB: { BTN:2.39, USD:0.0285,INR:2.39,  AUD:0.0436,EUR:0.0264, GBP:0.0226,SGD:0.0382,JPY:4.26,  CAD:0.0388,CHF:0.0254,CNY:0.206, AED:0.105, MYR:0.134, KRW:38.2  },
      KRW: { BTN:0.063,USD:0.00075,INR:0.063,AUD:0.00114,EUR:0.00069,GBP:0.00059,SGD:0.001,JPY:0.1115,CAD:0.00102,CHF:0.00067,CNY:0.0054,AED:0.00274,MYR:0.00352,THB:0.0262 }
    };
    const rate      = fallback[fromCur]?.[toCur] ?? 1;
    const converted = (amount * rate).toFixed(2);

    output.innerHTML = `
      <div class="currency-item">
        <div class="currency-flag">${flagMap[fromCur]}</div>
        <div class="currency-amount">${symMap[fromCur]} ${Number(amount).toLocaleString('en-IN')}</div>
        <div class="currency-label">${nameMap[fromCur]}</div>
      </div>
      <div class="currency-item">
        <div class="currency-flag">${flagMap[toCur]}</div>
        <div class="currency-amount">${symMap[toCur]} ${Number(converted).toLocaleString('en-IN')}</div>
        <div class="currency-label">${nameMap[toCur]}</div>
      </div>`;
    rateNote.textContent = 'Approximate rates used (live fetch unavailable).';
  }
}

function getSavingsCurrencySymbol() {
  const sel = document.getElementById('savings-currency');
  if (!sel) return 'Nu.';
  return sel.options[sel.selectedIndex].getAttribute('data-sym') || 'Nu.';
}

function updateSavingsCurrencyLabel() {
  const sel = document.getElementById('savings-currency');
  const label = document.getElementById('savings-income-label');
  if (!sel || !label) return;
  const sym = sel.options[sel.selectedIndex].getAttribute('data-sym');
  const code = sel.value;
  label.textContent = `Monthly Income (${sym} ${code})`;
  const result = document.getElementById('savings-result');
  if (result) result.classList.remove('show');
}

function applyPreset() {
  const val = document.getElementById('savings-preset').value;
  if (val) document.getElementById('savings-pct').value = val;
}

function calculateSavings() {
  const income = parseFloat(document.getElementById('monthly-income').value);
  const pct = parseFloat(document.getElementById('savings-pct').value);
  const sym = getSavingsCurrencySymbol();
  const resultBox = document.getElementById('savings-result');
  const output = document.getElementById('savings-output');
  const note = document.getElementById('savings-note');
  const tip = document.getElementById('savings-tip');

  if (!income || income <= 0 || !pct || pct <= 0 || pct > 100) {
    output.innerHTML = '<div class="tool-error">Please enter valid income and percentage.</div>';
    resultBox.classList.add('show'); return;
  }

  const monthly = income * (pct / 100);
  const fmt = n => sym + ' ' + Math.round(n).toLocaleString('en-IN');

  output.innerHTML = `
    <div class="savings-item"><div class="savings-year">1 Year</div><div class="savings-amount">${fmt(monthly * 12)}</div></div>
    <div class="savings-item"><div class="savings-year">3 Years</div><div class="savings-amount">${fmt(monthly * 36)}</div></div>
    <div class="savings-item"><div class="savings-year">5 Years</div><div class="savings-amount">${fmt(monthly * 60)}</div></div>`;

  note.textContent = `Saving ${fmt(monthly)} every month (${pct}% of ${fmt(income)})`;

  tip.textContent = pct < 10
    ? '💡 Try to save at least 10% — even small amounts grow over time!'
    : pct < 20
    ? '⭐ Good start! The recommended target is 20%. Can you increase a little more?'
    : '🏆 Excellent! You are saving at or above the recommended 20% — keep it up!';

  resultBox.classList.add('show');
}

function getBudgetCurrencySymbol() {
  const sel = document.getElementById('budget-currency');
  if (!sel) return 'Nu.';
  return sel.options[sel.selectedIndex].getAttribute('data-sym') || 'Nu.';
}

function updateBudgetCurrencyLabel() {
  const sel = document.getElementById('budget-currency');
  const label = document.getElementById('budget-income-label');
  if (!sel || !label) return;
  const sym = sel.options[sel.selectedIndex].getAttribute('data-sym');
  const code = sel.value;
  label.textContent = `Monthly Income (${sym} ${code})`;
  calculateBudget();
}

function calculateBudget() {
  const income = parseFloat(document.getElementById('budget-income').value);
  const sym = getBudgetCurrencySymbol();
  const tip = document.getElementById('budget-tip');
  const fmt = n => sym + ' ' + Math.round(n).toLocaleString('en-IN');

  if (!income || income <= 0) {
    document.getElementById('needs-amount').textContent = sym + ' 0';
    document.getElementById('wants-amount').textContent = sym + ' 0';
    document.getElementById('savings-amount').textContent = sym + ' 0';
    ['needs-bar','wants-bar','savings-bar'].forEach(id =>
      document.getElementById(id).style.width = '0%');
    tip.style.display = 'none';
    return;
  }

  document.getElementById('needs-amount').textContent = fmt(income * 0.5);
  document.getElementById('wants-amount').textContent = fmt(income * 0.3);
  document.getElementById('savings-amount').textContent = fmt(income * 0.2);

  setTimeout(() => {
    document.getElementById('needs-bar').style.width = '50%';
    document.getElementById('wants-bar').style.width = '30%';
    document.getElementById('savings-bar').style.width = '20%';
  }, 100);

  tip.style.display = 'block';
  tip.textContent = income <= 20000
    ? `💡 Even saving ${fmt(income * 0.2)} monthly = ${fmt(income * 0.2 * 12)} in a year!`
    : income <= 50000
    ? `⭐ Put your ${fmt(income * 0.2)} savings into a separate account on payday.`
    : `🏆 Consider putting part of your ${fmt(income * 0.2)} into fixed deposits or investments.`;
}

function openSheetModal(src, title) {
  const overlay = document.getElementById('sheet-modal-overlay');
  const img     = document.getElementById('sheet-modal-img');
  const titleEl = document.getElementById('sheet-modal-title');

  titleEl.textContent = title;
  img.style.opacity = '0';
  img.style.transform = 'scale(0.97)';
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  img.onload = function () {
    img.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    img.style.opacity = '1';
    img.style.transform = 'scale(1)';
  };
  img.onerror = function () {
    img.style.opacity = '1';
  };
  img.src = src;
}

function closeSheetModal() {
  const overlay = document.getElementById('sheet-modal-overlay');
  overlay.style.display = 'none';
  document.body.style.overflow = '';
}

// ══ SBB BACKEND ══
const SBB_API = (() => {
  const h = window.location.hostname;
  if (h === 'localhost' || h === '127.0.0.1') return "http://127.0.0.1:5000";
  return "https://financial-resilience-bhutan-1.onrender.com";
})();
