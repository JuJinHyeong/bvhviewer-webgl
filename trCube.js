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

var shaderProgram;

function initialiseBuffer() {
		
    var vertexData = [
		-0.5, 0.5, 0.5,		1.0, 1.0, 1.0, 0.5,		0.0, 1.0,//3
        0.5, 0.5, 0.5,		1.0, 1.0, 1.0, 0.5,		1.0, 1.0,//1
		0.5, 0.5, -0.5,		1.0, 1.0, 1.0, 0.5,		1.0, 1.0,//2
				
		-0.5, 0.5, 0.5,		1.0, 1.0, 1.0, 0.5,		0.0, 1.0,//3
		0.5, 0.5, -0.5,		1.0, 1.0, 1.0, 0.5,		1.0, 1.0,//2
		-0.5, 0.5, -0.5,	1.0, 1.0, 1.0, 0.5,		0.0, 1.0,//4
		 
		0.5, 0.5, -0.5,		0.0, 0.0, 0.0, 0.5,		1.0, 1.0,//2
		0.5, -0.5, -0.5,	0.0, 0.0, 0.0, 0.5,		1.0, 0.0,//6
		-0.5,-0.5,-0.5,		0.0, 0.0, 0.0, 0.5,		0.0, 0.0,//8
		   
		-0.5, 0.5, -0.5,	0.0, 0.0, 0.0, 0.5,		0.0, 1.0,//4
		0.5, 0.5, -0.5,		0.0, 0.0, 0.0, 0.5,		1.0, 1.0,//2
		-0.5,-0.5,-0.5,		0.0, 0.0, 0.0, 0.5,		0.0, 0.0,//8
			
		0.5, -0.5, 0.5,		1.0, 0.5, 0.0, 0.5,		0.0, 1.0,//5
		0.5, -0.5, -0.5,	1.0, 0.5, 0.0, 0.5,		0.0, 1.0,//6
		0.5, 0.5, -0.5,		1.0, 0.5, 0.0, 0.5,		1.0, 1.0,//2

		0.5, -0.5, 0.5,		1.0, 0.5, 0.0, 0.5,		0.0, 1.0,//5
		0.5, 0.5, -0.5,		1.0, 0.5, 0.0, 0.5,		1.0, 1.0,//2
		0.5, 0.5, 0.5,		1.0, 0.5, 0.0, 0.5,		1.0, 1.0,//1
				 
		-0.5, 0.5, -0.5,	1.0, 0.0, 0.0, 0.5,		0.0, 1.0,//4
		-0.5,-0.5, -0.5,	1.0, 0.0, 0.0, 0.5,		0.0, 0.0,//8
		-0.5, -0.5, 0.5,	1.0, 0.0, 0.0, 0.5,		0.0, 0.0,//7
		
		-0.5, 0.5, 0.5,		1.0, 0.0, 0.0, 0.5,		0.0, 1.0,//3
		-0.5, 0.5, -0.5,	1.0, 0.0, 0.0, 0.5,		0.0, 1.0,//4
		-0.5, -0.5, 0.5,	1.0, 0.0, 0.0, 0.5,		0.0, 0.0,//7
		
		-0.5, -0.5, 0.5,	0.0, 0.0, 1.0, 0.5,		0.0, 0.0,//7
		0.5, -0.5, 0.5,		0.0, 0.0, 1.0, 0.5,		1.0, 0.0,//5
		0.5, 0.5, 0.5,		0.0, 0.0, 1.0, 0.5,		1.0, 1.0,//1
				 
		-0.5, -0.5, 0.5,	0.0, 0.0, 1.0, 0.5,		0.0, 0.0,//7
		0.5, 0.5, 0.5,		0.0, 0.0, 1.0, 0.5,		1.0, 1.0,//1
		-0.5, 0.5, 0.5,		0.0, 0.0, 1.0, 0.5,		0.0, 1.0,//3
		
		 0.5, -0.5, -0.5,	0.0, 1.0, 0.0, 0.5,		1.0, 0.0,//6
		 0.5, -0.5, 0.5,	0.0, 1.0, 0.0, 0.5,		1.0, 0.0,//5
		-0.5, -0.5, 0.5,	0.0, 1.0, 0.0, 0.5,		0.0, 0.0,//7
		
		-0.5,-0.5, -0.5,	0.0, 1.0, 0.0, 0.5,		0.0, 0.0,//8
		 0.5, -0.5, -0.5,	0.0, 1.0, 0.0, 0.5,		1.0, 0.0,//6
		-0.5, -0.5, 0.5,	0.0, 1.0, 0.0, 0.5,		0.0, 0.0,//7
    ];
	
    // Generate a buffer object
    gl.vertexBuffer = gl.createBuffer();
    // Bind buffer as a vertex buffer so we can fill it with data
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);
    return testGLError("initialiseBuffers");
}

function initialiseShaders() {
    var vertexShaderSource = document.getElementById('vs').innerHTML;

    gl.vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(gl.vertexShader, vertexShaderSource);
    gl.compileShader(gl.vertexShader);
    if (!gl.getShaderParameter(gl.vertexShader, gl.COMPILE_STATUS)) {
        alert("Failed to compile the vertex shader.\n" + gl.getShaderInfoLog(gl.vertexShader));
        return false;
    }

    var fragmentShaderSource = document.getElementById('fs').innerHTML;

    gl.fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(gl.fragShader, fragmentShaderSource);
    gl.compileShader(gl.fragShader);
    if (!gl.getShaderParameter(gl.fragShader, gl.COMPILE_STATUS)) {
        alert("Failed to compile the fragment shader.\n" + gl.getShaderInfoLog(gl.fragShader));
        return false;
    }

    gl.programObject = gl.createProgram();

    // Attach the fragment and vertex shaders to it
    gl.attachShader(gl.programObject, gl.fragShader);
    gl.attachShader(gl.programObject, gl.vertexShader);

    // Bind the custom vertex attribute "myVertex" to location 0
    gl.bindAttribLocation(gl.programObject, 0, "myVertex");
    gl.bindAttribLocation(gl.programObject, 1, "myColor");
	gl.bindAttribLocation(gl.programObject, 2, "myUV");

    // Link the program
    gl.linkProgram(gl.programObject);

    if (!gl.getProgramParameter(gl.programObject, gl.LINK_STATUS)) {
        alert("Failed to link the program.\n" + gl.getProgramInfoLog(gl.programObject));
        return false;
    }

    gl.useProgram(gl.programObject);

    return testGLError("initialiseShaders");
}

