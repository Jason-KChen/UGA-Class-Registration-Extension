/**
*	See README.md for details
*	remember version number in 3 different places
*/
var profData = {

};

function main()
{
	if($(".captiontext").length === 1 && $(".captiontext").text() === "Sections Found")
	{
		//console.log("on the right page");
		createNewCol();
		scrapeAndSearch();
	}
	else {
		//console.log("wrong page, not doing anything");
	}

}

function createNewCol()
{
	$(document).find(".datadisplaytable").find("tr").each(function(index, value)
	{
		if(index == 1)
		{
			$(this).find("th:eq(13)").after("<th style='background-color:#dfddd8;'>Ratings</th>");
		}
		if(index > 1)
		{
			if($(this).find("td:eq(8)").text() === "TBA")
			{
				$(this).find("td:eq(8)").attr("colspan", 1);
				$(this).find("td:eq(8)").after("<td style='font-size:85%; padding-top:4px; font-family:Verdana;'>TBA</td>");
				$(this).find("td:eq(13)").after("<td>Loading...</td>");
			}
			else
			{
				$(this).find("td:eq(13)").after("<td>Loading...</td>");
			}

		}
	});
}

function formatName(givenString)
{
	//console.log("About to formateName " + givenString);
	var resultArray = [];

	if(givenString.indexOf(",") > 0)
	{
		//console.log("Found more than one professors :" + givenString);
		//console.log(givenString.indexOf(","));
		return formatName(givenString.substring(0,givenString.indexOf(",")));
	}
	else
	{
		if(givenString === "TBA")
		{
			return "TBA";
		}
		else
		{
			var tempArray = givenString.split(" ");
			tempArray = tempArray.filter(function(givenElements)
			{
				return (givenElements !== "" && givenElements !== "(P)" && givenElements !== "(P),");
			});

			if(tempArray.length === 3)
			{
				resultArray.push(tempArray[0]);
				resultArray.push(tempArray[2]);
				return resultArray;
			}
			if(tempArray.length === 2)
			{
				resultArray.push(tempArray[0]);
				resultArray.push(tempArray[1]);
				return resultArray;
			}
			if(tempArray.length != 2 && tempArray.length != 3)
			{
				//console.log("Worst Case");
				return tempArray;
			}
		}
	}

}

function updateCells(targetRow, ratings, profNameInArray)
{
	//console.log("received request to update cells");

	$(".datadisplaytable").find("tr").each(function(index, value)
	{
		if(ratings === "TBA" && index === targetRow)
		{
			$(this).find("td:eq(14)").text("TBA");
		}

		if(ratings === "duplicates" && index === targetRow)
		{
			//console.log("updating a cell for a duplicate Prof");
			if(profData[profNameInArray[0] + profNameInArray[1]] === "Not Found")
			{
				//console.log("duplicate prof " + profNameInArray + " is set to not found");
				var manualSearchURL = "http://www.ratemyprofessors.com/search.jsp?queryBy=teacherName&schoolName=University+of+Georgia&queryoption=HEADER&query=" + profNameInArray[1]+ "&facetSearch=true";
				$(this).find("td:eq(14)").html(
					"<td>Not Found<br><a href=" + manualSearchURL + " target='_blank'>Manual Search</a></td>");
				//console.log("manualSearchURL is " + manualSearchURL);
			}
			else {
				//console.log("duplicate prof " + profNameInArray + " has ratings");
				var levelOfDifficulty = profData[profNameInArray[0] + profNameInArray[1]][0];
				var overallQuality = profData[profNameInArray[0] + profNameInArray[1]][1];
				var RMP_URL = profData[profNameInArray[0] + profNameInArray[1]][2];
				$(this).find("td:eq(14)").html(
					"<td>Difficulty:" + levelOfDifficulty + "<br>Overall:" + overallQuality + "<br><a href="+ RMP_URL + " target='_blank'>Visit RMP</a></td>"
				);
			}
		}

		if(Array.isArray(ratings) && index === targetRow)
		{
			//console.log("a new prof entry for " + profNameInArray);
			var levelOfDifficulty = ratings[0];
			var overallQuality = ratings[1];
			var RMP_URL = ratings[2];

			//new entry in profData
			profData[profNameInArray[0]+profNameInArray[1]] = [levelOfDifficulty, overallQuality, RMP_URL];
			$(this).find("td:eq(14)").html(
				"<td>Difficulty:" + levelOfDifficulty + "<br>Overall:" + overallQuality + "<br><a href="+ RMP_URL + " target='_blank'>Visit RMP</a></td>"
			);
		}

		if(ratings === "Not Found" && index === targetRow)
		{
			//console.log(profNameInArray[0] + profNameInArray[1] + " is a new not found entry");
			profData[profNameInArray[0] + profNameInArray[1]] = "Not Found";
			var manualSearchURL = "http://www.ratemyprofessors.com/search.jsp?queryBy=teacherName&schoolName=University+of+Georgia&queryoption=HEADER&query=" + profNameInArray[1]+ "&facetSearch=true";
			$(this).find("td:eq(14)").html(
				"<td>Not Found<br><a href=" + manualSearchURL + " target='_blank'>Manual Search</a></td>");
			//console.log("manualSearchURL is " + manualSearchURL);
		}
	});
}

