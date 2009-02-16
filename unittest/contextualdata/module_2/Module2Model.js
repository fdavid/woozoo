// JavaScript Document
var Module2Model = Class.create(ModelHelper, {
							   
	initialize: function($super) {
		$super();
	},
	
	contextualDataChangeHandler:function($super, name, value) {
		trace(name+' '+value)
	},
	
	init: function($super) {
		$super();
  	}
});