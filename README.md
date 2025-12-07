# Airport Display (React + Firebase + Tailwind)


## Setup
1. `git clone <repo>`
2. `cd airport-display`
3. `npm install`
4. Setup Tailwind (files are included)
5. Create a Firebase Realtime Database and copy your config into `src/firebase/firebaseConfig.js`.


## Running locally
- `npm run dev` — open `/display` in your TV browser and `/control` on your phone.


## Notes
- The login is intentionally simple (localStorage-based). Replace with Firebase Auth for production.
- The `Control` page uses `push()` for announcements/ticker. For a nicer management UI, you can change it to store indexed arrays.


## Firebase
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxN4opghtYohIa_P1KhSbi4p4dZihdJkQ",
  authDomain: "tv-at-taqwa.firebaseapp.com",
  projectId: "tv-at-taqwa",
  storageBucket: "tv-at-taqwa.firebasestorage.app",
  messagingSenderId: "1004741503778",
  appId: "1:1004741503778:web:676349b4b73ba19b86937b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);