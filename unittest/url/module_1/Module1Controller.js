// JavaScript Document
var Module1Controller = Class.create(ControllerHelper, {
							   
	initialize: function($super) {
		$super();
	},
	
	init: function($super) {
		$super();
	},
	
	buttonTotoClickHandler: function(event) {
		UrlManager.getInstance().setUrl('toto', {toto:42});
	},
	
	button42ClickHandler: function(event) {
		UrlManager.getInstance().setUrl('42');
	}
});