import {useState, useMemo, useEffect} from 'react';
import {FilesViewer} from './FilesViewer';
const fs = window.require('fs');
const pathModule = window.require('path');
const {app, dialog} = window.require('@electron/remote');

const App = () => {
  // Several important app functions
  function formatFileSize(size){
    let i = Math.floor(Math.log(size) / Math.log(1024));
    return(
      (size / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB', 'RB', 'QB'][i]
    );
  };
  function highlightSelectedRow(id){
    if (id === null){
      let selectedRow = document.getElementsByClassName("selected");
      if (selectedRow.length > 0){
        selectedRow[0].classList.remove('selected');
      };
    }
    else{
      // Based on Mohamed Ramrami's answer to the StackOverflow question "How to change the table row color onclick function in java script" (https://stackoverflow.com/questions/50354916/how-to-change-the-table-row-color-onclick-function-in-java-script)
      let row = document.getElementById(id);
      let s = row.parentNode.querySelector('tr.selected'); 
      s && s.classList.remove('selected');
      row.classList.add('selected');
    };
  };
  function onOpen(content, isDirectory){
    let fullPath = pathModule.join(path, content);
    if (isDirectory){
      if (fs.existsSync(fullPath)){
        setPath(fullPath);
        highlightSelectedRow(null);
      }
      else{
        document.getElementById("page-iframe").src = "pages/error-folder-not-found.html";
      };
    }
    else{
      if (fs.existsSync(fullPath)){
        document.getElementById('page-iframe').src = fullPath;
      }
      else{
        document.getElementById("page-iframe").src = "pages/error-file-not-found.html";
      };
    };
  };
  function onBack(){
    path = pathModule.dirname(path);
    setPath(path);
  };
  function chooseDirectory(){
    dialog.showOpenDialog(
      {
        title: "Choose Directory",
        buttonLabel: "Choose Files",
        properties: ["openDirectory"]
      }
    ).then(
      (folderChosen) => {
        if (folderChosen.filePaths[0] !== undefined){
          document.getElementById("current-folder-directory").textContent = folderChosen.filePaths[0];
          setPath(folderChosen.filePaths[0]);
          highlightSelectedRow(null);
        };
      }
    );
  };
  function collectContentArrays(foldersArray, filesArray){
    for (let i = 0; i < contents.length; i++){
      switch(contents[i].isDirectory){
        case true:
          foldersArray.push(contents[i]);
          break;
        case false:
          filesArray.push(contents[i]);
          break;
        default:
          break;
      };
    };
  };

  // Getting the path and redirecting if required
  let [path, setPath] = useState(app.getAppPath());
  let isRedirected = false;
  while (!fs.existsSync(path)){
    isRedirected = true;
    path = pathModule.dirname(path);
  };
  if (isRedirected){
    document.getElementById("page-iframe").src = "pages/redirect-to-closest-parent.html";
  };

  // Getting the initial contents
  let i = 0;
  let initialContents = useMemo(
    () => fs
      .readdirSync(path)
      .filter(
        file => {
          try{
            fs.statSync(pathModule.join(path, file));
            return true;
          }
          catch(error){
            return false;
          };
        }
      )
      .sort(
        (a, b) => a.localeCompare(
          b, 
          navigator.languages[0] || navigator.language, 
          {
            numeric: true, 
            ignorePunctuation: false
          }
        )
      )
      .map(
        file => {
          let stats = fs.statSync(
            pathModule.join(path, file)
          );
          return{
            id: i++,
            name: file,
            size: stats.isFile() ? (stats.size !== 0 ? formatFileSize(stats.size) : "0 B") : null,
            isDirectory: stats.isDirectory()
          };
        }
      ),
    [path, i]
  );

  // Getting a refined list of contents based on the search input and sorting options chosen
  const [searchString, setSearchString] = useState('');
  let contents = initialContents.filter(s => s.name.includes(searchString));
  const [sortType, setSortType] = useState("folders-first");
  const [sortDirection, setSortDirection] = useState("ascending");
  if (sortType !== null){
    switch (sortType){
      case "folders-first":
        contents = [...contents].sort(
          (a, b) => b['isDirectory'] - a['isDirectory']
        );
        break;
      case "files-first":
        contents = [...contents].sort(
          (a, b) => !b['isDirectory'] - !a['isDirectory']
        );
        break;
      case "alphabetical":
        contents = [...contents].sort(
          (a, b) => a['id'] - b['id']
        );
        break;
      default:
        break;
    };
  };
  if (sortDirection !== null){
    switch (sortDirection){
      case "ascending":
        contents = contents.sort();
        break;
      case "descending":
        let foldersArray = [];
        let filesArray = [];
        switch (sortType){
          case "folders-first":
            collectContentArrays(foldersArray, filesArray);
            contents = foldersArray
              .reverse()
              .concat(
                filesArray.reverse()
              );
            break;
          case "files-first":
            collectContentArrays(foldersArray, filesArray);
            contents = filesArray
              .reverse()
              .concat(
                foldersArray.reverse()
              );
            break;
          case "alphabetical":
            contents = contents.reverse();
            break;
          default:
            break;
        };
        break;
      default:
        break;
    };
  };

  useEffect(
    () => {
      let fileExplorer = document.getElementById("file-explorer");
      let sectionDivider = document.getElementById("section-divider");
      let pageIFrame = document.getElementById("page-iframe");

      // useEffect part 1: The section divider/resizable sidebar. This is based on the "Resizable Sidebar" code snippet by Xingchen Hong (https://codepen.io/Zodiase/pen/qmjyKL). All jQuery code has been converted into plain JavaScript code.
      const resizeData = {
        tracking: false,
        startWidth: null,
        startCursorScreenX: null,
        handleWidth: 10,
        resizeTarget: null,
        parentElement: null,
        maxWidth: null,
      };
      sectionDivider.addEventListener(
        'mousedown', 
        (event) => {
          if (event.button !== 0){
            return;
          };
          event.preventDefault();
          event.stopPropagation();
          const handleElement = event.currentTarget;
          if (!handleElement.parentElement){
            console.error(
              new Error("Parent element not found.")
            );
            return;
          };
          const targetSelector = handleElement.getAttribute('data-target');
          const targetElement = !(handleElement.parentElement instanceof HTMLElement) ? null : handleElement.parentElement.querySelector(targetSelector);
          if (!targetElement){
            console.error(
              new Error("Resize target element not found.")
            );
            return;
          };
          resizeData.startWidth = targetElement.offsetWidth;
          resizeData.startCursorScreenX = event.screenX;
          resizeData.resizeTarget = targetElement;
          resizeData.parentElement = handleElement.parentElement;
          resizeData.maxWidth = handleElement.parentElement.clientWidth - resizeData.handleWidth;
          resizeData.tracking = true;
          fileExplorer.style.pointerEvents = "none";
          pageIFrame.style.pointerEvents = "none";
        }
      );
      window.addEventListener(
        'mousemove', 
        (event) => {
          if (resizeData.tracking){
            const cursorScreenXDelta = event.screenX - resizeData.startCursorScreenX;
            const newWidth = Math.min(
              resizeData.startWidth + cursorScreenXDelta, 
              resizeData.maxWidth
            );
            fileExplorer.style.width = newWidth + "px";
          };
        }
      );
      window.addEventListener(
        'mouseup', 
        function(){
          if (resizeData.tracking){
            resizeData.tracking = false;
            fileExplorer.style.pointerEvents = "all";
            pageIFrame.style.pointerEvents = "all";
          };
        }
      );

      // useEffect part 2: moving between the files in the currently open folder with the up and down arrow keys
      document.addEventListener(
        'keydown', 
        (event) => {
          if(["ArrowUp","ArrowDown"].indexOf(event.code) > -1){
            event.preventDefault();
          };
          path = document.getElementById("current-folder-directory").textContent;
          let currentSelectedRow = document.getElementsByClassName("selected");
          let filesCollection = document.getElementsByClassName("file");
          let fileNames = [];
          let i = 0;
          for (i = 0; i < filesCollection.length; i++){
            fileNames.push(
              filesCollection[i].getElementsByTagName("td")[1].textContent
            );
          };
          if(currentSelectedRow.length !== 0 && filesCollection.length > 0){
            let index = fileNames.indexOf(
              currentSelectedRow[0].getElementsByTagName("td")[1].textContent
            );
            let contentName = "";
            switch (event.key){
              case "ArrowUp":
                if (index === 0){
                  index = filesCollection.length - 1;
                }
                else{
                  index = index - 1;
                };
                contentName = filesCollection[index].getElementsByTagName("td")[1].textContent;
                onOpen(contentName, false);
                highlightSelectedRow(filesCollection[index].id);
                break;
              case "ArrowDown":
                if (index === filesCollection.length - 1){
                  index = 0;
                }
                else{
                  index = index + 1;
                };
                contentName = filesCollection[index].getElementsByTagName("td")[1].textContent;
                onOpen(contentName, false);
                highlightSelectedRow(filesCollection[index].id);
                break;
              default:
                break;
            };
          };
        }
      );
    }, 
    []
  );
  
  return(
    <div id="container" className="App">
      <aside id="file-explorer">
        <div className="container mt-2">
          <h4 id="current-folder-directory">
            {path}
          </h4>
          <div id="button-section">
            <button onClick={onBack}>Go Back</button>
            <button onClick={chooseDirectory}>Choose Directory</button>
          </div>
          <div className="form-group mt-4 mb-2">
            <input className="form-control form-control-sm"
              onChange={event => setSearchString(event.target.value)}
              value={searchString}
              placeholder="Search..."
            />
            <div className="sort-option">
              <label>Sort contents:</label>
              <select id="sort-by-options" className="sort-selector" 
                onChange={event => setSortType(event.target.value)}
              >
                <option value="folders-first">Folders First</option>
                <option value="files-first">Files First</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
            <div className="sort-option">
              <label>Sort direction:</label>
              <select id="sort-by-direction" className="sort-selector" 
                onChange={event => setSortDirection(event.target.value)}
              >
                <option value="ascending">↑ (Ascending)</option>
                <option value="descending">↓ (Descending)</option>
              </select>
            </div>
          </div>
          <FilesViewer 
            contents={contents} 
            onOpen={onOpen} 
            highlightSelectedRow={highlightSelectedRow}
          />
        </div>
      </aside>
      <div id="section-divider" 
        data-target="aside"
      >
      </div>
      <main id="page-section">
        <iframe id="page-iframe" 
          title="page-iframe"
          src="pages/welcome.html"
        >
        </iframe>
      </main>
    </div>
  );
};

export default App