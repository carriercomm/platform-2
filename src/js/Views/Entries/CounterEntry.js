/* 
 *	Entry for dashboard counters
 */

define(
	['Views/Entries/BaseEntry', 'mustache'],
	function (BaseEntry, Mustache)
	{
		var CounterEntry = BaseEntry.extend({

			tagName : 'a',

			initialize : function(options)
			{
				$.extend(this, options);

				this.listenTo(this.model, 'change', this.render)
			},

			render : function ()	
			{	
				var url;

				if(this.data.typelink)	url = this.data.typelink + "/" + (this.model.get("hasMessages")? "messages" : "notifications");
				else					url = this.data.link? this.data.link: '#' + this.data.type + '/' + this.data.channel.id + '/' + this.model.id;

				this.$el.attr('href', url);
				this.$el.attr('data-stream', this.model.id);

				if(this.data.channel.get("type") == "outgoing")
					this.count = this.model.get("counters").total.scheduled.messages.total;
				
		        else if(this.data.channel.get("type") == "inbox")
		            this.count = this.model.get("counters").total.incoming.any.unread;

				else
					this.count = this.model.get("counters").recent.incoming.any.unread;

				var params = { 
					//id: this.model.id, 
					name: this.model.get("name"), 
					url: url, 
					count: this.count, 
					icon: this.model.get("network") ?this.model.get("network").icon: this.data.icon 
				};

				this.$el.html(Mustache.render(Templates.counterentry, params));

				return this;
			}
		});

		return CounterEntry;
});