import { SESSION_COOKIE_NAME } from "$lib/constants";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from './$types';
import { addDataToDB, buyCar, uploadData } from "$lib/server/firebase";
import { getData } from "$lib/server/firebase";

export const load: PageServerLoad = async (event) => {
    const user = event.locals.user;
    if (!user) return;
    const gameData = (await getData(user.uid)).data;
    return {
        user,
        gameData
    }
}

export const actions: Actions = {
    login: async ({ request, cookies }) => {
        const formData: FormData = await request.formData();
        const token = formData.get('token')?.valueOf();
        if (!token || typeof token !== 'string') {
            return fail(401, {
                error: "Unauthorized",
            });
        }

        cookies.set(SESSION_COOKIE_NAME, token, {
            httpOnly: true,
            path: '/',
            secure: true
        });

        return { success: true, message: null };
    },
    signup: async ({ request, cookies }) => {
        const formData: FormData = await request.formData();
        const token = formData.get('token')?.valueOf();
        const username = String(formData.get('username')?.valueOf());
        if (!token || typeof token !== 'string') {
            return fail(401, {
                error: "Unauthorized",
            });
        }

        const data = await addDataToDB(token, username);

        if (!data.success && data.message) {
            return fail(500, {
                error: data.message,
            });
        }

        cookies.set(SESSION_COOKIE_NAME, token, {
            httpOnly: true,
            path: '/',
            secure: true
        });

        return { success: true, message: null };
    },
    saveData: async (event) => {
        const user = event.locals.user;
        if (!user) return fail(401, {
            error: "Unauthorized",
        });

        const formData = await event.request.formData();
        const score = Number(formData.get('score')?.valueOf()) ?? 0;
        const money = Number(formData.get('money')?.valueOf()) ?? 0;

        const success = await uploadData(user.uid, score, money);

        if (!success.success) {
            return fail(500, {
                error: success.message,
            });
        }
        return { success: true, message: null };
    },
    buyCar: async (event) => {
        const user = event.locals.user;
        if (!user) return fail(401, {
            error: "Unauthorized",
        });

        const formData = await event.request.formData();
        let names: string[] = [];
        formData.forEach((value, name) => {
            names.push(name);
        });
        if (!names) {
            return fail(500, {
                error: "No car selected",
            });
        }
        const sorted = names.sort();
        const car = sorted[0];
        const success = await buyCar(user.uid, car);

        if (!success.success) {
            return fail(500, {
                error: success.message,
            });
        }
        return { success: true, message: null };
    }
};