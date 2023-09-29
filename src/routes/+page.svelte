<script lang="ts">
    import CarModel from "$lib/components/CarModel.svelte";
    import { onMount } from "svelte";
    import { exportedValue } from "$lib/stores/store";
    import Scene from "./scene.svelte";
    import type { PageData } from "./$types";
    import { invalidateAll } from "$app/navigation";
    import { gameControl } from "./store";
    import toast from "svelte-french-toast";
    import QuizQuestion from "$lib/components/QuizQuestion.svelte";

    let rotateModel: any;
    let scrollY: any;
    let width;
    export let data: PageData;

    function restartGame() {
        gameControl.update((value) => ({ ...value, restart: !value.restart }));
    }

    onMount(() => {
        const handleScroll = (event: WheelEvent) => {
            if (scrollY === 0) return;
            if (rotateModel) {
                rotateModel(event.deltaY);
            }
        };
        window.addEventListener("wheel", handleScroll);
        updateStoreValue;
        return () => {
            window.removeEventListener("wheel", handleScroll);
        };
    });

    function updateStoreValue(closed: string) {
        if (!data.user) {
            exportedValue.set(closed);
        }
    }

    onMount(() => {
        updateStoreValue("true");
    });

    let currentScore = 0;
    let gameOver = false;
    let money = 0;

    async function handleCar(this: HTMLFormElement, event: Event) {
        event.preventDefault();
        const formData = new FormData(this);
        const response = await fetch(`/?/buyCar`, {
            method: "POST",
            body: formData,
        });
        const result = await response.json();
        if (result.type !== "success") {
            toast.error("You can't buy a car!");
            return;
        }
        toast.success("Car bought!");
        invalidateAll();
    }

    async function handleSubmit(this: HTMLFormElement, event: Event) {
        if (!data.user) {
            restartGame();
            gameOver = false;
            invalidateAll();
            return;
        }
        const formData = new FormData();
        const score = currentScore;
        formData.append("score", score.toString());
        formData.append("money", money.toString());
        const response = await fetch(`/?/saveData`, {
            method: "POST",
            body: formData,
        });
        const result = await response.json();
        if (result.type !== "success") {
            return;
        }
        invalidateAll();
        restartGame();
        gameOver = false;
    }
    $: money = currentScore * 651;

    $: if (currentScore % 15 === 0 && currentScore !== 0) {
        toast.success("You have reached a new level!");
        closed = false;
        correct ? (currentScore += 10) : (currentScore += 1);
    }

    let closed = true;
    let correct = false;
    let failed = false;

    let paused = false;
</script>

<svelte:window bind:scrollY />

<QuizQuestion
    {closed}
    on:close={() => (closed = true)}
    on:correct={() => {
        (closed = true), (correct = true);
    }}
    on:failed={() => {
        (closed = true), (failed = true);
    }}
/>

