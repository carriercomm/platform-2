define(
	['Views/Pageview', 'mustache', 'Session', 'Views/Widgets/ScheduledFilters', 'Views/Widgets/ScheduledList'],
	function (Pageview, Mustache, Session, ScheduledFiltersWidget, ScheduledListWidget)
	{
		var Scheduled = Pageview.extend({

			title : 'Schedule',
			className : "container-fluid scheduled",
			
			initialize : function ()
			{				
				this.model = Session.getStream("scheduled");

				// Emergency break
				if (!this.model) return Session.home();

				var settings = Session.viewsettings('scheduled');
				
				if (settings.streams)
					this.options.filters = {streams : settings.streams};
				
				// Listen for changes
				this.listenTo(this.model, 'sync', this.render);

				// Translation for Title
				this.translateTitle("scheduled");
			},
			
			render : function()
			{
				this.$el.html (Mustache.render (Templates.pageview, { 'title' : this.title }));
				this.$container = this.$el.find("#widgetcontainer").eq(0);

				// Add filter widget
				var filter = new ScheduledFiltersWidget ({model: this.model, filters: this.options.filters});
				this.appendWidget(filter, 4);
				
				// Add list widget
				var list = new ScheduledListWidget ({model: this.model, filters: this.options.filters});
				this.appendWidget(list, 8);
				
				filter.list = list;
				
				return this;
			},
			translateTitle : function(translatedata)
			{	
				// Translate Title
				this.title = Session.polyglot.t(translatedata);
			}
			
		});

		return Scheduled;
	}
);