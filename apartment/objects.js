// the object contain all the colors needed
const vertexColors = {
    white: [1.0, 1.0, 1.0, 1.0], // white
};

// the object contain all the standard units
const SIZE = {
    MAIN_LENGTH: 7, //length of the white part of the building
    MAIN_WIDTH: 17,  //width of the white part of the building
    MAIN_FLOOR_HEIGHT: 3, //height of each floor
    MAIN_HEIGHT: 16, //height of the white part of the building
    SIDE_LENGTH: 1.2, // length of the grey part of the building, to the side of the white part
    SIDE_WIDTH: 5,  // width of the grey part of the building, to the side of the white part
    STAIRS_LENGTH: 5, //length of the stairways
    STAIRS_WIDTH: 2, // width of the stairways
    BOTTOM_HEIGHT: 4, //height of the bottom brick part of the building
    BRIDGE_LENGTH: 8,  //length of the grey metal bridge on the south side of the building
    BRIDGE_WIDTH: 2,  //width of the grey metal bridge on the south side of the building
};

// configuration for readability
var windowConfig = createSquareConfig(1, 1, vertexColors.white, textureUnit.window);
var stairConfig = createCubeConfig(SIZE.STAIRS_LENGTH, SIZE.STAIRS_WIDTH, SIZE.MAIN_HEIGHT + SIZE.BOTTOM_HEIGHT + 1, vertexColors.white, textureUnit.brickWall);


// object that represents the model of a one sided single floor with three windows
class HalfFloorWindowWhite {
    constructor() {
        // create floor body cube
        var floorConfig = createCubeConfig(SIZE.MAIN_LENGTH, SIZE.MAIN_WIDTH / 2, SIZE.MAIN_FLOOR_HEIGHT, vertexColors.white, textureUnit.whiteWall);
        this.floorCube = new Cube(floorConfig);

        // create all three windows
        this.windows = [];
        for (var i = 0; i < 3; i++) {
            this.windows[i] = new Square(windowConfig);
        }
        moveObject(this.windows[0], vec3(-2, SIZE.MAIN_FLOOR_HEIGHT / 2, this.floorCube.width / 2 + 0.01));
        moveObject(this.windows[1], vec3(0, SIZE.MAIN_FLOOR_HEIGHT / 2, this.floorCube.width / 2 + 0.01));
        moveObject(this.windows[2], vec3(2, SIZE.MAIN_FLOOR_HEIGHT / 2, this.floorCube.width / 2 + 0.01));

        // load all the objects for render
        this.objects = [this.floorCube].concat(this.windows);
    }
}

// object that represents the model of a one sided upper building (5 floors) with all the windows for each floor
class HalfFloorsWindowWhite {
    constructor() {
        // create the white cube on the top of the five floors that does not have any window
        var whiteCubeConfig = createCubeConfig(SIZE.MAIN_LENGTH, SIZE.MAIN_WIDTH / 2, 1, vertexColors.white, textureUnit.whiteWall);
        this.whiteCube = new Cube(whiteCubeConfig);
        moveObject(this.whiteCube, vec3(0, SIZE.MAIN_FLOOR_HEIGHT * 5, 0));

        // create the grey cube on the top of the building
        var greyCubeConfig = createCubeConfig(SIZE.MAIN_LENGTH, SIZE.SIDE_WIDTH, 1, vertexColors.white, textureUnit.greyWall);
        this.greyCube = new Cube(greyCubeConfig);
        moveObject(this.greyCube, vec3(0, SIZE.MAIN_FLOOR_HEIGHT * 5 + this.whiteCube.height, -(SIZE.MAIN_WIDTH / 2 - SIZE.SIDE_WIDTH) / 2));

        // create the five floors
        this.halfFloorWindowWhiteList = [];
        for (var i = 0; i < 5; i++) {
            this.halfFloorWindowWhiteList[i] = new HalfFloorWindowWhite();
            moveObject(this.halfFloorWindowWhiteList[i], vec3(0, i * SIZE.MAIN_FLOOR_HEIGHT, 0));
        }

        // create the grey color on the back of the building
        var backConfig = createSquareConfig(SIZE.MAIN_LENGTH, SIZE.MAIN_HEIGHT, vertexColors.white, textureUnit.greyWall);
        this.greyBack = new Square(backConfig);
        rotateObject(this.greyBack, 180);
        moveObject(this.greyBack, vec3(0, SIZE.MAIN_HEIGHT/2, -SIZE.MAIN_WIDTH / 4 - 0.005));

        this.objects = [this.whiteCube, this.greyCube, this.greyBack].concat(this.halfFloorWindowWhiteList);
    }
}

