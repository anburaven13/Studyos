"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
// Support both local JSON file and Vercel environment variables
let credential;
try {
    const serviceAccount = require('./service-account.json');
    credential = firebase_admin_1.default.credential.cert(serviceAccount);
}
catch (_error) {
    try {
        if (process.env.FIREBASE_PROJECT_ID) {
            // Robustly clean up the private key
            let pk = process.env.FIREBASE_PRIVATE_KEY || '';
            if (pk.startsWith('"') && pk.endsWith('"')) {
                pk = pk.substring(1, pk.length - 1);
            }
            pk = pk.replace(/\\n/g, '\n');
            credential = firebase_admin_1.default.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: pk,
            });
        }
    }
    catch (envError) {
        console.error("Firebase Admin initialization failed: Missing or invalid environment variables", envError);
    }
}
try {
    if (!firebase_admin_1.default.apps.length) {
        if (credential) {
            firebase_admin_1.default.initializeApp({ credential });
        }
        else {
            console.warn("WARNING: Firebase Admin initialized with DUMMY config. APIs will fail, but server will boot.");
            firebase_admin_1.default.initializeApp({ projectId: 'dummy-project' });
        }
    }
}
catch (initError) {
    console.error("Firebase init fallback failed:", initError);
}
exports.auth = firebase_admin_1.default.auth();
