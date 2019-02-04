var gl2d;
var canvas2d;
var points2d;
var coordinatePoints;
var program2d;
var pointSize;
var pointSizeLoc;
var color2d;
var colorLoc;
var hideControlPoints = false;
var curves;
var pointsLoading = false;

// keep track of the selected coordinate
var movingCoordinate = [];

// keep track of last clicked points
var lastClicked = 0;

// flag to keep track of delete mode
var deleteCurve = false;

// default coordinate that used to add new curves
var defaultCoordinate = [vec4(1, 6.34, 0, 1), vec4(4.87, 7.46, 0, 1), vec4(7.75, 4, 0, 1), vec4(3.71, 0.52, 0, 1)];

// keep track of all coordinates of all curves
var bezierCurvesCoordinates = [
    [vec4(1, 6.34, 0, 1), vec4(4.87, 7.46, 0, 1), vec4(7.75, 4, 0, 1), vec4(3.71, 0.52, 0, 1)]
];

// a stack that used to save progress
var progress = [];

// save the last undo progress
var redo;

// this function initialize the 2d bezier editor and 3d bezier model viewer
window.onload = function init2d() {
    canvas2d = document.getElementById("gl-canvas-2d");
    canvas2d.addEventListener("mousedown", mouseDown, false);
    canvas2d.addEventListener("mouseup", mouseUp, false);
    canvas2d.addEventListener("mousemove", mouseMove, false);
    gl2d = WebGLUtils.setupWebGL(canvas2d);
    if (!gl2d) {
        alert("WebGL isn't avaliable")
    }
    gl2d.viewport(0, 0, canvas2d.width, canvas2d.height);
    gl2d.clearColor(1.0, 1.0, 1.0, 1.0);

    // Load shaders and initialize attribute buffers
    program2d = initShaders(gl2d, "vertex-shader-2d", "fragment-shader-2d");
    gl2d.useProgram(program2d);
    getShaderLocations2d(program2d);
    setUIControl();

    // initialize 3d model viewer
    init3d();

    // render 2d editor
    render2d()

};

function render2d() {
    gl2d.clear(gl2d.COLOR_BUFFER_BIT | gl2d.DEPTH_BUFFER_BIT);

    // calculate all vertices for the curves
    createBezierCurves();
    // load the vertices to the buffer
    loadVertices2d(program2d);

    // set the color and point size to draw red curve
    color2d = vec4(1, 0, 0, 1);
    pointSize = 1.0;
    gl2d.uniform4fv(colorLoc, color2d);
    gl2d.uniform1f(pointSizeLoc, pointSize);
    var curveOffset = 0;
    // loop through each bezier curve
    for(var i = 0; i < bezierCurvesCoordinates.length; i++){
        gl2d.drawArrays(gl2d.LINE_STRIP, curveOffset, 101);
        curveOffset += 101;
    }

    // draw the black axis
    color2d = vec4(0, 0, 0, 1);
    gl2d.uniform4fv(colorLoc, color2d);
    gl2d.drawArrays(gl2d.LINE_STRIP, curveOffset, 2);
    curveOffset += 2;

    // render the control points if they are not hidden
    if(!hideControlPoints){
        // save the index where the vertices for the coordinates start
        var offsetTemp = curveOffset;

        // change the color to green
        color2d = vec4(0, 1, 0, 1);
        gl2d.uniform4fv(colorLoc, color2d);
        // loop through each set of 2 coordinates to draw a line to connect point a with b, and c with d
        // for(var i = 0; i < bezierCurvesCoordinates.length * 2; i++){
        //     gl2d.drawArrays(gl2d.LINE_STRIP, curveOffset, 2);
        //     curveOffset += 2;
        // }

        for(var i = 0; i < bezierCurvesCoordinates.length; i++){
            var num = bezierCurvesCoordinates[i].length;
            gl2d.drawArrays(gl2d.LINE_STRIP, curveOffset, num);
            curveOffset += num;
        }

        // make the coordinates bigger for user to move them around
        pointSize = 6.0;
        gl2d.uniform1f(pointSizeLoc, pointSize);
        gl2d.drawArrays(gl2d.POINTS, offsetTemp, points2d.length-offsetTemp);
    }

    updateView();

    requestAnimFrame(render2d);
}

