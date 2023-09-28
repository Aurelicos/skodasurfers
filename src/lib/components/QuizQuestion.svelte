<script lang="ts">
    import Questions from "../questions/questions.json"
    import {createEventDispatcher} from "svelte";

    function randomQuestion() {
        let randomNum:number = Math.floor(Math.random() * Questions.questions.length);
        return Questions.questions[randomNum];
    }

    const dispatch = createEventDispatcher();


    function handleClose() {
        closed = true;
        dispatch("close", closed);
    }

    function handleFail():void {
        closedQuiz = false;
        dispatch("login", closedQuiz)
    }

    export let closed: boolean;

    let closedQuiz = false;

    let question = randomQuestion();

    let rightAnswer = false;
    let wrongAnswer = false;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
        class="main fixed w-full h-screen top-0 bg-black bg-opacity-40 z-50 {closedQuiz
        ? 'hidden'
        : 'flex'} justify-center items-center"
        on:click={(e) => {
        // @ts-ignore
        if (e.target.className?.includes("main")) handleFail();}}>

    <div class="h-[65%] w-[50%] bg-[#f3f3f3] flex flex-col border-[3px] border-[#103a30] rounded-3xl px-32 py-14">
        <div class="w-full h-full flex-col flex items-center justify-center gap-6">
            <h1 class="text-3xl font-semibold text-center">{question.question}</h1>
            <div class="px-6 py-12 w-full grid grid-cols-2 gap-8">
                <button class="border-[2px] transition-all ease-in-out delay-100 hover:-translate-y-1 hover:scale-110 shadow-none duration-300  hover:shadow-2xl text-xl rounded-xl border-zinc-700 flex items-center justify-center p-2 bg-white">{question.correct_answer}</button>
                <button class="border-[2px] transition-all ease-in-out delay-100 hover:-translate-y-1 hover:scale-110 shadow-none duration-300  hover:shadow-2xl text-xl rounded-xl border-zinc-700 flex items-center justify-center p-2 bg-white">{question.correct_answer}</button>
            </div>
        </div>
        <div>
            <div class="flex flex-row gap-6 w-full justify-end">
                <button on:click={() => {handleFail}} class="text-xl rounded-3xl border-2 border-zinc-500 bg-zinc-200 px-3 py-2 hover:bg-zinc-300 hover:text-black duration-500">
                    Vzdát se
                </button>
                {#if wrongAnswer || rightAnswer}
                    <button class="text-lg text-black rounded-3xl bg-emerald-300 px-3 py-1 hover:bg-emerald-200 duration-500 shadow-none hover:shadow-md hover:shadow-emerald-700">
                        Odpovědět
                    </button>
                {:else}
                    <button class="text-lg cursor-not-allowed text-black rounded-3xl bg-emerald-300 px-3 py-1 hover:bg-emerald-200 duration-500 shadow-none hover:shadow-md hover:shadow-emerald-700">
                        Nemůžete odpovědět
                    </button>
                {/if}
            </div>
        </div>
    </div>
</div>