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

var BindingUtil = Class.create({});

Object.extend(BindingUtil, {

	bindingSetHash: {value: 'setValue(%s)', 	style: 'setStyle(%s)', 	innerHTML: 'update(%s)'	},
	bindingGetHash: {value: 'getValue()', 		style: 'getStyles()', 	innerHTML:'innerHTML'	},
	
	// to optimize
	getSuffix: null,
	setSuffix: null,
	
	
	
	/**
	 *
	 * */
	bind: function(ids, attributes, propertie, modelInstance, hasGetter, hasSetter, initPropertie, optionals) {
		
		if (FunctionUtil.hasEmptyValue(arguments)) {
			FwkTrace.writeError('M8_001');//BindingUtil::bind : args are not valid
			return false;	
		}
		
		if (BindingUtil.getSuffix == null) {
			var confManager = ConfManager.getInstance();
			BindingUtil.getSuffix = confManager.get('getSuffix');
			BindingUtil.setSuffix = confManager.get('setSuffix');
		}
		
		var go = true;
		for (var index = 0, idsLen = ids.length; index < idsLen; index++) { 
			var id = ids[index];
			
			if (elementExists(id) == false) {
				if (optionals[index] == false) {
					FwkTrace.writeError('M8_002', id);//BindingUtil::bind : unable to find the element with id %s
				} else {
					FwkTrace.writeWarning('M8_002', id+' (the element is set to optional)');//BindingUtil::bind : unable to find the element with id %s
				}
				ids.splice(index, 1);
				attributes.splice(index, 1);
				optionals.splice(index, 1);
			}
		}
		if (ids.length == 0) return false;
		
		
		
		if (hasGetter) {
			if (initPropertie) {
				var attrGet = BindingUtil._resolveMethod(attributes[0], 'get');
		
				// for the propertie
				
				try {
					// WARNING : the initialize value of the propertie is set to first id value
					if (attrGet == attributes[0]) {
						modelInstance["____"+propertie] = _$(ids[0])[attrGet];
					} else {
						var split = attrGet.replace(")", "").split("(");
						modelInstance["____"+propertie] = $(ids[0])[split[0]](split[1]);;
					}
				} catch (error) {
					FwkTrace.writeError('M8_010', attributes[0], ids[0]);//'BindingUtil::bind : cannot initializing binding data (does the attribute '+attributes[0]+' exist on the element '+ids[0]+' ?)');
				}
			} else {
				modelInstance["____"+propertie] = undefined;
			}	
		
			// for the getter
			try {
				modelInstance[BindingUtil.getSuffix + propertie] = 	function() {
																		return 	modelInstance["____"+propertie];		
																	}			
			} catch (error) {
				FwkTrace.writeError('M8_011', ErrorUtil.get(error)); //BindingUtil::bind : 
			}
		}
		
		if (hasSetter) {
			//for the setter
			try {
				var setterFunction = 	function(value) {
											if (hasGetter) {
												modelInstance["____"+propertie] = value;
											}
											
											ids.each(function(id, index) {
												var element = $(id);				
												var attrSet = BindingUtil._resolveMethod(attributes[index], 'set');
												var attrGet = BindingUtil._resolveMethod(attributes[index], 'get');
												if (attrGet != attributes[index]) {
													var attrGetArray = attrGet.replace(")", "").split("(");
													var compareValue = element[attrGetArray[0]](attrGetArray[1]);
												} else {
													var compareValue =  element[attrGet];
												}
												// compare the new value and the one already in place
												if (value != compareValue) {
													if (attrSet == attributes[index]) {
														element[attrSet] = value; //modelInstance["____"+propertie]; 									
													} else {
														var split = attrSet.replace(")", "").split("(");
														element[split[0]](split[1].replace('%s', value/*modelInstance["____"+propertie]*/));
													}
												}
											});
										};
										
				modelInstance[BindingUtil.setSuffix + propertie] = setterFunction;
			} catch (error) {
				FwkTrace.writeError('M8_003', ErrorUtil.get(error));//BindingUtil::bind : Unable to execute %s
			}
		}	
		return true;
	},
	
	/**
	 *
	 * */
	bindListener: function(id, event, handler, controllerInstance, optional) {
		if (FunctionUtil.hasEmptyValue(arguments)) {
			FwkTrace.writeError('M8_004');//BindingUtil::bindListener
			return false;	
		}
		
		if (!elementExists(id)) {
			if (optional == false) {
				FwkTrace.writeError('M8_005', id);//BindingUtil::bindListener : Unable to find element with id %s
			} else {
				FwkTrace.writeWarning('M8_005', id+' (the element is set to optional)');//BindingUtil::bindListener : Unable to find element with id %s
			}
			return false;
		}
		if (!controllerInstance[handler]) {
			FwkTrace.writeError('M8_006', handler);//BindingUtil::bindListener : Unable to execute %s (does the method exists on the controller ?)
			return false;
		}

		Event.observe.defer(id, event, controllerInstance[handler].bindAsRealEventListener(controllerInstance));
		
		return true;
	},
	
	/**
	 *
	 * */
	bindLang: function(id, attribute, propertie) {
		if (FunctionUtil.hasEmptyValue(arguments)) {
			Trace.writeError('M8_007');//BindingUtil::bindLang
			return false;	
		}
		if (!elementExists(id)) {
			FwkTrace.writeError('M8_008', id);//BindingUtil::bindLang : Unable to find element with id %s
			return false;
		}
		
		var attr = BindingUtil._resolveMethod(attribute, 'set');
		if (attr == attribute) {
			$(id)[attr] = LangManager.getInstance().get(propertie);
		} else {
			var split = attr.replace(")", "").split("(");
			$(id)[split[0]](split[1].replace('%s', LangManager.getInstance().get(propertie)));
		}
		
		return true;
	}, 
	
	/**
	 *
	 * */
	_resolveMethod: function(name, setOrGet) {
		var attr, split = [];
		if (setOrGet == 'set') {
			attr = this.bindingSetHash[name];
			// try to resolve style
			if (attr == undefined) {
				// style
				split = name.split(':');	
				if (split[0] == 'style') {
					attr = 'setStyle('+split[1]+':%s)';
				}
			}
		} else {
			attr = this.bindingGetHash[name];
			// try to resolve style
			
			if (attr == undefined) {
				split = name.split(':');	
				if (split[0] == 'style') {
					attr = 'getStyle('+split[1]+')';
				}
			}
		}
		
		if(attr == undefined) {
			attr = name;	
		}
		return attr;
	}
});