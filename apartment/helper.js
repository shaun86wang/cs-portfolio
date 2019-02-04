// multiplies a 4x4 and 4x1 matrix
function customMult(u, v){
    var result = [];
    for(var i = 0; i < u.length; ++i){
        result.push(dot(u[i], v));
    }
    return result;
}

// rotate the given object and the objects within it recursively counter clockwise by given degree on Y axis
function rotateObject(object, rotation){
    // if the object is a primitive (cube or plane), rotate the primitive
    if(object.vertices){
        for(var i = 0; i < object.vertices.length; i++){
            object.vertices[i] = customMult(rotate(rotation, [0, 1, 0]), object.vertices[i]);
        }
    // if the object contain other objects, rotate child objects
    } else if (object.objects){
        object.objects.forEach((o) => (rotateObject(o, rotation)));
    } else {
        return
    }
}

// rotate the given object and the objects within it recursively counter clockwise by given degree on X axis
function rotateObjectX(object, rotation){
    // if the object is a primitive (cube or plane), rotate the primitive
    if(object.vertices){
        for(var i = 0; i < object.vertices.length; i++){
            object.vertices[i] = customMult(rotate(rotation, [1, 0, 0]), object.vertices[i]);
        }
        // if the object contain other objects, rotate child objects
    } else if (object.objects){
        object.objects.forEach((o) => (rotateObject(o, rotation)));
    } else {
        return
    }
}

// translate the given object and the objects within it recursively to the location
function moveObject(object, location){
    // if the object is a primitive (cube or plane), translate the primitive
    if(object.vertices){
        for(var i = 0; i < object.vertices.length; i++){
            object.vertices[i] = customMult(translate(location), object.vertices[i]);
        }
        // if the object contain other objects, translate child objects
    } else if (object.objects){
        object.objects.forEach((o) => (moveObject(o, location)));
    } else {
        return
    }
}

// create a 3D cube configuration
function createCubeConfig(length, width, height, baseColor, texUnit, texScale=vec2(1, 1)) {
    var c = {};
    c.length = length;
    c.width = width;
    c.height = height;
    c.baseColor = baseColor;
    c.texUnit = texUnit;
    c.texScale = texScale;
    return c;
}

// create a 2D plane configuration
function createSquareConfig(width, height, baseColor, texUnit, texScale=vec2(1, 1)){
    var c = {};
    c.width = width;
    c.height = height;
    c.baseColor = baseColor;
    c.texUnit = texUnit;
    c.texScale = texScale;
    return c;
}

// creating the cube given the configuration
class Cube{
    constructor(config){
        this.length = config.length;
        this.width = config.width;
        this.height = config.height;
        this.baseColor = config.baseColor;
        this.texUnit = config.texUnit;
        this.texScale = config.texScale;
        this.calculateVertex();
    }
    calculateVertex() {
        this.vertices = [];
        this.vertices[0] = vec4(this.length / 2, this.height, this.width / 2, 1.0);
        this.vertices[1] = vec4(-this.length / 2, this.height, this.width / 2, 1.0);
        this.vertices[2] = vec4(-this.length / 2, 0, this.width / 2, 1.0);
        this.vertices[3] = vec4(this.length / 2, 0, this.width / 2, 1.0);
        this.vertices[4] = vec4(this.length / 2, this.height, -this.width / 2, 1.0);
        this.vertices[5] = vec4(-this.length / 2, this.height, -this.width / 2, 1.0);
        this.vertices[6] = vec4(-this.length / 2, 0, -this.width / 2, 1.0);
        this.vertices[7] = vec4(this.length / 2, 0, -this.width / 2, 1.0);
    }
    setUpBufferArrays(){
        this.colorsArray = [];
        this.normalsArray = [];
        this.pointsArray = [];
        this.texCoordsArray = [];
        quad(this.texScale, this.height, this.length, this.vertices[0], this.vertices[1], this.vertices[2], this.vertices[3], this.baseColor, this.colorsArray, this.pointsArray, this.normalsArray, this.texCoordsArray);
        quad(this.texScale, this.height, this.length, this.vertices[5], this.vertices[4], this.vertices[7], this.vertices[6], this.baseColor, this.colorsArray, this.pointsArray, this.normalsArray, this.texCoordsArray);
        quad(this.texScale, this.height, this.width, this.vertices[4], this.vertices[0], this.vertices[3], this.vertices[7], this.baseColor, this.colorsArray, this.pointsArray, this.normalsArray, this.texCoordsArray);
        quad(this.texScale, this.height, this.width, this.vertices[1], this.vertices[5], this.vertices[6], this.vertices[2], this.baseColor, this.colorsArray, this.pointsArray, this.normalsArray, this.texCoordsArray);
        quad(this.texScale, this.width, this.length, this.vertices[4], this.vertices[5], this.vertices[1], this.vertices[0], this.baseColor, this.colorsArray, this.pointsArray, this.normalsArray, this.texCoordsArray);
        quad(this.texScale, this.width, this.length, this.vertices[3], this.vertices[2], this.vertices[6], this.vertices[7], this.baseColor, this.colorsArray, this.pointsArray, this.normalsArray, this.texCoordsArray);
    }
}

