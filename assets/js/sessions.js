/**
 * File Name: sessions.js
 * Description: File that houses all of the sessions
 *  - state of a terminal specific to a activity - for
 *      the entire website. 
 * NOTE: Dependent on terminal.js and file.js
 *      ** Link to these files first before linking
 *      to this file
 * NOTE: This will also act as the "main" module
 *
 * @author Analia Mok
 */


// CONSTANTS

// File Instance of root & user directory
var ROOT_DIR;
var USER_DIR;

// User can make at most 15 files
var MAX_FILES = 20;


/* Initializations */
function terminalSetup(){
    
    // Assign functions for the events associated with
    // the terminal
    var terminal = document.getElementById("termOne");
    
    // Defining what to do when enter is pressed
    // inside the text input
	if(terminal != null){
		
		commandInputHolder = document.getElementById("cmd_in_holder");
    	var commandInput = document.getElementById("cmd_in");
		
		commandInput.onkeypress = function(event){
			if(!event){
				event = window.event;
			}
			var keyCode = event.keyCode || event.which;
			if(keyCode == "13"){
				// Enter key was pressed
				// Call parse Command
				parseCommand(terminal, commandInput);
				return false;
			}
		}
	
		// Onclick Event on terminal will shift focus
		// onto the commandInput text input
		terminal.onclick = function(){
		   commandInput.focus();
		};

		// Setting Up Root Directory
		createBaseDir();

		// Setting up terminal session
		setSessionOne(terminal);
	}
} // End of window.onload


/**
 * createBaseDir - Simple setup method for creating the base
 *      directory layout if the system
 *
 * Layout:
 *      /
 *          home/
  *             users/
 *                  user/
 *          bin/
 *          usr/
 *          etc/
 *          lib/
 */
function createBaseDir(){
    
    // Setting up ROOT Directory
    ROOT_DIR = new file("/", true, 0);
    ROOT_DIR.setPermissions("644")
        .setOwnership("user", "group")
        .setPath("/")
        .setLastModified("Jan 9 18:20")
        .setParentDir(null);
    
    
    // Home Directory
    var home = new file("home", true, 0);
    home.setPermissions("644")
        .setOwnership("user", "group")
        .setPath("/home")
        .setLastModified("Jan 9 18:20")
        .setParentDir(ROOT_DIR);
    
    // bin Directory
    var bin = new file("bin", true, 0);
    bin.setPermissions("644")
        .setOwnership("user", "group")
        .setPath("/bin")
        .setLastModified("Jan 9 18:20")
        .setParentDir(ROOT_DIR);
    
    // usr Directory
    var usr = new file("usr", true, 0);
    usr.setPermissions("644")
        .setOwnership("user", "group")
        .setPath("/usr")
        .setLastModified("Jan 9 18:20")
        .setParentDir(ROOT_DIR);
    
    // etc Directory
    var etc = new file("etc", true, 0);
    etc.setPermissions("644")
        .setOwnership("user", "group")
        .setPath("/etc")
        .setLastModified("Jan 9 18:20")
        .setParentDir(ROOT_DIR);
    
    // Users Directory
    var users = new file("users", true, 0);
    users.setPermissions("644")
        .setOwnership("user", "group")
        .setPath("/home/users")
        .setLastModified("Jan 9 18:20")
        .setParentDir(home);
    
    // Actual user directory
    USER_DIR = new file("user", true, 0);
    USER_DIR.setPermissions("644")
        .setOwnership("user", "group")
        .setPath("/home/users/user")
        .setLastModified("Jan 9 18:20")
        .setParentDir(users);
    
    // Appending user to users' children
    users.addChild(USER_DIR);
    // Appending users to home dir
    home.addChild(users);
    
    // lib Directory
    var lib = new file("lib", true, 0);
    etc.setPermissions("644")
        .setOwnership("user", "group")
        .setPath("/lib")
        .setLastModified("Jan 9 18:20")
        .setParentDir(ROOT_DIR);
    
    // Appending all of the root directory's children
    ROOT_DIR.addChild(home);
    ROOT_DIR.addChild(bin);
    ROOT_DIR.addChild(usr);
    ROOT_DIR.addChild(etc);
    ROOT_DIR.addChild(lib);
    
} // End of createBaseDir


