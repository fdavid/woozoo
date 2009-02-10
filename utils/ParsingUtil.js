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
var ParsingUtil = Class.create({});

Object.extend(ParsingUtil, {
	parseXML: function(xml, key) {

		var data = $H({});
		var elements = ParsingUtil._getNodeElement(xml, key);
		if (elements != undefined) {
			for (var i = elements.length - 1; i >= 0; --i) {
				var item = elements[i];
				var lItem = item.attributes[0];
				var value = lItem.nodeValue;
				if (value == "true" || value == "false") {
					value = BooleanUtil.toBoolean(value);	
				}
				data.set(lItem.nodeName, value);
			} 
		}
		return data;
	},
	_getNodeElement: function(xml, name){
		var splitArray = name.split('.');
		var len = splitArray.length;
		if (len > 1){
			var xmlChild = xml.getElementsByTagName(splitArray[0])[0];
			var child = splitArray.slice(1, len).join('.');
			return ParsingUtil._getNodeElement(xmlChild, child);
		} else {
			if (xml != undefined) {
				return xml.getElementsByTagName(name);
			} 
		}	
		return undefined;
	},
	parseTxt:function(txt) {
		var data = $H({});
		
		txt.split('\n').each(function(line, index) {
			var stripLine = line.strip();
			if (stripLine != "" && !stripLine.startsWith('//')) {
				var lineSplited = line.split('=');
				if (lineSplited.length >= 2) {
					var key = lineSplited[0].strip();
					var value = lineSplited.slice(1, lineSplited.length).join('=').strip();
					data.set(key, value);
				}
			}
		});
		return data;
	}
});