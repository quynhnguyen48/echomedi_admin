// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

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
messaging.getToken({ vapidKey: 'BIu9-xxOmBtEir-Zz1LrCbDc_Dh5X5wXc4dYXzROdm-ukDztaquaTSIYTtLsSWSI0aulxvlbERH6z61Ij_L3Ejk' }).then((currentToken) => {
    console.log('currentToken', currentToken)
    if (currentToken) {
        // Send the token to your server and update the UI if necessary
        // ...
        console.log('token', currentToken)
    } else {
        // Show permission request UI
        console.log('No registration token available. Request permission to generate one.');
        // ...
    }
}).catch((err) => {
    console.log('An error occurred while retrieving token. ', err);
    // ...
});


messaging.onBackgroundMessage((payload) => {
    console.log(
        '[firebase-messaging-sw.js] Received background message ',
        payload
    );
    // Customize notification here
    const notificationTitle = 'Background Message Title';
    const notificationOptions = {
        body: 'Background Message body.',
        icon: '/firebase-logo.png'
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});


