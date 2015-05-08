var osm2X3d;
EARTH_RADIUS = 6372798.2;
Osm2X3d.myZConst = 17;

document.onload = function () {
    osm2X3d = new Osm2X3dEarth();
    osm2X3d.init();
    document.addEventListener('keydown', function (event) {
        if (event.keyCode == 88) { // 'x' keydown
            x3dom.debug.doLog('update called.');
            osm2X3d.updateView();
            osm2X3d.updateScene();
        }
    }, false);
}

function Osm2X3dEarth() {
    this.lat = 40.74856;
//    this.lon = -73.98641;
    this.lon = 0;
    this.elev = EARTH_RADIUS * 2;
    this.viewpoint;
    this.camPos = new x3dom.fields.SFVec3f(0, this.elev, 0);
    this.camOri;
    this.zoom;
//    this.guest = 0;
//    this.camPos = new x3dom.fields.SFVec3f(0, this.elev, 0);
//    this.geoPos = new x3dom.fields.MFVec3f();
//    this.elev, this.lon, this.lat);
//this.geoOps.
}


Osm2X3dEarth.prototype.init = function () {
    var self = this;
    var navigationInfo = document.createElement('NavigationInfo');
    navigationInfo.setAttribute('id', 'nav');
    navigationInfo.setAttribute('headlight', 'true');
    navigationInfo.setAttribute('type', 'turntable');
    navigationInfo.setAttribute('typeParams', '0 0 0 3.0');
    navigationInfo.setAttribute('transitionType', 'TELEPORT');

    scene.appendChild(navigationInfo);
    var rotLat = (90 - self.lat) * Math.PI / 180;
    var rotLon = (self.lon - 90) * Math.PI / 180;

    self.viewpoint = document.createElement('Viewpoint');
    self.viewpoint.setAttribute('id', 'viewpointGround');
    self.viewpoint.setAttribute('description', 'Open Earth View');
    self.viewpoint.setAttribute('orientation', '1 0 0 -1.57');
    self.viewpoint.setAttribute('position', '0 ' + self.elev + ' 0');
    var cameraTransform = document.createElement('Transform');
    cameraTransform.setAttribute('rotation', '1 0 0 ' + rotLat);
    cameraTransform.setAttribute('translation', '0 0 0');
    cameraTransform.appendChild(self.viewpoint);
    var cameraTransform2 = document.createElement('Transform');
    cameraTransform2.setAttribute('rotation', '0 1 0 ' + rotLon);
    cameraTransform2.setAttribute('translation', '0 0 0');
    cameraTransform2.appendChild(cameraTransform);
    scene.appendChild(cameraTransform2);
//    scene.appendChild(cameraTransform);
    self.viewpoint.addEventListener("viewpointChanged", self.view_changed, false);

    osm2X3d.updateView();
    osm2X3d.updateScene();
}

Osm2X3dEarth.prototype.updateView = function () {
    var self = this;
}

Osm2X3dEarth.prototype.updateScene = function () {
    x3dom.debug.doLog('updateScene.');
    var self = this;
    var sceneTransform = document.createElement('Transform');
    sceneTransform.setAttribute('id', 'earthTransform');
    sceneTransform.setAttribute('translation', '0 0 0');
    var shape = document.createElement('Shape');
    var appearance = document.createElement('Appearance');
    var imageTexture = document.createElement('ImageTexture');
    imageTexture.setAttribute('url', 'earth_big.png');
    imageTexture.setAttribute('scale', 'true');
    appearance.appendChild(imageTexture);
    shape.appendChild(appearance);

    x3dom.debug.doLog('guest:' + self.guest);
    var sphereSegment;
    var sphereSegment = document.getElementById('SphereSegment');
    if (sphereSegment) {
        sphereSegment.parentNode.removeChild(sphereSegment);
    }

    sphereSegment = document.createElement('SphereSegment');
    sphereSegment.setAttribute('id', 'SphereSegment');
    var latitude = '';
    var precision = 64;
    var stepLat = 180 / precision;
    for (i = -90; i <= 90; i += stepLat) {
        latitude += i + ' ';
    }
    sphereSegment.setAttribute('latitude', latitude);

    var longitude = '';
    var stepLon = 360 / precision;
    for (i = 360; i >= -0; i -= stepLon) {
        longitude += i + ' ';
    }
    sphereSegment.setAttribute('longitude', longitude);
    sphereSegment.setAttribute('solid', 'false');
    sphereSegment.setAttribute('radius', EARTH_RADIUS);
    shape.appendChild(sphereSegment);
    sceneTransform.appendChild(shape);
    scene.appendChild(sceneTransform);
}

Osm2X3dEarth.prototype.view_changed = function (e) {
    var self = this;
    self.camPos = e.position;
    self.camOri = e.orientation;
    self.zoom = Osm2X3d.processZoom(self.camPos);
    x3dom.debug.doLog('zoom: ' + self.zoom, x3dom.debug.INFO);


    var pos = self.camPos;
    x3dom.debug.doLog('viewpoint position: ' + pos, x3dom.debug.INFO);
    var rdist2 = Math.pow(pos.x, 2) + Math.pow(pos.y, 2) + Math.pow(pos.z, 2);
    var rdist = Math.sqrt(rdist2);
    self.lon = Math.atan2(pos.x, pos.z) * 180.0 / Math.PI + 90;
    self.lat = Math.asin(pos.y / rdist) * 180.0 / Math.PI;
    x3dom.debug.doLog('r: ' + rdist, x3dom.debug.INFO);
    x3dom.debug.doLog('lon: ' + self.lon, x3dom.debug.INFO);
    x3dom.debug.doLog('lat: ' + self.lat, x3dom.debug.INFO);

    if (Math.abs(self.zoom - self.zoomOld) >= 1) {
        self.zoomOld = self.zoom;
//        x3dom.debug.doLog('zoom: ' + self.zoom, x3dom.debug.INFO);
//        osm2X3d.updateView();
//        osm2X3d.updateScene();
    }
}

function Osm2X3d() {
}

Osm2X3d.processZoom = function (camCoord) {
    var rdist2 = Math.pow(camCoord.x, 2)
            + Math.pow(camCoord.y, 2)
            + Math.pow(camCoord.z, 2);
    var rdist = Math.sqrt(rdist2);
    var elevation = rdist - EARTH_RADIUS;
    var zoom_ = parseInt(Osm2X3d.myZConst - Math.log2(elevation / 1000.0));
    x3dom.debug.doLog('log2(elevation): ' + Math.log2(elevation / 1000.0));
    zoom_ = Math.min(zoom_, 19);
    zoom_ = Math.max(zoom_, 1);
    return zoom_;
}