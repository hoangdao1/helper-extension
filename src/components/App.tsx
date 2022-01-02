import {useEffect, useState} from "react";
import { ResizableBox } from "react-resizable";
import Draggable from "react-draggable";
import templates from './templates.json';

function App() {
    const [content, setContent] = useState("");
  useEffect(() => {
    document.addEventListener("paste", function (e: ClipboardEvent) {
      e.preventDefault();

      let pastedText: string = "";

      if (e?.clipboardData?.getData) {
        pastedText = e.clipboardData.getData("text/html");
      }
      let editableDiv = document.getElementById("kr-edit") as HTMLDivElement;
      editableDiv.innerHTML = `${editableDiv?.innerHTML} ${pastedText}`;
      editableDiv.scrollTop = editableDiv.scrollHeight;

    });

    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
         setContent(request.content);
        // if (request.content === "hello")
        //   sendResponse({farewell: "goodbye"});
      }
    );

    return () => {
      document.removeEventListener("paste", () => {});
    };
  }, []);

  return (
    <Draggable handle=".draggable-wrapper">
      <ResizableBox
        width={300}
        height={200}
        minConstraints={[100, 100]}
        maxConstraints={[340, 700]}
      >
        <div className="draggable-wrapper">
          <div className="icon-wrapper">
            <div className="icon red"></div>
            <div className="icon yellow"></div>
            <div className="icon green"></div>
          </div>
        </div>
          <div>{content}</div>
        <div className="editable-div" id="kr-edit" contentEditable />
      </ResizableBox>
    </Draggable>
  );
}

export default App;
