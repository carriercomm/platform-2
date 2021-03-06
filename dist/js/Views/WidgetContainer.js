define(	
	['backbone', 'mustache'],
	function (Backbone, Mustache)
	{
		var WidgetContainer = Backbone.View.extend({

			'widgets' : [],
			'title' : 'Widget Container',
			'isLoaded' : false,
			'currentLine' : null,
			'sizecounter' : 0,
			'newline' : true,
			'templatename': "widgetcontainer",
			'events' : {
				'remove': 'destroy'
			},

			'initialize' : function (options)
			{	
				var self = this;
				this.options = options;

				this.widgets = [];
				this.initializeWidgets ();
				this.isLoaded = false;

				this.newline = true;
				this.sizecounter = 0;
				
				this.title = this.options.title? this.options.title: this.title;
			},

			'initializeWidgets' : function ()
			{

			},

			/**
			* Generic supersmart add method.
			*/
			'add' : function (widget, size)
			{
				if (typeof (size) == 'undefined')
				{
					size = widget.size;
				}

				if (size == 'full')
				{
					size = 12;
				}
				else if (size == 'half')
				{
					size = 6;
				}
				else if (size)
				{
					size = parseInt(size);
				}
				else 
				{
					size = 12;
				}

				this.sizecounter += size;

				if (this.sizecounter > 12)
				{
					this.sizecounter = size;
					this.newline = true;
				}

				this.addWidgetSize (widget, this.newline, size);

				this.newline = false;
			},

			'addHalfWidget' : function (widget, newline)
			{
				if (typeof (newline) == 'undefined')
				{
					newline = false;
				}

				var self = this;
				widget.on ('content:change', function () { self.trigger ('content:change'); });

				this.widgets.push ({ 'widget' : widget, 'size' : 'half', 'newline' : newline });

				if (this.isLoaded)
				{
					this.addWidgetsDOM ([{ 'widget' : widget, 'size' : 'half', 'newline' : newline }]);
				}
			},

			'addWidget' : function (widget, newline)
			{
				if (typeof (newline) == 'undefined')
				{
					newline = false;
				}

				var self = this;
				widget.on ('content:change', function () { self.trigger ('content:change'); });

				this.widgets.push ({ 'widget' : widget, 'size' : 'full', 'newline' : newline });

				if (this.isLoaded)
				{
					this.addWidgetsDOM ([{ 'widget' : widget, 'size' : 'full', 'newline' : newline }]);
				}
			},

			'addWidgetSize' : function (widget, newline, size)
			{
				if (typeof (newline) == 'undefined')
				{
					newline = false;
				}

				var self = this;
				widget.on ('content:change', function () { self.trigger ('content:change'); });

				this.widgets.push ({ 'widget' : widget, 'size' : size, 'newline' : newline });

				if (this.isLoaded)
				{
					this.addWidgetsDOM ([{ 'widget' : widget, 'size' : size, 'newline' : newline }]);
				}
			},

			'render' : function ()
			{
				var self = this;
				this.isLoaded = true;
				
				this.$el.addClass("container-fluid");
				
				this.$el.html (Mustache.render (Templates[this.templatename], { 'title' : this.title }));

				var container;

				this.currentline = $(document.createElement ('div'));
				this.currentline.addClass ('row');
				this.$el.find ('#widgetcontainer').append (this.currentline);

				this.addWidgetsDOM (this.widgets);

				return this;
			},

			'addWidgetsDOM' : function (widgets)
			{
				var self = this;

				for (var i = 0; i < widgets.length; i ++)
				{
					if (widgets[i].newline)
					{
						this.currentline = $(document.createElement ('div'));
						this.currentline.addClass ('row');
						this.$el.find ('#widgetcontainer').append (this.currentline);				
					}

					container = $(document.createElement ('div'));

					if (widgets[i].size == 'half')
					{
						container.addClass ('col-md-6');
					}
					else if (widgets[i].size == 'full')
					{
						container.addClass ('col-md-12');
					}
					else
					{
						container.addClass ('col-md-' + widgets[i].size);	
					}

					container.append (widgets[i].widget.render ().el);

					this.currentline.append (container);

					widgets[i].widget.negotiateFunctionalities();
				}

				setTimeout (function ()
				{
					self.trigger ('content:change');
				}, 1);
			},
			
			'destroy' : function ()
			{
				for (var n in this.widgets)
				{
					this.widgets[n].widget.trigger ('destroy');
				}
			}
		});
	
		return WidgetContainer;
});