/**
 * File Name: terminal.js
 * Description: Contains all interactivity and functionality with 
 *      the terminal emulator. Will be attached to a div that 
 *      will be used to handle user input and output from the
 *      system. NOTE: Only emulates a limited number of commands
 *
 *  @author Analia Mok
 */

// Global command input text box
// Will be used repeatedly throughout activity
var commandInputHolder;

// String representing the current path
// used by pwd
var currentPath;

// Current Directory (File) object
var currentDir;

// Total Files that have been created by the user
// Should not exceed the max file limit
var totalFilesCreated = 0;


/* TERMINAL METHODS */


/**
 * parseCommand - Parses the input passed in by
 *      the text input of the terminal. Checks for
 *      the commands syntactical validity. Then
 *      redirects to the appropriate method 
 *      that handles actual UNIX command. When
 *      done, should create a new "line" in the
 *      terminal and and move cursor down.
 *
 * @param terminal Reference to the current terminal
 * @param cmdInput Reference to the command input text
 */
function parseCommand(terminal, cmdInput){
    
    // Inputted Command
    var cmd;
    var inputString = cmdInput.value;
    // Possible Option Flags
    var options = "";
    var firstSpaceIdx = inputString.indexOf(" ");
    
    // If first space was found, then
    // grab the first word and set that as 
    // command. Assign options with the
    // rest of the given input to grab flags
    if(firstSpaceIdx > -1){
        cmd = inputString.substring(0, firstSpaceIdx);
        options = inputString.substring(firstSpaceIdx+1, inputString.length);
    }else{
        // Otherwise, use whole inputString as the command
        cmd = inputString;
    }
    
    // See if command exists
    if(cmd != ""){
        createNewLine(terminal, cmdInput.value);   
    }
    
    switch(cmd){
        case "cat":
            // Output contents of file to the terminal
            cat(terminal, options);
            break;
        case "cd":
            // Change working directory
            cd(terminal, options);
            break;
        case "chmod":
            // Change Permissions
            chmod(terminal, options);
            break;
        case "clear":
            clear(terminal);
            break;
        case "cp":
            // Copy file
            cp(terminal, options);
            break;
        case "ls":
            // Passing the current terminal instance and
            // the rest of the flags
            ls(terminal, options);
            break;
        case "mkdir":
           // Create a new directory
            var result = mkdir(terminal, options);
            if (result == -1) {
                // If -1, then a MAX_FILES error occurred
                // Print approriate error message
                var errorMsg = "touch: You have exceeded the maximum"
                    + "amount of files that you can create with this terminal."
                    + totalFilesCreated;

                createNewLine(terminal, errorMsg);
            }
            break;
        case "touch":
            // Create a file - but first check to see if the user 
            // has reached the maximum
            if (totalFilesCreated >= MAX_FILES) {
                var errorMsg = "touch: You have exceeded the maximum"
                    + "amount of files that you can create with this terminal."
                    + totalFilesCreated;

                createNewLine(terminal, errorMsg);
            }else{
                var result = touch(terminal, options);
                if (result == 0) {
                    // If failed to create, print error message
                    var errorMsg = "touch: cannot touch \'"
                        + options
                        + "\': No such file or directory";
                    createNewLine(terminal, errorMsg);
                } else {
                    // Else, increment totalFilesCreated
                    totalFilesCreated++;
                }
            }
            break;
        case "mv":
            // Move given file
            mv(terminal, options);
            break;
        case "grep":
            // Search a file's contents using a simple pattern
            grep(terminal, options);
            break;
        case "pwd":
            // Print working directory
            
            createNewLine(terminal, currentPath);
            break;
        case "rm":
            // Remove Files
            var result = rm(terminal, options);
            break;        
        case "":
            // Print empty line
            createNewLine(terminal, cmdInput.value);
            break;
        case "ifconfig":
        case "ip":
        case "less":
        case "ping":
        case "vim":
        case "nano":
        case "pico":
        case "df":
        case "tar":
        case "traceroute":
        case "man":
            // Standard Commands that do not need to be
            // implemented for this terminal
            createNewLine(terminal, "Command not supported. Please use an actual Unix terminal");
            break;
        case "apt":
        case "dpkg":
        case "yum":
            // Package manager Commands Not Supported
            createNewLine(terminal, "Package manager commands are not supported. Please use an actual Unix terminal");
            break;
        default:
            // Print Error message
            
            // Create message first
            var errMsg = "\'" + cmd + "\'" +
                " command not found";
            
            // Then print previous line and then create the line with the error message
            
            createNewLine(terminal, errMsg);
            break;
    }
    
    // Re-focus on the next input line
    cmdInput.focus();
} // End of parseCommand


/**
 * parsePath - Takes a string path and finds the File instance
 *      it is pointing to. If the File DNE, returns null. 
 *      Otherwise, the File reference is returned.
 *      NOTE: DOES NOT AFFECT currentDir! Only makes
 *      a copy of the currentDir to work with.
 *
 * @param path String representing a file path
 * @return File instance if it exists, null otherwise
 */
