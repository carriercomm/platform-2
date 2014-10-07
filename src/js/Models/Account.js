define(
	['backbone', 'Session', 'Views/Root', 'Collections/Channels', 'Collections/Streams', 'Collections/Campaigns', 'Collections/Users', 'Collections/Contacts',
	 'Collections/Messages', 'Collections/CannedResponses', 'Collections/Notes', 'Collections/Notifications', 'Collections/Statistics'],

	function (Backbone, Session, RootView, Channels, Streams, CampaignsCollection, Users, Contacts,
			  Messages, CannedResponses, Notes, Notifications, Statistics)
	{
		var Account = Backbone.Model.extend({
	
			typestring : "accounts",
			
			endpoint : "",
			
			// Gets updated when account activates
			limits : {users: 50, networks: 15, keywords: 10},
			
			initialize : function ()
			{	
				if(!Session)	Session = require('Session');
				if(!RootView)	RootView = require('RootView');
				if(!Notes)		Notes = require('Notes');

				// Collect Channels
				this.channels = new Channels();
				
				// Collect streams, fetch triggered in User model
				this.streams = new Streams();
				
				// Collect Campaigns
				this.campaigns = new CampaignsCollection();
				
				// Prep Users collection, fetch on demand
				this.users = new Users();
				
				// Prep Contacts collection, fetch on demand
				this.contacts = new Contacts();

				// Prep global Messages collection
				this.messages = new Messages();

				// Prep global Canned Responses collection
				this.cannedresponses = new CannedResponses();

				// Prep global Notes collection
				this.notes = new Notes();

				// Prep global Notes collection
				//this.tags = new TagsCollection();

				// Prep global Notifications collection
				this.notifications = new Notifications();
				
				// Prep global Statistics collection
				this.statistics = new Statistics();

			},
			
			parse : function (response)
			{
				this.endpoint = "";
				
				Store.set("accounts", response.account);
				
				return response.account;
			},
			
			url : function ()
			{		
				return Session.api + '/account/' + this.id + this.endpoint;
			},
			
			sync : function (method, model, options)
			{
				this.endpoint = (options.endpoint)? "/" + options.endpoint: "";

				return Backbone.sync(method, model, options);
			},
			
			firstload : function()
			{
				// Store channels and their children
				$.each(this.get("channels"), function(n, channel){ Session.storeChannel(channel); });
			},
			
			activate : function ()
			{	
				// First load
				if(!Store.exists("channels")) this.firstload();
				
				// Fetch Canned Responses
				this.cannedresponses.fetch({parameters: {records: 50}});
				
				// Load Streams (first, so channels find them)
				Store.filter("streams", null, function(list) { this.streams.add(list); }.bind(this));
				
				// Load Channels
				Store.filter("channels", null, function(list) { this.channels.add(list); }.bind(this));
				
				// Load Campaigns
				Store.filter("campaigns", null, function(list){ this.campaigns.add(list); }.bind(this));
				
				// Load Users
				Store.filter("users", null, function(list){ this.users.add(list); }.bind(this));
				
				// Load Messages
				Store.filter("messages", null, function(list){ this.messages.add(list); }.bind(this));
				
				// Load Statistics
				Store.filter("statistics", null, function(list){ this.statistics.add(list); }.bind(this));
				
				// Load Reports // Deprecated?
				Store.filter("reports", null, function(list){ this.reports.add(list); }.bind(this));
				
				// Filter limits
				if( this.get("plan"))
					this.limits = this.get("plan").limits;
				
				// Connect ping to account
				this.ping = new Session.Ping({id: this.id});

			},
			
			monitorlimit : function(type, current, target)
			{
				if(current >= this.limits[type])
				{
					$('.alert-info').remove();
						
					RootView.information ("Upgrade?", "You're fresh out of " + type /*type.slice(0, -1)*/ + " slots, maybe you should upgrade.");
				
					if(target)
					{
						if(typeof target == "string") target = $(target);
						target.addClass("limited").attr("disabled", true);
					}
							
					return true;
				}
				
				// Or remove
				if($("[disabled].limited").size())
				{
					$("[disabled].limited").removeClass("limited").attr("disabled", false);
					$("[data-dismiss=alert]").click();
				}
				
				return false;
			},
			
			addcampaign : function (name, callback)
			{
				var campaigns = this.get("campaigns");
				
				if (campaigns.map(function(c){ return c.name }).indexOf(name) < 0)
				{
					campaigns.push({name: name});
					this.save({campaigns: campaigns}, {patch: true, wait: true, success: callback});
				}
			},
			
			removecampaign : function (id, target)
			{

				this.endpoint = "/campaigns/"+id

				var Campaign = Backbone.Model.extend({});

				var campaign = new Campaign({
				    id: id 
				});

				campaign.destroy({url: this.url(), success: function(){

					var campaigns = this.get("campaigns");
					campaigns.forEach (
						function(campaign, n) { if(campaign.id == id) campaigns.splice(n, 1)}
					);

					RootView.growl(this.translateString("user_profile"), this.translateString("campaign_successfully_removed"));
					$(target).closest('li').remove();
				}.bind(this)});

			},

			translateString : function(translatedata)
			{	
				// Translate String
				return Session.polyglot.t(translatedata);
			}
			
			/*'monitorlimit' : function(type, current, target)
			{
				if(current >= this.limits[type])
				{
					setTimeout(function(type, target)
					{
						$('.alert-info').remove();
						
						RootView.information ("Upgrade?", "You're fresh out of " + type.slice(0, -1) + " slots, maybe you should upgrade.");
					
						if(target)
						{
							if(typeof target == "string") target = $(target);
							target.addClass("limited").attr("disabled", true);
						}
			
					}, 50, type, target);
							
					return true;
				}
				
				return false;
			}*/
			/*,
			
			'avatar' : function ()
			{
				return this.get ('avatar');
			},

			'getChannels' : function ()
			{
				return this.channels.models;
			},

			'getChannel' : function (id)
			{
				var channel = this._findChannelRecursive (this.getChannels (), id);
				return channel;
			},

			'getChannelFromType' : function (type)
			{
				return Session.getAccount().channels.findWhere({type: type});
			},

			'_findChannelRecursive' : function (channels, id)
			{
				for (var i = 0; i < channels.length; i ++)
				{
					if (channels[i].id == id)
					{
						return channels[i];
					}
					else if (channels[i].channels.length > 0)
					{
						var tmp = this._findChannelRecursive (channels[i].channels, id);
		                if (tmp != null)
		                {
		                    return tmp;
		                }
					}
				}

				return null;
			}*/

		});

		return Account;
	}
);