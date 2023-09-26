<script lang="ts">
  import "../app.postcss";
</script>

<nav class="bg-emerald-800 text-white">
  <div class="max-w-screen-2xl flex flex-wrap items-center justify-between mx-auto p-4">
      <div>
        <h1 class="uppercase font-semibold text-2xl">škoda surfers</h1>
      </div>
      <div class="flex flex-row gap-8">
        <button class="text-lg rounded-3xl border-2 border-emerald-300 bg-emerald-700 px-3 py-1 hover:bg-emerald-300 hover:text-black duration-500">
          Přihlásit
        </button>
        <button class="text-lg text-black rounded-3xl bg-emerald-300 px-3 py-1 hover:bg-emerald-200 duration-500">
          Registrovat
        </button>
      </div>
  </div>
</nav>
<slot />
<footer>

</footer>