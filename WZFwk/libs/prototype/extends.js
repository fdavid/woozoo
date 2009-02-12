
Element.addMethods({
	/* Parent is not supported yet */
	center: function(element, parent, down) {
		element = $(element);
		down = (down === undefined) ? false : down;
        var w, h, pw, ph, shh, shw;
		if(down) {
			var elementDimensions = element.down('div').getDimensions();	
		}else{
			var elementDimensions = element.getDimensions();
		}
        w = elementDimensions.width;
        h = elementDimensions.height;
		
		var vp = document.viewport;
        var ws = vp.getDimensions();
        pw = ws.width;
        ph = ws.height;
		var sh = vp.getScrollOffsets();
        shw = sh.left;
        shh = sh.top;
       
		element.setStyle({top: (ph/2) - (h/2) + shh+ "px",
						  left: (pw/2) - (w/2) + shw + "px",
						  position: 'absolute',
						  zIndex: 99});
		return element;
	}
});




Element.addMethods({

  getStyles: function(element) {
  	/*var excludedKey = [0], list = [], style = "", styleStrip = "", key = "", bool = false;
  	
  	$H(element.style).each(function(pair) {
  		style = element.getStyle(pair.key);
  		if (typeof style == "string") {
  			styleStrip = style.strip();
  			if (styleStrip != "") {
  				key = pair.key;
  				bool = false;
  				excludedKey.each(function(value) {
					if (value == key) {
						bool = true;
					}
			  	})
			  	if (bool == false) {
  					list.push(key+': '+styleStrip);
  				}
  			}
  		}
  	}.bind(this));
  	
  	return list.join(', ');*/
  }
});

Element.addMethods({
  /*scrollTo: function(element, left, top){
    var element = $(element);
    if (arguments.length == 1){
      var pos = element.cumulativeOffset();
      window.scrollTo(pos[0], pos[1]);
    } else {
      element.scrollLeft = left;
      element.scrollTop  = top;
    }
    return element;
  }*/
  
  scrollTo: function(element, container){
    var element = $(element);
    var container = $(container);
    if (arguments.length == 1){
      var pos = element.cumulativeOffset();
      window.scrollTo(pos[0], pos[1]);
    } else {
		var x = element.x ? element.x : element.offsetLeft;
        var y = element.y ? element.y : element.offsetTop;
        container.scrollLeft=x-(document.all?0:container.offsetLeft );
        container.scrollTop=y-(document.all?0:container.offsetTop);
    }
    return element;
  }
});

Object.extend(String.prototype, {
	protect: function(limit) {
		var ret = this.stripScripts().stripTags();
		if (limit == undefined) {
			return ret;
		} 
		return ret.slice(0, limit);
	}
});

/**
 * remove the methods of the class (but the class apparently still exists ?)
 * */
Class.Methods.removeMethods = function() {

	for (key in this.prototype) {
		//this.prototype[key] = undefined;
		delete this.prototype[key];
	}
	delete this.prototype;
};

// FROM http://www.danwebb.net/2007/4/16/low-pro-0-4-released
// Replace out existing event observe code with Dean Edwards' addEvent
// http://dean.edwards.name/weblog/2005/10/add-event/
// => test optimisation here
/*
Object.extend(Event, {
  observe : function(el, type, func) {
    el = $(el);
    if (!func.$$guid) func.$$guid = Event._guid++;
  	if (!el.events) el.events = {};
  	var handlers = el.events[type];
  	if (!handlers) {
  		handlers = el.events[type] = {};
  		if (el["on" + type]) {
  			handlers[0] = el["on" + type];
  		}
  	}
  	handlers[func.$$guid] = func;
  	el["on" + type] = Event._handleEvent;
  	
  	 if (!Event.observers) Event.observers = [];
  	 Event.observers.push([el, type, func, false]);
	},
	stopObserving : function(el, type, func) {
	  el = $(el);
    if (el.events && el.events[type]) delete el.events[type][func.$$guid];
    
    for (var i = 0; i < Event.observers.length; i++) {
      if (Event.observers[i] &&
          Event.observers[i][0] == el && 
          Event.observers[i][1] == type && 
          Event.observers[i][2] == func) delete Event.observers[i];
    }
  },
  _handleEvent : function(e) {
    var returnValue = true;
    e = e || Event._fixEvent(window.event);
    var handlers = this.events[e.type], el = $(this);
    for (var i in handlers) {
    	el.$$handleEvent = handlers[i];
    	if (el.$$handleEvent(e) === false) returnValue = false;
    }
  	return returnValue;
  },
  _fixEvent : function(e) {
    e.preventDefault = Event._preventDefault;
    e.stopPropagation = Event._stopPropagation;
    return e;
  },
  _preventDefault : function() { this.returnValue = false },
  _stopPropagation : function() { this.cancelBubble = true },
  _guid : 1
});
*/

