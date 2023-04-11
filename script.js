const CatMovementIntervalInMs = 10;
const CatNonMoveIntervalsUntilRest = 50;
const CatMovementPerIntervalInPx = 1;
const CatStopsPxFromTheCursor = 100;
const CatAnimationSlowdown = 10;
const MaxSpawnRetries = 100;
const MinSpeedFractionForAnimation = 0.2;
const AnimationSpeedInMs = 1000;
const PixelsPerGrassPatch = 3000;

const CatBoundingBoxHeight = 35;
const CatBoundingBoxWidth = 35;

let XCord = 0;
let YCord = 0;

let Pets = [];

const CatMovingStates = ["resources/cat/CatStanding.png", "resources/cat/CatMoving.png"];
const CatRestingStates = ["resources/cat/CatResting.png"];
const CatPettingAnimationSteps = ["resources/cat/CatRestingWithHeart.png"];

const GrassTextures = ["resources/environment/Grass1.png", "resources/environment/Grass2.png"];

const delay = ms => new Promise(res => setTimeout(res, ms));

function SubstringOccursInStrings(substring, array) {
    for (const arrayString of array) {
        if (substring.includes(arrayString)) {
            return true;
        }
    }
    return false;
}

class Pet {
    async OnPetting() {
        if (SubstringOccursInStrings(this.div.getElementsByClassName("catImage")[0].src, CatRestingStates)) {
            let beforeState = this.div.getElementsByClassName("catImage")[0].src;
            for (const image of CatPettingAnimationSteps) {
                this.div.getElementsByClassName("catImage")[0].src = image;
                await delay(AnimationSpeedInMs);
            }
            if (SubstringOccursInStrings(this.div.getElementsByClassName("catImage")[0].src, [CatPettingAnimationSteps[CatPettingAnimationSteps.length-1]])) {
                this.div.getElementsByClassName("catImage")[0].src = beforeState;
            }
        }
    }

    constructor() {
        const div = document.createElement("div");
        this.imgState = 0;
        this.animationStepper = 0;
        this.currentNonMovementIntervals = 0;

        div.className = "cat";
        div.style.width = CatBoundingBoxHeight + "px";
        div.style.height = CatBoundingBoxWidth + "px";
        div.style.position = 'absolute';
        document.body.appendChild(div);
        let isColliding = true;
        let SpawnPositionX;
        let SpawnPositionY;
        let iteration = 0;
        while (isColliding) {
            if (iteration >= MaxSpawnRetries) {
                div.remove();
                return null;
            }
            let {MoveX, MoveY, hasCollision} = TryMove(0, 0, getRandom(0, window.innerWidth-CatBoundingBoxWidth), getRandom(0, window.innerHeight-CatBoundingBoxHeight))
            isColliding = hasCollision;
            SpawnPositionX = MoveX;
            SpawnPositionY = MoveY;
            iteration++;
        }
        div.style.left = SpawnPositionX + "px";
        div.style.top = SpawnPositionY + "px";
        let img = document.createElement("img");
        img.className = "catImage";
        img.alt = "cute cat uwu";
        img.src = CatMovingStates[0];
        img.addEventListener("click", this.OnPetting.bind(this), false)
        div.appendChild(img);
        this.div = div;
    }

    get divElement() {
        return this.div;
    }

    set divElement(div) {
        this.div = div;
    }

    Animate() {
        if (this.animationStepper % CatAnimationSlowdown === 0) {
            this.currentNonMovementIntervals = 0;
            this.imgState++;
            this.div.getElementsByClassName("catImage")[0].src = CatMovingStates[this.imgState % CatMovingStates.length];
        }
        this.animationStepper++;
    }

