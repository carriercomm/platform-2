Cloudwalkers.Views.Inbox = Cloudwalkers.Views.Pageview.extend({

	'title' : 'Inbox',
	'className' : "container-fluid inbox",
	
	'render' : function()
	{
		
		this.$el.html (Mustache.render (Templates.pageview, {'title' : this.options.type}));
		this.$container = this.$el.find("#widgetcontainer").eq(0);
		
		// Dedect childtype
		this.options.channel.childtype = this.options.type.slice(0, -1);
		
		// Add list widget
		var list = this.options.channel.childtype == "message"?
		
			new Cloudwalkers.Views.Widgets.InboxMessageList(this.options):
			new Cloudwalkers.Views.Widgets.InboxNotificationList(this.options);
		
		this.appendWidget(list, 4);
		this.appendhtml(Templates.inboxcontainer);
		
		// Add global loader
		//this.$el.find(".page-title").append('<i class="icon-cloud-download hidden"></i>');
		
		
		
		
		return this;
	},
	
	'finish' : function()
	{
		// View minus title height 
		var height = Cloudwalkers.RootView.height() -140;
		
		this.$el.find("#widgetcontainer").height(height);
		
		// Add scroller for message
		$message = this.$el.find(".inbox-container").wrap("<div class='scroller'>");
		
		$message.parent().slimScroll({
			height: "inherit"

		});
	}
	
});