// a small version of the bindAsEventListener
Object.extend(Function.prototype, {
  	bindAsRealEventListener: function(object) {
    	var __method = this;
    	return function(event) {
      		return __method.apply(object, [event || window.event]);
    	}
  	},
  	bindContext: function(object) {
    	var __method = this;
    	return function() {
      		return __method.apply(object);
    	}
  	}
  	
  	/*  bind: function() {
    if (arguments.length < 2 && Object.isUndefined(arguments[0])) return this;
    var __method = this, args = $A(arguments), object = args.shift();
    return function() {
      return __method.apply(object, args.concat($A(arguments)));
    }
  },*/
}); 



/**
 * extend browser detection of prototype
 * adapted from here http://www.javascriptfr.com/codes/DETECTER-NAVIGATEUR_40950.aspx
 * */
var WZBrowser = {
	IE6: false,
	IE7: false,
	FIREFOX3: false,
	FIREFOX2: false, 
	FIREFOX: false, // firefox other than 2 and 3
	NETSCAPE9: false, 
	NETSCAPE7: false, 
	NETSCAPE: false, // netscape other than 7 and 9
	OPERA9: false, 
	OPERA: false, // opera other than 9
	CHROME: false,
	SAFARI: false,
	OTHER: false,  
	
	init: function() {
		var strChUserAgent = navigator.userAgent;
		var intSplitStart = strChUserAgent.indexOf("(",0);
		var intSplitEnd = strChUserAgent.indexOf(")",0);
		var strChStart = strChUserAgent.substring(0,intSplitStart);
		var strChMid = strChUserAgent.substring(intSplitStart, intSplitEnd);
		var strChEnd = strChUserAgent.substring(strChEnd);
		if(strChMid.indexOf("MSIE 7") != -1)
			WZBrowser.IE7 = true;
		else if(strChMid.indexOf("MSIE 6") != -1)
			WZBrowser.IE6 = true;
		else if(strChEnd.indexOf("Navigator/9") != -1)
			WZBrowser.NETSCAPE9 = true;
		else if(strChEnd.indexOf("Firefox/3") != -1) 
			WZBrowser.FIREFOX3 = true;
		else if(strChEnd.indexOf("Firefox/2") != -1)
			WZBrowser.FIREFOX2 = true;
		else if(strChEnd.indexOf("Firefox") != -1)
			WZBrowser.FIREFOX = true;
		else if(strChEnd.indexOf("Netscape/7") != -1)
			WZBrowser.NETSCAPE7 = true;
		else if(strChEnd.indexOf("Netscape") != -1)
			WZBrowser.NETSCAPE = true;
		else if(strChStart.indexOf("Opera/9") != -1)
			WZBrowser.OPERA9 = true;
		else if(strChStart.indexOf("Opera") != -1)
			WZBrowser.OPERA = true;
		else if(strChEnd.indexOf("Chrome") != -1)
			WZBrowser.CHROME = true;
		else if (strChEnd.indexOf("Safari") != -1)
			WZBrowser.SAFARI = true;
		else
			WZBrowser.OTHER = true;
	}
};

WZBrowser.init();

Object.extend(Prototype.Browser, WZBrowser);


function elementExists(id) {
	return null != document.getElementById(id);
}

function _$(element) {
  if (arguments.length > 1) {
    for (var i = 0, elements = [], length = arguments.length; i < length; i++)
      elements.push($(arguments[i]));
    return elements;
  }
  if (Object.isString(element))
    element = document.getElementById(element);
  return element;
}