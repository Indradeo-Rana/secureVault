importScripts(
    "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);

importScripts(
    "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

firebase.initializeApp({
    
    apiKey: "AIzaSyA8xshP4lT_t4mSkyDqjtXSCJ6el3_oSY4",
    authDomain: "vault-faacd.firebaseapp.com",
    projectId: "vault-faacd",
    storageBucket: "vault-faacd.firebasestorage.app",
    messagingSenderId: "860108321305",
    appId: "1:860108321305:web:afccbfe16efddee73ab088"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {

    console.log(
        "[firebase-messaging-sw.js] Background message:",
        payload
    );

    const notificationTitle =
        payload.notification?.title ||
        "SecureVault Notification";

    const notificationOptions = {
        body:
            payload.notification?.body ||
            "You have a new SecureVault notification."
    };

    self.registration.showNotification(
        notificationTitle,
        notificationOptions
    );
});