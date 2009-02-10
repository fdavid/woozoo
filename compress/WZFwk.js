/*
Copyright (c) 2008 Florian David:
Florian David | Project Creator | http://www.first-department-of-informatics.com
   
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
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
		if (Trace.W2() || Trace._showTiming) {
			switch(Trace._debugWay) {
				case Trace.DEBUG_POPUP:
					//Trace.W0(value);
					break;
				case Trace.DEBUG_CONSOLE:
					console.time(id);
					break;
			}		
		}
	},
	
	timeEnd: function(id) {
		if (Trace.W2() || Trace._showTiming) {
			switch(Trace._debugWay) {
				case Trace.DEBUG_POPUP:
					//Trace.W0(value);
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
		if (Trace.W2()) {
			switch(Trace._debugWay) {
				case Trace.DEBUG_POPUP:
					Trace.W0(value);
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
		if (Trace.W2()) {
			switch(Trace._debugWay) {
				case Trace.DEBUG_POPUP:
					Trace.W0('<strong style="color:#F58220">[WARNING] '+value+'</strong>');
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
		if (Trace.W2()) {
			switch(Trace._debugWay) {
				case Trace.DEBUG_POPUP:
					Trace.W0('<strong style="color:#FF0000">[ERROR] '+value+'</strong>');
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
	W0: function(value, insertBr) {
		if (insertBr == undefined) 
			insertBr = true;
		
		if (!Trace._isInitialized) {
			Trace.W1(value);
		}			
		if (Trace._isInitialized) {
			if (insertBr) 
				value = value+"<br>";
			if (!Trace._debugWin.document) {
				Trace._isDOMReady = false;
				Trace._isInitialized = false;
				Trace.W1(value);
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
	W2: function() {
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
	W1: function(value) {
		if (!Trace._isInitialized && !Trace._isDOMReady) {
			Trace._isDOMReady = true;
			Trace._debugWin = window.open(ConfManager.getInstance().get('fwkFolder')+'trace/debug.html', 'debug', "menubar=no, status=no, menubar=no, width=900, height=300");
			Event.observe(Trace._debugWin, 'load', function () {
				Event.observe(window, 'unload', function() { Trace._debugWin.close()}.bind(Trace));
				Trace._isInitialized = true;
				Trace.W0(Trace._cache, false);
				Trace._cache = "";
			}.bind(Trace));
		} else {
			Trace._cache = Trace._cache+value+"<br>";	
		}
	}		  
});

/*
Copyright (c) 2008 Florian David:
Florian David | Project Creator | http://www.first-department-of-informatics.com
   
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var ErrorUtil = Class.create({});

Object.extend(ErrorUtil, {
	get: function(error) {
		if (Prototype.Browser.IE) {
			return error.description;
		} else {
			var txt = error.message+' (line '+error.lineNumber+', file  '+error.fileName +')';
			if (error.stack) {
				txt += '<br><em style="text-decoration:underline">Stack strace :</em><br>'+error.stack.replace(/\n/g, "<br>");
			}
			return txt;
		}
	}
});

/*
Copyright (c) 2008 Florian David:
Florian David | Project Creator | http://www.first-department-of-informatics.com
   
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var BooleanUtil = Class.create({});

Object.extend(BooleanUtil, {
	toBoolean: function(str) {
		return (str == "true" || str == true) ? true : false;
	}
});

/*
Copyright (c) 2008 Florian David:
Florian David | Project Creator | http://www.first-department-of-informatics.com
   
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var ParsingUtil = Class.create({});

Object.extend(ParsingUtil, {
	parseXML: function(xml, key) {

		var data = $H({});

		var elements = ParsingUtil.W0(xml, key);
		for (var i = elements.length - 1; i >= 0; --i) {
			var item = elements[i];
			var lItem = item.attributes[0];
			var value = lItem.nodeValue;
			if (value == "true" || value == "false") {
				value = BooleanUtil.toBoolean(value);	
			}
			data.set(lItem.nodeName, value);
		} 
		return data;
	},
	W0: function(xml, name){
		var splitArray = name.split('.');
		var len = splitArray.length;
		if (len > 1){
			var xmlChild = xml.getElementsByTagName(splitArray[0])[0];
			var child = splitArray.slice(1, len).join('.');
			return ParsingUtil.W0(xmlChild, child);
		} else {
			return xml.getElementsByTagName(name);
		}	
	},
	parseTxt:function(txt) {
		var data = $H({});
		
		txt.split('\n').each(function(line, index) {
			var stripLine = line.strip();
			if (stripLine != "" && !stripLine.startsWith('//')) {
				var lineSplited = line.split('=');
				if (lineSplited.length >= 2) {
					var key = lineSplited[0].strip();
					var value = lineSplited.slice(1, lineSplited.length).join('=').strip();
					data.set(key, value);
				}
			}
		});
		return data;
	}
});

/*
Copyright (c) 2008 Florian David:
Florian David | Project Creator | http://www.first-department-of-informatics.com
   
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var BindingUtil = Class.create({});

Object.extend(BindingUtil, {

	bindingSetHash: {value: 'setValue(%s)', 	style: 'setStyle(%s)', 	innerHTML: 'update(%s)'	},
	bindingGetHash: {value: 'getValue()', 		style: 'getStyles()', 	innerHTML:'innerHTML'	},
	
	// to optimize
	getSuffix: null,
	setSuffix: null,
	
	
	
	/**
	 *
	 * */
	bind: function(ids, attributes, propertie, modelInstance, hasGetter, hasSetter, initPropertie, optionals) {
		
		if (FunctionUtil.hasEmptyValue(arguments)) {
			return false;	
		}
		
		if (BindingUtil.getSuffix == null) {
			var confManager = ConfManager.getInstance();
			BindingUtil.getSuffix = confManager.get('getSuffix');
			BindingUtil.setSuffix = confManager.get('setSuffix');
		}
		
		var go = true;
		for (var index = 0, idsLen = ids.length; index < idsLen; index++) { 
			var id = ids[index];
			
			if (elementExists(id) == false) {
				if (optionals[index] == false) {
				} else {
				}
				ids.splice(index, 1);
				attributes.splice(index, 1);
				optionals.splice(index, 1);
			}
		}
		if (ids.length == 0) return false;
		
		
		
		if (hasGetter) {
			if (initPropertie) {
				var attrGet = BindingUtil.W0(attributes[0], 'get');
		
				// for the propertie
				
				try {
					// WARNING : the initialize value of the propertie is set to first id value
					if (attrGet == attributes[0]) {
						modelInstance["____"+propertie] = _$(ids[0])[attrGet];
					} else {
						var split = attrGet.replace(")", "").split("(");
						modelInstance["____"+propertie] = $(ids[0])[split[0]](split[1]);;
					}
				} catch (error) {
				}
			} else {
				modelInstance["____"+propertie] = undefined;
			}	
		
			// for the getter
			try {
				modelInstance[BindingUtil.getSuffix + propertie] = 	function() {
																		return 	modelInstance["____"+propertie];		
																	}			
			} catch (error) {
			}
		}
		
		if (hasSetter) {
			//for the setter
			try {
				var setterFunction = 	function(value) {
											if (hasGetter) {
												modelInstance["____"+propertie] = value;
											}
											
											ids.each(function(id, index) {
												var element = $(id);				
												var attrSet = BindingUtil.W0(attributes[index], 'set');
												var attrGet = BindingUtil.W0(attributes[index], 'get');
												if (attrGet != attributes[index]) {
													var attrGetArray = attrGet.replace(")", "").split("(");
													var compareValue = element[attrGetArray[0]](attrGetArray[1]);
												} else {
													var compareValue =  element[attrGet];
												}
												// compare the new value and the one already in place
												if (value != compareValue) {
													if (attrSet == attributes[index]) {
														element[attrSet] = value; //modelInstance["____"+propertie]; 									
													} else {
														var split = attrSet.replace(")", "").split("(");
														element[split[0]](split[1].replace('%s', value/*modelInstance["____"+propertie]*/));
													}
												}
											});
										};
										
				modelInstance[BindingUtil.setSuffix + propertie] = setterFunction;
			} catch (error) {
			}
		}	
		return true;
	},
	
	/**
	 *
	 * */
	bindListener: function(id, event, handler, controllerInstance, optional) {
		if (FunctionUtil.hasEmptyValue(arguments)) {
			return false;	
		}
		
		if (!elementExists(id)) {
			if (optional == false) {
			} else {
			}
			return false;
		}
		if (!controllerInstance[handler]) {
			return false;
		}

		Event.observe.defer(id, event, controllerInstance[handler].bindAsRealEventListener(controllerInstance));
		
		return true;
	},
	
	/**
	 *
	 * */
	bindLang: function(id, attribute, propertie) {
		if (FunctionUtil.hasEmptyValue(arguments)) {
			Trace.writeError('M8_007');//BindingUtil::bindLang
			return false;	
		}
		if (!$(id)) {
			return false;
		}
		
		var attr = BindingUtil.W0(attribute);
		var f = '';
		
		if (attr == attribute) {
			// has to replace that	
			f = "$('"+id+"')."+attr+" = LangManager.getInstance().get('"+propertie+"')";
		} else {
			// has to replace that	
			f = "$('"+id+"')."+attr.replace('%s', "LangManager.getInstance().get('"+propertie+"')");
		}
		
		try {
			eval(f);
		} catch (error) {
		}
		return true;
	}, 
	
	/**
	 *
	 * */
	W0: function(name, setOrGet) {
		var attr, split = [];
		if (setOrGet == 'set') {
			attr = this.bindingSetHash[name];
			// try to resolve style
			if (attr == undefined) {
				// style
				split = name.split(':');	
				if (split[0] == 'style') {
					attr = 'setStyle('+split[1]+':%s)';
				}
			}
		} else {
			attr = this.bindingGetHash[name];
			// try to resolve style
			
			if (attr == undefined) {
				split = name.split(':');	
				if (split[0] == 'style') {
					attr = 'getStyle('+split[1]+')';
				}
			}
		}
		
		if(attr == undefined) {
			attr = name;	
		}
		return attr;
	}
});


/*
Copyright (c) 2008 Florian David:
Florian David | Project Creator | http://www.first-department-of-informatics.com
   
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var FunctionUtil = Class.create({});

Object.extend(FunctionUtil, {
	hasEmptyValue: function(args) {
		//args = Array.prototype.slice.call(args);
		for (var i = args.length - 1; i >= 0; --i) {
			if (args[i] === "") {
				return true;
			}
		}
		return false;
		/*
		//var bool = false;
		$A(args).each(function(value) {
			if (value === "") {
				bool = true;
				throw $break;		
			}
		});
		return bool;
		*/
	}
});