function parsePath(path){
    
    if(path.length <= 2){
        // For single & 2-length path values such as '/', '~', '.'
        
        switch(path){
            case "..":
                // Move up a directory if possible
                if(currentDir.parentDir != null){
                    console.log("Moved Up A Directory!");
                    return currentDir.parentDir;
                }else{
                    // Otherwise, just return current directory
                    return currentDir;
                }
            case "/":
                // Return system root dir (home)
                return ROOT_DIR;
            case "":
            case "~/":
            case "~":
                // Return user's root dir (users/user)
                return USER_DIR;
            case "./":
            case '.':
                // Return back the current directory
                return currentDir;
            case "":
                // Otherwise, no file or directory given
                return null;
        }   
    }
    
    // Otherwise, parse path
    
    // Hopefully - copy of the current directory
    // Recall: Directories are File Objects
    var currFile = currentDir;
    var currFilePath = path;
    var slashIdx;
    var firstChar = true; 
    // Does the given path start with a slash
    var slashStart = path.indexOf("/") == 0;
    
    // while there's more of the path to parse and there exists
    // a slash
    while(path.length > 0 && (slashIdx = path.indexOf("/")) > -1){
        
        // Substring from the start of path and up to the next slash
        currFilePath = path.substring(0, slashIdx);
        if(slashIdx != path.length-1){
            // As long as pathIdx is not the last index
            // Re-assign path to the rest of the path after
            // the current slash
            path = path.substring(slashIdx+1, path.length);
        }else{
            // Otherwise, we reached end of path
            path = "";
        }
        
        if(currFilePath === ""){
            // Will only occur if leading char was a slash
            continue;
        }
        
        switch(currFilePath){
            case "home":
                if(slashStart){
                    /* 
                        Valid absolute pathing starts: 
                            /home
                            /home/
                        - Could just subscript into the
                        children arra for 0, but using
                        this method is safer
                    */
                    currFile = searchDirectory(ROOT_DIR, "home");
                    // turn off flag
                    slashStart = false;
                    break;
                }else{
                    return null;
                }
                
            case "..":
                // move up a directory
                if(currFile.parentDir != null){
                    // If not currently at the ROOT_DIR
                    currFile = currFile.parentDir;
                    console.log("Moved Up To: " + currFile.fileName);
                }
                // Otherwise, stay where we are
                break;
            case ".":
                if(!firstChar) return null;
                currFile = currentDir; // redundant
                break;
            case "~":
                // Set current file to the user root directory
                // "users/user"
                if(!firstChar) return null;
                currFile = USER_DIR;
                break;
            default:
                // Check if path is attempting to path into a file 
                // and not a directory
                if(path.length > 0 && currFile.isDirectory == false){
                    return null;
                }
                
                currFile = searchDirectory(currFile, currFilePath);
                if(currFile != null){
                    if(path.length > 0 && currFile.isDirectory == false){
                        // If there's more of the path to parse and
                        // currFile is NOT a directory, return null
                        return null;
                    }
                }
        }
        
        firstChar = false;
        
    } // End of while loop
    
    if(path.length > 0){
        // If no more slashes but still more left to the path
        
        if(slashStart && path === "home"){
            // For pathing just to /home
            return searchDirectory(ROOT_DIR, "home");
        }

        currFile = searchDirectory(currFile, path);
    }
    
    return currFile;
    
} // End of parsePath


/**
 * Precondition: directory is of type File
 *
 * searchDirectory - Looks through the children of the a given
 *      File instance and sees if fileName is one of those children.
 *
 * @param directory A File Object representing a directory
 * @param fileName A String representing a file name
 * @return A File with a name fileName; null otherwise
 */
function searchDirectory(directory, fileName){
    
    var dirChildren = directory.children;
    var totalChildren = dirChildren.length;
    var file = null;
    
    for(var i = 0; i < totalChildren; i++){
        // If file names match, then we have our target file
        if(dirChildren[i].fileName == fileName){
            file = dirChildren[i];
            break;
        }
    }
    
    return file;
} // End of search Directory


/**
 * createP - A Helper method to create the new paragraph
 *      elements that will be read-only in the terminal
 *
 * @param content A String that will be inserted as text inside
 *      the p tag
 * @return a p tag
 */
function createP(content){
    // Outer paragraph tag
    var newLine = document.createElement("p");
    
    // Creating inner span tag that holds the
    // beginning dollar sign
    var innerSpan = document.createElement("span");
    innerSpan.appendChild(document.createTextNode("$"));
    innerSpan.className = "dollar_sign";
    newLine.appendChild(innerSpan);
    
    // Adding tab character inside p tag
    newLine.appendChild(document.createTextNode(("    " + content)));
    
    return newLine;
} // End of createP


/**
 * createNewLine - Used to create a new nested <p>
 *      tag into the terminal. Accepts the innerHTML
 *      to be placed inside the p tags after the span
 *
 * @param terminal - Reference to the terminal object
 * @param content - String representing the value for
 *      the text node
 */
function createNewLine(terminal, content){
    
    // Outer paragraph tag
    var newLine = createP(content);
    
    //First remove the command input line
    var commandIn = document.getElementById("cmd_in_holder");
    
    //if(commandIn != null){
        // Only remove if present
        // Here to account for clear
        commandInputHolder = commandInputHolder.parentElement.removeChild(commandInputHolder);
    //}
    // Else, add the newly created line
    terminal.appendChild(newLine);

    // Append global commandInput
    commandInputHolder.children['cmd_in'].value = "";
    terminal.appendChild(commandInputHolder);
    
} // End of createNewline


/**
 * massConcat - Method used to concatenate all of the content
 *      specified in each file preceding the special char.
 *      Will either append the concatenated content to the 
 *      file following the specialChar or replace entirely.
 *
 *      ==================================================
 *      SPECIAL CHAR KEY:
 *      >> - Append
 *      >  - Re-write
 *      ==================================================
 *
 *      NOTE: Extra files specified after specialChar will
 *      be ignored - if they exist. If they DNE, print err
 *      but continue on.
 *
 *      NOTE: For long chains of specialChar, only look at first
 *      file and last file. Ignore in-between files.
 *
 * @param terminal - Reference to the terminal to print any error
 *      messages to
 * @param files - An Array of file objects
 * @param specialChar - A ">>" or ">"
 * @return 1 on success; 0 on failure
 */
