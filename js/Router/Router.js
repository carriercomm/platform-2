Cloudwalkers.Router = Backbone.Router.extend ({

	'routes' : {
		'channel/:id' : 'channel',
		'schedule' : 'schedule',
		'drafts' : 'drafts',
		'users' : 'users',
		'*path' : 'dashboard'
	},

	'initialize' : function ()
	{
		//console.log ('init');
	},

	'dashboard' : function ()
	{
		Cloudwalkers.RootView.setView (new Cloudwalkers.Views.Dashboard ());	
	},

	'schedule' : function ()
	{
		var channel = new Cloudwalkers.Collections.Scheduled
		(
			[], 
			{ 
				'name' : 'Scheduled messages'
			}
		);

		var view = new Cloudwalkers.Views.Channel ({ 'channel' : channel, 'canLoadMore' : false });

		Cloudwalkers.RootView.setView (view);
	},

	'drafts' : function ()
	{
		var channel = new Cloudwalkers.Collections.Drafts
		(
			[], 
			{ 
				'name' : 'Draft messages'
			}
		);

		var view = new Cloudwalkers.Views.Channel ({ 'channel' : channel, 'canLoadMore' : false });

		Cloudwalkers.RootView.setView (view);
	},

	'channel' : function (id)
	{
		var channeldata = Cloudwalkers.Session.getChannelFromId (id);

		var channel = new Cloudwalkers.Collections.Channel 
		(
			[], 
			{ 
				'id' : id, 
				'name' : channeldata.name
			}
		);

		var view = new Cloudwalkers.Views.Channel ({ 'channel' : channel });
		Cloudwalkers.RootView.setView (view);
	},

	'users' : function ()
	{
		var view = new Cloudwalkers.Views.Users ();
		Cloudwalkers.RootView.setView (view);
	}

});