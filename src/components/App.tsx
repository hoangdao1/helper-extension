import React, {useEffect, useState} from "react";
import {ResizableBox} from "react-resizable";
import Draggable from "react-draggable";
import templates from './templates.json';
import SelectSearch, {fuzzySearch} from 'react-select-search';

const re = /param\d/g;

function getParamsFromTemplate(template: String) {
    return Array.from(new Set(template.match(re)));
}

const ParamItem = React.memo((props: { name: any; index: any; isCapturing: any; setCapturing: any; }) => {
    const {name, index, isCapturing, setCapturing} = props;
    const onClick = () => {
        if (isCapturing === index) {
            setCapturing(null);
        } else {
            setCapturing(index);
        }
    };
    return (
        <div className="param-item">
            <input type="text" value={name}/>
            <button onClick={onClick}>{isCapturing === index ? "Capturing" : "Capture"}</button>
        </div>
    );
});

function getTemplateWithParamsReplaced(template: String, params: any[]) {
    const originalParams = getParamsFromTemplate(template);
    return originalParams.reduce((previousValue, currentValue, currentIndex) => {
        return previousValue.replaceAll(currentValue, params[currentIndex]);
    }, template);
}

function App() {
    const [content, setContent] = useState("");
    const [template, setTemplate] = useState("");
    const [params, setParams] = useState([]);
    // index of the param
    const [capturing, setCapturing] = useState(null);
    const setTemplateAndParams = (template: String) => {
        // @ts-ignore
        setTemplate(template);
        // @ts-ignore
        setParams(getParamsFromTemplate(template));
    }

    useEffect(() => {
        if (capturing != null) {
            const newParams = params.map(
                (item, index) => {
                    if (index === capturing) {
                        return content;
                    } else {
                        return item;
                    }
                }
            );
            // @ts-ignore
            setParams(newParams);
        }
    }, [content]);


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
            function (request, sender, sendResponse) {
                setContent(request.content);
                // if (request.content === "hello")
                //   sendResponse({farewell: "goodbye"});
                // if (capturing != null) {
                //     // @ts-ignore
                //     const newParams = replaceParamsAtIndex(capturing, request.content);
                //     console.log(newParams);
                //     // @ts-ignore
                //     setParams(newParams);
                // }
            }
        );

        return () => {
            document.removeEventListener("paste", () => {
            });
        };
    }, []);

    // @ts-ignore
    return (
        <Draggable handle=".draggable-wrapper">
            <ResizableBox
                width={500}
                height={500}
                minConstraints={[100, 100]}
                maxConstraints={[340, 700]}
            >
                <div className="draggable-wrapper">
                    <div className="icon-wrapper">
                        <div className="icon red"/>
                        <div className="icon yellow"/>
                        <div className="icon green"/>
                    </div>
                </div>
                <div className="spacing-1">
                    <SelectSearch
                        options={templates}
                        value={template}
                        search
                        filterOptions={fuzzySearch}
                        placeholder="Select template"
                        // @ts-ignore
                        onChange={setTemplateAndParams}
                    />
                </div>
                <div className="spacing-1">
                    {params.map((param, index) => {
                        return (
                            <ParamItem name={param} index={index} setCapturing={setCapturing} isCapturing={capturing}/>)
                    })}
                </div>
                <div className="spacing-1">
                    <div className="editable-div" id="kr-edit" contentEditable>
                        {getTemplateWithParamsReplaced(template, params)}
                    </div>
                </div>
            </ResizableBox>
        </Draggable>
    );
}

export default App;
