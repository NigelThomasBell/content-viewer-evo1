# ContentViewer
## Program description and features
* ContentViewer is a file viewer that allows the user to easily:
    * Navigate the local folders.
        * This is done by clicking on a folder (which will have a folder icon) in the file explorer.
        * To go back a folder, press the "Go Back" button.
        * To go to a specific directory, press the "Choose Directory" button, and choose the folder to open. The folder can also be chosen from a different drive.
    * View files.
        * Files are rendered using the Chromium browser engine. This means that the same page layout and built-in viewers (for example the PDF viewer) as seen in Chromium-based browsers such as Google Chrome and Opera is also available in ContentViewer.
    * Adjust the width of the file explorer and the page.
        * This is done by clicking on the section divider and dragging it left or right.
        * This is also good for demonstrating responsive web design implemented in local webpages.
    * Switch between files inside the currently selected folder.
        * This is done by clicking on one of the files (which will have a file icon) in the file explorer and then pressing the up arrow to go to the file above or the down arrow to go to the file below. The row of the currently selected file will have an orange background colour.
        * If your most recent click is within the file explorer and a file is selected, the file switching with the arrow keys can be done.
        * If your most recent click is within the file viewing area, pressing the arrow keys will scroll the file and not switch the file.
    * Search and sort the files and folders inside the currently selected folder.
        * Searching is done by typing in a search term within the search bar. The search will return the files and folders that includes the search term as a substring at any point of the file/folder name. For example, if a folder contains a `each.txt` file and a `teacher` folder, a search term of `ea` would return both.
        * The sorting options allow the files and folders to be sorted by content type (folders first, files first or alphabetically) and sort direction (ascending or descending).

## Note regarding the preference of yarn over npm
* Note that the equivalent commands used for ContentViewer in yarn and npm (use only one) have been provided in the "Requirements and installation" section.
* After installing Node, enter this command in order to install yarn: 
    ```
    npm install --global yarn
    ```
* It is recommended to use yarn if possible, because it is faster (since it installs the packages in parallel instead of sequentially) and more secure (since it verifies the packages with a checksum instead of using SHA-512 from `package-lock.json`).
* If ContentViewer needs to be converted to use npm commands, refer to the following for what needs to be changed within `package.json`, in the `scripts` section:
    * If yarn is being used:
		```
		"scripts": {
			"start": "react-scripts start",
			"build": "react-scripts build",
			"test": "react-scripts test",
			"eject": "react-scripts eject",
			"electron:serve": "concurrently -k \"cross-env BROWSER=none yarn start\" \"yarn electron:start\"",
			"electron:build": "yarn build && electron-builder -c.extraMetadata.main=build/main.js",
			"electron:start": "concurrently -k \"wait-on tcp:3000\" \"electron .\""
		},
		```
    * If npm is being used:
		```
		"scripts": {
            "start": "react-scripts start",
            "build": "react-scripts build",
            "test": "react-scripts test",
            "eject": "react-scripts eject",
            "electron:serve": "concurrently -k \"cross-env BROWSER=none npm start\" \"npm run electron:start\"",
            "electron:build": "npm run build && electron-builder -c.extraMetadata.main=build/main.js",
            "electron:start": "concurrently -k \"wait-on tcp:3000\" \"electron .\""
		},
		```

## Requirements and installation
* ContentViewer was made using Node 18.12.1 LTS, React 18.2.0, Electron 21.3.1 and Bootstrap 5.2.3.
* Several node modules are required for ContentViewer. These include:
    * Several modules already provided after running:
        ```
        yarn install
        npm install
        ```
    * Core packages:
        ```
        yarn add electron concurrently wait-on cross-env
        npm i electron concurrently wait-on cross-env
        ```
    * Electron remote:
        ```
        yarn add @electron/remote
        npm i @electron/remote
        ```
    * Bootstrap:
        ```
        yarn add bootstrap@next
        npm i bootstrap @next
        ```
    * Build and installer compilation packages:
        ```
        yarn add electron-builder electron-is-dev
        npm i electron-builder electron-is-dev
        ```

## Commands for ContentViewer after completing the requirements and installation:
* Run the ContentViewer in Electron:
    ```
    yarn electron:serve
    npm run electron:serve
    ```
* Compile the ContentViewer into a build and an installer
    ```
    yarn electron:build
    npm run electron:build
    ```

## Note regarding the Electron Security Warning (Insecure Content-Security-Policy).
* A Content-Security-Policy (CSP) has not been added within the head of `public/index.html` because ContentViewer uses inline scripting.

## References
* ContentViewer was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). The command to do this is:
    ```
    npx create-react-app react-electron
    ```
* The file explorer is based on the "Electron with React - Building a desktop applications with React and Electron" tutorial by Coding with Justin, which consists of a [YouTube video](https://www.youtube.com/watch?v=oAaS9ix8pes) and a [GitHub repository](https://github.com/codingwithjustin/react-electron). I have created and used an [updated version of the repository](https://github.com/NigelBell/react-electron).
* Part of the highlightSelectedRow function is based on Mohamed Ramrami's answer to the StackOverflow question "How to change the table row color onclick function in java script" (https://stackoverflow.com/questions/50354916/how-to-change-the-table-row-color-onclick-function-in-java-script)
* The section divider/resizable sidebar is based on the "Resizable Sidebar" code snippet by Xingchen Hong (https://codepen.io/Zodiase/pen/qmjyKL).