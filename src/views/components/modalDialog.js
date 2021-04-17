import { html, render} from '../../lib.js';


const modalTemplate = (message, onClick) => html`
<div class="modal" @click=${onClick}>
    <p>${message}</p>
    <a href="javascript:void(0)" class="action" id="trueValue">OK</a>
    <a href="javascript:void(0)" class="action" id="falseValue">Cencal</a>
</div>`;


export function setModal(message, action) {
    const holder = document.querySelector('div.overlay');
    
    showModal(message);
    
    function onClick(event) {
        const target = event.target;
        if (target.tagName != 'A') { return; }

        action(target.id == 'trueValue');
        hideModal();
    };

    function showModal(message) {
        holder.style.display = 'block';
        render(modalTemplate(message, onClick), holder);
    }

    function hideModal() {
        holder.style.display = 'none';
    }
}