function massConcat(terminal, files, specialChar) {

    // Index of specialChar in the files array
    var scIdx = files.indexOf(specialChar);

    // Operands of files array
    var leftOperands = files.slice(0, scIdx);
    var rightOperands = files.slice(scIdx + 1, files.length);

    // newly concatenate content
    var catContent = "";
    var totalLtOps = leftOperands.length;
    for(var i = 0; i < totalLtOps; i++){

        var currFile = parsePath(leftOperands[i]);
        if(currFile == null){
            // If file DNE, print err
            var errMsg = "cat: "
                + leftOperands[i] + ": No such file or directory";

            createNewLine(terminal, errMsg);
            continue;
        }

        // Otherwise, add content to catContent
        catContent = catContent + "\\n" + currFile.getContent();

    }

    // Iterate through right operands
    var totalRtOps = rightOperands.length;
    for(var i = 0; i < totalRtOps; i++){
        // Only affect content of first file
        var currPath = rightOperands[i]
        var currFile = parsePath(currPath);
        if(currFile == null){
            if(i == 0){
                // if first file & null, build new file

                // First find new file name & parent dir
                if(currPath.charAt(currPath.length - 1) == "/") {
                    // If last char is a slash, remove
                    currPath = currPath.substring(0, currPath.length - 1);
                }

                // Look for any slash(es)
                var lastIdx = currPath.lastIndexOf("/");

                var newName = "";
                var parent = {};

                if(lastIdx > -1) {
                    // If slash(es) present
                    newName = currPath.substring(lastIdx + 1, currPath.length);
                    var intermPath = currPath.substring(0, lastIdx);

                    // Look for parent object
                    parent = parsePath(intermPath);
                    if(parent == null){
                        // Print Error Message 
                        var errMsg = "cat: "
                            + currentPath + ": No such file or directory";
                        createNewLine(terminal, errMsg);
                        return 0;
                    }
                    // Otherwise, parent directory exists

                }else{
                    // If no slashes exist, parent directory is the 
                    // the global current directory
                    // and new name is the current path
                    parent = currentDir;
                    newName = currPath;
                }

                // Create new line and set content to be the
                // newly concatenated content
                var newFile = buildFile(newName, parent, false);
                newFile.setContent(catContent);

                // Add newFile to it's parent's list of children
                parent.addChild(newFile);

            }else{
                // If file DNE, print err
                var errMsg = "cat: "
                    + rightOperands[i] + ": No such file or directory";
                createNewLine(terminal, errMsg);
                continue;
            }
        }else{
            if(i == 0 && catContent != ""){
                // If first file, and content not empty
                
                switch(specialChar) {
                    case ">>":
                        // Append new content
                        currFile.setContent(
                            currFile.getContent() + "\\n" + catContent
                        );
                        break;
                    case ">":
                        // Overwrite content
                        currFile.setContent(catContent);
                        break;
                    default:
                        // Should never be reached, but just in case
                        var errMsg = "cat: "
                            + specialChar + ": No such file or directory";
                        createNewLine(terminal, errMsg);
                        break;
                }

            }
        }

    } // End of right operand loop



    return 1;

} // End of massConcat


/**
 * cat - Outputs the content of the file targeted
 *      by the given path (if exists)
 * @param terminal - Reference to the terminal object
 * @param args - Path(s) to a file
 * @return 1 on success; 0 on failure
 */
function cat(terminal, args){

    // Split path. Should only be 
    var files = args.split(" ");

    if(files.length == 1 && files[0] == ""){
        // If no arguments
        // TODO: Echo content
        var errMsg = "cat: Missing operand (Psst. I'm supposed to be "
            + "echoing what you type, but I'm too tired to implement that now)";
        createNewLine(terminal, errMsg);
        return 0;
    }

    if(files.length >= 3) {
        // If 3 or more arguments given, checked to see if user type in a ">>"
        // NOTE: Long chains of >> will only result in the contents of the 
        // very first file to be concatenated into the very last file
        // TODO
        // If two files are specified after ">>" or ">" ignore if exists,
        // If it doesn't exist, print file not found error

        // Check if first argument contains either ">>" or ">" 
        var specialCharIdx = -1;
        if((specialCharIdx = files.indexOf(">>")) > -1
            || (specialCharIdx = files.indexOf(">")) > -1) {
            
            return massConcat(terminal, files, files[specialCharIdx]);

        }

        // if contains a pipe, print error saying that it's not 
        // supported with this terminal
        if((specialCharIdx = files.indexOf("|")) > -1) {
            var errMsg = "cat: Special character not supported in this terminal...yet";
            createNewLine(terminal, errMsg);
            return 0;
        }

        // Otherwise, continue on your merry way

    }

    // err message for cat-ing into same file
    //var errMsg = "cat: [concat file name]" + ": input file is output file";

    // First remove and store command input before looping
    commandInputHolder =
        commandInputHolder.parentElement.removeChild(commandInputHolder);

    var totalFiles = files.length;

    for(var i = 0; i < totalFiles; i++){
        
        var currFile = parsePath(files[i]);
        if(currFile == null) {
            // If file does not exist, print error and continue on
            var errMsg = "cat: "
                + files[i] + " No such file or directory";

            var errLine = createP(errMsg);
            terminal.appendChild(errLine);

            continue;
        }

        // Otherwise, print out contents
        // Split on newline chars
        var contentLines = currFile.getContent().split("\\n");
        var totalLines = contentLines.length;
        for(var j = 0; j < totalLines; j++) {

            // Create a new paragraph line
            var newline = document.createElement("p");
            newline.appendChild(document.createTextNode(contentLines[j]));

            // Add p element to the terminal
            terminal.appendChild(newline);

        } // End of line iteration

    } // End of files looping

    // Re-append commandInputHolder to the terminal
    commandInputHolder.children['cmd_in'].value = "";
    terminal.appendChild(commandInputHolder);

    return 1;
} // End of cat


/**
 * cp - Implementation of Unix file copying. Given
 *      2 arguments, command will attempt to make a
 *      copy of the source file - as long as it is not
 *      a directory.
 *
 * @param terminal - Reference to the terminal object
 *      to print to
 * @param args - Set of arguments passed to the command line
 * @return 1 on success; 0 on failure
 */
