
define(
	['Views/Panels/EntryLists/BaseList', 'mustache', 'Views/Entries/BaseEntry'],
	function (BaseList, Mustache, EntryView)
	{
		var ScheduledList = BaseList.extend({

			id : 'scheduledlist',
			title: "Scheduled messages",
			parameters : {records: 200, sort: 'asc'},
			
			/*events : {
				'remove' : 'destroy',
				'click .load-more' : 'more'
			},*/
			
			/*initialize : function (options)
			{
				if(options) $.extend(this, options);	
				
				// Add collection
				if (!this.model.messages) this.model.messages = new Messages();
				
				// Listen to model messages and users
				this.listenTo(this.model.messages, 'seed', this.fill);
				this.listenTo(this.model.messages, 'request', this.showloading);
				this.listenTo(this.model.messages, 'ready', this.showmore);
				this.listenTo(Cloudwalkers.RootView, 'added:message', function(){ this.model.messages.touch(this.model, this.parameters); }.bind(this));				
			},*/

			render : function (params)
			{	
				this.loadmylisteners();

				// Get template
				this.$el.html (Mustache.render (Templates.scheduledlist));

				this.$container = this.$el.find ('.entry-container');
				this.$loadercontainer = this.$el.find ('.panel-body');
				this.$el.find(".load-more").hide();
				
				if(params){	
					this.parameters = params;
					Cloudwalkers.Session.viewsettings('scheduled', {streams: params.target? [params.target]: []});
				}
				else if(this.filters.streams.length)
					this.parameters.target = this.filters.streams.join(",");

				// Load category message
				this.model.messages.touch(this.model, this.parameters);
					
				this.addScroll();

				var scroll = this.$el.find('.slimScrollDiv').eq(0);
				var height = scroll.css('height');
			
				// Update slimscroll plugin default styling
				scroll.css('max-height', height);
				scroll.css('height', 'inherit')

				return this;
			},

			fill : function (list)
			{		
				// Clean load or add
				if(this.incremental) this.incremental = false;
				else
				{
					$.each(this.entries, function(n, entry){ entry.remove()});
					this.entries = [];
				}
				
				// Store amount
				this.count = list.length;
				
				// Add messages to view
				for (var n in list)
				{
					var view = new EntryView ({tagName: "tr", model: list[n], type: "full", template: "scheduledentry"});
					this.entries.push (view);
					
					this.$container.append(view.render().el);
				}
				
				// Hide loading
				this.hideloading();
			},

			/*loadmylisteners : function()
			{
				this.loadListeners(this.model.messages, ['request', 'sync', ['ready','loaded','destroy']], true);
			},
			
			showloading : function ()
			{
				//this.$el.find(".icon-cloud-download").show();
				this.$el.find(".load-more").hide();
			},
			
			hideloading : function ()
			{
				//this.$el.find(".icon-cloud-download").hide();
				this.$container.removeClass("inner-loading");
				
				if (this.model.messages.cursor)
					this.hasmore = true;
				else
					this.hasmore = false;
			},

			showmore : function(){

				setTimeout(function()
				{	//Hack
					this.$container.css('max-height', 999999);

					if(!this.hasmore)
						return this.$el.find('#loadmore').empty();	

					var load = new LoadMoreWidget({list: this.model.messages, parentcontainer: this.$container});
					this.$el.find('#loadmore').html(load.render().el);

					this.loadmore = load;

				}.bind(this),200)
			},*/
			
			
			/*
			more : function ()
			{
				this.incremental = true;

				this.loadmore.loadmylisteners();	
						
				var hasmore = this.model.messages.more(this.model, this.parameters);		
				if(!hasmore) this.$el.find(".load-more").hide();
			},

			
			negotiateFunctionalities : function() {
				
				this.listenTo(Cloudwalkers.Session, 'destroy:view', this.remove);
				
				//this.addScroll();
			},
			
			addScroll : function () {

				var scroll = this.$el.find('.scroller').eq(0);

				this.$el.find('.scroller').slimScroll({
					size: '6px',
					color: '#a1b2bd',
					height: $("#inner-content").height() -165 + "px",
					alwaysVisible: false,
					railVisible: false
				});

				var height = scroll.css('height');
			
				// Update slimscroll plugin default styling
				scroll.css('max-height', height);
				scroll.css('height', 'inherit')
			},
			
			destroy : function()
			{
				$.each(this.entries, function(n, entry){ entry.remove()});
			}*/
		});

		return ScheduledList;
});
