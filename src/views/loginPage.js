import { html } from '../lib.js';

import {authenticate} from '../api/authenticate.js';


const loginPageTemplate = (onSubmit) => html`
<section id="login">
    <div class="pad-large">
        <div class="glass narrow">
            <header class="tab layout">
                <h1 class="tab-item active">Login</h1>
                <a class="tab-item" href="/register">Register</a>
            </header>
            <form class="pad-med centered" @submit=${onSubmit}>
                <label class="block centered">Username: <input class="auth-input input" type="text"
                        name="username" /></label>
                <label class="block centered">Password: <input class="auth-input input" type="password"
                        name="password" /></label>
                <input class="block action cta" type="submit" value="Sign In" />
            </form>
            <footer class="tab-footer">
                Don't have an account? <a class="invert" href="/register">Create one here</a>.
            </footer>
        </div>
    </div>
</section>`;


export function showLoginPage(context) {
    context.renderContent(loginPageTemplate(onSubmit));

    async function onSubmit(event) {
        event.preventDefault();

        const form = document.querySelector('form');
        const formData = new FormData(form);

        let username = formData.get('username');
        let password = formData.get('password');

        try {
            validation();
            await authenticate({ username, password }, false);
            context.pageContent('/home');
        } catch(error) {
            alert(error.message);
        }

        function validation() {
            if (!username || !password) throw new Error('All fields are required!');
        }
    }
}