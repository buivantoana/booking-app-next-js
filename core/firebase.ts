import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
    apiKey: "AIzaSyCjKr17xBzDz6uuIKJxb4SuS1XRIAKd8zk",
    authDomain: "auth-f2165.firebaseapp.com",
    projectId: "auth-f2165",
    storageBucket: "auth-f2165.appspot.com",
    messagingSenderId: "46950998408",
    appId: "1:46950998408:web:63db219fc1f07c4b925a3d",
    measurementId: "G-JXD1WVZY9L"
  };
  


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()