// ==UserScript==
// @name         DOMJSON
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  parser
// @author       Alex 
// @match        https://*/*
// @grant        none
// ==/UserScript==

(function(root, factory){
    'use strict';
    if (typeof define == 'function' && define.amd){
        define(factory);
    } else if (typeof module === 'object' && module.exports){
        module.exports = factory(!0);
    } else {
        window.Parcel = factory();
        window.parcel = new window.Parcel();

        var decreaseDate = function(date){
            var year = date.slice(0, 4);
            var month = date.slice(4, 6);
            var day = date.slice(6, 8);

            var date = new Date();

            date.setYear(year);
            date.setMonth(month - 1);
            date.setDate(day);

            date-=(1000*60*60*24);
            date = new Date(date);

            var result = "";
            result += (date.getFullYear()).toString();
            result += ((date.getMonth() + 1).toString().length == 1 ? "0"+(date.getMonth() + 1).toString() : (date.getMonth() + 1).toString());
            result += (date.getDate().toString().length == 1 ? "0"+date.getDate().toString() : date.getDate().toString());

            return result;

        };

        var goNextPage = function(){
            var href = window.location.href;
            href = href.replace("https://www.parimatch.com/res.html?", "");
            href = href.split("&");

            var tokens = {};

            for (var a = 0, token; a < href.length; a++){
                token = href[a].split("=");
                tokens[token[0]] = token[1];
            }

            console.log(tokens.Date);

            if (tokens.Date > 20171101){
                var url = "https://www.parimatch.com/res.html?";

                for (var k in tokens){
                    if (k == "Date"){
                        tokens[k] = decreaseDate(tokens[k]);
                        tokens[k] = tokens[k].toString();
                    }

                    if (!tokens[k] || !tokens[k].length){
                        continue;
                    }

                    url += ["&", k, "=", tokens[k]].join("");
                }

                console.log(url);
                setTimeout(function(){
                    window.open(url, "_self");
                }, Math.random() * 1000);

            }

        };

        var onContentLoaded = function(){
            var data = parcel.make({
                $ : 'table.TT',
                type : 'children',
                value : {
                    events : {
                        type : "children",
                        $  : "tbody",
                        value : {
                            date : {
                                $ : ".Mono:first-child",
                                type : "text"
                            },
                            team1 : {
                                $ : ".Mono + .Names",
                                type : "text"
                            },
                            team2 : {
                                $ : ".Names + .Names",
                                type : "text"
                            },
                            result : {
                                $ : ".Mono:last-child",
                                type : "text"
                            }
                        }
                    },
                }
            });

            window.parcel.extension.send(data);

            goNextPage();

        };

        var checkDocumentState = function(){
            console.log(document.readyState);
            if (document.readyState == "complete"){
                onContentLoaded();
            } else {
                setTimeout(checkDocumentState, 1000);
            }
        };

        checkDocumentState();

    }
}(window, function(){
    
    var Parcel = function(){
        console.warn('IMPRINT');

        if (window.chrome && window.chrome.runtime && window.chrome.runtime.onMessage){
            window.chrome.runtime.onMessage.addListener(function (msg, sender) {
                console.log(arguments)
            });
        }

    };

    Parcel.prototype = {
        extension : {
            send : function(data){
                chrome.runtime.sendMessage({
                    location: window.location.href,
                    data : data
                });
            }
        },
        helpers : {
            onMutate : function($, callback, parent){
                parent = parent || window.document;

                var element = parent.querySelector($);
                var config = { attributes: true, childList: true, characterData: true };

                var observer = new MutationObserver(function(mutations) {
                    for (var a = 0; a < mutations.length; a++){
                        cb(callback, mutations[a]);
                    }
                });

                function cb(callback, mutation){
                    callback(observer, mutation, element, Parcel);
                }

                observer.observe(element, config);
            }
        },  
        warn : function(){
            console.warn.apply(console, arguments);
        },
        format : function(value, format){
            if (typeof format == 'string'){
                switch(format){
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
                if (typeof description.$ == 'string'){
                    var elements = parent.querySelectorAll(description.$);

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
                    case 'html':
                        value = el.innerHTML;
                    break;
                    case 'attr':
                        value = el.getAttribute(description.value);
                    break;
                    case 'text':
                        value = el.textContent;
                    break;
                    case 'children':
                        value = {};

                        for (var k in description.value){
                            value[k] = this.make(this.async(value, k), description.value[k], el);
                        }

                    break;
                    case 'callback':
                        value = description.value(el);
                    break;
                    case 'callback-async':
                        description.value(el, async, this);
                        return null;
                    break;
                    default:
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

    return Parcel;

}));
