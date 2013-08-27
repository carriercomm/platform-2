Cloudwalkers.Router = Backbone.Router.extend ({

	'routes' : {
		'channel/:channel(/:stream)(/:messageid)' : 'channel',
		'schedule(/:stream)' : 'schedule',
		'drafts' : 'drafts',
		'users' : 'users',
		'write' : 'write',
		'reports(/:streamid)' : 'reports',
		'trending/:channel' : 'trending',
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

	'schedule' : function (streamid)
	{
		var parameters = 			
		{ 
			'name' : 'Scheduled messages'
		};

		var filters = {};

		if (typeof (streamid) != 'undefined' && streamid)
		{
			filters.streams = [ streamid ];
		}

		var channel = new Cloudwalkers.Collections.Scheduled ([], parameters);
		channel.setFilters (filters);

		var widgetcontainer = new Cloudwalkers.Views.Widgets.WidgetContainer ();

		var widget = new Cloudwalkers.Views.Widgets.ScheduledTable ({ 'channel' : channel, 'color' : 'blue' });
		widgetcontainer.addWidget (widget);

		widgetcontainer.navclass = 'schedule';
		widgetcontainer.title = 'Schedule';

		if (streamid)
		{
			widgetcontainer.subnavclass = 'schedule_' + streamid;
			//console.log (widgetcontainer.subnavclass);
		}

		Cloudwalkers.RootView.setView (widgetcontainer); 
	},

	'drafts' : function ()
	{
		var collection = new Cloudwalkers.Collections.Drafts
		(
			[], 
			{ 
				'name' : 'Draft messages'
			}
		);

		var widgetcontainer = new Cloudwalkers.Views.Widgets.WidgetContainer ();

		var widget = new Cloudwalkers.Views.Widgets.DraftList ({ 'channel' : collection, 'color' : 'blue' });
		widgetcontainer.addWidget (widget);

		widgetcontainer.title = 'Drafts';
		widgetcontainer.navclass = 'drafts';

		Cloudwalkers.RootView.setView (widgetcontainer); 
	},

	'channel' : function (id, streamid, messageid)
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

		var filters = {};
		if (typeof (streamid) != 'undefined')
		{
			filters['streams'] = [ streamid ];
			channel.setFilters (filters);	
		}

		var widgetcontainer = new Cloudwalkers.Views.Widgets.WidgetContainer ();
		widgetcontainer.title = channeldata.name;

		// Check the types
		var widget;

		//console.log (channeldata);

		if (channeldata.type == 'inbox' || channeldata.type == 'monitoring')
		{
			var listwidget = new Cloudwalkers.Views.Widgets.DetailedList ({ 'channel' : channel, 'color' : 'blue', 'selectmessage' : messageid });
			widgetcontainer.addWidgetSize (listwidget, false, 4);

			widget = new Cloudwalkers.Views.Widgets.DetailedView ({ 'list' : listwidget });
			widgetcontainer.addWidgetSize (widget, false, 8);			
		}
		else
		{
			widget = new Cloudwalkers.Views.Widgets.Timeline ({ 'channel' : channel, 'color' : 'blue', 'selectmessage' : messageid })
			widgetcontainer.addWidget (widget);
		}

		widgetcontainer.navclass = 'channel_' + id;

		if (streamid)
		{
			widgetcontainer.subnavclass = 'channel_' + id + '_' + streamid;
			//console.log (widgetcontainer.subnavclass);
		}

		Cloudwalkers.RootView.setView (widgetcontainer); 
	},

	'trending' : function (channelid)
	{
		var channeldata = Cloudwalkers.Session.getChannelFromId (channelid);

		var since = (Date.today().add({ days: -7 }));
		if (channeldata.type == 'news')
		{
			since = (Date.today().add({ days: -1 }));
		}

		var channel = new Cloudwalkers.Collections.Trending 
		(
			[], 
			{ 
				'id' : channelid, 
				'name' : 'Trending ' + channeldata.name,
				'since' : since
			}
		);

		var widgetcontainer = new Cloudwalkers.Views.Widgets.WidgetContainer ();
		widgetcontainer.title = channeldata.name;

		// Check the types
		var widget;

		widget = new Cloudwalkers.Views.Widgets.Timeline ({ 'channel' : channel, 'color' : 'blue' })
		widget.messagetemplate = 'messagetimelinetrending';

		widgetcontainer.addWidget (widget);

		widgetcontainer.navclass = 'trending';
		widgetcontainer.subnavclass = 'trending_' + channelid;

		Cloudwalkers.RootView.setView (widgetcontainer); 
	},

	'users' : function ()
	{
		var view = new Cloudwalkers.Views.Users ();
		Cloudwalkers.RootView.setView (view);
	},

	'write' : function ()
	{
		var view = new Cloudwalkers.Views.Write ();
		Cloudwalkers.RootView.setView (view);
	},

	'reports' : function (streamid)
	{
		var view = new Cloudwalkers.Views.Reports ({ 'stream' : Cloudwalkers.Session.getStream (streamid) });

		if (streamid)
		{
			view.subnavclass = 'reports_' + streamid;
		}

		Cloudwalkers.RootView.setView (view);
	}

});