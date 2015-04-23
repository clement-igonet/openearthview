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
    this.lon = -73.98641;
//    this.lon = 0;
    this.elev = 130000;
}


Osm2X3dEarth.prototype.init = function () {
    var self = this;
//                    <navigationInfo id='nav' headlight='true' type='turntable'"></navigationInfo>
    var navigationInfo = document.createElement('NavigationInfo');
    navigationInfo.setAttribute('id', 'nav');
    navigationInfo.setAttribute('headlight', 'true');
    navigationInfo.setAttribute('type', 'turntable');
    navigationInfo.setAttribute('typeParams', '0 0 0 1.56');
    navigationInfo.setAttribute('transitionType', 'TELEPORT');
    scene.appendChild(navigationInfo);
//                    <Transform rotation='1 0 0 1.57' translation='0 0 0'>
//                        <Viewpoint description='Open Earth View' orientation='1 0 0 -1.57' position='0 130000 0'/>
//                    </Transform>
    var rotLat = (90 - self.lat) * Math.PI / 180;
    var rotLon = (self.lon - 90) * Math.PI / 180;
//    x3dom.debug.doLog('rotLong: ' + rotLon, x3dom.debug.INFO);

    var viewpoint = document.createElement('Viewpoint');
    viewpoint.setAttribute('id', 'viewpointGround');
    viewpoint.setAttribute('description', 'Open Earth View');
    viewpoint.setAttribute('orientation', '1 0 0 -1.57');
//    viewpoint.setAttribute('orientation', '1 0 0 ' + rotLong);
    viewpoint.setAttribute('position', '0 ' + self.elev + ' 0');
    var cameraTransform = document.createElement('Transform');
    cameraTransform.setAttribute('rotation', '1 0 0 ' + rotLat);
    cameraTransform.setAttribute('translation', '0 0 0');
    cameraTransform.appendChild(viewpoint);
    scene.appendChild(cameraTransform);

    osm2X3d.updateView();
    osm2X3d.updateScene();
}

Osm2X3dEarth.prototype.updateView = function () {
    var self = this;
}

Osm2X3dEarth.prototype.updateScene = function () {
    var self = this;
//                    <Transform id="earthTransform" translation='0 0 0'>        
//                        <Shape>
//                            <Appearance>
//                                <ImageTexture
//                                    url='"earth_big.png"'
//                                    repeatS='true' 
//                                    repeatT='true'
//                                    scale='true' />
//                            </Appearance>
//                            <Sphere solid='true' radius="65000.0"/>
//                            <!--<Sphere solid='true'/>-->
//                        </Shape>
//                    </Transform>       
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
    sphereSegment.setAttribute('radius', '65000');
    shape.appendChild(sphereSegment);
    sceneTransform.appendChild(shape);
    scene.appendChild(sceneTransform);
}