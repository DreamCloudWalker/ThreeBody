// 创建恒星
function createStar(scene, config, endCallback) {
    config.texPath = './model/Solar/Sol_Opaque_Mat_baseColor.png';
    config.transPath = './model/Solar/Sol_Transparent_Mat_baseColor.png';
    config.emmTexPath = './model/Solar/Sol_Opaque_Mat_emissive.png';
    config.trackColor = 0xffff00;
    var star = new Aster(scene, config, endCallback);
    scene.addObject(star);
    star.mMesh.applyImpulse(new THREE.Vector3(config.mass * 10, 0, 0), 
        new THREE.Vector3(1,1,1).multiplyScalar(config.radius));

    return star;
}

// 创建行星
function createEarth(scene, config, endCallback) {
    config.texPath = './model/Earth/Earth_Mat_baseColor.png';
    config.trackColor = 0x00ffff;
    var earth = new Aster(scene, config, endCallback);
    scene.addObject(earth);
    earth.mMesh.applyImpulse(new THREE.Vector3(config.mass * 10, 0, 0), 
        new THREE.Vector3(1,1,1).multiplyScalar(config.radius));

    return earth;
}

// 创建卫星
function createSatellite(scene, config, endCallback) {
    config.texPath = './model/Luna/Luna_Mat_baseColor.png';
    config.trackColor = 0x777777;
    var satellite = new Aster(scene, config, endCallback);
    scene.addObject(satellite);
    satellite.mMesh.applyImpulse(new THREE.Vector3(config.mass * 10, 0, 0), 
        new THREE.Vector3(1,1,1).multiplyScalar(config.radius));

    return satellite;
}