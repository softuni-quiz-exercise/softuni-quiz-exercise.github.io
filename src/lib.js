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
    monthConvert,
    topicConvert
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

const topicConvert = {
    'it': 'Languages',
    'hardware': 'Hardware',
    'software': 'Tools and Software'
}

const monthConvert = {
    "01": "January",
    "02": "February",
    "03": "March",
    "04": "April",
    "05": "May",
    "06": "June",
    "07": "July",
    "08": "August",
    "09": "September",
    "10": "October",
    "11": "November",
    "12": "December",
};