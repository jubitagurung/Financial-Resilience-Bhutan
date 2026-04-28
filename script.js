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

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// hamburger toggle
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

// ══ TOAST ══
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

// ══ JOURNEY BAR ══
function updateJourneyBar(activeStep) {
  const steps = document.querySelectorAll('.jg-step');
  steps.forEach((s, i) => {
    s.classList.remove('active-step', 'done-step');
    if (i + 1 < activeStep) s.classList.add('done-step');
    else if (i + 1 === activeStep) s.classList.add('active-step');
  });
}

// ══ CONFETTI ══
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

// ══ PLANNER PUSH BLOCK ══
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

// ══ PLANNER WELCOME BANNER ══
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
    explanation: "The 50/30/20 rule allocates 50% to needs, 30% to wants, and 20% to savings. This framework helps ensure you consistently build financial resilience."
  },
  {
    q: "A household earns Nu. 40,000 per month. Using the 50/30/20 rule, what should their monthly savings target be?",
    options: ["Nu. 4,000", "Nu. 6,000", "Nu. 8,000", "Nu. 12,000"],
    correct: 2,
    explanation: "20% of Nu. 40,000 = Nu. 8,000. This is the recommended savings target for a middle-income household in urban Bhutan."
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
    explanation: "Lifestyle creep means your expenses grow as your income grows, leaving no room for increased savings. The key habit is to save the difference when your income rises."
  },
  {
    q: "How many months of living expenses should you ideally have in an emergency fund?",
    options: ["1 month", "2 months", "3–6 months", "12 months"],
    correct: 2,
    explanation: "Financial advisors recommend keeping 3–6 months of living expenses in an emergency fund. This cushion protects against job loss, medical bills, or urgent repairs."
  },
  {
    q: "Which of the following is a 'need' in the 50/30/20 budgeting framework?",
    options: ["Streaming services", "Dining at restaurants", "Rent and electricity", "Gym membership"],
    correct: 2,
    explanation: "Needs are essential expenses you cannot live without — rent, food, utilities, and transport. Streaming services, dining out, and gym memberships are typically 'wants'."
  },
  {
    q: "A family saves Nu. 500 per month starting today. How much will they have saved after 1 year?",
    options: ["Nu. 5,000", "Nu. 6,000", "Nu. 7,200", "Nu. 8,000"],
    correct: 1,
    explanation: "Nu. 500 × 12 months = Nu. 6,000. Even small consistent amounts build meaningful savings — the key is consistency, not size."
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
    explanation: "Keeping savings in a separate account creates a mental and physical barrier between your spending money and your saved money — reducing the temptation to dip into savings."
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
    explanation: "'Pay yourself first' means automatically moving your savings to a separate account as soon as you receive your salary — before spending on anything else. This makes saving automatic, not optional."
  }
];

let currentQ = 0;
let score = 0;
let answers = [];
let answeredQuestions = []; // tracks selected index per question (null = not yet answered)

function startQuiz() {
  currentQ = 0;
  score = 0;
  answers = [];
  answeredQuestions = new Array(QUESTIONS.length).fill(null);

  document.getElementById("quiz-start").style.display = "none";
  document.getElementById("quiz-question").style.display = "block";
  document.getElementById("quiz-results").style.display = "none";

  // Remove any leftover prev button from a previous run
  const oldPrev = document.getElementById("q-prev-btn");
  if (oldPrev) oldPrev.remove();

  renderQuestion();
}