// object that represents the model of a one sided concave side grey wall with a column of windows
class SideWindowGrey {
    constructor() {
        // create the grey wall cube
        var greyCubeConfig = createCubeConfig(SIZE.SIDE_LENGTH, SIZE.SIDE_WIDTH, SIZE.MAIN_HEIGHT + 1, vertexColors.white, textureUnit.greyWall);
        this.greyCube = new Cube(greyCubeConfig);

        // create all the windows
        this.windows = [];
        for (var i = 0; i < 5; i++) {
            this.windows[i] = new Square(windowConfig);
            moveObject(this.windows[i], vec3(0, i * SIZE.MAIN_FLOOR_HEIGHT + SIZE.MAIN_FLOOR_HEIGHT / 2, this.greyCube.width / 2 + 0.01));
        }
        this.objects = [this.greyCube].concat(this.windows);
    }
}

// object that represents the model of the upper part of a one sided building section with concave side
class HalfBuildingWithSides {
    constructor() {
        this.halfFloorsWindowWhite = new HalfFloorsWindowWhite();

        this.sideWindowGreys = [];
        this.sideWindowGreys[0] = new SideWindowGrey();
        moveObject(this.sideWindowGreys[0], vec3(SIZE.MAIN_LENGTH / 2 + SIZE.SIDE_LENGTH / 2, 0, -(SIZE.MAIN_WIDTH / 2 - SIZE.SIDE_WIDTH) / 2));
        this.sideWindowGreys[1] = new SideWindowGrey();
        moveObject(this.sideWindowGreys[1], vec3(-(SIZE.MAIN_LENGTH / 2 + SIZE.SIDE_LENGTH / 2), 0, -(SIZE.MAIN_WIDTH / 2 - SIZE.SIDE_WIDTH) / 2));

        this.objects = [this.halfFloorsWindowWhite].concat(this.sideWindowGreys);
    }
}

// object that represents the model of a one sided concave side brown wall located a the bottom of each building section
class SideBottom {
    constructor() {
        var bottomSideConfig = createCubeConfig(SIZE.SIDE_LENGTH, SIZE.SIDE_WIDTH, SIZE.BOTTOM_HEIGHT, vertexColors.white, textureUnit.brickWall);
        this.bottomSide = new Cube(bottomSideConfig);
        this.window = new Square(windowConfig);
        moveObject(this.window, vec3(0, SIZE.BOTTOM_HEIGHT / 2, SIZE.SIDE_WIDTH / 2 + 0.01));

        this.objects = [this.bottomSide, this.window];
    }
}
// object that represents the model of a one sided bottom of a building section
class Bottom {
    constructor() {
        // create the main body of the bottm
        var bottomMainConfig = createCubeConfig(SIZE.MAIN_LENGTH, SIZE.MAIN_WIDTH / 2, SIZE.BOTTOM_HEIGHT, vertexColors.white, textureUnit.brickWall);
        this.bottomMain = new Cube(bottomMainConfig);

        // create the two concave sides of the bottom
        this.rightSide = new SideBottom();
        moveObject(this.rightSide, vec3(SIZE.MAIN_LENGTH / 2 + SIZE.SIDE_LENGTH / 2, 0, -(SIZE.MAIN_WIDTH / 2 - SIZE.SIDE_WIDTH) / 2));
        this.leftSide = new SideBottom();
        moveObject(this.leftSide, vec3(-(SIZE.MAIN_LENGTH / 2 + SIZE.SIDE_LENGTH / 2), 0, -(SIZE.MAIN_WIDTH / 2 - SIZE.SIDE_WIDTH) / 2));

        // add windows
        this.windows = [];
        for (var i = 0; i < 3; i++) {
            this.windows[i] = new Square(windowConfig);
        }
        moveObject(this.windows[0], vec3(-2, this.bottomMain.height / 2, this.bottomMain.width / 2 + 0.01));
        moveObject(this.windows[1], vec3(0, this.bottomMain.height / 2, this.bottomMain.width / 2 + 0.01));
        moveObject(this.windows[2], vec3(2, this.bottomMain.height / 2, this.bottomMain.width / 2 + 0.01));

        this.objects = [this.bottomMain, this.leftSide, this.rightSide].concat(this.windows);
    }
}