function cp(terminal, args){
    
    // First, split arguments into an array
    var args = args.split(" ");
    var errMsg = "";

    if(args.length == 1) {
        
        if(args[0] == "") {
            // No arguments given
            errMsg = "cp: missing file operand";
            createNewLine(terminal, errMsg);
            
        }else{
            // Insufficient Arguments
            errMsg = "cp: missing destination file operand after \'"
                + args[0] + "\'";
            createNewLine(terminal, errMsg);
        }

        return 0;
    }

    // If correct number of arguments given
    var srcFile = parsePath(args[0]);

    if(srcFile == null) {
        // If file does not exist
        errMsg = "cp: cannot stat \'" + args[0]
            + "\': No such file or directory";
        createNewLine(terminal, errMsg);
        return 0;
    }

    if(srcFile.isDirectory == true) {
        // If attempting to copy a directory
        errMsg = "cp: omitting directory \'" + args[0] + "\'";
        createNewLine(terminal, errMsg);
        return 0;
    }

    // Check to see that destination file DNE
    // && is not the same as the current file
    var dest = parsePath(args[1]);
    if(dest != null) {

        // Are source and dest the same file?
        if(dest == srcFile) {
            errMsg = "cp: \'" + args[0]
                + "\' and \'" + args[1] + "\' are the same file";
            createNewLine(terminal, errMsg);
            return 0;
        }

        if(dest.isDirectory == true) {
            // If destination is a directory, copy source file obj
            // and add new obj to destFile's children
            var dupFile = new file(srcFile.fileName, false, srcFile.fileSize);
            dupFile.setPermissions(srcFile.permissionValue)
                .setOwnership(srcFile.owner, srcFile.group)
                .setPath(srcFile.path)
                .setLastModified(srcFile.lastModified)
                .setParentDir(dest)
                .setContent(srcFile.getContent());
            dest.addChild(dupFile);

            return 1;
        }

        // Otherwise, remove destination from its parent
        // Will be completely overwritten by source
        // but source will inherit dest's name
        var newParent = dest.parentDir;
        
        srcFile.fileName = dest.fileName;
        var destParentChildren = dest.parentDir.children;

        // Removing from parent
        destParentChildren.splice(destParentChildren.indexOf(dest), 1);
        srcFile.parentDir.children.splice(srcFile.parentDir.children.indexOf(srcFile), 1);
        
        // Set source's new parent directory
        srcFile.setParentDir(newParent);

        // Add source to it's parent
        dest.parentDir.addChild(srcFile);
        return 1;

    }else{
        // Otherwise, create a new file with the exact
        // same fields as src but with the new name
        var destPath = args[1];

        if(destPath.charAt(destPath.length - 1) == "/") {
            // If last char is a slash, then user tried to
            // to copy into a directory that does not exist
            errMsg = "cp: cannot create regular file \'" + destPath
                + "\': ";

            if(destPath.indexOf("/") != destPath.lastIndexOf("/")) {
                // If more than 1 slash appears, then a longer
                // path was given
                errMsg += "No such file or directory";
            }else{
                errMsg += "Not a directory";
            }

            createNewLine(terminal, errMsg);
            return 0;

        }

        // Otherwise, parse rest of path for a new name
        // and a destination directory

        // But first parse destination for a directory
        var lastIdx = destPath.lastIndexOf("/");
        var newName = "";

        if(lastIdx > -1){
            // If slash(es) present
            newName = destPath.substring(lastIdx + 1, destPath.length);
            destPath = destPath.substring(0, lastIdx);

            // Parse path again to check
            dest = parsePath(destPath);

        }else{
            // If long path not given, just set dest to
            // global current directory, and set newName
            // variable
            newName = destPath;
            dest = currentDir;
        }

        if(dest == null){
            // Destination directory DNE
            errMsg = "cp: cannot create regular file \'" + destPath
                + "\': No such file or directory";
            createNewLine(terminal, errMsg);
            return 0;
        }

        // All good now, so create new file
        var dupFile = new file(newName, false, srcFile.fileSize);
        dupFile.setPermissions(srcFile.permissionValue)
            .setOwnership(srcFile.owner, srcFile.group)
            .setPath(srcFile.path)
            .setLastModified(srcFile.lastModified)
            .setParentDir(dest)
            .setContent(srcFile.getContent());

        dest.addChild(dupFile);

        return 1;
    }

} // End of cp


/**
 * cd - Changes the current working directory
 *      based on the given path. DOES affect the 
 *      current directory path & the currentDir
 * @param terminal - Reference to the terminal object
 * @param path - Path to a file
 */
function cd(terminal, path){
    
    // Parse path to given file first
    var file = parsePath(path);
    if(file == null){
        // File DNE
        createNewLine(terminal, 
            "The system cannot find the file specified.");
    }else{
        // Change Current Directory
        currentDir = file;
        currentPath = file.path;
    }
    
} // End of cd


/**
 * clear - Removes all paragraph elements in terminal
 * 
 * @param terminal Reference to the terminal
 */
function clear(terminal){
    // p tags containing previous lines
    var lines = terminal.getElementsByTagName("p");
    
    // Removes 
    var totalLines = lines.length;
    var currIdx = 0;
    for(var i = totalLines-1; i >= 0; i--){
        lines[i].parentElement.removeChild(lines[i]);
    }
    
    // Append a new command input line
    commandInputHolder.children['cmd_in'].value = "";
    terminal.appendChild(commandInputHolder);
    
} // End of clear


/**
 * chmod - Emulates the change of permissions command
 *      Will validate the new set permissions and the file
 *      name given. If valid, the File object's permissions
 *      will be altered. Otherwise, an error message will be
 *      outputted to the terminal
 *
 * @param terminal A reference to the terminal being used
 * @param args Remaining arguments given by the user
 *      Includes new permissions
 *      Includes path to the file
 */
function chmod(terminal, args){
    
    var arguments = args.split(" ");
    
    if(arguments.length < 2){
        
        // Insufficient Operands
        if(arguments[0] == ""){
            // No Operands given at all
            createNewLine(terminal, "chmod: missing operand");    
        }else{
            // Insufficient Number of Arguments
            createNewLine(terminal, 
                "chmod: missing operand after \'" + arguments[0] + "\'"
            );
        }
        
    }else{
        // Now Check Validity of Arguments
        
        // Argument 0
        if(isNaN(arguments[0])){
            // If arguments 0 is not a number, print error
            createNewLine(terminal, 
                "chmod: invalid mode \'" + arguments[0] + "\'"
            );
            
        }else if(arguments[0].length < 3){
            // If a 3 digit value was not given 
            // First see if an argument of 0 was given
            if(arguments[0] === "0"){
                // TODO: Set permissions 111
            }else{
                // Invalid mode otherwise
                createNewLine(terminal, 
                "chmod: invalid mode \'" + arguments[0] + "\'"
                );
            }
        }else{
            // Checking range of new permissions
            var newPermissions = parseInt(arguments[0]);
            
            if(newPermissions > 755 || newPermissions < 0){
                // Invalid mode
                createNewLine(terminal, 
                "chmod: invalid mode \'" + newPermissions + "\'"
                );
            }else{
                // Permissions all good. Now check file
                var file = parsePath(arguments[1]);
                if(file == null){
                    // If DNE
                    createNewLine(terminal, "chmod: cannot access \'" + arguments[1] + "\': No such file or directory");
                }else{
                    // Otherwise, set new permissions for
                    // the selected file
                    file.setPermissions(arguments[0]);
                }
            } // End of permissions check
        } // End of arguments check
    } // End of outermost if
    
} // End of chmod


