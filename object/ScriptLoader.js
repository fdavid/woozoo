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

var ScriptLoader = Class.create({

	/*************************************************/
	/**					CONSTRUCTOR					**/
	/*************************************************/
	
	/**
	 *
	 * */
	initialize:function(file, className) {
		this._file = file;
		this._className = className;
		this._handlers = $H({});
		this._element = null;
		
		this._loaded = false;
	}, 
	
	/*************************************************/
	/**						PUBLIC					**/
	/*************************************************/
	
	/**
	 *
	 * */
	load: function() {
		if (this._file != "") {
			console.time('ScriptLoader::load : '+this._file);
			
			this._element = new Element('script', {src: this._file, type:"text/javascript", id:'js_'+this._className});
			// IE doesn't dispatch the load event on dynamic script loading but readystatechange
			if (Prototype.Browser.IE) {
				/*var internalThis = this;
				var count = 0;
				// we do test if the model Class is defined or not
				var interval = setInterval(function() {
					try {
						if (eval(internalThis._className) != undefined) {
							internalThis._loadedHandler();
							clearInterval(interval);
						}
					} catch (error) {}
					count++;
					if (count > 100 * 2) { // 2seconds
						internalThis._errorHandler();
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
				this._element.observe('readystatechange', function(event){ 
					if (!this._loaded && (this.readyState == 'loaded' || this.readyState == 'complete')) {
						this._loaded = true;
						if (window[internalThis._className] != undefined) {
							internalThis._loadedHandler();
						} else {
							internalThis._errorHandler();
						}
					}
				});
				
				
			} else {
				this._handlers.set('load', this._loadedHandler.bindAsEventListener(this));
				this._handlers.set('error', this._errorHandler.bindAsEventListener(this));
								
				this._element.observe('load', this._handlers.get('load'));
				this._element.observe('error', this._handlers.get('error')); 		
			}
			$$('head')[0].insert(this._element);
			
		} else {
			FwkTrace.writeError('M6_002');//ScriptLoader::load : nothing to load
		}
	},
	
	/*************************************************/
	/**					PRIVATE						**/
	/*************************************************/
	
	/**
	 *
	 * */
	_loadedHandler: function(event) {
		if (Prototype.Browser.IE) {
			this._fire.bind(this).defer(ScriptLoader.SUCCEED);
		} else {
			this._fire(ScriptLoader.SUCCEED);
		}
	},
	
	/**
	 *
	 * */
	_errorHandler: function(event) {
		this._fire(ScriptLoader.FAILED);
	},
	
	_fire: function(value) {
		console.timeEnd('ScriptLoader::load : '+this._file);
		
		if (!Prototype.Browser.IE) {
			this._element.stopObserving('load', this._handlers.get('load'));
			this._element.stopObserving('error', this._handlers.get('error'));
		}
		
		delete this._handlers;
		delete this._element;

		document.fire(value, {file:this._file});
	}
});

Object.extend(ScriptLoader, {
	SUCCEED:'scriptLoaderEvent:succeed',
	FAILED:'scriptLoaderEvent:failed'
});
	