let questions = [];
let current = 0;
let answers = {};
let reviewMode = false;
let shuffledOptions = {};
function shuffleArray(arr) {
  return arr
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}
function prepareShuffle() {
  shuffledOptions = {};

  questions.forEach((q, i) => {
    // ✅ شيلف للـ MCQ فقط
    if (q.options.length > 2) {
      shuffledOptions[i] = shuffleArray([...q.options]);
    } else {
      // ❌ True / False بدون شيلف
      shuffledOptions[i] = [...q.options];
    }
  });
}
const params = new URLSearchParams(window.location.search);
const file = params.get("file") || "lecture1.json";

fetch("./lectures/" + file)
  .then(res => {
    if (!res.ok) {
      throw new Error(`File not found: lectures/${file}`);
    }
    return res.json();
  })
  .then(data => {
    questions = data;

    prepareShuffle();
    renderQuestionNumbers();
    show();
  })
  .catch(err => {
    console.error(err);
    alert(err.message);
  });
/* ===== عرض السؤال ===== */

function show() {
  const card = document.querySelector(".question-card");
  card.classList.remove("animate-question");
  void card.offsetWidth; // restart animation
  card.classList.add("animate-question");

  document.getElementById("counter").innerText =
    `Question ${current + 1} of ${questions.length}`;

  document.getElementById("question").innerText =
    questions[current].question;

  const box = document.getElementById("options");
  box.innerHTML = "";

  shuffledOptions[current].forEach((opt, i) => {
  const b = document.createElement("button");
  b.className = "option";
  b.style.animationDelay = `${i * 0.08}s`;
  b.innerText = opt;
  b.onclick = () => answer(b);
  
  if (answers[current]) {
    b.disabled = true;
    
    if (opt === questions[current].answer)
      b.classList.add("correct");
    else if (opt === answers[current].value)
      b.classList.add("wrong");
  }
  
  box.appendChild(b);
});
}
/* ===== تسجيل الإجابة ===== */
function answer(btn) {
  // ⛔ لو السؤال اتحل قبل كده → امنع التعديل
  if (answers[current]) return;

  // ⛔ مفيش إجابات في الريفيو
  if (reviewMode) return;

  const isCorrect = btn.innerText === questions[current].answer;

  answers[current] = {
    value: btn.innerText,
    correct: isCorrect
  };

  renderQuestionNumbers();

  if (Object.keys(answers).length === questions.length) {
    showResult();
    return;
  }

  show();
}
/* ===== Next / Prev ===== */
function next() {
  if (current < questions.length - 1) {
    current++;
    show();
  }
}
function prev() {
  if (current > 0) {
    current--;
    show();
  }
}
/* ===== View Questions ===== */
const btn = document.getElementById("toggleQuestions");
const list = document.getElementById("questionsList");

btn.onclick = () => {
  list.classList.toggle("show");
  btn.textContent = list.classList.contains("show") ?
    "Hide Questions" :
    "View Questions";
};

/* ===== أرقام الأسئلة ===== */
function renderQuestionNumbers() {
  list.innerHTML = "";
  
  questions.forEach((q, i) => {
    const div = document.createElement("div");
    div.className = "q-number";
    div.innerText = i + 1;
    
    if (answers[i]) {
      div.classList.add(
        answers[i].correct ? "correct" : "wrong"
      );
    }
    
    div.onclick = () => {
      current = i;
      show();
    };
    
    list.appendChild(div);
  });
}

/* ===== Dark Mode ===== */
const modeBtn = document.getElementById("mode");

modeBtn.onclick = () => {
  document.body.classList.toggle("dark");
  modeBtn.textContent =
    document.body.classList.contains("dark") ? "☀️" : "🌙";
};
  function showResult() {
  document.querySelector(".question-card").style.display = "none";
  document.querySelector(".controls").style.display = "none";
document.querySelector(".questions-center").style.display = "none";
  const resultBox = document.getElementById("resultBox");
  resultBox.style.display = "block";

  let correctCount = 0;
  Object.values(answers).forEach(a => {
    if (a.correct) correctCount++;
  });

  document.getElementById("scoreText").innerText =
    `Your Score: ${correctCount} / ${questions.length}`;

if (correctCount >= questions.length - 5) msg = "اول دفعهه ياعمممم";
  else if (correctCount >= questions.length * 0.6) msg = "  شد شويه ياعممم";
  else msg = "انت اخرك تخش كليه البهايمممم";

  document.getElementById("messageText").innerText = msg;
}
/* ===== Retry Quiz ===== */
function retryQuiz() {
  answers = {};
  current = 0;
  reviewMode = false;

  prepareShuffle(); // 🔥 شيلف جديد

  document.querySelector(".question-card").style.display = "block";
  document.querySelector(".controls").style.display = "flex";
  document.querySelector(".questions-center").style.display = "block";
  document.getElementById("resultBox").style.display = "none";
  document.querySelector(".end-review-container").style.display = "none";

  renderQuestionNumbers();
  show();
}
/* ===== Review Mode ===== */
function enterReview() {
  reviewMode = true;
  current = 0;

  document.querySelector(".question-card").style.display = "block";
  document.querySelector(".controls").style.display = "flex";
  document.querySelector(".questions-center").style.display = "none";

  document.getElementById("resultBox").style.display = "none";
  document.querySelector(".end-review-container").style.display = "flex";

  show();
}
function endReview() {
  reviewMode = false;

  document.querySelector(".question-card").style.display = "none";
  document.querySelector(".controls").style.display = "none";
  document.querySelector(".end-review-container").style.display = "none";

  document.getElementById("resultBox").style.display = "block";
}