/**
 * grep - A much much simpler implementation of grep
 *      Only accepts a single pattern and a file name
 *      If any options or regex expressions given, 
 *      output a usage statement that terminal does not
 *      support a powerful grep
 *
 * @param terminal Reference to the terminal to output 
 *      "print" statements to
 * @param args pattern and file
 * @return 1 on success; 0 on failure
 */
function grep(terminal, args){

    // Split args, check if there is at least one argument
    // that's NOT empty
    var args = args.split(" ");

    if(args.length < 2) {
        var usgMsg = "";
        if(args[0] === "") {
            // if no arguments given
            usgMsg = "Usage: grep [OPTION]... PATTERN [FILE]...";
        } else {
            // If one arg given, but is most likely just a pattern
            usgMsg = "grep: Current terminal does not support 1 argument grep";
        }

        // Print Usage message and exist
        createNewLine(terminal, usgMsg);
        
        return 0;
    }

    // Search through remaining files given

    // First remove and store command input before looping
    commandInputHolder =
        commandInputHolder.parentElement.removeChild(commandInputHolder);

    var totalArgs = args.length;
    for(var i = 1; i < totalArgs; i++){

        // Check if current file exists
        var currFile = parsePath(args[i]);
        if(currFile == null){
            var errMsg = "grep: " + args[1] + ": No such file or directory";
            createNewLine(terminal, errMsg);
            continue;
        }

        // Split on newline chars
        var currFileContents = currFile.getContent().split("\\n");
        var totalLines = currFileContents.length;
        for(var j = 0; j < totalLines; j++){
            var currLine = currFileContents[j];
            if(currLine.search(args[0]) > -1) {
                // If pattern is found somewhere inside currLine
                // print to terminal
                // Create a new paragraph line
                var newline = document.createElement("p");
                newline.appendChild(document.createTextNode(currLine));

                // Add p element to the terminal
                terminal.appendChild(newline);
            }
            // Otherwise, do nothing and continue on
        } // End of inner loop
    } // End of outer loop

    // Re-append commandInputHolder to the terminal
    commandInputHolder.children['cmd_in'].value = "";
    terminal.appendChild(commandInputHolder);
    
    return 1;
} // End of grep

/**
 * ls - listing of the contents of the current directory
 *      Based on optional flags, the format of the listing
 *      will differ
 *
 * @terminal Reference to the currently running terminal
 * @options [Optional] String of flags given by the user
 *      If no flags given or incorrect flags given, will
 *      default to regular listing format. A mixture of 
 *      valid and invalid flags will default to the
 *      formatting of the valid flags.
 */
function ls(terminal, options){
    
    // Array of file objects 
    var contents = currentDir.children;
    
    // Filter Contents
    if(options.length != 0){
        // If options were given
        
        // First check to see if a dash was given
        if(options.indexOf("-") == -1){
            var errMsg = "ls: cannot access " 
                + options 
                + ": No such file or directory";
            createNewLine(terminal, errMsg);
        }else{
            // Otherwise, filter contents based
            // on flags
            if(options.indexOf("a") == -1){
                // If "a" is not a given flag
                // Remove files starting with a dot
                contents = contents.filter(function(file){
                    // Only keep files that do not start
                    // with a period in its name
                    return (file.fileName.charAt(0) != '.');
                });
            }
            
            // Now print in either long listing or 
            // listing format
            if(options.indexOf("l") > -1){
                // If -l was given, print long listing
                // format
                
                // First remove and store command input
                commandInputHolder = commandInputHolder.parentElement.removeChild(commandInputHolder);
                
                // Now Format Contents 
                
                var totalContents = contents.length;
                for(var i = 0; i < totalContents; i++){

                    // Newline without content
                    var newline = createP("");
                    
                    // Span holding a file's long list format
                    // not including file name
                    var fileSpan = document.createElement("span");
                    //newline.innerHTML = contents[i].getLongListFormat();

                    var innerText = document.createTextNode(contents[i].getLongListFormat());
                    
                    if(contents[i].isDirectory){
                        // If file is a directory, place name in a
                        // span with dirs style class
                        var fileSpan = document.createElement("span");
                        fileSpan.innerHTML = contents[i].fileName;
                        
                        if(options.indexOf("-F") > -1){
                            // Add slash character if the -F option is set
                            fileSpan.innerHTML = fileSpan.innerHTML + "/";
                        }
                        
                        fileSpan.className = "dirs dirsName";
                        
                        // Add textnode & fileSpan to p element
                        newline.appendChild(innerText);
                        newline.appendChild(fileSpan);
                    }else{
                        // Otherwise add file name along with inner text
                        innerText = innerText.nodeValue + " " + contents[i].fileName;
                        
                        newline.appendChild(document.createTextNode(innerText));
                    }
                    
                    // Add p element to the terminal
                    terminal.appendChild(newline);

                }

                // Re-append commandInputHolder to the terminal
                commandInputHolder.children['cmd_in'].value = "";
                terminal.appendChild(commandInputHolder);
            }else{
                // Otherwise, do regular listing format
                regularListing(terminal, contents, (options.indexOf("-F") > -1));
            }
        
        }
    }else{
        // Otherwise, just do regular listing
        
        // Remove dot files first
        contents = contents.filter(function(file){
            // Only keep files that do not start
            // with a period in its name
            return (file.fileName.charAt(0) != '.');
        });
        
        regularListing(terminal, contents, (options.indexOf("-F") > -1));
    }
    
} // End of ls


/**
 * regularListing - "Prints" the contents of a
 *      directory is normal listing format
 *
 * @param terminal - Reference to terminal
 * @param contents  Collection of file objects to print
 * @param flag - A Boolean flag determining to whether
 *      or not add an extra symbol to the file name
 */
function regularListing(terminal, contents, flag){
    // First remove and store command input
    commandInputHolder = commandInputHolder.parentElement.removeChild(commandInputHolder);
    
    // Now Format Contents 
    // Newline without content
    var newline = createP("");
    var totalContents = contents.length;
    for(var i = 0; i < totalContents; i++){
        
        // Span holding file name
        var fileSpan = document.createElement("span");
        fileSpan.innerHTML = contents[i].fileName;
        
        if(contents[i].isDirectory){
            fileSpan.className = "dirs";
            
            if(flag){
                // if flag set, add slash character denoting a directory
                fileSpan.innerHTML = fileSpan.innerHTML + "/";
            }
            
        }
        
        // Add span to p element
        newline.appendChild(fileSpan);
    }
    
    // Add p element to the terminal
    terminal.appendChild(newline);
    
    // Re-append commandInputHolder to the terminal
    commandInputHolder.children['cmd_in'].value = "";
    terminal.appendChild(commandInputHolder);
    
} // End of regularListing


