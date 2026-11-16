// Mackenzie Carey

var canvas = document.getElementById("renderCanvas");

var startRenderLoop = function (engine, canvas) {
    engine.runRenderLoop(function () {
        if (sceneToRender && sceneToRender.activeCamera) {
            sceneToRender.render();
        }
    });
}

var engine = null;
var scene = null;
var sceneToRender = null;
var createDefaultEngine = function() { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true,  disableWebGL2Support: false}); };
        
var camera;

var createScene = async function () {
   /* ———————————————————
      1.  BASIC SCENE SETUP
   ———————————————————— */
   const scene = new BABYLON.Scene(engine);

   // Even, realistic PBR lighting for any GLB (⚠️ NEW)
   scene.createDefaultEnvironment({
        createGround: false,     // we already make our own ground
        createSkybox: false,
        environmentIntensity: 1.0
   });

   // Lights (keep if you like—you now have the HDRI + these)
   const light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(0, 100, 100), scene);

   // Camera
   camera = new BABYLON.ArcRotateCamera("Camera", 0, 0.8, 50, BABYLON.Vector3.Zero(), scene);
   camera.attachControl(canvas, true);

   // Ground
   //const ground = BABYLON.Mesh.CreateGround("ground", 500, 500, 10, scene);
   //ground.position.y = -10;

   var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 1000, height: 1000 }, scene);
   ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.8, restitution: 0.5, disableBidirectionalTransformation: true }, scene);
   ground.checkCollisions = true;
   ground.material = new BABYLON.GridMaterial("mat", scene);

   /* ———————————————————
   2.  DEMO BOXES (unchanged)
   ———————————————————— */
   const box  = BABYLON.Mesh.CreateBox("box", 4.0, scene);
   box.position.set(0, 2, 0);
   box.isPickable = true;
   const matBox = new BABYLON.StandardMaterial("matBox", scene);
   matBox.diffuseColor = new BABYLON.Color3(1, 0.1, 0.1);
   box.material = matBox;

   const box2 = BABYLON.Mesh.CreateBox("box2", 8.0, scene);
   box2.position.set(0, 8, 0);
   const matBox2 = new BABYLON.StandardMaterial("matBox2", scene);
   matBox2.diffuseColor = new BABYLON.Color3(0.1, 0.1, 1);
   box2.material = matBox2;

   const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 5}, scene);
    sphere.position.set(-15, 2.5, 0);
    const matSphere = new BABYLON.StandardMaterial("matSphere", scene);
    matSphere.diffuseColor = new BABYLON.Color3(0, 1, 0);
    sphere.material = matSphere;

    const pyramid = BABYLON.MeshBuilder.CreateCylinder("pyramid", {diameterTop: 0, diameterBottom: 6, height: 6, tessellation: 4}, scene);
    pyramid.position.set(15, 3, 0);
    const matPyramid = new BABYLON.StandardMaterial("matPyramid", scene);
    matPyramid.diffuseColor = new BABYLON.Color3(1, 1, 0);
    pyramid.material = matPyramid;

   /* ———————————————————
   3.  IMPORT HEART MODEL
   ———————————————————— */
   BABYLON.SceneLoader.ImportMesh("", "./", "HeartFinalized.glb", scene,
   function (meshes) {
        const heart = meshes[0];

        // Position & scale
        heart.position.set(15, 12, 30);
        heart.scaling.setAll(5);        // make it bigger
        heart.isPickable = true;        // allow grabbing

        /* DEBUG COLOR (uncomment if model still shows black)
        const mat = new BABYLON.StandardMaterial("heartMat", scene);
        mat.diffuseColor = new BABYLON.Color3(0.8, 0.1, 0.1);
        heart.material = mat;
         */

        console.log("Heart loaded!");
    }
   );

   BABYLON.SceneLoader.ImportMesh("", "./", "Owl2026.glb", scene,
    function (meshes) {
    const owl = meshes[0];

    owl.position.set(-25, 2, 20);
    owl.scaling.setAll(5);
    owl.isPickable = true;

    console.log("Owl loaded!");
    }
);

   /* ———————————————————
   4.  WEB‑XR SETUP (unchanged)
    ———————————————————— */
    
    try {
    const xrHelper = await scene.createDefaultXRExperienceAsync({
        floorMeshes: [ground]
    });

    let grabbedMesh = null;

    xrHelper.input.onControllerAddedObservable.add((controller) => {
        controller.onMotionControllerInitObservable.add((mc) => {
            if (mc.handness === "left") {
                const trigger = mc.getComponent(mc.getComponentIds()[0]);

                trigger.onButtonStateChangedObservable.add(() => {
                    if (trigger.changes.pressed) {
                        if (trigger.pressed) {
                            grabbedMesh = xrHelper.pointerSelection.getMeshUnderPointer(controller.uniqueId);

                            if (grabbedMesh && grabbedMesh !== ground) {
                                grabbedMesh.setParent(mc.rootMesh);
                            }
                        } else {
                            grabbedMesh && grabbedMesh.setParent(null);
                        }
                    }
                });
            }
        });
    });
    } catch (error) {
        console.warn("WebXR unavailable. Continuing without VR.", error);
    }

    return scene;
    };


    window.initFunction = async function() {
                                
    var asyncEngineCreation = async function() {
        try {
            return createDefaultEngine();
        } catch(e) {
            console.log("the available createEngine function failed. Creating the default engine instead");
            return createDefaultEngine();
                        }
        }

        window.engine = await asyncEngineCreation();
                    
        const engineOptions = window.engine.getCreationOptions?.();
        if (!engineOptions || engineOptions.audioEngine !== false) {
                        
        }
        if (!engine) throw 'engine should not be null.';
        startRenderLoop(engine, canvas);
        window.scene = createScene();};
        initFunction().then(() => {scene.then(returnedScene => { sceneToRender = returnedScene; });
        
        });

        // Resize
        window.addEventListener("resize", function () {
           engine.resize();
        });
  