/*
Copyright (c) 2008 Florian David:
Florian David | Project Creator | http://www.first-department-of-informatics.com
   
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var SingletonUtil = Class.create({});

Object.extend(SingletonUtil, {
	execute: function(object, runningMethod, runningMethodArgs) {
		try {
			Object.extend(object, {
				instance: null,
				
				getInstance: function() {
					if (object.instance == null) {
						object.instance = new object();
						if (runningMethod != undefined && runningMethod != "") {
							// this the is for our friendly friend IE 
							runningMethodArgs = (runningMethodArgs != undefined) ? runningMethodArgs : [];
							Function.prototype.apply.call(object.instance[runningMethod], object.instance, runningMethodArgs);
						}
					}
					return object.instance;
				}
			});
		} catch (error) {
		}
	}
});



/*
Copyright (c) 2008 Florian David:
Florian David | Project Creator | http://www.first-department-of-informatics.com
   
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var MultitonUtil = Class.create({});

Object.extend(MultitonUtil, {
	execute: function(object, runningMethod, runningMethodArgs) {

		try {
			Object.extend(object, {
				instances: [],
				
				getInstance: function(key) {
					if (object.instances[key] == null) {
						object.instances[key] = new object();
					}
					return object.instances[key];
				}
			});
		} catch (error) {
		}
	}
});


/*
Copyright (c) 2008 Florian David:
Florian David | Project Creator | http://www.first-department-of-informatics.com
   
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var UrlUtil = Class.create({});

Object.extend(UrlUtil, {
	isAbsolute: function(url) {
		var sub = url.substr(0, 7);
		if (sub == 'http://') 
			return true;
		return false;	
	},
	
	makeAbsolute: function(url, baseUrl) {
		if (UrlUtil.isAbsolute(url)) 
			return url;
		return baseUrl+url;
	}
});

/*
Copyright (c) 2008 Florian David:
Florian David | Project Creator | http://www.first-department-of-informatics.com
   
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var ItemUtil = Class.create({});

Object.extend(ItemUtil, {
	getAttribute: function(item, propertie) {
		var t;
		if (t = item[propertie]) {
			return t;
		} else if (item.hasOwnProperty('getAttribute') && item.getAttribute(propertie)) {
			return item.getAttribute(propertie);
		} 
		return undefined;
	}
});

/*
Copyright (c) 2008 Florian David:
Florian David | Project Creator | http://www.first-department-of-informatics.com
   
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var ModuleManager = Class.create({

	/*************************************************/
	/**					CONSTRUCTOR					**/
	/*************************************************/
	
	/**
	 *
	 * */
	initialize: function() {
		this.Z5 = [];
		this.Z4 = [];
		this.Z6 = false;
		this.Z3 = [];
		this.Z0 = null;
		this.Z1 = null;
		
		var debugBinding = ConfManager.getInstance().get('debugBinding');
		this.Z2 = (debugBinding == undefined) ? false : debugBinding;
	},
	
	/*************************************************/
	/**						PUBLIC					**/
	/*************************************************/
	
	/**
	 *
	 * */
	bindFile: function(properties) {
		this.Z5.push(properties);

		if (this.Z6 == false) {
			this.Z6 = true;
			this.W17();
		} 
	},
	
	/**
	 *
	 * */
	executeLangBindings: function() {
		this.Z3.each(function(item) {
			BindingUtil.bindLang(item.id, item.attribute, item.propertie);
		});//.bind(this));
	},
	
	/**
	 *
	 * */
	updateModule: function(properties) {
		this.Z4.push(properties);
		if (!this.Z6) {
			this.Z6 = true;
			this.W14();
		}	
	}, 
	
	/*************************************************/
	/**					PRIVATE						**/
	/*************************************************/

	/**
	 *
	 * */
	W14: function() {
		this.Z1 = this.Z4.shift();
		this.Z1.set('stopMultitonNum', this.W10(this.Z1.get('startMultitonNum')));
		
		this.W8();
		
		this.W1();
		this.W3();
		
		this.W15();
	},

	/**
	 *
	 * */
	W17: function() {
		this.Z1 = this.Z5.shift();
		this.W13();
	},
	
	/**
	 *
	 * */
	W16: function() {
		document.observe(HelperLoaderManager.HELPER_READY_EVENT, this.W2.bindAsEventListener(this));
		document.observe(ModuleManager.LOAD_READY_EVENT, this.W6.bindAsEventListener(this));
	},
	
	/**
	 *
	 * */
	W6: function(event) {
		this.W9();
	},
	
	/**
	 *
	 * */
	W9: function() {
		var res = this.W11();
		if (!res) {
			this.W12();
		} else {
			this.Z0 = this.W0.bindAsEventListener(this);
			document.observe(PluginManager.READY_EVENT, this.Z0);
		}
	},
	
	W0: function(event) {
		this.W12();
		document.stopObserving(PluginManager.READY_EVENT, this.Z0);
		this.Z0 = null;
	},
	
	W12: function() {
		var mp = 				this.Z1;
		
		// 1
		Trace.time('getClass : '+mp.get('id'));
		var classController =  	window[mp.get('controllerHelper')];
		var classModel = 		window[mp.get('modelHelper')];
		
		if (classController == undefined || classModel == undefined) {
			return false;
		}
		
		this.Z1.set('modelHelperClass', classModel);
		this.Z1.set('controllerHelperClass', classController);
		Trace.timeEnd('getClass : '+mp.get('id'));
		
		// 2
		Trace.time('initTon : '+mp.get('id'));
		var type = mp.get('type');
		switch(type) {
			case ModuleManager.MODULE_SIMPLE:
				SingletonUtil.execute(classModel);
				SingletonUtil.execute(classController);
			break;
			case ModuleManager.MODULE_MULTIPLE:
				MultitonUtil.execute(classModel);
				MultitonUtil.execute(classController);
			break;
			default:
				return false;
				break;
		}
		Trace.timeEnd('initTon : '+mp.get('id'));
		
		// 3
		Trace.time('initInstances : '+mp.get('id'));
		this.W8();
		Trace.timeEnd('initInstances : '+mp.get('id'));
		
		if (mp.get('executeBindings') == true) {
			// 4
			Trace.time('bindListener : '+mp.get('id'));
			this.W1();
			Trace.timeEnd('bindListener : '+mp.get('id'));
			
			// 5
			Trace.time('bind : '+mp.get('id'));
			this.W3();
			Trace.timeEnd('bind : '+mp.get('id'));
		} else {
		}
		this.W15();
		
		return true;
	},
	
	W8: function() {
		var mp = 					this.Z1;
		var modelClass = 			mp.get('modelHelperClass');
		var controllerClass = 		mp.get('controllerHelperClass');
		var stopMultitonNum = 		mp.get('stopMultitonNum'); 
		var startMultitonNum = 		mp.get('startMultitonNum');
		
		var instancesController = 	mp.get('controllerHelperInstances');
		var instancesModel = 		mp.get('modelHelperInstances');
		
		for (var i = startMultitonNum; i <= stopMultitonNum; ++i) {
			instancesController[i] = 	controllerClass.getInstance(i);
			instancesModel[i] = 		modelClass.getInstance(i);
		}
		
		this.Z1.set('modelHelperInstances', instancesModel);
		this.Z1.set('controllerHelperInstances', instancesController);
		return true;
	},
	
	/**
	 *
	 * */
	W13: function () {
		var booleanUtil_toBoolean_function = BooleanUtil.toBoolean;
		var itemUtil_getAttribute_function = ItemUtil.getAttribute;
		
		var conf = window[this.Z1.get('id')+'Properties'];
		if (!conf) {
			conf = 	this.Z1.get('confXml').getElementsByTagName('conf')[0];		
		}
		
		var model = 				itemUtil_getAttribute_function(conf, 'model');
		var controller = 			itemUtil_getAttribute_function(conf, 'controller');
		
		if (model == null || controller == null) {
			Trace.writeError('M3_011');//'ModuleManager.W13()');
			return false;
		}
		
		var view = 					itemUtil_getAttribute_function(conf, 'view');
		var addViewInId = 			itemUtil_getAttribute_function(conf, 'addViewInId');
		var dynamicLoad = 			booleanUtil_toBoolean_function(itemUtil_getAttribute_function(conf, 'dynamicLoad'));
		var folder = 				itemUtil_getAttribute_function(conf, 'folder');
		var compressed =			booleanUtil_toBoolean_function(itemUtil_getAttribute_function(conf, 'compressed'));
		var version = 				itemUtil_getAttribute_function(conf, 'version') ? itemUtil_getAttribute_function(conf, 'version') : ModuleManager.MODULE_DEFAULT_VERSION;
		var type = 					itemUtil_getAttribute_function(conf, 'type') ? itemUtil_getAttribute_function(conf, 'type') : ModuleManager.MODULE_SIMPLE;
		var startMultitonNum =		1;	
		// we also could imagine to find an id in the DOM with the total count that could in this case be dynamic :P
		if (type == ModuleManager.MODULE_MULTIPLE) {
			var stopMultitonNum = itemUtil_getAttribute_function(conf, 'count') ? itemUtil_getAttribute_function(conf, 'count') : this.W10(startMultitonNum);
		} else {
			var stopMultitonNum = startMultitonNum;
		}	


		if (ConfManager.getInstance().get('addBaseUrl')) {
			folder = UrlUtil.makeAbsolute(folder, ConfManager.getInstance().get('baseUrl'));
		}
		this.Z1.update($H({
											modelHelper: 				model, 
											controllerHelper: 			controller, 
											view: 						view, 
											addViewInId: 				addViewInId, 
											dynamicLoad: 				dynamicLoad, 
											folder: 					folder, 
											compressed: 				compressed, 
											version: 					version, 
											type: 						type, 
											controllerHelperInstances:	[],
											modelHelperInstances:		[],
											startMultitonNum: 			startMultitonNum,
											stopMultitonNum: 			stopMultitonNum
											}));	

		if (!dynamicLoad) {
			document.fire(ModuleManager.LOAD_READY_EVENT);
		} else {
			HelperLoaderManager.getInstance().loadHelpers(this.Z1);	
		}
		return true;
	},
	
	/**
	 *
	 * */
	W2: function(event) {
		document.fire(ModuleManager.LOAD_READY_EVENT);
	},
	
	/**
	 *
	W3: function() {
		var mp = 					this.Z1;
		var start = 				mp.get('startMultitonNum');
		var stop = 					mp.get('stopMultitonNum');
		var modelHelperInstances = 	mp.get('modelHelperInstances');
		var type = 					mp.get('type');
		
		var binds = mp.get('confXml').getElementsByTagName('bind');
		
		// START optimization on calling
		var bindingUtil_bind_function = BindingUtil.bind;
		var bindingUtil_bindLang_function = BindingUtil.bindLang;
		var booleanUtil_toBoolean_function = BooleanUtil.toBoolean;
		var debug = this.Z2;
		// END optimization on calling
		
		
			

		
		for (var j = binds.length-1; j >= 0 ; --j) {
			var bind = binds[j];
			
			var tempId =		bind.getAttribute('id');	
			var attribute =	 	bind.getAttribute('attribute');
			var style = 		bind.getAttribute('style');
			var propertie = 	bind.getAttribute('propertie');
			var langPropertie = bind.getAttribute('langPropertie');
			var hasGetter = 	(bind.getAttribute('writeOnly') == undefined) ? true : false;
			var hasSetter = 	(bind.getAttribute('readOnly') == undefined) ? true : false;
			var initPropertie = bind.getAttribute('initPropertie');
			var optional = 		(bind.getAttribute('optional') == undefined) ? false : true;
			
			if (initPropertie == undefined) {
				initPropertie = true;	
			} else {
				initPropertie = booleanUtil_toBoolean_function('initPropertie');
			}
			
			for (var i = start; i <= stop; ++i) {
				var id = 			this.getBindId(tempId, i, type);
				var propertieList = [];
				var data = [];
			
				// this is a binding for lang
				if (langPropertie != null) {
					
					// keep this line for debug (slow down the execution) 
					if (debug) {
					}
					bindingUtil_bindLang_function(id, attribute, langPropertie);
					this.Z3.push({id: id, attribute: attribute, propertie: langPropertie});
				
				// this is a binding on one of the model propertie
				} else {
					propertie = this.W5(propertie, tempId, attribute, type);
					
					// we do that in case of bindings are applyed to the same propertie
					if (data[propertie] == undefined) {
						data[propertie] = [];
						data[propertie]['ids'] = [];
						data[propertie]['attributes'] = [];
						// TODO : Should be an array
						data[propertie]['hasGetter'] = true;
						// TODO : Should be an array
						data[propertie]['hasSetter'] = true;
						// TODO : Should be an array
						data[propertie]['initPropertie'] = true;
						// TODO : Should be an array
						data[propertie]['optional'] = [];
						
						propertieList.push(propertie);
					}
					data[propertie]['ids'].push(id);
					
					if (attribute != null) {
						data[propertie]['attributes'].push(attribute);

						if (debug) {
						}
					} else {
						data[propertie]['attributes'].push("style:"+style);
						
						if (debug) {
						}
					}
					// TODO : Should be an array
					data[propertie]['hasGetter'] = hasGetter;
					// TODO : Should be an array
					data[propertie]['hasSetter'] = hasSetter;
					// TODO : Should be an array
					data[propertie]['initPropertie'] = initPropertie;
				
					data[propertie]['optional'].push(optional);
				}
				for (var k = 0, propertieListLen = propertieList.length; k < propertieListLen; ++k) {
					var key = propertieList[k];
					var value = data[key];
					bindingUtil_bind_function(value['ids'], value['attributes'], key, modelHelperInstances[i], value['hasGetter'], value['hasSetter'], value['initPropertie'], value['optional']);
				}
			}
			
		}
	},
	 * */

	/**
	 *
	 * */
	W3: function() {
		var mp = 					this.Z1;
		var start = 				mp.get('startMultitonNum');
		var stop = 					mp.get('stopMultitonNum');
		var modelHelperInstances = 	mp.get('modelHelperInstances');
		var type = 					mp.get('type');
		
		var prop = window[this.Z1.get('id')+'Properties'];
		if (!prop) {
			var binds = mp.get('confXml').getElementsByTagName('bind');
		} else {
			var binds = prop.bind;
		}
		var bindsLen = binds.length;
		
		// START optimization on calling
		var bindingUtil_bind_function = BindingUtil.bind;
		var bindingUtil_bindLang_function = BindingUtil.bindLang;
		var itemUtil_getAttribute_function = ItemUtil.getAttribute;
		// END optimization on calling
		
		for (var i = start; i <= stop; i++) {
			
			var modelHelperInstance = modelHelperInstances[i];
			var propertieList = [];
			var data = [];
			
			for (var j = 0; j < bindsLen; j++) {
				var bind = binds[j];
				
				var id = 			this.getBindId(itemUtil_getAttribute_function(bind, 'id'), i, type);
				var attribute =	 	itemUtil_getAttribute_function(bind, 'attribute');
				var style = 		itemUtil_getAttribute_function(bind, 'style');
				var propertie = 	itemUtil_getAttribute_function(bind, 'propertie');
				var langPropertie = itemUtil_getAttribute_function(bind, 'langPropertie');
				var hasGetter = 	(itemUtil_getAttribute_function(bind, 'writeOnly') == undefined) ? true : false;
				var hasSetter = 	(itemUtil_getAttribute_function(bind, 'readOnly') == undefined) ? true : false;
				var initPropertie = itemUtil_getAttribute_function(bind, 'initPropertie');
				var optional = 		(itemUtil_getAttribute_function(bind, 'optional') == undefined) ? false : true;				
				
				if (initPropertie == undefined) {
					initPropertie = true;	
				} else {
					initPropertie = BooleanUtil.toBoolean('initPropertie');
				}
				
				// this is a binding for lang
				if (langPropertie != null) {
					
					// keep this line for debug (slow down the execution) 
					
					bindingUtil_bindLang_function(id, attribute, langPropertie);
					this.Z3.push({id: id, attribute: attribute, propertie: langPropertie});
				
				// this is a binding on one of the model propertie
				} else {
					// auto set name
					if (propertie == '' || propertie == null) {
						propertie = id+'-'+attribute; // myId-value
						propertie = propertie.camelize(); // myIdValue
					}
					
					// we do that in case of bindings are applyed to the same propertie
					if (data[propertie] == undefined) {
						data[propertie] = [];
						data[propertie]['ids'] = [];
						data[propertie]['attributes'] = [];
						// TODO : Should be an array
						data[propertie]['hasGetter'] = true;
						// TODO : Should be an array
						data[propertie]['hasSetter'] = true;
						// TODO : Should be an array
						data[propertie]['initPropertie'] = true;
						// TODO : Should be an array
						data[propertie]['optional'] = [];
						
						propertieList.push(propertie);
					}
					data[propertie]['ids'].push(id);
					
					if (attribute != null) {
						data[propertie]['attributes'].push(attribute);
					} else {
						data[propertie]['attributes'].push("style:"+style);
					}
					// TODO : Should be an array
					data[propertie]['hasGetter'] = hasGetter;
					// TODO : Should be an array
					data[propertie]['hasSetter'] = hasSetter;
					// TODO : Should be an array
					data[propertie]['initPropertie'] = initPropertie;
				
					data[propertie]['optional'].push(optional);
				}
			}
			/*for (key in data) {
				var value = data[key];
				if (value['ids']) {
					bindingUtil_bind_function(value['ids'], value['attributes'], key, modelHelperInstances[i], value['hasGetter'], value['hasSetter'], value['initPropertie'], value['optional']);
				}	
			}*/
			
			for (var k = 0, propertieListLen = propertieList.length; k < propertieListLen; k++) {
				var key = propertieList[k];
				var value = data[key];
				bindingUtil_bind_function(value['ids'], value['attributes'], key, modelHelperInstance, value['hasGetter'], value['hasSetter'], value['initPropertie'], value['optional']);
			}

		}
	},
	
	W11: function() {
		var wait = false;
		var prop = window[this.Z1.get('id')+'Properties'];
		var itemUtil_getAttribute_function = ItemUtil.getAttribute;
		
		if (!prop) {
			var plugins = this.Z1.get('confXml').getElementsByTagName('plugin');
		} else {
			var plugins = prop.plugin;
		}
		for (var i = 0, len = plugins.length; i < len; i++) {
			var res = itemUtil_getAttribute_function(plugins[i], 'id');
			if (PluginManager.getInstance().apply(res)) {
				wait = true;
			}
		}
		return wait;
	},
	
	/**
	 *
	 * */
	W1: function() {
		var mp = this.Z1;
		
		var start = 						mp.get('startMultitonNum');
		var stop = 							mp.get('stopMultitonNum');
		var controllerHelperInstances = 	mp.get('controllerHelperInstances');
		var type = 							mp.get('type');
		
		var prop = window[this.Z1.get('id')+'Properties'];
		if (!prop) {
			var listeners = mp.get('confXml').getElementsByTagName('bindAsListener');
		}else {
			var listeners = prop.bindListener;
		}
		
		// START optimization on calling
		var bindingUtil_bindListener_function = BindingUtil.bindListener;
		var itemUtil_getAttribute_function = ItemUtil.getAttribute;
		var debug = this.Z2;
		// END optimization on calling
			
		for (var j = listeners.length-1; j >= 0 ; --j) {
			var bind = listeners[j];
			
			var tempId = 	itemUtil_getAttribute_function(bind, 'id');
			var event = 	itemUtil_getAttribute_function(bind, 'event');
			var handler = 	this.W7(itemUtil_getAttribute_function(bind, 'handler'), event, tempId, type);		
			var optional = 	(itemUtil_getAttribute_function(bind, 'optional') == undefined) ? false : true;

			for (var i = start; i <= stop; ++i) {
				var id = 		this.getBindId(tempId, i, type);
				bindingUtil_bindListener_function(id, event, handler, controllerHelperInstances[i], optional);
			}
		}		
	},
	
	/**
	 *
	 * */
	W10: function(start) {
		var itemUtil_getAttribute_function = ItemUtil.getAttribute;
	
		var prop = window[this.Z1.get('id')+'Properties'];
		
		if (!prop) {
			var confXml = this.Z1.get('confXml');
			// we look for bind
			var list = confXml.getElementsByTagName('bind');
			// if not found, look for bindAsListener
			if (list.length == 0) {
				list = confXml.getElementsByTagName('bindAsListener');
			}
		} else {
			var list = prop.bind;
			if (list.length == 0) {
				list = prop.bindAsListener;
			}
		}
		
		if (list.length > 0) {
			var name = itemUtil_getAttribute_function(list[0], 'id');
			
			if (!name.include('[]')) {
				Trace.writeWarning('ModuleManager::W10 : '+name+' do not contains the string [], stop execution');				
				return 0;
			}
			while(elementExists(name.replace('[]', start))) {
				start++;
			}
			return (start-1);
		} else {
			return start;
		}
	},
	
	getBindId: function(id, counter, type) {
		switch (type) {
			case ModuleManager.MODULE_SIMPLE:
				return id;
			case ModuleManager.MODULE_MULTIPLE:
				return id.replace('[]', counter);
			default:
				break;
		}
		return null;
	},
	
	W7: function(handler, event, id, type) {
		// auto set name
		if (handler == '' || handler == null) {
			if (type == ModuleManager.MODULE_MULTIPLE) {
				handler = (id.replace('[]', ''))+'-'+event+'-handler'; // myId-click-handler
			} else {
				handler = id+'-'+event+'-handler'; // myId-click-handler
			}
			handler = handler.camelize(); // myIdClickHandler
		}
		return handler;
	},
	
	W5: function(propertie, id, attribute, type) {
		if (propertie == '' || propertie == null) {
			if (type == ModuleManager.MODULE_MULTIPLE) {
			 	propertie = (id.replace('[]', ''))+'-'+attribute; // myId-value
			} else {
			 	propertie = id+'-'+attribute; // myId-value
			}
			propertie = propertie.camelize(); // myIdValue
		}
		return propertie;
	},
	
	/**
	 *
	 * */
	W15: function() {
		
		document.fire(ModuleManager.BIND_READY_EVENT, this.Z1);	
		
		if (this.Z5.length > 0) {
			this.W17();
		} else if (this.Z4.length > 0) {
			this.W14();		
		} else {
			this.Z6 = false;
		}
	}
});
	
