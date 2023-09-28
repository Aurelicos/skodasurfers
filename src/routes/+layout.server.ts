import type {PageServerLoad} from "./$types";
import {getData} from "$lib/server/firebase";

export const load: PageServerLoad = (event) => {
    const user = event.locals.user;
    if (!user) return

    getData(user.token)
    return {user}
}

