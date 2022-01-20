import React, {useEffect, useState} from "react";
import {ResizableBox} from "react-resizable";
import Draggable from "react-draggable";
// import templates from './templates.json';
import SelectSearch, {fuzzySearch} from 'react-select-search';
import axios from "axios";

const re = /param\d/g;

function getParamsFromTemplate(template: String) {
    return Array.from(new Set(template.match(re)));
}

function getComponentsFromForm(obj: any) : any {
    const objs = Object.entries(obj)
        // @ts-ignore
        .reduce((acc, [key, value]) => (value != null && value.hasOwnProperty('enum'))
                // @ts-ignore
                ? acc.concat({name: key, value: value})
                    : (value != null && typeof value === 'object')
                        ? acc.concat(getComponentsFromForm(value))
                        : acc
                , []);
    return objs;
}

function getAllOptionsFromComponent(component: any) : any {
    if (component != null && component.hasOwnProperty('enum')) {
        const options = component["enum"];
        const result = "local allOptions = [" + options.map((opt: any) => "\"" + opt + "\"").join(", ") + "]";
        return result;
    } else return "";
}

const ParamItem = React.memo((props: { name: any; index: any; isCapturing: any; setCapturing: any; onTextInput: any; }) => {
    const {name, index, isCapturing, setCapturing, onTextInput} = props;
    const onClick = () => {
        if (isCapturing === index) {
            setCapturing(null);
        } else {
            setCapturing(index);
        }
    };
    return (
        <div className="param-item">
            <input type="text" value={name} onChange={onTextInput} disabled={isCapturing !== index}/>
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
    const [templates, setTemplates] = useState([]);
    const [content, setContent] = useState("");
    const [template, setTemplate] = useState("");
    const [params, setParams] = useState([]);
    // index of the param
    const [capturing, setCapturing] = useState(null);
    const [components, setComponents] = useState([]);
    const [component, setComponent] = useState("");

    const setTemplateAndParams = (template: String) => {
        // @ts-ignore
        setTemplate(template);
        // @ts-ignore
        setParams(getParamsFromTemplate(template));
    }

    const onTextInput = (e: { target: { value: React.SetStateAction<string>; }; }) => {
        setContent(e.target.value);
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
        chrome.runtime.onMessage.addListener(
            function (request, sender, sendResponse) {
                setContent(request.content);
            }
        );

        // axios.get(
        //     "https://patheon-adi.s3.ap-southeast-1.amazonaws.com/templates.json"
        //     ).then(response => setTemplates(response.data)).catch(error => console.log(error));
        chrome.storage.local.get(['template', 'form'], function(result) {
            const template = JSON.parse(result.template);
            setTemplates(template);

            const form = JSON.parse(result.form);
            const components = getComponentsFromForm(form);
            setComponents(components);
        });

    }, []);

    // @ts-ignore
    return (
        <Draggable handle=".draggable-wrapper">
            <ResizableBox
                width={300}
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
                    <SelectSearch
                        options={components}
                        value={component}
                        search
                        filterOptions={fuzzySearch}
                        placeholder="Select template"
                        // @ts-ignore
                        onChange={setComponent}
                    />
                </div>
                <div className="spacing-1">
                    {params.map((param, index) => {
                        return (
                            <ParamItem name={param} index={index} setCapturing={setCapturing} isCapturing={capturing} onTextInput={onTextInput}/>)
                    })}
                </div>
                <div className="spacing-1">
                    <div className="editable-div" id="kr-edit" contentEditable>
                        {getTemplateWithParamsReplaced(template, params)}
                        {getAllOptionsFromComponent(component)}
                    </div>
                </div>
            </ResizableBox>
        </Draggable>
    );
}

export default App;
