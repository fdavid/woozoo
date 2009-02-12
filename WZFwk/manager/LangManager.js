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

var LangManager = Class.create({

	/*************************************************/
	/**					CONSTRUCTOR					**/
	/*************************************************/
	
	/**
	 *
	 * */
	initialize: function() {
		this._isInit = true;

		this._file = "";
		this._data = $H({}); 
		this._addData = [];

		this._lang = "";
		
		var confManager = ConfManager.getInstance();
		this._defaultLang = 	confManager.get('defaultLang');
		this._langFileExt = 	confManager.get('langFileExtension');
		this._parsingMethod = 	confManager.get('langParseMethod');
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
			lang =  this._defaultLang ? this._defaultLang : LangManager.DEFAULT_LANG;
		}
		// create the array in case it is the first time we want to insert something on it
		if (this._addData[lang] == undefined) {
			this._addData[lang] = $H({});
		}
		// set the lang of the LangManager, will be ovveriden later in case the langFile is set
		if (this._lang == "") {
			this._lang = lang;
		}
		// add the data to the array
		this._addData[lang].set(key, value);
	},
	
	/**
	 *
	 * */
	init: function(file) {
		this._lang = ConfManager.getInstance().get('lang');
		if (!this._lang) {
			FwkTrace.writeWarning('M2_006');
			return false;
		}
		this._file = this._getLangFileName();
		this._load();	
		return true;	
	},
	
	/**
	 *
	 * */
	setLang: function(lang) {
		this._lang = lang;
		var file = this._getLangFileName();
		if (file != this._file) {
			this._file = file;
			this._load();
		} else {
			FwkTrace.writeWarning('M2_001', lang); //LangManager::setLang : lang: "+lang+' already loaded
		}
	},
	
	/**
	 *
	 * */
	get: function(name) {
		var data = this._data.get(name);
		if (data == undefined) {
			data = this._addData[this._lang].get(name);
			if (data == undefined) {
				FwkTrace.writeWarning('M2_002', name);//"LangManager::get : not value defined for key ["+name+"]");
			}
		}
		return data;
	},
	
	/**
	 * 
	 * */
	getLang: function(){
		return this._lang;
	},
	
	/*************************************************/
	/**					PRIVATE						**/
	/*************************************************/

	
	/**
	 *
	 * */
	_getLangFileName: function() {
		return ConfManager.getInstance().get('langFolder')+this._lang+"."+this._langFileExt;
	}, 
	
	/**
	 *
	 * */
	_load: function() {
		FwkTrace.writeMessage('M2_003', this._lang);//'LangManager::_load : loading langage '+this._lang);
		new Ajax.Request(this._file, {
		  	method: 'get',
		  	onSuccess: this._loadSuccessHandler.bindAsEventListener(this),
			onFailure: this._loadFailHandler.bindAsEventListener(this),
			evalJS: false,
			evalJSON: false,
			sanitizeJSON: false
		});
	},
	
	/**
	 *
	 * */
	_loadSuccessHandler: function(transport) {
		
		switch (this._parsingMethod) {
			case LangManager.PARSE_LIKE_XML:
				this._data = ParsingUtil.parseXML(transport.responseXML, 'item');
				break;
			case LangManager.PARSE_LIKE_FLAT:
				this._data = ParsingUtil.parseTxt(transport.responseText);
				break;
			default:
				FwkTrace.writeError('M2_004');// 'LangManager::_loadSuccessHandler : unknow parsing method');
				break;	
		}			
		if (this._isInit) {
			this._ready();
		} else {
			ModuleManager.getInstance().executeLangBindings();
		}
		document.fire(LangManager.LANG_CHANGE, {lang: this._lang});
	},
	
	/**
	 *
	 * */
	_loadFailHandler: function(transport) {
		FwkTrace.writeError('M2_005', this._file, transport.status); //lang file ['+this._file+'] was not loaded : '+transport.status
	},
	
	/**
	 *
	 * */
	_ready: function() {
		this._isInit = false;
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