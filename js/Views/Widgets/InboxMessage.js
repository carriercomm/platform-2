/**
* A standard widget
*/
Cloudwalkers.Views.Widgets.InboxMessage = Cloudwalkers.Views.Widgets.DetailedView.extend({

	'id' : 'inbox',

	'initialize' : function ()
	{
		var self = this;
		this.options.list.on ('select:message', function (message) { self.selectMessage (message); });
	},

	'selectMessage' : function (message)
	{
		//console.log ('selecting message');
		//console.log (message);

		var messageView;

		// ALWAYS show the parent message
		var parent = message.get ('parentmodel');
		var selectedcomment = null;

		if (parent)
		{
			selectedcomment = message;
			message = parent;
		}

		var parameters = {
			'model' : message,
			'selectedchild' : selectedcomment,
			'template' : 'messagedetailview',
			'childtemplate' : 'messagedetailviewchild',
			'originaltemplate' : 'messagedetailoriginal',
			'tagName' : 'div',
			'showcomments' : true
		};

		messageView = new Cloudwalkers.Views.Message (parameters);

		this.$el.html (messageView.render ().el);
		
		this.setHeight(messageView.$el);
		this.addScroll(messageView.$el);
		
	},
	
	'render' : function ()
	{
		this.$el.html ('');
		
		return this;
	},
	
	'setHeight' : function($el) {
		
		console.log("Set Message Height");
		
		$el.css("height", $("#inboxcontainer").height() - 16 + "px");
		//console.log($("#inboxcontainer"))		
	},
	
	'addScroll' : function ($el) {

		$el.find('.scroller').slimScroll({
			size: '6px',
			color: '#a1b2bd',
			position: 'right',
			height: 'auto',
			alwaysVisible: false,
			railVisible: false,
			disableFadeOut: true
		});
	}


});