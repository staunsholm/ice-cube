// Detect if the browser support WebGL. If not just show a little message, and try to help the user.
if (!Detector.webgl) Detector.addGetWebGLMessage();


var scene, camera, renderer;

// this camera and scene are for creating a background.
var cameraCube, sceneCube;

var cubes = [];

var geometry, material;

var mouseX = 0, mouseY = 0;

var ball, pad1, pad2;
var oldt = 0;
var ballX = 0;
var ballY = 0;
setBallDirection(3.14);
var initialSpeed = 2;
var speed = initialSpeed;
var player1 = {
    score: 0,
    padSize: 800,
    scoreElement: document.getElementById('player1score')
};
var player2 = {
    score: 0,
    padSize: 800,
    scoreElement: document.getElementById('player2score')
};
var stopGame = false;

var ballDirection;
var ballDirectionX;
var ballDirectionY;

function setBallDirection(r) {
    ballDirection = r;
    ballDirectionX = Math.cos(ballDirection);
    ballDirectionY = Math.sin(ballDirection);
}

var startGameButton = document.getElementById('startGameButton');
var tryAgainButton = document.getElementById('tryAgainButton');

startGameButton.addEventListener('click', startGame);
tryAgainButton.addEventListener('click', startGame);

init();

function startGame() {
    document.getElementById('theGame').style.display = 'block';
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';

    playGameMusic();
    animate();

    player1 = {
        score: 0,
        pad: pad1,
        padSize: 800,
        scoreElement: document.getElementById('player1score'),
        sound: dingSound
    };
    player1.scoreElement.innerHTML = "0";

    player2 = {
        score: 0,
        pad: pad2,
        padSize: 800,
        scoreElement: document.getElementById('player2score'),
        sound: dongSound
    };
    player2.scoreElement.innerHTML = "0";
}

function init() {

    // we create a perspective camera to our world
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 100000);
    camera.position.z = -5000;

    // we create a perspective camera to the cube world
    cameraCube = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 100000);

    // two scenes
    scene = new THREE.Scene();
    sceneCube = new THREE.Scene();

    // here we load the 6 textures that are the six faces of the cube map
    var path = "textures/Roundabout256/";
    var format = '.jpg';
    var urls = [
        path + 'posx' + format, path + 'negx' + format,
        path + 'posy' + format, path + 'negy' + format,
        path + 'posz' + format, path + 'negz' + format
    ];

    // To construct a texture cube, we pass the urls, and say what kind of cube we want. Refaction is this case.
    var textureCube = THREE.ImageUtils.loadTextureCube(urls, new THREE.CubeRefractionMapping());
    // this texture cube is goint to be used to create a material for the icecubes.
    // An environment map, that the cubes are going to refract.
    var material = new THREE.MeshLambertMaterial({ color: 0xaaccff, envMap: textureCube, refractionRatio: 0.95 });

    // for the icecubes gemotry, we are going to smooth out th edges.
    // We initialize a geometry modifier with the number of subdivisions that we want.
    var modifier = new THREE.SubdivisionModifier(2);
    // creating a cube geometry with 2 subdivisions.
    geometry = new THREE.CubeGeometry(200, 200, 200, 2, 2, 2);
    // mergeVertices(); is run in case of duplicated vertices
    geometry.mergeVertices();
    geometry.computeCentroids();
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    // we use it to modify the geometry of the cube and smooth out the edges.
    // to see it visually go to :
    // http://mrdoob.github.com/three.js/examples/webgl_geometry_subdivision.html
    modifier.modify(geometry);

    // now we can create the mesh for our icecubes.
    function createCube(x, y, z, w, h) {
        var iceMesh = new THREE.Mesh(geometry, material);

        iceMesh.position.x = x;
        iceMesh.position.y = y;
        iceMesh.position.z = z;
        iceMesh.scale.x = w;
        iceMesh.scale.y = h;

        // we add each mesh to the scene
        scene.add(iceMesh);
        // and save it in the array to update them later.
        cubes.push(iceMesh);

        return iceMesh;
    }

    pad1 = createCube(-2600, 0, 1, 1, 8);
    pad2 = createCube(2600, 0, 1, 1, 8);
    ball = createCube(0, 0, 1, 1, 1);

    // this point light is to mimic the sun.
    var pointLight = new THREE.PointLight(0xffffff, 2, 0);
    // we cheat and locate this light more or less where
    // we have the sun in the image to make it more realistic.
    pointLight.position.set(0, 10000, 10000);
    var ambientLight = new THREE.AmbientLight(0xffffff);
    // we add both lights to the scene
    scene.add(pointLight);
    scene.add(ambientLight);

    // Background shader
    // instead of making our own shader, we use the cube shader from threejs lib
    var shader = THREE.ShaderLib[ "cube" ];
    // we just configure the shader with our texture
    shader.uniforms[ "tCube" ].value = textureCube;

    // and create a material based on this shader.
    var material = new THREE.ShaderMaterial({

        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: shader.uniforms,
        depthWrite: false,
        side: THREE.BackSide

    });

    // the cube with this shader material
    var mesh = new THREE.Mesh(new THREE.CubeGeometry(100, 100, 100), material);
    sceneCube.add(mesh);

    // we set up a WebGL renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;

    // and dynamically attach this to the page body.
    document.getElementById('theGame').appendChild(renderer.domElement);

    // we add several listeners for the mouse move and click
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mousedown', onDocumentMouseDown, false);
}