/**
 * Static property
 * */
Object.extend(ModuleManager, {	

	BIND_READY_EVENT: "bind:ready",
	LOAD_READY_EVENT: "bind:loadReady",
	
	MODULE_SIMPLE: "simple",
	MODULE_MULTIPLE: "multiple",
	
	MODULE_DEFAULT_VERSION: new Date().getTime()
});

/**
 * Singleton
 * */
SingletonUtil.execute(ModuleManager, "W16");


/*
Copyright (c) 2008 Florian David:
Florian David | Project Creator | http://www.first-department-of-informatics.com
   
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var ConfManager = Class.create({

	/*************************************************/
	/**					CONSTRUCTOR					**/
	/*************************************************/
	
	/**
	 * Constructor
	 * */
	initialize: function() {
		this.Z6 = ""; // the name of the config file
		this.Z5 = $H({}); // the framework configuration data which are on the config file
		this.Z1 = $H({}); // the application configuuration data that are on the config file (these are you data)
		this.Z3 = false; // is the ConfManager ready
		this.Z2 = $w('version fwkFolder mvcFile'); // the key required to use the framework
		// default value if some data are undefined
		this.Z0 = 	{
									debug: false, 
									debugFwk: false, 
									debugUrl: false, 
									debugLaunchMethod:false, 
									checkUrl:false, 
									useUrl: false, 
									useLang: false, 
									compressedName:'compressed', 
									getSuffix:'get_', 
									setSuffix:'set_',
									useDynCompression: false,
									usePacker: false,
									useCache: false
									};
		this.Z4 = $w('fwkFolder mvcFile pluginFolder langFolder dynCompressionUrl'); // key that contains url as value
	},
	
	/*************************************************/
	/**						PUBLIC					**/
	/*************************************************/
	
	/**
	 * This is the init method
	 *
	 * @arguments[0] file (string) : where is the configuration file
	 * @arguments[1] options (object) : some configuration data you prefer to pass via the object instead of the configuration file
	 * @arguments[1] applicationOptions (object) : some application data you prefer to pass via the object instead of the configuration file
	 *
	 * @return void
	 * */
	init: function(file, options, applicationOptions) {

		if (file == undefined || file == "" || file == null) {
			alert("You have to specify a conf file for the framework");
		}
		if (options != undefined && options != "" && options != null) {
			this.Z5 = $H(options);
		}
		if (applicationOptions != undefined && applicationOptions != "" && applicationOptions != null) {
			this.Z1 = $H(applicationOptions);
		}
		
		this.Z6 = file;
		this.W6();		
	},
	
	/**
	 * Getter function to know if the ConfManager id ready
	 *
	 * @return (boolean) : Am I ready ?
	 * */
	isReady: function() {
		return this.Z3;
	},	
	
	/**
	 * Getter function that get back a framework configuration data from a key
	 * This method is mostly used by the framwork himself
	 *
	 * @arguments[0] name (string) : the key of the data
	 *	
	 * @return (string) : the value of the data
	 * */
	get: function(name) {
		return this.W8(name, this.Z5);
	},
	
	/**
	 *
	 * */
	getApplicationData: function(name) {
		return this.W8(name, this.Z1);
	},
	
	/*************************************************/
	/**					PRIVATE						**/
	/*************************************************/
	
	/**
	 *
	 * */
	W8: function(name, hash, force){
		if (force == undefined) force = false;
		if (hash == undefined) return undefined;
		
		if (this.Z3 || force) {
			var value = hash.get(name);
			if (value == undefined) {
			} 
			return value;
		}
		return undefined;
	},
	
	/**
	 *
	 * */
	W6: function() {

		new Ajax.Request(this.Z6+'?v='+new Date().getTime(), {
		  	method: 'get',
		  	onSuccess: this.W1.bindAsEventListener(this),
			onFailure: this.W3.bindAsEventListener(this),
			evalJS: false,
			evalJSON: false,
			sanitizeJSON: false
		});
		
	},
	
	/**
	 *
	 * */
	W1: function(transport) {

		var data = ParsingUtil.parseXML(transport.responseXML, 'framework.item').toObject();
		this.Z5.update(data);
		
		var applicationData = ParsingUtil.parseXML(transport.responseXML, 'application.item').toObject();
		this.Z1.update(applicationData);
		
		if (!this.W2()) {
			return;
		} 
		this.W0();
		this.W4();
		this.W5(); 
	},
	
	/**
	 *
	 * */
	W2: function() {
		var bool = true;
		this.Z2.each(function(value) {
			if (this.W8(value, this.Z5, true) == undefined) {
				bool = false;
				throw $break;
			}
		}.bind(this));
		return bool;
	},
	
	/**
	 *
	 * */
	W0: function() {
		var defaultPair = this.Z0;
		for (var key in defaultPair) {
			if (this.Z5.get(key) == undefined) {
				this.Z5.set(key, defaultPair[key]);
			}
		}
		
		
		/*
		this.Z0.each(function(pair) {
			if (this.Z5.get(key) == undefined) {
				this.Z5.set(key, this.Z0.get(key));
			}
		}.bind(this));
		*/
	},
	
	/**
	 * 
	 * */
	W4: function() {
		if (this.Z5.get('addBaseUrl')) {
			var urls = this.Z4;
			var baseUrl = this.Z5.get('baseUrl');
			
			var urlUtil_makeAbsolute_function = UrlUtil.makeAbsolute;
			
			for (var i = urls.length-1; i >= 0; --i) {
				var url = urls[i]; 
				var value = this.Z5.get(url);
				if (value != undefined) {
					this.Z5.set(url, urlUtil_makeAbsolute_function(value, baseUrl));
				}
			}
			/*this.Z4.each(function(value) {
				if (this.Z5.get(value) != undefined) {
					this.Z5.set(value, UrlUtil.makeAbsolute(this.Z5.get(value), this.Z5.get('baseUrl')));
				}
			}.bind(this));
			*/
		}
	},
	
	/**
	 *
	 * */
	W3: function(transport) {
		alert('conf file ['+this.Z6+'] was not loaded : '+transport.status);
	},
	
	/**
	 *
	 * */
	W5: function() {

		this.Z3 = true;
		// IE is some time to busy to fire the event, so we let him some time to breathe...
		if (Prototype.Browser.IE) {
			this.W7.bind(this).defer();
		} else {
			this.W7();
		}
	},
	
	/**
	 *
	 * */
	W7: function() {
		document.fire(ConfManager.CONF_READY_EVENT);
	}
});
	
