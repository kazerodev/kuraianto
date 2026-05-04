import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCEco8-2LrhckOthVR_pUTrEH4a-sPpgfw",
  authDomain: "kuraianto.firebaseapp.com",
  projectId: "kuraianto",
  storageBucket: "kuraianto.firebasestorage.app",
  messagingSenderId: "507337890510",
  appId: "1:507337890510:web:6fe5f42d94970307a9ce9f",
  measurementId: "G-JPW47L00H9"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
