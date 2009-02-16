// JavaScript Document
var Module1Controller = Class.create(ControllerHelper, {
							   
	initialize: function($super) {
		$super();
	},
	
	init: function($super) {
		$super();
	},
	
	loadPluginEffectClickHandler: function(event) {
		PluginManager.getInstance().apply('Effect');
		PluginManager.getInstance().addEventListener(WZEvent.READY, this.readyHandler.bind(this));
	},
	
	loadPluginScriptaculousClickHandler: function(event) {
		PluginManager.getInstance().apply('Scriptaculous');
	},
	
	loadPluginScriptaculousEffectClickHandler: function(event) {
		PluginManager.getInstance().apply(['Scriptaculous', 'Effect']);
	},
	
	readyHandler: function() {
		alert('plugin effect loaded');
	}
});