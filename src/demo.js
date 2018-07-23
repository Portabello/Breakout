var scene, camera, renderer, mesh, block, ball;
var meshFloor, ambientLight, light;

var keyboard = {};
var player = { height:1.8, speed:0.1, turnSpeed:Math.PI*0.02 };
var ballDir = [0.2,0.89];
var ballSpeed = 0.75;
var USE_WIREFRAME = false;


function makeWall(position, rotation){

	var mesh = new THREE.Mesh(
		new THREE.BoxGeometry(50.7,4,1),
		new THREE.MeshPhongMaterial({color:0x00356a, wireframe:USE_WIREFRAME})
	);
	mesh.position.x = position.x; 
	mesh.position.y = position.y;
	mesh.position.z = position.z;
	mesh.rotation.x = rotation.x; 
	mesh.rotation.y = rotation.y;
	mesh.rotation.z = rotation.z;
	mesh.receiveShadow = true;
	mesh.castShadow = true;
	scene.add(mesh);
}

function spawnCube(){
	var randPos = [(Math.random()*50)-25,(Math.random()*50)-25];
	mesh = new THREE.Mesh(
		new THREE.BoxGeometry(1,1,1),
		new THREE.MeshPhongMaterial({color:0x0000FF, wireframe:USE_WIREFRAME})
	);
	mesh.position.y += 1; // Move the mesh up 1 meter
	mesh.position.x = randPos[0];
	mesh.position.z = randPos[1];
	mesh.receiveShadow = true;
	mesh.castShadow = true;
	scene.add(mesh);
}

function spawnBall(){
	ball = new THREE.Mesh(
		new THREE.SphereGeometry(1,5,5),
		new THREE.MeshPhongMaterial({color:0xdce9ef, wireframe:USE_WIREFRAME})
	);
	ball.position.y = 1; // Move the ball up 1 meter
	ball.position.x = 1;
	ball.position.z = 1;
	ball.receiveShadow = true;
	ball.castShadow = true;
	scene.add(ball);
}

function updateBall(){
	ball.position.x += ballDir[0] * ballSpeed;
	ball.position.z += ballDir[1] * ballSpeed;
}

function cubeHit(){
	distX = camera.position.x - mesh.position.x;
	distZ = camera.position.z - mesh.position.z;
	if((distX<1 && distX>-1) && (distZ<1 && distZ>-1)){
		spawnCube();
		//mesh.position.y += 1;
	}
}

function ballHit(){
	//bot wall reflection
	var botWallNorm = [0,-1];
	if(ball.position.x <=25 && ball.position.x >=-25 && ball.position.z >= 24){
		var norm = -2 * ((botWallNorm[0]*ballDir[0]) + (botWallNorm[1]*ballDir[1]));
		botWallNorm = [botWallNorm[0]*norm, botWallNorm[1]*norm];
		//ballDir = [ballDir[0]+botWallNorm[0], ballDir[1]+botWallNorm[1]];
		ball.position.x = 0;
		ball.position.z = 0;
		ballDir = [0,1];
	}
	//top wall reflection
	var topWallNorm = [0,1];
	if(ball.position.x <=25 && ball.position.x >=-25 && ball.position.z <= -24){
		var norm = -2 * ((topWallNorm[0]*ballDir[0]) + (topWallNorm[1]*ballDir[1]));
		topWallNorm = [topWallNorm[0]*norm, topWallNorm[1]*norm];
		ballDir = [ballDir[0]+topWallNorm[0], ballDir[1]+topWallNorm[1]];
	}
	//right wall reflection
	var rightWallNorm = [-1,0];
	if(ball.position.z <=25 && ball.position.z >=-25 && ball.position.x >= 24){
		var norm = -2 * ((rightWallNorm[0]*ballDir[0]) + (rightWallNorm[1]*ballDir[1]));
		rightWallNorm = [rightWallNorm[0]*norm, rightWallNorm[1]*norm];
		ballDir = [ballDir[0]+rightWallNorm[0], ballDir[1]+rightWallNorm[1]];
	}
	//left wall reflection
	var leftWallNorm = [1,0];
	if(ball.position.z <=25 && ball.position.z >=-25 && ball.position.x <= -24){
		var norm = -2 * ((leftWallNorm[0]*ballDir[0]) + (leftWallNorm[1]*ballDir[1]));
		leftWallNorm = [leftWallNorm[0]*norm, leftWallNorm[1]*norm];
		ballDir = [ballDir[0]+leftWallNorm[0], ballDir[1]+leftWallNorm[1]];
	}
}

function playerHit(){
	//determine norm
	var temp = Math.abs((ball.position.x)-(block.position.x+5))/10;
	//console.log(temp);
	var temp1 = (temp*180);
	var temp1Rad = temp1 * (180/Math.PI);
	var norm0 = Math.cos(temp1Rad);
	var norm1 = Math.sin(temp1Rad);

	//console.log(norm0,norm1);
	var playerNorm = [norm0, norm1];
	if(ball.position.x <=(block.position.x+5) && ball.position.x >=(block.position.x-5) && ball.position.z >= 21.5){
		//var norm = -2 * ((playerNorm[0]*ballDir[0]) + (playerNorm[1]*ballDir[1]));
		//playerNorm = [playerNorm[0]*norm, playerNorm[1]*norm];
		//ballDir = [ballDir[0]+playerNorm[0], ballDir[1]+playerNorm[1]];
		//console.log(norm0,norm1);
		ballDir = playerNorm;
	}
}