// this function create all the vertices of the all the curves
function createBezierCurves(){
    points2d = [];
    coordinatePoints = [];
    curves = [];
    // create vertices for each set of 4 bezier curve coordinates
    bezierCurvesCoordinates.forEach((coordinates)=>{
        var b = new Bezier(coordinates);
        curves.push(b);
        points2d = points2d.concat(b.vertices);
        coordinatePoints = coordinatePoints.concat(coordinates);
    });
    addAxis();
    points2d = points2d.concat(coordinatePoints);
}

// this function get locations of the variables in the shaders
function getShaderLocations2d(program){
    colorLoc = gl2d.getUniformLocation(program, "color");
    pointSizeLoc = gl2d.getUniformLocation(program, "pointSize");
}

// this function loads the verticies into the buffer
function loadVertices2d(program) {
    var vBuffer = gl2d.createBuffer();
    gl2d.bindBuffer( gl2d.ARRAY_BUFFER, vBuffer );
    gl2d.bufferData( gl2d.ARRAY_BUFFER, flatten(points2d), gl2d.STATIC_DRAW );

    var vPosition = gl2d.getAttribLocation( program, "vPosition" );
    gl2d.vertexAttribPointer( vPosition, 4, gl2d.FLOAT, false, 0, 0 );
    gl2d.enableVertexAttribArray( vPosition );
}

// this function fires when the mouse is clicked down
function mouseDown(e){
    var x, y;
    [x, y] = getMouseLocation(e);
    if(pointsLoading){
        var p = vec4(x, y, 0, 1);
        var last = bezierCurvesCoordinates[bezierCurvesCoordinates.length-1];
        last.splice(last.length-2, 0, p);
    }else{
        // loop through all the coordinates
        for(var i = 0; i < bezierCurvesCoordinates.length; i++){
            var coordinateSet = bezierCurvesCoordinates[i];
            for(var j = 0; j < coordinateSet.length; j++){
                var point = coordinateSet[j];
                // is the mouse is lose enough to one of the coordinate
                if(Math.abs(x - point[0])<0.5 && Math.abs(y - point[1])<0.5){
                    // save the editor workspace before moving
                    saveProgress();
                    // if delete mode is on
                    if(deleteCurve) {
                        if(j == 0 || j == coordinateSet.length-1){
                            bezierCurvesCoordinates.splice(i, 1);
                        } else {
                            coordinateSet.splice(j,1);
                        }
                        // delete the curve
                        handleDelete();
                        return;
                    }
                    // change cursor style
                    document.body.style.cursor = "all-scroll";
                    // record selected coordinate
                    movingCoordinate=[i,j];
                    // change coordinate location
                    updateLocationText(point[0], point[1]);

                }
            }
        }
    }
}

// this function is fired when the mouse click is released
function mouseUp(e){
    lastClicked = movingCoordinate[0];
    movingCoordinate=[];
    document.body.style.cursor = "auto";
    render3d();
}

// this function fires when the cursor is moved
function mouseMove(e){
    // if a coordinate is selected and delete mode is off
    if(movingCoordinate.length === 2 && !deleteCurve){
        var a, b, x, y;
        [a, b] = movingCoordinate;
        [x, y] = getMouseLocation(e);
        // set the location of the coordinate to the location of the mouse
        bezierCurvesCoordinates[a][b] = vec4(x, y, 0, 1);
        updateLocationText(x, y);
    }
}

// this function sets the click events of all the buttons
function setUIControl() {
    document.getElementById("deleteButton").onclick = handleDelete;

    document.getElementById("addButton").onclick = function () {
        if(deleteCurve) {
            alert("Please turn off delete mode first!");
            return;
        }
        pointsLoading = !pointsLoading;
        if(!pointsLoading){
            this.innerHTML = "Add Curve";
            document.getElementById("gl-canvas-2d").style.borderColor = "black";
        } else {
            this.innerHTML = "Finish";
            document.getElementById("gl-canvas-2d").style.borderColor = "orange";
            saveProgress();
            bezierCurvesCoordinates.push(clone(defaultCoordinate));
        }
        render3d();
    };

    document.getElementById("undoButton").onclick = function () {
        // if there are progress to undo
        if (progress.length > 0) {
            // save the current progress in case a redo is needed
            redo = cloneDeep(bezierCurvesCoordinates);
            // restore the last progress
            bezierCurvesCoordinates = progress.pop();
        }
        render3d();
    };

    document.getElementById("redoButton").onclick = function () {
        if(redo) bezierCurvesCoordinates = redo;
        redo = undefined;
        render3d();
    };

    document.getElementById("hideButton").onclick = function () {
        hideControlPoints = !hideControlPoints;
        this.innerHTML = hideControlPoints ? "Show Control Points" : "Hide Control Points";
    };

    document.getElementById("duplicateButton").onclick = function () {
        saveProgress();
        bezierCurvesCoordinates.push(clone(bezierCurvesCoordinates[lastClicked]));
    }


}

