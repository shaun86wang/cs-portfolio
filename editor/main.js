var textureUrl = [
    "https://farm5.staticflickr.com/4605/40580542091_84a07808c9_m.jpg",
    "https://farm5.staticflickr.com/4651/40580497361_4b52defcf2_m.jpg",
    "https://farm5.staticflickr.com/4749/39693961735_86c06c4628_z.jpg",
    "https://farm1.staticflickr.com/798/27272709228_5984d9c13f_z.jpg",
    "https://farm1.staticflickr.com/784/27272711208_f826b83887.jpg"
];

var textureUnit = {
    whiteWall: 0,
    greyWall: 1,
    purpleWall: 2,
    silver: 3,
    wood: 4
};

var material;

var frameNum = -1;

var animationPoints;

var transformMatrix = mat4();
var textureNum = textureUrl.length;

var lightPosition = vec4(-30, 10, 0, 0.0);

var lightAmbient = vec4(1, 1, 1, 1.0);
var lightDiffuse = vec4(0.5, 0.5, 0.5, 1.0);
var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var materialAmbient = vec4(0.05, 0.05, 0.05, 1.0);
var materialDiffuse = vec4(0.5, 0.5, 0.5, 1.0);
var materialSpecular = vec4(0.2, 0.2, 0.2, 1.0);
var shininess = 500.0;

var canvas;
var gl;

var points = [];
var colors = [];
var normals = [];
var texCoordsArray = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 1;
var theta = [ 0, 0, 0 ];

var thetaLoc;
var ambientProductLoc;
var diffuseProductLoc;
var specularProductLoc;
var lightPositionLoc;
var shininessLoc;
var textureLoc;

var eye = vec3(0, 0, 5);
var at = vec3(0.0, 0.0, -100);
var up = vec3(0.0, 1.0, 0.0);

var near = 1.0;
var far = 400.0;

var fovy = 25.0;
var aspect;

var viewMatrixLoc, projectionMatrixLoc;
var viewMatrix, projectionMatrix;

var freezed = true;

var program;

// this function initalize the canvas for the 3d model
function init3d(){
    // webGL init
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height );
    aspect = canvas.width / canvas.height;
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    getShaderLocations(program);

    // add input controls
    setInputs();

    // set the route through which the object will move
    setAnimationPoints();

    // load textures
    loadImages();
};

// this function recalculate the vertices for the 3d bezier model
function render3d() {

    createBezierCurves();

    // create all models
    var models = [];
    curves.forEach((c)=>{
        models.push(new BezierModel(c.vertices));
    });
    points = [];
    normals = [];
    colors = [];
    texCoordsArray = [];
    // build the main object
    buildObjects({objects:models});

    // load colors, points, and normals to buffer
    loadVertices(program);
    loadColors(program);
    loadNormals(program);
    loadTextureArray(program);

}

// this function updates the views of the 3d model
function updateView(){
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    loadRotation();
    loadViewMatrix();
    loadProjectionMatrix();
    loadPhongModel();
    var l = points.length;
    gl.uniform1i(textureLoc, material);
    gl.drawArrays( gl.TRIANGLES, 0, l);

    updateUIContent();
}


function setInputs(){
    document.getElementById( "xButton" ).onclick = function () {
        axis = xAxis;
    };
    document.getElementById( "yButton" ).onclick = function () {
        axis = yAxis;
    };
    document.getElementById( "zButton" ).onclick = function () {
        axis = zAxis;
    };
    document.getElementById( "freezeButton").onclick = function (){
        freezed = !freezed;
    };

    document.getElementById("fovySlider").oninput = function (){
        fovy = this.value;
        console.log(fovy);
    };
    document.getElementById("rotate").oninput = function (){
        theta[0] = this.value/2*Math.PI;
    };

    document.getElementById("eyeXSlider").oninput = function (){
        eye[0] = this.value;
    };
    document.getElementById("eyeYSlider").oninput = function (){
        eye[1] = this.value;
    };
    document.getElementById("eyeZSlider").oninput = function (){
        eye[2] = this.value;
    };

    document.getElementById("atXSlider").oninput = function (){
        at[0] = this.value;
    };
    document.getElementById("atYSlider").oninput = function (){
        at[1] = this.value;
    };
    document.getElementById("atZSlider").oninput = function (){
        at[2] = this.value;
    };

    document.getElementById("upXSlider").oninput = function (){
        up[0] = this.value;
        updateView();
    };
    document.getElementById("upYSlider").oninput = function (){
        up[1] = this.value;
        updateView();
    };
    document.getElementById("upZSlider").oninput = function (){
        up[2] = this.value;
        updateView();
    };
    document.getElementById("materialSelector").onchange = function () {
        material = this.value;
    }
    document.getElementById("animateButton").onclick = function(){
        frameNum = 0;
    }
}

