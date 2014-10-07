/**
* A message list for the dashboard
*/
define(
	['Views/Widgets/MessageContainer', 'mustache', 'Router', 'Views/Root', 'Collections/Messages', 'Views/Entry'],
	function (MessageContainerWidget, Mustache, Router, RootView, MessagesCollection, EntryView)
	{
		var DashboardMessageList = MessageContainerWidget.extend({

			template : 'dashboardmessagecontainer',
			messagetemplate : 'dashboardmessage',
			entries : [],
			
			initialize : function(options)
			{
				if (options) $.extend(this, options); 
					
				this.model.messages = new MessagesCollection();

				// Clear the category (prevent non-change view failure)
				//this.model.set({messages: []});
				
				// Listen to category
				//this.listenTo(this.model, 'change:messages', this.fill);
				
				// Listen to model
				this.listenTo(this.model.messages, 'seed', this.fill);
				this.loadListeners(this.model.messages, ['request', 'sync', 'ready'], true);
				
				this.initializeWidget ();
			},

			render : function ()
			{
				this.$el.html (Mustache.render (Templates.dashboardmessagecontainer, this.options));
				this.$container = this.$el.find ('.messages-container');
				this.$loadercontainer = this.$el.find ('.portlet-body');
				//this.type = (this.type == "news" || this.type == "profiles")? "trending": this.type;
				
				//if(!this.options.filters) this.options.filters = {};
				//this.options.filters.records = 10;
				
				// Load messages
				this.model.messages.touch(this.model, this.filters); 
				
				this.trigger('rendered');

				// Load category messages
				//this.model.fetch({endpoint: "messageids", parameters:this.options.filters});

				return this;
			},
			
			fill : function (models)
			{
				
				// Hide loader
				this.$el.find('.inner-loading').toggleClass(models.length? 'inner-loading': 'inner-empty inner-loading');
				
				// Clean load
				$.each(this.entries, function(n, entry){ entry.remove()});
				this.entries = [];

				// Add models to view
				for (n in models)
				{
					// Add link
					if(this.link) models[n].link = this.link;
					
					// Render view
					var view = new EntryView ({model: models[n], template: 'smallentry', /*type: this.type, */ parameters: {trendview: this.trending, mediaview: !this.trending}});
					this.entries.push (view);
					
					this.$container.append(view.render().el);
					
					this.listenTo(view, "toggle", this.toggle);
				}
			},
			
			toggle : function (el)
			{
				
				// Get URL
				var link = this.sublink? this.sublink + this.model.id: this.link;
				
				Router.Instance.navigate(link, true);
			},

			/*'fill' : function (model, ids)
			{
				
				this.$el.find('.inner-loading').toggleClass(ids.length? 'inner-loading': 'inner-empty inner-loading');
				
				// Clean load or add
				if(this.incremental) this.incremental = false;
				else
				{
					$.each(this.entries, function(n, entry){ entry.remove()});
					this.entries = [];
				}
				
				// Go trough all messages
				var type = (this.options.type == "news" || this.options.type == "profiles")? "trending": this.options.type; 
				
				// Get messages
				var messages = this.model.messages.seed(ids);
				
				// Add messages to view
				for (n in messages)
				{
					if(this.options.link) messages[n].link = this.options.link;
					
					var messageView = new Cloudwalkers.Views.Entry ({model: messages[n], template: 'smallentry', type: type});
					this.entries.push (messageView);
					
					this.$container.append(messageView.render().el);
				}
			},*/
			
			fail : function ()
			{
				RootView.growl ("Oops", "Something went sideways, please reload the page.");
			}

		});

		return DashboardMessageList;
	}
);