/**
 * Pre-condition: All arguments are valid.
 *
 * buildFile - Helper method to create a new file object
 *      using the given file name and valid parent directory.
 *      Sets the lastModified date to current date of the 
 *      system.
 *
 * NOTE: This method WILL NOT add the new file to the parent's
 *      list of children
 *
 * @param fileName - A String name of the file
 * @param parentDir - A file object representing the parent
 * @param isDirectory - Boolean saying whether or not this
 *      file is a directory or not.
 * @return file object
 */
function buildFile(fileName, parentDir, isDirectory){
    
    // If file doesn't already exist, create one
    var newFile = new file(fileName, isDirectory, 0);
    newFile.setOwnership("user", "group")
        .setPath(parentDir.path + fileName + "/")
        .setParentDir(parentDir);
    
    // If directory, set permissions to 755, otherwise, 644
    newFile.setPermissions( (isDirectory) ? "755" : "644" );
    
    // Setting Last Modified to today's date
    var today = new Date();
    var todayString = today.toDateString();
    // remove the day of the week
    todayString = todayString.substring(
        todayString.indexOf(" ") + 1, 
        todayString.length
    );
    
    // Removing the year
    todayString = todayString.substring(
        0, todayString.lastIndexOf(" ")
    );
    
    var time = today.toTimeString();
    // Removing the time zone information
    time = time.substring(0, time.indexOf(" "));
    
    // Removing the seconds
    time = time.substring(0, time.lastIndexOf(":"));
    
    newFile.setLastModified(todayString + " " + time);
    
    return newFile;
} // End of buildFile


/**
 * buildMultipleFiles - Method for recursively creating a 
 *		new File (directory) structure based on a given
 *		path. Uses the buildFile method to create individual
 *		files, but will make parent-child connections here.
 *
 * @param path: A String path to a directory(ies) to create
 * @param parentDir: A file object representing the parent
 *		directory of the current path
 * @return A new file object with established dependencies; 
 *      otherwise, return null if we reached MAX_FILES
 */
function buildMultipleFiles(path, parentDir) {

    if (totalFilesCreated >= MAX_FILES) {
        // If we have reached the maximum files that can
        // be created, just end process and return null
        return null;
    }else if (path == "") {
        // If there's no more of the path to parse
        return parentDir;
    }else{
        // First/leftmost directory name
        var slashIdx = path.indexOf("/");
        var parent = "";

        if (slashIdx > -1) {
            // if slash exists, substring parent & path
            parent = path.substring(0, slashIdx);
            path = path.substring(slashIdx + 1, path.length);
        } else {
            // Otherwise, we're at the end of path
            parent = path;
            path = "";
        }

        // Attempt to find parent file first
        var parentFile = parsePath(parent);
        if(parentFile == null){
            // If parent doesn't exist, create file

            // If parentDir DNE, use the current directory
            if (parentDir == null) parentDir = currentDir;

            parentFile = buildFile(parent, parentDir, true);

            // Increment total files created
            totalFilesCreated++;

            // Add new file object as a child to current parentDir
            parentDir.addChild(parentFile);

            return buildMultipleFiles(path, parentFile);

        }else{
            // Otherwise, look for next file object to create
            return buildMultipleFiles(path, parentFile);
        }

    }

} // End of buildMultipleFiles


/**
 * mkdir - Given a terminal reference, and command arguments,
 *      this method will create a new File object that is a
 *      directory. Will update the children list of the current 
 *      directory as
 *
 *      NOTE: More than one file may be created
 *      if a -p option is given.
 *      REMEMBER: Files do not need a file extension to be created.
 *
 * @return 1 on success, 0 argument failure, -1 for MAX_FILES error
 */
function mkdir(terminal, options){
    // Split options to try and find flags and/or a path
    var args = options.split(" ");
    // Flag saying whether or not parent directories should be
    // created for a new directory
    var canCreateMultiple = false;
    var flag = "";
    
    if(args.length >= 1 && args[0] != ""){
        // if there are more than one arguments and the first argument
        // is not an empty string, check to see if 
        // the first argument is an option
        if(args[0].indexOf("-") == 0){
            // if dash is present, then validate the given flag
            flag = args[0];
            
            // Checking Option Validity
            switch(flag){
                case "-p":
                    // Valid - the only supported option - turns on
                    // flag
                    canCreateMultiple = true;
                    args = args.splice(1, args.length);
                    break;
                case "-t":
                case "-m":
                case "-v":
                    // Valid but not supported flags
                    var msg = "mkdir: option \'" + flag.substring(1, flag.length) + "\' is not supported.";
                    createNewLine(terminal, msg);
                    return 1;
                default:
                    // Print invalid option message - Printing without the preceding dash
                    var msg = "mkdir: invalid option -- \'" + flag.substring(1, flag.length) + "\'";
                    createNewLine(terminal, msg);
                    return 0;
            }
            
            // Checking Validity of the number of arguments
            // Should be one or greater now that a valid option
            // results in a splice of the arguments
            if(args.length < 1){
                // If too few arguments, print error and exit
                var msg = "mkdir: missing operand";
                createNewLine(terminal, msg);
                return 0;
            }
            
        }
		
		// Everything is all good now
		// Try to Create directory (or directories)

		for(var i = 0, length = args.length; i < length; i++){
			// Current Directory Path to the new directory to create
			var currDirPath = args[i];
			var currDirPathLength = currDirPath.length;

			// If last character is a slash, remove before continuing
			if(currDirPath.charAt(currDirPathLength-1) == "/"){
				currDirPath = currDirPath.substring(0, currDirPathLength-1);
			}

			// New Directory to Create
			var newDir = "";
			var parentDir = {};
			if(currDirPath.indexOf("/") > -1){
				// If a Slash Exists, substring currDirPath and 
				newDir = 
					currDirPath.substring(currDirPath.lastIndexOf("/")+1, currDirPathLength);

				// Remove New Directory Name - REMEMBER TO RE-CONCAT IF PASS 2 IS REACHED
				currDirPath = currDirPath.substring(0, currDirPath.lastIndexOf("/"));
				parentDir = parsePath(currDirPath);
			}else{
				// If just a new directory name was passed, the parent directory
				// will the current directory & the newDir name will just be 
				// the path given
				parentDir = currentDir;
				newDir = currDirPath;
			}

			if(parentDir == null){
				if(!canCreateMultiple){
					// Print Error Message if path not found and -p not ON
					var errMsg = "mkdir: cannot create directory \'" 
						+ currDirPath + "/" + newDir + "\': No such file or directory";
					createNewLine(terminal, errMsg);
					break;	
				}else{
					// PASS 2: Build Directory recursively
					// Re-Concat path, slash, and new dir name
				    var result = buildMultipleFiles(currDirPath + "/" + newDir, parentDir);
				    if (result == null) {
				        return -1;
				    }
					continue;
				}
			}
			// Otherwise, add directory to parentDir
			var newFile = buildFile(newDir, parentDir, true);
			parentDir.addChild(newFile);

		}
        
    }else{
        // Missing an operand
        var msg = "mkdir: missing operand";
        createNewLine(terminal, msg);
        return 0;
    }

} // End of mkdir


