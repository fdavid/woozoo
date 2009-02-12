// JavaScript Document
var Module1Model = Class.create(ModelHelper, {
							   
	initialize: function($super) {
		$super();
	},
	
	contextualDataChangeHandler:function($super, name, value) {

	},
	
	urlChangeHandler: function(location, data, from) {
		alert('urlChangeHandler : location ['+location+'], data ['+data+'], from ['+from+']');
	},
	
	init: function($super) {
		$super();
  	}
});