$("#bnt").click(function() {
	$(".attr").toggle("slow");
});

$("#bnt2").click(function() {
	var extensionID = chrome.runtime.id;
	window.open("https://chrome.google.com/webstore/detail/" + extensionID,"_blank");
});

$("#bnt3").click(function() {
	window.open("http://www.ratemyprofessors.com/search.jsp?queryBy=teacherName&schoolName=University+of+Georgia&queryoption=HEADER&facetSearch=true","_blank");
});
