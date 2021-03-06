
function handleSingleClick(Group) {
//    console.log("group", $(Group)[0]);
//    var id = $(Group)[0].getAttribute('id');
//    var def = $(Group)[0].getAttribute('DEF');
//    $('#info').html("<b>Info</b><br>"
//            + "id: " + id + "<br>"
//            + "DEF: " + def);
    document.getElementById('inline1').setAttribute('url', "./ball.x3d");
}

DISTANCE_LIMIT = 75000.0;
EARTH_RADIUS = 6372798.2;
EARTH_CIRC = EARTH_RADIUS * 2 * Math.PI;
TILE_SIZE = 256;
Osm2X3d.myZConst = 17;
var osm2X3d;
var zoom = 1;
var zoomOld = 0;
var curViewPoint;
var rotationCenter;
var zoomDelta = 2;
//var cameraTransform;
//var viewpointGround;
document.onload = function () {
//    var osm2X3d = new Osm2X3dEarth();
    osm2X3d = new Osm2X3dGround();
    osm2X3d.init();
    document.addEventListener('keydown', function (event) {
        if (event.keyCode == 88) { // 'x' keydown
            osm2X3d.updateView();
            osm2X3d.updateScene();
//                        element = document.getElementById('x3dElement');
//                        bindable = element.runtime.getActiveBindable('viewpoint');
//                        x3dom.debug.doLog('viewpoint.position: ' + bindable.getAttribute('position'));
        }
    }, false);
}

function Osm2X3dGround() {
//    18/40.74856/-73.98641
//    this.lat = 48.703885;
//    this.lon = 2.0699095;
    this.lat = 40.74856;
    this.lon = -73.98641;
    this.elev = 14000000;
    this.cameraTransform = document.createElement('Transform');
    this.viewpoint;
    this.camPos = new x3dom.fields.SFVec3f(0, this.elev, 0);
    this.camOri = -1.57;
}

Osm2X3dGround.prototype.init = function () {
    var self = this;
    var background = document.createElement('Background');
    background.setAttribute('groundColor', '0.972 0.835 0.666');
    background.setAttribute('skyAngle', '1.309 1.571');
    background.setAttribute('skyColor', '0.0 0.2 0.7 0.0 0.5 1.0 1.0 1.0 1.0');
    scene.appendChild(background);
    var navigationInfo = document.createElement('NavigationInfo');
    navigationInfo.setAttribute('id', 'nav');
    navigationInfo.setAttribute('headlight', 'true');
    navigationInfo.setAttribute('type', 'turntable');
    navigationInfo.setAttribute('typeParams', '0 0 0 1.56');
    navigationInfo.setAttribute('transitionType', 'TELEPORT');
    scene.appendChild(navigationInfo);
    self.viewpoint = document.createElement('Viewpoint');
    self.viewpoint.setAttribute('id', 'viewpointGround');
    self.viewpoint.setAttribute('orientation', '1 0 0 -1.57');
    self.viewpoint.setAttribute('position', '0 ' + self.elev + ' 0');
    self.cameraTransform.setAttribute('rotation', '0 1 0 0');
    self.cameraTransform.appendChild(self.viewpoint);
    scene.appendChild(self.cameraTransform);
    self.viewpoint.addEventListener("viewpointChanged", view_changed, false);
    curViewPoint = x3dElement.runtime.viewpoint();
    rotationCenter = curViewPoint._vf.centerOfRotation;
    self.updateView();
    self.updateScene();
}

