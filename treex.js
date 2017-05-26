// ==UserScript==
// @name         DOMJSON
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://*/*
// @grant        none
// ==/UserScript==

(function() {
    // Your code here...
    'use strict';
    var DOMJSON = function(){
    	console.log(document);
    };

    DOMJSON.prototype = {
    	format : function(value, format){
    		if (typeof format == 'string'){
                format = format.split('>');
                var type = format[0];
                var action = format[1];

                if (typeof value == type){
                    switch(action){
                        case 'rm-spaces':
                            return value.replace(/^\s+|\s+$/g,'');
                        break;
                        case 'rm-html':
                            return value.replace(/<\/?[^>]+(>|$)/g, "");
                        break;
                        case 'parse-number':
                            return Number(value) || 0;
                        break;
                        default:
                            return value;
                        break;
                    }
                }
            } else if (typeof format == 'function'){
                return format(value);
            }

    		return value;

    	},
        makeJSON : function(description, parent, el){
            return JSON.stringify(this.make(description, parent, el));
        },
        async : function(target, key){
            return function(value){
                target[key] = value;
            }
        },
    	make : function(async, description, parent, el){
            if (typeof async == 'object'){
                el = parent;
                parent = description;
                description = async;
                async = false;
            }

    		parent = parent || window.document;

            var resume = this.make.bind(this, description, parent, el);

    		var value;

    		if (typeof el == 'undefined'){
    			if (typeof description.selector == 'string'){
    				var elements = parent.querySelectorAll(description.selector);

    				if (elements.length == 0){
    					value = null;
    				} else if ((elements.length == 1 && description.array !== true) || description.array === false){
	    				el = elements[0];
	    			} else {
	    				value = [];

	    				for (var a = 0, l = elements.length; a < l; a++){
	    					value.push(this.make(this.async(value, a), description, parent, elements[a]));
	    				}
	    			}

    			} else {
    				el = parent;
    			}
    		}

    		if (typeof value == 'undefined'){
    			switch(description.type){
	    			case 'node-html':
	    				value = el.innerHTML;
	    			break;
                    case 'node-attribute':
                        value = el.getAttribute(description.value);
                    break;
	    			case 'branch':
	    				value = {};

	    				for (var k in description.value){
	    					value[k] = this.make(this.async(value, k), description.value[k], el);
	    				}
	    			break;
                    case 'callback':
                        value = description.value(el);
                    break;
                    default:
                    case 'callback-async':
                        description.value(el, async);
                        value = null;
                    break;
                        value = null;
                    break;
	    		}
    		}

    		if (description.format){
    			for (var b = 0, l = description.format.length; b < l; b++){
    				if (typeof description.format[b] == 'function'){
                        value = description.format[b](value);
                    } else {
                        value = this.format(value, description.format[b]);
                    }
    			}
    		}

    		return value;
    		
    	},
    };

    window.domJSON = new DOMJSON();

})();