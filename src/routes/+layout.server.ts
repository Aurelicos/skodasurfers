import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = (event: any) => {
    const user = event.locals.user;
    if (!user) return

    return { user }
}