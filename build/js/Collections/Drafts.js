/**
 *	Deprecated, should integrate in Messages.
 **/

Cloudwalkers.Collections.Drafts = Backbone.Collection.extend({

	'model' : Cloudwalkers.Models.Message,
	'name' : null,

	'nextPageParameters' : null,
	'canHaveFilters' : false,

	'filter' : '',

	'initialize' : function (models, options)
	{
		this.name = options.name;
		this.filter = typeof (options.filter) != 'undefined' ? options.filter : '';

		var d1;
		var d2;

		this.comparator = function (message1, message2)
		{
			d1 = message1.date (false);
			d2 = message2.date (false);

			return (d1 ? d1.getTime () : 0) < (d2 ? d2.getTime () : 0) ? 1 : -1;
		};
	},

	'sync' : function(method, model, options) 
	{
		var self = this;
		var passtrough = options.success;
		options.success = function (response)
		{
			passtrough (response.messages);
		}

		//var parameters = { 'account' : Cloudwalkers.Session.getAccount ().get ('id') };
		var whos = this.filter;

		var fetch_url = CONFIG_BASE_URL + 'json/account/' + Cloudwalkers.Session.getAccount ().get ('id') + '/drafts/' + whos;

		// Default JSON-request options.
		var params = _.extend({
			type:         'POST',
			dataType:     'json',
			url:			method == 'read' ? fetch_url : '',
			cache: false
		}, options);

		// Make the request.
		return $.ajax(params);
	},

	'update' : function (parameters)
	{
		if (typeof (parameters) == 'undefined')
		{
			parameters = {};
		}

		parameters.remove = false;
		this.fetch (parameters);
	}

});