function extractRatings(profURL, profIndex, profName)
{
	//console.log("received request to extract ratings for " + profName);
	var targetURL = "http://www.ratemyprofessors.com" + profURL;
	var message = {
		"Search": "no",
		"SearchName": profName,
		"SearchURL": targetURL,
		"ProfIndex": profIndex
	};
	//console.log("send message to extract ratings for " + profName);
	chrome.runtime.sendMessage(message, function(response){
		//console.log("result of extract ratings has arrived");
		var overallQuality = "Error";
		var levelOfDifficulty = "Error";
		var pageHTML = $.parseHTML(response.receivedData);
		if($(pageHTML).find(".left-breakdown").length === 0)
		{
			updateCells(response.profIndex, "Not Found", response.profName);
		}
		else {
			try
			{
				overallQuality = $(pageHTML)
					.find(".left-breakdown")
					.find(".grade:eq(0)")
					.text();
				levelOfDifficulty = $(pageHTML)
					.find(".left-breakdown")
					.find(".grade:eq(2)")
					.text();
			}
			catch(error){}
			overallQuality = overallQuality.replace(/\s/g, "");
			levelOfDifficulty = levelOfDifficulty.replace(/\s/g, "");
			targetURL = response.SearchURL;
			//console.log("ratings have been extracted for" + response.profName + ", update cells" + " ratings are "+ overallQuality + " " + levelOfDifficulty);
			updateCells(response.profIndex, [levelOfDifficulty,overallQuality,targetURL], response.profName);
		}
	});
}

function scrapeAndSearch()
{
	$(".datadisplaytable").find("tr").each(function(index, value)
	{
		if(index >= 2)
		{
			var formattedName = formatName($(this).find("td:eq(13)").text());
			if(formattedName === "TBA")
			{
				updateCells(index,"TBA", "TBA");
			}
			else
			{
				//console.log("checking for duplicates for " + formattedName);
				if(profData.hasOwnProperty(formattedName[0]+formattedName[1]))
				{
					//console.log(formattedName + "is a duplicate");
					updateCells(index, "duplicates", formattedName);
				}
				else
				{
					var message = {
						"Search": "yes",
						"SearchName": formattedName,
						"SearchURL": "NONE",
						"ProfIndex": index
					}
					//console.log("start searching for "+ formattedName[0] + " " + formattedName[1]);
					chrome.runtime.sendMessage(message, function(response) {
                        var parsedResponse = $.parseHTML(response.receivedData)
						var resultCount = $(parsedResponse).find("#searchResultsBox").find(".result-count").text();
						if(resultCount === "Showing 1-1 of 1 result")
						{
							var profURL = $(parsedResponse).find(".listings-wrap").find("a[href^='/ShowRatings.jsp?']").attr("href");
							//console.log(profURL + " " + response.profName[0] + response.profName[1]);
							//console.log("profIndex is " + response.profIndex);
							extractRatings(profURL, response.profIndex, response.profName);
						}
						else {
							//console.log(response.profName[0] + response.profName[1]  + " Not Found");
							updateCells(response.profIndex, "Not Found", response.profName);
						}
					}
					);
				}
			}

		}
	});
}

$(document).ready(main);