var proj_matrix = glm.perspective(glm.radians(30), 1.0, 1, 5.0);
var view_matrix = glm.translate(glm.mat4(1.0), glm.vec3(0, 0, -4));

function normalizeVec3(v)
{
	sq = v[0]*v[0] + v[1]*v[1] + v[2]*v[2]; 
	sq = Math.sqrt(sq);
	if (sq < 0.000001 ) // Too Small
		return -1; 
	v[0] /= sq; v[1] /= sq; v[2] /= sq; 
}

rotValue = 0.0; 
animRotValue = 0.0;
transX = 0.0;
frames = 1;

function renderScene() {
    //console.log("Frame "+frames+"\n");
    frames += 1 ;
	var rotAxis = glm.vec3(1.0/Math.sqrt(2.0), 1.0/Math.sqrt(2.0), 0.0);
	
    var Pmatrix = gl.getUniformLocation(gl.programObject, "Pmatrix");
    var Vmatrix = gl.getUniformLocation(gl.programObject, "Vmatrix");
    var Mmatrix = gl.getUniformLocation(gl.programObject, "Mmatrix");
	
	var mov_matrix = glm.mat4(1.0);
	mov_matrix = glm.rotate(mov_matrix, rotValue, rotAxis);
    rotValue += animRotValue;
	mov_matrix = glm.translate(mov_matrix, glm.vec3(transX, 0.0, 0.0));

    gl.uniformMatrix4fv(Pmatrix, false, proj_matrix.elements);
    gl.uniformMatrix4fv(Vmatrix, false, view_matrix.elements);
    gl.uniformMatrix4fv(Mmatrix, false, mov_matrix.elements);

    if (!testGLError("gl.uniformMatrix4fv")) {
        return false;
    }

    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 36, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, gl.FALSE, 36, 12);
	gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, gl.FALSE, 36, 28);


    if (!testGLError("gl.vertexAttribPointer")) {
        return false;
    }
    // gl.enable(gl.DEPTH_TEST);
    // gl.depthFunc(gl.LEQUAL); 
	// gl.enable(gl.CULL_FACE);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.blendEquation(gl.FUNC_ADD);

    gl.clearColor(0.6, 0.8, 1.0, 1.0);
    gl.clearDepth(1.0); 
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	gl.drawArrays(gl.TRIANGLES, 0, 36);
    document.getElementById("matrix0").innerHTML = mov_matrix.elements[0].toFixed(4);
	document.getElementById("matrix1").innerHTML = mov_matrix.elements[1].toFixed(4);
	document.getElementById("matrix2").innerHTML = mov_matrix.elements[2].toFixed(4);
	document.getElementById("matrix3").innerHTML = mov_matrix.elements[3].toFixed(4);
	document.getElementById("matrix4").innerHTML = mov_matrix.elements[4].toFixed(4);
	document.getElementById("matrix5").innerHTML = mov_matrix.elements[5].toFixed(4);
	document.getElementById("matrix6").innerHTML = mov_matrix.elements[6].toFixed(4);
	document.getElementById("matrix7").innerHTML = mov_matrix.elements[7].toFixed(4);
	document.getElementById("matrix8").innerHTML = mov_matrix.elements[8].toFixed(4);
	document.getElementById("matrix9").innerHTML = mov_matrix.elements[9].toFixed(4);
	document.getElementById("matrix10").innerHTML = mov_matrix.elements[10].toFixed(4);
	document.getElementById("matrix11").innerHTML = mov_matrix.elements[11].toFixed(4);
	document.getElementById("matrix12").innerHTML = mov_matrix.elements[12].toFixed(4);
	document.getElementById("matrix13").innerHTML = mov_matrix.elements[13].toFixed(4);
	document.getElementById("matrix14").innerHTML = mov_matrix.elements[14].toFixed(4);
	document.getElementById("matrix15").innerHTML = mov_matrix.elements[15].toFixed(4);
    if (!testGLError("gl.drawArrays")) {
        return false;
    }

    return true;
}

function main() {
	var test = document.getElementById("bvh").innerHTML;
	console.log(test);

	var canvas = document.getElementById("helloapicanvas");
    console.log("Start");
	
    if (!initialiseGL(canvas)) {
        return;
    }

    if (!initialiseBuffer()) {
        return;
    }

    if (!initialiseShaders()) {
        return;
    }

    // Render loop
    requestAnimFrame = (
	function () {
        //	return window.requestAnimationFrame || window.webkitRequestAnimationFrame 
	//	|| window.mozRequestAnimationFrame || 
	   	return function (callback) {
			    // console.log("Callback is"+callback); 
			    window.setTimeout(callback, 10, 10); };
    })();

    (function renderLoop(param) {
        if (renderScene()) {
            // Everything was successful, request that we redraw our scene again in the future
            requestAnimFrame(renderLoop);
        }
    })();
}
