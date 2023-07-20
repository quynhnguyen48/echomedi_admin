import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { JWT_TOKEN } from "constants/Authentication";

export const initializeFirebase = async () => {
    const firebaseConfig = {
        apiKey: "AIzaSyAH9EPMpEoiRi644KtreNgOVpSBmDMjTmg",
        authDomain: "echomedi-551ad.firebaseapp.com",
        projectId: "echomedi-551ad",
        storageBucket: "echomedi-551ad.appspot.com",
        messagingSenderId: "868250085237",
        appId: "1:868250085237:web:0dac966b3530189b19153c"
    };
    let app = initializeApp(firebaseConfig);
    const messaging = getMessaging(app);
    const token = await getToken(messaging, { vapidKey: "BIu9-xxOmBtEir-Zz1LrCbDc_Dh5X5wXc4dYXzROdm-ukDztaquaTSIYTtLsSWSI0aulxvlbERH6z61Ij_L3Ejk" });
    const tokenApp = localStorage.getItem(JWT_TOKEN);

    // fetch('http://localhost:1337/api/user/updateMe', {
    fetch(process.env.REACT_APP_API_URL + '/api/user/updateMe', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + tokenApp
        },
        body: JSON.stringify({ "token": token })
    })
        .then(response => response.json())
        .then(response => console.log(JSON.stringify(response)))

    onMessage(messaging, (payload) => {
        console.log('onMessage')
        const notificationTitle = payload.notification.title;
        const notificationOptions = {
            body: payload.notification.body,
            icon: payload.notification.icon,
        };

        if (!("Notification" in window)) {
            console.log("This browser does not support system notifications");
        }
        // Let's check whether notification permissions have already been granted
        else if (Notification.permission === "granted") {
            var notification = new Notification(notificationTitle, notificationOptions);
            notification.onclick = function (event) {
                event.preventDefault(); // prevent the browser from focusing the Notification's tab
                window.open('https://admin.echomedi.com/bookings');
                notification.close();
            }
        }
    });
}