function renderQuestion() {
  const q = QUESTIONS[currentQ];
  const total = QUESTIONS.length;
  const pct = (currentQ / total) * 100;

  document.getElementById("q-counter").textContent = `Question ${currentQ + 1} of ${total}`;
  document.getElementById("q-progress-fill").style.width = pct + "%";
  document.getElementById("q-number").textContent = `QUESTION ${currentQ + 1}`;
  document.getElementById("q-text").textContent = q.q;

  // Recalculate score from answeredQuestions
  score = answeredQuestions.filter((a, i) => a !== null && a === QUESTIONS[i].correct).length;
  document.getElementById("q-score-live").textContent = `Score: ${score}`;

  // Build options
  const optionsEl = document.getElementById("q-options");
  optionsEl.innerHTML = "";
  const letters = ["A", "B", "C", "D"];
  const prevAnswer = answeredQuestions[currentQ];

  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.innerHTML = `<span class="option-letter">${letters[i]}</span><span>${opt}</span>`;

    if (prevAnswer !== null) {
      // Already answered — restore visual state, lock options
      btn.classList.add("disabled");
      if (i === q.correct) btn.classList.add("correct");
      else if (i === prevAnswer && prevAnswer !== q.correct) btn.classList.add("wrong");
    } else {
      btn.onclick = () => selectAnswer(i);
    }
    optionsEl.appendChild(btn);
  });

  // Restore or hide feedback
  const feedback = document.getElementById("q-feedback");
  if (prevAnswer !== null) {
    const isCorrect = prevAnswer === q.correct;
    feedback.className = "quiz-feedback " + (isCorrect ? "correct-fb" : "wrong-fb");
    feedback.innerHTML = (isCorrect ? "✅ " : "❌ ") + q.explanation;
    feedback.style.display = "block";
  } else {
    feedback.style.display = "none";
    feedback.className = "quiz-feedback";
    feedback.innerHTML = "";
  }

  // Next button
  const nextBtn = document.getElementById("q-next-btn");
  nextBtn.style.display = prevAnswer !== null ? "inline-block" : "none";
  nextBtn.textContent = currentQ < QUESTIONS.length - 1 ? "Next Question →" : "See My Results →";

  // Previous button — create once, reuse
  let prevBtn = document.getElementById("q-prev-btn");
  if (!prevBtn) {
    prevBtn = document.createElement("button");
    prevBtn.id = "q-prev-btn";
    prevBtn.className = "quiz-next-btn";
    prevBtn.style.marginRight = "10px";
    prevBtn.textContent = "← Previous";
    prevBtn.onclick = prevQuestion;
    nextBtn.parentNode.insertBefore(prevBtn, nextBtn);
  }
  prevBtn.style.display = currentQ > 0 ? "inline-block" : "none";

  // Fade animation
  const card = document.getElementById("quiz-q-card");
  card.classList.remove("fade-in");
  void card.offsetWidth;
  card.classList.add("fade-in");
}

function selectAnswer(selectedIndex) {
  const q = QUESTIONS[currentQ];
  const opts = document.querySelectorAll(".quiz-option");

  // Save answer
  answeredQuestions[currentQ] = selectedIndex;

  // Lock all options
  opts.forEach(o => o.classList.add("disabled"));

  const isCorrect = selectedIndex === q.correct;

  // Highlight correct / wrong
  opts.forEach((o, i) => {
    if (i === q.correct) o.classList.add("correct");
    else if (i === selectedIndex && !isCorrect) o.classList.add("wrong");
  });

  // Store full answer object
  answers[currentQ] = {
    question: q.q,
    selectedIndex,
    correctIndex: q.correct,
    isCorrect,
    selectedText: q.options[selectedIndex],
    correctText: q.options[q.correct],
    explanation: q.explanation
  };

  // Show feedback
  const feedback = document.getElementById("q-feedback");
  feedback.className = "quiz-feedback " + (isCorrect ? "correct-fb" : "wrong-fb");
  feedback.innerHTML = (isCorrect ? "✅ " : "❌ ") + q.explanation;
  feedback.style.display = "block";

  // Update live score
  score = answeredQuestions.filter((a, i) => a !== null && a === QUESTIONS[i].correct).length;
  document.getElementById("q-score-live").textContent = `Score: ${score}`;

  // Show next button
  const nextBtn = document.getElementById("q-next-btn");
  nextBtn.style.display = "inline-block";
  nextBtn.textContent = currentQ < QUESTIONS.length - 1 ? "Next Question →" : "See My Results →";
}

function prevQuestion() {
  if (currentQ > 0) {
    currentQ--;
    renderQuestion();
  }
}

function nextQuestion() {
  if (currentQ < QUESTIONS.length - 1) {
    currentQ++;
    renderQuestion();
  } else {
    // Build final answers array from answeredQuestions
    answers = QUESTIONS.map((q, i) => ({
      question: q.q,
      selectedIndex: answeredQuestions[i],
      correctIndex: q.correct,
      isCorrect: answeredQuestions[i] === q.correct,
      selectedText: answeredQuestions[i] !== null ? q.options[answeredQuestions[i]] : "Not answered",
      correctText: q.options[q.correct],
      explanation: q.explanation
    }));
    score = answers.filter(a => a.isCorrect).length;
    showResults();
  }
}

