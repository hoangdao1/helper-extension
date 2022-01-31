import React, {useEffect, useState} from "react";
import {ResizableBox} from "react-resizable";
import Draggable from "react-draggable";
// import templates from './templates.json';
import SelectSearch, {fuzzySearch} from 'react-select-search';

const re = /param\d/g;

function getParamsFromTemplate(template: String) {
    return Array.from(new Set(template.match(re)));
}

function getComponentsFromForm(obj: any) : any {
    const objs = Object.entries(obj)
        // @ts-ignore
        .reduce((acc, [key, value]) => (value != null &&
                // @ts-ignore
        ((key !== "items" && value.hasOwnProperty('enum')) || (value.hasOwnProperty('items') && value.items.hasOwnProperty("enum")))
            )
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
        return "local allOptions = [\n" + options.map((opt: any) => "\"" + opt + "\"").join(", \n    ") + "\n]";
    } else if (component != null && component.hasOwnProperty('items') && component.items.hasOwnProperty("enum")) {
        const options = component.items["enum"];
        return "local allOptions = [\n" + options.map((opt: any) => "\"" + opt + "\"").join(", \n    ") + "\n]";
    }
    else return "";
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

function getCompFromForm(compName: any, fullForm: any): Array<any> {
    const objs = Object.entries(fullForm)
        // @ts-ignore
        .reduce((acc, [key, value]) => (key === compName)
                // @ts-ignore
                ? acc.concat(value)
                : (value != null && typeof value === 'object')
                    // @ts-ignore
                    ? acc.concat(getCompFromForm(compName, value))
                    : acc
            , []);
    return objs;
}

function getAllInputFromComp(component: any) : any {
    const objs = Object.entries(component)
        // @ts-ignore
        .reduce((acc, [key, value]) => (value != null && (value['type'] === 'string' || value['type'] === 'array'))
                // @ts-ignore
                ? acc.concat({name: key, value: value})
                : (value != null && typeof value === 'object')
                    ? acc.concat(getAllInputFromComp(value))
                    : acc
            , []);
    return objs;
}

function getClearFuncFromComponent(compName: any, fullForm: any) {
    console.log(compName);
    console.log(fullForm);
    const comps = getCompFromForm(compName, fullForm);
    if (comps.length > 0) {
        const comp = comps[0];
        const inputs = getAllInputFromComp(comp);
        const main = inputs.map((item: any) => item.name).join(".add('value', '') +\n    ");
        return "local clear = " + main + ".add('value', '');";
    } else return "";
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
    const [fullForm, setFullForm] = useState({});
    const [compName, setCompName] = useState("");
    const [clearFunc, setClearFunc] = useState("");

    const onCompInput = (e: any) => setCompName(e.target.value);

    const getClear = () => {
        const funcBody = getClearFuncFromComponent(compName, fullForm);
        setClearFunc(funcBody);
    }

    const setComponent2 = (comp: String) => {
        console.log(comp);
        // @ts-ignore
        setComponent(comp);
    }

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
                return true;
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
            setFullForm(form);
        });

    }, []);

    // @ts-ignore
    return (
        // <Draggable handle=".draggable-wrapper">
        //     <ResizableBox
        //         width={300}
        //         height={500}
        //         minConstraints={[100, 100]}
        //         maxConstraints={[340, 700]}
        //     >
        <div>
                {/*<div className="draggable-wrapper">*/}
                {/*    <div className="icon-wrapper">*/}
                {/*        <div className="icon red"/>*/}
                {/*        <div className="icon yellow"/>*/}
                {/*        <div className="icon green"/>*/}
                {/*    </div>*/}
                {/*</div>*/}
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
                        onChange={setComponent2}
                    />
                </div>
                <div className="spacing-1">
                    <input type="text" value={compName} onChange={onCompInput}/>
                    <button onClick={getClear}>Get Clear</button>
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
                        {clearFunc}
                    </div>
                </div>
        </div>
        //     </ResizableBox>
        // </Draggable>
    );
}

export default App;
