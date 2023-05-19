import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

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

    onMessage(messaging, (payload) => {
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
            // If it's okay let's create a notification
            var notification = new Notification(notificationTitle, notificationOptions);
            notification.onclick = function (event) {
                event.preventDefault(); // prevent the browser from focusing the Notification's tab
                window.open(payload.notification.click_action, '_blank');
                notification.close();
            }
        }
    });
}