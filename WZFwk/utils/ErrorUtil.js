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
var ErrorUtil = Class.create({});

Object.extend(ErrorUtil, {
	get: function(error) {
		if (Prototype.Browser.IE) {
			return error.description;
		} else {
			var txt = error.message+' (line '+error.lineNumber+', file  '+error.fileName +')';
			if (error.stack) {
				txt += '<br><em style="text-decoration:underline">Stack strace :</em><br>'+error.stack.replace(/\n/g, "<br>");
			}
			return txt;
		}
	}
});