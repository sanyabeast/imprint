"use strict";

var totalData = [];

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    process(request.data);
});

function process(data){
	totalData = totalData.concat(data.events);
	console.log(totalData);
}