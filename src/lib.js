import { html, render } from '../node_modules/lit-html/lit-html.js';
import { until } from '../node_modules/lit-html/directives/until.js';
import page from '../node_modules/page/page.mjs';

export {
    html,
    render,
    page,
    elemCreator,
    createEmptyArray,
    until
}


function elemCreator(elementType, attributes={}, childrend=[]) {

    /* Creates custom html elements based on the given criterias */

    const newElement = document.createElement(elementType);

    for(let attrName in attributes) newElement[attrName] = attributes[attrName];

    for(const child of childrend) newElement.appendChild(child);

    return newElement;
}


function createEmptyArray(length) {

    /* Creates an array with the given length */

    const newArr = [];
    for (let i = 0; i < length; i++) {
        newArr.push(' ');
    }

    return newArr;
}