define(
	['backbone',  'Collections/Users', 'Models/Contact'],
	function (Backbone, Users, Contact)
	{
		var Contacts = Users.extend({

			model : Contact,
			typestring : "contacts",
			modelstring : "contact",
			parenttype : "account",
			comparator : 'displayname',
			processing : false,

			initialize : function (models, options)
			{				
				// Global collection gets created before session build-up
				if( Cloudwalkers.Session.user.account)
				{
					Cloudwalkers.Session.getContacts().listenTo(this, "add", Cloudwalkers.Session.getContacts().distantAdd);
				}
			},
			
			url : function ()
		    {
				var url = [Cloudwalkers.Session.api, "accounts", Cloudwalkers.Session.getAccount ().id ];
				
				if(this.endpoint)	url.push(this.typestring, this.endpoint);
				if(this.following)	url.push(this.modelstring + "ids", this.following);		
				if(this.parameters)	url.push(this.typestring + "?" + $.param(this.parameters));
				
				return url.join("/");
		    },
		    
		    parse : function (response)
			{
				this.parameters = "";
				this.processing = false;
				
				return response[this.typestring]?
				
					response[this.typestring]: response.account[this.typestring];
			},
			    
		    sync : function (method, model, options)
			{				
				
				if(method == "read")	this.processing = true;
				if(options.parameters)	this.parameters = options.parameters;
				if(!options.following)	this.following = false;

				return Backbone.sync(method, model, options);
			},
			
			touch : function(model, params)
			{
				// Exception for following
				if(!model) this.following = "following" + "?" + $.param(params);
				else {
				
					this.parentmodel = model;
					this.endpoint = this.modelstring + "ids";
					this.parameters = params;
				}

				// Hard-wired request (no caching)
				this.fetch({following: (!model), success: this.touchresponse.bind(this, this.url())});
			},
			
			
			updates : function (ids)
			{
				for (var n in ids)
				{
					var model = this.get(ids[n]);
					
					if(model && model.get("objectType"))
					{
						// Store with outdated parameter
						Store.set(this.typestring, {id: ids[n], outdated: true});
						
						// Trigger active models
						model.outdated = true;
						model.trigger("outdated");
					}
				}
			},

			outdated : function(id)
			{
				// Collection
				if(!id) return this.filter(function(model){ return model.outdated});
				
				// Update model
				var model = this.updates([id]);
			}
		});

		return Contacts;
});