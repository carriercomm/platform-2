Cloudwalkers.Views.Widgets.DemoMessage = Cloudwalkers.Views.Entry.extend({
	
	'tagName' : 'div',
	'className' : "message social-box-colors",
	'related' : [],
	'messageview' : [],
	'notifications' : [],
	
	'events' : 
	{
		'remove' : 'destroy',
		'click *[data-youtube]' : 'loadYoutube',
		'click *[data-action]' : 'action'
	},

	'render' : function ()
	{
		// Manage loading
		this.loading(!this.model.get("objectType"));
		
		// add optional notifications
		if(this.options.notification)
			var commented = {from: this.options.notification.get("from")[0], timeago: moment(this.options.notification.get("date")).fromNow()};
		
		// Parameters
		var params = {commented: commented} //this.model.filterData('full', {commented: commented});
		$.extend(params, this.model.attributes, {actions: this.model.filterActions()})
		
		if(params.body !== undefined){ //passes onto the html a class representing that the content has been loaded
			params.isdone = "done";
		}
		// Visualize
		this.$el.html (Mustache.render (Templates.demoinboxmessage, params));
		
		this.time();
		
		// Check notifications (second conditional, after message render)
		if (this.options.notification && this.model.get("objectType")) this.addNotifications();
		
		// Mark as read
		if (this.model.get("objectType") && !this.model.get("read")) this.markasread();

		return this;
	},
	
	'loading' : function(show)
	{
		 if(show)	$(".inbox").addClass("loading");
		 else		$(".inbox").removeClass("loading");
	},
	
	'showrelated' : function()
	{	
		// Show loading
		this.loading(true);
	
		// Create & append related container
		this.$related = $('<ul></ul>');
		this.$prelated = $('<ul></ul>');
		
		this.$el.before(this.$prelated.addClass("related-messages social-box-colors"));
		this.$el.after(this.$related.addClass("related-messages social-box-colors"));
		
		// Create related collection
		if(!this.model.related)
			this.model.related = new Cloudwalkers.Collections.Related();
		
		// Listen to collection
		this.listenTo(this.model.related, 'seed', this.fillrelated);
			
		// Load messages
		this.model.related.touch(this.model, {records: 20, markasread: true});
	},
	
	'fillrelated' : function(models)
	{
		
		// Clean load or add
		if(this.incremental) this.incremental = false;
		else
		{
			$.each(this.related, function(n, entry){ entry.remove()});
			this.related = [];
		}
		
		// Filter out existing model
		var append = false;
		models = models.filter(function(model)
		{
			if(model.id == this.model.id) append = true;
			model.append = append;
			
			return model.id != this.model.id
		
		}.bind(this));

		// Add models to view
		for (n in models)
		{	
			var view = new Cloudwalkers.Views.Entry ({model: models[n], template: 'inboxrelatedmessage', type: 'full'});
			
			this.related.push (view);
			
			this[models[n].append? "$related": "$prelated"].append(view.render().el);
		}
		
		// Hide loading
		this.loading(false);
	},
	
	'addNotifications' : function()
	{
		// Manage loading
		this.loading(true);
		
		// Does collection exist?
		if(!this.model.notifications)
			this.model.notifications = new Cloudwalkers.Collections.Notifications();
		
		// Load notifications
		this.listenTo(this.model.notifications, 'seed', this.fillNotifications);
		
		this.model.notifications.touch(this.model, {records: 50, markasread: true/* deprecated? group: 1*/});
	},
	
	'fillNotifications' : function (list)
	{
		
		// Clean load
		if(this.notifications.length)
		{
			$.each(this.notifications, function(n, entry){ entry.remove()});
			this.notifications = [];
		}
		
		// Create array if collection
		if(list.models) list = list.models;
		
		// Clear comments list
		var $container = this.$el.find(".message-comments ul").eq(0).html("");

		// Add models to view
		for (n in list)
		{
			var view = new Cloudwalkers.Views.Notification ({model: list[n], template: 'inboxcomment', active: list[n].id == this.options.notification.id});
			this.notifications.push (view);
			
			$container.append(view.render().el);
		}
		
		// Manage loading
		this.loading(false);
	},
	
	'markasread' : function()
	{
		
		// Send update
		this.model.save({read: 1}, {patch: true, wait: true});
		
		// Mark stream
		Cloudwalkers.Session.getStreams().outdated(this.model.get("stream"));
	},
	
	'destroy' : function()
	{
		$.each(this.modelview, function(n, entry){ entry.remove()});
		$.each(this.notifications, function(n, entry){ entry.remove()});
		$.each(this.related, function(n, entry){ entry.remove()});
	}
	
});