// object that represents the model of the entire part of a one sided building section with concave side
class HalfBuildingWithSidesAndBottom {
    constructor() {
        this.halfBuildingWithSides = new HalfBuildingWithSides();
        moveObject(this.halfBuildingWithSides, vec3(0, SIZE.BOTTOM_HEIGHT, 0));
        this.bottom = new Bottom();
        this.objects = [this.halfBuildingWithSides, this.bottom];
    }
}

// object that represents the model of the entire part of a two sided building section with concave side
class FullBuilding {
    constructor() {
        this.objects = [];
        for (var i = 0; i < 2; i++) {
            this.objects[i] = new HalfBuildingWithSidesAndBottom();
            if (i == 1) {
                rotateObject(this.objects[i], 180);
                moveObject(this.objects[i], vec3(0, 0, -SIZE.MAIN_WIDTH / 4));
            } else {
                moveObject(this.objects[i], vec3(0, 0, SIZE.MAIN_WIDTH / 4));
            }
        }
    }
}

// object that represents one single instance of the bridge on the south-east side of the apartment
class Bridge {
    constructor() {
        var bridgeConfig = createSquareConfig(SIZE.BRIDGE_LENGTH, SIZE.BRIDGE_WIDTH, vertexColors.white, textureUnit.metal, vec2(2, 1));
        // create the bottom of the bridge
        this.bridgeBottom = new Square(bridgeConfig);
        rotateObjectX(this.bridgeBottom, 90);

        // create the front of the bridge
        this.bridgeFront = new Square(bridgeConfig);
        moveObject(this.bridgeFront, vec3(0, SIZE.BRIDGE_WIDTH / 2, SIZE.BRIDGE_WIDTH / 2));

        // create the back of the bridge
        this.bridgeBack = new Square(bridgeConfig);
        moveObject(this.bridgeBack, vec3(0, SIZE.BRIDGE_WIDTH / 2, -SIZE.BRIDGE_WIDTH / 2));

        this.objects = [this.bridgeBottom, this.bridgeFront, this.bridgeBack];
    }
}

// object that represents one single instance of the small balcony on the north-west side of the apartment
class Level {
    constructor() {
        var levelSideConfig = createSquareConfig(SIZE.BRIDGE_WIDTH * 2, SIZE.BRIDGE_WIDTH, vertexColors.white, textureUnit.metal, vec2(2, 1));
        var levelBottomConfig = createSquareConfig(SIZE.BRIDGE_WIDTH * 2, SIZE.BRIDGE_WIDTH * 2, vertexColors.white, textureUnit.whiteWall);
        // create the bottom of the balcony
        this.levelBottom = new Square(levelBottomConfig);
        rotateObjectX(this.levelBottom, 90);

        // create the front of the balcony
        this.levelFront = new Square(levelSideConfig);
        moveObject(this.levelFront, vec3(0, SIZE.BRIDGE_WIDTH / 2, SIZE.BRIDGE_WIDTH));

        // create the back of the balcony
        this.levelBack = new Square(levelSideConfig);
        moveObject(this.levelBack, vec3(0, SIZE.BRIDGE_WIDTH / 2, -SIZE.BRIDGE_WIDTH));

        // create the right side of the balcony
        this.levelRight = new Square(levelSideConfig);
        rotateObject(this.levelRight, 90);
        moveObject(this.levelRight, vec3(SIZE.BRIDGE_WIDTH, SIZE.BRIDGE_WIDTH / 2, 0));

        // create the left side of the balcony
        this.levelLeft = new Square(levelSideConfig);
        rotateObject(this.levelLeft, 270);
        moveObject(this.levelLeft, vec3(-SIZE.BRIDGE_WIDTH, SIZE.BRIDGE_WIDTH / 2, 0));

        this.objects = [this.levelBottom, this.levelFront, this.levelBack, this.levelRight, this.levelLeft];
    }
}

