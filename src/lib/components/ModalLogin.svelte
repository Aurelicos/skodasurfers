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
    class="main fixed w-full h-screen top-0 bg-black bg-opacity-60 z-50 {closed
        ? 'hidden'
        : 'flex'} justify-center items-center"
    on:click={(e) => {
        // @ts-ignore
        if (e.target.className?.includes("main")) handleClose();
    }}
>
    <div class="relative h-[60%] w-[40%] border-[#103a30] border-[3px] bg-[#f3f3f3] rounded-3xl">
        <button
            class="bg-white h-8 w-8 rounded-full right-[-0.8rem] top-[-0.8rem] absolute"
            on:click={handleClose}><img src={cross} alt="cross" /></button>
        <form
            class="flex flex-col gap-6 text-black py-8 px-12 justify-center items-center w-full h-full"
            method="POST"
            on:submit|preventDefault={handleSubmit}>
            <div class="w-full h-full flex items-center justify-center flex-col gap-8">
                <h1 class="text-4xl text-center">Přihlašte se</h1>
                <div class="inputBox flex flex-col w-full justify-center items-center">
                    <div class="flex justify-start w-3/5 ml-3 text-emerald-950 text-lg">
                        <p>Email</p>
                    </div>
                    <input
                        class="w-3/5 px-6 py-3 rounded-lg outline-none text-slate-700 placeholder:text-slate-700 placeholder:text-opacity-50"
                        placeholder="john.doe@gmail.com"
                        name="email"
                        type="email"
                        required
                    />
                </div>
                <div class="inputBox flex flex-col w-full justify-center items-center">
                    <div class="flex justify-start w-3/5 text-emerald-950 text-lg ml-3">
                        <p>Password</p>
                    </div>
                    <input
                        class="w-3/5 px-6 py-3 rounded-lg outline-none placeholder:text-slate-700 placeholder:text-opacity-50"
                        placeholder="🤫"
                        name="password"
                        type="password"
                        required
                    />
                </div>
                <div class="-mt-3 -mb-7 flex flex-row w-3/5 justify-center items-center gap-2">
                    <p class="">Nemáte ůčet?</p>
                    <button class="text-blue-600 underline hover:text-blue-500 duration-300">Registrovat</button>
                </div>
                <div class="w-2/5 flex items-center mt-8 justify-center">
                    <button type="submit" class="text-2xl text-white rounded-[3rem] bg-[#103a30] px-8 py-4 hover:bg-emerald-800 duration-500">
                        Přihlásit
                    </button>
                </div>
            </div>
        </form>
    </div>
</div>
