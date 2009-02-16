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
var PluginManager = Class.create(EventDispatcher, {
	
	/**
	 *
	 * */
	initialize: function() {
		this._plugins = [];
		this._stack = [];
		this._busy = false;
	},
	
	init: function() {
	
		var scripts = $$('head script');
		var scriptsLen = scripts.length;
		var pluginFolder = ConfManager.getInstance().get('pluginFolder');
		var item = null;
		var reg = new RegExp(pluginFolder,"g");
		
		for (var i = scriptsLen - 1; i > 0; --i) {
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
	
	isLoaded: function(id) {
		if (this._plugins[id] && this._plugins[id].get('loaded')) 
			return true;
		return false;	
	},
	
	/**
	 *
	 * */
	declarePlugin: function(id, src, className, version, w3cStandard, loaded) {
		FwkTrace.writeMessage('MA_005', id, src);//'PluginManager::declarePlugin : declare plugin '+id+' with src '+src);
		
		if (this._plugins[id]) {
			FwkTrace.writeWarning('MA_001', id);//'PluginManager::declarePlugin : plugin with id '+id+' already exist : override it');
		}
		
		if (version == undefined) version = '';	
		if (loaded == undefined) loaded = false;	
		if (w3cStandard == true) {
			src = src.replace(/&amp;/g, "&");
		} 
		this._plugins[id] = $H({src: src, className:className, loaded: loaded, version:version});
	},
	
	/**
	 * return 
	 * */
	apply: function(id) {
		
		if (Object.isArray(id)) {
			var res = [];
			for (var i = 0, len = id.length; i < len; i++) {
				res.push(this._doApply(id[i]));
			}
			for (var i = 0, len = res.length; i < len; i++) {
				if (res[i] == false) {
					return false;
				}
			}
			return true;
		} else {
			return this._doApply(id);
		}
	},
	
	_doApply: function(id) {
		if (!this._plugins[id]) {
			FwkTrace.writeError('MA_002', id);//'PluginManager::apply : Unknow plugin with id '+id);
			return false;
		}
		
		if (!this._plugins[id].get('loaded')) {
			this._stack.push(id);
			return this._load()
		} else {
			FwkTrace.writeMessage('MA_006', id); //'PluginManager::_doApply : plugin '+id+' already loaded (do not load it again)')
		}
		return false;
	},
	
	_load: function() {
		if (!this._busy) {
			this._busy = true;
			this._loadPlugin(this._stack.shift());
		} 
		return true;
	},
	
	
	_loadPlugin: function(id) {
		this._plugins[id].set('loaded', true);
	
		var file = this._plugins[id].get('src');
		if (!UrlUtil.isAbsolute(file)) {
			file = ConfManager.getInstance().get('pluginFolder')+file;
		}
		var className = this._plugins[id].get('className');
		if (this._plugins[id].get('version') != '') {
			file += '?v='+this._plugins[id].get('version');
		}
		
		var scriptLoader = new ScriptLoader(file, className);
		scriptLoader.addEventListener(Event.COMPLETE, this._loadHandler.bind(this));
		scriptLoader.addEventListener(IOErrorEvent.IO_ERROR, this._failHandler.bind(this));
		scriptLoader.load()
	},
	
	_loadHandler: function(memo) {
		FwkTrace.writeMessage('MA_003', memo.file);//'PluginManager::_loadHandler : loading file '+event.memo.file+' succeed');
		this._loadNext(); // PluginManager::_loadHandler : loading file '+event.memo.file+' succeed');
	},
	
	_failHandler: function(memo) {
		FwkTrace.writeError('MA_004', memo.file);//
		this._loadNext(); // PluginManager::_failHandler : loading file '+event.memo.file+' failed');
	},
	
	_loadNext: function() {
	
		this._busy = false;		
	
		if (this._stack.length == 0) {
			this.dispatchEvent(WZEvent.READY);
		} else {
			this._load();
		}
	}
});

/**
 * Singleton
 * */
SingletonUtil.execute(PluginManager);