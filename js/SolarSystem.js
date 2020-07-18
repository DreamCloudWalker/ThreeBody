var mShowAssist = false;
var mStats;
var mRenderer;
var mCamera;
var mSolarSystem;
var mTrackballControls;
var mAmbientLight;
var mPointLight;    // SunLight
var mMeshGrid;
var mAxis;
var mMeshLineMaterial;
// 添加太阳发光效果
var mSunLight;
// stars
var mSun;
var mPlanets = [];
var mMercury;
var mVenus;
var mEarth;
var mMars;
var mJupiter;
var mSaturn;
var mUranus;
var mNeptune;

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
            mMeshLineMaterial.visible = mShowAssist;
            mAxis.material.visible = mShowAssist;
            mMercury.track.visible = mShowAssist;
            mVenus.track.visible = mShowAssist;
            mEarth.track.visible = mShowAssist;
            mMars.track.visible = mShowAssist;
            mJupiter.track.visible = mShowAssist;
            mSaturn.track.visible = mShowAssist;
            mUranus.track.visible = mShowAssist;
            mNeptune.track.visible = mShowAssist;
            break;
        default:
            break;
    }
    if (mShowAssist) {
        document.getElementById('canvas-frame').appendChild(mStats.domElement);
    } else {
        document.getElementById('canvas-frame').removeChild(mStats.domElement);
    }
}

/**
 * 实现球体发光
 * @param color 颜色的r,g和b值,比如："123,123,123";
 * @returns {Element} 返回canvas对象
 */
var generateSprite = function (color) {
    var canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    var context = canvas.getContext('2d');
    var gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, 
        canvas.height / 2, canvas.width / 2);
    gradient.addColorStop(0, 'rgba(' + color + ',1)');
    gradient.addColorStop(0.2, 'rgba(' + color + ',1)');
    gradient.addColorStop(0.4, 'rgba(' + color + ',.6)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    return canvas;
}

function getNumberInNormalDistribution(mean, std_dev){
    return mean + (randomNormalDistribution() * std_dev);
}

function randomNormalDistribution() {
    var u = 0.0, v = 0.0, w = 0.0, c = 0.0;
    do {
        u = Math.random() * 2 - 1.0;
        v = Math.random() * 2 - 1.0;
        w = u * u + v * v;
    } while(w == 0.0 || w >= 1.0)
    c = Math.sqrt((-2 * Math.log(w)) / w);
    return u * c;
}

/**
 * 返回行星轨道的组合体
 * @param scale 行星的大小
 * @param revolutionRadius 行星的公转半径
 * @param speed 行星公转速度
 * @param pivot 公转参照物
 * @param rotation THREE.Vector3 行星组合体的x,y,z三个方向的自转角速度
 * @param imgUrl 行星的贴图
 * @param scene 场景
 * @returns {{satellite: THREE.Mesh, speed: *}} 行星组合对象;速度
*/
function createPlanet(scale, revolutionRadius, speed, pivot, rotation, imgUrl, scene, satellite = undefined, 
    normalImgUrl = undefined, metalImgUrl = undefined) {
    var planetAndSatellite = new THREE.Object3D();
    var planetAndTrack = new THREE.Object3D();
    var track = new THREE.Mesh(new THREE.RingGeometry(revolutionRadius, revolutionRadius + 0.05, 48, 1), new THREE.MeshBasicMaterial());
    track.rotation.x = -90 * Math.PI / 180;
    track.visible = mShowAssist;
    planetAndTrack.add(track);
    
    var material = new THREE.MeshPhysicalMaterial({
        map: THREE.ImageUtils.loadTexture(imgUrl, null, function(t){}), 
        metalness: 0.1, 
        roughness: 0.8
    });
    if (undefined != normalImgUrl) 
        material.normalMap = new THREE.ImageUtils.loadTexture(normalImgUrl);
    if (undefined != metalImgUrl) { 
        material.metalnessMap = new THREE.ImageUtils.loadTexture(metalImgUrl);
    }
    var mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), material); 
    planetAndSatellite.add(mesh);
    if (undefined != satellite) 
        planetAndSatellite.add(satellite);
    planetAndSatellite.rotation.set(rotation.x, rotation.y, rotation.z);
    planetAndSatellite.position.z = revolutionRadius;
    planetAndSatellite.scale.x = planetAndSatellite.scale.y = planetAndSatellite.scale.z = scale;
    planetAndTrack.add(planetAndSatellite);

    var solarPlanetSys = new THREE.Group();
    solarPlanetSys.add(pivot);
    solarPlanetSys.add(planetAndTrack);
    solarPlanetSys.rotation.y = Math.random();

    scene.add(solarPlanetSys);
    
    return {group: solarPlanetSys, planet: planetAndSatellite, speed: speed, rotation: rotation, track: track};
};

