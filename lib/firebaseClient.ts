import { initializeApp, getApps } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCZQ_hWQ4iFAHd9EI929TqJTevBgeoSEIs",
  authDomain: "heterodoxlabs.firebaseapp.com",
  projectId: "heterodoxlabs",
  storageBucket: "heterodoxlabs.appspot.com",
  messagingSenderId: "185184400830",
  appId: "1:185184400830:web:39525a1e5de9e3d9f075ef",
  measurementId: "G-NPHZWZJ4RX"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const firebaseStorage = getStorage(app); 