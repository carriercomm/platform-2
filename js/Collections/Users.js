Cloudwalkers.Collections.Users = Backbone.Collection.extend({

	'model' : Cloudwalkers.Models.User,
	'typestring' : "users",
	'modelstring' : "user",
	'processing' : false,

	'initialize' : function (models, options)
	{	
		
		// Override type strings if required
		if(options) $.extend(this, options);
		
		// Global collection gets created before session build-up
		if( Cloudwalkers.Session.user.account)
		{
			Cloudwalkers.Session.getUsers().listenTo(this, "add", Cloudwalkers.Session.getUsers().distantAdd);
		}
	},
	
	/*'url' : function()
	{
		return CONFIG_BASE_URL + 'json/account/' + Cloudwalkers.Session.getAccount ().id + '/' + this.typestring + this.parameters;
	},*/
	
	 'url' : function (params)
    {
        return this.endpoint?
        
        	CONFIG_BASE_URL + 'json/accounts/' + Cloudwalkers.Session.getAccount ().id + '/' + this.typestring + '/' + this.endpoint :
        	CONFIG_BASE_URL + 'json/accounts/' + Cloudwalkers.Session.getAccount ().id + '/' + this.typestring + (this.parameters? "/" + this.parameters: "");
    },
	
	'parse' : function (response)
	{
		this.parameters = "";
		this.processing = false;
		
		return response[this.typestring]?
		
			response[this.typestring]: response.account[this.typestring];
	},
	
	'distantAdd' : function(model)
	{
		if(!this.get(model.id)) this.add(model);	
	},
	
	/*'sync' : function (method, model, options) {
		
		// Store Local
		if( method == "read")
			Store.get(this.url(), null, function(data)
			{
				if(data) this.add(data);

			}.bind(this));
		
		return Backbone.sync(method, model, options);
	},*/
	
	'sync' : function (method, model, options)
	{
		if(method == "read")
		{
			this.processing = true;
			this.parameters = (options.parameters)? "?" + $.param(options.parameters): "";
		}

		return Backbone.sync(method, model, options);
	},
	
	'updates' : function (ids)
	{
		for(n in ids)
		{
			var model = this.get(ids[n]);
			
			if(model)
			{
				// Store with outdated parameter
				Store.set(this.typestring, {id: ids[n], outdated: true});
				
				// Trigger active models
				model.outdated = true;
				model.trigger("outdated");
			}
		}
	},

	'outdated' : function(id)
	{
		// Collection
		if(!id) return this.filter(function(model){ return model.outdated});
		
		// Update model
		var model = this.updates([id]);
	},
	
	'touchresponse' : function(url, collection, response)
	{
		// Get ids
		var ids = response.account[this.typestring];
		
		// Store results based on url
		Store.set("touches", {id: url, modelids: ids, cursor: this.cursor, ping: Cloudwalkers.Session.getPing().cursor});
	
		// Seed ids to collection
		this.seed(ids);
	},
	
	'hook' : function(callbacks)
	{
		if(callbacks.records) this.parameters.records = callbacks.records;
		
		
		if(!this.processing) this.fetch({error: callbacks.error});
		
		else if(this.length) callbacks.success(this);

		this.on("sync", callbacks.success);	
	}

});