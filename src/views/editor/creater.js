import { html, elemCreator } from '../../lib.js';

import { createQuiz } from '../../api/data.js';


// <div class="loading-overlay working"></div>
const loadingElem = elemCreator('div', { className: 'loading-overlay working' });

const creatorTemplate = (onSubmit) => html`
<section id="editor">

    <header class="pad-large">
        <h1>New quiz</h1>
    </header>

    <div id="titleSelector" class="pad-large alt-page">
        <form @submit=${onSubmit}>
            <label class="editor-label layout">
                <span class="label-col">Title:</span>
                <input class="input i-med" type="text" name="title"></label>
            <label class="editor-label layout">
                <span class="label-col">Topic:</span>
                <select class="input i-med" name="topic">
                    <option value="all">All Categories</option>
                    <option value="it">Languages</option>
                    <option value="hardware">Hardware</option>
                    <option value="software">Tools and Software</option>
                </select>
            </label>
            <input class="input submit action" type="submit" value="Save">
        </form>
    </div>

<section>`;


export function showCreatorPage(context) {
    context.renderContent(creatorTemplate(onSubmit));

    async function onSubmit(event) {
        event.preventDefault();
        
        const form = document.querySelector('form');
        const formData = new FormData(form);

        let title = formData.get('title');
        let topic = formData.get('topic');

        try {
            validate();
            toggleLoadingElem(true);
            toggleInputButton();

            const result = await createQuiz({ title, topic });
            context.pageContent.redirect('/editor/' + result.objectId);

        } catch (error) { alert(error.message); }
        finally { toggleLoadingElem(false); }

        // redirect to editor
        function validate() {
            if (!title || topic == 'all') throw new Error('All fileds are required!');
        }

        function toggleInputButton() {
            [...form.querySelectorAll('input')].forEach(elem => elem.disabled = !elem.disabled);
        }
    }
    
    function toggleLoadingElem(show=true) {
        if (show) document.getElementById('titleSelector').appendChild(loadingElem);
        else loadingElem.remove();
    }
}