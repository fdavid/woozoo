// JavaScript Document
var Module2Controller = Class.create(ControllerHelper, {
							   
	initialize: function($super) {
		$super();
	},
	
	init: function($super) {
		$super();
	},
	
	addButtonClickHandler: function(event) {
		var nextId = Controller.getInstance().getNextMultitonId('Module1');
		var tpl = '<button id="button_[]">Button []</button>';
		tpl = tpl.replace(/\[\]/g, nextId);
		
		$('buttonsContainer').insert({bottom: tpl});
		
		Controller.getInstance().refreshModule('Module1');
	}
});