class EastSide {
    constructor() {
        this.firstFour = new Array(4);
        for (var i = 0; i < 4; i++) {
            this.firstFour[i] = new FullBuilding();
        }
        moveObject(this.firstFour[0], vec3((SIZE.MAIN_LENGTH + SIZE.SIDE_LENGTH * 2) * 2, 0, 0));
        moveObject(this.firstFour[1], vec3((SIZE.MAIN_LENGTH + SIZE.SIDE_LENGTH * 2), 0, 0));
        moveObject(this.firstFour[3], vec3(-(SIZE.MAIN_LENGTH + SIZE.SIDE_LENGTH * 2), 0, 0));

        this.lastHalfBuilding = new HalfBuildingWithSidesAndBottom();
        moveObject(this.lastHalfBuilding, vec3(-(SIZE.MAIN_LENGTH + SIZE.SIDE_LENGTH * 2) * 2, 0, SIZE.MAIN_WIDTH / 4));
        this.lastHalfBuilding.bottom.leftSide.bottomSide.texUnit = textureUnit.greyWall;

        this.greyCube = new Cube(createCubeConfig(SIZE.MAIN_LENGTH, SIZE.SIDE_WIDTH, SIZE.MAIN_HEIGHT + SIZE.BOTTOM_HEIGHT, vertexColors.white, textureUnit.greyWall));
        moveObject(this.greyCube, vec3(-(SIZE.MAIN_LENGTH + SIZE.SIDE_LENGTH * 2) * 2, 0, -SIZE.SIDE_WIDTH / 2));

        this.largeWindow = new Square(createSquareConfig(this.greyCube.width * 0.6, SIZE.MAIN_HEIGHT * 0.9, vertexColors.white, textureUnit.window, vec2(2, 2)));
        rotateObject(this.largeWindow, 270);
        moveObject(this.largeWindow,
            vec3(-(SIZE.MAIN_LENGTH + SIZE.SIDE_LENGTH * 2) * 2 - SIZE.MAIN_LENGTH / 2 - 0.01,
                this.largeWindow.height / 2 + SIZE.BOTTOM_HEIGHT, -(this.largeWindow.width / 2 + (SIZE.SIDE_LENGTH - 1) / 2)
            )
        );

        this.panel = new Cube(createCubeConfig(5*(SIZE.MAIN_LENGTH + 2*SIZE.SIDE_LENGTH)-1, SIZE.MAIN_WIDTH/2, 0.1, vertexColors.white, textureUnit.greyWall));
        moveObject(this.panel, vec3(0, SIZE.BOTTOM_HEIGHT, SIZE.MAIN_WIDTH/4 + 0.5));

        this.stair = new Cube(stairConfig);
        moveObject(this.stair, vec3(-(SIZE.MAIN_LENGTH + SIZE.SIDE_LENGTH * 2 + SIZE.SIDE_LENGTH) * 2, 0, -SIZE.SIDE_WIDTH));

        this.objects = [this.lastHalfBuilding, this.greyCube, this.largeWindow, this.stair, this.panel].concat(this.firstFour);
    }
}

class SouthSide {
    constructor() {
        this.leftBuilding = new HalfBuildingWithSidesAndBottom();
        moveObject(this.leftBuilding, vec3(-(SIZE.MAIN_LENGTH + SIZE.SIDE_LENGTH * 2), 0, SIZE.MAIN_WIDTH / 4));

        this.rightBuilding = new FullBuilding();

        this.bridges = [];
        for (var i = 0; i < 5; i++) {
            this.bridges[i] = new Bridge();
            moveObject(this.bridges[i], vec3((SIZE.MAIN_LENGTH + SIZE.BRIDGE_LENGTH) / 2, SIZE.BOTTOM_HEIGHT + i * SIZE.MAIN_FLOOR_HEIGHT, 0));
        }

        this.objects = [this.leftBuilding, this.rightBuilding].concat(this.bridges);


    }
}