/**
 * touch - Used to created simple file(s) given a 
 *      string of arguments. Will adjust the children list
 *      of the current directory. Default file permissions
 *      will be 644.
 *
 * @param terminal reference to the terminal "object"
 * @param paths Paths to all files to create
 * @return 1 on success; 0 otherwise
 */
function touch(terminal, paths){

    // Split Paths into an array
    var pathsList = paths.split(" ");
    if (pathsList.length == 1 && pathsList[0] == "") {
        // FAIL - No arguments given
        return 0;
    }
    
    var totalPaths = pathsList.length;
    for (var i = 0; i < totalPaths; i++) {

        var currPath = pathsList[i];

        // Keeping a copy of the original path
        // for error messaging
        var originalPath = pathsList[i];
        
        var lastSlash = originalPath.lastIndexOf("/");
        var fileName = "";

        // Check to see if lastSlash is the last char first
        if (lastSlash == currPath.length - 1) {
            // if it is, remove last char
            currPath = currPath.substring(0, lastSlash);
            // find the new last slash
            lastSlash = currPath.lastIndexOf("/");
        }

        if (lastSlash != -1) {
            // Grab the file name at the end
            fileName = currPath.substring(lastSlash + 1, currPath.length);
            // Substring current path up to the last slash
            currPath = currPath.substring(0, lastSlash);
        } else {
            fileName = currPath;
        }

        // Parent Directory of the current file
        var parentDir = {};

        if (currPath != fileName) {
            // If path is not just a file name,
            // parse path
            parentDir = parsePath(currPath);

            if (parentDir == null) {
                // If no directory found, return
                // 0 as error code
                return 0;
            }

        } else {

            // Otherwise, the parent directory will be
            // the current directory
            parentDir = currentDir;
        }

        // Check if the name of the file already exists in
        // the parentDir
        var parentDirChildren = parentDir.children;
        var totalChildrens = parentDirChildren.length;

        for (var j = 0; j < totalChildrens; j++) {
            if (parentDirChildren[j].fileName === fileName) {
                // If file exists already, do nothing
                // and leave
                break;
            }
        }

        // If file doesn't already exist, create one
        var newFile = buildFile(fileName, parentDir, false);

        // Append newFile to the parentDir
        parentDir.addChild(newFile);

    } // End of for loop

    return 1;

} // End of touch


/**
 * mv - Method that implements the move Unix command.
 *      Expects exactly 2 arguments - both of which are
 *      paths to some file. If the files are in the same 
 *      parent directory, replace the first arg file with
 *      the second (renaming).
 *
 * @param terminal Reference to the terminal "object"
 * @param args A String that can be split into at least 2 elements
 *      with each element representing a file path
 * @return 1 on success; 0 on failure
 */
function mv(terminal, args) {

    // Check if correct number of arguments given
    var files = args.split(" ");
    var errMsg = "";
    // Holder for if the user wants to rename a file
    var newName = "";

    if(files.length < 2) {
        // Insufficient Arguments
        
        if(files[0] == "") {
            // No operands given
            errMsg = "mv: missing file operand";
        }else{
            // Only one operand given
            errMsg = "mv: missing destination file operand after "
                + "\'" + files[0] + "\'";
        }

        createNewLine(terminal, errMsg);
        return 0;
    }

    //console.log("test/test2.txt".indexOf("test2.txt"));

    // Check if 1st path exists
    var srcFile = parsePath(files[0]);
    if(srcFile == null){
        errMsg = "mv: cannot stat \'"
            + files[0] + "\': No such file or directory";
        createNewLine(terminal, errMsg);
        return 0;
    }

    // Check if 2nd path exists
    var dest = parsePath(files[1]);
    var destPath = files[1];

    if(dest == null){
        // First check to see if the dest path ends with
        // the src file's name

        // Index of where the src file's name should appear
        // in the destination path - if given
        var lastIdx = files[1].length - srcFile.fileName.length;

        var idxOfSrc = files[1].indexOf(srcFile.fileName);

        if(idxOfSrc > -1 && idxOfSrc == lastIdx) {
            // If FULL file name is the last subpath, remove
            // from dest path and check again
            var destPath = files[1].substring(0, idxOfSrc);
            dest = parsePath(destPath);

            if(dest == null){
                // If still DNE, print err
                errMsg = "mv: cannot stat \'"
                    + files[1] + "\': No such file or directory";
                createNewLine(terminal, errMsg);
                return 0;
            }
            // Otherwise, dest is good

        }else if(idxOfSrc > -1 && srcFile.isDirectory == false){
            // If for some reason the file name is elsewhere
            // and is not a dir, print error message
            errMsg = "mv: accessing \'" + files[1] + "\'"
                + ": Not a directory";

            createNewLine(terminal, errMsg);
            return 0;
        }

        // Parse up to the last (or second to last) slash
        // to see if a path to a new directory was given
        // and a new file name was just given
        //var destPath = files[1];
        if(destPath.charAt(destPath.length-1) == "/"){
            // If last char is a slash, remove
            destPath = destPath.substring(0, destPath.length - 1);
        }

        var lastIdx = destPath.lastIndexOf("/");
        
        if(lastIdx > -1) {
            // If slash(es) present
            newName = destPath.substring(lastIdx+1, destPath.length);
            destPath = destPath.substring(0, lastIdx);

            // Parse path again to check
            dest = parsePath(destPath);

        }else{
            // If long path not given, just set dest to
            // global current directory, and set newName
            // variable
            newName = destPath;
            dest = currentDir;
        }

        if(dest == null){
            // If fails again, print error
            errMsg = "mv: cannot stat \'"
                    + files[1] + "\': No such file or directory";
            createNewLine(terminal, errMsg);
            return 0;
        }
        // Otherwise good
    }else if(dest.fileName == srcFile.fileName){
        // First check to see if dest and src are the same file
        errMsg = "mv: \'" + files[0] + "\' and \'"
            + files[1] + "\' are the same file";
        createNewLine(terminal, errMsg);
        return 0;
    }

    // If newName was set, then check src.parentDir & dest
    // If same:
    // Rename arg1 if yes
    if(newName != ""){
        // If set

        if(srcFile.parentDir == dest){
            // src file's parent dir is same as dest
            // Rename
            srcFile.fileName = newName;
            // Re-sort the source file's parent directory
            // to account for new file name
            srcFile.parentDir.reSortChildren();
            return 1;
        }
        // Otherwise, do nothing & continue
    }

    // Otherwise, move file

    // Index of src file inside its parent directory
    var srcIdx = srcFile.parentDir.children.indexOf(srcFile);
    // remove from current parent
    //srcFile.parentDir.children =
        srcFile.parentDir.children.splice(srcIdx, 1);

    // Add srcFile to its new parent
    dest.addChild(srcFile);
    // And set srcFile's new parentDir reference
    srcFile.setParentDir(dest);

    return 1;
} // End of mv


