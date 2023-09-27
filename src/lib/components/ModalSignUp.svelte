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
            toast.error("Nevyplnili jste email nebo heslo!");
            return;
        }
        if (password !== repeatPassword) {
            errorMessage = "";
            toast.error("Hesla se neshodují!");
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
    class="main fixed w-full h-screen top-0 bg-black bg-opacity-60 z-50 {closed
        ? 'hidden'
        : 'flex'} justify-center items-center"
    on:click={(e) => {
        // @ts-ignore
        if (e.target.className?.includes("main")) handleClose();
    }}>
    <div class="relative h-[84%] w-[50%] border-[#103a30] border-[3px] bg-[#f3f3f3] rounded-3xl">
        <button
            class="bg-white h-8 w-8 rounded-full right-[-0.8rem] top-[-0.8rem] absolute"
            on:click={handleClose}><img src={cross} alt="cross" /></button>
        <form
            class="flex flex-col gap-6 text-black py-8 px-12 justify-center items-center w-full h-full"
            method="POST"
            on:submit|preventDefault={handleSubmit}>
            <div class="w-full h-full flex items-center justify-center flex-col gap-8">
                <h1 class="text-4xl text-center">Registrujte se</h1>
                <div class="inputBox flex flex-col w-full justify-center items-center">
                    <div class="flex justify-start w-3/5 ml-3 text-emerald-950 text-lg">
                        <p>Email</p>
                    </div>
                    <input
                        class="w-3/5 px-6 py-3 border-none rounded-lg outline-none text-slate-700 placeholder:text-slate-700 placeholder:text-opacity-50"
                        placeholder="john.doe@gmail.com"
                        name="email"
                        type="email"
                        required />
                </div>
                <div class="inputBox flex flex-col w-full justify-center items-center">
                    <div class="flex justify-start w-3/5 text-emerald-950 text-lg ml-3">
                        <p>Username</p>
                    </div>
                    <input
                        class="w-3/5 px-6 py-3 border-none rounded-lg outline-none text-slate-700 placeholder:text-slate-700 placeholder:text-opacity-50"
                        placeholder="coolGuy69"
                        name="username"
                        type="text"
                        required />
                </div>
                <div class="inputBox flex flex-col w-full justify-center items-center">
                    <div class="flex justify-start w-3/5 ml-3 text-slate-700 text-lg">
                        <p>Password</p>
                    </div>
                    <input
                        class="w-3/5 px-6 py-3 border-none rounded-lg outline-none placeholder:text-slate-700 placeholder:text-opacity-50"
                        placeholder="🤫"
                        name="password"
                        type="password"
                        bind:value={password}
                        required />
                </div>
                <div class="h-6 -mb-6 -mt-5">
                    {#if errorMessage}
                        <p class="text-red-500">{errorMessage}</p>
                    {/if}
                </div>
                <div class="inputBox flex flex-col w-full justify-center items-center">
                    <div class="flex justify-start ml-3 w-3/5 text-slate-700 text-lg">
                        <p>Repeat Password</p>
                    </div>
                    <input
                        class="w-3/5 px-6 py-3 border-none rounded-lg outline-none placeholder:text-slate-700 placeholder:text-opacity-50"
                        placeholder="🤫"
                        name="password"
                        type="password"
                        bind:value={repeatPassword}
                        required />
                </div>
                <div class="-mt-3 -mb-7 flex flex-row w-3/5 justify-center items-center gap-2">
                    <p class="">Máte účet?</p>
                    <button class="text-blue-600 underline hover:text-blue-500 duration-300">Přihlásit</button>
                </div>
                <div class="w-2/5 flex items-center mt-10 justify-center">
                    <button type="submit" class="text-2xl text-white rounded-[3rem] bg-[#103a30] px-8 py-4 hover:bg-emerald-800 duration-500">
                        Registrovat
                    </button>
                </div>
            </div>
        </form>
    </div>
</div>
