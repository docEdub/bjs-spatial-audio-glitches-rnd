export

//#region Playground copy/paste code ...

class Playground {
    public static CreateScene(engine: BABYLON.Engine, canvas: HTMLCanvasElement): BABYLON.Scene {

        //#region Scene setup

        // This creates a basic Babylon Scene object (non-mesh).
        const scene = new BABYLON.Scene(engine);

        // This creates and positions a free camera (non-mesh).
        const camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3(0, 2, 0), scene);

        // This attaches the camera to the canvas.
        camera.attachControl(canvas, true);

        const w = 87;
        const a = 65;
        const s = 83;
        const d = 68;
        camera.keysUp.push(w);
        camera.keysLeft.push(a);
        camera.keysDown.push(s);
        camera.keysRight.push(d);
        camera.speed = 0.5;

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

        // Default intensity is 1. Let's dim the light a small amount.
        light.intensity = 0.7;

        const groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
        groundMaterial.alpha = 0.5;
        groundMaterial.backFaceCulling = false;
        
        // Our built-in 'ground' shape. Params: name, options, scene.
        const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 100, height: 100}, scene);
        ground.material = groundMaterial;

        // Root transform for all other meshes.
        const rootTransform = new BABYLON.TransformNode("rootTransform", scene);

        // Our built-in 'sphere' shape. Params: name, options, scene.
        const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 0.5, segments: 32}, scene);
        sphere.parent = rootTransform;
        sphere.position.y = camera.position.y;
        sphere.position.z = 10;

        // Create the root transform animation.
        (() => {
            const animation = new BABYLON.Animation(
                "rootTransform.rotation.y.animation",
                "rotation.y",
                250,
                BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
            );
            const keys = new Array();
            keys.push({ frame: 0, value: 0 });
            keys.push({ frame: 1000, value: 2 * Math.PI });
            animation.setKeys(keys);
            rootTransform.animations = new Array();
            rootTransform.animations.push(animation);
        })();
        // scene.beginAnimation(rootTransform, 0, 1000, true);

        (() => {
            const animation = new BABYLON.Animation(
                "camera.rotation.y.animation",
                "rotation.y",
                4000,
                BABYLON.Animation.ANIMATIONTYPE_FLOAT,
                BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
            );
            const keys = new Array();
            keys.push({ frame: 0, value: 0 });
            keys.push({ frame: 1000, value: -0.5 * Math.PI });
            keys.push({ frame: 2000, value: 0 });
            keys.push({ frame: 3000, value: 0.5 * Math.PI });
            keys.push({ frame: 4000, value: 0 });
            animation.setKeys(keys);
            camera.animations = new Array();
            camera.animations.push(animation);
        })();
        scene.beginAnimation(camera, 0, 4000, true);

        //#endregion

        //#region Audio setup

        scene.audioPositioningRefreshRate = 1; // ms

        const audioEngine = BABYLON.Engine.audioEngine!;
        const audioContext = audioEngine.audioContext!;

        console.log(`\naudioContext: {\n  sampleRate: ${audioContext.sampleRate},\n  baseLatency: ${audioContext.baseLatency},\n  outputLatency: ${audioContext.outputLatency}\n}`);

        audioEngine.lock();

        const soundArray = new Float32Array(audioContext.sampleRate / 440);
        for (let i = 0; i < soundArray.length; i++) {
            // soundArray[i] = Math.sin((i / soundArray.length) * 2 * Math.PI) // sine wave
            // soundArray[i] = i < soundArray.length / 2 ? 1 : -1; // square wave
            soundArray[i] = 1; // dc offset = 1
        }

        const soundBuffer = new AudioBuffer({
            length: soundArray.length,
            sampleRate: audioContext.sampleRate
        });
        soundBuffer.copyToChannel(soundArray, 0);

        const sound = new BABYLON.Sound("sound", soundBuffer, scene, null, {
            autoplay: true,
            loop: true,
            spatialSound: true,
            volume: 1
        });
        sound.attachToMesh(sphere);

        //#endregion

        //#region GUI

        const initGui = () => {
            let canvasZone = document.getElementById("canvasZone")!;
            canvasZone.style.position = "relative";

            const previousGuis = canvasZone.getElementsByClassName("dg main");
            for (let i = 0; i < previousGuis.length; i++) {
                canvasZone.removeChild(previousGuis[i]);
            }

            const gui = new dat.GUI({ autoPlace: false });
            canvasZone.appendChild(gui.domElement);
            gui.domElement.style.position = "absolute";
            gui.domElement.style.top = "0";
            gui.domElement.style.right = "0";

            // Hack to force dat.gui to use floats for the gui instead of integers.
            // NB: The gui rounds the text off to the nearest step value given in the `add` functions.
            // camera.position.x += 0.0001;
            // camera.position.y += 0.0001;
            // camera.position.z += 0.0001;

            const sceneGui = gui.addFolder("scene");
            // cameraGui.add(camera.position, "x", -10, 10, 0.01);
            // cameraGui.add(camera.position, "y", -10, 10, 0.01);
            // cameraGui.add(camera.position, "z", -50, -5, 0.01);
            sceneGui.add(scene, "audioPositioningRefreshRate", 1, 500, 1);
            sceneGui.open();
        }
        if (document.getElementById("datGuiScript")) {
            initGui();
        } else {
            const datGuiScript = document.createElement<"script">("script");
            datGuiScript.id = "datGuiScript";
            datGuiScript.src = "https://cdnjs.cloudflare.com/ajax/libs/dat-gui/0.7.9/dat.gui.min.js";
            datGuiScript.onload = () => {
                initGui();
            };
            document.body.appendChild(datGuiScript);
        }

        //#endregion

        return scene;
    }
}

declare const dat: any;

//#endregion
