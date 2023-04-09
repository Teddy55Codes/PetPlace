const CatMovementIntervalInMs = 50;
const CatMovementPerIntervalInPx = 1;
const CatStopsPxFromTheCursor = 0;

const CatHeight = 50;
const CatWidth = 50;

var XCord = 0;
var YCord = 0;

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

(async function() {
    while (true) {
        for (let catDiv of document.getElementsByClassName("cat")) {
            let rect = catDiv.getBoundingClientRect();
            let centerX = rect.x + (CatWidth/2);
            let centerY = rect.y + (CatHeight/2);
            if (XCord > centerX && XCord - centerX >= CatStopsPxFromTheCursor) {
                catDiv.style.left = (rect.x + CatMovementPerIntervalInPx) + 'px';
            } else if (XCord < centerX && centerX - XCord >= CatStopsPxFromTheCursor) {
                catDiv.style.left = (rect.x - CatMovementPerIntervalInPx) + 'px';
            }

            if (YCord > centerY && YCord - centerY >= CatStopsPxFromTheCursor) {
                catDiv.style.top = (rect.y + CatMovementPerIntervalInPx) + 'px';
            } else if (YCord < centerY && centerY - YCord >= CatStopsPxFromTheCursor) {
                catDiv.style.top = (rect.y - CatMovementPerIntervalInPx) + 'px';
            }
        }
        await delay(CatMovementIntervalInMs);
    }
})();

