const CatMovementIntervalInMs = 10;
const CatMovementPerIntervalInPx = 1;
const CatStopsPxFromTheCursor = 50;
const CatAnimationSlowdown = 10;
const MaxSpawnRetries = 100;

const CatHeight = 50;
const CatWidth = 50;

let XCord = 0;
let YCord = 0;

let Pets = [];

const PetMovingStates = ["./resources/CatStanding.png", "./resources/CatMoving.png"]

class Pet {
    constructor() {
        const div = document.createElement("div");
        this.imgState = 0;
        this.animationStepper = 0;
        this.animationSlowdown = CatAnimationSlowdown;

        div.className = "cat";
        div.style = "background-color: red;";
        div.style.width = CatHeight + "px";
        div.style.height = CatWidth + "px";
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
            let {MoveX, MoveY, hasCollision} = TryMove(0, 0, getRandom(0, window.innerWidth), getRandom(0, innerHeight))
            isColliding = hasCollision;
            SpawnPositionX = MoveX;
            SpawnPositionY = MoveY;
            iteration++;
        }
        div.style.left = SpawnPositionX + "px";
        div.style.top = SpawnPositionY + "px";
        let img = document.createElement("img");
        img.className = "catImage";
        img.src = PetMovingStates[0];
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
        if (this.animationStepper % this.animationSlowdown === 0) {
            this.imgState++;
            this.div.getElementsByClassName("catImage")[0].src = PetMovingStates[this.imgState % PetMovingStates.length];
        }
        this.animationStepper++;
    }

    StopMoveAnimation() {
        this.imgState = 0;
        this.div.getElementsByClassName("catImage")[0].src = PetMovingStates[0];
    }
}

const delay = ms => new Promise(res => setTimeout(res, ms));

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
            rect2.right <= rect1.right && rect2.right >= rect1.left)
}

function TryMove(currentX, currentY, targetX, targetY) {
    let currentRect = new DOMRect(currentX, currentY, CatWidth, CatHeight);
    let futureRectXY = new DOMRect(targetX, targetY, CatWidth, CatHeight)
    let futureRectX = new DOMRect(targetX, currentY, CatWidth, CatHeight)
    let futureRectY = new DOMRect(currentX, targetY, CatWidth, CatHeight)

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

(async function() {
    while (true) {
        for (let pet of Pets) {
            let catDiv = pet.divElement;
            let rect = catDiv.getBoundingClientRect();
            let centerX = rect.x + (CatWidth/2);
            let centerY = rect.y + (CatHeight/2);
            let {RationX, RationY} = getXYSpeed(centerX, centerY, XCord, YCord);
            let FutureX;
            let FutureY;

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
            if (MoveX != null) catDiv.style.left = MoveX + "px";
            if (MoveY != null) catDiv.style.top = MoveY + "px";

            if (MoveX != null || MoveY != null) {
                pet.Animate();
            }
        }
        await delay(CatMovementIntervalInMs);
    }
})();

