/*
Copyright (c) 2008 Florian David:
Florian David | Project Creator | http://www.first-department-of-informatics.com | http://woozoo-project.org
   
Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

// if you put that line away, it will not work... don't know why
if (typeof console != "object" || !("firebug" in console)) {
	if (typeof firebug != "object") {
		// http://www.vinch.be/blog/2008/05/19/detecter-la-presence-de-firebug/
		// detail at http://getfirebug.com/console.html
		window.console = {
			count: 		function(){}, 	// Writes the number of times that the line of code where count was called was executed. The optional argument title will print a message in addition to the number of the count.
			profileEnd: function(){}, 	// Turns off the JavaScript profiler and prints its report.
			profile:	function(){}, 	// Turns on the JavaScript profiler. The optional argument title would contain the text to be printed in the header of the profile report.
			timeEnd:	function(){}, 	// Stops a timer created by a call to console.time(name) and writes the time elapsed.
			time:		function(){},	// Creates a new timer under the given name. Call console.timeEnd(name) with the same name to stop the timer and print the time elapsed..
			groupEnd:	function(){}, 	// Closes the most recently opened block created by a call to console.group.
			group:		function(){}, 	// Writes a message to the console and opens a nested block to indent all future messages sent to the console. 
			trace:		function(){}, 	// Prints an interactive stack trace of JavaScript execution at the point where it is called.
			dirxml:		function(){}, 	// Prints the XML source tree of an HTML or XML element. This looks identical to the view that you would see in the HTML tab. You can click on any node to inspect it in the HTML tab.
			dir:		function(){},	// Prints an interactive listing of all properties of the object. This looks identical to the view that you would see in the DOM tab.
			assert:		function(){}, 	// Tests that an expression is true. If not, it will write a message to the console and throw an exception.
			debug:		function(){}, 	// Writes a message to the console, including a hyperlink to the line where it was called.
			log:		function(){},
			info:		function(){}, 	// Writes a message to the console with the visual "info" icon and color coding and a hyperlink to the line where it was called.
			warn:		function(){}, 	// Writes a message to the console with the visual "warning" icon and color coding and a hyperlink to the line where it was called.
			error:		function(){} 	// Writes a message to the console with the visual "error" icon and color coding and a hyperlink to the line where it was called.
		};
	}
}

function trace(value) {
	Trace.writeMessage(value);
}

var Trace = Class.create({
	initialize: function() {}					 						 
});


Object.extend(Trace, {
	_isInitialized: false,
	_isDOMReady: false,
	_cache: "",
	_debug: null,
	_debugWay: null,
	_showTiming: false,
	_debugWin: null,
	
	
	DEBUG_POPUP: 'popup',
	DEBUG_CONSOLE: 'console',
	
	time: function(id) {
		if (Trace._initDebug() || Trace._showTiming) {
			switch(Trace._debugWay) {
				case Trace.DEBUG_POPUP:
					//Trace._writeInPopup(value);
					break;
				case Trace.DEBUG_CONSOLE:
					console.time(id);
					break;
			}		
		}
	},
	
	timeEnd: function(id) {
		if (Trace._initDebug() || Trace._showTiming) {
			switch(Trace._debugWay) {
				case Trace.DEBUG_POPUP:
					//Trace._writeInPopup(value);
					break;
				case Trace.DEBUG_CONSOLE:
					console.timeEnd(id);
					break;
			}		
		}
	},
	
	
	/**
	 *
	 * */
	writeMessage: function(value) {
		if (Trace._initDebug()) {
			switch(Trace._debugWay) {
				case Trace.DEBUG_POPUP:
					Trace._writeInPopup(value);
					break;
				case Trace.DEBUG_CONSOLE:
					console.info(value);
					break;
			}		
		}
	},
	
	/**
	 *
	 * */
	writeWarning: function(value) {
		if (Trace._initDebug()) {
			switch(Trace._debugWay) {
				case Trace.DEBUG_POPUP:
					Trace._writeInPopup('<strong style="color:#F58220">[WARNING] '+value+'</strong>');
					break;
				case Trace.DEBUG_CONSOLE:
					console.warn(value);
					break;
			}		
		}
	},
	
	/**
	 *
	 * */
	writeError: function(value) {
		if (Trace._initDebug()) {
			switch(Trace._debugWay) {
				case Trace.DEBUG_POPUP:
					Trace._writeInPopup('<strong style="color:#FF0000">[ERROR] '+value+'</strong>');
					break;
				case Trace.DEBUG_CONSOLE:
					console.error(value);
					break;
			}		
		}
	},
	
	/**
	 *
	 * */
	write: function(value) {
		Trace.writeMessage(value);
	},
	
	/**
	 *
	 * */
	_writeInPopup: function(value, insertBr) {
		if (insertBr == undefined) 
			insertBr = true;
		
		if (!Trace._isInitialized) {
			Trace._createDOM(value);
		}			
		if (Trace._isInitialized) {
			if (insertBr) 
				value = value+"<br>";
			if (!Trace._debugWin.document) {
				Trace._isDOMReady = false;
				Trace._isInitialized = false;
				Trace._createDOM(value);
			} else {
				try {	
					Trace._debugWin.document.getElementById('debug').innerHTML += value;
				} catch (e) {}	
			}	
		}
	},
	
	/**
	 *
	 * */
	_initDebug: function() {
		if (Trace._debug == null) {
			var confManager = ConfManager.getInstance();
			Trace._debugWay = confManager.get('debugWay');
			Trace._debug = confManager.get('debug');
			Trace._showTiming = confManager.get('showTiming');
		}
		return Trace._debug;
	},
	
	/**
	 *
	 * */
	_createDOM: function(value) {
		if (!Trace._isInitialized && !Trace._isDOMReady) {
			Trace._isDOMReady = true;
			Trace._debugWin = window.open(ConfManager.getInstance().get('fwkFolder')+'trace/debug.html', 'debug', "menubar=no, status=no, menubar=no, width=900, height=300");
			Event.observe(Trace._debugWin, 'load', function () {
				Event.observe(window, 'unload', function() { Trace._debugWin.close()}.bind(Trace));
				Trace._isInitialized = true;
				Trace._writeInPopup(Trace._cache, false);
				Trace._cache = "";
			}.bind(Trace));
		} else {
			Trace._cache = Trace._cache+value+"<br>";	
		}
	}		  
});