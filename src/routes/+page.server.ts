import { SESSION_COOKIE_NAME } from "$lib/constants";
import { fail } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from './$types';
import { addDataToDB } from "$lib/server/firebase";

export const load: PageServerLoad = (event) => {
    const user = event.locals.user;
    if (!user) return;
    return {
        user
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
};