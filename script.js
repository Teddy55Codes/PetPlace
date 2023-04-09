const CatMovementIntervalInMs = 50
const CatStopsPxFromTheCursor = 100

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
    div.style.width = "50px";
    div.style.height = "50px";
    div.style.position = 'absolute';
    document.body.appendChild(div);
}

(async function() {
    while (true) {
        for (let catDiv of document.getElementsByClassName("cat")) {
            let rect = catDiv.getBoundingClientRect();
            if (XCord > rect.x && XCord - rect.x >= CatStopsPxFromTheCursor) {
                catDiv.style.left = (rect.x + 1) + 'px';
            } else if (XCord < rect.x && rect.x - XCord >= CatStopsPxFromTheCursor) {
                catDiv.style.left = (rect.x - 1) + 'px';
            }

            if (YCord > rect.y && YCord - rect.y >= CatStopsPxFromTheCursor) {
                catDiv.style.top = (rect.y + 1) + 'px';
            } else if (YCord < rect.y && rect.y - YCord >= CatStopsPxFromTheCursor) {
                catDiv.style.top = (rect.y - 1) + 'px';
            }
        }
        await delay(CatMovementIntervalInMs);
    }
})();

