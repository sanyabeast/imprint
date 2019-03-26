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

## imprint-next
```javascript
data = parcel.make({
	categories: {
		$type: "children",
		$key: "tbody.yt-agile-table__row",
		$value: {
			name: {
				$type: "child",
				$key: ".yt-agile-table__row-title__summary__text",
				$value: {
					$type: "text",
					$key: "span.yt-agile-board-swimlane__summary"
				}
			},
			columns: {
				$type: "children",
				$key: ".yt-swimlane-column",
				$value: {
					cards: {
                        $type: "children",
                        $key: "yt-agile-card",
                        $value: {
                            id: {
                                $type: "child",
                                $key: ".yt-issue-id",
                                $value: {
                                    $type: "text"
                                }
                            },
                            caption: {
                                $type: "child",
                                $key: ".yt-agile-card__summary span",
                                $value: {
                                    $type: "text"
                                }
                            },
                            priority: {
                                $type: "child",
                                $key: "yt-issue-custom-field-lazy",
                                $value: {
                                    $type: "text"
                                }
                            },
                        }
                    }
				}
			}
			
		}
	}
})
```
