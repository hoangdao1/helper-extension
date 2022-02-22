import React, {useEffect, useState} from 'react';
import './Options.css';

function Options() {
    const [files, setFiles] = useState("");
    const [noti, setNoti] = useState("");
    const [refNoti, setRefNoti] = useState("");
    const [refs, setRefs] = useState([]);
    const [refFile, setRefFile] = useState("");
    const [refName, setRefName] = useState("");

    useEffect(() => {
        chrome.storage.local.get('ref', function(result) {
            const refForm = JSON.parse(result.ref);
            if (refForm.length > 0) {
                setRefs(refForm);
            }
        });
    }, []);


    const handleChange = (e: any) => {
        const fileReader = new FileReader();
        fileReader.readAsText(e.target.files[0], "UTF-8");
        fileReader.onload = e => {
            // @ts-ignore
            const result = e.target.result;
            // @ts-ignore
            setFiles(result);
            // @ts-ignore
            chrome.storage.local.set({template: result}, function() {
                setNoti('Template is set successfully');
            });
        };
    };

    const handleFormChange = (e: any) => {
        const fileReader = new FileReader();
        fileReader.readAsText(e.target.files[0], "UTF-8");
        fileReader.onload = e => {
            // @ts-ignore
            const result = e.target.result;
            // @ts-ignore
            setFiles(result);
            // @ts-ignore
            chrome.storage.local.set({form: result}, function() {
                setNoti('Form is set successfully');
            });
        };
    };

    const handleRefFormChange = (e: any) => {
        const fileReader = new FileReader();
        fileReader.readAsText(e.target.files[0], "UTF-8");
        fileReader.onload = e => {
            // @ts-ignore
            const result = e.target.result;
            // @ts-ignore
            setRefFile(result);
            // @ts-ignore
            // chrome.storage.local.set({ref: result}, function() {
            //     setRefNoti('Ref Form is set successfully');
            // });
        };
    };

    const submitRefForm = () => {
        const oldRefs = refs.length > 0 ? refs : [];
        console.log(oldRefs);
        const ext = [{name: refName, content: refFile}];
        console.log(ext[0]);
        const newRefs = [...oldRefs, ...ext];
        chrome.storage.local.set({ref: newRefs}, function() {
            setRefNoti('Ref Form is set successfully');
            // @ts-ignore
            setRefs(newRefs);
        });
    }

    const deleteRef = (index : number) => {
        const newRefs = refs.filter((item, idx) => idx !== index);
        chrome.storage.local.set({ref: newRefs}, function() {
            setRefNoti('Ref Form is deleted successfully');
            // @ts-ignore
            setRefs(newRefs);
        });
    }

    const handleRefName = (e: any) => setRefName(e.target.value);

    return (
        <div>
            <h1>Upload Template File </h1>
            <p className="upload-notification">{noti}</p>
            <p className="upload-notification">{refNoti}</p>
            <input type="file" onChange={handleChange} />
            <br />
            {/*{"uploaded file content -- " + files}*/}
            <h1>Upload Form Content File </h1>
            <p className="upload-notification">{noti}</p>
            <input type="file" onChange={handleFormChange} />
            <br />
            <h1>Upload Reference form </h1>
            <p className="upload-notification">{refNoti}</p>
            <input value={refName} onChange={handleRefName}/>
            <input type="file" onChange={handleRefFormChange} />
            <button onClick={submitRefForm}>Add Ref Form</button>
            <br />
            {
                refs.length > 0 && refs.map((item, index) => {
                    return (<div>
                        {item['name']}
                        <button onClick={() => deleteRef(index)}>Delete</button>
                    </div>);
                })
            }
            {/*{"uploaded file content -- " + files}*/}
        </div>
    );
  // return (
  //   <div className="App">
  //      <p>In development phase...</p>
  //   </div>
  // );
}

export default Options;
