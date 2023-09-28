import admin from 'firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';
import { cars } from '$lib/constants';
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

export async function uploadData(token: string, score: number | 0, money: number | 0, cars: string[] | []) {
    const decodedToken = await decodeToken(token);
    if (!decodedToken) {
        return { success: false, message: "Invalid token" }
    };
    const uid = decodedToken.uid;
    const db = admin.firestore();
    const userRef = db.collection('users').doc(uid);
    await userRef.update({
        score: score,
        money: money,
        cars: cars,
    });
}

export async function getData(token: string): Promise<{ success: boolean, message: string | null, data: any }> {
    const decodedToken = await decodeToken(token);
    if (!decodedToken) {
        return { success: false, message: "Invalid token", data: null }
    };
    const uid = decodedToken.uid;
    const db = admin.firestore();
    const userRef = db.collection('users').doc(uid);
    const data = (await userRef.get()).data() ?? {};
    if (!data.score || !data.money || !data.cars) {
        return { success: false, message: "Missing values!", data: null }
    } else {
        return { success: true, message: null, data }
    }
}

export async function getName(uid: string) {
    const db = admin.firestore();
    const userRef = db.collection('users').doc(uid);
    const data = (await userRef.get()).data() ?? {};
    return data.name;
}

export async function buyCar(uid: string, car: string) {
    const db = admin.firestore();
    const userRef = db.collection('users').doc(uid);
    const userData = (await userRef.get()).data() ?? {};
    // @ts-ignore
    const carPrice = cars[car];
    if (!carPrice) throw new Error('Car does not exist');

    const userCurrency = userData.currency ?? 0;
    if (userCurrency < carPrice) throw new Error('User cannot afford this car');

    const userCars = userData.cars ?? [];
    userCars.push(car);
    await userRef.update({
        cars: userCars,
        currency: userCurrency - carPrice,
    });
}