/**
 * Static property
 * */
Object.extend(ConfManager, {
	CONF_READY_EVENT : 'confEvent:ready'
});

/**
 * Singleton
 * */
SingletonUtil.execute(ConfManager);


/*
Copyright (c) 2008 Florian David:
Florian David | Project Creator | http://www.first-department-of-informatics.com
   
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var LangManager = Class.create({

	/*************************************************/
	/**					CONSTRUCTOR					**/
	/*************************************************/
	
	/**
	 *
	 * */
	initialize: function() {
		this.Z4 = true;

		this.Z5 = "";
		this.Z6 = $H({}); 
		this.Z3 = [];

		this.Z7 = "";
		
		var confManager = ConfManager.getInstance();
		this.Z2 = 	confManager.get('defaultLang');
		this.Z1 = 	confManager.get('langFileExtension');
		this.Z0 = 	confManager.get('langParseMethod');
	},
	
	/*************************************************/
	/**						PUBLIC					**/
	/*************************************************/
	
	/**
	 *
	 * */
	add: function(key, value, lang) {
		// correct the lang, try to find it in the conf file or use the LangManager constant
		if (lang == undefined) {
			lang =  this.Z2 ? this.Z2 : LangManager.DEFAULT_LANG;
		}
		// create the array in case it is the first time we want to insert something on it
		if (this.Z3[lang] == undefined) {
			this.Z3[lang] = $H({});
		}
		// set the lang of the LangManager, will be ovveriden later in case the langFile is set
		if (this.Z7 == "") {
			this.Z7 = lang;
		}
		// add the data to the array
		this.Z3[lang].set(key, value);
	},
	
	/**
	 *
	 * */
	init: function(file) {
		this.Z7 = ConfManager.getInstance().get('lang');
		if (!this.Z7) {
			return false;
		}
		this.Z5 = this.W2();
		this.W4();	
		return true;	
	},
	
	/**
	 *
	 * */
	setLang:function(lang) {
		this.Z7 = lang;
		var file = this.W2();
		if (file != this.Z5) {
			this.Z5 = file;
			this.W4();
		} else {
		}
	},
	
	/**
	 *
	 * */
	get: function(name) {
		var data = this.Z6.get(name);
		if (data == undefined) {
			data = this.Z3[this.Z7].get(name);
			if (data == undefined) {
			}
		}
		return data;
	},
	
	/**
	 * 
	 * */
	getLang: function(){
		return this.Z7;
	},
	
	/*************************************************/
	/**					PRIVATE						**/
	/*************************************************/

	
	/**
	 *
	 * */
	W2: function() {
		return ConfManager.getInstance().get('langFolder')+this.Z7+"."+this.Z1;
	}, 
	
	/**
	 *
	 * */
	W4: function() {
		new Ajax.Request(this.Z5, {
		  	method: 'get',
		  	onSuccess: this.W0.bindAsEventListener(this),
			onFailure: this.W1.bindAsEventListener(this),
			evalJS: false,
			evalJSON: false,
			sanitizeJSON: false
		});
	},
	
	/**
	 *
	 * */
	W0: function(transport) {
		
		switch (this.Z0) {
			case LangManager.PARSE_LIKE_XML:
				this.Z6 = ParsingUtil.parseXML(transport.responseXML, 'item');
				break;
			case LangManager.PARSE_LIKE_FLAT:
				this.Z6 = ParsingUtil.parseTxt(transport.responseText);
				break;
			default:
				break;	
		}			
		if (this.Z4) {
			this.W3();
		} else {
			ModuleManager.getInstance().executeLangBindings();
		}
		document.fire(LangManager.LANG_CHANGE, {lang: this.Z7});
	},
	
	/**
	 *
	 * */
	W1: function(transport) {
	},
	
	/**
	 *
	 * */
	W3: function() {
		this.Z4 = false;
		document.fire(LangManager.LANG_READY_EVENT);
	}
});
	
/**
 * Static property
 * */
Object.extend(LangManager, {
	LANG_READY_EVENT : 'langEvent:ready',
	LANG_CHANGE: 'langEvent:change',
	PARSE_LIKE_XML : 'xml',
	PARSE_LIKE_FLAT : 'flat',
	DEFAULT_LANG : 'fr_FR'
});

/**
 * Singleton
 * */
SingletonUtil.execute(LangManager);


/*
Copyright (c) 2008 Florian David:
Florian David | Project Creator | http://www.first-department-of-informatics.com
   
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 * This file could be a lot compressed 
 * The 3 groups (model, controller and compressed) loading are quite the same
 * */
var HelperLoaderManager = Class.create({

	/*************************************************/
	/**					CONSTRUCTOR					**/
	/*************************************************/
	
	/**
	 *
	 * */
	initialize: function() {
		this.Z0 = $H({});
		this.Z1 = {};
	},
	
	/*************************************************/
	/**						PUBLIC					**/
	/*************************************************/
	
	/**
	 *
	 * */
	loadHelpers: function(moduleProperties) {
		this.Z0 = moduleProperties;
		this.W14();
	},
	
	/*************************************************/
	/**					PRIVATE						**/
	/*************************************************/
	
	///////////////////////// LOAD VIEW ///////////////////////////////
	
	/**
	 *
	 * */  
	W14: function() {
		var file = this.Z0.get('view');
		// if we have a view to load
		if (file != null && file != '' && file != undefined) {
			// we test if the element that will contain the view exists,
			// if not we have just to die, but we try to load the rest
			var view = this.Z0.get('addViewInId');
			if (!$(view)) {
				this.W13();
				return false;
			}
			// adding the version number (cache killer)
			file += '?v='+this.Z0.get('version');
			
			// lauching request
			new Ajax.Request(file, {
				method: 'get',
				onSuccess: this.W6.bindAsEventListener(this),
				onFailure: this.W7.bindAsEventListener(this),
				evalJS: false,
				evalJSON: false,
				sanitizeJSON: false
			});
		// we are loading the rest	
		} else {
			this.W13();
		}
		return true;
	},
	
	/**
	 *
	 * */
	W7: function(transport) {
		this.W13();
	},
	
	/**
	 *
	 * */
	W6: function(transport) {
		var view = this.Z0.get('addViewInId');
		$(view).update(transport.responseText);
		this.W13();
	},
	
	///////////////////////// LOAD CONTROLLER ///////////////////////////////
	
	/**
	 *
	 * */
	W9 : function() {
		if (!elementExists('js_'+this.Z0.get('controllerHelper'))) {
			var file = this.W11('controllerHelper');
			
			var scriptLoader = new ScriptLoader(file, this.Z0.get('controllerHelper'));
			
			this.Z1.succeed = 	this.W4.bindContext(this);
			this.Z1.failed =		this.W1.bindContext(this);
			
			document.observe(ScriptLoader.SUCCEED, 	this.Z1.succeed);
			document.observe(ScriptLoader.FAILED, 	this.Z1.failed);
			scriptLoader.load();
		} else {
			//trace('W9');
			this.W12();
		}
	},
	
	/**
	 *http://localhost/navx_projects/Dynamite/js/Test/index.php
	 * */
	W4: function(event) {
		this.W0();
		this.W12();
	},
	
	/**
	 *
	 * */
	W1: function(event) {
		this.W0();
	},
	
	///////////////////////// LOAD MODEL ///////////////////////////////
	
	/**
	 *
	 * */
	W12 : function() {
		if (!elementExists('js_'+this.Z0.get('modelHelper'))) {
			var file = this.W11('modelHelper');
		
			var scriptLoader = new ScriptLoader(file, this.Z0.get('modelHelper'));
			
			this.Z1.succeed 	=			this.W8.bindContext(this);
			this.Z1.failed 	= 			this.W5.bindContext(this);
			
			document.observe(ScriptLoader.SUCCEED, 	this.Z1.succeed);
			document.observe(ScriptLoader.FAILED, 	this.Z1.failed);
			scriptLoader.load();
		} else {
			this.W15();
		}	
	},
	
	/**
	 *
	 * */
	W8: function(event) {
		this.W0();
		this.W15();
	},
	
	/**
	 *
	 * */
	W5: function(event) {
		this.W0();
	},
	
	///////////////////////// LOAD COMPRESSED ///////////////////////////////
	
	/**
	 *
	 * */
	W10: function() {
		if (!elementExists('js_'+this.Z0.get('modelHelper'))) {
			var scriptLoader = new ScriptLoader(this.W11(), this.Z0.get('modelHelper'));
			
			this.Z1.succeed = 	this.W3.bindContext(this);
			this.Z1.failed =	 	this.W2.bindContext(this);
			
			document.observe(ScriptLoader.SUCCEED, 	this.Z1.succeed);
			document.observe(ScriptLoader.FAILED, 	this.Z1.failed);
	
			scriptLoader.load()
		} else {
			this.W15();
		}	
	},
	
	/**
	 *
	 * */
	W3: function(event) {
		this.W0();
		this.W15();
	}, 
	
	/**
	 *
	 * */
	W2: function(event) {
		this.W0();
	},
	
	
	///////////////////////// OTHERS ///////////////////////////////
	
	/**
	 *
	 * */
	W11: function(name) {
		var file = "";
		if (name == undefined) 
			file = ConfManager.getInstance().get('compressedName');
		else 
			file = this.Z0.get(name);
			
		return this.Z0.get('folder')+file+".js?v="+this.Z0.get('version');
	},
	
	/**
	 * 
	 * */
	W0: function() {
		document.stopObserving(ScriptLoader.SUCCEED, 	this.Z1.succeed);
		document.stopObserving(ScriptLoader.FAILED, 	this.Z1.failed);
	},
	
	/**
	 *
	 * */
	W13: function() {
		if (ConfManager.getInstance().get('useDynCompression') == false || this.Z0.get('autoExtract') == false) {
			if (!this.Z0.get('compressed')) {
				this.W9();
			} else {
				this.W10();
			}
		} else {
			this.W15();
		}
	},
		
	/**
	 *
	 * */
	W15: function() {
		document.fire(HelperLoaderManager.HELPER_READY_EVENT);
		//delete this.Z1;
	}
});
	
