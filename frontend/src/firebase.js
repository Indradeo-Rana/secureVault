import { initializeApp } from "firebase/app";
import {getMessaging, getToken} from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyA8xshP4lT_t4mSkyDqjtXSCJ6el3_oSY4",
  authDomain: "vault-faacd.firebaseapp.com",
  projectId: "vault-faacd",
  storageBucket: "vault-faacd.firebasestorage.app",
  messagingSenderId: "860108321305",
  appId: "1:860108321305:web:afccbfe16efddee73ab088",
  measurementId: "G-36TJK5PH08"
};

const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app);

export const getFirebaseToken = async () => {

    try {

        const permission =
            await Notification.requestPermission();

        if (permission !== "granted") {
            console.log("Notification permission denied");
            return null;
        }

        const token = await getToken(
            messaging,
            {
                vapidKey: BNNXnV83SoOD6Z4DmZ0cY1I5h4NPvcAnUPEP-aCjdcMi7eLalaNl5x0hHX68SpgUefDKY4_cvdmapNzCnl5wxxE
            }
        );

        return token;

    } catch (error) {

        console.error(
            "Unable to get Firebase token:",
            error
        );

        return null;
    }
};
