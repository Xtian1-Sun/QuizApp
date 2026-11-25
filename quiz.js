/* jshint esversion: 6 */
"use strict";

/* ==========================================================
   QuizMaster - US Presidents quiz
   Written by me, except where a comment names an outside source.
   ========================================================== */

/* ---------- 1. QUESTION BANK ----------
   type: "mc" (multiple choice), "tf" (true/false), "fill" (fill in the blank)
   answer: the correct text. For "fill", accepted is a list of accepted spellings. */
const QUESTIONS = [
  {
    type: "mc",/*multiple-choice questions*/
    text: "Who was the first president of the United States?",
    options: ["George Washington", "John Adams", "Thomas Jefferson", "Benjamin Franklin"],
    answer: "George Washington",
    explanation: "George Washington served from 1789 to 1797. Benjamin Franklin was never president. John Adams was 2nd president. Thomas Jefferson was 3rd president"
  },
  {
    type: "tf",/*true or false question*/
    text: "President John F. Kennedy was assassinated in 1963.",
    options: ["True", "False"],
    answer: "True",
    explanation: "Kennedy was shot in Dallas, Texas, on 22 November 1963."
  },
  {
      type: "mc",/*multiple-choice questions*/
    text: "Which president was elected four times?",
    options: ["Franklin D. Roosevelt", "Theodore Roosevelt", "Ronald Reagan", "Woodrow Wilson"],
    answer: "Franklin D. Roosevelt",
    explanation: "FDR won in 1932, 1936, 1940 and 1944. The 22nd Amendment later limited presidents to two terms."
  },
  {
    type: "fill",/*fill in the answer(s)*/
    text: "Which president was the main author of the Declaration of Independence? (Type a surname)",
    answer: "Thomas Jefferson",
    accepted: ["jefferson", "thomas jefferson","3rd president"],
    explanation: "Thomas Jefferson drafted the Declaration in 1776 and became the 3rd president in 1801."
  },
  {
      type: "fill",/*fill in the answer(s)*/
    text: "Which president delivered the Gettysburg Address? (Type a surname)",
    answer: "Abraham Lincoln",
    accepted: ["lincoln", "abraham lincoln", "President Licoln"],
    explanation: "Lincoln gave the speech in November 1863, during the Civil War."
  },
  {
      type: "tf",/*true or false question*/
    text: "Donald Trump became the second president to be elected non-consecutively.",
    options: ["True", "False"],
    answer: "True",
    explanation: "He took office in 2017 (45th) and again in 2025 (47th), after Grover Cleveland (22/24th Presidnet)."
  },
  {
      type: "mc",/*multiple-choice questions*/
    text: "Which president resigned from office in 1974?",
    options: ["Gerald Ford", "Richard Nixon", "Lyndon B. Johnson", "Jimmy Carter"],
    answer: "Richard Nixon",
    explanation: "Nixon resigned on 9 August 1974 because of the Watergate scandal."
  },
  {
      type: "mc",/*multiple-choice questions*/
    text: "Who was the first president to live in the White House?",
    options: ["George Washington", "John Adams", "James Madison", "James Monroe"],
    answer: "John Adams",
    explanation: "Adams moved into the unfinished building in November 1800. Washington chose the site but never lived there."
  },
  {
      type: "tf",/*true or false question*/
    text: "Gerald Ford was elected as President in 1974.",
    options: ["True", "False"],
    answer: "False",
    explanation: "Gerald Ford was appointed Vice-President after the resignation of Spiro Agnew, and then as President after the resignation of President Nixon."
  },
  {
      type: "mc",/*multiple-choice questions*/
    text: "Which president was the first to be elected with no prior military or political career/experience?",
    options: ["Ronald Reagan ", "Donald Trump", "Andrew Jackson", "George Bush Jr"],
    answer: "Donald Trump",
    explanation: "President Trump was elected with no prior office in politics or military career and is the first Billionaire elected President."
  }
];

const QUESTION_COUNT = 10;

/* ---------- 2. PAGE ELEMENTS ---------- */
const quizArea = document.getElementById("quiz-area");
const resultsArea = document.getElementById("results-area");
const progressText = document.getElementById("progress-text");
const quizForm = document.getElementById("quiz-form");
const questionBox = document.getElementById("question-box");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const scoreText = document.getElementById("score-text");
const reviewList = document.getElementById("review-list");
const restartBtn = document.getElementById("restart-btn");

/* ---------- 3. QUIZ STATE ---------- */
let currentQuestions = []; // this round's questions, in random order
let currentIndex = 0;      // which question is showing
let userAnswers = [];      // what the player chose or typed

/* ---------- 4. HELPER FUNCTIONS ---------- */

