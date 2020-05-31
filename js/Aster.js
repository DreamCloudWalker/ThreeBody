function Aster(scene, config) {
    this.mScene = scene;
    this.mRadius = config.radius;
    this.mLoader = new THREE.TextureLoader();
    this.mType = config.type;
    this.mLightSprite = undefined;
    this.mPointLight = undefined;
    if (this.mType == AsterType.STAR) {
        this.mMeshMaterial = new THREE.MeshLambertMaterial({map: this.mLoader.load(config.texPath), emissive: 0x888833});
        this.mLightSprite = new THREE.Sprite(new THREE.SpriteMaterial({map: new THREE.CanvasTexture(this.generateSprite("255, 255, 255")),
            blending: THREE.AdditiveBlending}));
        this.mLightSprite.scale.x = this.mLightSprite.scale.y = this.mLightSprite.scale.z = this.mRadius * 4;
        this.mPointLight = new THREE.PointLight(0x777777, 1, 1000, 0.2);
    } else {
        this.mMeshMaterial = new THREE.MeshLambertMaterial({map: this.mLoader.load(config.texPath)});
    }
    this.mMaterial = Physijs.createMaterial(this.mMeshMaterial,
        0.1, // low friction
        0.9  // high restitution
    );
    this.mMaterial.map.wrapS = THREE.RepeatWrapping;
	this.mMaterial.map.repeat.set(1.0, 1.0);
	this.mGeometry = new THREE.SphereGeometry(config.radius ,32, 32);
    this.mMesh = new Physijs.SphereMesh(
		this.mGeometry,
		this.mMaterial,
		mass = config.mass
    );
    this.mMesh.position.set(config.pos.x, config.pos.y, config.pos.z);
    this.mMesh.radius = config.radius;
    this.mMesh.name = name;

    // assist
    this.mTrack = new THREE.Geometry();
    // this.mTrack.vertices.push(this.mMesh.position.clone());
    // this.mTrack.vertices.push(new THREE.Vector3(this.mMesh.position.x + 100, this.mMesh.position.y + 1200, this.mMesh.position.z + 300));
    // this.mTrack.vertices.push(new THREE.Vector3(this.mMesh.position.x + 300, this.mMesh.position.y + 500, this.mMesh.position.z + 1000));
    this.mTrackLineMaterial = new THREE.LineBasicMaterial({color: config.trackColor, linewidth: 5});
    this.mTrackLine = new THREE.Line(this.mTrack, this.mTrackLineMaterial);
    // debug
    this.debugLogCnt = 10;
}

Aster.prototype.gravityForce = function(asters, debug = false) {
    var force = new THREE.Vector3(0, 0, 0)
    for (var i = 0; i < asters.length; i++) {
        aster = asters[i]
        if (aster == this) {continue}
        var distance = this.mMesh.position.distanceTo(aster.mMesh.position);
        // 万有引力公式
        var oneForce = aster.mMesh.position.clone().sub(this.mMesh.position).normalize()
                    .multiplyScalar(mUniverse.G)
                    .multiplyScalar(aster.mMesh.mass)
                    .multiplyScalar(this.mMesh.mass)
                    .divideScalar(Math.pow(distance,2));
        force.add(oneForce);
        
        if (debug && this.debugLogCnt > 0) {
            console.log("oneForce:" + this.logVector3(oneForce));
            console.log("force:" + this.logVector3(force));
        }
    }
    if (debug && this.debugLogCnt > 0) {
        console.log("all force:" + this.logVector3(force));
        console.log("position:" + this.logVector3(this.mMesh.position));
    }
    this.mMesh.applyForce(force, new THREE.Vector3(0,0,0));
    this.debugLogCnt--;
}

Aster.prototype.logVector3 = function(vector) {
	return "vec[x] = " + vector.x + ", vec[y] = " + vector.y + ", vec[z] = " + vector.z;
}

Aster.prototype.showTrack = function() {
    if (this.mTrack.vertices.length > 100) {
        this.mTrack.vertices.pop(); // 尾部删除
    }
    this.mTrack.vertices.unshift(this.mMesh.position.clone());  // THREE.Vector3,头部添加
    this.mTrack.verticesNeedUpdate = true;
    this.mScene.addElement(this.mTrackLine);
}

Aster.prototype.update = function() {
    this.gravityForce(mUniverse.mObjects);
    if (undefined != this.mPointLight) 
        this.mPointLight.position.copy(this.mMesh.position);
    if (undefined != this.mLightSprite) 
        this.mLightSprite.position.copy(this.mMesh.position);
    this.showTrack();
}

/**
 * 实现球体发光
 * @param color 颜色的r,g和b值,比如："123,123,123";
 * @returns {Element} 返回canvas对象
 */
Aster.prototype.generateSprite = function (color) {
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