// ── SECTION NAVIGATION ──
function showSection(id) {
  document.querySelectorAll("section, .overlay").forEach(el => {
    el.classList.remove("active");
    el.style.display = "none";
  });
  const target = document.getElementById(id);
  if (target) { target.style.display = "flex"; target.classList.add("active"); }
  document.querySelectorAll("nav a").forEach(a => a.classList.remove("active-link"));
  const navLink = document.getElementById("nav-" + id);
  if (navLink) navLink.classList.add("active-link");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("section").forEach(el => el.style.display = "none");
  const home = document.getElementById("home");
  if (home) { home.style.display = "flex"; home.classList.add("active"); }
});

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

function startQuiz() {
  currentQ = 0; score = 0; answers = [];
  document.getElementById("quiz-start").style.display = "none";
  document.getElementById("quiz-question").style.display = "block";
  document.getElementById("quiz-results").style.display = "none";
  renderQuestion();
}

function renderQuestion() {
  const q = QUESTIONS[currentQ];
  const total = QUESTIONS.length;
  const pct = (currentQ / total) * 100;

  document.getElementById("q-counter").textContent = `Question ${currentQ + 1} of ${total}`;
  document.getElementById("q-score-live").textContent = `Score: ${score}`;
  document.getElementById("q-progress-fill").style.width = pct + "%";
  document.getElementById("q-number").textContent = `QUESTION ${currentQ + 1}`;
  document.getElementById("q-text").textContent = q.q;

  const optionsEl = document.getElementById("q-options");
  optionsEl.innerHTML = "";
  const letters = ["A", "B", "C", "D"];
  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.innerHTML = `<span class="option-letter">${letters[i]}</span><span>${opt}</span>`;
    btn.onclick = () => selectAnswer(i);
    optionsEl.appendChild(btn);
  });

  const feedback = document.getElementById("q-feedback");
  feedback.style.display = "none";
  feedback.className = "quiz-feedback";
  feedback.innerHTML = "";

  const nextBtn = document.getElementById("q-next-btn");
  nextBtn.style.display = "none";
  nextBtn.textContent = currentQ < QUESTIONS.length - 1 ? "Next Question →" : "See My Results →";

  const card = document.getElementById("quiz-q-card");
  card.classList.remove("fade-in");
  void card.offsetWidth;
  card.classList.add("fade-in");
}

function selectAnswer(selectedIndex) {
  const q = QUESTIONS[currentQ];
  const opts = document.querySelectorAll(".quiz-option");

  opts.forEach(o => o.classList.add("disabled"));

  const isCorrect = selectedIndex === q.correct;
  if (isCorrect) score++;

  opts.forEach((o, i) => {
    if (i === q.correct) o.classList.add("correct");
    else if (i === selectedIndex && !isCorrect) o.classList.add("wrong");
  });

  answers.push({
    question: q.q,
    selectedIndex,
    correctIndex: q.correct,
    isCorrect,
    selectedText: q.options[selectedIndex],
    correctText: q.options[q.correct],
    explanation: q.explanation
  });

  const feedback = document.getElementById("q-feedback");
  feedback.className = "quiz-feedback " + (isCorrect ? "correct-fb" : "wrong-fb");
  feedback.innerHTML = (isCorrect ? "✅ " : "❌ ") + q.explanation;
  feedback.style.display = "block";

  document.getElementById("q-score-live").textContent = `Score: ${score}`;
  document.getElementById("q-next-btn").style.display = "inline-block";
}

function nextQuestion() {
  currentQ++;
  if (currentQ < QUESTIONS.length) {
    renderQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  document.getElementById("quiz-question").style.display = "none";
  document.getElementById("quiz-results").style.display = "block";

  const pct = Math.round((score / QUESTIONS.length) * 100);
  document.getElementById("result-score").textContent = `${score}/${QUESTIONS.length}`;

  let title, subtitle;
  if (pct === 100) { title = "Financial Expert!"; subtitle = "Perfect score — you are ready to teach others!"; }
  else if (pct >= 75) { title = "Great Knowledge!"; subtitle = "Strong foundation — a few areas to sharpen."; }
  else if (pct >= 50) { title = "Good Start!"; subtitle = "You know the basics — keep building on them."; }
  else { title = "Keep Learning!"; subtitle = "Explore the Budget and Saving sections to strengthen your skills."; }

  document.getElementById("result-title").textContent = title;
  document.getElementById("result-subtitle").textContent = subtitle;

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
  currentQ = 0; score = 0; answers = [];
}