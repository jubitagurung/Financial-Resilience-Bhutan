// ── SECTION NAVIGATION ──
function showSection(id) {
  document.querySelectorAll('section, .overlay').forEach(el => {
    el.classList.remove('active');
    el.style.display = '';
  });

  const target = document.getElementById(id);
  if (target) {
    target.classList.add('active');
  }

  document.querySelectorAll('nav a').forEach(a => a.classList.remove('active-link'));
  const navLink = document.getElementById('nav-' + id);
  if (navLink) navLink.classList.add('active-link');

  document.getElementById('nav-menu')?.classList.remove('open');
  const t = document.getElementById('nav-toggle');
  if (t) { t.classList.remove('open'); t.setAttribute('aria-expanded', 'false'); }

  const stepMap = { home: 1, quiz: 2, planner: 3 };
  if (stepMap[id]) updateJourneyBar(stepMap[id]);

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
  t.style.transition = 'opacity 0.3s, transform 0.3s';
  t.style.opacity = '0';
  t.style.transform = 'translateX(60px)';
  setTimeout(() => { t.style.display = 'none'; }, 300);
}

function showToastOnHome() {
  const t = document.getElementById('quiz-toast');
  if (!t) return;
  t.style.display = 'block';
  setTimeout(() => dismissToast(), 12000);
}

