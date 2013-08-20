Cloudwalkers.Views.Comment = Cloudwalkers.Views.Message.extend({

	'events' : 
	{
		'click .button-post.action.comment-message-action' : 'messageAction'
	},

	'initialize' : function ()
	{
		var self = this;

		this.options.template = 'comment';

		this.model.on ('change', function ()
		{
			self.render ();	
		});
	},

	'className' : 'comments-row',
	//'template' : 'comment',

	'tagName' : 'li',

	'additionalData' : function (data)
	{
		data.parent = false;
		return data;
	},

	'afterRender' : function ()
	{
		if (this.options.selected)
		{
			this.$el.addClass ('selected');
		}
	}

	/*
	'render' : function ()
	{
		var data = {};

		//console.log (this.model.attributes);

		data.comment = this.model.attributes;
		data.comment.humandate = this.model.humandate ();

		$(this.el).html (Mustache.render (Templates.comment, data));

		return this;
	}
	*/

});