/**
 * File Name: java.js
 * Description: Javascript code that handles intializing
 *      the navigation menus
 * @author Lingting Zheng
 */


/*i love jquery*/
$(document).ready(function () {
    $(".burger-icon").click(function () {
        $("#side_nav").animate({width: "toggle"}, "fast");
        if ($(".burger-icon").css("left") == "0px") {
            $(".burger-icon").animate({left: "12rem"}, "fast");
        } else {
            $(".burger-icon").animate({left: "0"}, "fast");
        }
    });

    $(".open-top-nav").click(function () {
        $(".top-nav-menu").slideToggle("fast");
    })

    $("#top_nav").sticky({topSpacing: 0});
});

function initializeMenu(menuId, SubMenuList) {
    var menu = document.getElementById(menuId);
    var SubMenuList = document.getElementById(SubMenuList);
    if (menu == null || SubMenuList == null) {
        return;
    } else {
        SubMenuList.onclick = function () {
            var display = menu.style.display;
            menu.style.display = (display == "block") ? "none" : "block";
        }
    }
}

window.onload = function () {
    initializeMenu("gettingstart", "start");
    initializeMenu("generalfilenav", "generalfile");
    initializeMenu("subfilemodification", "filemodification");
    initializeMenu("subfilecomparisons", "filecomparisons");
    initializeMenu("subsetting", "setting");
    initializeMenu("subnetwork", "network");
    initializeMenu("subbasicfile", "basicfile");
    initializeMenu("subfilecreation", "filecreation");
    initializeMenu("subvi", "vi");
    initializeMenu("subnano", "nano");
    initializeMenu("subemacs", "emacs");
    initializeMenu("subgrep", "grep");

    initializeMenu("subreference1", "reference1");
    initializeMenu("subreference2", "reference2");
    initializeMenu("subreference3", "reference3");
    initializeMenu("subreference4", "reference4");

    // Setting up terminal for use
    // All error checking done inside method
    terminalSetup();
}
function validate(){
	var name=document.getElementById("name").value;
	var email=document.getElementById("email").value;
	var comment=document.getElementById("comment").value;
	
	if(name==''){
		document.getElementById("name").style.borderColor="red";
	}
	if(email==''){
		document.getElementById("email").style.borderColor="red";
		
	}
	if(comment==''){
		document.getElementById("comment").style.borderColor="red";
		
	}
	
	if(name==''|| email==''||comment==''){
		alert("Missing message");
		return false;
	}else{
		return true;
	}
	
}

