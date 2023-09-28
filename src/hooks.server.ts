import type { Handle } from '@sveltejs/kit';
import cookie from "cookie";
import { decodeToken } from '$lib/server/firebase';
import { SESSION_COOKIE_NAME } from '$lib/constants';
import { getName } from '$lib/server/firebase';

export const handle = (async ({ event, resolve }) => {
    const cookies = cookie.parse(event.request.headers.get('cookie') || '');

    const token = cookies[SESSION_COOKIE_NAME];
    if (token) {
        const decodedToken = await decodeToken(token);
        const name = await getName(decodedToken!.uid);
        if (name && decodedToken) {
            event.locals.user = { ...decodedToken, token, name };
        }
    }

    return resolve(event);
}) satisfies Handle;