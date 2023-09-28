<script lang="ts">
  import "../app.postcss";
  import { Toaster } from "svelte-french-toast";
  import { onDestroy, onMount } from "svelte";
  import { initFirebase } from "$lib/client/firebase";
  import ModalLogin from "$lib/components/ModalLogin.svelte";
  import ModalSignUp from "$lib/components/ModalSignUp.svelte";
  import { exportedValue } from "$lib/stores/store";
  import type { PageData } from "./$types";
  import { invalidateAll } from "$app/navigation";
  import { getAuth, signOut } from "firebase/auth";

  onMount(initFirebase);

  onMount(() => {
    const handleKeydown = (event: any) => {
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeydown);

    return () => {
      window.removeEventListener("keydown", handleKeydown);
    };
  });

  let closed: boolean = true;
  let closed2: boolean = true;

  export let data: PageData;
  const unsubscribe = exportedValue.subscribe((value) => {
    if (value === "false") {
      closed = false;
    }
  });

  onDestroy(unsubscribe);

  const logout = async () => {
    const firebaseAuth = getAuth();
    await signOut(firebaseAuth);
    await fetch("/logout", { method: "POST" });
    await invalidateAll();
  };
</script>

<Toaster />

<ModalLogin
  {closed}
  on:close={() => (closed = true)}
  on:register={() => {
    (closed2 = false), (closed = true);
  }}
/>
<ModalSignUp
  closed={closed2}
  on:close={() => (closed2 = true)}
  on:login={() => {
    (closed = false), (closed2 = true);
  }}
/>

<nav class="bg-[#103a30] text-white">
  <div
    class="max-w-screen-2xl flex flex-wrap items-center justify-between mx-auto p-4"
  >
    <div>
      <h1 class="uppercase font-semibold text-2xl">škoda surfers</h1>
    </div>
    {#if !data.user}
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
    {:else}
      <div class="flex flex-row items-center bg-emerald-900 rounded-3xl">
        <p class="pl-6 pr-4 text-lg">{data.user.name}</p>
        <button
          on:click={logout}
          class="text-lg rounded-3xl border-2 border-emerald-300 bg-emerald-700 px-3 py-1 hover:bg-emerald-300 hover:text-black duration-500"
        >
          Odhlásit
        </button>
      </div>
    {/if}
  </div>
</nav>
<body class="bg-[#f3f3f3]">
  <slot />
</body>
<footer class="bg-[#103a30] py-14">
  <div
    class="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between"
  >
    <span class="text-sm text-white sm:text-center"
      >© 2023 <a href="https://www.ssps.cz/" class="hover:underline">SSPŠ™</a>.
      All Rights Reserved.
    </span>
    <ul
      class="flex flex-wrap items-center mt-3 text-sm font-medium text-white sm:mt-0 gap-6"
    >
      <li>
        <a
          target="_blank"
          href="https://www.skoda-auto.com/"
          class="hover:underline">Škoda</a
        >
      </li>
      <li>
        <a target="_blank" href="https://www.ssps.cz/" class="hover:underline"
          >SSPŠ</a
        >
      </li>
      <div
        class="inline-block h-[35px] min-h-[1em] w-0.5 self-stretch bg-neutral-100 opacity-100"
      />
      <li>
        <a href="/#game" class="hover:underline">Hra</a>
      </li>
      <li>
        <a href="/#hero" class="hover:underline">Nahoru</a>
      </li>
    </ul>
  </div>
</footer>
