// If your extension doesn't need a content script, just leave this file empty

// This is an example of a script that will run on every page. This can alter pages
// Don't forget to change `matches` in manifest.json if you want to only change specific webpages
document.body.addEventListener('click', (e) => {
  console.log(e);
    chrome.runtime.sendMessage({
        // @ts-ignore
        content: e.target.innerText,
  });
});

document.addEventListener('paste', (event) => {
    console.log(event);
    if (event.clipboardData) {
        let paste = event.clipboardData.getData('text');
        chrome.runtime.sendMessage({
            // @ts-ignore
            content: paste,
        });
    }
});

export function createAnIframe(elmnt: any) {

    const closeBtn = document.getElementById("close-btn");
    // @ts-ignore
    closeBtn.onclick = toggle;

    chrome.runtime.onMessage.addListener(function (msg, sender) {
        if (msg === "toggle") {
            toggle();
        }
        return true;
    })

    var iframe = document.createElement('iframe');
    iframe.style.height = "400px";
    // iframe.style.width = "0px";
    // iframe.style.position = "fixed";
    // iframe.style.top = "1px";
    // iframe.style.right = "1px";
    // iframe.style.border = "none";
    // iframe.style.zIndex = "99";
    iframe.src = chrome.extension.getURL("popup.html")
    // iframe.onload = function resizeIFrameToFitContent() {
    //     // @ts-ignore
    //     iframe.style.width  = String(iframe.contentWindow.document.body.scrollWidth);
    //     // @ts-ignore
    //     iframe.style.height = iframe.contentWindow.document.body.scrollHeight;
    // };

    // document.body.appendChild(iframe);
    elmnt.appendChild(iframe);

    // function toggle() {
    //     if (iframe.style.width === "0px") {
    //         iframe.style.width = "300px";
    //     } else {
    //         iframe.style.width = "0px";
    //     }
    // }
    function toggle() {
        if (elmnt.style.display === "none") {
            elmnt.style.display = "block";
            elmnt.style.top = "20px";
            elmnt.style.left = "80%";
        } else {
            elmnt.style.display = "none";
        }
        // if (elmnt.style.width === "0px") {
        //     elmnt.style.width = "300px";
        // } else {
        //     elmnt.style.width = "0px";
        // }
    }
}

const str = "<!-- Draggable DIV -->\n" +
    "<div id=\"mydiv\">\n" +
    "  <!-- Include a header DIV with the same name as the draggable DIV, followed by \"header\" -->\n" +
    "  <div id=\"mydivheader\">Click here to move <span id=\"close-btn\">X</span></div>\n" +
    // "  <p>Move</p>\n" +
    // "  <p>this</p>\n" +
    // "  <p>DIV</p>\n" +
    "</div>";

const mydiv = document.createElement('div');
mydiv.innerHTML = str;
document.body.appendChild(mydiv);

const cssStyles = "#mydiv {\n" +
    "  position: fixed;\n" +
    "  z-index: 9;\n" +
    "  background-color: #f1f1f1;\n" +
    "  border: 1px solid #d3d3d3;\n" +
    "  text-align: center;\n" +
    "}\n" +
    "#close-btn { cursor: pointer; } \n" +
    "\n" +
    "#mydivheader {\n" +
    "  padding: 10px;\n" +
    "  display: flex;\n" +
    "  justify-content: space-between;\n" +
    "  cursor: move;\n" +
    "  z-index: 10;\n" +
    "  background-color: #2196F3;\n" +
    "  color: #fff;\n" +
    "}";

function loadCSS(cssStyles: string) {
    const link = document.createElement('link');
    link.href = `data:text/css;base64,${btoa(cssStyles)}`;
    link.type = 'text/css';
    link.rel = 'stylesheet';
    document.getElementsByTagName('head')[0].appendChild(link);
}

loadCSS(cssStyles);

dragElement(document.getElementById("mydiv"));

// @ts-ignore
function dragElement(elmnt) {
    elmnt.style.display = "none";
    createAnIframe(elmnt);
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        // if present, the header is where you move the DIV from:
        // @ts-ignore
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }

    // @ts-ignore
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    // @ts-ignore
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
