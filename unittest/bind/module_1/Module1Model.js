// JavaScript Document
var Module1Model = Class.create(ModelHelper, {
							   
	initialize: function($super) {
		$super();
	},
	
	contextualDataChangeHandler:function($super, name, value) {

	},
	
	init: function($super) {
		$super();
		this.set_divInitialize(this.get_inputValue());
  	},
  	
  	changeValue: function(data) {
  		data = (data == undefined) ? '42' : data
  		this.set_inputValue(data);
  	}
});