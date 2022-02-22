import React, {useState} from 'react';
import './Options.css';

function Options() {
    const [files, setFiles] = useState("");
    const [noti, setNoti] = useState("");
    const [refNoti, setRefNoti] = useState("");



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
            setFiles(result);
            // @ts-ignore
            chrome.storage.local.set({refForm: result}, function() {
                setRefNoti('Ref Form is set successfully');
            });
        };
    };

    return (
        <div>
            <h1>Upload Template File </h1>
            <p className="upload-notification">{noti}</p>
            <input type="file" onChange={handleChange} />
            <br />
            {"uploaded file content -- " + files}
            <h1>Upload Form Content File </h1>
            <p className="upload-notification">{noti}</p>
            <input type="file" onChange={handleFormChange} />
            <br />
            <h1>Upload Reference form </h1>
            <p className="upload-notification">{refNoti}</p>
            <input type="file" onChange={handleRefFormChange} />
            <br />
            {"uploaded file content -- " + files}
        </div>
    );
  // return (
  //   <div className="App">
  //      <p>In development phase...</p>
  //   </div>
  // );
}

export default Options;
