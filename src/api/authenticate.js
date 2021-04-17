import { registerUser, loginUser } from './data.js';
import { page } from '../lib.js';


export async function authenticate(body, isRegistering=true) {
    let responseFunc = (isRegistering) ? registerUser : loginUser;
    let errorMessage = (isRegistering) ? 'You have already registered!' : 'You haven\'t registered yet!';

    try {

        let response = await responseFunc(body);
        sessionStorage.authToken = response.sessionToken;
        sessionStorage.userId = response.objectId;
        // document.querySelector('#profileBtn').href = '/profile/' + sessionStorage.userId;
    
    } catch(error) {
        throw new Error(errorMessage);
    }

    page.redirect('/home');
}
