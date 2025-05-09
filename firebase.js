// firebase.js

// Importar funciones necesarias desde Firebase SDK
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js ';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js ';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js ';

// Tu configuración de Firebase (reemplaza estos valores por los de TU PROYECTO)
const firebaseConfig = {
    apiKey: "AIzaSyDaBAp23kS7HttX7hLXWuDLPI4NlTDPBuU",
    authDomain: "agromul-web.firebaseapp.com",
    projectId: "agromul-web",
    storageBucket: "agromul-web.firebasestorage.app",
    messagingSenderId: "282023614826",
    appId: "1:282023614826:web:706c04fdd3f3360bd46d13",
    measurementId: "G-W4FMN62599"
}
// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
const auth = getAuth(app);
const db = getFirestore(app);

// Exportar servicios para usarlos en otros archivos
export { auth, db };