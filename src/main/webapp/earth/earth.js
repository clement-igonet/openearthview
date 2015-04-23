var osm2X3d;
EARTH_RADIUS = 6372798.2;
Osm2X3d.myZConst = 17;

document.onload = function () {
    osm2X3d = new Osm2X3dEarth();
    osm2X3d.init();
    document.addEventListener('keydown', function (event) {
        if (event.keyCode == 88) { // 'x' keydown
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
}


Osm2X3dEarth.prototype.init = function () {
    var self = this;
    var navigationInfo = document.createElement('NavigationInfo');
    navigationInfo.setAttribute('id', 'nav');
    navigationInfo.setAttribute('headlight', 'true');
    navigationInfo.setAttribute('type', 'turntable');
    navigationInfo.setAttribute('typeParams', '0 0 0 3.13');
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
    scene.appendChild(cameraTransform);
    self.viewpoint.addEventListener("viewpointChanged", self.view_changed, false);

    osm2X3d.updateView();
    osm2X3d.updateScene();
}

Osm2X3dEarth.prototype.updateView = function () {
    var self = this;
}

Osm2X3dEarth.prototype.updateScene = function () {
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
    var sphereSegment = document.createElement('SphereSegment');
    var latitude = '';
    for (i = -90; i <= 90; i += 10) {
        latitude += i + ' ';
    }
    sphereSegment.setAttribute('latitude', latitude);

    var longitude = '';
    for (i = 360; i >= 0; i -= 10) {
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
    x3dom.debug.doLog('camPos: ' + self.camPos, x3dom.debug.INFO);
    x3dom.debug.doLog('camOri: ' + self.camOri, x3dom.debug.INFO);
    self.zoom = Osm2X3d.processZoom(self.camPos);
    x3dom.debug.doLog('zoom: ' + self.zoom, x3dom.debug.INFO);

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
    var rdist = Math.sqrt(rdist2) - EARTH_RADIUS;
    var zoom_ = parseInt(Osm2X3d.myZConst - Math.log2(rdist / 1000.0));
    zoom_ = Math.min(zoom_, 19);
    zoom_ = Math.max(zoom_, 1);
    return zoom_;
}