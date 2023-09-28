import admin from 'firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import key from "./key.json";

export const initializeFirebase = () => {
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(key as admin.ServiceAccount)
        });
    }
};

export async function decodeToken(token: string): Promise<DecodedIdToken | null> {
    if (!token) {
        return null;
    }

    try {
        initializeFirebase();

        return await admin.auth().verifyIdToken(token);
    } catch (err) {
        console.error('An error occurred validating token', (err as Error).message);
        return null;
    }
}

export async function addDataToDB(token: string, name: string) {
    const decodedToken = await decodeToken(token);
    if (!decodedToken) {
        return { success: false, message: "Invalid token" }
    };

    const uid = decodedToken.uid;
    const email = decodedToken.email;

    const db = admin.firestore();
    const userRef = db.collection('users').doc(uid);

    const userDoc = await userRef.get();
    if (!userDoc.exists) {
        await userRef.set({
            email,
            name,
        });
    } else {
        await userRef.update({
            email,
            name,
        });
    }
    return { success: true, message: null };
}

export async function uploadScoreAndMoney(token: string) {
    const decodedToken = await decodeToken(token);
    if (!decodedToken) {
        return { success: false, message: "Invalid token" }
    };
    const uid = decodedToken.uid;
}

export async function getData(token: string) {
    const decodedToken = await decodeToken(token);
    if (!decodedToken) {
        return { success: false, message: "Invalid token" }
    };
    const uid = decodedToken.uid;
    const db = admin.firestore();
    const userRef = db.collection('users').doc(uid);
    const data = (await userRef.get()).data() ?? {};
    if (!data.score || !data.money || !data.cars) {
        return { success: false, message: "Missing values!"}
    } else {
        return {success: true, message: null, data}
    }
}