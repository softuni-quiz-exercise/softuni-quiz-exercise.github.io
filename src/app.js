import { render, page } from './lib.js';

import { logOutUser } from './api/data.js';

import { showHomePage } from './views/homePage.js';
import { showLoginPage } from './views/loginPage.js';
import { showRegisterPage } from './views/registerPage.js';
import { showCreatorPage } from './views/editor/creater.js';
import { showEditorPage } from './views/editor/editor.js';
import { showBrowserPage } from './views/browserPage.js';
import { showDetailsPage } from './views/detailsPage.js';
import { showContestPage } from './views/contestPage.js';
import { showSummoryPage } from './views/summoryPage.js';
import { showProfilePage } from './views/profilePage.js';


const main = document.getElementById('content');
const nav = document.querySelector('nav');
nav.querySelector('#logoutBtn').addEventListener('click', onLogout);
// nav.querySelector('#profileBtn').href = '/profile/' + sessionStorage.userId;

/* Router Set-Up */
page.redirect('/', '/home');

page('/home', decorateContext, showHomePage);
page('/login', decorateContext, showLoginPage);
page('/register', decorateContext, showRegisterPage);
page('/create', decorateContext, showCreatorPage);
page('/editor/:id', decorateContext, showEditorPage);
page('/browser', decorateContext, showBrowserPage);
page('/details/:id', decorateContext, showDetailsPage);
page('/contest/:id', decorateContext, showContestPage);
page('/summory/:id', decorateContext, showSummoryPage);
page('/profile/:id', decorateContext, showProfilePage);

page.start();


function decorateContext(context, next) {
    context.renderContent = content => render(content, main);
    context.pageContent = page;
    setNavButtons();
    next();
}


function setNavButtons() {
    let isLogged = sessionStorage.authToken;
    nav.querySelector('#user-nav').style.display = isLogged ? 'block' : 'none';
    nav.querySelector('#guest-nav').style.display = isLogged ? 'none' : 'block';
}

function onLogout() {
    logOutUser();
    sessionStorage.clear();
    page.redirect('/home');
}