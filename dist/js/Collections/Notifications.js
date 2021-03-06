define(
	[ 'Collections/Messages', 'Models/Notification'],
	function ( Messages, Notification)
	{
		var Notifications = Messages.extend({
			
			// MIGRATION
			model: Notification,
			typestring : "notifications",
			modelstring : "notification",
			
			initialize : function()
			{	

				// Put "add" listener to global notifications collection
				if( Cloudwalkers.Session.user.account)
					Cloudwalkers.Session.getNotifications().listenTo(this, "add", Cloudwalkers.Session.getNotifications().distantAdd);
					
				// Destroy listener
				this.on("destroy", this.destroy);

				// Check if it's empty only after sync
				this.on('sync', function(){
					setTimeout(function(){
						this.isempty();
					}.bind(this),1);
				});
			}
		});

		return Notifications;
	}
);