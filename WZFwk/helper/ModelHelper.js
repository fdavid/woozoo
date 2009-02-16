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

var ModelHelper = Class.create(Helper, {

	/*************************************************/
	/**					CONSTRUCTOR					**/
	/*************************************************/
	
	/**
	 * to override
	 * */
	initialize:function($super) {
		$super();		
		this._handler = {};
	},
	
	/*************************************************/
	/**						PUBLIC					**/
	/*************************************************/	
	
	/**
	 * this method is called when you unload a module
	 * */
	destroy: function() {
		Model.getInstance().removeEventListener(Event.CHANGE, this._handler.data);
		
		if (UrlManager.getInstance().getIsUsable()) {
			UrlManager.getInstance().removeEventListener(Event.CHANGE, this._handler.url);
		}
		if (ConfManager.getInstance().get('useLang') == true) {
			LangManager.getInstance().removeEventListener(Event.CHANGE, this._handler.lang);
		}
		// free memory
		delete this._handler;
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
				this._initDataListener();
			} else {
				this._initDataListener.bind(this).defer();
			}
		}
		
		// lang
		if (listenLang && ConfManager.getInstance().get('useLang')) {
			if (listenLangNow) {
				this._initLangListener();
			} else {
				this._initLangListener.bind(this).defer();
			}
		}

		// url
		if (listenUrl && UrlManager.getInstance().getIsUsable()) {
			if (listenUrlNow) {
				this._initUrlListener();
			} else {
				this._initUrlListener.bind(this).defer();
			}
		}
	},
	
	_initDataListener: function() {
		this._handler.data =  	this._contextualDataChangeHandler.bind(this);//.bindAsRealEventListener(this);
		Model.getInstance().addEventListener(Event.CHANGE, this._handler.data);
	},
	
	_initUrlListener: function() {
		this._handler.url = 	this._urlChangeHandler.bindAsRealEventListener(this);
		UrlManager.getInstance().addEventListener(Event.CHANGE, this._handler.url);
		
	},
	
	_initLangListener: function() {
		this._handler.lang = 	this._langChangeHandler.bindAsRealEventListener(this);
		LangManager.getInstance().addEventListener(Event.CHANGE, this._handler.lang);
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
	
	_contextualDataChangeHandler: function(memo) {
		if (this._isContextualDataForMe(memo.toList)) {
			this.contextualDataChangeHandler(memo.name, memo.value);
		}	
	},
	
	_urlChangeHandler: function(memo) {
		this.urlChangeHandler(memo.location, memo.data, memo.from);
	},
	
	_langChangeHandler: function(memo) {
		this.langChangeHandler(memo.lang);
	},
	
	_isContextualDataForMe: function(toList) {
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