function initBackground() {
    // 创建一个圆形的材质，记得一定要加上texture.needsUpdate = true;
    let canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;

    let context = canvas.getContext("2d");
    context.fillStyle = "#aaaaaa";

    // canvas创建圆 http://www.w3school.com.cn/tags/canvas_arc.asp
    context.arc(32, 32, 25, 0, 2 * Math.PI);
    context.fill();

    // 创建材质
    let texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
	var starsGeometry = new THREE.Geometry();

	for ( var i = 0; i < 500000; i ++ ) {
	    var star = new THREE.Vector3();
	    star.x = getNumberInNormalDistribution(-3100,1000);
	    star.y = getNumberInNormalDistribution(0,5000);
	    star.z = getNumberInNormalDistribution(0,10000);

	    starsGeometry.vertices.push(star);
	}

	var starsMaterial = new THREE.PointsMaterial({color: 0xffffaa, size:10, map:texture, blending: THREE.AdditiveBlending, transparent: true});
	var starField = new THREE.Points(starsGeometry, starsMaterial);

	mSolarSystem.add(starField);
}

function initThree() {
    mRenderer = new THREE.WebGLRenderer({
        antialias : true
    });
    mRenderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-frame').appendChild(mRenderer.domElement);
    mRenderer.setClearColor(0x000000, 1.0);

    mStats = new Stats();
    mStats.domElement.style.position = 'absolute';
    mStats.domElement.style.left = '5px';
    mStats.domElement.style.top = '5px';

    // onSurfaceChanged
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    mCamera.aspect = window.innerWidth / window.innerHeight;
    mCamera.updateProjectionMatrix();
    mRenderer.setSize(window.innerWidth, window.innerHeight);
}

function initCamera() {
    mCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 100000);
    mCamera.position.x = 70;
    mCamera.position.y = 70;
    mCamera.position.z = 70;
    mCamera.up.x = 0;
    mCamera.up.y = 1;
    mCamera.up.z = 0;
    mCamera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
}

function initScene() {
    mSolarSystem = new THREE.Scene();

    mAxis = new THREE.AxesHelper(50);
    mAxis.material.visible = mShowAssist;
    mSolarSystem.add(mAxis);

    // 创建控件并绑定在相机上
    mTrackballControls = new THREE.TrackballControls(mCamera);
    mTrackballControls.rotateSpeed = 1.0;
    mTrackballControls.zoomSpeed = 1.0;
    mTrackballControls.panSpeed = 1.0;
    mTrackballControls.noZoom=false;
    mTrackballControls.minDistance = 10;
    mTrackballControls.maxDistance = 1000;
    mTrackballControls.noPan=false;
    mTrackballControls.staticMoving = true;
    mTrackballControls.dynamicDampingFactor = 0.3;
}

function initLight() {
    mAmbientLight = new THREE.AmbientLight(0x777777);
    mSolarSystem.add(mAmbientLight);
    mPointLight = new THREE.PointLight(0xffffff, 1, 1000, 0.2);
    mPointLight.castShadow = true;
    mSolarSystem.add(mPointLight);
}

