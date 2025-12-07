import { initializeApp } from 'firebase/app'
import { getDatabase } from 'firebase/database'
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCxN4opghtYohIa_P1KhSbi4p4dZihdJkQ",
    authDomain: "tv-at-taqwa.firebaseapp.com",
    databaseURL: "https://tv-at-taqwa-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "tv-at-taqwa",
    // storageBucket: "tv-at-taqwa.firebasestorage.app",
    storageBucket: "tv-at-taqwa.appspot.com",
    messagingSenderId: "1004741503778",
    appId: "1:1004741503778:web:676349b4b73ba19b86937b"
}

const app = initializeApp(firebaseConfig)

export const db = getDatabase(app)
export const storage = getStorage(app);