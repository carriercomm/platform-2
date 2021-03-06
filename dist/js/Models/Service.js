define(
	['backbone'],
	function (Backbone)
	{
		var Service = Backbone.Model.extend({
	
			typestring : "services",
			channels : [],
			
			initialize : function (options)
			{
				this.on('destroy', this.remove);
			},
			
			url : function()
			{	
				var url = [Cloudwalkers.Session.api];
				
				if(this.parentpoint)	url.push("accounts", Cloudwalkers.Session.getAccount ().id);
				if(this.typestring)		url.push(this.typestring);		
				if(this.id)				url.push(this.id);
				if(this.endpoint)		url.push(this.endpoint);
				
				return url.join("/");
			},
			
			parse : function(response)
			{	
				// A new object
				if (typeof response == "number") response = {id: response};
				
				// Debug API unlogic
				else if(response.service) response = response.service;
				
				return response;
			},
			
			sync : function (method, model, options)
			{				
				this.endpoint = (options.endpoint)? options.endpoint: false;
				
				if(options.hasOwnProperty("parentpoint"))
					this.parentpoint = model.parentpoint
				else
					this.parentpoint = method != "delete";
				
				return Backbone.sync(method, model, options);
			},
			
			loaded : function(param)
			{
				return this.get(param? param: "objectType") !== undefined;
			},
			
			updateStreams : function (active, profile)
			{	
				// Save the channels before the call
				if(!active)
					this.backupstreams = this.get("streams").filter(function(stream){ if(stream.profile) return stream.profile.id == profile.id});

				this.once('sync', this.parseStreamChanges.bind(this, profile, active))
					.fetch({parentpoint: false});
			},
			
			parseStreamChanges : function (profile, active)
			{	
				var streams;

				if(active){
					if(this.get("streams")){
						streams = this.get("streams").filter(function(stream){ if(stream.profile) return stream.profile.id == profile.id});
					}
				}else{
					streams = this.backupstreams;
				}

				if(streams && streams.length){
					for (var n in streams){
						this.parsestream(streams[n], profile.get("activated")? 'add': 'remove');
					}
				}

				//Refresh navigation
				Cloudwalkers.RootView.navigation.renderHeader();
				Cloudwalkers.RootView.navigation.render();
			},

			addservice : function()
			{
				this.once('sync', this.updatechannels.bind(this, "add"))
					.fetch({parentpoint: false});
			},

			updatechannels : function(operation)
			{	
				var streams = this.get("streams");

				if(!streams)
					Cloudwalkers.Router.navigate("#settings/services", true)

				for (var n in streams)
					this.parsestream(streams[n], operation);

				//Refresh navigation
				Cloudwalkers.RootView.navigation.renderHeader();
				Cloudwalkers.RootView.navigation.render();

				if(operation == 'add')
					Cloudwalkers.Router.navigate("#settings/services", true)
			},

			parsestream : function(stream, operation)
			{	
				var channels = stream.channels;
				var channel;
				
				if(channels.length){
					for (var n in channels){

						channel = Cloudwalkers.Session.getChannel(parseInt(channels[n]));
						if(channel)
							channel.streams[operation](stream);
					}
				}
			},

			remove : function()
			{
				this.updatechannels('remove', this)
			}
			
		});

		return Service;
});