function init(){
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x3286aa);
	camera = new THREE.PerspectiveCamera(45, 1280/720, 0.1, 1000);
	var width = window.innerWidth;
	var height = window.innerHeight;
	//camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 1000);
	//spawnCube();	
	xyzAxis();
	spawnBall();

	//spawn 4 walls
	var wallPos = new THREE.Vector3(-25,0,0);
	var wallRot = new THREE.Vector3(0,Math.PI/2,0);
	makeWall(wallPos, wallRot);
	wallPos.set(25,0,0);
	makeWall(wallPos, wallRot);
	wallPos.set(0,0,25);
	wallRot.set(0,0,0);
	makeWall(wallPos, wallRot);
	wallPos.set(0,0,-25);
	makeWall(wallPos, wallRot);


	//FLOOR
	meshFloor = new THREE.Mesh(
		new THREE.PlaneGeometry(50,50, 50,50),
		// MeshBasicMaterial does not react to lighting, so we replace with MeshPhongMaterial
		new THREE.MeshPhongMaterial({color:0x3286aa, wireframe:USE_WIREFRAME})
		// See threejs.org/examples/ for other material types
	);
	meshFloor.rotation.x -= Math.PI / 2;
	// Floor can have shadows cast onto it
	meshFloor.receiveShadow = true;
	scene.add(meshFloor);


	//PLAYER BLOCK
	block = new THREE.Mesh(
		new THREE.BoxGeometry(10,3,1),
		new THREE.MeshPhongMaterial({color:0x91bbd1, wireframe:USE_WIREFRAME})
	);
	block.position.x = 0;
	block.position.z = 22;
	block.receiveShadow = true;
	block.castShadow = true;
	scene.add(block);
	
	
	// LIGHTS
	ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
	scene.add(ambientLight);
	
	light = new THREE.PointLight(0xffffff, 0.8, 100);
	light.position.set(0,20,0);
	light.castShadow = true;
	// Will not light anything closer than 0.1 units or further than 25 units
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 25;
	scene.add(light);
	
	
	camera.position.set(25, 25, 45);
	camera.lookAt(new THREE.Vector3(0,0,0));
	
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	
	// Enable Shadows in the Renderer
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.BasicShadowMap;
	
	document.body.appendChild(renderer.domElement);
	
	animate();
}

function animate(){
	requestAnimationFrame(animate);
	//cubeHit();
	//mesh.rotation.x += 0.01;
	//mesh.rotation.y += 0.02;

	updateBall();
	playerHit();
	ballHit();
	if(keyboard[87]){ // W key
		camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
		camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
	}
	if(keyboard[83]){ // S key
		camera.position.x += Math.sin(camera.rotation.y) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
	}
	if(keyboard[65]){ // A key
		//camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
		//camera.position.z += -Math.cos(camera.rotation.y + Math.PI/2) * player.speed;
		block.position.x -= 0.35;
	}
	if(keyboard[68]){ // D key
		//camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
		//camera.position.z += -Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
		block.position.x += 0.35;
	}
	
	if(keyboard[37]){ // left arrow key
		camera.rotation.y -= player.turnSpeed;
	}
	if(keyboard[39]){ // right arrow key
		camera.rotation.y += player.turnSpeed;
	}
	
	renderer.render(scene, camera);
}

function keyDown(event){
	keyboard[event.keyCode] = true;
}

function keyUp(event){
	keyboard[event.keyCode] = false;
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

window.onload = init;




function xyzAxis(){
	
//x axis
var material = new THREE.LineBasicMaterial({
	color: 0xff0000
});
var geometry = new THREE.Geometry();
geometry.vertices.push(
	new THREE.Vector3( -30, 0, 0 ),
	new THREE.Vector3( 30, 0, 0 ),
	new THREE.Vector3( 25, 5,0)
);
var line1 = new THREE.Line( geometry, material );
scene.add( line1 );

//y axis
material = new THREE.LineBasicMaterial({
	color: 0x008000
});
geometry = new THREE.Geometry();
geometry.vertices.push(
	new THREE.Vector3( 0, -30, 0 ),
	new THREE.Vector3( 0, 30, 0 ),
	new THREE.Vector3( 5, 25,0)
);
var line2 = new THREE.Line( geometry, material );
scene.add( line2 );

//z axis
material = new THREE.LineBasicMaterial({
	color: 0x0000FF
});
geometry = new THREE.Geometry();
geometry.vertices.push(
	new THREE.Vector3( 0, 0, -30 ),
	new THREE.Vector3( 0, 0, 30 ),
	new THREE.Vector3( 0, 5,25)
);
var line3 = new THREE.Line( geometry, material );
scene.add( line3 );

}