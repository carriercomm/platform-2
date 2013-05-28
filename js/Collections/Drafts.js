Cloudwalkers.Collections.Drafts = Backbone.Collection.extend({

	'model' : Cloudwalkers.Models.Message,
	'name' : null,

	'nextPageParameters' : null,

	'initialize' : function (models, options)
	{
		this.name = options.name;
	},

	'sync' : function(method, model, options) 
	{
		var self = this;
		var passtrough = options.success;
		options.success = function (response)
		{

			//console.log (response);
			passtrough (response.messages);
		}

		var parameters = { 'account' : 1 };

		var fetch_url = CONFIG_BASE_URL + 'json/drafts?' + jQuery.param (parameters);

		// Default JSON-request options.
		var params = _.extend({
			type:         'POST',
			dataType:     'json',
			url:			method == 'read' ? fetch_url : '',
		}, options);

		// Make the request.
		return $.ajax(params);
	}

});