Osm2X3dGround.prototype.updateView = function () {
    var self = this;

    var orientation;
    var lonDiff = (180 / Math.PI) * rotationCenter.x / EARTH_RADIUS;
    var latDiff = -(180 / Math.PI) * rotationCenter.z / EARTH_RADIUS;
    self.lon += lonDiff;
    self.lat += latDiff;
    if (self.camOri[0] && self.camOri[1]) {
        orientation = (-self.camOri[0].x)
                + ' ' + (-self.camOri[0].y)
                + ' ' + (-self.camOri[0].z)
                + ' ' + (-self.camOri[1]);
    } else {
        orientation = self.viewpoint.getAttribute('orientation');
    }
    x3dom.debug.doLog('orientation: ' + orientation, x3dom.debug.INFO);
    self.viewpoint.parentNode.removeChild(self.viewpoint)

    self.viewpoint = document.createElement('Viewpoint');
    self.viewpoint.setAttribute('id', 'viewpointGround');
    self.viewpoint.setAttribute('orientation', orientation);
    self.viewpoint.setAttribute('position',
            (self.camPos.x - rotationCenter.x)
            + ' ' + (self.camPos.y - rotationCenter.y)
            + ' ' + (self.camPos.z - rotationCenter.z));
    self.viewpoint.setAttribute('centerOfRotation', '0 0 0');
    self.cameraTransform.appendChild(self.viewpoint);
    self.viewpoint.setAttribute('set_bind', 'true');
    self.viewpoint.addEventListener("viewpointChanged", view_changed, false);
}

Osm2X3dGround.prototype.updateScene = function () {
    var self = this;
    var sceneContent = document.getElementById('x3dTile');
    if (sceneContent) {
        sceneContent.parentNode.removeChild(sceneContent);
    }

//    for (zoomRel = 0; zoomRel < 1; zoomRel += 2) {
    var zoom_ = zoom;
    self.updateCoord(zoom_);
    var group = document.createElement('Group');
    var xtile = Osm2X3d.long2xtile(self.lon, zoom_);
    var ytile = Osm2X3d.lat2ytile(self.lat, zoom_);
    var lonTile = Osm2X3d.xtile2long(xtile, zoom_);
    var latTile = Osm2X3d.ytile2lat(ytile, zoom_);
    var x_3d = EARTH_RADIUS * (lonTile - self.lon) * Math.PI / 180;
    var z_3d = EARTH_RADIUS * (self.lat - latTile) * Math.PI / 180;
    var tileWidth_3d = EARTH_RADIUS * (Osm2X3d.zoom2lonSize(zoom_)) * Math.PI / 180;
    var tileHeight_3d = EARTH_RADIUS * (Osm2X3d.zoom2latSize(ytile, zoom_)) * Math.PI / 180;
    var n = 0;
    var tiles = [];

    var xtileFloat = Osm2X3d.long2xtileFloat(self.lon, zoom_);
    var ytileFloat = Osm2X3d.lat2ytileFloat(self.lat, zoom_);
    var xtileUL = Math.floor((256 * (xtileFloat) - 127) / 256);
    var ytileUL = Math.floor((256 * (ytileFloat) - 127) / 256);
    for (i = 0; i < 2; i++) {
        var xtile_ = xtileUL + i;
        if (xtile_ < 0 || xtile_ >= Math.pow(2, zoom_)) {
            continue;
        }
        for (j = 0; j < 2; j++) {
            var ytile_ = ytileUL + j;
            if (ytile_ < 0 || ytile_ >= Math.pow(2, zoom_)) {
                continue;
            }
            var tile = {
                zoom: zoom_,
                xtile: xtile_,
                ytile: ytile_
            }
            tiles[n++] = tile;
//                x3dom.debug.doLog('tile: ' + tile.zoom + ' ' + tile.xtile + ' ' + tile.ytile, x3dom.debug.INFO);
        }
    }

    x3dom.debug.doLog('tiles.length: ' + tiles.length, x3dom.debug.INFO);
    for (k = 0; k < tiles.length; k++) {
        if (tiles[k].zoom < 1) {
            continue;
        }
        var xtile_ = Osm2X3d.long2xtile(self.lon, tiles[k].zoom);
        var ytile_ = Osm2X3d.lat2ytile(self.lat, tiles[k].zoom);
        var imageTexture = document.createElement('ImageTexture');
        var url = 'http://a.tile.openstreetmap.org/'
                + tiles[k].zoom + '/' + tiles[k].xtile + '/' + tiles[k].ytile + '.png';
        imageTexture.setAttribute('url', url);
        var appearance = document.createElement('Appearance');
        appearance.appendChild(imageTexture);
        var rectangle = document.createElement('Rectangle2D');
        rectangle.setAttribute('size', tileWidth_3d + ' ' + tileHeight_3d);
        var shape = document.createElement('Shape');
        shape.appendChild(appearance);
        shape.appendChild(rectangle);
        var transform = document.createElement('Transform');
        var translation_ = (tileWidth_3d * (tiles[k].xtile - xtile_)) + ' ' + -(tileHeight_3d * (tiles[k].ytile - ytile_)) + ' 0';
        x3dom.debug.doLog('translation_: ' + translation_, x3dom.debug.INFO);
        transform.setAttribute('translation', translation_);
        transform.appendChild(shape);
        group.appendChild(transform);
//        if (tiles[k].xtile > 17) {
//            inline = document.createElement('inline');
//            inline.setAttribute('id', 'x3dTile');
//            inline.setAttribute('nameSpaceName', 'myX3d');
//            var url = 'osm2x3d.php?'
//                    + 'zoom=' + zoom
//                    + '&xtile=' + tiles[k].xtile
//                    + '&ytile=' + tiles[k].ytile;
//            inline.setAttribute('url', url);
//            x3dom.debug.doLog('url: ' + url, x3dom.debug.INFO);
//            transform = document.createElement('Transform');
//            transform.setAttribute('translation', translation_);
//            transform.setAttribute('rotation', "1 0 0 1.5708");
//            transform.appendChild(inline);
//            group.appendChild(transform);
//        }
    }
    var mainTransform = document.createElement('Transform');
    mainTransform.setAttribute('id', 'x3dTile');

    var mainTranslation = (x_3d + tileWidth_3d / 2) + ' 0 ' + (z_3d + tileHeight_3d / 2);
    mainTransform.setAttribute('translation', mainTranslation);

    mainTransform.setAttribute('rotation', "1 0 0 -1.5708");
    mainTransform.appendChild(group);
    scene.appendChild(mainTransform);
//    }
}

