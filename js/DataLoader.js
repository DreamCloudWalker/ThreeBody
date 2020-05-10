function DataLoader(){

}

DataLoader.prototype.loadSimData = function(name, callback) {
	var savedData = $.cookie('sim_data')
	if (savedData != undefined) {
		callback(eval('(' + savedData + ')'))
	} else {
		loadXMLDoc("./config/" + name, function(data) {
			callback(eval('(' + data + ')'))
		})
	}
}