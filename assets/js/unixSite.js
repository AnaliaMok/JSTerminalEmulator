/**
 * File Name: unixSite.js
 * Description: Main Javascript file for handling the main
 *  site's functionality
 *
 *  @author Analia Mok
 */

/**
 * filterRefs - Takes the current value of the search box
 *      and updates what commands are visible in the 
 *      commands div
 * @author Analia Mok
 */
function filterRefs(searchBox){
    
    // Grabbing search filter and making consistently
    // lower cased
    var filter = searchBox.value.toLowerCase();
    
    // All sections that house the command content
    var sections = document.getElementsByClassName("command");
    
    // If the command name in the code tag inside the section
    // matches the start of the filter, display block
    // Otherwise, display none
    var length = sections.length;
	setTimeout(function() {
    for(var i = 0; i < length; i++){
        var currSec = sections[i];
        
        // Name of command described by this article
        var cmdName = currSec
            .getElementsByClassName("command_content")[0]
            .getElementsByTagName("a")[0]
            .getElementsByClassName("code")[0]
            .innerHTML.toUpperCase();
        
			if(cmdName.indexOf(filter.toUpperCase()) > -1){
				 
				currSec.style.display = "block";
				
			}else{
				
				currSec.style.display = "none";
			
			}
		
        
    }
    }, 400);
} // End of filterRefs


function slideLeft(){
	var box = document.getElementById("slide_in");
	var arrow = document.getElementById("term_open_btn");
	if(box.style.transform === "translate(0%)" || box.style.transform === ""){
		box.style.transform = "translate(-75%)";
//		arrow.style.transition = "all 1s";
//		arrow.style.transform = "rotate(180deg)";
		arrow.style.backgroundColor = "rgb(133, 157, 175)";
        // Turning opacity completely on
        arrow.style.opacity = "1";
	}else{
		box.style.transform = "translate(0%)";
//		arrow.style.transform = "rotate(0deg)";
		arrow.style.backgroundColor = "#f47e69";
        // Lowering opacity a bit
		arrow.style.opacity = "0.9";
	}

} // End of slideLeft