var textureUrl = [
    "https://farm5.staticflickr.com/4757/26708521228_a4c56e9676_b.jpg",
    "https://farm5.staticflickr.com/4741/38770112790_0478a96c5e_b.jpg",
    "https://farm5.staticflickr.com/4605/40580542091_84a07808c9_m.jpg",
    "https://farm5.staticflickr.com/4651/40580497361_4b52defcf2_m.jpg",
    "https://farm5.staticflickr.com/4749/39693961735_86c06c4628_z.jpg",
    "https://farm5.staticflickr.com/4791/39693961305_221ef8eddf_z.jpg",
    "https://farm5.staticflickr.com/4798/39694542895_eef4fc3598_k.jpg"
];

var textureUnit = {
    brickWall: 0,
    window: 1,
    whiteWall: 2,
    greyWall: 3,
    purpleWall: 4,
    metal: 5,
    text: 6
};

var textureNum = textureUrl.length;
var imageNum = 0;


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
for(var i = 0; i < textureNum; i++){
    points[i] = [];
    colors[i] = [];
    normals[i] = [];
    texCoordsArray[i] = [];
}
var texCoordsArrayLengths = [];


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

var eye = vec3(0, 1, 5);
var at = vec3(0.0, 0.0, -100);
var up = vec3(0.0, 1.0, 0.0);

var near = 1.0;
var far = 400.0;

var fovy = 80.0;
var aspect;

var viewMatrixLoc, projectionMatrixLoc;
var viewMatrix, projectionMatrix;

var freezed = true;

var program;

window.onload = function init(){
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

    // build the main object
    buildObjects(window.mainObject);

    // set up HTML inputs for interaction
    setInputs();

    // load uniform locations in GLSL
    getShaderLocations(program);

    // load the images for textures
    loadImages();

    // load colors, points, and normals to buffer
    loadVertices(program);
    loadColors(program);
    loadNormals(program);
    loadTextureArray(program);



    // render the scene
    render();
};



function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    loadRotation();
    loadViewMatrix();
    loadProjectionMatrix();
    loadPhongModel();
    var objOffset = 0;
    for(var i = 0; i < textureNum; i++){
        gl.uniform1i(textureLoc, i);
        gl.drawArrays( gl.TRIANGLES, objOffset, texCoordsArrayLengths[i] );
        objOffset += texCoordsArrayLengths[i];

    }

    updateUIContent();

    requestAnimFrame( render );
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
    };
    document.getElementById("rotate").oninput = function (){
        theta[1] = this.value/2*Math.PI;
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
        up[0] = this.value
    };
    document.getElementById("upYSlider").oninput = function (){
        up[1] = this.value
    };
    document.getElementById("upZSlider").oninput = function (){
        up[2] = this.value
    };
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
    $(function(){
        $("#eyeLabel").text("Eye : " + eye);
        $("#atLabel").text("At : " + at);
        $("#upLabel").text("Up : " + up);
    })
}

function loadVertices(program) {
    points = [].concat.apply([], points);
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
}

function loadColors(program) {
    colors = [].concat.apply([], colors);
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
}

function loadNormals(program){
    normals = [].concat.apply([], normals);
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
}

function loadTextureArray(program){
    for(var i = 0; i < textureNum; i++){
        texCoordsArrayLengths[i] = texCoordsArray[i].length;
    }
    texCoordsArray = [].concat.apply([], texCoordsArray);

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
    viewMatrix = mult(viewMatrix, rotate(theta[xAxis], [1, 0, 0]));
    viewMatrix = mult(viewMatrix, rotate(theta[yAxis], [0, 1, 0]));
    viewMatrix = mult(viewMatrix, rotate(theta[zAxis], [0, 0, 1]));
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
    image.onload = function() {loadTexture(image, texture, texUnit);};

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





