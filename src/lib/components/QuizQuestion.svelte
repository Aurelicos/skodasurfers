<script lang="ts">
    import Questions from "../questions/questions.json"
    import {createEventDispatcher} from "svelte";

    function randomQuestion() {
        let randomNum:number = Math.floor(Math.random() * Questions.questions.length);
        return {
            question: Questions.questions[randomNum].question,
            correct: Questions.questions[randomNum].correct_answer,
            wrong: Questions.questions[randomNum].wrong_answers[0],
            answered: "",
            first: Questions.questions[randomNum].wrong_answers[0],
            second: Questions.questions[randomNum].correct_answer,
        };
    }

    const dispatch = createEventDispatcher();

    const sleep = (milliseconds: number) => {
        return new Promise(resolve => setTimeout(resolve, milliseconds))
    }

    async function handleSubmit() {
        if (question.answered === question.correct) {
            correct = false;
            revealCorrect = true;
            await sleep(1500);
            question = randomQuestion();
            dispatch("correct", correct);
        } else {
            await handleFail();
        }
    }

    async function handleFail() {
        failed = false;
        revealCorrect = false;
        await sleep(1500);
        question = randomQuestion();
        dispatch("failed", failed);
    }

    function changeAnswered(answered:string):void {
        question.answered = answered;
    }

    export let closed: boolean;

    let failed = true;
    let correct = true;
    let revealCorrect:boolean;

    let question = randomQuestion();
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="main fixed w-full h-screen top-0 bg-black bg-opacity-40 z-50 {closed
        ? 'hidden'
        : 'flex'} justify-center items-center">
    <div class="h-[65%] w-[50%] flex flex-col border-[3px] border-[#103a30] rounded-3xl px-32 py-14 {revealCorrect ? 'bg-emerald-400' : (revealCorrect === false ? 'bg-red-400' : 'bg-[#f3f3f3]')} ">
        <div class="w-full h-full flex-col flex items-center justify-center gap-6">
            <h1 class="text-3xl font-semibold text-center">{question.question}</h1>
            <div class="px-6 py-12 w-full grid grid-cols-2 gap-8">
                <button on:click={() => {changeAnswered(question.first)}} class="transition-all ease-in-out delay-100 hover:-translate-y-1 hover:scale-105 shadow-none duration-300  hover:shadow-2xl text-xl rounded-xl flex items-center justify-center py-8 px-5 bg-white {question.first === question.answered ? 'border-4 border-blue-500' : ''} ">{question.first}</button>
                <button on:click={() => {changeAnswered(question.second)}} class="transition-all ease-in-out delay-100 hover:-translate-y-1 hover:scale-105 shadow-none duration-300  hover:shadow-2xl text-xl rounded-xl flex items-center justify-center py-8 px-5 bg-white {question.second === question.answered ? 'border-4 border-blue-500' : ''} ">{question.second}</button>
            </div>
        </div>
        <div>
            <div class="flex flex-row h-full gap-6 w-full justify-end items-center">
                <button on:click={() => {handleFail()}} class="text-xl rounded-[3rem] bg-zinc-200 px-8 py-3 hover:bg-zinc-300 border-zinc-300 border-2 hover:text-black duration-500">
                    Vzdát se
                </button>
                {#if question.answered !== ""}
                    <button on:click={() => {handleSubmit()}} class="text-xl text-black rounded-[3rem] bg-emerald-200 px-12 py-5 hover:bg-emerald-300 duration-500">
                        Odpovědět
                    </button>
                {:else}
                    <button class="text-xl text-black rounded-[3rem] bg-zinc-500 px-6 cursor-not-allowed py-4">
                        Napřed odpovězte
                    </button>
                {/if}
            </div>
        </div>
    </div>
</div>