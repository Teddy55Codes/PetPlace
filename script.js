const CatMovementIntervalInMs = 10;
const CatMovementPerIntervalInPx = 1;
const CatStopsPxFromTheCursor = 50;

const CatHeight = 50;
const CatWidth = 50;

let XCord = 0;
let YCord = 0;

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

function CreateACat() {
    const div = document.createElement("div");

    div.className = "cat";
    div.style = "background-color: red;";
    div.style.width = CatHeight + "px";
    div.style.height = CatWidth + "px";
    div.style.position = 'absolute';
    document.body.appendChild(div);
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

function TryMove(currentX, currentY, targetX, targetY) {
    let currentRect = new DOMRect(currentX, currentY, CatWidth, CatHeight);
    let futureRect = new DOMRect(targetX.substring(0, targetX.length - 2), targetY.substring(0, targetY.length - 2), CatWidth, CatHeight)
    let MoveX = targetX;
    let MoveY = targetY;
    for (let catDiv of document.getElementsByClassName("cat")) {
        let rect = catDiv.getBoundingClientRect();
        if (rect.x === currentRect.x && rect.y === currentRect.y) continue;
        if (((futureRect.top > rect.top && futureRect.top < rect.bottom) ||
            futureRect.bottom < rect.bottom && futureRect.bottom > rect.top) &&
            ((futureRect.left > rect.left && futureRect.left < rect.right) ||
                futureRect.right < rect.right && futureRect.right > rect.left)) {
            MoveY = currentRect.top+(CatHeight/2);
            MoveX = currentRect.left+(CatWidth/2);
        }
    }
    return {MoveX, MoveY};


}

(async function() {
    while (true) {
        for (let catDiv of document.getElementsByClassName("cat")) {
            let rect = catDiv.getBoundingClientRect();
            let centerX = rect.x + (CatWidth/2);
            let centerY = rect.y + (CatHeight/2);
            let {RationX, RationY} = getXYSpeed(centerX, centerY, XCord, YCord);
            let FutureX;
            let FutureY;

            if ((Math.abs(XCord - centerX) + Math.abs(YCord - centerY)) < CatStopsPxFromTheCursor) continue;
            if (XCord > centerX) {
                FutureX = (rect.x + (CatMovementPerIntervalInPx*RationX)) + 'px';
            } else if (XCord < centerX) {
                FutureX = (rect.x - (CatMovementPerIntervalInPx*RationX)) + 'px';
            }
            if (YCord > centerY) {
                FutureY = (rect.y + (CatMovementPerIntervalInPx*RationY)) + 'px';
            } else if (YCord < centerY) {
                FutureY = (rect.y - (CatMovementPerIntervalInPx*RationY)) + 'px';
            }

            let {MoveX, MoveY} = TryMove(rect.x, rect.y, FutureX, FutureY)
            catDiv.style.left = MoveX;
            catDiv.style.top = MoveY;
        }
        await delay(CatMovementIntervalInMs);
    }
})();

