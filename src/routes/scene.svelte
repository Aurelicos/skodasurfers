<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import * as THREE from "three";
    import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
    import { gameControl } from "./store";

    const dispatch = createEventDispatcher();

    let score = 0,
        gameSpeed = 1,
        framesSinceLastSpawn = 0,
        playerLifeCount = 1,
        gameOver = false;

    $: dispatch("score", score);
    $: dispatch("gameOver", gameOver);

    onMount(() => {
        const treeModelPaths = ["./tree11.glb", "./tree12.glb", "./tree13.glb"];
        const groundModelPath = "./Road5.glb";
        const carModelPath = "./Car.glb";
        const propsModelPaths = [
            "./Prop1.glb",
            "./Prop2.glb",
            "./Prop3.glb",
            "./Prop4.glb",
        ];
        const scene = new THREE.Scene();
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const hemisphereLight = new THREE.HemisphereLight(
            0xffffff,
            0x000000,
            1
        );
        hemisphereLight.position.set(0, 1, 0);
        scene.add(hemisphereLight);
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        const renderer = new THREE.WebGLRenderer();

        const gameContainer: any = document.getElementById("gameContainer");
        renderer.setSize(
            gameContainer.clientWidth,
            (gameContainer.clientWidth / 16) * 9
        );

        renderer.setClearColor(0xb2ffff);
        gameContainer.appendChild(renderer.domElement);

        const loader = new GLTFLoader();
        const planeGeometry = new THREE.PlaneGeometry(1000, 1000);

        const planeMaterial = new THREE.MeshPhongMaterial({
            color: 0x228b22,
            side: THREE.DoubleSide,
        });

        const plane = new THREE.Mesh(planeGeometry, planeMaterial);

        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -3;

        scene.add(plane);

        let playerCar: any;

        camera.position.z = 8;
        camera.position.y = 3;
        camera.rotation.x = -Math.PI / 4;
        camera.lookAt(new THREE.Vector3(0, 1, 0));

        const maxTrees = 30;
        const spawnDistance = 2;
        let lastSpawnZ = -spawnDistance;
        const numSegments = 25;
        const roadSegmentLength = 100;

        let groundInstances: THREE.Group<THREE.Object3DEventMap>[] = [];

        const maxGroundSegments = 25;
        const initialGroundPosition = -roadSegmentLength * numSegments;

        let Props: {}[] = [];
        let Trees: any[] = [];
        let Grounds: THREE.Group<THREE.Object3DEventMap>[] = [];
        const lanes = [-1.9, 0, 1.9];
        spawnPlayerCar();

        function loadTreeModel(modelPath: string) {
            return new Promise((resolve, reject) => {
                const loader = new GLTFLoader();
                loader.load(
                    modelPath,
                    (gltf) => {
                        resolve(gltf.scene);
                    },
                    undefined,
                    (error) => {
                        reject(error);
                    }
                );
            });
        }

        function loadCarModel(modelPath: string) {
            return new Promise((resolve, reject) => {
                const loader = new GLTFLoader();
                loader.load(
                    modelPath,
                    (gltf) => {
                        resolve(gltf.scene);
                    },
                    undefined,
                    (error) => {
                        reject(error);
                    }
                );
            });
        }

        function loadPropModel(modelPath: string) {
            return new Promise((resolve, reject) => {
                const loader = new GLTFLoader();
                loader.load(
                    modelPath,
                    (gltf) => {
                        resolve(gltf.scene);
                    },
                    undefined,
                    (error) => {
                        reject(error);
                    }
                );
            });
        }

        function spawnProp() {
            const propTypes = ["prop1", "prop2", "prop3", "prop4"];
            const selectedTypeIndex = Math.floor(
                Math.random() * propTypes.length
            );
            const selectedType = propTypes[selectedTypeIndex];

            let prop: any;

            switch (selectedType) {
                case "prop1":
                    loadPropModel(propsModelPaths[0])
                        .then((gltf) => {
                            prop = gltf;

                            prop.dimensions = getDimensions(prop);

                            if (prop) {
                                const lane =
                                    lanes[
                                        Math.floor(Math.random() * lanes.length)
                                    ];
                                prop.position.set(lane, 0, -100);
                                prop.scale.set(0.8, 0.8, 0.8);
                                prop.rotation.y = Math.PI / 2;
                                Props.push(prop);

                                scene.add(prop);
                            }
                        })
                        .catch((error) => {
                            console.error("Error loading prop1 model:", error);
                        });
                    break;
                case "prop3":
                    loadPropModel(propsModelPaths[2])
                        .then((gltf) => {
                            prop = gltf;

                            prop.dimensions = getDimensions(prop);

                            if (prop) {
                                const lane =
                                    lanes[
                                        Math.floor(Math.random() * lanes.length)
                                    ];
                                prop.position.set(lane, -0.5, -100);
                                prop.scale.set(0.2, 0.2, 0.2);
                                prop.rotation.y =
                                    Math.PI * 0.0833 +
                                    Math.PI / 4 -
                                    Math.PI / 2;
                                Props.push(prop);

                                scene.add(prop);
                            }
                        })
                        .catch((error) => {
                            console.error("Error loading prop3 model:", error);
                        });
                    break;
                case "prop4":
                    loadPropModel(propsModelPaths[3])
                        .then((gltf) => {
                            prop = gltf;

                            prop.dimensions = getDimensions(prop);

                            if (prop) {
                                const lane =
                                    lanes[
                                        Math.floor(Math.random() * lanes.length)
                                    ];
                                prop.position.set(lane, -1.7, -100);
                                Props.push(prop);

                                scene.add(prop);
                            }
                        })
                        .catch((error) => {
                            console.error("Error loading prop4 model:", error);
                        });
                    break;
            }
        }

        function switchLane(newLane: number) {
            const currentLane = lanes.indexOf(playerCar.position.x);
            if (currentLane === newLane) return;

            isMoving = true;
            const laneWidth = lanes[newLane] - lanes[currentLane];
            const startTime = performance.now();
            const laneSwitchDuration = 200;

            function updatePosition(timestamp: number) {
                const elapsedTime = timestamp - startTime;
                if (elapsedTime >= laneSwitchDuration) {
                    playerCar.position.x = lanes[newLane];
                    isMoving = false;
                } else {
                    const t = elapsedTime / laneSwitchDuration;
                    playerCar.position.x = lanes[currentLane] + laneWidth * t;
                    requestAnimationFrame(updatePosition);
                }
            }

            requestAnimationFrame(updatePosition);
        }

        function spawnPlayerCar() {
            loadCarModel(carModelPath)
                .then((car) => {
                    playerCar = car;
                    playerCar.dimensions = getDimensions(playerCar);
                    playerCar.position.set(0, 1.1, 3);
                    playerCar.scale.set(0.4, 0.4, 0.4);
                    playerCar.rotation.y = -(Math.PI / 2);

                    scene.add(playerCar);
                })
                .catch((error) => {
                    console.error("Error spawning player car:", error);
                });
        }

        function spawnTree() {
            if (Trees.length < maxTrees) {
                if (loadedTreeModels.length > 0) {
                    for (let i = 0; i < 4; i++) {
                        let randomModelIndex = Math.floor(
                            Math.random() * loadedTreeModels.length
                        );
                        let tree = loadedTreeModels[randomModelIndex].clone();

                        const xPos = Math.random() > 0.5 ? -2 : 2;
                        const zPos = lastSpawnZ - spawnDistance - 40;

                        tree.traverse((child: { isMesh: any }) => {
                            if (child.isMesh) {
                            }
                        });

                        tree.position.set(xPos, 2, zPos);
                        tree.scale.set(0.3, 0.3, 0.3);

                        scene.add(tree);
                        Trees.push(tree);
                        lastSpawnZ = zPos;
                    }
                }
            }
        }

        function spawnGround(groundModelPath: string) {
            if (groundInstances.length >= maxGroundSegments) {
                const oldestGround: any = groundInstances.shift();
                oldestGround.position.z =
                    initialGroundPosition - roadSegmentLength;
                groundInstances.push(oldestGround);
            } else {
                loader.load(
                    groundModelPath,
                    (gltf) => {
                        const ground = gltf.scene.clone();

                        ground.position.set(-8.38, -3, -10000);

                        ground.scale.set(1.4, 1.4, 1);
                        Grounds.push(ground);
                        console.log(ground.position);
                        scene.add(ground);

                        groundInstances.push(ground);
                    },
                    undefined,
                    (error) => {
                        console.error(
                            "Error occurred while spawning ground: ",
                            error
                        );
                    }
                );
            }
        }
        let loadedTreeModels: string | any[] = [];

        let Treespeed = 0.025;
        spawnGround(groundModelPath);

        const modelPromises = treeModelPaths.map((modelPath) =>
            loadTreeModel(modelPath)
        );

        Promise.all(modelPromises)
            .then((loadedModels) => {
                loadedTreeModels = loadedModels;

                spawnTree();
            })
            .catch((error) => {
                console.error("Error loading models:", error);
            });

        let isMoving = false;
        let targetLane = 0;
        const laneSwitchDuration = 500;

        window.onkeydown = function (event) {
            if (!isMoving) {
                let laneIdx = lanes.indexOf(playerCar.position.x);

                if (event.code == "ArrowRight" && laneIdx < lanes.length - 1) {
                    targetLane = laneIdx + 1;
                    switchLane(targetLane);
                } else if (event.code == "ArrowLeft" && laneIdx > 0) {
                    targetLane = laneIdx - 1;
                    switchLane(targetLane);
                }
            }
        };

        const gameSpeedLevels = [
            { score: 0, speed: 0.1 }, // Level 1
            { score: 5, speed: 0.2 }, // Level 2
            { score: 10, speed: 0.3 }, // Level 3
            { score: 20, speed: 0.4 }, // Level 4
            { score: 30, speed: 0.5 }, // Level 5
            { score: 50, speed: 0.6 }, // Level 6
            { score: 70, speed: 0.7 }, // Level 7
            { score: 100, speed: 0.8 }, // Level 8
            { score: 150, speed: 0.9 }, // Level 9
            { score: 200, speed: 1.0 }, // Level 10
        ];

        setInterval(function () {
            if (!gameOver) {
                score++;
                updateGameSpeed(score);
            }
        }, 1000);

        function collisionCheck(
            object1: THREE.Object3D<THREE.Object3DEventMap>,
            object2: THREE.Object3D<THREE.Object3DEventMap>
        ) {
            const box1 = new THREE.Box3().setFromObject(object1);

            const box2 = new THREE.Box3().setFromObject(object2);

            return box1.intersectsBox(box2);
        }

        function getDimensions(object3D: any) {
            var box3 = new THREE.Box3();

            box3.setFromObject(object3D);
            var size = box3.getSize(new THREE.Vector3());

            return {
                width: size.x,
                height: size.y,
                depth: size.z,
            };
        }

        function updateGameSpeed(score: number) {
            for (let i = gameSpeedLevels.length - 1; i >= 0; i--) {
                if (score >= gameSpeedLevels[i].score) {
                    gameSpeed = gameSpeedLevels[i].speed;
                    break;
                }
            }
        }

        function gameLogic() {
            framesSinceLastSpawn++;
            if (framesSinceLastSpawn > Math.round(60 / gameSpeed)) {
                spawnProp();
                framesSinceLastSpawn = 0;
            }

            for (let ground of groundInstances) {
                ground.position.z += gameSpeed;
                if (ground.position.z > roadSegmentLength * numSegments) {
                    scene.remove(ground);
                    Grounds.splice(Grounds.indexOf(ground), 1);
                    spawnGround(groundModelPath);
                }
            }

            for (let i = Trees.length - 1; i >= 0; i--) {
                let tree = Trees[i];
                tree.position.z += Treespeed;
                if (tree.position.z > 10) {
                    scene.remove(tree);
                    Trees.splice(i, 1);
                    spawnTree();
                }
            }

            for (let car of Props) {
                if (car) {
                    if ((car as any).position.z > 12) {
                        scene.remove(car as any);
                        Props.splice(Props.indexOf(car), 1);
                    } else {
                        (car as any).position.z += gameSpeed;

                        if (
                            playerCar &&
                            collisionCheck(playerCar, car as any)
                        ) {
                            console.log("Collision Detected");
                            playerLifeCount--;
                            if (playerLifeCount === 0) {
                                gameOver = true;
                                //location.reload();
                            }
                        }
                    }
                } else {
                    console.log("Car object is undefined.");
                }
            }
        }

        function animate() {
            if (!gameOver) {
                requestAnimationFrame(animate);
                gameLogic();
                renderer.render(scene, camera);
            }
        }

        spawnGround(groundModelPath);
        animate();
    });

    $: if ($gameControl.restart) {
        location.reload();
    }
</script>
