if (!Detector.webgl) Detector.addGetWebGLMessage();

var scene, camera, renderer;
var cameraCube, sceneCube;
var cubes = [];
var geometry, material;
var mouseX = 0, mouseY = 0;
var counter = document.getElementById('counter');
var ball, pad1, pad2;
var oldt = 0;
var ballX = 0;
var ballY = 0;
setBallDirection(3.14 + Math.random() - 0.5);
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
var startCountTimer;
var ballDirection;
var ballDirectionX;
var ballDirectionY;
var maxScore = 5;

function setBallDirection(r) {
    ballDirection = r;
    ballDirectionX = Math.cos(ballDirection);
    ballDirectionY = Math.sin(ballDirection);
}

var startGameButton = document.getElementById('startGameButton');
var tryAgainButton = document.getElementById('tryAgainButton');

startGameButton.addEventListener('click', startGame);
tryAgainButton.addEventListener('click', startGame);

document.getElementById('backToStartButton').addEventListener('click', function () {
    document.getElementById('theGame').style.display = 'none';
    document.getElementById('startScreen').style.display = 'block';
    document.getElementById('gameOver').style.display = 'none';
});

function startGame() {
    document.getElementById('theGame').style.display = 'block';
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameOver').style.display = 'none';

    playGameMusic();
    animate(0);

    startCountTimer = Date.now();

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

camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 100000);
camera.position.z = -5000;

cameraCube = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 100000);

scene = new THREE.Scene();
sceneCube = new THREE.Scene();

var path = "textures/SaintPetersBasilica/";
var format = '.jpg';
var urls = [
    path + 'posx' + format, path + 'negx' + format,
    path + 'posy' + format, path + 'negy' + format,
    path + 'posz' + format, path + 'negz' + format
];

var textureCube = THREE.ImageUtils.loadTextureCube(urls, new THREE.CubeRefractionMapping());
material = new THREE.MeshLambertMaterial({ color: 0xaaccff, envMap: textureCube, refractionRatio: 0.95 });

var modifier = new THREE.SubdivisionModifier(2);
geometry = new THREE.CubeGeometry(200, 200, 200, 2, 2, 2);
geometry.mergeVertices();
geometry.computeCentroids();
geometry.computeFaceNormals();
geometry.computeVertexNormals();
modifier.modify(geometry);

function createCube(x, y, z, w, h) {
    var iceMesh = new THREE.Mesh(geometry, material);

    iceMesh.position.x = x;
    iceMesh.position.y = y;
    iceMesh.position.z = z;
    iceMesh.scale.x = w;
    iceMesh.scale.y = h;

    scene.add(iceMesh);
    cubes.push(iceMesh);

    return iceMesh;
}

pad1 = createCube(-2600, 0, 1, 1, 8);
pad2 = createCube(2600, 0, 1, 1, 8);
ball = createCube(0, 0, 1, 1, 1);

var pointLight = new THREE.PointLight(0xffffff, 2, 0);
pointLight.position.set(0, 10000, 10000);
var ambientLight = new THREE.AmbientLight(0xffffff);

scene.add(pointLight);
scene.add(ambientLight);

var shader = THREE.ShaderLib[ "cube" ];
shader.uniforms[ "tCube" ].value = textureCube;

material = new THREE.ShaderMaterial({
    fragmentShader: shader.fragmentShader,
    vertexShader: shader.vertexShader,
    uniforms: shader.uniforms,
    depthWrite: false,
    side: THREE.BackSide
});

var boxMesh = new THREE.Mesh(new THREE.CubeGeometry(1000, 100, 100), material);
sceneCube.add(boxMesh);

renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.autoClear = false;

document.getElementById('theGame').appendChild(renderer.domElement);
document.addEventListener('mousemove', onDocumentMouseMove, false);

function onDocumentMouseMove(event) {
    mouseX = event.clientX / window.innerWidth - .5;
    mouseY = event.clientY / window.innerHeight - .5;

    mouseY *= 2;
    if (mouseY < -.5) mouseY = -.5;
    else if (mouseY > .5) mouseY = .5;
}

function gameOver() {
    playGameOverMusic();

    document.getElementById('gameOverWin').style.display = player1.score > player2.score ? 'block' : 'none';
    document.getElementById('gameOverLoose').style.display = player1.score < player2.score ? 'block' : 'none';
    document.getElementById('finalScore').innerHTML = player1.score + " - " + player2.score;
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('theGame').style.display = 'none';

    speed = 0;
    ballX = 0;
    ballY = 0;
    setBallDirection(3.14 + Math.random() - 0.5);
}

function newRound() {
    startCountTimer = Date.now();

    speed = 0;
    ballX = 0;
    ballY = 0;
    setBallDirection(3.14 + Math.random() - 0.5);
}

function padCheck(player, ball) {
    var dy = player.pad.position.y - ball.position.y;

    if (Math.abs(dy) > player.padSize) {
        if (player === player1) {
            player2.score++;
        }
        else {
            player1.score++;
        }

        if (player1.score >= maxScore || player2.score >= maxScore) {
            gameOver();
        }

        player1.scoreElement.innerHTML = player1.score;
        player2.scoreElement.innerHTML = player2.score;

        newRound();
    }

    var newDirection = ballDirection + Math.PI - dy / 1000;
    if (newDirection > Math.PI / 2 - .5 && newDirection < Math.PI / 2 + .5) {
        newDirection = newDirection > Math.PI / 2 ? Math.PI / 2 + .5 : Math.PI / 2 - .5;
    }
    else if (newDirection > Math.PI * 1.5 - .5 && newDirection < Math.PI * 1.5 + .5) {
        newDirection = newDirection > Math.PI ? Math.PI * 1.5 + .5 : Math.PI * 1.5 - .5;
    }
    setBallDirection(newDirection);

    speed += .3;

    player.sound.play();
}

function animate(t) {
    if (stopGame) {
        stopGame = false;
        return;
    }

    requestAnimationFrame(animate);

    // start counter
    if (startCountTimer) {
        if (Date.now() - startCountTimer < 3000) {
            var cnt = Math.ceil((3000 - (Date.now() - startCountTimer)) / 1000);
            counter.innerHTML = cnt;
            speed = 0;
        }
        else {
            counter.innerHTML = "";
            speed = initialSpeed;
            startCountTimer = null;
        }
    }

    // wait for sound to be ready
    if (!dingSound || !dongSound) {
        return;
    }
    else {
        player1.sound = dingSound;
        player2.sound = dongSound;
    }

    var dt = (t - oldt) * speed * speedMultiplier;
    if (!dt) dt = 0;
    oldt = t;

    dt += Math.sin(t / 100) * speedWobble;

    camera.position.x = Math.cos(t / 5000) * 8000;
    camera.position.y = mouseY * 4000;
    camera.position.z = Math.sin(t / 5000) * 8000;
    camera.lookAt(scene.position);
    cameraCube.rotation.copy(camera.rotation);

    pad1.position.y = -mouseY * 3500;

    // computer player
    pad2.position.y += (ballY - pad2.position.y) * .05;

    // ball
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

    ball.rotation.y += .05;

    renderer.render(sceneCube, cameraCube);
    renderer.render(scene, camera);
}
