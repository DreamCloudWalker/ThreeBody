var GLScene = function(updateCallback) {
    this.DISTANCE_BUFFER = 500;
    this.FOV = 45;
    var mScene = this;
    this.mDebug = false;
    this.mMouseView = false;
    this.mRenderer = new THREE.WebGLRenderer({
        antialias : true
    });
    this.mRenderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-frame').appendChild(this.mRenderer.domElement);
    this.mRenderer.setClearColor(0x000000, 1.0);

    this.mStats = new Stats();
    this.mStats.domElement.style.position = 'absolute';
    this.mStats.domElement.style.left = '5px';
    this.mStats.domElement.style.top = '5px';

    this.mMeshGrid = new THREE.Geometry();
    this.mMeshLineMaterial = new THREE.LineBasicMaterial({color: 0xffffff, opacity: 0.2});
    this.mMeshLineMaterial.visible = false;

    this.mAxis = new THREE.AxesHelper(500);
    this.mAxis.material.visible = false;

    this.mTextureLoader = new THREE.TextureLoader();

    this.mPhysicsScene = new Physijs.Scene;
    this.mPhysicsScene.setGravity(new THREE.Vector3(0, 0, 0));
    this.mPhysicsScene.addEventListener(
		'update',
		function() {
			mScene.onUpdate(updateCallback, mScene.mDebug);
		}
    );
    
    this.createCamera();
    this.createLights();
    this.createAssists();
    this.createGalaxyBackground(20000, 64);
    this.mPhysicsScene.simulate();
    this.render(this.render, this.mRenderer, this.mCamera, this.mPhysicsScene, this.mStats);
}

GLScene.prototype.createCamera = function() {
    this.mCamera = new THREE.PerspectiveCamera(this.FOV, window.innerWidth / window.innerHeight, 1, 100000);
    this.mCamera.position.x = -1800;
    this.mCamera.position.y = 850;
    this.mCamera.position.z = -1300;
    this.mCamera.up.x = 0;
    this.mCamera.up.y = 1;
    this.mCamera.up.z = 0;
    this.mCamera.lookAt(this.mPhysicsScene.position);
    this.mPhysicsScene.add(this.mCamera);
}

GLScene.prototype.createLights = function() {
    this.mAmbientLight = new THREE.AmbientLight(0x777777);
    this.mPhysicsScene.add(this.mAmbientLight);
}

GLScene.prototype.createGalaxyBackground = function(radius, segments) {
    this.mBgGalaxy = new THREE.Mesh(new THREE.SphereGeometry(radius, segments, segments), new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture('./model/Galaxy/bg_galaxy.jpg'),
        side: THREE.BackSide
    }));

    this.mPhysicsScene.add(this.mBgGalaxy);
}

GLScene.prototype.createAssists = function() {
    this.mMeshGrid.vertices.push(new THREE.Vector3(-500, 0, 0));
    this.mMeshGrid.vertices.push(new THREE.Vector3( 500, 0, 0));
    for (var i = 0; i <= 10; i ++) {
        var line = new THREE.Line(this.mMeshGrid, this.mMeshLineMaterial);
        line.position.z = (i * 100) - 500;
        this.mPhysicsScene.add(line);

        var line = new THREE.Line(this.mMeshGrid, this.mMeshLineMaterial);
        line.position.x = (i * 100) - 500;
        line.rotation.y = 90 * Math.PI / 180;
        this.mPhysicsScene.add(line);
    }

    this.mPhysicsScene.add(this.mAxis);
}

GLScene.prototype.updateStatus = function(visible, debug, mouseView = false) {
    this.mAxis.material.visible = visible;
    this.mMeshLineMaterial.visible = visible;
    this.mDebug = debug;
    this.mMouseView = mouseView;
}

GLScene.prototype.render = function(fun, renderer, camera, scene, stats) {
    renderer.render(scene, camera);
    stats.update();
    requestAnimationFrame(function() {
        fun(fun, renderer, camera, scene, stats)
    });
}

GLScene.prototype.addObject = function(object) {
    this.mPhysicsScene.add(object.mMesh)
    if (undefined != object.mPointLight) 
        this.mPhysicsScene.add(object.mPointLight);
    if (undefined != object.mLightSprite) 
        this.mPhysicsScene.add(object.mLightSprite);
    if (undefined != object.mTrackLine) 
        this.mPhysicsScene.add(object.mTrackLine);
    mUniverse.addObject(object)
}