{#if gameOver}
    <form
        method="POST"
        on:submit|preventDefault={handleSubmit}
        class="z-50 fixed h-screen w-screen top-0 left-0 bg-black bg-opacity-70 flex justify-center items-center flex-col"
    >
        <h1 class="text-9xl text-slate-300">Game Over</h1>
        <button
            class="bg-gray-600 text-slate-200 py-4 px-10 mt-8 rounded-lg hover:bg-gray-800"
            type="submit">Continue</button
        >
    </form>
{/if}

<section id="hero" class="h-[84vh]">
    <div class="grid grid-cols-2 h-full w-full pb-16">
        <div class="items-start justify-center flex flex-col pl-40 gap-8">
            <h1 class="text-9xl text-emerald-950 font-semibold uppercase">
                škoda surfers
            </h1>
            <p class="text-2xl w-[35rem]">
                Ekologická hra, šířící povědomí o ochraně životního prostředí a
                udržitelnosti.
            </p>
            <a
                on:click={() => {
                    updateStoreValue("false");
                }}
                href="/#game"
                class="text-3xl text-white rounded-[3rem] bg-[#103a30] px-8 py-4 hover:bg-emerald-800 duration-500"
            >
                Zahrajte si!
            </a>
        </div>
        <div
            class="w-full flex items-center justify-center pt-12 h-[90vh] pb-16"
        >
            <CarModel bind:rotate={rotateModel} />
        </div>
    </div>
    <a href="/#game" class="flex justify-center">
        <svg class="arrows">
            <path class="a1" d="M0 0 L30 32 L60 0" />
            <path class="a2" d="M0 20 L30 52 L60 20" />
            <path class="a3" d="M0 40 L30 72 L60 40" />
        </svg>
    </a>
</section>
<section id="game" class="h-screen mt-52 flex items-center justify-evenly mb-12">
    <div
        class="h-[85vh] w-4/5 mx-12 flex justify-center items-center"
        bind:clientWidth={width}
        id="gameContainer"
    >
        <Scene
            on:score={(event) => (currentScore = event.detail)}
            on:gameOver={(e) => (gameOver = e.detail)}
            {paused}
        />
    </div>
    <div
        class="h-[83vh] w-1/5 bg-zinc-200 mr-12 shadow-2xl rounded-3xl pb-16 pt-8 px-8 flex items-center flex-col"
    >
        {#if data.user}
            <div class="flex flex-col items-center mt-3">
                <h1 class="text-lg text-zinc-600">Current Score: </h1>
                <h1 class="text-emerald-900 text-5xl mb-4">{currentScore}</h1>
                <h1 class="text-lg text-zinc-500">All time score: <span class="text-zinc-600">{data.gameData.score}</span></h1>
            </div>
            <hr class="h-[2px] -px-8 bg-gray-900 w-full my-5">
            <form method="POST" on:submit={handleCar} class="flex flex-col w-full px-8 mt-4 gap-2">
                <div class="flex flex-row">
                    <p class="font-semibold text-xl text-zinc-700 -ml-4 mb-3">Auta:</p>
                    <h2 class="text-gray-600 underline font-semibold text-lg flex justify-end w-full mb-5"><span class="text-green-800">{data.gameData.money + money}</span>$</h2>
                </div>
                <div class="">
                    <input type="checkbox" id="car1" value="" class="hidden peer" disabled checked>
                    <label for="car1" class="inline-flex items-center justify-between w-full px-5 py-3 text-gray-600 bg-white border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-blue-600 peer-checked:bg-blue-200 hover:text-gray-600 peer-checked:text-gray-600 hover:bg-gray-50">
                        <div class="block">
                            <div class="w-full text-lg font-semibold">Gay Car</div>
                            <div class="w-full text-sm">Slow and inefficient. Make your way to better cars.</div>
                            <div class="text-lg mt-2 text-green-700">1 000 000$</div>
                        </div>
                    </label>
                </div>
                <div>
                    <input
                        type="checkbox"
                        name="car2"
                        class="hidden peer"
                        checked={data.gameData.cars.includes("car2")}
                        disabled={data.gameData.cars.includes("car2")}
                    />
                    <label class="inline-flex items-center justify-between w-full px-5 py-3 text-gray-600 bg-white border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-blue-600 peer-checked:bg-blue-200 hover:text-gray-600 peer-checked:text-gray-600 hover:bg-gray-50" for="car2">
                        <div class="block">
                            <div class="w-full text-lg font-semibold">Toyota</div>
                            <div class="w-full text-sm">You a fart smella</div>
                            <div class="text-lg mt-2 text-green-700">2 000 000$</div>
                        </div>
                    </label>
                </div>
                <div>
                    <input
                        type="checkbox"
                        name="car3"
                        class="hidden peer"
                        checked={data.gameData.cars.includes("car3")}
                        disabled={data.gameData.cars.includes("car3")}
                    />
                    <label class="inline-flex items-center justify-between w-full px-5 py-3 text-gray-600 bg-white border-2 border-gray-200 rounded-lg cursor-pointer peer-checked:border-blue-600 peer-checked:bg-blue-200 hover:text-gray-600 peer-checked:text-gray-600 hover:bg-gray-50" for="car3">
                        <div class="block">
                            <div class="w-full text-lg font-semibold">Nigga racer</div>
                            <div class="w-full text-sm">Goood motherfuckin' theemmmmmm</div>
                            <div class="text-lg mt-2 text-green-700">4 000 000$</div>
                        </div>
                    </label>
                </div>
                <button
                    type="submit"
                    class="text-2xl text-white rounded-[3rem] bg-[#103a30] px-6 py-3 hover:bg-emerald-800 duration-500 mt-8 mx-2"
                    >Buy Cars</button
                >
            </form>
        {:else}
            <h1 class="font-semibold text-32xl">Pro zobrazení dat se musíte přihlásit</h1>
        {/if}
    </div>
</section>

<style>
    .arrows {
        width: 60px;
        height: 72px;
        left: 50%;
        margin-left: -30px;
        bottom: 20px;
    }

    .arrows path {
        stroke: #0e3a2f;
        fill: transparent;
        stroke-width: 2px;
        animation: arrow 2s infinite;
        -webkit-animation: arrow 2s infinite;
    }

    @keyframes arrow {
        0% {
            opacity: 0;
        }
        40% {
            opacity: 1;
        }
        80% {
            opacity: 0;
        }
        100% {
            opacity: 0;
        }
    }

    @-webkit-keyframes arrow /*Safari and Chrome*/ {
        0% {
            opacity: 0;
        }
        40% {
            opacity: 1;
        }
        80% {
            opacity: 0;
        }
        100% {
            opacity: 0;
        }
    }

    .arrows path.a1 {
        animation-delay: -1s;
        -webkit-animation-delay: -1s; /* Safari 和 Chrome */
    }

    .arrows path.a2 {
        animation-delay: -0.5s;
        -webkit-animation-delay: -0.5s; /* Safari 和 Chrome */
    }

    .arrows path.a3 {
        animation-delay: 0s;
        -webkit-animation-delay: 0s; /* Safari 和 Chrome */
    }
</style>
