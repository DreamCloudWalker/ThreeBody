function Universe(updateCallback) {
	this.mObjects=[];	// Aster
	this.mScene = new GLScene(updateCallback);
	this.mUniverseTime = 0;
	this.mRunning = true;
	this.G = 66725.9;	// 万有引力常量
}

Universe.prototype.addObject = function(object) {
	this.mObjects.push(object)
};

Universe.prototype.removeObject = function(object) {
	this.mObjects.remove(object)
};

Universe.prototype.start = function(startCallback, endCallback, configData = undefined) {
	this.createAsters(configData['asters'], endCallback);
	startCallback(this.mScene);
}

Universe.prototype.createAsters = function(asterDatas, endCallback) {
	for (var i = 0; i < asterDatas.length; i++) {
		asterData = asterDatas[i];
		var velocity = new THREE.Vector3(asterData['initVelocity']['x'], asterData['initVelocity']['y'], asterData['initVelocity']['z']);
		if (asterData['type'] == AsterType.STAR) {
			var star = createStar(this.mScene, asterData, endCallback);
			star.mMesh.setLinearVelocity(velocity);
		} else if (asterData['type'] == AsterType.PLANET) {
			var earth = createEarth(this.mScene, asterData, endCallback);
			earth.mMesh.setLinearVelocity(velocity);
		} else if (asterData['type'] == AsterType.SATELLITE) {
			var satellite = createSatellite(this.mScene, asterData, endCallback);
			satellite.mMesh.setLinearVelocity(velocity);
		} else {
			var earth = createEarth(this.mScene, asterData, endCallback);
			earth.mMesh.setLinearVelocity(velocity);
		}
	}
}

const AsterType = {
	STAR: 0, 
	PLANET: 1, 
	SATELLITE: 2,
};

const DisasterType = {
	STAR_COLLISION: 0, 
	STAR_EAT_EARTH: 1, 
	THREE_SOLAR_FAR_AWAY: 2,
};