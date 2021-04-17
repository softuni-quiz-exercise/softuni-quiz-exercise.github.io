import { html, monthConvert, topicConvert, page } from '../lib.js';
import { getQuizesByUserId, getOwnerById, getQuizTakenTimesById, getSolutionsByUserId, getQuizById, deleteQuiz } from '../api/data.js';
import loadingBlock from './components/loadingBlock.js';
import { setModal } from './components/modalDialog.js';


const loadingElem = loadingBlock();

const profilePageTemplate = ({ownerData, solutionsData, quizesData, onDelete}) => html`
<section id="profile">
    <header class="pad-large">
        <h1>Profile Page</h1>
    </header>

    <div class="hero pad-large">
        <article class="glass pad-large profile">
            <h2>Profile Details</h2>
            <p>
                <span class="profile-info">Username:</span>
                ${ownerData.username}
            </p>

            ${
                (ownerData.objectId == sessionStorage.userId)
                ? html`
                <h2>Your Quiz Results</h2>
                <table class="quiz-results">
                    <!-- solutions holder -->
                    <tbody>
                        ${solutionsData.map(solution => solutionTemplate(solution.date, solution.quizName, solution.id, solution.correctCount, solution.totalCount))}
                    </tbody>
                </table>
                `
                : ``
            }

        </article>
    </div>

    <header class="pad-large">
        <h2>Quizes created by ${(ownerData.objectId == sessionStorage.userId) ? 'you' : ownerData.username}</h2>
    </header>

    <!-- quizes holder -->
    <div class="pad-large alt-page">
        ${quizesData.map(quiz => quizHolderTemplate(quiz.data, quiz.takenTimes, onDelete))}
    </div>

</section>`;


const solutionTemplate = (date, quizName, solutionId, correctCount, totalCount) => html`
<tr class="results-row">
    <td class="cell-1">${date}</td>
    <td class="cell-2"><a href=${"/summory/" + solutionId}>${quizName}</a></td>
    <td class="cell-3 s-correct">${Math.floor((correctCount / totalCount) * 100)}%</td>
    <td class="cell-4 s-correct">${correctCount}/${totalCount} correct answers</td>
</tr>`;

const quizHolderTemplate = (quizData, takenTimes, onDelete) => html`
<article class="preview layout">

    <div class="right-col">
        <a class="action cta" href=${"/details/" + quizData.objectId}>View Quiz</a>
        ${
            (quizData.owner.objectId == sessionStorage.userId)
            ? html`
            <a class="action cta" href=${"/editor/" + quizData.objectId}><i class="fas fa-edit"></i></a>
            <a class="action cta" href="javascript:void(0)" @click=${event => onDelete(event.target.parentNode.parentNode, quizData.objectId)}><i class="fas fa-trash-alt"></i></a>
            `
            : ''
        }
        </div>

    <div class="left-col">
        <h3>${quizData.title}</h3>
        <span class="quiz-topic">Topic: ${topicConvert[quizData.topic]}</span>
        <div class="quiz-meta">
            <span>${quizData.questionCount} questions</span>
            <span>|</span>
            <span>Taken ${takenTimes} times</span>
        </div>
    </div>
</article>`;

export async function showProfilePage(context) {
    let ownerId;
    let ownerData;
    let solutionsData;
    let quizesData;

    try {
        
        showLoading();
        ownerId = context.params.id;
        ownerData = (await getOwnerById(ownerId))['results'][0]

        quizesData = (await getQuizesByUserId(ownerId)).reverse();
        for (let i = 0; i < quizesData.length; i++) { quizesData[i] = await attachTakenTimes(quizesData[i]); }
        
        solutionsData = (await getSolutionsByUserId(ownerId)).reverse();
        for (let i = 0; i < solutionsData.length; i++) { solutionsData[i] = await formatSolution(solutionsData[i]); }

        context.renderContent(profilePageTemplate({ownerData, solutionsData, quizesData, onDelete}))

    } catch (error) { alert(error.message); }

    function showLoading() { context.renderContent(loadingElem); }
    
    async function attachTakenTimes(data) {
        let takenTimes = await getQuizTakenTimesById(data.objectId);
        return { data: data, takenTimes };
    }

    async function formatSolution(solutionData) {
        const quizData = (await getQuizById(solutionData.quiz))['results'][0];

        // 2021-04-16T13:03:04.237Z -> 23. March 2021
        let dateData = solutionData.createdAt.split('T')[0].split('-');
        let date = `${dateData[2]}. ${monthConvert[dateData[1]]} ${dateData[0]}`;
        let quizName = quizData.title;
        let id = solutionData.objectId;
        let correctCount = solutionData.correctCount;
        let totalCount = quizData.questionCount;
        
        return {
            date,
            quizName,
            id,
            correctCount,
            totalCount
        }
    }
    
    async function onDelete(target, quizId) {
        setModal(`Are you sure you want to delete this quiz?`, deleteCurQuiz);

        async function deleteCurQuiz(confirmed) {
            if (!confirmed) return;
            try {
                
                await deleteQuiz(quizId);
                target.remove();
                
            } catch (error) { alert(error.message); }
        }
    }
}
