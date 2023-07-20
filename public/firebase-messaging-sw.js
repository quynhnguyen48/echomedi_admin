// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// If the "hi" message is posted, say hi back
console.log('hello')

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
    const notificationTitle = payload.data.title;
    const notificationOptions = {
        body: payload.data.body,
        icon: '/firebase-logo.png',
        data: { url: payload.data.redirect_url },
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});

// self.addEventListener('notificationclick', function (e) {
//     e.notification.close();
//     var redirectUrl = 'http://localhost:3001/bookings'; //e.notification.data.redirect_url;
//     var scopeUrl = e.notification.data.scope_url;

//     e.waitUntil(
//         clients.matchAll({includeUncontrolled: true, type: 'window'}).then(function(clients) {
//             for (i = 0; i < clients.length; i++) {
//                   if (clients[i].url.indexOf(scopeUrl) !== -1) {
//                         // Scope url is the part of main url
//                         clients[i].navigate(redirectUrl);
//                         clients[i].focus();
//                         break;
//                   }
//             }
//         })
//     );

// });

// serviceworker.js
// Send notification to OS if applicable
// if (self.Notification.permission === "granted") {
//     const notificationObject = {
//       body: "Click here to view your messages.",
//       data: { url: `${self.location.origin}/some/path` },
//       // data: { url: 'http://example.com' },
//     };
//     self.registration.showNotification(
//       "You've got messages!",
//       notificationObject,
//     );
//   }
  
  // Notification click event listener
  self.addEventListener("notificationclick", (e) => {
    // Close the notification popout
    e.notification.close();
    // Get all the Window clients
    e.waitUntil(
      clients.matchAll({ type: "window" }).then((clientsArr) => {
        // If a Window tab matching the targeted URL already exists, focus that;
        const hadWindowToFocus = clientsArr.some((windowClient) =>
          windowClient.url === e.notification.data.url
            ? (windowClient.focus(), true)
            : false,
        );
        // Otherwise, open a new tab to the applicable URL and focus it.
        if (!hadWindowToFocus)
          clients
            .openWindow(e.notification.data.url)
            .then((windowClient) => (windowClient ? windowClient.focus() : null));
      }),
    );
  });