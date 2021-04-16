import { createAPIDialog } from './api.js';

const api = createAPIDialog();

const host = 'https://parseapi.back4app.com/';

const endpoints = {
    register: host + 'users',
    login: host + 'login',
    logout: host + 'logout',
    quizCollection: host + 'classes/Quiz',
    questionCollection: host + 'classes/Question',
    userCollection: host + 'classes/_User',
    solutionCollection: host + 'classes/Solution',
}

function addPointer(className, objectId) {
    /*
    \"pointerExample\": {
        \"__type\": \"Pointer\",
        \"className\": \"<YOUR_CLASS_NAME>\",
        \"objectId\": \"<THE_REFERENCED_OBJECT_ID>\" 
    }
    */
    return {
        "__type": "Pointer",
        "className": className,
        "objectId": objectId
    }
}


/* authentication requests */
export async function registerUser(body, headers={ 'X-Parse-Revocable-Session': '1' }) {
    return await api.postData(endpoints.register, body, headers);
}

export async function loginUser(body, headers={ 'X-Parse-Revocable-Session': '1' }) {
    return await api.postData(endpoints.login, body, headers);
}

export async function logOutUser() {
    return await api.postData(endpoints.logout);
}


/* Data Searching */
export async function getQuizById(quizId) {
    // 'where={"title": "My post title", "likes": { "$gt": 100 }}'
    let url = endpoints.quizCollection + `?where={"objectId": "${quizId}"}`;
    return await api.getData(url);
}

export async function getSummoryById(summoryId) {
    let url = endpoints.solutionCollection + `?where={"objectId": "${summoryId}"}`;
    return await api.getData(url);
}

export async function getSolutionsByUserId(userId) {
    let url = endpoints.solutionCollection + `?where={"owner": "${userId}"}`;
    return (await api.getData(url))['results'];
}

export async function getQuizTakenTimesById(quizId) {
    let url = endpoints.solutionCollection + `?where={"quiz": "${quizId}"}&count="1"`;
    return (await api.getData(url))['count'];
}

export async function getOwnerById(ownerId) {
    let url = endpoints.userCollection + `?where={"objectId": "${ownerId}"}`;
    return await api.getData(url);
}

export async function getQuestsionByQuizId(quizId) {
    // 'where={"post":{"__type":"Pointer","className":"Post","objectId":"<OBJECT_ID>"}}'
    // let url = endpoints.questionCollection + `?where=` + encodeURIComponent(`{"quiz": ${addPointer('Quiz', quizId)}`);

    let url = endpoints.questionCollection + `?where={"quiz": "${quizId}"}`;
    return await api.getData(url);
}

export async function getQuizesByUserId(ownerId) {
    // 'where={"post":{"__type":"Pointer","className":"Post","objectId":"<OBJECT_ID>"}}'

    let url = endpoints.quizCollection + `?where={"owner": ${JSON.stringify(addPointer("_User", ownerId))}}`;
    return (await api.getData(url))['results'];
}

export async function getTheLastQuiz() {
    const quizesCount = await getQuizesCount();
    let url = endpoints.quizCollection + '?limit="1"' + '&' + `skip="${quizesCount - 1}"`;
    const firstQuiz = (await api.getData(url))['results'][0];

    return await firstQuiz;
}

export async function getAllQuizes() {

    const quizes = (await api.getData(endpoints.quizCollection))['results'].reverse();
    return await quizes;
}

export async function getQuizesFromSearch(title, topic) {
    // 'where={"title": "My post title", "likes": { "$gt": 100 }}'
    
    let url = endpoints.quizCollection;
    if (topic == 'all' && title) url += `?where={"title": "${title}"}`;
    else if (title) url += `?where={"title": "${title}", "topic": "${topic}"}`;
    else if (topic != 'all') url += `?where={"topic": "${topic}"}`;

    const quizes = (await api.getData(url))['results'].reverse();
    return await quizes;
}


export async function getQuizesCount() {
    const quizesCount = (await api.getData(endpoints.quizCollection + '?count="1"'));
    return await quizesCount.count;
}


/* CRUD requests */
export async function createQuiz(body) {
    body['owner'] = addPointer('_User', sessionStorage.userId);
    return await api.postData(endpoints.quizCollection, body);
}

export async function updateQuiz(quizId, body) {
    return await api.updateRequest(endpoints.quizCollection + '/' + quizId, body);
}

export async function deleteQuiz(quizId) {
    await deleteSolutionByQuizId(quizId);
    await deleteQuestionsByQuizId(quizId);
    return await api.deleteRequest(endpoints.quizCollection + '/' + quizId);
}

export async function deleteSolution(solutionId) {
    return await api.deleteRequest(endpoints.solutionCollection + '/' + solutionId);
}

export async function deleteSolutionByQuizId(quizId) {
    const solutions = await api.getData(endpoints.solutionCollection + `?where={"quiz": "${quizId}"}`);
    if (solutions) solutions['results'].forEach(solution => deleteSolution(solution.objectId));
}
export async function deleteQuestionsByQuizId(quizId) {
    const questions = await api.getData(endpoints.questionCollection + `?where={"quiz": "${quizId}"}`);
    if (questions) questions['results'].forEach(questions => deleteQuestion(questions.objectId));
}

export async function createQuestion(body) {
    body['owner'] = addPointer('_User', sessionStorage.userId);
    return await api.postData(endpoints.questionCollection, body);
}

export async function deleteQuestion(questionId) {
    return await api.deleteRequest(endpoints.questionCollection + '/' + questionId);
}

export async function updateQuestion(questionId, body) {
    return await api.updateRequest(endpoints.questionCollection + '/' + questionId, body);
}

export async function postSolution(body) {
    return await api.postData(endpoints.solutionCollection, body);
}