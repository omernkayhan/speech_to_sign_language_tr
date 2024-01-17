(function () {
    // Set our main variables
    let scene,
        renderer,
        camera,
        model, // Our character
        mixer, // THREE.js animations mixer
        idle, // Idle, the default state our character returns to
        clock = new THREE.Clock(), // Used for anims, which run to a clock instead of frame rate
        loaderAnim = document.getElementById('js-loader');

    const speed = 0.8;
    let words = [];
    const animations = [];
    let animationQueue = [];
    let wordIndex = -1;

    const updateWordIndex = (value = null) => {
        if(value === null) {
            wordIndex++;
        }else{
            wordIndex = value;
        }
        if(wordIndex === -1){
            document.getElementById('word').innerHTML = '-';
        }else{
            document.getElementById('word').innerHTML = words[wordIndex];
            let promptHTML = '';
            words.forEach((word, index) => {
                if(index === wordIndex){
                    promptHTML += `<span class="badge text-bg-warning me-2" style="font-size: 16px;">${word}</span>`;
                }else{
                    promptHTML += `${word} `;
                }
            });
            document.getElementById('prompt').innerHTML = promptHTML;
        }
    }

    const socket = io('//localhost:4100', {
        transports: ['websocket'],
        autoConnect: true,
        reconnection: true
    });

    socket.on('connect', () => {
        console.log('Connected to server');
        socket.emit('join', 'animation');
    });

    socket.on('reconnect', () => {
        socket.emit('join', 'animation');
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });

    socket.on('prompt', (data) => {
        updateWordIndex(-1);
        document.getElementById('prompt').innerHTML = data;
        words = data.split(' ');
        words.forEach(word => {
            const anim = animations.filter(a => a._clip.name === word)[0];
            if (anim) {
                animationQueue.push(anim);
            }else{
                console.log('Animation not found', word);
                animationQueue.push(animations.filter(a => a._clip.name === 'undefined')[0]);
            }
        });
    });

    init();

    function init() {


        const MODEL_PATH = './model/SignLanguageModel.gltf';
        const canvas = document.querySelector('#c');
        const backgroundColor = 0xF8F9FA;

        scene = new THREE.Scene();

        renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true});
        renderer.shadowMap.enabled = true;
        renderer.setPixelRatio(window.devicePixelRatio * 2.2);
        renderer.setClearColor(0xffffff, 0);
        document.body.appendChild(renderer.domElement);

        camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            1,
            1000);

        camera.position.z = 60;
        camera.position.x = 0;
        camera.position.y = 20;

        let stacy_txt = new THREE.TextureLoader().load('./model/texture.png');
        stacy_txt.flipY = false;

        const stacy_mtl = new THREE.MeshPhongMaterial({
            map: stacy_txt,
            color: 0xF8F9FA,
            skinning: true
        });

        const axesHelper = new THREE.AxesHelper(100);
        //scene.add(axesHelper);


        const loader = new THREE.GLTFLoader();

        loader.load(
            MODEL_PATH,
            function (gltf) {
                model = gltf.scene;
                let fileAnimations = gltf.animations;

                let mixamorigLeftArm = model.getObjectByName('mixamorigLeftArm');
                let mixamorigRightArm = model.getObjectByName('mixamorigRightArm');

                mixamorigLeftArm.rotation.x = THREE.Math.degToRad(70);
                mixamorigRightArm.rotation.x = THREE.Math.degToRad(70);

                model.traverse(o => {

                    if (o.isMesh) {
                        o.castShadow = true;
                        o.receiveShadow = true;
                        o.material = stacy_mtl;
                    }

                });

                model.scale.set(20, 20, 20);
                model.position.y = -4;

                scene.add(model);

                loaderAnim.remove();

                mixer = new THREE.AnimationMixer(model);

                let clips = fileAnimations.filter(val => val.name !== 'idle');
                possibleAnims = clips.map(val => {
                    let clip = THREE.AnimationClip.findByName(clips, val.name);

                    clip.tracks.splice(3, 3);
                    clip.tracks.splice(9, 3);

                    clip = mixer.clipAction(clip);
                    return clip;
                });

                let anim = THREE.AnimationClip.findByName(fileAnimations, 'Armature|mixamo.com|Layer0');
                idle = mixer.clipAction(anim);
                idle.setLoop(THREE.LoopRepeat);
                idle.play();

                fileAnimations.forEach(animation => {
                    let anim = THREE.AnimationClip.findByName(fileAnimations, animation.name);
                    let action = mixer.clipAction(anim);
                    action.setEffectiveTimeScale(speed);
                    action.setEffectiveWeight(1);
                    action.setLoop(THREE.LoopOnce);
                    action.reset();
                    animations.push(action);
                });

                console.log(animations)

                mixer.addEventListener('finished', function (e) {
                    if (animationQueue.length === 0) {
                        if(words.length > 0) {
                            document.getElementById('prompt').innerHTML = 'Animation is finished';
                            updateWordIndex(-1);
                            idle.play();
                        }
                        return;
                    }
                    updateWordIndex();
                    let action = animationQueue.shift();
                    action.reset();
                    action.play();
                });

                document.getElementById('play').addEventListener('click', e => {
                    idle.stop();
                    updateWordIndex();
                    let action = animationQueue.shift();
                    action.reset();
                    action.play();
                });

                document.getElementById('pause').addEventListener('click', e => {
                    updateWordIndex(-1);
                    idle.stop();
                    document.getElementById('prompt').innerHTML = 'Animation is stopped';
                    animationQueue = [];
                    mixer.stopAllAction();
                    idle.play();
                });

            },
            undefined,
            function (error) {
                console.error(error);
            });


        let hemiLight = new THREE.HemisphereLight(0xF8F9FA, 0xF8F9FA, 0.61);
        hemiLight.position.set(0, 50, 0);
        scene.add(hemiLight);

        let d = 8.25;
        let dirLight = new THREE.DirectionalLight(0xF8F9FA, 0.54);
        dirLight.position.set(-8, 12, 8);
        dirLight.castShadow = false; //gölge
        dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 1500;
        dirLight.shadow.camera.left = d * -1;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = d * -1;
        scene.add(dirLight);
    }


    function update() {
        if (mixer) {
            mixer.update(clock.getDelta());
        }

        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        renderer.render(scene, camera);
        requestAnimationFrame(update);
    }

    update();

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        let width = window.innerWidth;
        let height = window.innerHeight;
        let canvasPixelWidth = canvas.width / window.devicePixelRatio;
        let canvasPixelHeight = canvas.height / window.devicePixelRatio;

        const needResize =
            canvasPixelWidth !== width || canvasPixelHeight !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

})();