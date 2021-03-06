define(
	['Views/Pages/Pageview', 'mustache',  'Views/Root'],
	function (Pageview, Mustache, RootView)
	{
		var Coworkdashboard = Pageview.extend({

			title : "First Time",
			events : {
				'remove': 'destroy',
				'click [data-add-service]' : 'addServiceCall'
			},
			
			initialize : function()
			{
				var account = Cloudwalkers.Session.getAccount();
			},
				
			render : function ()
			{
				// Navigation view
				Backbone.history.fragment = "settings/services";
				
				// Alter menu view
				$('#sidebar').addClass("collapsed");
				$('#inner-content').addClass("expanded");
				
				// View
				params = {displayname: Cloudwalkers.Session.user.get("displayname")};

				this.$el.html (Mustache.render (Templates.coworkerdashboard, params));

				return this;
			},
			
			/*'appendOptions' : function(available) {
				
				var $container = this.$el.find(".networks-list");
				
				for (var n in available.services)
				{
					$container.append(Mustache.render (Templates.settings.service_option, available.services[n]));
				}
			},
			
			*/

			processLink : function (url)
			{
				if (url.indexOf ('?') > 0)
				{
					url = url + '&return=' + encodeURIComponent(window.location);
				}
				else
				{
					url = url + '?return=' + encodeURIComponent(window.location);
				}
				return url;
			},

			addServiceCall : function (e)
			{
				e.preventDefault ();

				var self = this;
				var id = $(e.target).attr ('data-add-service');

				this.addService (id, function (data)
				{
					if (typeof (data.error) != 'undefined')
					{
						Cloudwalkers.RootView.alert (data.error.message);
					}
					else
					{
						// Most services will provide an authentication URL.
						// If available, redirect user to that URL now.
						$.each (data.service.settings, function (i, v)
						{
							if (v.type == 'link')
							{
								var url = self.processLink (v.url);
								//alert (url);
								window.location = url;
							}
						});

						self.render ();
					}
				});
			},
			
			destroy : function ()
			{
				$('#sidebar, #inner-content').removeClass("collapsed expanded");
			}
		});
		return Coworkdashboard;
	}
);