// this function returns the x, y location of the cursor on the plotting coordinate system
function getMouseLocation(e){
    return [(e.clientX-12)/25 - 10, 10 - (e.clientY-11)/25];
}

// this function push the current bezier curve coordinates to a stack
function saveProgress(){
    progress.push(cloneDeep(bezierCurvesCoordinates));
}

function saveToFile() {
    var textBlob = new Blob([JSON.stringify(bezierCurvesCoordinates)], {type:"text/plain"});

    var textToSaveAsURL = window.URL.createObjectURL(textBlob);

    var saveFileName = document.getElementById("saveFileName").value;

    var downloadLink       = document.createElement("a");
    downloadLink.download  = saveFileName;

    downloadLink.innerHTML = "Download File";
    downloadLink.href      = textToSaveAsURL;
    downloadLink.onclick   = destroyClickedElement;

    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);

    downloadLink.click();
}

function destroyClickedElement(event) {
    document.body.removeChild(event.target);
}

function loadFromFile() {

    var fileToLoad = document.getElementById("fileToLoad").files[0];

    var fileReader = new FileReader();
    fileReader.onload = function(fileLoadedEvent) {

        var textFromFileLoaded = fileLoadedEvent.target.result;

        bezierCurvesCoordinates = JSON.parse(textFromFileLoaded);
        render3d();
    };

    fileReader.readAsText(fileToLoad, "UTF-8");
}

// this function parse the txt file into a list of bezier curve coordinate sets
// function parseText(txt){
//     r = [];
//     var txtList = txt.split(",");
//     // for each set of numbers that represents a bezier curve
//     for(var i = 0; i < txtList.length/16; i++){
//         var coordinates = [];
//         // loop through each point
//         for(var j = 0; j < 4; j++){
//             // parse the x y coordinate
//             var x = parseFloat(txtList[16 * i + 4 * j]);
//             var y = parseFloat(txtList[16 * i + 4 * j + 1]);
//             coordinates.push(vec4(x, y, 0, 1));
//         }
//         r.push(coordinates);
//     }
//     return r;
// }

// this function update the text on html to reflect the coordinate of the selected point
function updateLocationText(x, y){
    var t = x.toFixed(2) + ", " + y.toFixed(2);
    document.getElementById("locationText").innerHTML = t;
}

// this function add the verticle guideline in the center of the editor
function addAxis(){
    points2d.push(vec4(0, 10, 0, 1));
    points2d.push(vec4(0, -10, 0, 1));
}

function cloneDeep(obj){
    var o = [];
    obj.forEach((coords)=>{
        var l = [];
        coords.forEach((v)=>{
            var vec = [];
            v.forEach((p)=>{
                vec.push(p);
            });
            l.push(vec);
        });
        o.push(l);
    });
    return o;
}

function clone(obj){
    var o = [];
    obj.forEach((coords)=>{
        var l = [];
        coords.forEach((v)=>{
            l.push(v);
        });
        o.push(l);
    });
    return o;
}

function handleDelete(){
    if(pointsLoading) {
        alert("Please finish creating the curve first!");
        return;
    }
    deleteCurve = !deleteCurve;
    if(deleteCurve) {
        document.getElementById("deleteButton").innerHTML = "Delete: ON";
        document.getElementById("gl-canvas-2d").style.borderColor = "red";
    } else {
        document.getElementById("deleteButton").innerHTML = "Delete: OFF";
        document.getElementById("gl-canvas-2d").style.borderColor = "black";
    }
};