<script lang="ts">
    import { applyAction } from "$app/forms";
    import { invalidateAll } from "$app/navigation";
    import type { ActionResult } from "@sveltejs/kit";
    import {
        getAuth,
        signInWithEmailAndPassword,
        type UserCredential,
    } from "firebase/auth";
    import { writable } from "svelte/store";
    import cross from "$lib/icons/cross.svg";
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";
    import toast from "svelte-french-toast";

    export let closed: boolean;

    const dispatch = createEventDispatcher();

    function handleClose() {
        closed = true;
        dispatch("close", closed);
    }

    const errorMessage = writable<string | null>(null);

    const login = async (
        email: string | undefined,
        password: string | undefined
    ): Promise<
        ActionResult<{ credential: UserCredential }, Record<string, string>>
    > => {
        if (!email || !password) {
            return {
                type: "failure",
                status: 400,
                data: { message: "Email or password are missing" },
            };
        }
        const auth = getAuth();
        try {
            const credential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );
            return {
                type: "success",
                status: 200,
                data: { credential },
            };
        } catch (error) {
            console.log(error);
            return {
                type: "failure",
                status: 403,
                data: { message: (error as Error).message },
            };
        }
    };

    async function handleSubmit(
        this: HTMLFormElement,
        event: unknown
    ): Promise<void> {
        errorMessage.set(null);
        const formData = new FormData(this);
        const email = formData.get("email")?.toString();
        const password = formData.get("password")?.toString();

        toast.promise(
            new Promise(async (resolve, reject) => {
                try {
                    const loginResult: any = await login(email, password);
                    if (loginResult.type !== "success") {
                        applyAction(loginResult);
                        errorMessage.set(loginResult.data.message);
                        reject(
                            loginResult.data.message
                                .split("/")[1]
                                .replace(")", "")
                        );
                        return;
                    }

                    const { data } = loginResult;
                    if (!data?.credential) {
                        throw new Error(
                            "Login returned success but no user credential data"
                        );
                    }

                    const {
                        credential: { user },
                    } = data;
                    formData.set("token", await user.getIdToken());

                    const response = await fetch(`${this.action}?/login`, {
                        method: "POST",
                        body: formData,
                    });

                    const result = await response.json();
                    if (result.type !== "success") {
                        errorMessage.set("Unauthorized");
                        reject("Unauthorized");
                        return handleClose();
                    }
                    resolve("Logged in successfully!");
                    invalidateAll();
                } catch (e) {
                    console.log(e);
                }
            }),
            {
                loading: "Logging in...",
                success: "Logged in successfully!",
                error: (error) => `Login failed: ${error}`,
            }
        );
    }

    onMount(() => {
        const handleKeydown = (e: KeyboardEvent) => {
            if (e.key === "Escape") handleClose();
        };
        window.addEventListener("keydown", handleKeydown);

        return () => {
            window.removeEventListener("keydown", handleKeydown);
        };
    });
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    class="main absolute w-full h-screen top-0 bg-black bg-opacity-60 z-50 {closed
        ? 'hidden'
        : 'flex'} justify-center items-center"
    on:click={(e) => {
        // @ts-ignore
        if (e.target.className?.includes("main")) handleClose();
    }}
>
    <div class="relative h-[25rem] w-2/5 bg-slate-300 rounded-2xl">
        <button
            class="bg-white h-8 w-8 rounded-full right-[-1rem] top-[-1rem] absolute"
            on:click={handleClose}><img src={cross} alt="cross" /></button
        >
        <form
            class="flex flex-col gap-6 text-black py-8 px-12 justify-center items-center w-full h-full"
            method="POST"
            on:submit|preventDefault={handleSubmit}
        >
            <div
                class="w-full h-full flex items-center justify-center flex-col"
            >
                <div
                    class="inputBox flex flex-col w-full justify-center items-center"
                >
                    <div
                        class="flex justify-start w-4/5 text-slate-700 text-lg pb-2"
                    >
                        <p>Email</p>
                    </div>
                    <input
                        class="w-4/5 p-[10px] border-none rounded-lg outline-none text-slate-700 placeholder:text-slate-700 placeholder:text-opacity-70"
                        placeholder="Email"
                        name="email"
                        type="email"
                        required
                    />
                </div>

                <div
                    class="inputBox flex flex-col w-full justify-center items-center mt-8"
                >
                    <div
                        class="flex justify-start w-4/5 text-slate-700 text-lg pb-2"
                    >
                        <p>Password</p>
                    </div>
                    <input
                        class="w-4/5 p-[10px] border-none rounded-lg outline-none placeholder:text-slate-700 placeholder:text-opacity-70"
                        placeholder="Password"
                        name="password"
                        type="password"
                        required
                    />
                </div>
                <div class="w-4/5">
                    <button
                        class="p-[10px] border-none bg-green-500 cursor-pointer hover:bg-green-600 mt-10 w-full rounded-lg"
                        type="submit">Login</button
                    >
                </div>
            </div>
        </form>
    </div>
</div>
