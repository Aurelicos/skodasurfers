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
            score: 0,
            money: 0,
            cars: [],
        });
    } else {
        await userRef.update({
            email,
            name,
            score: 0,
            money: 0,
            cars: [],
        });
    }
    return { success: true, message: null };
}

export async function uploadData(uid: string, score: number = 0, money: number = 0) {
    try {
        const db = admin.firestore();
        const userRef = db.collection('users').doc(uid);

        const doc = await userRef.get();
        
        if (!doc.exists) {
            await userRef.set({ score, money });
        } else {
            const data = doc.data();

            const newScore = (data?.score ?? 0) + score;
            const newMoney = (data?.money ?? 0) + money;
            
            await userRef.update({ score: newScore, money: newMoney });
        }

        return { success: true, message: null };
    } catch (e) {
        console.error('Error updating user data:', e);
        return { success: false, message: String(e) };
    }
}

export async function getData(uid: string): Promise<{ success: boolean, message: string | null, data: any }> {
    try {
        const db = admin.firestore();
        const userRef = db.collection('users').doc(uid);
        const data = (await userRef.get()).data() ?? {};
        return { success: true, message: null, data }
    } catch (e: any) {
        return { success: false, message: String(e), data: null }
    }
}

export async function getName(uid: string) {
    const db = admin.firestore();
    const userRef = db.collection('users').doc(uid);
    const data = (await userRef.get()).data() ?? {};
    return data.name;
}

export async function buyCar(uid: string, car: string) {
    try {
        const db = admin.firestore();
        const userRef = db.collection('users').doc(uid);
        const userData = (await userRef.get()).data() ?? {};
        // @ts-ignore
        const carPrice = cars[car];
        if (!carPrice) return { success: false, message: "Invalid car" };
    
        const userCurrency = userData.money ?? 0;
        if (userCurrency < carPrice) return { success: false, message: "Not enough money" };
    
        const userCars = userData.cars ?? [];
        userCars.push(car);
        await userRef.update({
            cars: userCars,
            money: userCurrency - carPrice,
        });
        return { success: true, message: null };
    } catch (e) {
        return { success: false, message: String(e) };
    }

}