/* Fisher-Yates shuffle. Returns a new shuffled array.
   EXTERNAL SOURCE: algorithm from https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
   (the code below is my own implementation of it). */
function shuffle(list) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

/* Checks one answer against its question. */
function isCorrect(question, given) {
  const cleaned = given.trim().toLowerCase();
  if (question.type === "fill") {
    return question.accepted.indexOf(cleaned) !== -1;
  }
  return cleaned === question.answer.toLowerCase();
}

/* Reads the current answer from the form (radio choice or typed text). */
function getCurrentAnswer() {
  const checked = questionBox.querySelector("input[type='radio']:checked");
  if (checked) {
    return checked.value;
  }
  const textBox = questionBox.querySelector("input[type='text']");
  return textBox ? textBox.value : "";
}

/* ---------- 5. SHOWING A QUESTION ---------- */
function showQuestion() {
  const question = currentQuestions[currentIndex];
  const isLast = currentIndex === currentQuestions.length - 1;

  progressText.textContent = "Question " + (currentIndex + 1) + " of " + currentQuestions.length;
  nextBtn.textContent = isLast ? "Submit quiz" : "Next question";
  nextBtn.disabled = true; // stays off until the player answers
  questionBox.textContent = "";

  const legend = document.createElement("legend");
  legend.textContent = question.text;
  legend.tabIndex = -1; // lets us move keyboard focus here for each new question
  questionBox.appendChild(legend);

  if (question.type === "fill") {
    const label = document.createElement("label");
    label.htmlFor = "fill-answer";
    label.textContent = "Your answer";
    const input = document.createElement("input");
    input.type = "text";
    input.id = "fill-answer";
    input.autocomplete = "off";
    questionBox.appendChild(label);
    questionBox.appendChild(input);
  } else {
    // Options are shuffled each time so the correct answer is not always in the same spot
    const options = question.type === "mc" ? shuffle(question.options) : question.options;
    options.forEach(function (option, i) {
      const id = "option-" + i;
      const wrapper = document.createElement("div");
      wrapper.className = "option";
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = "answer";
      radio.id = id;
      radio.value = option;
      const label = document.createElement("label");
      label.htmlFor = id;
      label.textContent = option;
      wrapper.appendChild(radio);
      wrapper.appendChild(label);
      questionBox.appendChild(wrapper);
    });
  }
  legend.focus();
}

/* ---------- 6. RESULTS ---------- */
function showResults() {
  let score = 0;
  reviewList.textContent = "";

  currentQuestions.forEach(function (question, i) {
    const correct = isCorrect(question, userAnswers[i]);
    if (correct) {
      score++;
    }
    const item = document.createElement("li");

    const heading = document.createElement("p");
    heading.className = "review-question";
    heading.textContent = question.text;

    const verdict = document.createElement("p");
    verdict.textContent = (correct ? "Correct. " : "Incorrect. ") +
      "You answered: " + (userAnswers[i].trim() || "(no answer)") + ".";

    const detail = document.createElement("p");
    detail.textContent = "Correct answer: " + question.answer + ". " + question.explanation;

    item.appendChild(heading);
    item.appendChild(verdict);
    item.appendChild(detail);
    reviewList.appendChild(item);
  });

  const percent = Math.round((score / currentQuestions.length) * 100);
  scoreText.textContent = "You scored " + score + " out of " + currentQuestions.length + " (" + percent + "%).";

  quizArea.hidden = true;
  resultsArea.hidden = false;
  document.getElementById("results-heading").tabIndex = -1;
  document.getElementById("results-heading").focus();
}

/* ---------- 7. STARTING AND RESTARTING ---------- */
function startQuiz() {
  currentQuestions = shuffle(QUESTIONS).slice(0, QUESTION_COUNT);
  currentIndex = 0;
  userAnswers = [];
  resultsArea.hidden = true;
  quizArea.hidden = false;
  showQuestion();
}

/* ---------- 8. EVENTS ---------- */

// Turn the Next button on once the player has answered
quizForm.addEventListener("input", function () {
  nextBtn.disabled = getCurrentAnswer().trim() === "";
});

// Previous: keep what the player has entered, then go back one question
prevBtn.addEventListener("click", function () {
    userAnswers[currentIndex] = getCurrentAnswer();
    currentIndex--;
    showQuestion();
});

// Next / Submit
quizForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const answer = getCurrentAnswer();
  if (answer.trim() === "") {
    return;
  }
  userAnswers.push(answer);
  if (currentIndex < currentQuestions.length - 1) {
    currentIndex++;
    showQuestion();
  } else {
    showResults();
  }
});

restartBtn.addEventListener("click", startQuiz);

startQuiz();
