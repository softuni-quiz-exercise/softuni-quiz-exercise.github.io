import { html, until } from '../lib.js';

import { getQuizesCount, getQuizTakenTimesById, getTheLastQuiz } from '../api/data.js';
import quizTemplate from './components/quizTemplate.js';
import loadingBlock from './components/loadingBlock.js';


const loadingElem = loadingBlock();

const homePageTemplate = (lastQuizData, quizCount, takenTimes) => html`
<section id="welcome">

<div class="hero layout">
    <div class="splash right-col"><i class="fas fa-clipboard-list"></i></div>
    <div class="glass welcome">
        <h1>Welcome to Quiz Fever!</h1>
        <p>Home to ${quizCount} quizes in 3 topics. <a href="/browser">Browse all quizes</a>.</p>

        ${
            (sessionStorage.authToken)
            ? html`<a class="action cta" href="/create">Create a quiz</a>`
            : html`<a class="action cta" href="/login">Sign in to create a quiz</a>`
        }

    </div>
</div>

<div class="pad-large alt-page">
    <h2>Our most recent quiz:</h2>

    <!-- add the most recent quiz here -->
    ${
        (lastQuizData)
        ? html`${quizTemplate(lastQuizData, takenTimes)}`
        : html`No quizes added yet! Be the first!`
    }
    <div>
        <a class="action cta" href="/browser">Browse all quizes</a>
    </div>
</div>

</section>`;


export async function showHomePage(context) {
    let lastQuizData;
    let quizesCount;
    let takenTimes;

    try {

        showLoading();
        lastQuizData = await getTheLastQuiz();
        if (lastQuizData) {
            quizesCount = await getQuizesCount();
            takenTimes = await getQuizTakenTimesById(lastQuizData.objectId);
        }
        context.renderContent(homePageTemplate(lastQuizData, quizesCount, takenTimes));

    } catch(error) { 
        // console.error(error.message);
        context.renderContent(homePageTemplate(undefined, 0, 0));
     }

    function showLoading() { context.renderContent(loadingElem); }
}