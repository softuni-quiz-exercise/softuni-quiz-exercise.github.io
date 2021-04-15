import { html } from '../lib.js';

import { authenticate } from '../api/authenticate.js';


const registerPageTemplate = (onSubmit) => html`
<section id="register">
<div class="pad-large">
    <div class="glass narrow">
        <header class="tab layout">
            <a class="tab-item" href="/login">Login</a>
            <h1 class="tab-item active">Register</h1>
        </header>
        <form class="pad-med centered" @submit=${onSubmit}>
            <label class="block centered">Username: <input class="auth-input input" type="text"
                    name="username" /></label>
            <label class="block centered">Email: <input class="auth-input input" type="text"
                    name="email" /></label>
            <label class="block centered">Password: <input class="auth-input input" type="password"
                    name="password" /></label>
            <label class="block centered">Repeat: <input class="auth-input input" type="password"
                    name="repass" /></label>
            <input class="block action cta" type="submit" value="Create Account" />
        </form>
        <footer class="tab-footer">
            Already have an account? <a class="invert" href="/login">Sign in here</a>.
        </footer>
    </div>
</div>
</section>`;


export function showRegisterPage(context) {
    context.renderContent(registerPageTemplate(onSubmit));

    async function onSubmit(event) {
        event.preventDefault();

        const form = document.querySelector('form');
        const formData = new FormData(form);

        let username = formData.get('username');
        let email = formData.get('email');
        let password = formData.get('password');
        let rePass = formData.get('repass');

        try {
            validation();
            await authenticate({ email, username, password }, true);
            context.pageContent('/home');
        } catch(error) {
            alert(error.message);
        }

        function validation() {
            if (!username || !email || !password || !rePass) throw new Error('All fields are required!');
            if (!email.includes('@')) throw new Error('Email must be valid!');
            if (password != rePass) throw new Error('Both passwords must match!');
        }
    } 
}