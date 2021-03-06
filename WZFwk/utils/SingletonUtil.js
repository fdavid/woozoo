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

var SingletonUtil = Class.create({});

Object.extend(SingletonUtil, {
	execute: function(object, runningMethod, runningMethodArgs) {
		try {
			Object.extend(object, {
				instance: null,
				
				getInstance: function() {
					if (object.instance == null) {
						object.instance = new object();
						if (runningMethod != undefined && runningMethod != "") {
							// this the is for our friendly friend IE 
							runningMethodArgs = (runningMethodArgs != undefined) ? runningMethodArgs : [];
							Function.prototype.apply.call(object.instance[runningMethod], object.instance, runningMethodArgs);
						}
					}
					return object.instance;
				}
			});
		} catch (error) {
			FwkTrace.writeError('M9_001', ErrorUtil.get(error));//'SingletonUtil::doSingleton '+error);
		}
	}
});
