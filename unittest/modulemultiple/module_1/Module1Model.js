// JavaScript Document
var Module1Model = Class.create(ModelHelper, {
							   
	initialize: function($super) {
		$super();
	},
	
	contextualDataChangeHandler:function($super, name, value) {

	},
	
	init: function($super) {
		$super();
  	},
  	
  	doSomething: function() {
  		trace('you are in do Something in model with id '+this.getWZMultitonId());
  	}
});