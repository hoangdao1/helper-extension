import React, {useState} from 'react';
import './Options.css';

function Options() {
    const [files, setFiles] = useState("");
    const [noti, setNoti] = useState("");

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
    return (
        <div>
            <h1>Upload Template File </h1>
            <p className="upload-notification">{noti}</p>
            <input type="file" onChange={handleChange} />
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
