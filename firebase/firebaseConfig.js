import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore/lite';
// Follow this pattern to import other Firebase services
// import { } from 'firebase/<service>';

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyCsKrpd55ZXHLt0hwQ9XPQSZxE5DReVHqM",
    authDomain: "tcumobilelibrary.firebaseapp.com",
    projectId: "tcumobilelibrary",
    storageBucket: "tcumobilelibrary.appspot.com",
    messagingSenderId: "17886281452",
    appId: "1:17886281452:web:fa7f3f22dc4be7c6982fc9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Get a list of cities from your database