/**
 * Static property
 * */
Object.extend(HelperLoaderManager, {
	HELPER_READY_EVENT : 'helperEvent:ready'
});

/**
 * Singleton
 * */
SingletonUtil.execute(HelperLoaderManager);


/*
Copyright (c) 2008 Florian David:
Florian David | Project Creator | http://www.first-department-of-informatics.com
   
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 *
 * */
var UrlManager = Class.create({

	/*************************************************/
	/**					CONSTRUCTOR					**/
	/*************************************************/
	
	/**
	 * Constructor
	 * */
	initialize: function() {
		this.Z1 = true; 
		this.Z0 = false;

	},
	
	/*************************************************/
	/**					PUBLIC						**/
	/*************************************************/

	getIsUsable: function() {
		return this.Z0;
	},

	preinit: function() {
		this.Z0 = true;
	},

	/**
	 *
	 * */
	init: function() {
	
			
		Trace.writeMessage('UrlManager::init');
		var confManager = ConfManager.getInstance();
		
		// FROM http://code.google.com/p/reallysimplehistory/wiki/UsageInstructions
		window.dhtmlHistory.create({
			toJSON: function(o) {
		    	return Object.toJSON(o);
		    },
		        
		    fromJSON: function(s) {
		    	return s.evalJSON();
			},
			
			url: confManager.get('baseUrl')+'WZFwk_multiton/libs/rsh/',
			debugMode: confManager.get('debugUrl')
		});
	
    	dhtmlHistory.initialize();
      	dhtmlHistory.addListener(this.W0.bindAsEventListener(this));
      	
      	// if there is no anchor, then the first handler execution doesn't come from init
      	if (this.getCurrentLocation() == "") {
      		this.Z1 = false;
      	} else {
	      	// should not be here but i probably break something when changing the rsh code	
	      	// ie : RSH should take care of that
	      	// I use defer so i don't get a stack error on IE7
      		this.W0.bindAsEventListener(this).defer(this.getCurrentLocation(), this.getCurrentStorage(), UrlManager.FROM_INIT);
      	}
	},

	/**
	 *
	 * */
	setUrl: function(newLocation, historyData) {
		if (!this.Z0) {
			return false;
		}
		if (this.getCurrentLocation() == newLocation) {
			return false;
		}
		dhtmlHistory.add(newLocation, historyData);
		this.W0(newLocation, historyData, UrlManager.FROM_FRAMEWORK);
		return true;
	},

	/**
	 *
	 * */
	getCurrentLocation: function() {
		if (!this.Z0) {
			return false;
		}
		return dhtmlHistory.getCurrentLocation();
	},
	/**
	 *
	 * */
	getCurrentStorage: function() {
		if (!this.Z0) {
			return false;
		}	
		return historyStorage.get(this.getCurrentLocation());
	},

	/*************************************************/
	/**					PRIVATE						**/
	/*************************************************/

	/**
	 *
	 * */
	W0: function(newLocation, historyData, from) {
		if (from == undefined) { 
			if (this.Z1) {
				this.Z1 = false;
				from = UrlManager.FROM_INIT;
			} else {
				from = UrlManager.FROM_USER;
			}
		}
		
		document.fire(UrlManager.URL_CHANGE, {location: newLocation, data: historyData, from: from});
	}
});

/**
 * Static property
 * */
Object.extend(UrlManager, {
	URL_CHANGE : 		'urlManager:change',
	FROM_USER : 		'fromUser',
	FROM_FRAMEWORK : 	'fromFramework',
	FROM_INIT : 		'fromInit'
});

/**
 * Singleton
 * */
SingletonUtil.execute(UrlManager);