/**
 * delFile - Helper method for "destroying" a file
 *      and removing it from its parentDir
 *
 * @param file A file object to delete
 * @return 1 on success, 0 on failure
 */
function delFile(file) {

    // First make sure that file is not one of the system
    // directories - hardcoded but fine since list is short
    switch(file.fileName) {
        case ROOT_DIR.fileName:
        case USER_DIR.fileName:
        case "/":
        case "home":
        case "users":
        case "user":
        case "bin":
        case "usr":
        case "etc":
        case "lib":
            return 0;
    }

    // If pass, delete
    var parentDir = file.parentDir;
    if(parent != null) {
        var childIdx = parentDir.children.indexOf(file);
        // remove child
        parentDir.children.splice(childIdx, 1);
        return 1;
    }

    // Should never be reached
    return 0;
} // End of delFile


/**
 * rm - Method that implements the remove Unix command.
 *      Can destroy file objects and remove all references
 *      to the file object - mainly from its parent dir.
 *      Will only delete directories if the correct
 *      flags are specified.
 *
 * @param terminal Reference to the terminal "object"
 * @param args A String containing the arguments of the
 *      rm command.
 *      Format: [flag] files...
 * @return 1 on success; 0 on failure
 */
function rm(terminal, args){

    // First, Split Arguments into an array
    var argsArray = args.split(" ");

    if (args.length <= 1 && argsArray[0] == "") {
        // Print error for insuffient arguments
        var errMsg = "rm: missing operand";
        createNewLine(terminal, errMsg);
        return 0;
    }

    // Option flag
    var flag = "";

    // Check if a flag was given
    if (argsArray[0].indexOf("-") == 0) {
        // if a dash is found as the first element
        // set flag
        flag = argsArray[0];

        // Check if flag is valid

        switch(flag) {
            case "-r":
                // Just leave switch for these valid options
                break;
            /*case "-rf":
            case "-fr": 
                // The tutorial & the reference says to never do this
                var funnyMsg = "rm: Didn't we just tell you to NEVER do this?";
                createNewLine(terminal, funnyMsg);
                return 0;*/
            case "-i":
            case "-I":
            case "-f":
            case "--force":
            case "-v":
                // Options that are valid in Unix
                // but are not going to be implemented
                var errMsg = "rm: option "
                + flag.substring(1, flag.length)
                + " is not supported in this terminal";

                createNewLine(terminal, errMsg);
                return 0;
            default:
                // if not valid, print error and exit
                var errMsg = "rm: invalid option -- "
                    + flag.substring(1, flag.length);

                createNewLine(terminal, errMsg);
                return 0;
        }

        // If valid, remove flag from argsArray
        argsArray = argsArray.slice(1, argsArray.length);

    }

    // Make sure arguments array has at least 1 element
    if(argsArray.length < 1) {
        // if not, print error message
        var errMsg = "rm: missing operand";
        createNewLine(terminal, errMsg);
        return 0;
    }

    // Now iterate through remaining arguments to
    // delete 
    // NOTE: If a delete cannot be executed, do not escape loop
    // Just print error message and continue through loop
    for(var i = 0, length = argsArray.length; i < length; i++) {

        var currPath = argsArray[i];

        // Grab the file name
        var currFileName = "";
        var slashIdx = currPath.lastIndexOf("/");

        if(slashIdx == currPath.length-1){
            // If slash is the last char in path, remove
            // Using an intermediate var to not affect original
            var interm = currPath.substring(0, slashIdx);
            // Find next occurrence of slash
            slashIdx = interm.lastIndexOf("/");
        }

        if(slashIdx > -1){
            // Now grab the file name
            currFileName = currPath
                .substring(slashIdx + 1, currPath.length);
        }else{
            // Otherwise, currPath is the file name
            currFileName = currPath;
        }

        // Parse Path to find file
        var file = parsePath(currPath);
        if(file != null){
            // If exists

            // First check to see if it is a directory
            if(file.isDirectory) {

                // Is -r flag set?
                if(flag == "-r") {
                    // if yes, delete file and all of
                    // its children along with it
                    delFile(file);
                    continue;
                }else{
                    // Otherwise trying to remove a populated dir
                    // If no flags
                    // Print error message
                    var errMsg = "rm: cannot remove \'"
                        + file.fileName + "\': Is a directory";

                    createNewLine(terminal, errMsg);
                }

            }else{
                // Otherwise, try to delete normal file
                delFile(file);
            }
        }else{
            // Else, Can't remove bc DNE -> error message
            var errMsg = "rm: cannot remove \'"
                + currFileName
                + "\': No such file or directory";
            createNewLine(terminal, errMsg);
        }

    } // End of for loop

    return 1;
} // End of rm
