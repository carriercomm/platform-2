define(
	['Views/Pages/Pageview', 'mustache'],
	function (Pageview, Mustache)
	{
		var RSSFeed = Pageview.extend({
	
			id : "rss",
			parameters : { records: 20, markasread: true },
			entries : [],

			events : 
			{
				'click .message' : 'openMessage',
				'click .message *' : 'openMessage',
				'click [data-rss-select]' : 'toggleList'
			},
			
			initialize : function (options)
			{
				if (options) $.extend(this, options);
				
				this.title = trans("RSS Feed");

				this.$el.addClass("loading");
			},
			
			hideloading : function()
			{
				this.$el.removeClass("loading");
				this.$el.find(".timeline-loading").hide();
			},
			
			render : function ()
			{
				var params = {
					'title' : this.title
				}

				// Pageview
				this.$el.html (Mustache.render (Templates.rssfeed, params));

				return this;
			},

			openMessage : function(el)
			{

				$(el.target).closest('.rssfeed-container').children().children().removeClass('opened');
				$(el.target).closest('.rssfeed-container').children().removeClass('col-md-12');
				$(el.target).closest('.rssfeed-container').children().addClass('col-md-6');

				//console.log($(el.target).closest('.rssfeed-container'))

				if($(el.target).hasClass('message')){
					$(el.target).addClass('opened');
					$(el.target).parent().removeClass('col-md-6');
					$(el.target).parent().addClass('col-md-12');
				} else {
					$(el.target).closest('.message').addClass('opened');
					$(el.target).closest('.message').parent().removeClass('col-md-6');
					$(el.target).closest('.message').parent().addClass('col-md-12');
				}
			},

			toggleList : function(el){

				var activeclass = $(el.target).data().rssSelect;

				this.$el.find('.rssfeed-container').removeClass('cards');
				this.$el.find('.rssfeed-container').removeClass('list');
				this.$el.find('.rssfeed-container').addClass(activeclass);

				this.$el.find('.rssfeed-selector').children().removeClass('active');
				
				if($(el.target).hasClass('option')){
					$(el.target).addClass('active');
				} else {
					$(el.target).parent().addClass('active');
				}

			}
		});

		return RSSFeed;
	}
);