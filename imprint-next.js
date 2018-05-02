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
        (function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.WorkerTimer=f()}})(function(){var define,module,exports;return function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}({1:[function(require,module,exports){(function(global){"use strict";if(global===global.window&&global.URL&&global.Blob&&global.Worker){module.exports=function(){var TIMER_WORKER_SOURCE=["var timerIds = {}, _ = {};","_.setInterval = function(args) {","  timerIds[args.timerId] = setInterval(function() { postMessage(args.timerId); }, args.delay);","};","_.clearInterval = function(args) {","  clearInterval(timerIds[args.timerId]);","};","_.setTimeout = function(args) {","  timerIds[args.timerId] = setTimeout(function() { postMessage(args.timerId); }, args.delay);","};","_.clearTimeout = function(args) {","  clearTimeout(timerIds[args.timerId]);","};","onmessage = function(e) { _[e.data.type](e.data) };"].join("");var _timerId=0;var _callbacks={};var _timer=new global.Worker(global.URL.createObjectURL(new global.Blob([TIMER_WORKER_SOURCE],{type:"text/javascript"})));_timer.onmessage=function(e){if(_callbacks[e.data]){_callbacks[e.data].callback.apply(null,_callbacks[e.data].params)}};return{setInterval:function(callback,delay){var params=Array.prototype.slice.call(arguments,2);_timerId+=1;_timer.postMessage({type:"setInterval",timerId:_timerId,delay:delay});_callbacks[_timerId]={callback:callback,params:params};return _timerId},setTimeout:function(callback,delay){var params=Array.prototype.slice.call(arguments,2);_timerId+=1;_timer.postMessage({type:"setTimeout",timerId:_timerId,delay:delay});_callbacks[_timerId]={callback:callback,params:params};return _timerId},clearInterval:function(timerId){_timer.postMessage({type:"clearInterval",timerId:timerId});_callbacks[timerId]=null},clearTimeout:function(timerId){_timer.postMessage({type:"clearTimeout",timerId:timerId});_callbacks[timerId]=null}}}()}else{module.exports=global}}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{})},{}]},{},[1])(1)});

        var Imprint = function(){
            this.observer = new MutationObserver(this.processMutation.bind(this));
            this.observer.observe(document.body, { 
                attributes: true, 
                childList: true, 
                characterData: true,
                subtree : true,
                attributeOldValue : true,
                characterDataOldValue : true,
            });

            this.listeners = [];
            this.waitings = [];
            this.promises = 0;

            if (false && Notification.permission != "denied" && Notification.permission != "granted"){
                Notification.requestPermission();
            }
        };

        Imprint.prototype = {
            notify : function(message){
                return new Notification(message);
            },
            clearWaitings : function(){
                while(this.waitings.length > 0){
                    WorkerTimer.clearTimeout(this.waitings.pop().split("#")[0]);
                }
            },
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
            trimMutaationListeners : function(){
                console.log("[IMPRINT]", "Trimming mutation listeners");
                this.loop(this.listeners, (callbacks, mutationStamp, listeners)=>{
                    var _callbacks = [];
                    this.loop(callbacks, (callback)=>{
                        if (callbacks !== false){
                            _callbacks.push(callback);
                        }
                    });

                    listen[mutationStamp] = _callbacks;
                });
            },
            trimWaiters : function(){
                var waitings = [];
                this.loop(this.waitings, (value)=>{
                    var date = Number(value.split("#")[1]);
                    if (date > +new Date()){
                        waitings.push(value);
                    }
                });

                this.waitings = waitings;
            },
            wait : function(callback, timeout){
                var tID;
                var wID = this.waitings.length;

                tID = WorkerTimer.setTimeout(()=>{
                    this.trimWaiters();
                    callback();
                }, timeout * 1000);

                this.waitings.push([tID, (+new Date() + (timeout * 1000))].join("#"));;
            },
            processMutation : function(mutationData){
                if (typeof mutationData.length == "number"){
                    this.loop(mutationData, (mutationData)=>{
                        this.processMutation(mutationData);
                    });
                    return;
                }

                if (window.parcelLogMutation){
                    console.log("[IMPRINT]", mutationData);
                    debugger;
                }

                this.loop(this.listeners, (callbacks, mutationStamp, list)=>{
                    let matched = this.validateMutation(mutationData, mutationStamp);
                    if (matched){
                        this.loop(callbacks, (callback, index)=>{
                            if (callback !== false){
                                callbacks[index] = false;
                                callback.call(this, callback, mutationStamp, mutationData);
                            }
                        });
                        
                    } else {
                    }
                });

            },
            validateMutation : function(mutationData, mutationStamp){
                var result = true;

                var mutationStampParced = mutationStamp.split("@");

                this.loop(mutationStampParced, (token, key)=>{
                    if (this.evalMutationStampKey(
                        token,
                        mutationData.addedNodes, 
                        mutationData.attributeName, 
                        mutationData.attributeNamespace,
                        mutationData.nextSibling,
                        mutationData.oldValue,
                        mutationData.previousSibling,
                        mutationData.removedNodes,
                        mutationData.target,
                        mutationData.type
                    ) !== true){
                        result = false;
                        return true;
                    }
                });


                return result;
            },
            evalMutationStampKey : function(
                token,
                addedNodes, 
                attributeName, 
                attributeNamespace,
                nextSibling,
                oldValue,
                previousSibling,
                removedNodes,
                target,
                type
            ){
                var result = false;

                try {
                    result = eval(token);
                } catch(err){}

                return result;
            },
            listen : function(mutationStamp, callback){
                console.log("[IMPRINT]", "New Listener for " + mutationStamp);
                this.listeners[mutationStamp] = this.listeners[mutationStamp] || [];
                this.listeners[mutationStamp].push(callback);
            },
            dispatch : function(el, etype){
                console.log("[IMPRINT]", "Dispatching " + etype + " event");
                if (el.fireEvent) {
                    el.fireEvent('on' + etype);
                } else {
                    var evObj = document.createEvent('Events');
                    evObj.initEvent(etype, true, false);
                    el.dispatchEvent(evObj);
                }
            },
            applyFormats : function(data, format, stamp, source){
                console.log("[IMPRINT]", "Applying formats");
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
                if (!list){
                    return;
                }

                var _break = false;
                if (typeof list == "object" && typeof list.length == "number"){
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
                console.log("[IMPRINT]", "Making node");
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
                        if (source instanceof Node){
                            sourceData = source.querySelector(stamp.$key);
                        }
                    break;  
                    case "children":
                        if (source instanceof Node){
                                sourceData = source.querySelectorAll(stamp.$key);
                            if (typeof stamp.$count == "number"){
                                sourceData = Array.prototype.slice.call(sourceData, 0, Math.min(sourceData.length, stamp.$count));
                            }
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
                            this.promises++;
                            sourceData = new Promise((resolve, reject)=>{
                                this.promises--;
                                stamp.$key.call(this, resolve, reject, stamp, source, stamp.$key);
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
                                });
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