class WestSide {
    constructor() {
        this.firstFive = new Array(5);
        for (var i = 0; i < 5; i++) {
            this.firstFive[i] = new FullBuilding();
            var d = i - 2;
            moveObject(this.firstFive[i], vec3((d * 2 - 1) * (SIZE.MAIN_LENGTH / 2 + SIZE.SIDE_LENGTH)), 0, 0);
        }
        this.firstFive[0].objects[1].bottom.rightSide.bottomSide.texUnit = textureUnit.greyWall;

        this.lastHalfBuilding = new HalfBuildingWithSidesAndBottom();
        moveObject(this.lastHalfBuilding, vec3(5 * (SIZE.MAIN_LENGTH / 2 + SIZE.SIDE_LENGTH), 0, SIZE.MAIN_WIDTH / 4));
        this.lastHalfBuilding.bottom.rightSide.bottomSide.texUnit = textureUnit.greyWall;

        this.stair = new Cube(stairConfig);
        rotateObject(this.stair, 90);
        moveObject(this.stair, vec3(-(3 * (SIZE.MAIN_LENGTH + SIZE.SIDE_LENGTH * 2) + SIZE.STAIRS_WIDTH / 2), 0, SIZE.STAIRS_LENGTH / 2));

        this.levels = [];
        for (var i = 0; i < 5; i++) {
            this.levels[i] = new Level();
            moveObject(this.levels[i], vec3(-(3 * (SIZE.MAIN_LENGTH + SIZE.SIDE_LENGTH * 2) + SIZE.STAIRS_WIDTH / 2), SIZE.BOTTOM_HEIGHT + i * SIZE.MAIN_FLOOR_HEIGHT, 0));
        }

        this.fillBlock = new Cube(createCubeConfig(SIZE.MAIN_LENGTH, SIZE.SIDE_WIDTH/2, SIZE.MAIN_HEIGHT +SIZE.BOTTOM_HEIGHT + 1, vertexColors.white, textureUnit.greyWall));
        moveObject(this.fillBlock, vec3(5 * (SIZE.MAIN_LENGTH / 2 + SIZE.SIDE_LENGTH), 0, -SIZE.SIDE_WIDTH/8));


        this.objects = [this.lastHalfBuilding, this.stair, this.fillBlock].concat(this.firstFive).concat(this.levels);

    }
}

