/*
Copyright (c) 2008 Florian David:
Florian David | Project Creator | http://www.first-department-of-informatics.com | http://woozoo-project.org
   
Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

/**
 * The ControllerHelper is an abstract class
 * Every module you will do extends of this class
 * */
var ControllerHelper = Class.create(Helper, {

	/*************************************************/
	/**					CONSTRUCTOR					**/
	/*************************************************/
	
	/**
	 * This is the constructor of the class
	 * You have to override this method in your module controller
	 * and set the this.NAME attribute to the name of the module controller name.
	 *
	 * You will do it like that :
	 * initialize: function($super) {
	 *		$super();
	 *		this.NAME = 'TheNameOfTheModuleControllerClass';
	 * }
	 * */
	initialize: function($super) {
		$super();
	},
	
	/**
	 * This is the destructor of the class
	 * */
	destroy: function() {
		
	},
	
	/*************************************************/
	/**						PUBLIC					**/
	/*************************************************/
	
	/**
	 * This is the init method
	 * This method will be lauch right after the module is loaded
	 * so you can do on it everything related to the initializatrion of you module.
	 *
	 * You have to override it like that 
	 * init: function($super) {
	 *	$super();
	 * 	this.myInitFunction();
	 * 	this.myOtherInitFunction();
	 * }
	 * */
	init:function() {
		
	},
	
	/**
	 * This method is a shortcut to lauch a model method of the current module
	 * In your controller, your are using it like that
	 * this.launchModelMethod(this.NAME, "setCopyValue", value, {tata: 'toto'});
	 *
	 * @arguments[0] (string) : the name of the Controller (this.NAME)
	 * @arguments[1] (string) : the name of the module model method you wish to lauch
	 * @arguments[...] (any type) : some args you wish to pass to the module model method
	 *
	 * return void
	 * */
	launchModelMethod: function() {
		return Controller.getInstance().launchModelMethod(this.getWZName(), this.getWZMultitonId(), arguments);
	}									
});