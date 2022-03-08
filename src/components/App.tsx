import React, {useEffect, useState} from "react";
import {ResizableBox} from "react-resizable";
import Draggable from "react-draggable";
// import templates from './templates.json';
import SelectSearch, {fuzzySearch} from 'react-select-search';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
const fuzz = require('fuzzball');

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

function getEachOptions(compName: any, options: any) : any {
    return options.map((opt: any, index: number) => "local opt" + (index + 1) + " = std.member(" + compName + ", \"" + opt + "\");")
        .join("\n");
}

function getAllOptionsFromComponent(component: any, compName: any) : any {
    if (component != null && component.hasOwnProperty('enum')) {
        const options = component["enum"];
        const eachOptions = getEachOptions(compName, options);
        return "local allOptions = [\n" + options.map((opt: any) => "\"" + opt + "\"").join(", \n    ") + "\n];\n\n" + eachOptions;
    } else if (component != null && component.hasOwnProperty('items') && component.items.hasOwnProperty("enum")) {
        const options = component.items["enum"];
        const eachOptions = getEachOptions(compName, options);
        return "local allOptions = [\n" + options.map((opt: any) => "\"" + opt + "\"").join(", \n    ") + "\n];\n\n" + eachOptions;
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

function getUICompFromForm(compName: any, fullForm: any): Array<any> {
    const objs = Object.entries(fullForm)
        // @ts-ignore
        .reduce((acc, [key, value]) => (key === compName && value.hasOwnProperty("ui:formattedText"))
                // @ts-ignore
                ? acc.concat(value)
                : (value != null && typeof value === 'object')
                    // @ts-ignore
                    ? acc.concat(getUICompFromForm(compName, value))
                    : acc
            , []);
    return objs;
}

function getUIRefCompBySimilarity(compContent: any, refForm: any, ratio: number): Array<any> {
    const _ratio = ratio > 0 ? ratio : 80;
    const objs = Object.entries(refForm)
        // @ts-ignore
        .reduce((acc, [key, value]) => (value != null && value.hasOwnProperty("ui:formattedText") && fuzz.token_sort_ratio(compContent, JSON.stringify(value)) >= _ratio)
                // .reduce((acc, [key, value]) => (value != null && value.hasOwnProperty("ui:formattedText") && leven(compContent, JSON.stringify(value)) <= 0.5 * compContent.length)
                // @ts-ignore
                ? acc.concat(key)
                : (value != null && typeof value === 'object')
                    // @ts-ignore
                    ? acc.concat(getUIRefCompBySimilarity(compContent, value, _ratio))
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
        return "local clear = if cond then \n" + main + ".add('value', '') + \n else [];";
    } else return "";
}

function componentsToString(components: any) {
    return components.map((item: any)  => ({
        name: item.name,
        value: JSON.stringify(item.value)
    }));
}

function getRelatedRules(compName: any, form: any) {
    const rules = form['form']['rules'];
    return rules.filter((item: any) => item['value'].includes(compName));
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
    const [refCompName, setRefCompName] = useState("");
    const [clearFunc, setClearFunc] = useState("");
    const [textContent, setTextContent] = useState("");
    const [refForm, setRefForm] = useState([]);
    const [suggestion, setSuggestion] = useState("");
    const [ratio, setRatio] = useState(80);

    const onCompInput = (e: any) => setCompName(e.target.value);

    const onRefCompInput = (e: any) => setRefCompName(e.target.value);

    const getClear = () => {
        const funcBody = getClearFuncFromComponent(compName, fullForm);
        setClearFunc(funcBody);
        setTextContent(funcBody);
    }

    const getSuggestion = () => {
        if (refForm.length > 0) {
            const result = refForm.map((ref) => {
                // @ts-ignore
                const refContent = JSON.parse(ref.content);
                console.log(fullForm);
                const uiComps = getUICompFromForm(refCompName, fullForm);
                const uiComp = uiComps.length > 0 ? uiComps[0] : "";
                // console.log(uiComp);
                const refCompName1 = getUIRefCompBySimilarity(JSON.stringify(uiComp), refContent, ratio);
                const refName = refCompName1.length > 0 ? refCompName1[0] : "";
                console.log(refName);
                if (refName === "") {
                    return "";
                }
                const relatedRules = getRelatedRules(refName, refContent);
                if (relatedRules.length === 0) {
                    return "";
                } else {
                    return relatedRules.map((rule: any) => rule.value).join("\n\n ------- \n\n");
                }
            }).join("\n\n ------- \n\n");

            if (result !== "") {
                setSuggestion(result);
            } else setSuggestion("Not found!");
        }
    }

    const setComponent2 = (comp: String) => {
        const compName = components.find(item =>  item['value'] === comp);
        // @ts-ignore
        setComponent(comp);
        // @ts-ignore
        setTextContent(getAllOptionsFromComponent(comp !== "" ? JSON.parse(comp) : comp, compName ? compName['name'] : ""));
    }

    const setTemplateAndParams = (template: String) => {
        // @ts-ignore
        setTemplate(template);
        // @ts-ignore
        setParams(getParamsFromTemplate(template));
        // @ts-ignore
        setTextContent(getTemplateWithParamsReplaced(template, params));
    }

    const onTextInput = (e: { target: { value: React.SetStateAction<string>; }; }) => {
        setContent(e.target.value);
    }

    const onRatioInput = (e: any) => { setRatio(e.target.value); }

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
        chrome.storage.local.get(['template', 'form', 'ref'], function(result) {
            const template = JSON.parse(result.template);
            setTemplates(template);

            console.log(result);
            const refForm = result.ref;
            setRefForm(refForm);

            const form = JSON.parse(result.form);
            const components = componentsToString(getComponentsFromForm(form));
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
                <input type="text" value={refCompName} onChange={onRefCompInput}/>
                <input type="number" value={ratio} onChange={onRatioInput} />
                <button onClick={getSuggestion}>Get Suggestion</button>
            </div>
            <div className="spacing-1">
                {params.map((param, index) => {
                    return (
                        <ParamItem name={param} index={index} setCapturing={setCapturing} isCapturing={capturing} onTextInput={onTextInput}/>)
                })}
            </div>
            <div className="spacing-1">
                <div className="editable-div" id="kr-edit" contentEditable>
                    {/*{getTemplateWithParamsReplaced(template, params)}*/}
                    {/*{getAllOptionsFromComponent(component !== "" ? JSON.parse(component) : component)}*/}
                    {/*{clearFunc}*/}
                    {textContent}
                    <SyntaxHighlighter language="javascript" style={docco}>
                        {suggestion}
                    </SyntaxHighlighter>

                </div>
            </div>
        </div>
        //     </ResizableBox>
        // </Draggable>
    );
}

export default App;
