import { html, render} from '../../lib.js';


const modalTemplate = (message) => html`
<div class="modal">
    <p>${message}</p>
    <a href="javascript:void(0)" class="action" id="trueValue">OK</a>
    <a href="javascript:void(0)" class="action" id="falseValue">Cencal</a>
</div>`;


const holder = document.querySelector('div.overlay');

function showModal(message) {
    holder.style.display = 'block';
    render(modalTemplate(message), holder);
}

function hideModal() {
    holder.style.display = 'none';
}


export function setModal(message, action) {
    showModal(message);
    holder.addEventListener('click', event => {
        const target = event.target;
        if (target.tagName != 'A') { return; }

        action(target.id == 'trueValue');
        hideModal();
    });
}