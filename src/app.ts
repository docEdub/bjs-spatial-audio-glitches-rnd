import { Playground } from "./playground";

(() => {
    const canvas = <HTMLCanvasElement> document.getElementById("renderCanvas");
    const engine = new BABYLON.Engine(canvas, true, {
        audioEngine: true,
        audioEngineOptions: {
            audioContext: new AudioContext({
                latencyHint: "playback",
            })
        }
    });
    const scene = Playground.CreateScene(engine, canvas);

    window.addEventListener('resize', () => {
        engine.resize();
    });

    engine.runRenderLoop(() => {
       scene.render(true);
    });
})();
