import { html, render, elemCreator } from '../lib.js';

import { getAllQuizes, getQuizesFromSearch, getQuizTakenTimesById } from '../api/data.js';
import quizTemplate from './components/quizTemplate.js';
import loadingBlock from './components/loadingBlock.js';

const quizHolder = elemCreator('div', { id: "quizHolder", className: "pad-large alt-page" });
const loadingElem = loadingBlock();
let maxShownQuizes = 0;  // index
let totalQuizesCount = 0;

const browserPageTemplate = ({ onSearch, title, topic }) => html`
<section id="browse">
    <header class="pad-large">
        <form class="browse-filter" @submit=${onSearch}>
            <input class="input" type="text" name="query" value=${(title) ? 'title' : ''} placeholder="Search for a quiz...">
            <select class="input" name="topic">
                <option value="all" .selected=${topic == "all"}>All Categories</option>
                <option value="it" .selected=${topic == "it"}>Languages</option>
                <option value="hardware" .selected=${topic == "hardware"}>Hardware</option>
                <option value="software" .selected=${topic == "software"}>Tools and Software</option>
            </select>
            <input class="input submit action" type="submit" value="Filter Quizes">
        </form>
        <h1>All quizes</h1>
    </header>
    
    <!-- quizes holder -->
    ${quizHolder}

    <!-- scroller loading elem -->
    <div class="loading">
	    <div class="ball"></div>
	    <div class="ball"></div>
	    <div class="ball"></div>
    </div>

</section>`;


export async function showBrowserPage(context) {
    let [title, topic] = context.querystring.split('&').map(elem => elem.split('=')[1]);

    let scrollerLoading;
    maxShownQuizes = 4;  // -> starting with 5 elements
    setEndlessScroller();
    
    context.renderContent(loadingElem);
    const quizesData = await takeData();
    renderBrowserPage();

    async function renderBrowserPage() {
        context.renderContent(browserPageTemplate({ onSearch, title, topic }));
        
        try {

            renderInHolder(quizesData.map((data, index) => {
                if (index <= maxShownQuizes) return quizTemplate(data.data, data.takenTimes);
            }));

            scrollerLoading = document.querySelector("div.loading");
            (scrollerLoading.classList.contains("show")) ? scrollerLoading.classList.remove("show") : '';

        } catch (error) { renderInHolder('No quizes found! Be the first to add one!'); }

    }

    async function takeData() {
        const func = (topic) ? getQuizesFromSearch : getAllQuizes;
        try {

            let quizesData = await func(title, topic);
            if (quizesData.length == 0) throw new Error('No matches found!');
            for (let i = 0; i < quizesData.length; i++) { quizesData[i] = await attachTakenTimes(quizesData[i]); }
            
            totalQuizesCount = quizesData.length;
            return quizesData;

        } catch(error) { renderInHolder('No quizes found! Be the first to add one!'); }

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

    function setEndlessScroller() {
        window.onscroll = undefined;
        window.addEventListener("scroll", () => { 
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

            if (scrollTop + clientHeight >= scrollHeight && totalQuizesCount > maxShownQuizes) {
                scrollerLoading.classList.add("show");
                maxShownQuizes = (maxShownQuizes * 2) + 1;
                setTimeout(renderBrowserPage, 1000);
            }
        });
    }
}