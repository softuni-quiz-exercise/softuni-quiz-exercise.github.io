import { html } from '../../lib.js';


export default function quizTemplate(quizData, takenTimes) { 
    return html` 
    <article class="preview layout">
        <div class="right-col">
            <a class="action cta" href=${`/details/` + quizData.objectId}>View Quiz</a>
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
}


const topicConvert = {
    'it': 'Languages',
    'hardware': 'Hardware',
    'software': 'Tools and Software'
}