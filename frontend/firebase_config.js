// Firebase Configuration (Optional)
// To enable cloud storage for graphs:
// 1. Create a Firebase project at console.firebase.google.com
// 2. Register a web app and copy the config object below
// 3. Uncomment and fill in the details

/*
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export async function saveGraphToCloud(query, graphData) {
    try {
        await setDoc(doc(db, "graphs", query), {
            data: graphData,
            timestamp: new Date()
        });
        alert("Graph saved to cloud!");
    } catch (e) {
        console.error("Error adding document: ", e);
        alert("Error saving to cloud: " + e.message);
    }
}
*/

export async function saveGraphToCloud(query, graphData) {
    console.log("Firebase not configured. Saving to localStorage instead.");
    localStorage.setItem('graph_' + query, JSON.stringify(graphData));
    alert("Graph saved to Local Storage (Simulated Cloud)");
}
