Physijs.scripts.worker = './js/public/three/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

var mUniverse;
var mOrbitControls;
var mGLScene;
var mSimData = ''
var mDataLoader = new DataLoader()
var mShowAssist = false;

function onKeyPress(event) {
    var key;
    if (navigator.appName == "Netscape") {
        key = String.fromCharCode(event.charCode);
    } else {
        key = String.fromCharCode(event.keyCode);
    }
    switch (key) {
        case 'G':
        case 'g':
            mShowAssist = !mShowAssist;
            break;
        default:
            break;
    }

    if (null != mGLScene) {
        if (mShowAssist) {
            document.getElementById('canvas-frame').appendChild(mGLScene.mStats.domElement);
        } else {
            document.getElementById('canvas-frame').removeChild(mGLScene.mStats.domElement);
        }
        mGLScene.updateAssistVisible(mShowAssist);
    }
}

function onWindowResize() {
    if (undefined != mUniverse) {
        mUniverse.mScene.onWindowResize();
    }
}

function createUIController(scene) {
    mOrbitControls = new THREE.OrbitControls(scene.mCamera, scene.mRenderer.domElement);
    mOrbitControls.target = new THREE.Vector3(0, 0, 0);
    mOrbitControls.autoRotate = false;
    mOrbitControls.minDistance = 100;
    mOrbitControls.maxDistance = 10000;
}

function main() {
    // onSurfaceChanged
    window.addEventListener('resize', onWindowResize, false);

    mDataLoader.loadSimData('three-solar-system.json', function(data) {
        mSimData = JSON.stringify(data, null, "\t")
    });
    if (mSimData == undefined){
        alert('illegal mSimData')
        return
    }

    try {
        mUniverse = new Universe();
        mUniverse.start(function(scene) {
            mGLScene = scene;
            createUIController(scene);
        }, JSON.parse(mSimData))
    } catch (e) {
        alert('illegal data:' + e);
    }
}