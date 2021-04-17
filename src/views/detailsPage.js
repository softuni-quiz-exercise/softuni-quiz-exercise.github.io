import { html, topicConvert } from '../lib.js';

import { getQuizById, getOwnerById, deleteQuiz, getQuizTakenTimesById } from '../api/data.js';
import loadingBlock from './components/loadingBlock.js';
import { setModal } from './components/modalDialog.js';


const loadingElem = loadingBlock();

const detailsPageTemplate = ({quizData, ownerData, onDelete, takenTimes}) => html`
<section id="details">
    <div class="pad-large alt-page">
        <article class="details">
            <h1>${quizData.title}</h1>
            <span class="quiz-topic">A quiz by <a href=${`/profile/` + ownerData.objectId}>${ownerData.username}</a> on the topic of ${topicConvert[quizData.topic]}</span>
            <div class="quiz-meta">
                <span>${quizData.questionCount} Questions</span>
                <span>|</span>
                <span>Taken ${takenTimes} times</span>
            </div>

            <!-- description -->
            <p class="quiz-desc">
            </p>

            <div>
                <a class="cta action" href=${`/contest/` + quizData.objectId}>Begin Quiz</a>
            </div>

            ${
                (sessionStorage.userId == ownerData.objectId)
                ? html`
                <div>
                    <a class="cta action" href=${`/editor/` + quizData.objectId}>Edit Quiz</a>
                    <a class="cta action" href="javascript:void(0)" @click=${onDelete}>Delete Quiz</a>
                </div>`
                : ``
            }

        </article>
    </div>
</section>`;


export async function showDetailsPage(context) {
    let quizId;
    let quizData;
    let ownerData;
    let takenTimes;

    try {
        
        showLoading();
        quizId = context.params.id;
        quizData = (await getQuizById(quizId))['results'][0];
        ownerData = (await getOwnerById(quizData.owner.objectId))['results'][0]
        takenTimes = await getQuizTakenTimesById(quizId);
        context.renderContent(detailsPageTemplate({quizData, ownerData, onDelete, takenTimes}));

    } catch(error) { alert(error.message); }

    function showLoading() { context.renderContent(loadingElem); }
    
    function onDelete() {
        setModal(`Are you sure you want to delete "${quizData.title}"?`, deleteCurQuiz);
        
        async function deleteCurQuiz(confirmed) {
            if (!confirmed) return;
            try {
                
                await deleteQuiz(quizId);
                context.pageContent.redirect('/browser');

            } catch (error) { alert(error.message); }
        }
    }
}