function showResults() {
  document.getElementById("quiz-question").style.display = "none";
  document.getElementById("quiz-results").style.display = "block";

  const pct = Math.round((score / QUESTIONS.length) * 100);
  document.getElementById("result-score").textContent = `${score}/${QUESTIONS.length}`;

  const resultData = {
    score: score,
    total: QUESTIONS.length,
    percent: pct,
    date: new Date().toLocaleDateString('en-BT', { day:'numeric', month:'short', year:'numeric' })
  };
  localStorage.setItem('sbb_last_quiz', JSON.stringify(resultData));

  let title, subtitle;
  if (pct === 100) { title = "Financial Expert!"; subtitle = "Perfect score — you are ready to teach others!"; }
  else if (pct >= 75) { title = "Great Knowledge!"; subtitle = "Strong foundation — a few areas to sharpen."; }
  else if (pct >= 50) { title = "Good Start!"; subtitle = "You know the basics — keep building on them."; }
  else { title = "Keep Learning!"; subtitle = "Explore the Budget and Saving sections to strengthen your skills."; }

  document.getElementById("result-title").textContent = title;
  document.getElementById("result-subtitle").textContent = subtitle;

  // Planner push block
  setPlannnerPush(score, QUESTIONS.length);
  setPlannerBanner(score, QUESTIONS.length);

  // Breakdown
  const breakdownEl = document.getElementById("breakdown-list");
  breakdownEl.innerHTML = "";
  answers.forEach((a, i) => {
    const div = document.createElement("div");
    div.className = "breakdown-item";
    div.innerHTML = `
      <div class="breakdown-icon">${a.isCorrect ? "✅" : "❌"}</div>
      <div class="breakdown-q">
        <strong>Q${i + 1}: ${a.question.substring(0, 60)}${a.question.length > 60 ? "…" : ""}</strong>
        ${a.isCorrect
          ? `<span style="color:var(--green)">Correct: ${a.correctText}</span>`
          : `<span style="color:#f0955a">Your answer: ${a.selectedText} &nbsp;|&nbsp; Correct: ${a.correctText}</span>`
        }
      </div>`;
    breakdownEl.appendChild(div);
  });

  // AI Feedback
  fetchAIFeedback(score, QUESTIONS.length, answers);
}

async function fetchAIFeedback(score, total, answers) {
  const wrongTopics = answers.filter(a => !a.isCorrect).map(a => a.question).join("; ");
  const prompt = `A user just completed a financial literacy quiz about household budgeting in Bhutan.
Score: ${score}/${total} (${Math.round(score/total*100)}%)
${wrongTopics ? `Questions they got wrong: ${wrongTopics}` : "They got all questions correct!"}

Write a brief, warm, encouraging 3–4 sentence coaching message. Acknowledge their score, mention 1–2 specific areas to focus on (or celebrate if perfect), and give one practical action they can take today. Use Ngultrum (Nu.) if referencing amounts. Keep it concise and motivating. Do not use markdown formatting.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: "You are a warm, encouraging financial literacy coach specializing in household budgeting for urban Bhutanese families. Give concise, practical, personalized coaching feedback.",
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || "Great effort! Review the Budget and Saving sections to continue building your financial skills.";
    document.getElementById("ai-feedback-text").textContent = text;
  } catch (e) {
    document.getElementById("ai-feedback-text").textContent = "Great effort on the quiz! Review the Budget and Saving sections to reinforce any areas you found challenging — every step toward financial literacy builds a stronger future.";
  }
}

function resetQuiz() {
  document.getElementById("quiz-results").style.display = "none";
  document.getElementById("quiz-start").style.display = "block";

  // Clean up prev button so it doesn't duplicate on next run
  const prevBtn = document.getElementById("q-prev-btn");
  if (prevBtn) prevBtn.remove();

  currentQ = 0;
  score = 0;
  answers = [];
  answeredQuestions = [];
}

// ══ LAST QUIZ RESULT BANNER (on page load) ══
document.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('sbb_last_quiz');
  if (!saved) return;

  const r = JSON.parse(saved);
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
    right: 20px;
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
    max-width: 320px;
  `;
  document.body.appendChild(banner);
});

// ══ SONAM MODAL ══
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