define(
	['Views/Pageview', 'mustache', 'Session', 'Views/Root', 'Views/Widgets/SentMessageList'],
	function (Pageview, Mustache, Session, RootView, SentMessageListWidget)
	{
		var Sent = Pageview.extend({
	
			title : 'Sent',
			className : "container-fluid inbox",
					
			initialize : function(options)
			{
				this.model = Session.getStream("sent");
				
				this.translateTitle("sent");

				// Memory cloth
				var settings = Session.viewsettings('sent');
				
				if (settings.streams)
					this.options.filters = {contacts : {string:"", list:[]}, streams : settings.streams};
			},

			render : function()
			{	
				// Create pageview
				this.$el.html (Mustache.render (Templates.pageview, {'title' : this.title}));
				this.$container = this.$el.find("#widgetcontainer").eq(0);
				
				this.options.model = this.model;

				// Add list widget
				var list = new SentMessageListWidget(this.options);
				
				this.appendWidget(list, 4);
				this.appendhtml(Templates.inboxcontainer);
				
				return this;
			},

			resize : function(height)
			{
				this.$el.find("#widgetcontainer").height(height -140);
			},
			
			finish : function()
			{
				
				this.resize(RootView.height());
				
				// Add scroller for message
				$message = this.$el.find(".inbox-container").wrap("<div class='scroller'>");
				
				$message.parent().slimScroll({height: "inherit"});
			},

			translateTitle : function(translatedata)
			{	
				// Translate Title
				this.title = Session.polyglot.t(translatedata);
			}
		});

		return Sent;
	}
);