function view_changed(e) {
    osm2X3d.camPos = e.position;
    osm2X3d.camOri = e.orientation;
    x3dElement = document.getElementById('x3dElement');
    zoom = Osm2X3d.processZoom(osm2X3d.camPos);
    curViewPoint = x3dElement.runtime.viewpoint();
    rotationCenter = curViewPoint._vf.centerOfRotation;

//    if (
//            (Math.abs(zoom - zoomOld) >= 2) ||
//            (zoom > 15 && zoom > zoomOld)
//            ) {
//        zoomOld = zoom;
//        zoomDelta = (zoom > 15) ? 1 : 2;
//        osm2X3d.updateView();
//        osm2X3d.updateScene();
//    }
}

Osm2X3dGround.prototype.updateCoord = function (zoom_) {
    var coordTrans = document.getElementById('coordTrans');
    if (coordTrans) {
        scene.removeChild(coordTrans);
    }

    coordinate = document.createElement('Coordinate');
    coordinate.setAttribute('id', 'coordinate');
    var fact = Math.pow(2, zoom_);
    var zzz = '0 0 0 ' + 40000000 / fact + ' 0 0 0 ' + 40000000 / fact + ' 0 0 0 ' + 40000000 / fact;
    x3dom.debug.doLog('zzz: ' + zzz, x3dom.debug.INFO);
    coordinate.setAttribute('point', zzz);
    color = document.createElement('Color');
    color.setAttribute('color', '1 0 0 0 1 0 0.2 0.2 1');
    indexedLineSet = document.createElement('IndexedLineSet');
    indexedLineSet.setAttribute('colorPerVertex', 'false');
    indexedLineSet.setAttribute('colorIndex', '0 1 2');
    indexedLineSet.setAttribute('coordIndex', '0 1 -1 0 2 -1 0 3 -1');
    indexedLineSet.setAttribute('solid', 'false');
    indexedLineSet.appendChild(coordinate);
    indexedLineSet.appendChild(color);
    shape = document.createElement('Shape');
    shape.appendChild(indexedLineSet);
    transformC = document.createElement('Transform');
    transformC.setAttribute('id', 'coordTrans');
    transformC.appendChild(shape);
    scene.appendChild(transformC);
}

