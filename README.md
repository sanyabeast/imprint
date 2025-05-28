# Imprint

A lightweight, declarative DOM scraping library for extracting structured data from web pages.

## Overview

Imprint (also known as Parcel in some contexts) allows you to define a JSON-like schema that maps to DOM elements, making it easy to extract structured data from websites. It can be used as a browser extension, a standalone library, or with Tampermonkey/Greasemonkey.

## Features

- Declarative syntax for defining data extraction patterns
- Support for nested data structures
- Multiple data extraction types (text, attributes, children, etc.)
- Format transformations for extracted data
- Mutation observers for dynamic content
- Chrome extension support

## Usage Examples

### Basic Example: Extract Image URLs

```javascript
// Get all image URLs from a page
imprint.make({
    $ : 'img',
    type : 'attr',
    value : 'src'
});
// Returns an array of all image URLs on the page
```

### Advanced Example: Extract Search Results

```javascript
// On Google search results page
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

/* Returns structured data like:
[{
    title: "JavaScript - Wikipedia",
    url: "https://en.wikipedia.org/wiki/JavaScript"
}, {
    title: "What is JavaScript? - Definition from WhatIs.com",
    url: "http://searchmicroservices.techtarget.com/definition/JavaScript"
}, ...]
*/
```

## Imprint-Next Syntax

The newer version of Imprint uses a slightly different syntax with `$type`, `$key`, and `$value` properties:

```javascript
// Extract data from a complex UI
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
                            }
                        }
                    }
                }
            }
        }
    }
})
```

## License

MIT
