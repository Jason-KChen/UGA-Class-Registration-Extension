$("#bnt").click(function() {
	$(".attr").toggle("slow");
});

$("#bnt2").click(function() {
	var extensionID = chrome.runtime.id;
	window.open("https://chrome.google.com/webstore/detail/" + extensionID,"_blank");
});