function Osm2X3d() {
}

Osm2X3d.long2xtile = function (lon, zoom) {
    return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
}
Osm2X3d.lat2ytile = function (lat, zoom) {
    return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));
}

Osm2X3d.long2xtileFloat = function (lon, zoom) {
    return ((lon + 180) / 360 * Math.pow(2, zoom));
}
Osm2X3d.lat2ytileFloat = function (lat, zoom) {
    return ((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
}

Osm2X3d.xtile2long = function (x, z) {
    return (x / Math.pow(2, z) * 360 - 180);
}
Osm2X3d.ytile2lat = function (y, z) {
    var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
    return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
}

Osm2X3d.zoom2lonSize = function (z) {
    return (1 / Math.pow(2, z) * 360);
}
Osm2X3d.zoom2latSize = function (y, z) {
    var n0 = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
    var l0 = (180 / Math.PI * Math.atan(0.5 * (Math.exp(n0) - Math.exp(-n0))));
    var n1 = Math.PI - 2 * Math.PI * (y + 1) / Math.pow(2, z);
    var l1 = (180 / Math.PI * Math.atan(0.5 * (Math.exp(n1) - Math.exp(-n1))));
    return l0 - l1;
}
Osm2X3d.processDist = function (camCoord) {
    var rdist2 = Math.pow(camCoord.x, 2)
            + Math.pow(camCoord.y, 2)
            + Math.pow(camCoord.z, 2);
    return Math.sqrt(rdist2);
}
Osm2X3d.processZoom = function (camCoord) {
    var rdist2 = Math.pow(camCoord.x, 2)
            + Math.pow(camCoord.y, 2)
            + Math.pow(camCoord.z, 2);
    var rdist = Math.sqrt(rdist2);
    var zoom_ = parseInt(Osm2X3d.myZConst - Math.log2(rdist / 1000.0));
    zoom_ = Math.min(zoom_, 19);
    zoom_ = Math.max(zoom_, 1);
    return zoom_;
}

Osm2X3d.createGround = function (size, translation, zoom, xtile, ytile) {
//  <Transform id='x3dTile' translation="' + translation + '" rotation="1 0 0 -1.5708">
//      <Shape>
//          <Appearance>
//              <ImageTexture url=\'"' + url + '"\'/>
//          </Appearance>
//          <Rectangle2D size="' + size + '"></Rectangle2D>
//      </Shape>
//  </Transform>
    var imageTexture = document.createElement('ImageTexture');
    imageTexture.setAttribute(
            'url',
            'http://a.tile.openstreetmap.org/'
            + zoom + '/' + xtile + '/' + ytile + '.png');
    var appearance = document.createElement('Appearance');
    appearance.appendChild(imageTexture);
    var rectangle = document.createElement('Rectangle2D');
    rectangle.setAttribute('size', size);
    var shape = document.createElement('Shape');
    shape.appendChild(appearance);
    shape.appendChild(rectangle);
    var transform = document.createElement('Transform');
    transform.setAttribute('id', 'x3dTile');
    transform.setAttribute('translation', translation);
    transform.setAttribute('rotation', "1 0 0 -1.5708");
    transform.appendChild(shape);
    return transform;
}
