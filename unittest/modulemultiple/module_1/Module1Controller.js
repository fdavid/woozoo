// JavaScript Document
var Module1Controller = Class.create(ControllerHelper, {
							   
	initialize: function($super) {
		$super();
	},
	
	init: function($super) {
		$super();
	},
	
	buttonClickHandler: function(event) {
		trace('You click on module multiple with id '+this.getWZMultitonId());
		this.launchModelMethod('doSomething');
	}
});