// ── JOURNEY BAR ──
function updateJourneyBar(activeStep) {
  const steps = document.querySelectorAll('.jg-step');
  steps.forEach((s, i) => {
    s.classList.remove('active-step', 'done-step');
    if (i + 1 < activeStep) s.classList.add('done-step');
    else if (i + 1 === activeStep) s.classList.add('active-step');
  });
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

// ── PLANNER PUSH BLOCK ──
function setPlannnerPush(score, total) {
  const pct = Math.round(score / total * 100);
  const titleEl = document.getElementById('ppb-title');
  const descEl  = document.getElementById('ppb-desc');
  if (!titleEl || !descEl) return;

  if (pct === 100) {
    titleEl.textContent = 'Perfect Score! Put Your Expert Knowledge Into Action';
    descEl.textContent  = 'You aced the quiz! Challenge yourself further — build a real budget with the SmartBudget Planner and watch your savings grow.';
    launchConfetti();
  } else if (pct >= 75) {
    titleEl.textContent = 'Great Job! Now Apply It in Real Life';
    descEl.textContent  = 'Your strong quiz score shows you understand the principles. Use the Budget Planner to put the 50/30/20 rule to work with your real income.';
  } else if (pct >= 50) {
    titleEl.textContent = 'Good Start! Strengthen Your Habits With a Real Budget';
    descEl.textContent  = 'You\'ve got a solid foundation. The SmartBudget Planner will help you practice these principles daily and build lasting financial resilience.';
  } else {
    titleEl.textContent = 'Improve Your Financial Habits — Start With the Planner';
    descEl.textContent  = 'The best way to grow financially is hands-on practice. The Budget Planner guides you step by step, no matter where you\'re starting from.';
  }
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
let answeredQuestions = [];

// ── START ──
function startQuiz() {
  currentQ = 0; score = 0; totalPoints = 0; streak = 0; bestStreak = 0;
  answers = [];
  answeredQuestions = new Array(QUESTIONS.length).fill(null);

  document.getElementById('quiz-start').style.display = 'none';
  document.getElementById('quiz-question').style.display = 'block';
  document.getElementById('quiz-results').style.display = 'none';

  const old = document.getElementById('q-prev-btn');
  if (old) old.remove();
  renderQuestion();
}

// ── RENDER QUESTION ──
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

  const nextBtn = document.getElementById('q-next-btn');
  nextBtn.style.display = prevAnswer !== null ? 'inline-block' : 'none';
  nextBtn.textContent = currentQ < QUESTIONS.length - 1 ? 'Next Question →' : 'See My Results →';

  let prevBtn = document.getElementById('q-prev-btn');
  if (!prevBtn) {
    prevBtn = document.createElement('button');
    prevBtn.id = 'q-prev-btn';
    prevBtn.className = 'quiz-next-btn';
    prevBtn.style.marginRight = '10px';
    prevBtn.textContent = '← Previous';
    prevBtn.onclick = prevQuestion;
    nextBtn.parentNode.insertBefore(prevBtn, nextBtn);
  }
  prevBtn.style.display = currentQ > 0 ? 'inline-block' : 'none';

  const card = document.getElementById('quiz-q-card');
  card.classList.remove('fade-in');
  void card.offsetWidth;
  card.classList.add('fade-in');
}

// ── SELECT ANSWER ──
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

// ── STREAK TOAST ──
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

// ── RESULTS ──
function showResults() {
  document.getElementById('quiz-question').style.display = 'none';
  document.getElementById('quiz-results').style.display = 'block';
  document.getElementById('quiz-nav-buttons').style.display = 'flex';

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

  setPlannnerPush(score, total);
  setPlannerBanner(score, total);

  // ── QUESTION BREAKDOWN ──
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

  // ── SAVE TO LOCALSTORAGE SAFELY ──
  try {
    localStorage.setItem('sbb_last_quiz', JSON.stringify({
      score, total, percent: pct, points: totalPoints,
      date: new Date().toLocaleDateString('en-BT', { day: 'numeric', month: 'short', year: 'numeric' })
    }));
  } catch (e) {}

  if (pct === 100) launchConfetti();
}

// ── RESET QUIZ ──
function resetQuiz() {
  document.getElementById('quiz-results').style.display = 'none';
  document.getElementById('quiz-start').style.display = 'block';
  document.getElementById('quiz-nav-buttons').style.display = 'none';

  const prevBtn = document.getElementById('q-prev-btn');
  if (prevBtn) prevBtn.remove();
  const ptsSummary = document.getElementById('pts-summary');
  if (ptsSummary) ptsSummary.remove();
  currentQ = 0; score = 0; totalPoints = 0; streak = 0; bestStreak = 0;
  answers = [];
  answeredQuestions = new Array(QUESTIONS.length).fill(null);
}

// ── SONAM MODAL ──
function openSonamModal() {
  const overlay = document.getElementById('sonam-modal-overlay');
  overlay.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeSonamModal() {
  const overlay = document.getElementById('sonam-modal-overlay');
  overlay.style.display = 'none';
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSonamModal();
});

// ══════════════════════════════════════════════
// ── SINGLE DOMContentLoaded — all init here ──
// ══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {

  // 1. Show quiz invite toast after 3s (bottom right)
  setTimeout(() => showToastOnHome(), 3000);

  // 2. Welcome / Welcome Back toast (top center)
  let hasVisited = false;
  try { hasVisited = localStorage.getItem('sbb_visited'); } catch(e) {}

  const msg = hasVisited
    ? '👋 Welcome Back to SmartBudget Bhutan!'
    : '🎉 Welcome to SmartBudget Bhutan!';
  const sub = hasVisited
    ? 'Great to see you again. Keep building those financial habits!'
    : 'Your journey to financial resilience starts here.';

  const welcomeToast = document.createElement('div');
  welcomeToast.id = 'welcome-toast';
  welcomeToast.style.cssText = `
    position: fixed;
    top: 70px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(12,9,2,0.97);
    border: 1px solid rgba(201,168,76,0.35);
    border-top: 3px solid #c9a84c;
    border-radius: 12px;
    padding: 16px 40px 16px 20px;
    z-index: 9998;
    min-width: 280px;
    max-width: 360px;
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

  try { localStorage.setItem('sbb_visited', 'true'); } catch(e) {}

  // 3. Last quiz result banner (bottom LEFT — no clash with quiz toast)
  let saved = null;
  try { saved = localStorage.getItem('sbb_last_quiz'); } catch(e) { return; }
  if (!saved) return;

  let r;
  try { r = JSON.parse(saved); } catch(e) { return; }

  const banner = document.createElement('div');
  banner.id = 'prev-score-banner';
  banner.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">
      <span style="color:#c9a84c; font-family:'Cinzel',serif; font-size:12px; letter-spacing:1px;">LAST QUIZ RESULT</span>
      <button onclick="document.getElementById('prev-score-banner').remove()" style="background:transparent; border:none; color:#a89e84; cursor:pointer; font-size:14px; padding:0;">✕</button>
    </div>
    <div>Score: <strong style="color:#c9a84c">${r.score}/${r.total} (${r.percent}%)</strong></div>
    <div style="font-size:11px;">${r.date}</div>
  `;
  banner.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: rgba(10,8,2,0.95);
    border: 1px solid rgba(201,168,76,0.4);
    border-left: 4px solid #c9a84c;
    border-radius: 10px;
    padding: 14px 18px;
    font-size: 13px;
    color: #a89e84;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    max-width: 280px;
  `;
  document.body.appendChild(banner);

});
