define(
	['backbone', 'Session', 'Router', 'config', 'Views/Root'],
	function (Backbone, Session, Router, config, RootView)
	{
		var Cloudwalkers = {
			
			version : 1,

			langs :
			[
				{"id": "en_EN", "name": "International English"},
				{"id": "fr_FR", "name": "Français"},
				{"id": "nl_NL", "name": "Nederlands"},
				{"id": "pt_PT", "name": "Português"}
			],

			init : function ()
			{
				// Authentication
				var token = window.localStorage.getItem('token');
				
				//Check if there is authentication
				if(token && token.length > 9)
				{	
					Session.authenticationtoken = token;
					
				} else{ console.log("token error", token); window.location = "/login.html";}

				// Define API root
				Session.api = config.apiurl + Cloudwalkers.version;


				Session.loadEssentialData (function ()
				{
					// MIGRATION
					// Root view
					Cloudwalkers.RootView = new RootView();
					
					// Url Shortener
					///Session.UrlShortener = new Cloudwalkers.UrlShortener();

					// And then rout the router.
					///Router.Instance = new Router ();

					// MIGRATION
					// Cloudwalkers.RootView.render();

					// Backbone.history.start();

				});

				return this;
			}
		};


		/**
		 *	Backbone Extension
		 *	Add authorization headers to each Backbone.sync call
		 */
		Backbone.ajax = function()
		{
			// Is there a auth token?
			if(Session.authenticationtoken)
				
				arguments[0].headers = {
		            'Authorization': 'Bearer ' + Session.authenticationtoken,
		            'Accept': "application/json"
		        };
		        
			return Backbone.$.ajax.apply(Backbone.$, arguments);
		};

		return Cloudwalkers;
	}
);