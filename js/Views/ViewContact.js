Cloudwalkers.Views.ViewContact = Backbone.View.extend({

	'id' : "compose",
	'className' : "modal hide viewcontact",
	'entries' : [],
	'contactid' : 1583880,	//temp

	'events' : {
		'click .end-preview td i' : 'backtolist'
	},

	'initialize' : function(options)
	{	
		// Parameters
		if(options) $.extend(this, options);

		// Get account details
		//this.model = Cloudwalkers.Session.getContact(1583880);
		//this.listenTo(this.model, 'sync', this.fill)

		//Test data
		this.model = Cloudwalkers.Session.getChannel(60);
		this.collection = this.model.messages;

		this.listenTo(this.collection, 'seed', this.fill);
		this.listenTo(this.collection, 'ready', this.updatecontactinfo);

		//listenToOnce
		this.loadListeners(this.collection, ['request', 'sync', ['ready', 'loaded']], true);
	},

	'render' : function()
	{	
		// Create view
		var view = Mustache.render(Templates.viewcontact, this.contactinfo);
		this.$el.html (view);

		this.$container = this.$el.find ('ul.list');
		this.$loadercontainer = this.$el.find ('ul.list');

		this.trigger("rendered");

		// make the fetch
		this.collection.touch(this.model, this.filterparams());

		return this;	
	},

	'fill' : function(messages)
	{	
		
		// Add models to view
		for (n in messages)
		{	
			var view = new Cloudwalkers.Views.Entry ({model: messages[n], template: 'smallentry', checkunread: true, parameters:{inboxview: true}});
			
			this.entries.push (view);
			this.listenTo(view, "toggle", this.loadmessage);
			
			this.$container.append(view.render().el);

			// Filter contacts
			//this.model.seedcontacts(models[n]);
		}

	},

	'updatecontactinfo' : function()
	{
		var contactinfo;
		var asidehtml;
		
		if(this.collection.first() && this.collection.first().get('from'))
			contactinfo = this.collection.first().get('from')[0];

		if(contactinfo){
			this.$el.find('aside').html(Mustache.render(Templates.viewcontactaside, contactinfo));

			setTimeout(function(){
				this.$el.find('aside').removeClass('nodata');
			}.bind(this), 1)
		}
	},

	'loadmessage' : function(view)
	{	
		$('.viewcontact').addClass('onmessage');

		if (this.inboxmessage) this.inboxmessage.remove();
		
		this.inboxmessage = new Cloudwalkers.Views.Widgets.InboxMessage({model: view.model});

		this.loadListeners(this.inboxmessage, ['request', 'sync', ['ready', 'loaded']], true);
		
		$(".inbox-container").html(this.inboxmessage.render().el);
		
		// Load related messages
		this.inboxmessage.showrelated(); //(view.model);
		
		this.$el.find(".list .active").removeClass("active");
		view.$el.addClass("active");
	},

	'backtolist' : function()
	{
		$('.viewcontact').removeClass('onmessage');
	},

	'toggle' : function()
	{
		//Toggle between endpoints here
	},
	
	// Implement after working endpoints
	/*'lastmessages' : function()
	{
		this.model.urlparams = ['messages'];
		this.model.fetch();
	},

	'lastconversations' : function()
	{
		this.model.urlparams = ['conversations'];
		this.model.fetch();
	},*/

	'filterparams' : function()
	{	//Hardcoded test data
		
		var param = {records: 20, contacts: this.contactid};
		return param;
	}
});