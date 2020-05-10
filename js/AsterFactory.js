// 创建恒星
function createStar(scene, config) {
    config.texPath = './model/Solar/Sol_Opaque_Mat_baseColor.png';
    var star = new Aster(scene, config);
    scene.addObject(star);
    star.mMesh.applyImpulse(new THREE.Vector3(config.mass * 10, 0, 0), 
        new THREE.Vector3(1,1,1).multiplyScalar(config.radius));

    return star;
}

// 创建行星
function createEarth(scene, config) {
    config.texPath = './model/Earth/Earth_Mat_baseColor.png';
    var earth = new Aster(scene, config);
    scene.addObject(earth);
    earth.mMesh.applyImpulse(new THREE.Vector3(config.mass * 10, 0, 0), 
        new THREE.Vector3(1,1,1).multiplyScalar(config.radius));

    return earth;
}

// 创建卫星
function createSatellite(scene, config) {
    config.texPath = './model/Luna/Luna_Mat_baseColor.png';
    var satellite = new Aster(scene, config);
    scene.addObject(satellite);
    satellite.mMesh.applyImpulse(new THREE.Vector3(config.mass * 10, 0, 0), 
        new THREE.Vector3(1,1,1).multiplyScalar(config.radius));

    return satellite;
}