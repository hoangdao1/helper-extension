
# Form helper

A Chrome extension that helps you to note down the important things temporarily and reuse your functions when building form.


# Installation 
- Clone the repository here:
https://github.com/hoangdh143/helper-extension.git
- Navigate to the folder, run ```npm install``` then ```npm run build```
- Open Chrome browser, navigate to chrome://extensions
- Enable Developer mode on the top right of the window
- Click ```Load Unpack``` button then select ```build``` folder of the project
- After the extension installed, click on extension icon on the top right of the window then pin the extension to the toolbar
## Initial Setup
- The template is a json file with format:
```bash
  [
    "name": "funtion_name",
    "value": "function_body"
  ]
  # The params of function_body will be param0, param1, etc.
  # The extension will atomatically detect parameter name and create input for them
```
- You can get an example of template.json at the root folder of the project
- Right click at the extension, select Options then select the template file
- After the file is read successfully you can select the functions in the dropdown of the extension


# Usage
- Open Form Builder page
- Click on the extension to open the popup
- The popup can be used as a note
- The popup can be dragged around
- You can select the template functions in the dropdown
- Click capture to capture the param name (the status is ``capturing``)
- Select the component name, when the tooltip appears that "Copied to clipboard", you can press Command + V then the value will be set to the function.


# Modification
- The extension is written in Typescript, you can edit components/App.tsx and contentScript/index.ts to add more functionalities
- Extension metadata and permissions are located in public/manifest.json
- Run ```npm install``` and ```npm run build``` to rebuild the extension then reload the extension in Chrome extension management page


# Resources:
 - [React extension boilerplate](https://github.com/VasilyShelkov/create-react-extension)
 - [Chrome extension tutorials](https://developer.chrome.com/docs/extensions/mv3/getstarted/)
    