/*
Copyright (c) 2008 Florian David:
Florian David | Project Creator | http://www.first-department-of-informatics.com
   
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var Controller = Class.create({

	/*************************************************/
	/**					CONSTRUCTOR					**/
	/*************************************************/
	
	/**
	 *
	 * */
	initialize: function() {
		this.Z6 = true; // is it the init
		this.Z5 = 0; // number of little mvc loaded

		this.Z3 = []; // array containing Hash correspoding to the file mvc.xml + once loaded the information contains in conf.xml
		this.Z4 = null;
		/**
		## Hash defined ##
		id: The id of the module (mvc.xml)
		file: The path to conf.xml (mvc.xml)
		autoExtract: do we execute the module at launching (mvc.xml)
		loaded: is the module loaded ?
		loading: is the module loading ?
		version : the version of the modeul
		
		modelHelper: The name of the model
		modelHelperInstances : The instances of the model
		modelHelperClass : The class of the model
		
		controllerHelper: the name of the controller
		controllerHelperInstances : The instances of the controller
		controllerHelperClass : The class of the controller
		
		view: The path to the view
		addViewInId: When we load the view, where to put it
		dynamicLoad: Do we automatically load the JS
		folder: Folder to the JS files
		compressed: Do we have have a file that contains a compressed version of the controller and model
		type: is it a simple or multiple 
		startMultitonNum :  in case of multiple, the start num of instance (most case 1)
		stopMultitonNum : in case of multiple, the num of instance in the multiton (depends of the view)
		confXml : the native XML loaded, It is useful for refresh multiple module
		initModelObj : the obj or array of obj passed at the init method of the model
		**/
		this.Z0 = 0; // counter of file to load at init
		
		this.Z1 = ConfManager.getInstance().get('debugLaunchMethod');
		//this.Z1 = (debugLaunchMethod == undefined) ? false : debugLaunchMethod;
	},
	
	/*************************************************/
	/**						PUBLIC					**/
	/*************************************************/
	
	/**
	 *
	 * */
	init:function() {
		
		document.observe(ModuleManager.BIND_READY_EVENT, this.W5.bindAsEventListener(this));
		document.observe(Model.LAUNCH_CONTROLLER_METHOD_EVENT, this.W7.bindAsEventListener(this));
		
		if (!ConfManager.getInstance().get('useDynCompression')) {
			this.W17();
		} else {
			this.W16();
		}
	},
	
	/**
	 * This method permit you to load a module 
	 *
	 * @param id (string) : the id of the module (definied in mvc.xml)
	 * @return Boolean : did we succeed to load the module
	 * */
	loadModule: function(id, initObj, executeBindings) {
		var executeBindings = (executeBindings != undefined) ? executeBindings : true;
		var mvcProp = this.W20(id);
		if (!mvcProp) {
			return false;
		}
		// if module is loaded
		if (mvcProp.get('loaded')) {
			return false;
		}
		// id module is loading
		if (mvcProp.get('loading')) {
			return false;
		}
		
		// start timer 	
		Trace.time(id);
		
		// i am loading... :p
		mvcProp.set('loading', true);
		mvcProp.set('initModelObj', initObj);
		mvcProp.set('executeBindings', executeBindings);
		// load conf
		this.W9(mvcProp);
		
		return true;
	},
	
	W11: function() {
		var list = this.Z3;
		var len = list.length;
		
		var item = null;
		for (var i = 0; i < len; ++i) {
			item = this.Z3[i];
			if (item.get('loaded') == true) {
				this.unLoadModule(item.get('id'));
			}
		}
	},
		
	/**
	 * This method permit you to unload a module 
	 * Note that bindings (listener, lang, and bind) are not removed (seems not to give us problem) 
	 * seems to work correctly but it is possible that method could be better
	 *
	 * @param id (string) : the id of the module (definied in mvc.xml)
	 * @return Boolean : did we succeed to load the module
	 * */
	unLoadModule: function(id, willReload) {
		willReload = (willReload != undefined) ? willReload : true; 
		var mvcProp = this.W20(id);
		
		if (mvcProp == null) {
			return false;
		}
		
		if (mvcProp.get('loaded') == false && mvcProp.get('loading') == false) {
			return false;
		}
		// wait until the module is loaded before unloading it
		// will probably not work if there is more than one module loading that want to be unloaded at the same time (or close to the same time)
		if (mvcProp.get('loading') == true) {
			
			
			var internalThis = this;
			var counter = 0;
			var interval = setInterval(function() {
				counter++;
				if (mvcProp.get('loading') == false && mvcProp.get('loaded') == true) {
					clearInterval(interval);
					internalThis.W13(id, willReload);
				} else if (mvcProp.get('loaded') == false) {
					clearInterval(interval);
				} else {
				}
				// let the module 4s and then it is too late
				if (counter >= 20) {
					clearInterval(interval);
				}
			}, 200);
			
		} else {
			return this.W13(id, willReload);
		}
		return false;
	},
	
	W13: function (id, willReload) {
		var mvcProp = this.W20(id);
		
		mvcProp.set('loading', false);
		
		
		// delete the contents of the view
		var view = $(mvcProp.get('addViewInId'));
		if (view != '' && view != null && view != undefined) {
			$(mvcProp.get('addViewInId')).update();
		}
		
		var confXml = mvcProp.get('confXml');
		var type =  mvcProp.get('type');
		var listeners = $A(confXml.getElementsByTagName('bindAsListener'));
		var listenersLen = listeners.length;
		
		try {
			var stop = mvcProp.get('stopMultitonNum');
			
			var modelHelperInstances =  mvcProp.get('modelHelperInstances');
			var controllerHelperInstances =  mvcProp.get('controllerHelperInstances');
			
			var modelHelperInstance = null;
			var controllerHelperInstance = null;
			
			for (var i = 1; i <= stop; i++) {
				// remove listener
				modelHelperInstance = modelHelperInstances[i];
				controllerHelperInstance = controllerHelperInstances[i];
				
				modelHelperInstance.destroy();
				
				// remove dynamically added handler
				for (var j = 0; j < listenersLen; j++) {
					var bind = listeners[j];
					var id = ModuleManager.getInstance().getBindId(bind.getAttribute('id'), i, type);
					if ($(id)) {
						var event = 	bind.getAttribute('event');
						Event.stopObserving(id, event);
					}
				}
				
				// remove methods of the instances + dynamically added methods
				for (var key in modelHelperInstance) {
					//key = null;
					delete modelHelperInstance[key];
				}
				for (var key in controllerHelperInstance) {
					//key = null;
					delete controllerHelperInstance[key];
					
				}
				
				//modelHelperInstance = null;
				delete modelHelperInstances[i];
				//controllerHelperInstance = null;
				delete controllerHelperInstance[i];
			}
			
			if (willReload == false) {
			
				// delete the methos of the class
				mvcProp.get('modelHelperClass')['removeMethods'](); // see extends.js in libs/prototype/
				mvcProp.get('controllerHelperClass')['removeMethods'](); // see extends.js in libs/prototype/
			
			}
		} catch (error) {
		}
		
		if (willReload == false) {
			// if the loaded file was the compressed one
			if (mvcProp.get('compressed')) {
				// remove the script
				if ($('js_'+mvcProp.get('modelHelper'))) {
					$('js_'+mvcProp.get('modelHelper')).remove();
				}
			} else {
				// remove js files
				if ($('js_'+mvcProp.get('modelHelper'))) {
					$('js_'+mvcProp.get('modelHelper')).remove();
				}	
				if ($('js_'+mvcProp.get('controllerHelper'))) {
					$('js_'+mvcProp.get('controllerHelper')).remove();
				}	
			}
		}
		
		// reinitializing data
		mvcProp.set('loaded', false);
		
		mvcProp.unset('view');
		mvcProp.unset('addViewInId');
		mvcProp.unset('compressed');
		
		mvcProp.unset('modelHelper');
		mvcProp.unset('modelHelperInstances');
		mvcProp.unset('modelHelperClass');
		
		mvcProp.unset('controllerHelper');	
		mvcProp.unset('controllerHelperInstances');	
		mvcProp.unset('controllerHelperClass');	
		mvcProp.unset('dynamicLoad');
		mvcProp.unset('type');			
		mvcProp.unset('folder');			
		mvcProp.unset('version');
		
		if (willReload == false) {
			mvcProp.unset('confXml');
		}
					
		mvcProp.unset('startMultitonNum');			
		mvcProp.unset('stopMultitonNum');			
		mvcProp.unset('initModelObj');			
		return true;
	
	},
	
	/**
	 * This method permit you to lauch a modelHelper method from the controllerHelper 
	 *
	 * @param arguments[0] (string) : The name of the controller
	 * @param arguments[1] (string) : The name of the method to call
	 * @param rest (list of string, boolean...) : Some arguments separated by coma (has if you called a function) used by the modelHelper method
	 * @return Something or false : false if that failed, something : the return of the function we just call
	 * */
	launchModelMethod: function() {
		var controllerName = arguments[0];
		var multitonId = arguments[1];
		var args = $A(arguments[2]);
		if (args.length < 1) {
			return false;	
		}
		var modelMethod = args.shift();
		var instance = this.W10(controllerName, multitonId);
		
		if (!instance) {
			return false;
		}
		if (this.Z1) {
			Trace.writeMessage('Controller::launchModelMethod : call method '+modelMethod+' on model from '+controllerName+' with multitonId '+multitonId);
		}
		try {
			// saving this line : "instance[modelMethod].apply(instance, args);"
			var value = Function.prototype.apply.call(instance[modelMethod], instance, args);
			
		} catch (error) {
			return false;
		}
		if (this.Z1) {
		}
		return value;
	},
	
	/**
	 * This method permit you to lauch a method on an element of the view (useful to do a for example a focus() on an element)
	 * You can lauch this method from the ControllerHelper
	 *
	 * @param arguments[0] (string) : The id of the element where to apply the method on
	 * @param arguments[1] (string) : The name of the method to call
	 * @param rest (list of string, boolean...) : Some arguments separated by coma (has if you called a function) used by the element method
	 * @return Boolean : did we succeed to execute the method
	 * */
	applyMethodToElement: function() {
		var args = $A(arguments);
		var returnValue = true;
		if (args.length < 2) {
			return false;
		}
	
		var elementId = args.shift();
		var element = $(elementId);
		if (!element) {
			return false;
		}
		var methodName = args.shift();
		var method = element[methodName];
		try {
			// IE 7 doesn't agree with this call : "returnValue = method.apply(element, args);"
			// so I found that on the web : http://prototype.lighthouseapp.com/projects/8886/tickets/278-invoke-to-support-host-objects-methods
			// IE7 makes my evening long :(
			returnValue = Function.prototype.apply.call(method, element, args);
		} catch (error) {
		}
		return returnValue;
	},
	
	refreshModule: function(moduleId) {
		var mvcProp = this.W20(moduleId);
		Trace.write('Controller::refreshModule : refreshing '+moduleId+'');
		
		if (!mvcProp) {
			Trace.writeError('Controller::refreshModule : fail to find module '+moduleId);
			return false;
		}
		// if module is not loaded
		if (!mvcProp.get('loaded')) {
			Trace.writeError('Controller::refreshModule : the module '+moduleId+' is not loaded : launch loadModule');
			this.loadModule(moduleId);
		} else {
			ModuleManager.getInstance().updateModule(mvcProp);
		}
		return true;
	},
	
	getCurrentMultitonNumber: function(moduleId) {
		var mvcProp = this.W20(moduleId);
		if (!mvcProp) {
			Trace.writeError('Controller::getNextMultitonId : fail to find module '+moduleId);
			return false;
		}
		if (!mvcProp.get('loaded')) {
			Trace.writeError('Controller::getNextMultitonId : the module '+moduleId+' is not loaded');
			return false;
		}	
		if (mvcProp.get('type') != ModuleManager.MODULE_MULTIPLE) {
			Trace.writeError('Controller::getNextMultitonId : the module '+moduleId+' has not the type '+ModuleManager.MODULE_MULTIPLE);
			return false;
		}
		return mvcProp.get('stopMultitonNum');
	},
	
	getNextMultitonId: function(moduleId) {
		var result = this.getCurrentMultitonNumber(moduleId);
		// it is really === because the method can return 0 and (0 == false) is true
		if (result === false) return false;
		return result + 1;
	},
	
	/*************************************************/
	/**					PRIVATE						**/
	/*************************************************/
	
	/**
	 *
	 * */
	W7: function(event) {
		var memo = event.memo;
		var args = $A(memo.args);
		var multitonId = memo.multitonId;
		var modelName = memo.name;
		
		if (args.length < 1) {
			return false;	
		}

		var controllerMethod = args.shift();
		var instance = this.W8(modelName, multitonId);

		if (!instance) {
			return false;
		}
		if (this.Z1) {
			Trace.writeMessage('Controller::W7 : try to proceed : '+controllerMethod+' on '+modelName+' with multiton id '+multitonId);//Controller::W7 : ready to proceed : %s
		}
		try {
			// saving this line : "instance[controllerMethod].apply(instance, args);"
			Function.prototype.apply.call(instance[controllerMethod], instance, args);
		} catch (error) {
			return false;
		}
		if (this.Z1) {
		}
		return true;
	},
	
	///////////////////////// LOADING OF HELPERS CONF ///////////////////////////////
	
	/**
	 *
	 * */
	W9: function(obj) {
		if (!obj.get('confXml') && !window[obj.get('id')+'Properties']) {
			var file = obj.get('file')+"?v="+ConfManager.getInstance().get('version');
			
			new Ajax.Request(file, {
			  	method: 'get',
			  	onSuccess: this.W0.bindAsEventListener(this, obj),
				onFailure: this.W1.bindAsEventListener(this, obj),
				evalJS: false,
				evalJSON: false,
				sanitizeJSON: false
			});
		} else {
			ModuleManager.getInstance().bindFile(obj);
		}
	},
	
	/**
	 *
	 * */
	W0: function(transport, obj) {
		var response = transport.responseXML;
		if (Prototype.Browser.IE) {
			this.W12.bind(this).defer(response, obj)	
		} else {
			this.W12(response, obj);
		}
	},
	
	W12: function(response, obj) {
		obj.set('confXml', response);
		ModuleManager.getInstance().bindFile(obj);
	},
	
	/**
	 *
	 * */
	W1: function(transport, obj) {
	},
	
	///////////////////////// MODULE RELATED FILE ///////////////////////////////
	
	/**
	 *
	 * */
	W20: function(id) {
		var selectedObj = null;
		var prop = this.Z3;
		for (var i = prop.length - 1; i >= 0; --i) {
			var obj = prop[i];
			if (obj.get('id') == id) {
				selectedObj = obj;
				break;
			}
		}
		return selectedObj;
	},
	
	///////////////////////// WORK ON MVCNAME ///////////////////////////////
	
	/**
	 *
	 * */
	W10: function(controllerName, index) {
		return this.W18(controllerName, 'controllerHelper',  'modelHelper', index);
	},
	
	/**
	 *
	 * */
	W8: function(modelName, index) {
		return this.W18(modelName, 'modelHelper', 'controllerHelper', index);
	},
	
	/**
	 *
	 * */
	W18: function(name, helperCompare, helperSearch, index) {
		var returnValue = null;
		var prop = this.Z3;
		for (var i = prop.length - 1; i >= 0; --i) {
			var value = prop[i];
			if (name == value.get(helperCompare)) {
				returnValue = value.get(helperSearch+'Instances')[index];
				break;
			}
		}
		return returnValue;
	},
	
	///////////////////////// LOAD MVC FILE ///////////////////////////////
	
	/** 
	 *
	 * */
	W17: function() {	
		var confManager = ConfManager.getInstance();
		var file = confManager.get('mvcFile')+'?v='+confManager.get('version');
		new Ajax.Request(file, {
		  	method: 'get',
		  	onSuccess: this.W3.bindAsEventListener(this),
			onFailure: this.W6.bindAsEventListener(this),
			evalJS: false,
			evalJSON: false,
			sanitizeJSON: false
		});
	},
	
	/**
	 *
	 * */
	W3 : function(transport) {
	
		this.Z4 = transport.responseXML;
		this.W14();
		this.W19();

	},
	
	W16: function() {
		trace('Initializer::W2 : loading dyn');
		var conf = ConfManager.getInstance();
		
		var url = [];
		url.push(conf.get('dynCompressionUrl'));
		url.push("?mvc="+conf.get('mvcFile'));
		url.push("&baseUrl="+conf.get('baseUrl'));
		url.push("&compressedName="+conf.get('compressedName'));
		url.push("&jsExt=js");
		url.push("&usePacker="+conf.get('usePacker'));
		url.push("&useCache="+conf.get('useCache'));
		
		var scriptLoader = new ScriptLoader(url.join(""));
		
		document.observe(ScriptLoader.SUCCEED, 	this.W2.bindAsEventListener(this));
		document.observe(ScriptLoader.FAILED, 	this.W4.bindAsEventListener(this));
		
		scriptLoader.load();
	},
	
	W2: function() {
		document.stopObserving(ScriptLoader.SUCCEED);
		document.stopObserving(ScriptLoader.FAILED);
		trace('Initializer::W2 : loading dyn succeed');
		
		this.W14();
		this.W19();
	}, 
	
	W4: function() {
		trace('Initializer::W4 : fail loading dyn');
		this.W2();
	},
	
	/**
	 *
	 * */
	W6 : function(transport) {
		var confManager = ConfManager.getInstance();
	},
	
	///////////////////////// WORK ON MVC FILE ///////////////////////////////
	
	/**
	 *
	 * */
	W14 : function() {
		var isInit =  this.Z6;
		var prop = window['MvcProperties'];
		
		if (!prop) {
			var xml = this.Z4;
			var list = xml.getElementsByTagName('item');
		} else {
			var list = prop;
		}
		
		// optim
		var confManager = ConfManager.getInstance();
		var addBaseUrl = confManager.get('addBaseUrl');
		var baseUrl = confManager.get('baseUrl');
		
		// function
		var booleanUtil_toBoolean_function = BooleanUtil.toBoolean;
		var urlUtil_makeAbsolute_function = UrlUtil.makeAbsolute;
		var itemUtil_getAttribute_function = ItemUtil.getAttribute;
		
		for (var i = list.length - 1; i >= 0; --i) {
		
			var item = list[i];
			
			var requireId =			itemUtil_getAttribute_function(item, 'requireId');

			if (requireId == undefined || requireId == "" || requireId == null || elementExists(requireId)) {
			
				var id = 				itemUtil_getAttribute_function(item, 'id');
				var file = 				itemUtil_getAttribute_function(item, 'file');
				var executeAtInit = 	booleanUtil_toBoolean_function(itemUtil_getAttribute_function(item, 'executeAtInit'));
				
				if (addBaseUrl) {
					file = urlUtil_makeAbsolute_function(file, baseUrl);
				}
				
				this.Z3.push($H({	id: id, 
												file: file, 
												autoExtract: executeAtInit, 
												loaded: false, 
												loading: false
											}));
				
				if (executeAtInit && isInit) {
					this.Z0++;
				}
			} else {
				Trace.writeWarning("Controller::W14 : we didn't find the requireId "+requireId+", so we do not load the module "+id);
			}	
		}
			
	},
	
	/**
	 *
	 * */
	W19: function() {
		var props = this.Z3;
		
		for (var i = props.length - 1; i >= 0; --i) {
			var obj = props[i];
			if (obj.get('autoExtract')) {
				obj.set('loading', true);
				obj.set('executeBindings', true);	
				obj.set('initModelObj', {});			
				this.W9(obj);
			}
		};
	},
	
	/**
	 *
	 * */
	W5: function(event) {
		this.W15(event.memo);
	
		this.Z5++;
		
		if (this.Z5 == this.Z0) {
			this.W21();	
		}
	},
	
	/**
	 *
	 * */
	W15: function(moduleProperties) {
		// update the hash with new properties
		var moduleProp = this.W20(moduleProperties.get('id'));
		
		Trace.time('initHelpers : '+moduleProp.get('id'));
		
		// idk if this line is useful or not
		moduleProp.update(moduleProperties);

		var nameController = 		moduleProp.get('controllerHelper');
		var nameModel =	 			moduleProp.get('modelHelper');
				
		var instancesController = 	moduleProp.get('controllerHelperInstances'); 
		var instancesModel = 		moduleProp.get('modelHelperInstances'); 
		var stopMultitonNum = 		moduleProp.get('stopMultitonNum');
		var startMultitonNum = 		moduleProp.get('startMultitonNum');
		var initModelObj = 			moduleProp.get('initModelObj');

		try {
			// we have to register the instance before initializing the model and controller
			for (var i = startMultitonNum; i <= stopMultitonNum; ++i) {
				instancesController[i].setWZProperties(i, nameController, Helper.TYPE_CONTROLLER);
				instancesModel[i].setWZProperties(i, nameModel, Helper.TYPE_MODEL);
			}
		
		} catch (error) {
			Trace.writeError('Controller::W15 : 1 '+ErrorUtil.get(error));//'Controller::W15 : unable to lauch init method on controller helper');
		}
		
		try {	
			for (var i = startMultitonNum; i <= stopMultitonNum; ++i) {
				instancesController[i].init();
				instancesModel[i].init(initModelObj);
			}
		} catch (error) {	
			Trace.writeError('Controller::W15 : 2 '+ErrorUtil.get(error));//'Controller::W15 : unable to lauch init method on controller helper');
		}
		
		try {	
			// check the required application data
			// this should not be done more than once
			if (instancesModel[1]) {
				var requiredApplicationData = instancesModel[1].getRequiredApplicationDataKeys();
				var requiredApplicationDataLen = requiredApplicationData.length;
				var requiredApplicationDataItem = null;
				var confManager = ConfManager.getInstance();
				for (var j = 0; j < requiredApplicationDataLen; j++) {
					requiredApplicationDataItem = requiredApplicationData[j];
					if (confManager.getApplicationData(requiredApplicationDataItem) == undefined) {
						Trace.writeError('Controller::W15 : '+moduleProp.get('id')+' require the application data ['+requiredApplicationDataItem+'] (please complete your main conf file or the second parameter of the initializer)');				
					}
				}
			}
		} catch (error) {
			Trace.writeError('Controller::W15 : 2 '+ErrorUtil.get(error));
			// Don't forget to change the Comment here 
			//FwkTrace.writeError('M5_018', ErrorUtil.get(error));//'Controller::W15 : unable to lauch init method on controller helper');
		}
		// the start become the stop for later loading
		moduleProp.set('startMultitonNum', stopMultitonNum+1);

		moduleProp.set('loading', false);
		// the module is now loaded 
		moduleProp.set('loaded', true);
		
		Trace.timeEnd('initHelpers : '+moduleProp.get('id'));
		Trace.timeEnd(moduleProp.get('id'));
	}, 
	 
	/**
	 *
	 * */
	W21: function() {
		if (this.Z6) {
			this.Z6 = false;
			document.fire(Controller.CONTROLLER_READY_EVENT);	
		}
	}
	
});

