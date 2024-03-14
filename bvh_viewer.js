//(CC-NC-BY) JuJinhyeong 2019
var gl;

function testGLError(functionLastCalled) {

    var lastError = gl.getError();
	
    if (lastError != gl.NO_ERROR) {
        alert(functionLastCalled + " failed (" + lastError + ")");
        return false;
    }

    return true;
}

function initialiseGL(canvas) {
    try {
		// Try to grab the standard context. If it fails, fallback to experimental
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    catch (e) {
    }

    if (!gl) {
        alert("Unable to initialise WebGL. Your browser may not support it");
        return false;
    }

    return true;
}

var human_body;

var Pmatrix;
var Vmatrix;
var Mmatrix;
var color;
var camera_pos;
var prev_camera_pos;
var prev_y = 0.0;
var zoom = 1.0;
function init_uniform_matrix(){
	Pmatrix = gl.getUniformLocation(gl.programObject, "Pmatrix");
	Vmatrix = gl.getUniformLocation(gl.programObject, "Vmatrix");
	Mmatrix = gl.getUniformLocation(gl.programObject, "Mmatrix");
	color = gl.getUniformLocation(gl.programObject, "lineColor");	
	camera_pos = glm.vec4(0, 0, -300, 1);
	prev_camera_pos = glm.vec4(0, 0, -300, 1);
}

function set_camera_pos(){
	camera_pos = glm.rotate(glm.mat4(1.0), glm.radians(mouse_changed_x), glm.vec3(0, 1, 0))['*'](prev_camera_pos);
	camera_pos[1] = Math.sin(glm.radians(prev_y + mouse_changed_y)) * 300;

	camera_pos[0] /= zoom;
	camera_pos[1] /= zoom;
	camera_pos[2] /= zoom;
}

var frames = 0;
function renderScene() {
    if (!testGLError("gl.uniformMatrix4fv")) {
        return false;
    }

    gl.clearColor(0.6, 0.8, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
	
	set_camera_pos();

	var proj_matrix = glm.perspective(glm.radians(45.0), 1.0, 1, 1000.0);
	var view_matrix = glm.lookAt(glm.vec3(camera_pos[0], camera_pos[1], camera_pos[2]), glm.vec3(0, 0, 0), glm.vec3(0, 1, 0));
	var mov_matrix = glm.mat4(1.0);
	mov_matrix = glm.scale(mov_matrix, glm.vec3(0.5, 0.5, 0.5));
	mov_matrix = glm.translate(mov_matrix, glm.vec3(0.0, 0.0, 0.0));
	
    gl.uniformMatrix4fv(Pmatrix, false, proj_matrix.elements);
    gl.uniformMatrix4fv(Vmatrix, false, view_matrix.elements);
    gl.uniformMatrix4fv(Mmatrix, false, mov_matrix.elements);
	gl.uniform4f(color, 1.0, 0.0, 0.0, 1.0);

	var vertexData = [];
	vertexData = human_body.vertices[frames++];
	if(frames == human_body.frame){
		frames = 0;
	}
    gl.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
	
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, gl.FALSE, 16, 0);
	
    if (!testGLError("gl.vertexAttribPointer")) {
        return false;
    }

	gl.indexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(human_body.indices), gl.STATIC_DRAW);

	gl.drawElements(gl.LINES, human_body.indices.length, gl.UNSIGNED_SHORT, 0);

    if (!testGLError("gl.drawElements")) {
        return false;
    }
    return true;
}

function select_walk(){
	human_body = create_bvh('walk');
}

function select_punch(){
	human_body = create_bvh('punch');
}

function main() {
	var canvas = document.getElementById("helloapicanvas");
	//event for moving camera
	init_event(canvas);
	//load bvh file
	human_body = create_bvh('walk');
	console.log("Start");
	
    if (!initialiseGL(canvas)) {
        return;
    }

    if (!initialiseShaders()) {
        return;
    }
	
	init_uniform_matrix();
	
    // Render loop
    requestAnimFrame = (
	function () {
	   	return function (callback) {
			    window.setTimeout(callback, 10, 10); };
    })();

    (function renderLoop(param) {
        if (renderScene()) {
            requestAnimFrame(renderLoop);
        }
    })();
}
