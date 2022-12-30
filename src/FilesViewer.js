import { IconFolder, IconFile } from './Icons';

export const FilesViewer = ({contents, onOpen, highlightSelectedRow}) => (
  <table className="table">
    <tbody className="table-body">
      {
        contents.map(
          ({id, name, isDirectory, size}) => {
            let classes = "clickable " + (isDirectory ? "folder" : "file");
            return(
              <tr key={id} id={"content" + id} className={classes} 
                onClick={
                  () => {
                    onOpen(name, isDirectory);
                    if(!isDirectory){
                      highlightSelectedRow("content" + id);
                    };
                  }
                }
              >
                <td className="icon-row">
                  {isDirectory ? <IconFolder/> : <IconFile/>}
                </td>
                <td>
                  {name}
                </td>
                <td>
                  <span className="float-end">
                    {size}
                  </span>
                </td>
              </tr>
            );
          }
        )
      }
    </tbody>
  </table>
);