function initObjects() {
    mMeshLineMaterial = new THREE.LineBasicMaterial({color: 0xffffff, opacity: 0.2});
    mMeshLineMaterial.visible = mShowAssist;
    mMeshGrid = new THREE.Geometry();
    mMeshGrid.vertices.push(new THREE.Vector3(-50, 0, 0));
    mMeshGrid.vertices.push(new THREE.Vector3( 50, 0, 0));
    for (var i = 0; i <= 10; i ++) {
        var line = new THREE.Line(mMeshGrid, mMeshLineMaterial);
        line.position.z = (i * 10) - 50;
        mSolarSystem.add(line);

        var line = new THREE.Line(mMeshGrid, mMeshLineMaterial);
        line.position.x = (i * 10) - 50;
        line.rotation.y = 90 * Math.PI / 180;
        mSolarSystem.add(line);
    }

    // 添加太阳发光效果
    mSunLight = new THREE.Sprite(new THREE.SpriteMaterial({map: new THREE.CanvasTexture(generateSprite("255, 255, 255")),
        blending: THREE.AdditiveBlending}));
    mSunLight.scale.x = mSunLight.scale.y = mSunLight.scale.z = 30;
    mSolarSystem.add(mSunLight);
    // sun
    var sunGeo = new THREE.SphereGeometry(7 ,32, 32);
    var sunTex = THREE.ImageUtils.loadTexture("model/Solar/Sol_Opaque_Mat_baseColor.png",null,function(t){});
    var sunMat = new THREE.MeshLambertMaterial({map: sunTex, emissive: 0x888833});
    mSun = new THREE.Mesh(sunGeo, sunMat);
    mSolarSystem.add(mSun);
    // revolution pivot
    var revolutionPivot = new THREE.Object3D();
    // mercury
    mMercury = createPlanet(0.56, 13, 0.04, revolutionPivot, new THREE.Vector3(0.0, 0.001, 0), "model/Mercury/Mercury_Mat_baseColor.png", mSolarSystem);
    mPlanets.push(mMercury);
    // venus
    mVenus = createPlanet(0.86, 16, 0.015, revolutionPivot, new THREE.Vector3(0.0, 0.001, 0), "model/Venus/Venus_Terrain_Mat_baseColor.png", mSolarSystem);
    mVenus.planet.rotation.set(Math.PI, 0, 0);
    mPlanets.push(mVenus);
    // earth and moon
    var luna = new THREE.Mesh(new THREE.SphereGeometry(0.25, 32, 32), new THREE.MeshPhysicalMaterial({
        map: THREE.ImageUtils.loadTexture("model/Luna/Luna_Mat_baseColor.png", null, function(t){}),
        normalMap: THREE.ImageUtils.loadTexture("model/Luna/Luna_Mat_normal.png", null, function(t){}),
        roughnessMap: THREE.ImageUtils.loadTexture("model/Luna/Luna_Mat_occlusionRoughnessMetallic.png", null, function(t){}),
        metalnessMap: THREE.ImageUtils.loadTexture("model/Luna/Luna_Mat_occlusionRoughnessMetallic.png", null, function(t){})
    })); 
    luna.position.z = 2;
    mEarth = createPlanet(1, 20, 0.01, revolutionPivot, new THREE.Vector3(0.0, 0.1, 0), "model/Earth/Earth_Mat_baseColor.png", 
        mSolarSystem, luna, "model/Earth/Earth_Mat_normal.png", "model/Earth/Earth_Mat_occlusionRoughnessMetallic.png");
    mEarth.planet.rotation.set(Math.PI / 8, 0, 0);    // 转轴倾角，赤道与黄道面夹角
    mPlanets.push(mEarth);
    // mars
    mMars = createPlanet(0.5, 25, 0.005, revolutionPivot, new THREE.Vector3(0.0, 0.1, 0), "model/Mars/Mars_mat_baseColor.png", mSolarSystem);
    mMars.planet.rotation.set(Math.PI / 8, 0, 0);
    mPlanets.push(mMars);
    // jupiter
    var jupiterStarRingMaterial = new THREE.MeshLambertMaterial({
        map: THREE.ImageUtils.loadTexture("model/Saturn/SaturnRings_Mat_baseColor.png", null, function(t){})
    });
    jupiterStarRingMaterial.side = THREE.DoubleSide;
    var jupiterStarRing = new THREE.Mesh(new THREE.RingGeometry(1.2, 1.4, 32, 1), jupiterStarRingMaterial);
    jupiterStarRing.rotation.x = -90 * Math.PI / 180;
    mJupiter = createPlanet(4, 35, 0.003, revolutionPivot, new THREE.Vector3(0.0, 0.15, 0), "model/Jupiter/Jupiter_Mat_baseColor.png", mSolarSystem, jupiterStarRing);
    mJupiter.planet.rotation.set(Math.PI / 32, 0, 0);
    mPlanets.push(mJupiter);
    // saturn
    var saturnStarRingMaterial = new THREE.MeshLambertMaterial({
        map: THREE.ImageUtils.loadTexture("model/Saturn/SaturnRings_Mat_baseColor.png", null, function(t){})
    });
    saturnStarRingMaterial.side = THREE.DoubleSide;
    var saturnStarRing = new THREE.Mesh(new THREE.RingGeometry(1.1, 1.5, 32, 1), saturnStarRingMaterial);
    saturnStarRing.rotation.x = -90 * Math.PI / 180;
    mSaturn = createPlanet(3, 50, 0.001, revolutionPivot, new THREE.Vector3(0.0, 0.14, 0), "model/Saturn/SaturnPlanet_Opaque_Mat_baseColor.png", mSolarSystem, saturnStarRing);
    mSaturn.planet.rotation.set(Math.PI / 8, 0, 0);
    mPlanets.push(mSaturn);
    // uranus
    mUranus = createPlanet(2, 60, 0.0006, revolutionPivot, new THREE.Vector3(0.0, 0.11, 0), "model/Uranus/UranusGlobe_Mat_baseColor.png", mSolarSystem);
    mUranus.planet.rotation.set(Math.PI / 2, 0, 0);
    mPlanets.push(mUranus);
    // neptune
    mNeptune = createPlanet(1.8, 70, 0.0003, revolutionPivot, new THREE.Vector3(0.0, 0.12, 0), "model/Neptune/NeptuneGlobe_Mat_baseColor.png", mSolarSystem);
    mNeptune.planet.rotation.set(Math.PI / 8, 0, 0);
    mPlanets.push(mNeptune);
}

function render() {
    var clock = new THREE.Clock();
    var delta = clock.getDelta();
    mTrackballControls.update(delta);

    mRenderer.clear();
    mRenderer.render(mSolarSystem, mCamera);

    // // 自转
    // mEarth.rotation.x += 0.001;
    // mEarth.rotation.y += 0.01;
    updateScene();

    mStats.update();

    requestAnimationFrame(render);
}

function updateScene() {
    for (var i = 0; i < mPlanets.length; i++) {
        mPlanets[i].group.rotation.y -= mPlanets[i].speed;  // 公转
        // 自转
        mPlanets[i].planet.rotation.x += mPlanets[i].rotation.x;
        mPlanets[i].planet.rotation.y -= mPlanets[i].rotation.y;
    }
    mSun.rotation.y -= 0.004;   // 太阳自转速度
}

function main() {
    initThree();
    initCamera();
    initScene();
    initBackground();
    initLight();
    initObjects();
    render();
}