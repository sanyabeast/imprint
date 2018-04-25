// ==UserScript==
// @name         Imprint-next
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
    }
}(window, function(){
    var Imprint = function(){

    };

    Imprint.prototype = {
        serviceStampProps : [
            "$children",
            "$attribute",
            "$text",
            "$html",
            "$type",
            "$key",
            "$count",
            "$value",
            "$format",
        ],
        format : {
            "trim" : function(string){
                string = string.toString();
                return string.trim()
             },
            "rm-html" : function(string){
                string = string.toString();
                return string.replace(/(<([^>]+)>)/ig, "");
            },
            "number" : function(string){
                var matches = string.match(/[-]{0,1}[\d]*[\.]{0,1}[\d]+/g);
                var result = 0;
                if (matches !== null){ result = parseFloat(matches[0]); } 
                return result;
            },
        },
        dispatch : function(el, etype){
            if (el.fireEvent) {
                el.fireEvent('on' + etype);
            } else {
                var evObj = document.createEvent('Events');
                evObj.initEvent(etype, true, false);
                el.dispatchEvent(evObj);
            }
        },
        applyFormats : function(data, format, stamp, source){
            if (typeof format == "object" && typeof format.length == "number"){
                this.loop(format, (formatData) => {
                    data = this.applyFormats(data, formatData);
                });

                return data;
            }

            if (typeof format == "string" && typeof this.format[format] == "function"){
                data = this.format[format](data, stamp, source);
            }

            if (typeof format == "function"){
                data = format.call(this, data, stamp, source);
            }

            return data;
        },
        loop : function(list, cb, ctx){
            var _break = false;
            if (typeof list.length == "nubmer"){
                for (var a = 0, l = list.length; a < l; a++){
                    _break = cb.call(ctx, list[a], a, list);
                    if (_break){
                        break;
                    }
                }
            } else {
                for (var a in list){
                    _break = cb.call(ctx, list[a], a, list);
                    if (_break){
                        break;
                    }
                }
            }
        },
        make : function(stamp, source){
            source = source || document.body;

            if (typeof source == "object" && typeof source.length == "number"){
                var outputData = [];
                this.loop(source, (sourceItem, index) => {
                    var node = this.make(stamp, sourceItem);
                    if (node instanceof Promise){
                        let _index = index;
                        node.then((data)=>{
                            outputData[_index] = data;
                        });
                    } else {
                        outputData[index] = node;
                        
                    }
                });
                return outputData;
            }



            var sourceData  = null;
            var outputData  = {};

            var isText  = false;
            var isContainer = true;
            var stampsCount = 0;

            switch(stamp.$type){
                case "child":
                    sourceData = source.querySelector(stamp.$key);
                break;  
                case "children":
                    sourceData = source.querySelectorAll(stamp.$key);
                    if (typeof stamp.$count == "number"){
                        sourceData = Array.prototype.slice.call(sourceData, 0, Math.min(sourceData.length, stamp.$count));
                    }
                break;
                case "attribute":
                    isText = true;
                    sourceData = source.getAttribute(stamp.$key);
                break;
                case "text":
                    isText = true;
                    sourceData = source.innerText;
                break;
                case "html":
                    isText = true;
                    sourceData = source.innerHTML;
                break;
                case "async":
                    if (typeof stamp.$key == "function"){
                        sourceData = new Promise((resolve, reject)=>{
                            stamp.$key.call(this, resolve, reject, stamp, source);
                        });
                    }
                    
                break;
                default:
                    sourceData = source;
                break;  
            }

            if (stamp.$value){
                stampsCount++;
                outputData = this.make(stamp.$value, sourceData);
            } else {
               this.loop(stamp, (childStamp, key) => {
                     if (this.serviceStampProps.indexOf(key) < 0){
                        stampsCount++;
                        node = null;
                        node = this.make(childStamp, sourceData);

                        if (node instanceof Promise){
                            let _key = key;
                            node.then((data)=>{
                                outputData[_key] = data;
                            })
                        } else {
                            outputData[key] = node;                            
                        }

                    }
                }); 
            }

            

            if (stampsCount === 0){
                outputData = sourceData;
            }

            if (stamp.$format){
                outputData = this.applyFormats(outputData, stamp.$format, stamp, source);
            }

            return outputData;


        }
    };

    return Imprint;
    
}));