    StopMoveAnimation() {
        this.currentNonMovementIntervals++;
        this.imgState = 0;
        if (this.currentNonMovementIntervals >= CatNonMoveIntervalsUntilRest) {
            if (SubstringOccursInStrings(this.div.getElementsByClassName("catImage")[0].src, CatMovingStates)) this.div.getElementsByClassName("catImage")[0].src = CatRestingStates[0];
        } else {
            this.div.getElementsByClassName("catImage")[0].src = CatMovingStates[0];
        }
    }

    EvaluateDirection(PetX, PetY, CursorX, CursorY) {
        this.div.getElementsByClassName("catImage")[0].style.transform = (PetX - CursorX) > 0  ? "" : "scaleX(-1)";
    }
}

(function() {
    document.onmousemove = handleMouseMove;
    function handleMouseMove(event) {
        let eventDoc, doc, body;

        event = event || window.event; // IE-ism
        // If pageX/Y aren't available and clientX/Y are,
        // calculate pageX/Y - logic taken from jQuery.
        // (This is to support old IE)
        if (event.pageX == null && event.clientX != null) {
            eventDoc = (event.target && event.target.ownerDocument) || document;
            doc = eventDoc.documentElement;
            body = eventDoc.body;

            event.pageX = event.clientX +
                (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                (doc && doc.clientLeft || body && body.clientLeft || 0);
            event.pageY = event.clientY +
                (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
                (doc && doc.clientTop  || body && body.clientTop  || 0 );
        }

        let positionText = document.getElementById("position");
        positionText.innerText = event.pageX + "/" + event.pageY;
        XCord = event.pageX;
        YCord = event.pageY;
    }
})();

// generating grass on new free space
(function() {
    window.onresize = handleResize;

    async function handleResize(event) {
        CreateGrass();
    }
})();

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

function CreateACat() {
    let pet = new Pet();
    if (pet != null) Pets.push(pet);
}

function getXYSpeed(currentX, currentY, destinationX, destinationY) {
    let RationY;
    let RationX;

    let XDiff = Math.abs(currentX - destinationX);
    let YDiff = Math.abs(currentY - destinationY);

    if (XDiff > YDiff) {
        RationY = (YDiff / XDiff)/2;
        RationX = 1-RationY;
    } else {
        RationX = (XDiff / YDiff)/2;
        RationY = 1-RationX;
    }

    return {RationX, RationY};
}

function BoundingBoxCollision(rect1, rect2) {
    return ((rect2.top >= rect1.top && rect2.top <= rect1.bottom) ||
            rect2.bottom <= rect1.bottom && rect2.bottom >= rect1.top) &&
        ((rect2.left >= rect1.left && rect2.left <= rect1.right) ||
            rect2.right <= rect1.right && rect2.right >= rect1.left);
}

function TryMove(currentX, currentY, targetX, targetY) {
    let currentRect = new DOMRect(currentX, currentY, CatBoundingBoxWidth, CatBoundingBoxHeight);
    let futureRectXY = new DOMRect(targetX, targetY, CatBoundingBoxWidth, CatBoundingBoxHeight);
    let futureRectX = new DOMRect(targetX, currentY, CatBoundingBoxWidth, CatBoundingBoxHeight);
    let futureRectY = new DOMRect(currentX, targetY, CatBoundingBoxWidth, CatBoundingBoxHeight);

    let MoveX = targetX;
    let MoveY = targetY;
    let hasCollision = false;
    for (let pet of Pets) {
        let catDiv = pet.divElement;
        let rect = catDiv.getBoundingClientRect();
        if (rect.x === currentRect.x && rect.y === currentRect.y) continue;

        if (BoundingBoxCollision(rect, futureRectX)) {
            MoveX = null;
            hasCollision = true;
        }
        if (BoundingBoxCollision(rect, futureRectY)) {
            MoveY = null;
            hasCollision = true;
        }
        if (!hasCollision && BoundingBoxCollision(rect, futureRectXY)) {
            MoveY = null;
            MoveX = null;
            hasCollision = true;
        }
    }
    return {MoveX, MoveY, hasCollision};
}

function CreateGrass() {
    let grassDiv = document.getElementById("GrassGenerated");
    let grassDivHeight = Number(grassDiv.style.height.substring(0, grassDiv.style.height.length-2));
    let grassDivWidth = Number(grassDiv.style.width.substring(0, grassDiv.style.width.length-2));
    if (grassDivHeight >= window.innerHeight && grassDivWidth >= window.innerWidth) return;

    for (let i = 0; i < Math.round((window.innerWidth*window.innerHeight - grassDivHeight*grassDivWidth)/PixelsPerGrassPatch); i++) {
        let img = document.createElement("img");
        document.body.appendChild(img);
        img.className = "grassPatch";
        img.style.position = "absolute";
        img.src = GrassTextures[Math.round(getRandom(0, GrassTextures.length - 1))];
        let IsUsedSpace = true;
        let randomWidth;
        let randomHeight;
        while (IsUsedSpace) {
            randomWidth = getRandom(0, window.innerWidth);
            randomHeight = getRandom(0, window.innerHeight);
            if (grassDivHeight < randomHeight || grassDivWidth < randomWidth) IsUsedSpace = false;
        }
        img.style.bottom = randomHeight + "px";
        img.style.right = randomWidth + "px";
    }

    if (window.innerHeight > grassDivHeight) grassDiv.style.height = window.innerHeight + "px";
    if (window.innerHeight > grassDivWidth) grassDiv.style.width = window.innerWidth + "px";
}

// grass initial spawn
(async function() {
    let div = document.createElement("div");
    div.id = "GrassGenerated"
    div.style.position = "absolute";
    div.style.height = "0px";
    div.style.width = "0px";
    div.style.bottom = "0px";
    div.style.right = "0px";
    div.style.zIndex = "-1";
    document.body.appendChild(div);
    CreateGrass();
})();

// pet movement loop
(async function() {
    while (true) {
        for (let pet of Pets) {
            let catDiv = pet.divElement;
            let rect = catDiv.getBoundingClientRect();
            let centerX = rect.x + (CatBoundingBoxWidth/2);
            let centerY = rect.y + (CatBoundingBoxHeight/2);
            let {RationX, RationY} = getXYSpeed(centerX, centerY, XCord, YCord);
            let FutureX;
            let FutureY;

            pet.EvaluateDirection(centerX, centerY, XCord, YCord);

            if ((Math.abs(XCord - centerX) + Math.abs(YCord - centerY)) < CatStopsPxFromTheCursor)
            {
                pet.StopMoveAnimation();
                continue;
            }

            if (XCord > centerX) {
                FutureX = (rect.x + (CatMovementPerIntervalInPx*RationX));
            } else if (XCord < centerX) {
                FutureX = (rect.x - (CatMovementPerIntervalInPx*RationX));
            }
            if (YCord > centerY) {
                FutureY = (rect.y + (CatMovementPerIntervalInPx*RationY));
            } else if (YCord < centerY) {
                FutureY = (rect.y - (CatMovementPerIntervalInPx*RationY));
            }

            let {MoveX, MoveY} = TryMove(rect.x, rect.y, FutureX, FutureY)
            let IsMovingX = MoveX != null && Math.abs(catDiv.style.left.substring(0, catDiv.style.left.length - 2) - MoveX) > (CatMovementPerIntervalInPx * MinSpeedFractionForAnimation);
            let IsMovingY = MoveY != null && Math.abs(catDiv.style.top.substring(0, catDiv.style.top.length - 2) - MoveY) > (CatMovementPerIntervalInPx * MinSpeedFractionForAnimation);

            if (IsMovingX || IsMovingY) {
                pet.Animate();
            } else {
                pet.StopMoveAnimation();
            }

            if (MoveX != null) catDiv.style.left = MoveX + "px";
            if (MoveY != null) catDiv.style.top = MoveY + "px";
        }
        await delay(CatMovementIntervalInMs);
    }
})();
