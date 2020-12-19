'use strict';
if (!window.prog)         window.prog       = {};
if (!window.prog.tools)   window.prog.tools = {};

window.prog.tools.preloader = {
	/**
		params.target             		-  target object

		prams.start (wrap)              - set start functoin directly
		prams.complete (wrap)           - set complete functoin directly
		prams.callback (wrap)           - set callback functoin directly

		or params.callback.apply (wrap, params.callback_args)
		params.callback_args	  		-  array of arguments for callback
		params.src                		-  path for loaded file
		params.start_func         		-  for call start load
		or params.start_func.apply (wrap, params.start_func_args )
		params.start_func_args    		-  array of arguments for call function
		params.complete_func (wrap)     -  function for check complete
		or params.complete_func.apply (wrap, params.complete_func_args)
		params.complete_func_args 		-  array of arguments for check complete function
	*/
	Wrap: function (params) {
		var _this = this;
		_this.params = params;
		if (params.start_func) {
			if (!(params.start_func instanceof Function)) {
				params.start_func = params.target[params.start_func];
			}
			params.start = function (wrap) {
				if (wrap.params.start_func_args) {
					wrap.params.start_func.apply(wrap, wrap.params.start_func_args);
				} else {
					wrap.params.start_func(wrap);
				}
			}
		}
		if (params.complete_func) {
			if (!(params.complete_func instanceof Function)) {
				params.complete_func = params.target[params.complete_func];
			}
			params.complete = function (wrap) {
				if (wrap.params.complete_func_args) {
					wrap.params.complete_func.apply(wrap, wrap.params.complete_func_args);
				} else {
					wrap.params.complete_func(wrap);
				}
			}
		}
		if (params.target instanceof HTMLImageElement) {
			if (!params.start) {
				params.start = function (wrap) {
					wrap.params.target.src = wrap.params.src;
				}
			}
			if (!params.complete) {
				params.complete = function (wrap) {
					return wrap.params.target.complete;
				}
			}
		} else if (params.target instanceof HTMLAudioElement) {
			if (!params.start) {
				params.start = function (wrap) {
					wrap.params.target.src = wrap.params.src;
				}
			}
			if (!params.complete) {
				params.complete = function (wrap) {
					return wrap.params.target.readyState == 4;
				}
			}
		}  else if (params.target instanceof XMLHttpRequest) {
			if (!params.start) {
				params.start = function (wrap) {
					params.target.send();
				}
			}
			if (!params.complete) {
				params.complete = function (wrap) {
					return wrap.params.target.readyState == 4 && wrap.params.target.status == 200;
				}
			}
		} else if (params.target instanceof FileReader) {
			if (!params.complete) {
				params.complete = function (wrap) {
					return wrap.params.target.readyState == 2;
				}
			}
		}
	},
	wraps: [],
	callbacks: [],
	callback: null,
	i_interval: 0,
	add:function( params ){
		this.wraps.push(new this.Wrap(params));
	},
	start:function(){
		var i = 0, l = this.wraps.length;
		if( l <= 0 ){ if(this.callback != null ) this.callback(); return;};
		while( i < l ){
			this.wraps[i].params.start(this.wraps[i]);
			++i;
		}
		this.i_interval = window.setInterval( this.checkLoaded.bind( this ), 1000/30 );
	},
	checkLoaded:function(){
		var i = 0, l = this.wraps.length;
		while( i < l ){
			if( this.wraps[i].params.complete(this.wraps[i]) ){
				if (this.wraps[i].params.callback) {
					this.callbacks.push(this.wraps[i]);
				}
				this.wraps.splice( i, 1 );
				--l;
			}else{
			 ++i;
			}
		}
		if( l <= 0 ){
			window.clearInterval( this.i_interval );
			var preloader_callback = this.callback;
			this.callback = null;
			var callbacks = this.callbacks;
			this.callbacks = [];
			i = 0, l = callbacks.length; 
			while (i < l) {
				if (callbacks[i].params.callback_args) {
					callbacks[i].params.callback.apply(callbacks[i], callbacks[i].params.callback_args);
				} else {
					callbacks[i].params.callback(callbacks[i]);
				}
				++i;
			}
			if(preloader_callback) preloader_callback();
		}
	}
};

prog.tools.base64ToArrayBuffer = function (base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
};

prog.tools.simulateEvent = {
	extend: function (destination, source) {
    	for (var property in source)
      		destination[property] = source[property];
    	return destination;
	},
	
	eventMatchers: {
	    'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
	    'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
	},
	defaultOptions: {
	    pointerX: 0,
	    pointerY: 0,
	    button: 0,
	    ctrlKey: false,
	    altKey: false,
	    shiftKey: false,
	    metaKey: false,
	    bubbles: true,
	    cancelable: true
	},
	simulate: function (element, eventName) {
	
	    var options = this.extend(this.defaultOptions, arguments[2] || {});
	    var oEvent, eventType = null;
	
	    for (var name in this.eventMatchers)
	    {
	        if (this.eventMatchers[name].test(eventName)) { eventType = name; break; }
	    }
	
	    if (!eventType)
	        throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');
	
	    if (document.createEvent)
	    {
	        oEvent = document.createEvent(eventType);
	        if (eventType == 'HTMLEvents')
	        {
	            oEvent.initEvent(eventName, options.bubbles, options.cancelable);
	        }
	        else
	        {
	            oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
	            options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
	            options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
	        }
	        element.dispatchEvent(oEvent);
	    }
	    else
	    {
	        options.clientX = options.pointerX;
	        options.clientY = options.pointerY;
	        var evt = document.createEventObject();
	        oEvent = this.extend(evt, options);
	        element.fireEvent('on' + eventName, oEvent);
	    }
	    return element;
	},
};

prog.tools.array = {
	shuffle: function (arr, save_source) {
		var i, k, b, l = arr.length;
		var result;
		if (save_source) {
			i = 0;
			result = new Array(l);
			while (i < l ) {
				result[i] = arr[i];
				++i;
			}
		} else {
			 result = arr;
		}
		i = 0;
		while (i < l) {
			k = Math.floor(Math.random()*l);
			if (k != i) {
				b = result[i];
				result[i] = result[k];
				result[k] = b;
			}
			++i;
		}
		return result;
	}
};


(function () {
	var mainLoop = {};
	prog.mainLoop = mainLoop;
	mainLoop.running = false;
	mainLoop.start = function () {
		mainLoop.running = true;
		requestAnimationFrame( mainLoop.loop );
	},
	mainLoop.stop = function () {
		mainLoop.running = false;
	},
	mainLoop.loop = function () {
		prog.graphics.stage.draw(prog.graphics.ctx);
		if (mainLoop.running)
			requestAnimationFrame( mainLoop.loop );
	}
})();