// ==UserScript==
// @name         DOMJSON
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  parser
// @author       Alex 
// @match        https://*/*
// @grant        none
// ==/UserScript==

(function() {
    // Your code here...
    'use strict';
    var Imprint = function(){
    	console.log(document);
    };

    Imprint.prototype = {
        helpers : {
            onMutate : function(selector, callback, parent){
                parent = parent || window.document;

                var element = parent.querySelector(selector);
                var config = { attributes: true, childList: true, characterData: true };

                var observer = new MutationObserver(function(mutations) {
                    for (var a = 0; a < mutations.length; a++){
                        cb(callback, mutations[a]);
                    }
                });

                function cb(callback, mutation){
                    callback(observer, mutation, element, Imprint);
                }

                observer.observe(element, config);
            }
        },  
        warn : function(){
            console.warn.apply(console, arguments);
        },
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
        async : function(value, key, async, description, parent, elements){
            var _this = this;

            var next = function(isAsync){
                key++;
                if (elements && key < elements.length){
                    value[key] = _this.make(_this.async(value, key, async, description, parent, elements), description, parent, elements[key]);
                } else if (isAsync && elements && key >= elements.length){
                    _this.warn('async loop finished');
                }
            };

            var result =  function(v){
                value[key] = v;
                next(true);
            };

            result.next = next;

            return result;

        },
    	make : function(async, description, parent, el){
            if (typeof async == 'object'){
                el = parent;
                parent = description;
                description = async;
                async = false;
            }

    		parent = parent || window.document;

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

                        value[0] = this.make(this.async(value, 0, async, description, parent, elements), description, parent, elements[0])
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
                    case 'node-attr':
                        console.log(el)
                        value = el.getAttribute(description.value);
                    break;
                    case 'node-text':
                        value = el.textContent;
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
                        description.value(el, async, this);
                        return null;
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
            
            if (async.next) async.next();
    		return value;
    		
    	},
    };

    window.Parser = new Imprint();


    /*VK*/
    // imprint = Imprint.make({
    //     selector : '.photos_row > a',
    //     type : 'callback-async',
    //     value : function(el, async, Imprint){
    //         var value;

    //         Imprint.helpers.onMutate('#layer_wrap', function(observer, mutation, element, Imprint){

    //             if (mutation.type == 'attributes' && mutation.attributeName == 'style'){                
    //                 observer.disconnect();
    //                 value = Imprint.make({
    //                     type : 'branch',
    //                     selector : 'body',
    //                     value : {
    //                         url : {
    //                             selector : '#pv_photo > img',
    //                             type : 'node-attribute',
    //                             value : 'src'
    //                         },
    //                         source : {
    //                             selector : '.group_link',
    //                             type : 'node-html'
    //                         },
    //                         likes : {
    //                             selector : '.pv_like_count',
    //                             type : 'node-html',
    //                             format : ['parse-number']
    //                         }
    //                     }
    //                 });

    //                 Photoview.hide(0);      

    //                 setTimeout(function(){
    //                     async(value);
    //                 }, Math.random() * 2)

    //             }
    //         });

    //         el.onclick.apply(el);
    //     }
    // })

    /*GOOGLE MUISC*/
   // var bla = Imprint.make({
   //      selector : '.song-row',
   //          type : 'branch',
   //          value : {
   //              artist : {
   //                  selector : '[data-col="artist"] span',
   //                  type : 'node-text'
   //              },
   //              title : {
   //                  selector : '[data-col="title"] .column-content.tooltip',
   //                  type : 'node-text'
   //              },
   //              duration : {
   //                  selector : '[data-col="duration"] span',
   //                  type : 'node-text'
   //              },
   //              album : {
   //                  selector : '[data-col="album"] span',
   //                  type : 'node-text'
   //              },
   //              rating : {
   //                  selector : '[data-col="rating"]',
   //                  type : 'node-attr',
   //                  value : 'data-rating'
   //              }
   //          }
   //      })

})();