GLScene.prototype.addElement = function(element) {
    this.mPhysicsScene.add(element)
}

GLScene.prototype.remove = function(element) {
    this.mPhysicsScene.remove(element)
}

GLScene.prototype.removeObject = function(object) {
    this.mPhysicsScene.remove(object.mMesh)
    mUniverse.removeObject(object)
}

GLScene.prototype.onWindowResize = function() {
    this.mCamera.aspect = window.innerWidth / window.innerHeight;
    this.mCamera.updateProjectionMatrix();

    this.mRenderer.setSize(window.innerWidth, window.innerHeight);
}

GLScene.prototype.onUpdate = function(updateCallback, debug) {
    if (!mUniverse.mRunning) {
        return ;
    }
    var maxX = -Number.MAX_SAFE_INTEGER;
    var maxY = -Number.MAX_SAFE_INTEGER;
    var maxZ = -Number.MAX_SAFE_INTEGER;
    var minX = Number.MAX_SAFE_INTEGER;
    var minY = Number.MAX_SAFE_INTEGER;
    var minZ = Number.MAX_SAFE_INTEGER;
    for (var i = 0; i < mUniverse.mObjects.length; i++) {
        if (mUniverse.mObjects[i].update != undefined) {
            mUniverse.mObjects[i].update(this.mDebug);
        }

        if (mUniverse.mObjects[i].mType != AsterType.STAR) {
            continue;   // camera do not always watch planet or satellite
        }
        maxX = Math.max(maxX, mUniverse.mObjects[i].mMesh.position.x);
        maxY = Math.max(maxY, mUniverse.mObjects[i].mMesh.position.y);
        maxZ = Math.max(maxZ, mUniverse.mObjects[i].mMesh.position.z);
        minX = Math.min(minX, mUniverse.mObjects[i].mMesh.position.x);
        minY = Math.min(minY, mUniverse.mObjects[i].mMesh.position.y);
        minZ = Math.min(minZ, mUniverse.mObjects[i].mMesh.position.z);
    }

    updateCallback(new THREE.Vector3((maxX + minX) / 2, (maxY + minY) / 2, (maxZ + minZ) / 2));
    if (!this.mMouseView) {
        var deltaX = Math.abs(maxX - minX);
        var deltaY = Math.abs(maxY - minY);
        var deltaZ = Math.abs(maxZ - minZ);
        var maxDelta = Math.max(deltaX, Math.max(deltaY, deltaZ));
        var cameraX = (maxX + minX) / 2;
        var cameraY = (maxY + minY) / 2;
        var cameraZ = (maxZ + minZ) / 2;
        this.mCamera.lookAt(cameraX, cameraY, cameraZ);
        if (deltaX < deltaY && deltaX < deltaZ) {   // Camera改变x坐标，观察Y-Z平面
            cameraX += (this.DISTANCE_BUFFER + maxDelta / 2) / Math.tan(this.FOV / 2);
        } 
        // else if (deltaY < deltaX && deltaY < deltaZ) {   // 观察X-Z平面
        //     cameraY += (this.DISTANCE_BUFFER + maxDelta / 2) / Math.tan(this.FOV / 2);
        // } 
        else {
            cameraZ += (this.DISTANCE_BUFFER + maxDelta / 2) / Math.tan(this.FOV / 2);
        }

        this.mCamera.position.x = cameraX;
        this.mCamera.position.y = cameraY;
        this.mCamera.position.z = -cameraZ;
    }

    mUniverse.mUniverseTime++;
    if (debug) {
        console.log('------------------------------------------ start ------------------------------------------');
        console.log('Current time is : ' + getTimeWithNum(mUniverse.mUniverseTime));
        console.log('Current camera pos is : ');
        console.log(this.mCamera.position);
        console.log('Current camera look at : ');
        console.log(this.mCamera.lookAt);
        for (var i = 0; i < mUniverse.mObjects.length; i++) {
            console.log('Number ' + i + ', type = ' + mUniverse.mObjects[i].mType +', aster pos: ');
            console.log(mUniverse.mObjects[i].mMesh.position)
        }
        console.log('------------------------------------------- end -------------------------------------------');
    }

    this.mPhysicsScene.simulate(undefined, 1);
}