function getShaderLocations(program){
    thetaLoc = gl.getUniformLocation(program, "theta");
    viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

    ambientProductLoc = gl.getUniformLocation(program, "ambientProduct");
    diffuseProductLoc = gl.getUniformLocation(program, "diffuseProduct");
    specularProductLoc = gl.getUniformLocation(program, "specularProduct");
    lightPositionLoc = gl.getUniformLocation(program, "lightPosition");
    shininessLoc = gl.getUniformLocation(program, "shininess");

    textureLoc = gl.getUniformLocation(program, "texture");
}

function updateUIContent(){
    document.getElementById("eyeLabel").innerHTML = "Eye : " + eye;
    document.getElementById("atLabel").innerHTML = "At : " + at;
    document.getElementById("upLabel").innerHTML = "Up : " + up;
}

function loadVertices(program) {
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
}

function loadColors(program) {
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
}

function loadNormals(program){
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
}

function loadTextureArray(program){

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);
    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);
}

function loadPhongModel(){
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
    gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
    gl.uniform4fv(specularProductLoc, flatten(specularProduct));
    gl.uniform4fv(lightPositionLoc, flatten(lightPosition));
    gl.uniform1f(shininessLoc, shininess);
}

function loadViewMatrix() {
    viewMatrix = lookAt(eye, at, up);

    // set the rotation of the view
    viewMatrix = mult(viewMatrix, rotate(theta[xAxis], [1, 0, 0]));
    viewMatrix = mult(viewMatrix, rotate(theta[yAxis], [0, 1, 0]));
    viewMatrix = mult(viewMatrix, rotate(theta[zAxis], [0, 0, 1]));

    // set the translation of the view and create animation
    frameNum = frameNum === 100 ? -1 : frameNum;
    transformMatrix = mat4();
    if(frameNum > -1) {
        var p = animationPoints[frameNum];
        transformMatrix = mult(transformMatrix, translate(p[0], 0.0, p[1]));
        frameNum += 1;
    }
    viewMatrix = mult(viewMatrix, transformMatrix);

    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));
}

function loadProjectionMatrix(){
    projectionMatrix = perspective(fovy, aspect, near, far);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
}

function loadRotation(){
    theta[axis] += freezed ? 0 : 2.0;
    gl.uniform3fv(thetaLoc, theta);

}

function loadImage(program, url, texUnit){
    var texture = gl.createTexture();

    var image = new Image();
    image.crossOrigin = "Anonymous";
    image.src = url;
    image.onload = function() {
        loadTexture(image, texture, texUnit);
        if(texUnit >= textureNum -1){
            render3d();
        }
    };

}

function loadTexture(image, texture, texUnit) {
    gl.activeTexture(gl.TEXTURE0 + texUnit);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
}

function loadImages(){
    for(var i = 0; i < textureNum; i++){
        loadImage(program, textureUrl[i], i);
    }
}

// the function create an array of points so that the object can move along a bezier curve
function setAnimationPoints(){
    var a = vec4(0, 0, 0, 1);
    var b = vec4(-5, -25, 0, 1);
    var c = vec4(5, -25, 0, 1);
    var d = vec4(0, 0, 0, 1);
    var bezier = new Bezier([a, b, c, d]);
    animationPoints = bezier.vertices;
}



