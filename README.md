# dom-imprint

## examples
```
/*simplest*/
imprint.make({
	$ : 'img',
	type : 'attr',
	value : 'src'
});
/*array of urls of all images on the page*/

/*go to google.com, search smthng and run code*/
imprint.make({
	$ : 'div.g',
	type : 'children',
	value : {
		title : {
			$ : 'h3.r > a',
			type : 'text'
		},
		url : {
			$ : 'h3.r > a',
			type : 'attr',
			value : 'href'
		}
	}
});

/* 
[{
    title: "JavaScript - Wikipedia",
    url: "https://en.wikipedia.org/wiki/JavaScript"
}, {
    title: "What is JavaScript? - Definition from WhatIs.com - SearchMicroservices",
    url: "http://searchmicroservices.techtarget.com/definition/JavaScript"
}, {
    title: "Where is JavaScript? - Stack Overflow",
    url: "http://stackoverflow.com/questions/20858048/where-is-javascript"
}, ...]
```
