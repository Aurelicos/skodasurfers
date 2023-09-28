<script lang="ts">
    import Questions from "../questions/questions.json"
    import {createEventDispatcher} from "svelte";

    function randomQuestion() {
        let randomNum:number = Math.floor(Math.random() * Questions.questions.length);
        return Questions.questions[randomNum];
    }


    const dispatch = createEventDispatcher();

    export let failed = false;
    function handleFail() {
        failed = true;
        dispatch("failed", failed);
    }

    let closedQuiz = false;
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
        class="main fixed w-full h-screen top-0 bg-black bg-opacity-40 z-50 {!closedQuiz
        ? 'hidden'
        : 'flex'} justify-center items-center"
        on:click={(e) => {
        // @ts-ignore
        if (e.target.className?.includes("main")) handleFail();}}>

    <div class="h-[65%] w-[50%] bg-[#f3f3f3] border-[3px] border-[#103a30] rounded-3xl px-32 py-14">
        <h1 class="text-2xl font-semibold">{randomQuestion().question}</h1>
    </div>
</div>