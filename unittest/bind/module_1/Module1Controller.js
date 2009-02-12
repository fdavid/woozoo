// JavaScript Document
var Module1Controller = Class.create(ControllerHelper, {
							   
	initialize: function($super) {
		$super();
	},
	
	init: function($super) {
		$super();
	},
	
	buttonClickHandler: function(event) {
		this.launchModelMethod('changeValue');
	},
	
	inputRefKeyupHandler: function(event) {
		var element = event.element();
		var value = element.getValue();
		this.launchModelMethod('changeValue', value);
	}
});