import { html, render, elemCreator } from '../lib.js';

import { getAllQuizes, getQuizesFromSearch, getQuizTakenTimesById } from '../api/data.js';
import quizTemplate from './components/quizTemplate.js';
import loadingBlock from './components/loadingBlock.js';

const quizHolder = elemCreator('div', { className: 'pad-large alt-page' });
const loadingElem = loadingBlock();


const browserPageTemplate = (onSearch) => html`
<section id="browse">
    <header class="pad-large">
        <form class="browse-filter" @submit=${onSearch}>
            <input class="input" type="text" name="query">
            <select class="input" name="topic">
                <option value="all">All Categories</option>
                <option value="it">Languages</option>
                <option value="hardware">Hardware</option>
                <option value="software">Tools and Software</option>
            </select>
            <input class="input submit action" type="submit" value="Filter Quizes">
        </form>
        <h1>All quizes</h1>
    </header>
    
    <!-- quizes holder -->
    ${quizHolder}

</section>`;


export function showBrowserPage(context) {
    let [title, topic] = context.querystring.split('&').map(elem => elem.split('=')[1]);
    renderBrowserPage();

    async function renderBrowserPage() {
        context.renderContent(browserPageTemplate(onSearch));
        const func = (topic) ? getQuizesFromSearch : getAllQuizes;
        
        try {

            renderInHolder(loadingElem);
            let quizesData = await func(title, topic);
            if (quizesData.length == 0) throw new Error('No matches found!');
            for (let i = 0; i < quizesData.length; i++) { quizesData[i] = await attachTakenTimes(quizesData[i]); }
            renderInHolder(quizesData.map((data) => quizTemplate(data.data, data.takenTimes)));

        } catch (error) { renderInHolder('No quizes found!'); }

    }

    function onSearch(event) {
        event.preventDefault();

        const form = document.querySelector('form');
        const formData = new FormData(form);

        let title = formData.get('query');
        let topic = formData.get('topic');

        let url = '/browser' + `?title=${title}`+ '&' + `?topic=${topic}`;
        context.pageContent.redirect(url);
    }

    function renderInHolder(content) {
        render(content, quizHolder);
    }

    async function attachTakenTimes(data) {
        let takenTimes = await getQuizTakenTimesById(data.objectId);
        return { data: data, takenTimes };
    }
}