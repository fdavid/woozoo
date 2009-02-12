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

var ConfManager = Class.create({

	/*************************************************/
	/**					CONSTRUCTOR					**/
	/*************************************************/
	
	/**
	 * Constructor
	 * */
	initialize: function() {
		this._file = ""; // the name of the config file
		this._data = $H({}); // the framework configuration data which are on the config file
		this._applicationData = $H({}); // the application configuuration data that are on the config file (these are you data)
		this._isReady = false; // is the ConfManager ready
		this._requiredKey = $w('version fwkFolder mvcFile'); // the key required to use the framework
		// default value if some data are undefined
		this._defaultIfUndefined = 	{
									// url
										// mvc
										// baseurl
										// addBaseUrl
									useUrl: false,	
									
									// folder
										// langFolder
										// fwkFolder
										// pluginFolder
		
									// debug
									debugWay: 'console',
									debug: false, 
									debugFwk: false, 
									debugBinding: false, 
									debugLaunchMethod:false, 
									showTiming:false,
									
									// lang
									useLang: false, 
									langFileExtension: 'conf',
									langParseMethod: 'flat',
									defaultLang: 'fr_FR', 

									
									// compression
									useDynCompression: false,
										// dynCompressionUrl
									usePacker: false,
									useCache: false,
									compressedName:'compressed', 

									// view
									viewFileExt:'html',
									
									// getset										
									getSuffix:'get_', 
									setSuffix:'set_'
									};
		this._urls = $w('fwkFolder mvcFile pluginFolder langFolder dynCompressionUrl'); // key that contains url as value
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
			this._data = $H(options);
		}
		if (applicationOptions != undefined && applicationOptions != "" && applicationOptions != null) {
			this._applicationData = $H(applicationOptions);
		}
		
		this._file = file;
		this._load();		
	},
	
	/**
	 * Getter function to know if the ConfManager id ready
	 *
	 * @return (boolean) : Am I ready ?
	 * */
	isReady: function() {
		return this._isReady;
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
		return this._get(name, this._data);
	},
	
	/**
	 *
	 * */
	getApplicationData: function(name) {
		return this._get(name, this._applicationData);
	},
	
	/*************************************************/
	/**					PRIVATE						**/
	/*************************************************/
	
	/**
	 *
	 * */
	_get: function(name, hash, force){
		if (force == undefined) force = false;
		if (hash == undefined) return undefined;
		
		if (this._isReady || force) {
			var value = hash.get(name);
			if (value == undefined) {
				FwkTrace.writeWarning('MB_001', name);//"ConfManager::_get : key "+name+" is not defined in Conf file");
			} 
			return value;
		}
		return undefined;
	},
	
	/**
	 *
	 * */
	_load: function() {

		new Ajax.Request(this._file+'?v='+new Date().getTime(), {
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
		var data = ParsingUtil.parseXML(transport.responseXML, 'framework.item').toObject();
		this._data.update(data);
		
		var applicationData = ParsingUtil.parseXML(transport.responseXML, 'application.item').toObject();
		this._applicationData.update(applicationData);
		
		if (!this._validRequiredKey()) {
			return;
		} 
		this._completeUnsettedValue();
		this._checkUrl();
		this._ready(); 
	},
	
	/**
	 *
	 * */
	_validRequiredKey: function() {
		var bool = true;
		this._requiredKey.each(function(value) {
			if (this._get(value, this._data, true) == undefined) {
				bool = false;
				throw $break;
			}
		}.bind(this));
		return bool;
	},
	
	/**
	 *
	 * */
	_completeUnsettedValue: function() {
		var defaultPair = this._defaultIfUndefined;
		for (var key in defaultPair) {
			if (this._data.get(key) == undefined) {
				this._data.set(key, defaultPair[key]);
			}
		}
		
		
		/*
		this._defaultIfUndefined.each(function(pair) {
			if (this._data.get(key) == undefined) {
				this._data.set(key, this._defaultIfUndefined.get(key));
			}
		}.bind(this));
		*/
	},
	
	/**
	 * 
	 * */
	_checkUrl: function() {
		if (this._data.get('addBaseUrl')) {
			var urls = this._urls;
			var baseUrl = this._data.get('baseUrl');
			
			var urlUtil_makeAbsolute_function = UrlUtil.makeAbsolute;
			
			for (var i = urls.length-1; i >= 0; --i) {
				var url = urls[i]; 
				var value = this._data.get(url);
				if (value != undefined) {
					this._data.set(url, urlUtil_makeAbsolute_function(value, baseUrl));
				}
			}
			/*this._urls.each(function(value) {
				if (this._data.get(value) != undefined) {
					this._data.set(value, UrlUtil.makeAbsolute(this._data.get(value), this._data.get('baseUrl')));
				}
			}.bind(this));
			*/
		}
	},
	
	/**
	 *
	 * */
	_loadFailHandler: function(transport) {
		alert('conf file ['+this._file+'] was not loaded : '+transport.status);
	},
	
	/**
	 *
	 * */
	_ready: function() {

		this._isReady = true;
		FwkTrace.writeMessage('MB_002', this._file);//"ConfManager::_ready : loading "+this._file+" succeed");
		// IE is some time to busy to fire the event, so we let him some time to breathe...
		if (Prototype.Browser.IE) {
			this._fire.bind(this).defer();
		} else {
			this._fire();
		}
	},
	
	/**
	 *
	 * */
	_fire: function() {
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