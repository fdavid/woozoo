// JavaScript Document
var Module1Controller = Class.create(ControllerHelper, {
							   
	initialize: function($super) {
		$super();
	},
	
	init: function($super) {
		$super();
	},
	
	buttonExchangeClickHandler: function(event) {
		this.launchModelMethod('exchange');
	}
});