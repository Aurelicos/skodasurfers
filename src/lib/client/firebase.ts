import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { memoize } from 'lodash';

const firebaseConfig = {
    apiKey: "AIzaSyCBRmdbsDmGPwTZOXf-zktgTYQVpq86wt4",
    authDomain: "skoda-surfers.firebaseapp.com",
    projectId: "skoda-surfers",
    storageBucket: "skoda-surfers.appspot.com",
    messagingSenderId: "951292572276",
    appId: "1:951292572276:web:1827a48ac0e6369d0bd721",
    measurementId: "G-4V57RFPS5G"
};

export const initFirebase = memoize(() => {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    return { app, auth };
});