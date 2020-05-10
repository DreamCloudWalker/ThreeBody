function loadXMLDoc(url, callback) {
	xmlhttp = null;
	if (window.XMLHttpRequest) { // code for Firefox, Opera, IE7, etc.
		xmlhttp = new XMLHttpRequest();
	} else if (window.ActiveXObject) { // code for IE6, IE5
	    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	if (xmlhttp != null) {
	    xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4) {      // 4 = "loaded"
                if (xmlhttp.status == 200) {    // 200 = "OK"
                    callback(xmlhttp.responseText)
                }
                else {
                    alert("illegal data:" + xmlhttp.statusText);
                }
            }
        };
        xmlhttp.open("get", url, false);
        xmlhttp.send(null);
	} else {
	    alert("Your browser does not support XMLHTTP.");
	}
}

function getTimeWithNum(num) {
    var h = parseInt(num / (60 * 60));
    var m = parseInt((num - h * 60 * 60) / (60));
    var s = num - h * 60 * 60 - m * 60;
    if (h < 10) {
        h = "0" + h;
    }
    if (m < 10) {
        m = "0" + m;
    }
    if (s < 10) {
        s = "0" + s;
    }
    var time = h + ":" + m + ":" + s;
    return time;
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