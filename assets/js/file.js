/**
 * File Name: file.js
 * Description: This file defines a javascript object
 *      that will help represent a "File" which includes
 *      both a file of any extension & directories. This
 *      is not actually an openable File nor is this how
 *      the file system of OS actually work. This is only
 *      make it easier to implement file traversal and
 *      basic text output.
 *      ** Will Be Used in terminal.js
 *
 * @author: Analia Mok
 */


/**
 * file - Constructor Method for creating a FILE object
 *      NOTE: Directories are files but will have
 *      a file of zero and a boolean flag saying that the
 *      file is a directory
 *
 * @param fileName String of filename + extension
 * @param isDirectory Boolean
 * @param fileSize Integer of file byte size
 */
function file(fileName, isDirectory, fileSize){
    // FIELD DECLARATIONS
    
    // File Size in bytes
    this.fileSize = (isDirectory === true) ? 0 : fileSize;

    this.fileName = fileName;
    
    // Boolean for if this is a directory || not
    this.isDirectory = isDirectory;
    
    // A String representing the owner, group, global permissions
    // By default, it is 777. Based on the base-2 permission value
    // will turn off read-wrte-execute permissions per group
    this.permissions = "drwxrwxrwx";
    // Numerical value of permissions
    this.permissionValue;
    
    // Strings containing the names of the owner, and the 
    // group the owner belongs to
    this.owner;
    this.group;
    
    // String of the file's current path
    this.path;
    // Reference to current directory onject
    this.parentDir;
    // An Array of Files 
    this.children = new Array();
    
    // An array of Strings containing the unformatted
    // content of this file
    this.content;
    
    // Date this file was last updated
    // Abbreviated Month\tDay\tTime (In military hours)
    this.lastModified;
    
    // If not a directory, total immediate subdirectories
    // plus 2 (this directory and its parent)
    // Else, total hard links to this file
    this.hardLinks = 1;
    
    
    // METHOD DECLARATIONS
    
    // Setters - Using the Builder Pattern to get
    // around the multiple fileds that must be
    // initialized right as the object is created
    
    /**
     * Precondition: Permissions are valid
     *
     * setPermissions - Sets the new permissions
     *      for this file. Takes a base-10 value,
     *      converts it into a binary string, and
     *      uses it to turn on or turn off certain
     *      bits in "drwxrwxrwx"
     *
     * @param permissionVal A String of length 3
     *      containing integers
     *
     * @return this object
     */
    this.setPermissions = function (permissionVal) {
        
        this.permissionValue = permissionVal;
        
        // Converting permission value to binary
        // pattern - concatenation of 3 3-bit 
        // patterns
        var bitPattern = "";
        
        var pvLength = permissionVal.length;
        
        for(var i = 0; i < pvLength; i++){
            var dividend = this.permissionValue[i];
            
            if(dividend == 0){
                // If current permission int is
                // a 0, just concatenate a 3-bit
                // zero
                bitPattern = bitPattern + "000";
                continue;
            }
            // Loop until dividend has been divided all
            // the way to one
            
            // Intermediate bit pattern for a single digit
            var subBitPattern = "";
            while(dividend != 1){
                // Append next bit
                subBitPattern = (dividend % 2) + subBitPattern;
                dividend = Math.floor(dividend / 2);
            }
            // need to append the last 1 % 2
            subBitPattern = "1" + subBitPattern;
            
            // Append bit set to full bit pattern
            bitPattern = bitPattern + subBitPattern;
        }
        
        // Permissions string with all bits turned on
        var maxPermissions = "drwxrwxrwx".split("");
        
        // First set the directory bit (based on isDirectory flag)
        maxPermissions[0] = (this.isDirectory === true) ? 'd' : '-';
        
        // then iterate through the bitPattern to determine
        // permissions
        var maxPermLength = maxPermissions.length;
        for(var i = 1; i < maxPermLength; i++){
            
            if(bitPattern.charAt(i-1) == "0"){
                // Replace current permission character with a dash
                maxPermissions[i] = '-';
            }
            
        }
        
        var newPermissions = maxPermissions.toString();
        // Replace all commas from the Array string representation
        // with an empty string
        newPermissions = newPermissions.replace(/,/g, "")
        
        // Assigning new permissions
        this.permissions = newPermissions;
        
        return this;
    } // End of setPermissions
    
    
    /**
     * setPath - Accepts a string and uses it
     *      to set the new path of this file
     *      Requires adjustment of this parentDir
     *      and children
     */
    this.setPath = function(newPath){
        this.path = newPath;
        //console.log("New Path: " + this.path);
        return this;
    } // End of setPath
    
    
    /**
     * setOwnership - Sets the owner and group
     *      this file belongs to
     *
     * @param owner String
     * @param group String
     */
    this.setOwnership = function(owner, group){
        // Setting
        this.owner = owner;
        this.group = group;
        
        return this;
    } // End of setOwnership
    
    
    /**
     * setParentDir - Used to set this file's
     *      parent directory
     *
     * @param String parent directories's name
     */
    this.setParentDir = function(newParent){
        this.parentDir = newParent;
        return this;
    } // End of parentDir
    

    /**
     * reSortChildren - used to re-sort the children
     *      array of the current directory
     */
    this.reSortChildren = function () {
        // Sort Children alphabetically
        this.children.sort(function (fileA, fileB) {
            return fileA.fileName > fileB.fileName;
        });
    } // end of reSortChildren

    /**
     * addChild - If this is a directory, then
     *      newChild will be added to the children's
     *      array
     *
     * @return true on success, false otherwise
     */
    this.addChild = function(newChild){
        if(this.isDirectory){
            // Push child if this is a directory
            this.children.push(newChild);
            // Sort Children alphabetically
            this.reSortChildren();
            return true;
        }else{
            // Otherwise, just return false
            return false;
        }
    } // End of addChild


    /**
     * setLastModified - Sets the new date
     *      of the lastModified field
     */
    this.setLastModified = function(newDatetime){
        this.lastModified = newDatetime;
        return this;
    }


    /**
     * setContent - Sets the content of the 
     *      the current file
     * 
     * @param content A String containing the text
     *      of this file. String may contain newline
     *      chars to parse for
     *
     */
    this.setContent = function(content){
        this.content = content;
        return this;
    }
    
    // Getters

    /**
     * getContent - Returns the content of this file
     *      instance
     */
    this.getContent = function () {
        return this.content;
    }
    
    /**
     * getLongListFormat - Creates the long listing
     *      format of this file 
     *
     * @return A String
     */
    this.getLongListFormat = function(){
        
        // Does not include file name because
        // that need to be formatted based on whether
        // or not this file is a directory or not
        var lsFormat = this.permissions 
                        + "\t"
                        + this.hardLinks
                        + "\t"
                        + this.owner
                        + "\t"
                        + this.group
                        + "\t"
                        + this.fileSize
                        + "\t"
                        + this.lastModified;
//                        + "\t"
//                        + this.fileName;
        
        return lsFormat;
    } // End of getLongListFormat
    
} // End of file class