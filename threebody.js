var mStats;
var mRenderer;
var mCamera;
var mScene;
var mTrackballControls
var mAmbientLight;
var mDirectionalLight;
var mCube;
var mSwitchBoard;
var mMeshGrid;

function initThree() {
    // fullscreen
    width = window.innerWidth;    // document.getElementById('canvas-frame').clientWidth;
    height = window.innerHeight;   // document.getElementById('canvas-frame').clientHeight;

    mRenderer = new THREE.WebGLRenderer({
        antialias : true
    });
    mRenderer.setSize(width, height);
    document.getElementById('canvas-frame').appendChild(mRenderer.domElement);
    mRenderer.setClearColor(0xFFFFFF, 1.0);

    mStats = new Stats();
    mStats.domElement.style.position = 'absolute';
    mStats.domElement.style.left = '5px';
    mStats.domElement.style.top = '5px';
    document.getElementById('canvas-frame').appendChild(mStats.domElement);

    // onSurfaceChanged
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    mCamera.aspect = window.innerWidth / window.innerHeight;
    mCamera.updateProjectionMatrix();
    mRenderer.setSize(window.innerWidth, window.innerHeight);
}

function initCamera() {
    mCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    mCamera.position.x = 5;
    mCamera.position.y = 5;
    mCamera.position.z = 5;
    mCamera.up.x = 0;
    mCamera.up.y = 1;
    mCamera.up.z = 0;
    mCamera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
}

function initScene() {
    mScene = new THREE.Scene();

    var axis = new THREE.AxesHelper(20);
    mScene.add(axis);

    // 创建控件并绑定在相机上
    mTrackballControls = new THREE.TrackballControls(mCamera);
    mTrackballControls.rotateSpeed = 1.0;
    mTrackballControls.zoomSpeed = 1.0;
    mTrackballControls.panSpeed = 1.0;
    mTrackballControls.noZoom=false;
    mTrackballControls.noPan=false;
    mTrackballControls.staticMoving = true;
    mTrackballControls.dynamicDampingFactor = 0.3;
}

function initLight() {
    mAmbientLight = new THREE.AmbientLight(0x333333);
    mScene.add(mAmbientLight);
    mDirectionalLight = new THREE.DirectionalLight();
    mDirectionalLight.position.set(100, 100, 100);
    mScene.add(mDirectionalLight);
}

function initObject() {
    var onProgress = function(xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log(Math.round(percentComplete, 2) + '% loading');
        }
    };
    var onError = function(error) {
        // console.log('load error!' + error.getWebGLErrorMessage());
    };

    mMeshGrid = new THREE.Geometry();
    mMeshGrid.vertices.push(new THREE.Vector3(-5, 0, 0));
    mMeshGrid.vertices.push(new THREE.Vector3( 5, 0, 0));
    for (var i = 0; i <= 10; i ++) {
        var line = new THREE.Line(mMeshGrid, new THREE.LineBasicMaterial({color: 0x000000, opacity: 0.2}));
        line.position.z = (i * 1) - 5;
        mScene.add(line);

        var line = new THREE.Line(mMeshGrid, new THREE.LineBasicMaterial({color: 0x000000, opacity: 0.2}));
        line.position.x = (i * 1) - 5;
        line.rotation.y = 90 * Math.PI / 180;
        mScene.add(line);
    }

    // cube and texture
    var geometry = new THREE.CubeGeometry(1, 1, 1);
    var texture = THREE.ImageUtils.loadTexture("model/Solar/Sol_Opaque_Mat_baseColor.png",null,function(t){});
    var material = new THREE.MeshLambertMaterial({map:texture});
    // var material = new THREE.MeshLambertMaterial({color: 0x00ff00});
    mCube = new THREE.Mesh(geometry, material);
    mCube.position.z = 4;
    mScene.add(mCube);

    // gltf loader
    var gltfLoader = new THREE.GLTFLoader();
    gltfLoader.load('model/Solor/Sol.gltf', function(gltf) {
        console.log(gltf);

        gltf.scene.traverse(function (child) {
            if (child.isMesh) {

            }
        });
        gltf.scene.position.z = 3;
        mScene.add(gltf.scene);
    }, onProgress, onError);
}

function render() {
    var clock = new THREE.Clock();
    var delta = clock.getDelta();
    mTrackballControls.update(delta);

    mRenderer.clear();
    mRenderer.render(mScene, mCamera);

    mCube.rotation.x += 0.01;
    mCube.rotation.y += 0.01;
    if (null != mSwitchBoard) {
        mSwitchBoard.rotation.y += 0.01;
    }

    mStats.update();

    requestAnimationFrame(render);
}

function main() {
    initThree();
    initCamera();
    initScene();
    initLight();
    initObject();
    render();
}