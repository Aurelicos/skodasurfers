<script lang="ts">
  import "../app.postcss";

  import {onDestroy, onMount} from "svelte";
  import { initFirebase } from "$lib/client/firebase";
  import ModalLogin from "$lib/components/ModalLogin.svelte";
  import ModalSignUp from "$lib/components/ModalSignUp.svelte";

  onMount(initFirebase);
  import { Toaster } from 'svelte-french-toast';

  let closed:boolean = true;
  let closed2:boolean = true;

  import { exportedValue } from '$lib/store';

  const unsubscribe = exportedValue.subscribe((value) => {
    if (value === "false") {
      closed = false;
    }
  });

  onDestroy(unsubscribe);
</script>
<Toaster />
<ModalLogin closed={closed} on:close={() => (closed = true)} on:register={() => {closed2 = false, closed = true}} />
<ModalSignUp closed={closed2} on:close={() => (closed2 = true)} on:login={() => {closed = false, closed2 = true}} />

<nav class="bg-[#103a30] text-white">
  <div
    class="max-w-screen-2xl flex flex-wrap items-center justify-between mx-auto p-4"
  >
    <div>
      <h1 class="uppercase font-semibold text-2xl">škoda surfers</h1>
    </div>
    <div class="flex flex-row gap-6">
      <button
        on:click={() => (closed = false)}
        class="text-lg rounded-3xl border-2 border-emerald-300 bg-emerald-700 px-3 py-1 hover:bg-emerald-300 hover:text-black duration-500"
      >
        Přihlásit
      </button>
      <button
        on:click={() => (closed2 = false)}
        class="text-lg text-black rounded-3xl bg-emerald-300 px-3 py-1 hover:bg-emerald-200 duration-500 shadow-none hover:shadow-md hover:shadow-emerald-700"
      >
        Registrovat
      </button>
    </div>
  </div>
</nav>
<body class="bg-[#f3f3f3]">
  <slot />
</body>
<footer class="bg-[#103a30] py-14 mt-32">
  <div class="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
    <span class="text-sm text-white sm:text-center">© 2023 <a href="https://www.ssps.cz/" class="hover:underline">SSPŠ™</a>. All Rights Reserved.
  </span>
    <ul class="flex flex-wrap items-center mt-3 text-sm font-medium text-white sm:mt-0 gap-6">
      <li>
        <a target="_blank" href="https://www.skoda-auto.com/" class="hover:underline">Škoda</a>
      </li>
      <li>
        <a target="_blank" href="https://www.ssps.cz/" class="hover:underline">SSPŠ</a>
      </li>
      <div class="inline-block h-[35px] min-h-[1em] w-0.5 self-stretch bg-neutral-100 opacity-100"></div>
      <li>
        <a href="/#game" class="hover:underline">Hra</a>
      </li>
      <li>
        <a href="/#hero" class="hover:underline">Nahoru</a>
      </li>
    </ul>
  </div>
</footer>