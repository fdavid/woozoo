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

var Model = Class.create({

	/*************************************************/
	/**					CONSTRUCTOR					**/
	/*************************************************/
	
	/**
	 *
	 * */
	initialize: function() {
		this._contextualDatas = {};
	},
	
	/*************************************************/
	/**						PUBLIC					**/
	/*************************************************/
	
	/**
	 *
	 * */
	init: function() {
		this._ready();
	},
	
	/**
	 * This method is useful if you want to share some data between different modelHelper
	 * Each contextualDataChangeHandler will receive the message that the value changed
	 * 
	 * @param name (string) : The name of the contextual data
	 * @param value (somethig) : The value of the contextual data
	 * @return void
	 * */
	setContextualData: function(name, value, toList) {
		toList = (toList == undefined) ? [] : toList;
		toList = (Object.isString(toList)) ? [toList] : toList;

		FwkTrace.writeMessage("M7_001", name, value); //"Model::setContextualData : new data with key = ["+name+"], value = ["+value+"]");
		this._contextualDatas.name = value;
		document.fire(Model.CONTEXTUAL_DATA_CHANGE_EVENT, {name: name, value:value, toList: toList});
	},
	
	/**
	 * This method is useful to get a value from a contextual data
	 *
	 * @param name (string) : The name of the contextual data
	 * @return string : the value corresponding to the contextual data asked for
	 * */
	getContextualData: function(name) {
		var value = this._contextualDatas.name;
		if (value == undefined) {
			FwkTrace.writeWarning("M7_002", name);
		} 
		return value;
	},
	
	/**
	 * This method is used to asked the controller to lauch a method
	 * The Model doesn't know the COntroller, so we fire an event that is observed by the Controller
	 *
	 * @param arguments[0] (array) : Array of data
	 * */
	launchControllerMethod: function() {
		document.fire(Model.LAUNCH_CONTROLLER_METHOD_EVENT, {name: arguments[0], multitonId: arguments[1], args: arguments[2]});
	},
	
	/*************************************************/
	/**					PRIVATE						**/
	/*************************************************/
	
	/**
	 *
	 * */
	_ready: function() {
		document.fire(Model.MODEL_READY_EVENT);
	}
});

/**
 *
 * */
Object.extend(Model, {
	MODEL_READY_EVENT : 'model:ready',
	CONTEXTUAL_DATA_CHANGE_EVENT : 'model:contextualDataChange',
	LAUNCH_CONTROLLER_METHOD_EVENT : 'model:launchControllerMethod'
});

/**
 *
 * */
SingletonUtil.execute(Model);