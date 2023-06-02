// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// If the "hi" message is posted, say hi back
console.log('123123123123')

const firebaseConfig = {
    apiKey: "AIzaSyAH9EPMpEoiRi644KtreNgOVpSBmDMjTmg",
    authDomain: "echomedi-551ad.firebaseapp.com",
    projectId: "echomedi-551ad",
    storageBucket: "echomedi-551ad.appspot.com",
    messagingSenderId: "868250085237",
    appId: "1:868250085237:web:0dac966b3530189b19153c"
};
// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();


// Get registration token. Initially this makes a network call, once retrieved
// subsequent calls to getToken will return from cache.

messaging.onBackgroundMessage((payload) => {
    // Customize notification here
    console.log('payload', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/firebase-logo.png'
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});


