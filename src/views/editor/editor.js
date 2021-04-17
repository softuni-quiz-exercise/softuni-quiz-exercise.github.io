import { html, elemCreator } from '../../lib.js';

import { getQuestsionByQuizId, getQuizById, updateQuiz } from '../../api/data.js';
import { questionTemplate } from './question.js';


// <div class="loading-overlay working"></div>
const loadingElem = elemCreator('div', { className: 'loading-overlay working' });

const editorTemplate = ({quizData, questionsData, addQuestion, onTitleSave}) => html`
<section id="editor">

    <header class="pad-large">
        <h1>Edit quiz</h1>
    </header>

    <div id="titleEditor" class="pad-large alt-page">
        <div id="errorBox" style="text-align:left;"></div>
        <form @submit=${onTitleSave}>
            <label class="editor-label layout">
                <span class="label-col">Title:</span>
                <input class="input i-med" type="text" name="title" .value=${quizData.title}></label>
            <label class="editor-label layout">
                <span class="label-col">Topic:</span>
                <select class="input i-med" name="topic">
                    <option value="all" .selected=${quizData.topic == 'all'}>All Categories</option>
                    <option value="it" .selected=${quizData.topic == 'it'}>Languages</option>
                    <option value="hardware" .selected=${quizData.topic == 'hardware'}>Hardware</option>
                    <option value="software" .selected=${quizData.topic == 'software'}>Tools and Software</option>
                </select>
            </label>
            <input class="input submit action" type="submit" value="Save">
        </form>
    </div>

    <header class="pad-large">
        <h2>Questions</h2>
    </header>

    <div class="pad-large alt-page">

        <div id="questionsHolder">
            <!-- questions if there are any -->
            ${questionsData.map((questionData, questionIndex) => questionTemplate({ preview: true, questionData, questionIndex }))}
        </div>
        
        <!-- question adder -->
        <article class="editor-question">
            <div class="editor-input">
                <button class="input submit action" @click=${addQuestion}>
                    <i class="fas fa-plus-circle"></i>
                    Add question
                </button>
            </div>
        </article>
    </div>

</section>`;


export async function showEditorPage(context) {
    let quizId = context.params.id;
    const quizData = (await getQuizById(quizId))['results'][0];
    const questionsData = (await getQuestsionByQuizId(quizId))['results'];
    context.renderContent(editorTemplate({quizData, questionsData, addQuestion, onTitleSave}));

    async function addQuestion(event) {
        event.preventDefault();
        let questionIndex = (await getQuizById(quizId))['results'][0].questionCount;
        const newQuestion = questionTemplate({ preview: false, questionData: { text: '', answers: [], correctIndex: 0, quiz: quizId }, questionIndex });
        document.getElementById('questionsHolder').appendChild(newQuestion);
    }

    async function onTitleSave(event) {
        event.preventDefault();
        
        const form = document.querySelector('form');
        const formData = new FormData(form);

        let title = formData.get('title');
        let topic = formData.get('topic');

        try {
            
            toggleLoadingElem(true);
            toggleInputButton();
            validate();

            await updateQuiz(quizId, { title, topic });

        } catch (error) { 
            document.getElementById('errorBox').textContent = error.message;
         }
        finally { toggleInputButton(); toggleLoadingElem(false); }

        function validate() {
            if (!title || topic == 'all') throw new Error('All fields are reqired!');
        }

        function toggleInputButton() {
            [...form.querySelectorAll('input')].forEach(elem => elem.disabled = !elem.disabled);
        }
    }

    function toggleLoadingElem(show=true) {
        if (show) document.getElementById('titleEditor').appendChild(loadingElem);
        else loadingElem.remove();
    }
}