// creating the plane given the configuration
class Square{
    constructor(config){
        this.width = config.width;
        this.height = config.height;
        this.baseColor = config.baseColor;
        this.texScale = config.texScale;
        this.texUnit = config.texUnit;
        this.calculateVertex();
    }
    calculateVertex(){
        this.vertices = [];
        this.vertices[0] = vec4(this.width/2, this.height/2, 0, 1.0);
        this.vertices[1] = vec4(-this.width/2, this.height/2, 0, 1.0);
        this.vertices[2] = vec4(-this.width/2, -this.height/2, 0, 1.0);
        this.vertices[3] = vec4(this.width/2, -this.height/2, 0, 1.0);
    }
    setUpBufferArrays(){
        this.colorsArray = [];
        this.normalsArray = [];
        this.pointsArray = [];
        this.texCoordsArray = [];
        quad(this.texScale, this.height, this.width, this.vertices[0], this.vertices[1], this.vertices[2], this.vertices[3], this.baseColor, this.colorsArray, this.pointsArray, this.normalsArray, this.texCoordsArray);
    }
}

// build the given object and the objects within it recursively by loading all the points, colors, and normals of each primitive (cube and plane)
function buildObjects(object){
    // if the object is hidden, don't render
    if (object.hide){
        return
    }
    // if the object contain child objects, build each child object
    else if(object.objects){
        object.objects.forEach((o) => {buildObjects(o)})
    // if the object is a primitive, build object
    } else {
        object.setUpBufferArrays();
        points[object.texUnit] = points[object.texUnit].concat(object.pointsArray);
        colors[object.texUnit] = colors[object.texUnit].concat(object.colorsArray);
        normals[object.texUnit] = normals[object.texUnit].concat(object.normalsArray);
        texCoordsArray[object.texUnit] = texCoordsArray[object.texUnit].concat(object.texCoordsArray);
    }
}

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];
function quad(texScale, height, width, a, b, c, d, baseColor, colorsArray, pointsArray, normalsArray, texCoordsArray) {
    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    // calculate normal
    var v1 = subtract(b, a);
    var v2 = subtract(c, b);
    var normal = cross(v1, v2);
    normal = vec3(normal);
    var indices = [ a, b, c, a, c, d ];

    var texCoord = [
        vec2(0, 0),
        vec2(0, height/texScale[0]),
        vec2(width/texScale[1], height/texScale[0]),
        vec2(width/texScale[1], 0)
    ];
    var texCoordIndices = [2, 1, 0, 2, 0, 3];

    for ( var i = 0; i < indices.length; ++i ) {
        pointsArray.push( indices[i]);
        normalsArray.push(normal);
        colorsArray.push(baseColor);
        texCoordsArray.push(texCoord[texCoordIndices[i]]);
    }
}


