<script lang="ts">
    import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
    import cross from "$lib/icons/cross.svg";
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";
    import toast from "svelte-french-toast";

    const dispatch = createEventDispatcher();

    function handleClose() {
        closed = true;
        dispatch("close", closed);
    }

    export let closed: boolean;

    let password: string;
    let repeatPassword: string;
    let errorMessage: string;

    async function handleSubmit(this: HTMLFormElement, event: Event) {
        event.preventDefault();

        const auth = getAuth();

        const formData = new FormData(this);
        const email = formData.get("email")?.toString() ?? "";
        const password = formData.get("password")?.toString() ?? "";
        if (!email || !password) {
            errorMessage = "";
            toast.error("Email or password are missing!");
            return;
        }
        if (password !== repeatPassword) {
            errorMessage = "";
            toast.error("Passwords do not match!");
            return;
        }
        toast.promise(
            new Promise(async (resolve, reject) => {
                try {
                    const userCredential = await createUserWithEmailAndPassword(
                        auth,
                        email,
                        password
                    );
                    const user = userCredential.user;
                    formData.set("token", await user.getIdToken());
                    const response = await fetch(`${this.action}?/signup`, {
                        method: "POST",
                        body: formData,
                    });
                    const result = await response.json();
                    if (result.type === "success") {
                        resolve("User registered!");
                        return handleClose();
                    }
                    reject("Something went wrong!");
                    return;
                } catch (error: any) {
                    reject(error.code.split("/")[1]);
                    return;
                }
            }),
            {
                loading: "Registering user...",
                success: "User registered!",
                error: (error) => `Register failed: ${error}`,
            }
        );
    }

    $: password == repeatPassword
        ? (errorMessage = "")
        : (errorMessage = "Passwords do not match");

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
    <div class="relative w-2/5 bg-slate-300 rounded-2xl">
        <button
            class="bg-white h-8 w-8 rounded-full right-[-1rem] top-[-1rem] absolute"
            on:click={handleClose}><img src={cross} alt="cross" /></button
        >
        <form
            class="flex flex-col gap-6 text-black py-8 px-12 justify-center items-center w-full h-full"
            method="POST"
            on:submit|preventDefault={handleSubmit}
        >
            {#if errorMessage}
                <p class="text-red-500">{errorMessage}</p>
            {/if}
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
                        <p>Username</p>
                    </div>
                    <input
                        class="w-4/5 p-[10px] border-none rounded-lg outline-none text-slate-700 placeholder:text-slate-700 placeholder:text-opacity-70"
                        placeholder="Username"
                        name="username"
                        type="text"
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
                        bind:value={password}
                        required
                    />
                </div>
                <div
                    class="inputBox flex flex-col w-full justify-center items-center mt-8"
                >
                    <div
                        class="flex justify-start w-4/5 text-slate-700 text-lg pb-2"
                    >
                        <p>Repeat Password</p>
                    </div>
                    <input
                        class="w-4/5 p-[10px] border-none rounded-lg outline-none placeholder:text-slate-700 placeholder:text-opacity-70"
                        placeholder="Repeat Password"
                        name="password"
                        type="password"
                        bind:value={repeatPassword}
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