function onDocumentMouseMove(event) {
    mouseX = event.clientX / window.innerWidth - .5;
    mouseY = event.clientY / window.innerHeight - .5;

    mouseY *= 2;
    if (mouseY < -.5) mouseY = -.5;
    else if (mouseY > .5) mouseY = .5;
}

function onDocumentMouseDown(event) {
}

function padCheck(player, ball) {
    var dy = player.pad.position.y - ball.position.y;

    if (Math.abs(dy) > player.padSize) {
        playGameOverMusic();
        stopGame = true;

        document.getElementById('gameOver').style.display = 'block';
        document.getElementById('theGame').style.display = 'none';

        speed = initialSpeed;
        ballX = 0;
        ballY = 0;
        setBallDirection(3.14);
    }
    else {
        player.score++;
        player.scoreElement.innerHTML = player.score;

        setBallDirection(ballDirection + Math.PI - dy / 1000);

        speed += 1;

        player.sound.play();
    }
}

function animate(t) {
    if (stopGame) {
        stopGame = false;
        return;
    }

    requestAnimationFrame(animate);

    // wait for sound to ready
    if (!dingSound || !dongSound) {
        return;
    }
    else {
        player1.sound = dingSound;
        player2.sound = dongSound;
    }

    // we change the camera position based on the mouse move or click
    camera.position.x = mouseX * 8000;
    camera.position.y = mouseY * 4000;
    camera.position.z = 5000;
    // but we make the camera alwat look at the origin of the scene
    camera.lookAt(scene.position);
    // we copy the camera rotation to the camera of the background
    // so they will keep in sync
    cameraCube.rotation.copy(camera.rotation);

    pad1.position.y = -mouseY * 3500;

    var dt = (t - oldt) * speed;
    if (!dt) dt = 0;
    oldt = t;

    ballX += dt * ballDirectionX;
    ballY += dt * ballDirectionY;

    if (ballX > 2400) {
        ballDirectionX *= -1;
        ballX -= (ballX - 2400) * 2;

        padCheck(player2, ball);
    }
    else if (ballX < -2400) {
        ballDirectionX *= -1;
        ballX += (-2400 - ballX) * 2;

        padCheck(player1, ball);
    }

    if (ballY > 2400) {
        ballDirectionY *= -1;
        ballY -= (ballY - 2400) * 2;
    }
    else if (ballY < -2400) {
        ballDirectionY *= -1;
        ballY += (-2400 - ballY) * 2;
    }

    ball.position.x = ballX;
    ball.position.y = ballY;

    pad2.position.y = ballY;

    // we must render the background first!
    renderer.render(sceneCube, cameraCube);
    // and then render the scene with the cubes.
    renderer.render(scene, camera);
}