/**
 * setSessionOne - Basic Session with a basic
 *      file structure to traverse
 */
function setSessionOne(terminal){
    
    // Set the current path as inside the Documents folder
    currentPath = USER_DIR.path + "/Documents/";
    
    // Upper Directory - TODO: Change to quiz content
    var documentsDir = new file("Documents", true, 0);
    documentsDir.setPermissions("755")
        .setOwnership("user", "group")
        .setPath(USER_DIR.path + "/Documents/")
        .setLastModified("Mar 7 14:20")
        .setParentDir(USER_DIR);
        // Parent directory is users/user
    
    // Inner directory inside the Documents Directory
    var testsDir = new file("Tests", true, 0);
    testsDir.setPermissions("755")
        .setOwnership("user", "group")
        .setPath(USER_DIR.path + "/Documents/Tests/")
        .setLastModified("Mar 8 08:00")
        .setParentDir(documentsDir);
    
    // "Test" files for the tests directory
    var testOneFile = new file("test1.txt", false, 96);
    testOneFile.setPermissions("644")
        .setOwnership("user", "group")
        .setPath(USER_DIR.path + "/Documents/Tests/test1.txt")
        .setLastModified("Feb 12 12:11")
        .setParentDir(testsDir)
        .setContent("test 1: 1\\n1\\n2\\n3");
    
    var testTwoFile = new file("test2.txt", false, 96);
    testTwoFile.setPermissions("644")
        .setOwnership("user", "group")
        .setPath(USER_DIR.path + "/Documents/Tests/test2.txt")
        .setLastModified("Feb 14 12:11")
        .setParentDir(testsDir)
        .setContent("test2: test 3, 2, 1");
    
    var testThreeFile = new file("test3.txt", false, 96);
    testThreeFile.setPermissions("644")
        .setOwnership("user", "group")
        .setPath(USER_DIR.path + "/Documents/Tests/test3.txt")
        .setLastModified("Apr 9 15:15")
        .setParentDir(testsDir)
        .setContent("test3: Hello :^)");
    
    // Hidden funny file
    var hiddenFile = new file(".test4.txt", false, 96);
    hiddenFile.setPermissions("644")
        .setOwnership("user", "group")
        .setPath(USER_DIR.path + "/Documents/Tests/.test4.txt")
        .setLastModified("Apr 10 12:35")
        .setParentDir(testsDir);

    var funnyText = "Bacon ipsum dolor amet proident bresaola corned beef"
        + ", spare ribs capicola sint chicken\\n"
        + "officia. Frankfurter irure enim ullamco, esse adipisicing"
        + "sirloin pork commodo sunt.\\n"
        + "Reprehenderit t-bone hamburger tri-tip filet mignon id consequat"
        + "ut cillum ground round\\n"
        + "meatball andouille. Aliqua pork chop tail, burgdoggen leberkas aute in.";

    hiddenFile.setContent(funnyText);
    
    // Just adding files to tests without doing any
    // protective checking for the moment
    testsDir.addChild(testOneFile);
    testsDir.addChild(testTwoFile);
    testsDir.addChild(testThreeFile);
    testsDir.addChild(hiddenFile);
    
    
    // Add testsDir as a child of documents
    documentsDir.addChild(testsDir);
    //documentsDir.addChild(hiddenFile);
    
    // Now SET CURRENT directory to documentsDir
    currentDir = documentsDir;
    
    // Now add documentsDir as a child of users/user directory
    USER_DIR.addChild(currentDir);
    
} // End of setSessionOne