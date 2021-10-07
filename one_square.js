
// some globals
var gl;

var delay = 100;
var direction = true;
var lineBuffer;
var triangleBuffer;
var colorLine;
var colorTriangle;
var program;
var lineVertices = [];
var triangleVertices = [];
var lineColors = [];
var triangleColors = [];

var lineOffset, triangleOffset, colorOff1, colorOff2;

var enabledLines = false;
var enabledTriangle = false;


var width = 0.0;
var height = 0.0;
var gColor = "White"
var gColorVals = [255,255,255,1]
var gDraw = "None"

var max_prims = 6000;

var message = "Select a button to begin"

window.onload = function init() {

	if(!enabledLines && !enabledTriangle){
		document.getElementById('text-area').innerHTML = message
	}

	// get the canvas handle from the document's DOM
    var canvas = document.getElementById( "gl-canvas" );
	height = canvas.height
	width = canvas.width
	// initialize webgl
    gl = WebGLUtils.setupWebGL(canvas);

	// check for errors
    if ( !gl ) { 
		alert("WebGL isn't available"); 
	}

    // set up a viewing surface to display your image
    gl.viewport(0, 0, canvas.width, canvas.height);

	// clear the display with a background color 
	// specified as R,G,B triplet in 0-1.0 range
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );

    //  Load shaders -- all work done in init_shaders.js
    program = initShaders(gl, "vertex-shader", "fragment-shader");

	// make this the current shader program
    gl.useProgram(program);

	// Get a handle to theta  - this is a uniform variable defined 
	// by the user in the vertex shader, the second parameter should match
	// exactly the name of the shader variable
    thetaLoc = gl.getUniformLocation(program, "theta");

	colorLoc = gl.getUniformLocation(program, "vertColor");

	lineBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, (64*30000), gl.STATIC_DRAW)

	triangleBuffer = gl.createBuffer()
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, (96*30000), gl.STATIC_DRAW)

	colorLine = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorLine)
	gl.bufferData(gl.ARRAY_BUFFER, (64*30000), gl.STATIC_DRAW)

	colorTriangle = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorTriangle)
	gl.bufferData(gl.ARRAY_BUFFER, (96*30000), gl.STATIC_DRAW)

    render();
};

lineClicks = 0;
triangleClicks = 0;

tempx=0
tempy=0
tempz=0
tempw=0

tempx2=0
tempy2=0
tempz2=0
tempw2=0
function onClick(event) {
	x = event.clientX
	y = event.clientY
	z = 0;

	myVec = deviceToWorld(x, height-y, z)
	myVec2 = worldToNDC(myVec[0],myVec[1], myVec[2])
	if(enabledLines){
		lineClicks++
		if(lineClicks % 2 != 0){
			tempx = myVec2[0]
			tempy = myVec2[1]
			tempz = myVec2[2]
			tempw = myVec2[3] 
		} else if (lineClicks % 2 == 0){
		lineVertices.push([tempx, tempy, tempz, tempw])
		lineColors.push(gColorVals)
		lineVertices.push([myVec2[0], myVec2[1], myVec2[2], myVec2[3]])
		lineColors.push(gColorVals)
		}
	}
	if(enabledTriangle){
		triangleClicks++
		if(triangleClicks % 3 == 1) {
			tempx = myVec2[0]
			tempy = myVec2[1]
			tempz = myVec2[2]
			tempw = myVec2[3] 
		} else if (triangleClicks % 3 == 2){
			tempx2 = myVec2[0]
			tempy2 = myVec2[1]
			tempz2 = myVec2[2]
			tempw2 = myVec2[3] 
		} else if (triangleClicks % 3 == 0){
			triangleVertices.push([tempx, tempy, tempz, tempw])
			triangleColors.push(gColorVals)
			triangleVertices.push([tempx2, tempy2, tempz2, tempw2])
			triangleColors.push(gColorVals)
			triangleVertices.push([myVec2[0], myVec2[1], myVec2[2], myVec2[3]])
			triangleColors.push(gColorVals)
		}
	}
}

function translate2D(tx,ty,tz){
	translation = mat4(
		1, 0, 0, tx,
		0, 1, 0, ty,
		0, 0, 1, tz,
		0, 0, 0, 1)
	return translation 
}

