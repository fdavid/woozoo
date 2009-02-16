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

// JavaScript Document

//== IF (NO_FWK_TRACE) ==//

var FwkTrace = Class.create(EventDispatcher, {
	ready:function() {
		this.dispatchEvent(WZEvent.READY);
	}
});

SingletonUtil.execute(FwkTrace);

Object.extend(FwkTrace, {
	
	_data:$H({}),
	
	usable:false,
	
	/**
	 *
	 * */
	init:function() {
		
		this.usable = ConfManager.getInstance().get('debugFwk');

		if (this.usable) {
			new Ajax.Request(ConfManager.getInstance().get('fwkFolder')+"trace/trace.txt", {
			  	method: 'get',
			  	onSuccess: this._loadSuccessHandler.bindAsEventListener(this),
				onFailure: this._loadFailHandler.bindAsEventListener(this)
			});
		}	
	},
	
	/**
	 *
	 * */
	_loadSuccessHandler: function(transport) {
		this._data = ParsingUtil.parseTxt(transport.responseText);
		FwkTrace.getInstance().ready();
	},
	
	/**
	 *
	 * */
	_loadFailHandler: function() {
		alert('FwkTrace::_loadFailHandler');
	},
	
	/**
	 *
	 * */
	_get: function(key) {
		var value = this._data.get(key);
		if (value == undefined) {
			value = "";
			Trace.writeWarning('FwkTrace::_get : undefined value for key '+key);
		}
		return value;
	},
	
	/**
	 *
	 * */
	writeMessage: function() {
		if (this.usable) {
			Trace.writeMessage(this._prepare(arguments));
		}
	},
	
	/**
	 *
	 * */
	writeWarning: function() {
		if (this.usable) {
			Trace.writeWarning(this._prepare(arguments));
		}
	},
	
	/**
	 *
	 * */
	writeError: function() {
		if (this.usable) {
			Trace.writeError(this._prepare(arguments));
		}
	},
	
	/**
	 *
	 * */
	_prepare: function(args) {
		var message = this._get(args[0])+" ("+args[0]+")";
		var array = Array.prototype.slice.call(args).slice(1, args.length);
		
		for (var i = 0, len = array.length; i < len; i++) {
			message = message.replace("%s", array[i]);
		}
		return message;
	} 
});

//== ENDIF (NO_FWK_TRACE) ==//
