import { html, render } from '//unpkg.com/lit-html?module';
import { until } from '//unpkg.com/lit-html/directives/until?module';
import page from '//unpkg.com/page/page.mjs';

export {
    html,
    render,
    until,
    page,
    elemCreator,
    createEmptyArray,
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