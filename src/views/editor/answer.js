import { html, render, elemCreator } from '../../lib.js';


export const answerTemplate = ({ preview, text, index, isCorrect, questionIndex, deleteAnswear, onAnswearChange, onCorrectAnswearChange }) => {

    const answerHolder = elemCreator('div', { className: 'editor-input' });
    // <div class="editor-input"></div>;

    const answerContent = html`
    <label class="radio">
        <input class="input" type="radio" name=${`question-${questionIndex}`} value=${index} .disabled=${preview} .checked=${isCorrect} @change=${() => onCorrectAnswearChange(index)}/>
        <i class="fas fa-check-circle"></i>
    </label>
        
    ${
        (preview)
        ? html`
        <span>${text}</span>`
        : html`
        <input class="input" type="text" name=${`answer-${index}`} value=${text} @change=${event => onAnswearChange(event.target.value, index)} />
        <button class="input submit action" @click=${() => deleteAnswear(answerHolder, text)}><i class="fas fa-trash-alt"></i></button>`
    }`

    render(answerContent, answerHolder);
    return answerHolder;
}
