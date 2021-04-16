import { html, render, elemCreator } from '../../lib.js';
import { answerTemplate } from './answer.js';
import { deleteQuestion, updateQuestion, createQuestion, updateQuiz, getQuizById } from '../../api/data.js';


export const questionTemplate = ({ preview=true, questionData, questionIndex }) => {
    // html`<article class="editor-question"></article>;`;
    const questionHolder = elemCreator('article', { className: 'editor-question' });
    // <div class="loading-overlay working"></div>
    const questionLoadingElem = elemCreator('div', { className: 'loading-overlay working' });

    const question = (isPreview=preview, answers=questionData.answers, correctIndex=questionData.correctIndex, text=questionData.text, changeView, onSave, onDelete, onCancel) => html`
        ${
            (isPreview) 
            ? html`
                <div class="layout">
                    <div class="question-control">
                        <button class="input submit action" @click=${() => changeView(false)}><i class="fas fa-edit"></i> Edit</button>
                        <button class="input submit action" @click=${onDelete}><i class="fas fa-trash-alt"></i> Delete</button>
                    </div>
                    <h3>Question ${ questionIndex + 1 }</h3>
                </div>
            
                <form>
                    <p class="editor-input">${text}</p>
        
                    <!-- question answers -->
                    ${answers.map((text, index) => answerTemplate({ preview: isPreview, text, index, isCorrect: (index == correctIndex), questionIndex: questionIndex + 1, deleteAnswear, onAnswearChange, onCorrectAnswearChange }))}
        
                </form>`
            : html`
                <div class="layout">
                    <div class="question-control">
                        <button class="input submit action" @click=${() => onSave()}><i class="fas fa-check-double"></i>Save</button>
                        <button class="input submit action" @click=${() => onCancel()}><i class="fas fa-times"></i> Cancel</button>
                    </div>
                    <h3>Question ${ questionIndex + 1 }</h3>
                </div>

                <form>
                    <textarea class="input editor-input editor-text" name="text" placeholder="Enter question" @change=${onQuestionTextChange}>${text}</textarea>

                    <!-- question answers -->
                    ${answers.map((text, index) => answerTemplate({ preview: isPreview, text, index, isCorrect: (index == correctIndex), questionIndex: questionIndex + 1, deleteAnswear, onAnswearChange, onCorrectAnswearChange }))}
                    
                    <!-- answer adder -->
                    <div class="editor-input">
                        <button class="input submit action" @click=${addAnswear}>
                            <i class="fas fa-plus-circle"></i>
                            Add answer
                        </button>
                    </div>
                </form>`
        }`;

    let tempAnswerArray;
    let tempCorrectIndex;
    let tempQuestionText;
    let questionId = questionData.objectId;

    changeView(preview);
    return questionHolder;

    function renderView(isPreviewed, answers, correctIndex=questionData.correctIndex, questionText=questionData.text) {
        render(question(isPreviewed, answers, correctIndex, questionText, changeView, onSave, onDelete, onCancel), questionHolder)
    }

    function changeView(isPreviewed, isSaved=false) {
        if (isSaved) renderView(isPreviewed, tempAnswerArray, tempCorrectIndex, tempQuestionText);
        else {
            tempAnswerArray = questionData.answers.slice();
            tempCorrectIndex = questionData.correctIndex;
            tempQuestionText = questionData.text;
            renderView(isPreviewed, questionData.answers);
        }
    }

    function onCancel() {
        if (!questionData.objectId) { questionHolder.remove(); return; }
        changeView(true);
    }

    async function onDelete() {
        let confirmed = confirm(`Are you sure you want to delete "${questionData.text}"?`);
        if (confirmed) {
            try {

                toggleLoadingElem();
                const result = await deleteQuestion(questionData.objectId);
                if (!result) throw Error();
                questionHolder.remove();
                await updateQuizQuestionsCount(false);
                
            } catch (error) { alert('You do not have permission to delete this question.') }
            finally { toggleLoadingElem(); }
        }
    }

    function deleteAnswear(answer, answearText) {
        let answearIndex = tempAnswerArray.indexOf(answearText);
        tempAnswerArray = tempAnswerArray.filter((_, index) => index != answearIndex);
        answer.remove();
    }

    function addAnswear(event) {
        event.preventDefault();
        tempAnswerArray.push('');
        renderView(false, tempAnswerArray, tempCorrectIndex)
    }

    function onAnswearChange(content, answearIndex) {
        tempAnswerArray[answearIndex] = content;
    }

    function onCorrectAnswearChange(answearIndex) {
        tempCorrectIndex = answearIndex;
    }

    function onQuestionTextChange(event) {
        tempQuestionText = event.target.value;
    }

    async function onSave() {
        try {
            toggleLoadingElem(true);
            toggleAllInputs();
            let response;
            if (questionData.objectId) response = await updateQuestion(questionData.objectId, { text: tempQuestionText, answers: tempAnswerArray, correctIndex: tempCorrectIndex });
            else { 
                response = await createQuestion({ text: tempQuestionText, answers: tempAnswerArray, correctIndex: tempCorrectIndex, quiz: questionData.quiz })
                await updateQuizQuestionsCount(true);
            };

            questionData = {
                objectId: response.objectId,
                quiz: questionData.quiz,
                text: tempQuestionText,
                answers: tempAnswerArray,
                correctIndex: tempCorrectIndex
            };
            
        } catch (error) { alert(error.message); }
        finally { 
            toggleAllInputs();
            changeView(true, true);
            toggleLoadingElem(false);
         }

        function toggleAllInputs() {
            [...questionHolder.querySelector('form').children].forEach(elem => {
                if (elem.tagName == 'TEXTAREA') elem.disabled = !elem.disabled;
                [...elem.children].forEach(child => {
                    if (child.tagName == 'INPUT' || child.tagName == 'BUTTON') child.disabled = !child.disabled;
                })
            });
        }

    }
    
    function toggleLoadingElem(show=true) {
        if (show) questionHolder.appendChild(questionLoadingElem);
        else questionLoadingElem.remove();
    }
    
    async function updateQuizQuestionsCount(isAdding) {
        let delta = (isAdding) ? 1 : -1;
        let quizQuestionsCount = (await getQuizById(questionData.quiz))['results'][0].questionCount;
        await updateQuiz(questionData.quiz, { questionCount: quizQuestionsCount + delta });
    }
}

