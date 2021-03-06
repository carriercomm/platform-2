define(
	['backbone', 'mustache', 'Collections/Triggers', 'Models/Trigger', 'Views/Root', 'Views/Pages/Settings'],
	function (Backbone, Mustache, Triggers, Trigger, RootView, SettingsView)
	{
		var Account = Backbone.View.extend({

			events : {
				'click i[data-delete-campaign-id]' : 'deletecampaign',
				'click #menu a' : 'scroll',
				'submit form#editaccount' : 'editaccount',

				'keydown [data-attribute=account-name]' : 'enablebtnaccount',
				'click [data-action=resetaccount]' : 'disablebtnaccount'
			},

			initialize : function()
			{
				this.streams = Cloudwalkers.Session.getStreams();
				this.streams = this.streams.filterNetworks();

				this.account = Cloudwalkers.Session.getAccount();
				this.triggers = new Triggers();

				//this.listenTo(this.triggers, 'sync', this.filltriggers);

				this.account = Cloudwalkers.Session.getAccount();
				
				this.triggermodel = {};
			},

			render : function ()
			{		
				var data = this.account.attributes;

				// Apply role permissions to template data
				Cloudwalkers.Session.censuretemplate(data);
			
				this.$el.html (Mustache.render (Templates.account, data));

				this.$el.find("#menu").affix()

				//Canned responses list
				//var cannedlist = new SettingsView.CannedList();
				//this.$el.find("#cannedlist").append(cannedlist.render().el);
			
				// Render manually both trigger's views
				// this.twitterview = new SettingsView.Trigger({event: 'CONTACT-NEW', stream: 'twitter', description: 'Twitter: New follower response'});
				// this.dmview = new SettingsView.Trigger({event: 'MESSAGE-RECEIVED',  description: 'DM: Out of office response'});

				// this.$el.find("#triggerlist").append(this.twitterview.render().el);
				// this.$el.find("#triggerlist").append(this.dmview.render().el);

				// this.triggers.parent = this.account;
				// this.triggers.fetch();

				return this;
			},

			/*
			 *	UI trigger to enable saving again
			 */
			enablebtnaccount : function()	{ this.$el.find('[data-action=resetaccount]').attr('disabled', false);	},

			/*
			 *	UI trigger to disable the saving button
			 */
			disablebtnaccount : function(e)
			{ 
				$(e.currentTarget).closest('form').get(0).reset();

				this.$el.find('[data-action=resetaccount]').attr('disabled', true);
			},
			
			/*
			 *	NOT IN USE
			 */
			filltriggers : function(models)
			{
				//Hack time!
				var twitterfollow = models.filter(function(el){ if(el.get("event") == 'CONTACT-NEW') return el;})
				var dmout = models.filter(function(el){ if(el.get("event") == 'MESSAGE-RECEIVED') return el;})
				
				twitterfollow = new Trigger(twitterfollow[0].attributes);
				this.twitterview.updatetrigger(twitterfollow);
				
				dmout = new Trigger(dmout[0].attributes);
				this.dmview.updatetrigger(dmout);
			},

			action : function(e)
			{
				// Action token
				var token = $(e.currentTarget).data ('action');

				this[token](e);
			},
			
			/*
			 *	Saving the account name change
			 */
			editaccount : function (e)
			{
				e.preventDefault();

				var name = this.$el.find ('[data-attribute=account-name]').val ();

				this.$el.find(".edit-account-name").addClass('loading');
				this.$el.find('.edit-account-name .btn').attr('disabled', true);
				
				this.account.save ({name: name}, {patch: true, success: function ()
					{
						Cloudwalkers.RootView.growl(trans("Account settings"), trans("Your Account Settings are updated"));
						
						//Reenable submit button & remove loading
						this.$el.find(".edit-account-name").removeClass('loading');
						this.$el.find('[data-action=editaccount]').attr('disabled', false);

					}.bind(this),
					error: function(){
						Cloudwalkers.RootView.growl(trans("Account settings"), trans("There was an error updating your settings."));
						
						//Reaneable buttons & remove loading
						this.$el.find(".edit-account-name").removeClass('loading');
						this.$el.find('[data-action=editaccount]').attr('disabled', false);
						this.$el.find('[data-action=editaccount]').attr('disabled', false);

					}.bind(this)});
			},
			
			/*
			 *	Deleting a campaign
			 */
			deletecampaign : function (e)
			{
				//var account = Cloudwalkers.Session.getAccount();
				var campaignid = $(e.target).data ('delete-campaign-id'); //= account.campaigns.get( $(e.target).data ('delete-campaign-id'));
				
				Cloudwalkers.RootView.confirm 
				(
					trans("Are you sure you want to remove this campaign?"), 
					function () 
					{
						Cloudwalkers.Session.getAccount().removecampaign(campaignid, e.target);
					}
				)
			},

			/*
			 *	Responsible for the menu clicking & scrolling
			 */
			scroll : function(e)
			{	
				var hash = $(e.currentTarget).data('hash');		
				var position = this.$el.find('h3[name='+hash+']').offset().top;
				position = position - this.$el.find('h3[name='+hash+']').outerHeight();
				
				$('html, body').animate({scrollTop:position}, 'fast');

				return false;
			}

		});

		return Account;
});