function scale2D(sx,sy,sz){
	scale = mat4(
		sx, 0, 0, 0,
		0, sy, 0, 0,
		0, 0, sz, 0,
		0, 0, 0,  1,
	)
	return scale
}

function dotProd(v1, v2){

	sum = 0.0
	if(v1.length != v2.length){
		throw "dotProd: vectors are not the same dimension"
	}

	for(let i = 0; i < v1.length; i++){
		sum += v1[i] * v2[i]
	}

	return sum
}

function deviceToWorld(x, y, z) {
	myVec = vec4(x, y, z, 1)
	tMat = translate2D(-8,-8, 0)

	x1 = dotProd(tMat[0], myVec)
	y1 = dotProd(tMat[1], myVec)

	myVec2 = vec4(x1,y1, 0, 1)
	sMat = scale2D(1/512, 1/512, 0)

	x2 = dotProd(sMat[0], myVec2)
	y2 = dotProd(sMat[1], myVec2)

	myVec3 = vec4(x2, y2, 0, 1)
	sMat2 = scale2D(200,200, 0)

	x3 = dotProd(sMat2[0], myVec3)
	y3 = dotProd(sMat2[1], myVec3)

	myVec4 = vec4(x3, y3, 0, 1)
	tMat2 = translate2D(-100, -100, 0)

	x4 = dotProd(tMat2[0], myVec4)
	y4 = dotProd(tMat2[1], myVec4)

	returnVec = vec4(x4, y4, 0, 1)

	return returnVec
}

function worldToNDC(wx, wy, wz){
	myVec = vec4(wx, wy, wz, 1)
	sMat = scale2D(1/100, 1/100, 0)

	xDot = dotProd(sMat[0], myVec)
	yDot = dotProd(sMat[1], myVec)

	returnVec = vec4(xDot, yDot, 0, 1)
	return returnVec
}

counter = 0;
function render() {
	// this is render loop

	// clear the display with the background color
    gl.clear( gl.COLOR_BUFFER_BIT );

	if(gDraw !== 'None'){
		message = "Draw " + gDraw + " Enabled\nColor Selected: " 
			+ gColor + "\nColor Value: " + gColorVals

		document.getElementById('text-area').innerHTML = message
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
	gl.bufferSubData(gl.ARRAY_BUFFER, lineOffset, flatten(lineVertices));
	lineOffset += 32;
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);
	gl.bindBuffer(gl.ARRAY_BUFFER, colorLine)
	gl.bufferSubData(gl.ARRAY_BUFFER, colorOff1, flatten(lineColors))
	colorOff1 += 64;
	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0 , 0);
	gl.enableVertexAttribArray(vColor)
	
	gl.drawArrays(gl.LINES, 0, 48000)

	gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuffer);
	gl.bufferSubData(gl.ARRAY_BUFFER, triangleOffset, flatten(triangleVertices));
	triangleOffset += 32;
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	gl.bindBuffer(gl.ARRAY_BUFFER, colorTriangle)
	gl.bufferSubData(gl.ARRAY_BUFFER, colorOff2, flatten(triangleColors))
	colorOff2 += 64;
	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0 , 0);
	gl.enableVertexAttribArray(vColor)

	gl.drawArrays(gl.TRIANGLES, 0, 48000)

    setTimeout(
        function (){requestAnimFrame(render);}, delay
    );
}

function enableDraw(input){
	if(input === 'lines') {
		gDraw = "Lines"
		enabledLines =  true;
		enabledTriangle = false;
	} else if (input === 'triangles') {
		gDraw = "Triangles"
		enabledLines = false;
		enabledTriangle = true;
	}
}

function setColor(input){
	switch (input) {
		case 'red':
			gColor = "Red"
			gColorVals = [255,0,0,1]
			break;

		case 'green':
			gColor = "Green"
			gColorVals = [0,255,0,1]
			break;

		case 'blue':
			gColor = "Blue"
			gColorVals = [0, 0, 255, 1]
			break;

		case 'purple':
			gColor = "Purple"
			gColorVals = [255, 0, 255 ,1]
			break;

		case 'cyan':
			gColor = "Cyan"
			gColorVals = [0, 255, 255, 1]
			break;

		default:
			gColor = "White"
			gColorVals = [255, 255, 255, 1]
			break;

	}
}