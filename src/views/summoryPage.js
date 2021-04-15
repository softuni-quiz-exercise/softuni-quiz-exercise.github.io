import { html } from '../lib.js';

import { getQuestsionByQuizId, getQuizById, getSummoryById } from '../api/data.js';
import loadingBlock from './components/loadingBlock.js';


const loadingElem = loadingBlock();

const summoryPageTemplate = ({ summoryData, quizData, questions }) => html`
<section id="summary">
    <div class="hero layout">
        <article class="details glass">
            <h1>Quiz Results</h1>
            <h2>${quizData.title}</h2>

            <div class="summary summary-top">
                ${Math.floor((summoryData.correctCount / quizData.questionCount) * 100)}%
            </div>

            <div class="summary">
                ${summoryData.correctCount}/${quizData.questionCount} correct answers
            </div>

            <a class="action cta" href=${`/contest/` + quizData.objectId}><i class="fas fa-sync-alt"></i> Retake Quiz</a>
            <a class="action cta" href=${`/details/` + quizData.objectId}><i class="fas fa-clipboard-list"></i> See Details</a>

        </article>
    </div>

    <div class="pad-large alt-page">
        ${questions.map((elem, index) => { const answerData = summoryData["answers"][index]; return questionTemplate({ answerData, isQuestionCorrect: (answerData['answer'] == answerData['correctIndex']),  questionData: elem, questionIndex: index }); })}
    </div>

</section>`;


const questionTemplate = ({answerData, isQuestionCorrect, questionData, questionIndex}) => html`
 <article class="preview">
    <span class=${(isQuestionCorrect) ? "s-correct" : "s-incorrect"}>
        Question ${questionIndex + 1}
        <i class="fas fa-check"></i>
    </span>
    <div class="right-col">
        <button class="action" @click=${event => showQuestionDetails({btnHolder: event.target, detailsHolder: event.target.parentNode.parentNode.querySelector('div.question-details'), isQuestionCorrect})}>${(isQuestionCorrect) ? "See question" : "Reveal answer"}</button>
    </div>
    
    <div class="question-details" style="display: none">
        
        <p>
            ${questionData.text}
        </p>

        ${questionData.answers.map((answerText, answerIndex) => answerTemplate({ answerData, isQuestionCorrect, answerText, answerIndex}))}
    </div>

</article>`;


const answerTemplate = ({answerData, isQuestionCorrect, answerText, answerIndex}) => html`
<div class="s-answer">
    <span class=${(answerIndex == answerData.answer || answerIndex == answerData.correctIndex) ? (answerIndex == answerData.correctIndex) ? "s-correct" : "s-incorrect" : ""}>
        ${answerText}
        ${
            (answerIndex == answerData.answer || answerIndex == answerData.correctIndex)
            ? html`
            <i class=${(isQuestionCorrect) ? "fas fa-check" : "fas fa-times"}></i>
            
            ${
                (answerData.correctIndex == answerIndex && isQuestionCorrect == false)
                ? html`<strong>Correct answer</strong>`   
                : html``
            }

            ${
                (answerData.answer == answerIndex)
                ? html`<strong>Your choice</strong>`   
                : html``
            }`
            : ''
        }
    </span>
</div>`;

export async function showSummoryPage(context) {
   
    let summoryId;
    let summoryData;
    let quizData;
    let questions;
    
    try {
        
        showLoading();
        summoryId = context.params.id;
        summoryData = (await getSummoryById(summoryId))['results'][0];
        quizData = (await getQuizById(summoryData.quiz))['results'][0];
        questions = (await getQuestsionByQuizId(summoryData.quiz))['results'];        
        
        context.renderContent(summoryPageTemplate({ summoryData, quizData, questions }));

    } catch(error) { alert(error.message); }

    function showLoading() { context.renderContent(loadingElem); }
}


function showQuestionDetails({btnHolder, detailsHolder, isQuestionCorrect}) {
    btnHolder.textContent = (btnHolder.textContent != "Cencal") ? "Cencal" : (isQuestionCorrect) ? "See question" : "Reveal answer";
    detailsHolder.style.display = (detailsHolder.style.display == "none") ? "block" : "none"; 
}