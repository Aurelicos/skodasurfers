<script lang="ts">
    import CarModel from "$lib/components/CarModel.svelte";
    import { onMount } from "svelte";
    import { exportedValue } from "$lib/stores/store";
    import type { PageData } from "./$types";

    let rotateModel: any;
    let scrollY: any;

    // export let data: PageData;

    onMount(() => {
        const handleScroll = (event: WheelEvent) => {
            if (scrollY === 0) return;
            if (rotateModel) {
                rotateModel(event.deltaY);
            }
        };
        window.addEventListener("wheel", handleScroll);
        return () => {
            window.removeEventListener("wheel", handleScroll);
        };
    });

    let closedOnButton = "true";

    function updateStoreValue() {
        exportedValue.set(closedOnButton);
    }

    onMount(updateStoreValue);
</script>

<svelte:window bind:scrollY />

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
                    (closedOnButton = "false"), updateStoreValue();
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
    <div class="h-full w-4/5 bg-black mx-12" />
    <div class="h-full w-1/5 bg-slate-300 mr-12 rounded-3xl py-8 px-8">
        <h1>Score:</h1>
        <h2>Money:</h2>
        <div class="flex flex-col">
            <p>cars:</p>
            <div>
                <input type="checkbox" name="car1" /><label for="car1"
                    >auto1 - 2 000 000 Kč</label
                >
            </div>
            <div>
                <input type="checkbox" name="car2" /><label for="car2"
                    >auto1 - 8 000 000 Kč</label
                >
            </div>
            <div>
                <input type="checkbox" name="car3" /><label for="car3"
                    >auto1 - 12 000 000 Kč</label
                >
            </div>
        </div>
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
