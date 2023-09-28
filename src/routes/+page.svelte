<script lang="ts">
    import CarModel from "$lib/components/CarModel.svelte";
    import { onMount } from "svelte";
    import { exportedValue } from "$lib/stores/store";
    import Scene from "./scene.svelte";
    import type { PageData } from "./$types";
    import { invalidateAll } from "$app/navigation";
    import { gameControl } from "./store";
    import toast from "svelte-french-toast";

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
            gameOver = false
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
</script>

<svelte:window bind:scrollY />

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
<section id="game" class="h-screen mt-52 flex justify-evenly mb-12">
    <div
        class="h-full w-4/5 mx-12 flex justify-center items-center"
        bind:clientWidth={width}
        id="gameContainer"
    >
        <Scene
            on:score={(event) => (currentScore = event.detail)}
            on:gameOver={(e) => (gameOver = e.detail)}
        />
    </div>
    <div
        class="h-full w-1/5 bg-slate-300 mr-12 rounded-3xl py-8 px-8 flex justify-center items-center flex-col"
    >
        {#if data.user}
            <h1>Alltime score: {data.gameData.score}</h1>
            <h1>Current Score: {currentScore}</h1>
            <h2>Money: {data.gameData.money + money}</h2>
            <form method="POST" on:submit={handleCar} class="flex flex-col">
                <p>cars:</p>
                <div>
                    <input type="checkbox" name="car1" checked disabled /><label
                        for="car1">auto1 - 2 000 000 Kč</label
                    >
                </div>
                <div>
                    <input
                        type="checkbox"
                        name="car2"
                        checked={data.gameData.cars.includes("car2")}
                        disabled={data.gameData.cars.includes("car2")}
                    /><label for="car2">auto1 - 3 000 000 Kč</label>
                </div>
                <div>
                    <input
                        type="checkbox"
                        name="car3"
                        checked={data.gameData.cars.includes("car3")}
                        disabled={data.gameData.cars.includes("car3")}
                    /><label for="car3">auto1 - 4 000 000 Kč</label>
                </div>
                <button
                    type="submit"
                    class="bg-green-600 px-10 py-4 rounded-lg hover:bg-green-800"
                    >Buy Cars</button
                >
            </form>
        {:else}
            <h1>Pro zobrazení dat se musíte přihlásit</h1>
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
