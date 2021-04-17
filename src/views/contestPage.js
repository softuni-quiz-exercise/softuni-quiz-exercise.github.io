import { html, page, render, createEmptyArray, elemCreator } from '../lib.js';

import { getQuizById, getQuestsionByQuizId, postSolution } from '../api/data.js';
import loadingBlock from './components/loadingBlock.js';
import { setModal } from './components/modalDialog.js';

const loadingElem = loadingBlock();

const contestPageTemplate = ({quizData, questionIndex, questionIndexes, answerIndexFactory, questionHolder}) => html`
<section id="quiz">
    <header class="pad-large">
        <h1>${quizData.title}: Question ${questionIndex} / ${quizData.questionCount}</h1>
        <nav class="layout q-control">
            <span class="block">Question index</span>

            ${
                questionIndexes.map((status, index) => { 
                    let isCurrent = index == questionIndex - 1;
                    return answerIndexFactory(status, index, isCurrent);
                })
            }

        </nav>
    </header>
    
    <!-- question holder -->
   ${questionHolder}

</section>`;


const questionTemplate = (questionData, index, answere, onQuestionAnswer, questionsData, renderPage, quizId, onSubmit) => html`
<article class="question">
    <p class="q-text">
        ${questionData.text}
    </p>

    <!-- answer holder -->
    <div id="answersHolder">
        ${questionData.answers.map((text, answerIndex) => answerTemplate(text, index, answerIndex, answere, onQuestionAnswer))}
    </div>

    <nav class="q-control">
        ${
            (questionsData.questionsLeft)
            ? html`<span class="block">${questionsData.questionsLeft} questions remaining</span>`
            : html`<span class="block">No more questions left</span>`
        }

        ${
            (index != 1)
            ? html`<a class="action" href="javascript:void(0)" @click=${() => renderPage(index - 1)}><i class="fas fa-arrow-left"></i> Previous</a>`
            : ``
        }

        <a class="action" href="javascript:void(0)" @click=${() => {
            setModal('Are you sure you want to restart this quiz?', startOver);

            function startOver(confirmed) {
                if (!confirmed) return; 
                page.redirect('/contest/' + quizId);
            }

        }}><i class="fas fa-sync-alt"></i> Start over</a>

        <div class="right-col">
            
            ${
                (index < (questionsData.questionsCount))
                ? html`<a class="action" href="javascript:void(0)" @click=${() => renderPage(index + 1)}>Next <i class="fas fa-arrow-right"></i></a>`
                : ``
            }

            <a class="action" href="javascript:void(0)" @click=${() => {
                setModal(`You have answered ${questionsData.questionsCount - questionsData.questionsLeft} from ${questionsData.questionsCount} questions.\nDo you wish to submit you answers?`, onSubmit);
            }}>Submit answers</a>
        </div>
    </nav>
</article>`;


const answerTemplate = (text, questionIndex, answerIndex, selectedAnswere, onQuestionAnswer) => html`
<label class="q-answer radio">
    <input class="input" type="radio" name=${`question-${questionIndex}`} value=${answerIndex} .checked=${answerIndex == selectedAnswere} @click=${() => onQuestionAnswer(questionIndex, answerIndex)}/>
    <i class="fas fa-check-circle"></i>
    ${text}
</label>`;


export async function showContestPage(context) {
    let quizId;
    let quizData;
    let questionHolder;

    let questions;
    let questionIndexes;
    
    try {
        
        showLoading();
        quizId = context.params.id;
        quizData = (await getQuizById(quizId))['results'][0];
        questionHolder = elemCreator('div', { id: 'questionHolder', className: 'pad-large alt-page'});

        questions = (await getQuestsionByQuizId(quizId))['results'];
        questionIndexes = createEmptyArray(questions.length).map(_ => -1);
        
        renderPage();

    } catch(error) { alert(error.message); }

    function showLoading() { context.renderContent(loadingElem); }

    
    function renderPage(questionIndex=1) {
        const questionData = questions[questionIndex - 1]; 
        context.renderContent(contestPageTemplate({quizData, questionIndex, questionIndexes, answerIndexFactory, questionHolder}));
        renderQuestionHolder(questionIndex, questionData);
    }

    function renderQuestionHolder(questionIndex, questionData) {
        render('', questionHolder);
        const template = questionTemplate(questionData, questionIndex, questionIndexes[questionIndex-1], onQuestionAnswer, { questionsCount: quizData.questionCount, questionsLeft: (quizData.questionCount - questionIndexes.filter(elem => elem > -1).length)}, renderPage, quizData.objectId, onSubmit);
        render(template, questionHolder);
    }

    function answerIndexFactory(status, index, isCurrent) {
        const answerIndexConvertor = {
            'unanswered': elemCreator('a', { className: 'q-index', href: '#'}),
            'answered': elemCreator('a', { className: 'q-index q-answered', href: '#'}),
            'current': elemCreator('a', { className: 'q-index q-current', href: '#'}),
        };
        
        const answerIndex = chooseAnswerIndex();
        answerIndex.addEventListener('click', onClick);
        
        return answerIndex;

        function chooseAnswerIndex() {
            if (isCurrent) return answerIndexConvertor['current'];
            if (status > -1) return answerIndexConvertor['answered'];
            return answerIndexConvertor['unanswered'];
        }

        function onClick(event) {
            event.preventDefault();
            renderPage(index + 1);
        }
    }

    function onQuestionAnswer(questionIndex, answerIndex) {
        if (questionIndex - 1 < 0) questionIndex = 1;
        if (answerIndex < 0) answerIndex = 0;
        questionIndexes[questionIndex - 1] = answerIndex;
        renderPage(questionIndex);
    }


    async function onSubmit(confirmed) {
        if (!confirmed) return;

        const answers = questionIndexes.map((answer, index) => ({ answer, 'correctIndex': questions[index].correctIndex}));
        let correctCount = answers.filter(elem => elem['answer'] === elem['correctIndex']).length;
        
        const solutionContent = { 
            quiz: quizId,
            owner: (sessionStorage.userId) ? sessionStorage.userId : 'anonymous',
            correctCount,
            answers
        };
        
        try {
            
            const response = await postSolution(solutionContent); 
            context.pageContent('/summory/' + response.objectId);

        } catch (error) { alert(error.message); }

    }
}