class NorthSide {
    constructor() {
        this.halfBuildings = [];
        for (var i = 0; i < 4; i++) {
            this.halfBuildings[i] = new HalfBuildingWithSidesAndBottom();
            var d = i - 1;
            moveObject(this.halfBuildings[i], vec3((d * 2 - 1) * (SIZE.MAIN_LENGTH / 2 + SIZE.SIDE_LENGTH)), 0, 0);
        }

        // create the window section of the north east side, which is the lobby
        this.halfBuildings[0].bottom.leftSide.hide = true;
        this.halfBuildings[0].bottom.bottomMain.texUnit = textureUnit.window;
        this.halfBuildings[0].bottom.bottomMain.texScale = vec2(2, 2);
        this.halfBuildings[0].bottom.windows.forEach(w => w.hide = true);

        this.backCover = new Square(createSquareConfig(SIZE.MAIN_LENGTH, SIZE.BOTTOM_HEIGHT, vertexColors.white, textureUnit.greyWall));
        rotateObject(this.backCover, 180);
        moveObject(this.backCover, vec3(-3*(SIZE.MAIN_LENGTH / 2 + SIZE.SIDE_LENGTH), this.backCover.height/2, -(SIZE.MAIN_WIDTH/4 + 0.005)));

        this.fullBuilding = new FullBuilding();
        moveObject(this.fullBuilding, vec3(SIZE.MAIN_LENGTH / 2 + SIZE.SIDE_LENGTH, 0, -SIZE.MAIN_WIDTH / 4));

        this.stair = new Cube(Object.assign(stairConfig, {width: SIZE.STAIRS_WIDTH * 1.5}));
        rotateObject(this.stair, 90);
        moveObject(this.stair, vec3(-4*(SIZE.MAIN_LENGTH / 2 + SIZE.SIDE_LENGTH), 0, -(SIZE.MAIN_WIDTH/4 + SIZE.STAIRS_LENGTH/2)));

        this.largeWindow = new Square(createSquareConfig(1, SIZE.MAIN_HEIGHT + SIZE.BOTTOM_HEIGHT , vertexColors.white, textureUnit.window, vec2(2, 1)));
        rotateObject(this.largeWindow, 90);
        moveObject(this.largeWindow,
            vec3(-4*(SIZE.MAIN_LENGTH / 2 + SIZE.SIDE_LENGTH) - this.stair.width/2 - 0.01,
                this.largeWindow.height/2,
                -(SIZE.MAIN_WIDTH/4 + SIZE.STAIRS_LENGTH/2)
            )
        );

        this.panel = new Cube(createCubeConfig(4*(SIZE.MAIN_LENGTH + 2*SIZE.SIDE_LENGTH), SIZE.MAIN_WIDTH * 2/3, 0.1, vertexColors.white, textureUnit.greyWall));
        moveObject(this.panel, vec3(-0.99, SIZE.BOTTOM_HEIGHT, -1));

        this.topPanel = new Cube(createCubeConfig(SIZE.MAIN_LENGTH + 2 * SIZE.SIDE_LENGTH, SIZE.MAIN_WIDTH/2, 0.1, vertexColors.white, textureUnit.purpleWall));
        moveObject(this.topPanel, vec3(-3*(SIZE.MAIN_LENGTH / 2 + SIZE.SIDE_LENGTH)-SIZE.SIDE_LENGTH, SIZE.MAIN_HEIGHT+SIZE.BOTTOM_HEIGHT));

        this.rightPanel = new Cube(createCubeConfig(0.1 , SIZE.MAIN_WIDTH/2 + 0.5, SIZE.MAIN_HEIGHT, vertexColors.white, textureUnit.purpleWall));
        moveObject(this.rightPanel, vec3(-3*(SIZE.MAIN_LENGTH / 2 + SIZE.SIDE_LENGTH)+SIZE.MAIN_LENGTH/2, SIZE.BOTTOM_HEIGHT));

        this.glassRoom = new Cube(createCubeConfig(SIZE.SIDE_LENGTH*2, SIZE.MAIN_WIDTH/2-SIZE.SIDE_WIDTH, SIZE.BOTTOM_HEIGHT, vertexColors.white, textureUnit.window, vec2(2, 2)));
        moveObject(this.glassRoom, vec3(-(SIZE.MAIN_LENGTH + 2 * SIZE.SIDE_LENGTH), 0, SIZE.MAIN_WIDTH/4 - this.glassRoom.width/2));

        // the text that displays the name of the apartment
        this.text = new Square(createSquareConfig(2, 16, vertexColors.white, textureUnit.text, vec2(16, 2)));
        rotateObject(this.text, 90);
        moveObject(this.text,
            vec3(-4*(SIZE.MAIN_LENGTH / 2 + SIZE.SIDE_LENGTH) - 0.01,
                this.text.height/2 + SIZE.BOTTOM_HEIGHT ,
                -(SIZE.SIDE_WIDTH/4)
            )
        );


        this.objects = [this.fullBuilding, this.backCover, this.stair, this.panel,this.text,
            this.largeWindow, this.topPanel, this.rightPanel, this.glassRoom].concat(this.halfBuildings);
    }
}
// create the model of each side and adjust position
var eastSide = new EastSide();
rotateObject(eastSide, 90);
moveObject(eastSide, vec3(SIZE.MAIN_WIDTH / 2 + SIZE.MAIN_LENGTH / 2 + SIZE.BRIDGE_LENGTH / 2, 0, 0));

var southSide = new SouthSide();
moveObject(southSide, vec3(0, 0, -SIZE.MAIN_WIDTH / 2 + (SIZE.MAIN_LENGTH / 2 + SIZE.SIDE_LENGTH) * 5));

var westSide = new WestSide();
rotateObject(westSide, 270);
moveObject(westSide, vec3(-(SIZE.MAIN_WIDTH / 2 + SIZE.MAIN_LENGTH / 2 + SIZE.BRIDGE_LENGTH / 2), 0, -(SIZE.MAIN_LENGTH / 2 + SIZE.SIDE_LENGTH)));

var northSide = new NorthSide();
rotateObject(northSide, 180);
moveObject(northSide, vec3(SIZE.MAIN_LENGTH/2 + SIZE.SIDE_LENGTH * 2, 0, -(SIZE.MAIN_LENGTH / 2 + SIZE.SIDE_LENGTH) * 6.7));



// load the object for rendering
window.mainObject = {
    objects: [
        eastSide,
        southSide,
        westSide,
        northSide
    ]
};




// rotate the object for better viewing angle
rotateObject(window.mainObject, 220);