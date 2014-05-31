Cloudwalkers.Views.Widgets.TrendingMessage = Backbone.View.extend({

	'initialize' : function (options)
	{
		if(options) $.extend(this, options);
		
		this.settings = {};
		this.settings.title = this.title;

		if(!this.network)	this.model = Cloudwalkers.Session.getChannel('profiles');
		else				this.model = Cloudwalkers.Session.getStream(this.network);
		
		this.listenTo(this.model, 'sync', this.fill);
		

		this.gettoptrending();
		
	},

	'render' : function ()
	{	
		this.$el.html (Mustache.render (Templates.trendingmsg, this.settings));
		return this;
	},

	'fill' : function(){

		this.message = this.model.get("messages") ? this.model.get("messages")[0] : false;

		//No results
		if(!this.message || this.message.length == 0){
			this.$el.find('.commentballoon h4').html("No data");
			return;
		}
			
		var message = this.message;
		var links = message.attachments? message.attachments.filter(function(el){ if(el.type == "link") return el; }) : null;
		var images = message.attachments? message.attachments.filter(function(el){ if(el.type == "image") return el; }) : null;

		this.settings.statistics = message.statistics;
		this.settings.from = message.from[0].displayname || "";
		this.settings.body = message.body.plaintext || "";
		this.settings.icon = message.from[0].network.icon || "";
		this.settings.date = message.dateonly || "";
		//Just one image
		if(images)
			this.settings.image = images[0].url || "";
		
		this.settings.links = links || [];

		this.render();

	},

	'gettoptrending' : function(){

		if(this.network)
			return this.toptrendingstream(this.network);
		else
			return this.toptrendingall();
	},

	'toptrendingstream' : function(streamid){

		var filters = {
			sort : "engagement",
			records : 1
		}
		
		this.model.fetch({endpoint : "messages", parameters : filters});
		
		return;
	},

	'toptrendingall' : function(){

		this.model = Cloudwalkers.Session.getChannel('profiles');
		
		var filters = {
			sort: "engagement",
			records : 1,
			since : this.timespan.since
		};

		this.model.fetch({endpoint: "messages", parameters : filters});

		return;
	},

	'negotiateFunctionalities' : function()
	{

	}
	
});