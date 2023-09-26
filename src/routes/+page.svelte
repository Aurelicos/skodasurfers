<script>

</script>

<section class="h-[84vh]">
    <div class="grid grid-cols-2 h-full w-full pb-32">
        <div class="items-start justify-center flex flex-col pl-40 gap-8">
            <h1 class="text-9xl text-emerald-950 font-semibold ">lorem ipsum ipsum</h1>
            <p class="text-2xl w-[35rem]">Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime mollitia,
                molestiae</p>
        </div>
        <div class="w-full flex items-center justify-center pt-12">
            <img src="https://bluesky-cogcms-prodb.cdn.imgeng.in/media/0j4ax3kj/39818-caffyns-skoda-enyaq-coupe-new-car-page_cut-out_321x768.png" alt="cool car" />
        </div>
    </div>
    <div class="flex justify-center">
        <svg class="arrows">
            <path class="a1" d="M0 0 L30 32 L60 0"></path>
            <path class="a2" d="M0 20 L30 52 L60 20"></path>
            <path class="a3" d="M0 40 L30 72 L60 40"></path>
        </svg>
    </div>
</section>
<section class="h-screen mt-96">
    <div class="h-full w-full">
        <h1 class="text-8xl flex h-full items-center justify-center">hra</h1>
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

    @keyframes arrow
    {
        0% {opacity:0}
        40% {opacity:1}
        80% {opacity:0}
        100% {opacity:0}
    }

    @-webkit-keyframes arrow /*Safari and Chrome*/
    {
        0% {opacity:0}
        40% {opacity:1}
        80% {opacity:0}
        100% {opacity:0}
    }

    .arrows path.a1 {
        animation-delay:-1s;
        -webkit-animation-delay:-1s; /* Safari 和 Chrome */
    }

    .arrows path.a2 {
        animation-delay:-0.5s;
        -webkit-animation-delay:-0.5s; /* Safari 和 Chrome */
    }

    .arrows path.a3 {
        animation-delay:0s;
        -webkit-animation-delay:0s; /* Safari 和 Chrome */
    }
</style>