/**
* A standard widget
*/
define(	// MIGRATION: widget based on BaseView
	['Views/BaseView', 'slimscroll', 'mustache'],
	function (BaseView, SlimScroll, Mustache)
	{
		var PanelView = BaseView.extend(
		{
			options: {
				title : 'widget',
				icon : 'inbox',
				color : 'blue',
				network : null
			},
			
			entries : [],
			events : {
				
			},

			//tools : [],

		    initialize : function (options)
		    {
		        this.options = $.extend({}, options, this.options)
		       	 
		        // Always add this to all your widget initializations
		        this.initializeWidget ();
		    },

		    initializeWidget : function ()
		    {
		        this.bind ('destroy', this.onDestroy);
		    },

			innerRender : function (element)
			{
				element.html ('No inner content set.');
			},

			render : function ()
			{

				var self = this;

				if (typeof (this.options.title) != 'undefined')
					this.title = this.options.title;

				if (typeof (this.options.icon) != 'undefined' && this.options.icon)
					this.icon = this.options.icon;

				this.$el.html 
				(
					Mustache.render 
					(
						Templates.panel, 
						{ 
							'title' : this.title,
							'icon' : this.icon,
						}
					)
				);

				this.$innerEl = $(this.$el.find ('.panel-body'));
				this.innerRender (this.$innerEl);
				
				return this;
			},
			
			negotiateFunctionalities : function() {
				
				// Check for scroller
				if(this.$el.find('.scroller').length) this.addScroll();
				
				var scroll = this.$el.find('.slimScrollDiv').eq(0);
				var height = scroll.css('height');
			
				// Update slimscroll plugin default styling
				scroll.css('max-height', height);
				scroll.css('height', 'inherit')

				// Check amountSign
				if(this.options.counter) this.appendCounter();
				
				// Check collapse option
				if(typeof this.options.open != "undefined")
					this.appendCollapseble(this.options.open);
			},
			
			appendCollapseble : function(open) {
				
				this.$el.addClass(open? 'collapse-open':'collapse-closed');

				if(this.$el.find(".tools .count").length)
						this.$el.find(".tools .count").addClass('tocollapse');
				else	this.$el.find(".tools").append($('<span class="collapse pull-right"></span>'));
				
				
				this.$el.find(".panel-heading.line").on("click", this.collapse.bind(this));

			},
			
			appendCounter : function(amount) {
				
				var count = 0;
				this.$el.find("li .badge, li .count").each(function(){ count += Number($(this).text())});
				
				if(count > 999) count = "+999";
				if(count < 0) count = 0;
				
				this.$el.find(".tools").append($('<span class="count">' + count + '</span>'));
			},
			
			addScroll : function () {

				var scroll = this.$el.find('.scroller').eq(0);
				var containerheight; 

				if (this.type == 'list')
					containerheight = $("#inner-content").height() -165 + "px";

				scroll.slimScroll({
					size: '6px',
					color: '#a1b2bd',
					position: 'right',
					height: containerheight,
					alwaysVisible: ($(this).attr("data-always-visible") == "1" ? true : false),
					railVisible: ($(this).attr("data-rail-visible") == "1" ? true : false),
					disableFadeOut: true
				});

				var height = scroll.css('height');
			
				// Update slimscroll plugin default styling
				scroll.css('max-height', height);
				scroll.css('height', 'inherit');
				this.$el.find(".slimScrollBar").eq(0).css('right', '-9px');
				this.$el.find(".slimScrollDiv").eq(0).css('overflow', 'visible');
			},

		    onDestroy : function ()
		    {
		       
				$.each(this.entries, function(i, entry)
				{
					entry.trigger ('destroy');
				});
				
		        this.$el.find ('.scroller').slimScroll({'destroy':1});
		        this.remove();
		    },
			
			collapse : function ()
			{
				this.$el.toggleClass("collapse-closed collapse-open");
			}

		});

		return PanelView;
});