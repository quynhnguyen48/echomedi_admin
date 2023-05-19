import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

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
    console.log('messaging', messaging)
    getToken(messaging, {vapidKey: "BIu9-xxOmBtEir-Zz1LrCbDc_Dh5X5wXc4dYXzROdm-ukDztaquaTSIYTtLsSWSI0aulxvlbERH6z61Ij_L3Ejk"});
}