Object.extend(Controller, {
	CONTROLLER_READY_EVENT : 'controller:ready'
});

SingletonUtil.execute(Controller);


/*
Copyright (c) 2008 Florian David:
Florian David | Project Creator | http://www.first-department-of-informatics.com
   
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


var Initializer = Class.create({

	/*************************************************/
	/**					CONSTRUCTOR					**/
	/*************************************************/
	
	/**
	 *
	 * */
	initialize: function() {
		this.Z1 = false;
		this.Z0 = false;
		this.Z2 = $H({});
	},
	
	/*************************************************/
	/**						PUBLIC					**/
	/*************************************************/
	
	/**
	 *
	 * */
	init: function(confFile, confOptions, applicationOptions) {
		if (this.Z0 == false) {
			//console.profile('WZFramework');
			console.time('WZFramework');
			if (arguments.length > 3) {
				alert("Initializer::init : you specify more than 3 params");
			}	
			this.Z0 = true;
			this.W8();
			this.W11(confFile, confOptions, applicationOptions);
			
		} 
	},
	
	/*************************************************/
	/**					PRIVATE						**/
	/*************************************************/
	
	/**
	 *
	 * */
	W8: function() {
		// save the listener
		this.Z2.set('dom', 			this.W10.bindContext(this));
		this.Z2.set('conf', 		this.W6.bindContext(this));
		this.Z2.set('lang', 		this.W5.bindContext(this));
		this.Z2.set('controller', 	this.W0.bindContext(this));
		this.Z2.set('model', 		this.W4.bindContext(this));
		
		// observe
		document.observe('dom:loaded', 						this.Z2.get('dom'));
		document.observe(ConfManager.CONF_READY_EVENT, 		this.Z2.get('conf'));
		document.observe(LangManager.LANG_READY_EVENT, 		this.Z2.get('lang'));
		document.observe(Controller.CONTROLLER_READY_EVENT, this.Z2.get('controller'));
		document.observe(Model.MODEL_READY_EVENT, 			this.Z2.get('model'));
	},
	
	/**
	 *
	 * */
	W2: function() {
		// unregister
		document.stopObserving('dom:loaded', 						this.Z2.get('dom'));
		document.stopObserving(ConfManager.CONF_READY_EVENT, 		this.Z2.get('conf'));
		document.stopObserving(LangManager.LANG_READY_EVENT, 		this.Z2.get('lang'));
		document.stopObserving(Controller.CONTROLLER_READY_EVENT, 	this.Z2.get('controller'));
		document.stopObserving(Model.MODEL_READY_EVENT, 			this.Z2.get('model'));
		
		// free memory
		this.Z2 = $H({});
		delete this.Z2;
	},
	
	/**
	 *
	 * */
	W10: function() {
		Trace.time('WZFramework_DOMReady');
		this.Z1 = true;
		document.fire('intializer:domReady');
	},
	
	/**
	 *
	 * */
	W11: function(confFile, confOptions, applicationOptions) {
		ConfManager.getInstance().init(confFile, confOptions, applicationOptions);
	},
	
	/**
	 *
	 * */
	W6: function() {
		var confManager = ConfManager.getInstance();
		if (confManager.get('useLang')) {
			this.W12();
		} else {
			this.W7();
		}
		if (confManager.get('useUrl')) {
			UrlManager.getInstance().preinit();
		}
	},
	
	/**
	 * Cannot use FwkTrace before this method
	 * */
	
	/**
	 *
	 * */
	W12: function() {
		LangManager.getInstance().init();
	},
	
	/**
	 *
	 * */
	W5: function() {
		this.W3();	
	},

	W3: function() {
		PluginManager.getInstance().init();
		this.W7();
	},

	
	/**
	 *
	 * */
	W7: function() {
		if (this.Z1) {
			Controller.getInstance().init();
		} else {
			document.observe('intializer:domReady', this.W7.bindAsEventListener(this));
		}
	},
	
	/**
	 *
	 * */
	W0: function() {
		this.W9();
	},
	
	/**
	 *
	 * */
	W9: function() {
		Model.getInstance().init();
	},
	
	/**
	 *
	 * */
	W4: function() {
		this.W13();		
	},
	
	/**
	 *
	 * */
	W13: function() {
		if (ConfManager.getInstance().get('useUrl')) {
			UrlManager.getInstance().init();
		}
		this.W14();
			
	},
	
	W14: function() {
		this.W2();
		console.timeEnd('WZFramework');
		Trace.timeEnd('WZFramework_DOMReady');
		//console.profileEnd('WZFramework');
	}
});

Object.extend(Initializer, {
	REQUIRED_PROTOTYPE : '1.6.0'
});




/*
Copyright (c) 2008 Florian David:
Florian David | Project Creator | http://www.first-department-of-informatics.com
   
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var Model = Class.create({

	/*************************************************/
	/**					CONSTRUCTOR					**/
	/*************************************************/
	
	/**
	 *
	 * */
	initialize: function() {
		this.Z0 = {};
	},
	
	/*************************************************/
	/**						PUBLIC					**/
	/*************************************************/
	
	/**
	 *
	 * */
	init: function() {
		this.W0();
	},
	
	/**
	 * This method is useful if you want to share some data between different modelHelper
	 * Each contextualDataChangeHandler will receive the message that the value changed
	 * 
	 * @param name (string) : The name of the contextual data
	 * @param value (somethig) : The value of the contextual data
	 * @return void
	 * */
	setContextualData: function(name, value, toList) {
		toList = (toList == undefined) ? [] : toList;
		toList = (Object.isString(toList)) ? [toList] : toList;

		this.Z0.name = value;
		document.fire(Model.CONTEXTUAL_DATA_CHANGE_EVENT, {name: name, value:value, toList: toList});
	},
	
	/**
	 * This method is useful to get a value from a contextual data
	 *
	 * @param name (string) : The name of the contextual data
	 * @return string : the value corresponding to the contextual data asked for
	 * */
	getContextualData:function(name) {
		var value = this.Z0.name;
		if (value == undefined) {
		} 
		return value;
	},
	
	/**
	 * This method is used to asked the controller to lauch a method
	 * The Model doesn't know the COntroller, so we fire an event that is observed by the Controller
	 *
	 * @param arguments[0] (array) : Array of data
	 * */
	launchControllerMethod: function() {
		document.fire(Model.LAUNCH_CONTROLLER_METHOD_EVENT, {name: arguments[0], multitonId: arguments[1], args: arguments[2]});
	},
	
	/*************************************************/
	/**					PRIVATE						**/
	/*************************************************/
	
	/**
	 *
	 * */
	W0: function() {
		document.fire(Model.MODEL_READY_EVENT);
	}
});

/**
 *
 * */
Object.extend(Model, {
	MODEL_READY_EVENT : 'model:ready',
	CONTEXTUAL_DATA_CHANGE_EVENT : 'model:contextualDataChange',
	LAUNCH_CONTROLLER_METHOD_EVENT : 'model:launchControllerMethod'
});

/**
 *
 * */
SingletonUtil.execute(Model);


/*
Copyright (c) 2008 Florian David:
Florian David | Project Creator | http://www.first-department-of-informatics.com
   
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var Helper = Class.create({

	initialize: function() {
		this.Z0 = 1;
		this.Z2 = "";
		this.Z1 = "";
	},
	
	setWZProperties: function(id, name, type) {
		this.Z0 = id;
		this.Z2 = name;
		this.Z1 = type;
	},
	
	getWZMultitonId: function() {
		return this.Z0;
	},
	
	getWZName: function() {
		return this.Z2;
	},
	
	getWZType: function() {
		return this.Z1;
	}
});

Object.extend(Helper, {
	TYPE_CONTROLLER: 'controllerHelper',
	TYPE_MODEL: 'modelHelper'
});

/*
Copyright (c) 2008 Florian David:
Florian David | Project Creator | http://www.first-department-of-informatics.com
   
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 * The ControllerHelper is an abstract class
 * Every module you will do extends of this class
 * */
