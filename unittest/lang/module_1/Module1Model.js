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
  	
  	changeLang: function() {
		LangManager.getInstance().setLang('en_EN');
  	}
});