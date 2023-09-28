<script lang="ts">
    import { onMount } from "svelte";
    import * as THREE from "three";
    import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
    import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
    import { tweened } from "svelte/motion";
    import { cubicOut } from "svelte/easing";

    export let rotate;

    let container: HTMLDivElement;
    let scene: THREE.Scene,
        camera: THREE.PerspectiveCamera,
        renderer: THREE.WebGLRenderer;
    let model: THREE.Object3D;
    let loadingError: any;
    let controls: OrbitControls;
    let initialRotation = (Math.PI / 2) * 3;
    let wrapper: THREE.Object3D;
    let rotationY = tweened(initialRotation, {
        duration: 1000,
        easing: cubicOut,
    });

    onMount(() => {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
        directionalLight.position.set(0, 1, 0);
        scene.add(directionalLight);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.maxPolarAngle = Math.PI / 2;
        controls.minPolarAngle = Math.PI / 2;

        const loader = new GLTFLoader();
        loader.load(
            "skoda_kamiq.glb",
            (gltf) => {
                model = gltf.scene;

                wrapper = new THREE.Object3D();
                scene.add(wrapper);
                wrapper.add(model);

                const box = new THREE.Box3().setFromObject(model);
                const center = box.getCenter(new THREE.Vector3());
                model.position.sub(center);

                controls.target.set(0, 0, 0);
                wrapper.rotation.y = initialRotation;
            },
            undefined,
            (error) => {
                loadingError = error;
                console.error("Error loading model:", error);
            }
        );

        camera.position.z = 350;

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            if (wrapper) wrapper.rotation.y = $rotationY;
            renderer.render(scene, camera);
        };
        animate();

        rotate = (deltaY: number) => {
            if (wrapper) {
                rotationY.update((v) => v + deltaY * 0.003);
            }
        };

        return () => {
            controls.dispose();
            renderer.dispose();
        };
    });
</script>

{#if loadingError}
    <p>Error loading model: {loadingError.message}</p>
{:else}
    <div
        bind:this={container}
        class="w-full h-[90vh] overflow-hidden relative"
    />
{/if}
