chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{
	//var generalSearchURL = "http://www.ratemyprofessors.com/search.jsp?queryBy=teacherName&schoolName=University+of+Georgia&queryoption=HEADER&query=TARGETPROF&facetSearch=true";
    var generalSearchURL2 = "http://www.ratemyprofessors.com/search.jsp?query=TARGETPROF";
	var xhttp = new XMLHttpRequest();
	var xhttpRequestURL = "";
	if(request.Search === "yes")
	{
		var profNameInSeachURL = request.SearchName[0] + "+" + request.SearchName[1];
		//xhttpRequestURL = generalSearchURL.replace("TARGETPROF", profNameInSeachURL);
        xhttpRequestURL = generalSearchURL2.replace("TARGETPROF", profNameInSeachURL);
	}
	if(request.Search === "no")
	{
		xhttpRequestURL = request.SearchURL;
	}
	xhttp.open("GET", xhttpRequestURL, true);
	xhttp.onreadystatechange = function () {
		if(xhttp.readyState == 4)
		{
			sendResponse({
				receivedData: xhttp.responseText,
				profName: request.SearchName,
				profIndex: request.ProfIndex,
				SearchURL: request.SearchURL,
			});
		}
		else {}
	};
	xhttp.send();
	return true;
});
