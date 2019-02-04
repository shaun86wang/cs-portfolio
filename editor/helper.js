// multiplies a 4x4 and 4x1 matrix
var bLUT = [
    [1],
    [1,1],
    [1,2,1],        // n = 2
    [1,3,3,1],      // n = 3
    [1,4,6,4,1],
    [1,5,10,10,5,1],
    [1,6,15,20,15,6,1]
];

function binomial(n){
    while(n >= bLUT.length){
        var s = bLUT.length;
        var prev = s-1;
        // initiate next row
        var nextRow = [];
        nextRow.push(1);
        for(var i = 1; i < s; i++){
            nextRow.push(bLUT[prev][i-1]+bLUT[prev][i]);
        }
        nextRow.push(1);
        bLUT.push(nextRow);
    };
    return bLUT[n];
}

function customMult(u, v){
    var result = [];
    for(var i = 0; i < u.length; ++i){
        result.push(dot(u[i], v));
    }
    return result;
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
        points = points.concat(object.pointsArray);
        colors = colors.concat(object.colorsArray);
        normals = normals.concat(object.normalsArray);
        texCoordsArray = texCoordsArray.concat(object.texCoordsArray);
    }
}

class Bezier{
    constructor(coordinates, percision=100){
        this.coordinates = coordinates;
        this.percision = percision;
        this.size = coordinates.length;
        this.calculateVertex();
    }
    getPoint(t){
        // calculate a vertex based on the t parameter
        var p = vec4();
        var T = 1-t;
        var n = this.size-1;
        var coef = binomial(n);
        for(var i = 0; i < coef.length; i++){
            var c = coef[i] * Math.pow(T, n-i) * Math.pow(t, i);
            p[0] += this.coordinates[i][0] * c;
            p[1] += this.coordinates[i][1] * c;
        }
        return p;
    }
    calculateVertex(){
        this.vertices = [];
        // interpolate between start and end point by varying t between 0 and 1
        for(var i = 0; i < this.percision + 1; i++){
            // create all the points on the curve
            this.vertices.push(this.getPoint(i/this.percision));
        }
    }
}

class BezierModel{
    constructor(vertices, precision=100){
        this.precision = precision;
        this.size = vertices.length;
        this.baseColor = vec4(1, 1, 1, 1);
        this.calculateVertex(vertices);

    }
    calculateVertex(v){
        this.vertices = [];
        for(var i = 0; i < this.precision+1; i++){
            var scale = i/this.precision*360;
            v.forEach((p)=>{
                this.vertices.push(customMult(rotate(scale, [0, 1, 0]), p));
            });
        };
    }

    setUpBufferArrays(){
        this.colorsArray = [];
        this.normalsArray = [];
        this.pointsArray = [];
        this.texCoordsArray = [];
        for(var i=0; i<this.precision; i++) {
            for(var j=0; j<this.size-1; j++) {
                var a = this.vertices[j + i * (this.size)];
                var b = this.vertices[j + (i + 1) * (this.size)];
                var c = this.vertices[j + 1 + (i + 1) * (this.size)];
                var d = this.vertices[j + 1 + (i) * (this.size)];
                quad(d, c, b, a, this.baseColor, this.colorsArray, this.pointsArray, this.normalsArray, this.texCoordsArray);
            }
        }
    }
}

function quad(a, b, c, d, baseColor, colorsArray, pointsArray, normalsArray, texCoordsArray) {
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
        vec2(0, 1),
        vec2(1, 1),
        vec2(1, 0)
    ];
    var texCoordIndices = [2, 1, 0, 2, 0, 3];

    for ( var i = 0; i < indices.length; ++i ) {
        pointsArray.push( indices[i]);
        normalsArray.push(normal);
        colorsArray.push(baseColor);
        texCoordsArray.push(texCoord[texCoordIndices[i]]);
    }
}




