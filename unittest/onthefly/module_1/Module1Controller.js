// JavaScript Document
var Module1Controller = Class.create(ControllerHelper, {
							   
	initialize: function($super) {
		$super();
	},
	
	init: function($super) {
		$super();
	},
	
	buttonLoadClickHandler: function(event) {
		Controller.getInstance().loadModule('Module2');
	},
	
	buttonUnLoadClickHandler: function(event) {
		Controller.getInstance().unLoadModule('Module2');
	},
	
	buttonUnLoad2ClickHandler: function(event) {
		Controller.getInstance().unLoadModule('Module2', false);
	}
});