var ControllerHelper = Class.create(Helper, {

	/*************************************************/
	/**					CONSTRUCTOR					**/
	/*************************************************/
	
	/**
	 * This is the constructor of the class
	 * You have to override this method in your module controller
	 * and set the this.NAME attribute to the name of the module controller name.
	 *
	 * You will do it like that :
	 * initialize: function($super) {
	 *		$super();
	 *		this.NAME = 'TheNameOfTheModuleControllerClass';
	 * }
	 * */
	initialize: function($super) {
		$super();
	},
	
	/**
	 * This is the destructor of the class
	 * */
	destroy: function() {
		
	},
	
	/*************************************************/
	/**						PUBLIC					**/
	/*************************************************/
	
	/**
	 * This is the init method
	 * This method will be lauch right after the module is loaded
	 * so you can do on it everything related to the initializatrion of you module.
	 *
	 * You have to override it like that 
	 * init: function($super) {
	 *	$super();
	 * 	this.myInitFunction();
	 * 	this.myOtherInitFunction();
	 * }
	 * */
	init:function() {
		
	},
	
	/**
	 * This method is a shortcut to lauch a model method of the current module
	 * In your controller, your are using it like that
	 * this.launchModelMethod(this.NAME, "setCopyValue", value, {tata: 'toto'});
	 *
	 * @arguments[0] (string) : the name of the Controller (this.NAME)
	 * @arguments[1] (string) : the name of the module model method you wish to lauch
	 * @arguments[...] (any type) : some args you wish to pass to the module model method
	 *
	 * return void
	 * */
	launchModelMethod: function() {
		return Controller.getInstance().launchModelMethod(this.getWZName(), this.getWZMultitonId(), arguments);
	}									
});

/*
Copyright (c) 2008 Florian David:
Florian David | Project Creator | http://www.first-department-of-informatics.com
   
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var ModelHelper = Class.create(Helper, {

	/*************************************************/
	/**					CONSTRUCTOR					**/
	/*************************************************/
	
	/**
	 * to override
	 * */
	initialize:function($super) {
		$super();		
		this.Z0 = {};
	},
	
	/*************************************************/
	/**						PUBLIC					**/
	/*************************************************/	
	
	/**
	 * this method is called when you unload a module
	 * */
	destroy: function() {
		document.stopObserving(Model.CONTEXTUAL_DATA_CHANGE_EVENT, 		this.Z0.data);
		
		if (UrlManager.getInstance().getIsUsable()) {
			document.stopObserving(UrlManager.URL_CHANGE, 				this.Z0.url);
		}
		if (ConfManager.getInstance().get('useLang') == true) {
			document.stopObserving(LangManager.LANG_CHANGE, 			this.Z0.lang);
		}
		// free memory
		delete this.Z0;
	},

	/**
	 *
	 * */
	launchControllerMethod: function() {
		Model.getInstance().launchControllerMethod(this.getWZName(), this.getWZMultitonId(), arguments);
	},
	
	/**
	 * to override
	 * set listenDataNow to true only if you are using Model.getInstance().setContextualData soon in your code
	 * */
	init:function(listenData, listenLang, listenUrl, listenDataNow, listenLangNow, listenUrlNow) {
		listenData = 		(listenData == undefined) ? true : listenData;
		listenLang = 		(listenLang == undefined) ? true : listenLang;
		listenUrl = 		(listenUrl == undefined) ? true : listenUrl;
		
		listenDataNow = 	(listenDataNow == undefined) ? false : listenDataNow;
		listenLangNow = 	(listenLangNow == undefined) ? false : listenLangNow;
		listenUrlNow = 		(listenUrlNow == undefined) ? false : listenUrlNow;
		
		// contextual data
		if (listenData) {
			if (listenDataNow) {
				this.W4();
			} else {
				this.W4.bind(this).defer();
			}
		}
		
		// lang
		if (listenLang && ConfManager.getInstance().get('useLang')) {
			if (listenLangNow) {
				this.W5();
			} else {
				this.W5.bind(this).defer();
			}
		}

		// url
		if (listenUrl && UrlManager.getInstance().getIsUsable()) {
			if (listenUrlNow) {
				this.W6();
			} else {
				this.W6.bind(this).defer();
			}
		}
	},
	
	W4: function() {
		this.Z0.data =  	this.W0.bindAsRealEventListener(this);
		var data = document.observe(Model.CONTEXTUAL_DATA_CHANGE_EVENT, 		this.Z0.data);
		
	},
	
	W6: function() {
		this.Z0.url = 	this.W3.bindAsRealEventListener(this);
		document.observe(UrlManager.URL_CHANGE, 				this.Z0.url);
	},
	
	W5: function() {
		this.Z0.lang = 	this.W2.bindAsRealEventListener(this);
		document.observe(LangManager.LANG_CHANGE, 				this.Z0.lang);
	},
	
	/**
	 * to overide
	 * */
	getRequiredApplicationDataKeys: function() {
		return [];
	},

	
	/**
	 * to override
	 * */
	contextualDataChangeHandler: function(name, value) {

	},
	
	/**
	 * to override
	 * */
	urlChangeHandler: function(location, data, from) {

	},
	
	/**
	 * to override
	 * */
	langChangeHandler: function(lang) {

	},
	
	/*************************************************/
	/**						PRIVATE					**/
	/*************************************************/
	
	W0: function(event) {
		var memo = event.memo;
		if (this.W1(memo.toList)) {
			this.contextualDataChangeHandler(memo.name, memo.value);
		}	
	},
	
	W3: function(event) {
		var memo = event.memo;
		this.urlChangeHandler(memo.location, memo.data, memo.from);
	},
	
	W2: function(event) {
		this.langChangeHandler(event.memo.lang);
	},
	
	W1: function(toList) {
		var len = toList.length;
		if (len == 0) {
			return true;
		} else {
			for (var i = len - 1; i >= 0; --i) {
				if (toList[i] == this.getWZName()) {
					return true;
				}
			}
		}
		return false;
	}
});


/*
Copyright (c) 2008 Florian David:
Florian David | Project Creator | http://www.first-department-of-informatics.com
   
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// JavaScript Document




/*
Copyright (c) 2008 Florian David:
Florian David | Project Creator | http://www.first-department-of-informatics.com
   
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var ScriptLoader = Class.create({

	/*************************************************/
	/**					CONSTRUCTOR					**/
	/*************************************************/
	
	/**
	 *
	 * */
	initialize:function(file, className) {
		this.Z4 = file;
		this.Z0 = className;
		this.Z1 = $H({});
		this.Z2 = null;
		
		this.Z3 = false;
	}, 
	
	/*************************************************/
	/**						PUBLIC					**/
	/*************************************************/
	
	/**
	 *
	 * */
	load: function() {
		if (this.Z4 != "") {
			console.time('ScriptLoader::load : '+this.Z4);
			
			this.Z2 = new Element('script', {src: this.Z4, type:"text/javascript", id:'js_'+this.Z0});
			// IE doesn't dispatch the load event on dynamic script loading but readystatechange
			if (Prototype.Browser.IE) {
				/*var internalThis = this;
				var count = 0;
				// we do test if the model Class is defined or not
				var interval = setInterval(function() {
					try {
						if (eval(internalThis.Z0) != undefined) {
							internalThis.W0();
							clearInterval(interval);
						}
					} catch (error) {}
					count++;
					if (count > 100 * 2) { // 2seconds
						internalThis.W1();
						clearInterval(interval);
					}
				}, 10);*/
				
				/*var str = "";
				for (var key in event) {
					str += key+' : '+event[key]+', <br>';
				}
				$$('body')[0].update(str);
				*/
				var internalThis = this;
				this.Z2.observe('readystatechange', function(event){ 
					if (!this.Z3 && (this.readyState == 'loaded' || this.readyState == 'complete')) {
						this.Z3 = true;
						if (window[internalThis.Z0] != undefined) {
							internalThis.W0();
						} else {
							internalThis.W1();
						}
					}
				});
				
				
			} else {
				this.Z1.set('load', this.W0.bindAsEventListener(this));
				this.Z1.set('error', this.W1.bindAsEventListener(this));
								
				this.Z2.observe('load', this.Z1.get('load'));
				this.Z2.observe('error', this.Z1.get('error')); 		
			}
			$$('head')[0].insert(this.Z2);
			
		} else {
		}
	},
	
	/*************************************************/
	/**					PRIVATE						**/
	/*************************************************/
	
	/**
	 *
	 * */
	W0: function(event) {
		if (Prototype.Browser.IE) {
			this.W2.bind(this).defer(ScriptLoader.SUCCEED);
		} else {
			this.W2(ScriptLoader.SUCCEED);
		}
	},
	
	/**
	 *
	 * */
	W1: function(event) {
		this.W2(ScriptLoader.FAILED);
	},
	
	W2: function(value) {
		console.timeEnd('ScriptLoader::load : '+this.Z4);
		
		if (!Prototype.Browser.IE) {
			this.Z2.stopObserving('load', this.Z1.get('load'));
			this.Z2.stopObserving('error', this.Z1.get('error'));
		}
		
		delete this.Z1;
		delete this.Z2;

		document.fire(value, {file:this.Z4});
	}
});

Object.extend(ScriptLoader, {
	SUCCEED:'scriptLoaderEvent:succeed',
	FAILED:'scriptLoaderEvent:failed'
});
	


/*
Copyright (c) 2008 Florian David:
Florian David | Project Creator | http://www.first-department-of-informatics.com
   
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files
(the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
var PluginManager = Class.create({
	
	/**
	 *
	 * */
	initialize: function() {
		this.Z2 = [];
		
		this.Z3 = [];
		this.Z4 = false;
		
		this.W1 = this.W1.bindAsEventListener(this);
		this.W0 = this.W0.bindAsEventListener(this);
		
	},
	
	init: function() {
	
		var scripts = $$('head script');
		var scriptsLen = scripts.length;
		var pluginFolder = ConfManager.getInstance().get('pluginFolder');
		var item = null;
		var reg = new RegExp(pluginFolder,"g");
		
		for (var i = 0; i < scriptsLen; i++) {
			item = scripts[i];
			var src = item.src;
			if (src.match(reg)) {
				var id = item.id;
				if (id != undefined && id != '') {
					this.declarePlugin(id, src, id, '', false, true);
				}
			}	
		}
	},
	
	/**
	 *
	 * */
	declarePlugin: function(id, src, className, version, w3cStandard, loaded) {
		Trace.writeMessage('PluginManager::declarePlugin : declare plugin '+id+' with src '+src);
		
		if (!id) {
			Trace.writeError('PluginManager::declarePlugin : id is not defined ['+id+']');
			return false;
		}
		
		if (this.Z2[id]) {
		}
		
		if (version == undefined) version = '';	
		if (loaded == undefined) loaded = false;	
		if (w3cStandard == true) {
			src = src.replace(/&amp;/g, "&");
		} 
		this.Z2[id] = $H({src: src, className:className, loaded: loaded, version:version});
	},
	
	/**
	 * return 
	 * */
	apply: function(id) {
		
		if (!this.Z2[id]) {
			return false;
		}
		
		this.Z3.push(id);
		
		if (!this.Z2[id].get('loaded')) {
			return this.W3()
		}
		return false;
	},
	
	W3: function() {
		if (!this.Z4) {
			this.Z4 = true;
			this.W2(this.Z3.shift());
		} 
		return true;
	},
	
	
	W2: function(id) {
		this.Z2[id].set('loaded', true);
	
		var file = this.Z2[id].get('src');
		if (!UrlUtil.isAbsolute(file)) {
			file = ConfManager.getInstance().get('pluginFolder')+file;
		}
		var className = this.Z2[id].get('className');
		if (this.Z2[id].get('version') != '') {
			file += '?v='+this.Z2[id].get('version');
		}
		var scriptLoader = new ScriptLoader(file, className);
		document.observe(ScriptLoader.SUCCEED, this.W1);
		document.observe(ScriptLoader.FAILED, this.W0);
		scriptLoader.load()
	},
	
	W1: function(event) {

		this.Z4 = false;		
		if (this.Z3.length == 0) {
			document.stopObserving(ScriptLoader.SUCCEED, this.W1);
			document.stopObserving(ScriptLoader.FAILED, this.W0);
			document.fire(PluginManager.READY_EVENT);
		} else {
			this.W3();
		}
	},
	
	W0: function() {
		document.stopObserving(ScriptLoader.SUCCEED, this.W1);
		document.stopObserving(ScriptLoader.FAILED, this.W0);
	}
});

/**
 * Static property
 * */
Object.extend(PluginManager, {	
	READY_EVENT:"pluginManagerEvent:ready"
});

/**
 * Singleton
 * */
SingletonUtil.execute(PluginManager);


