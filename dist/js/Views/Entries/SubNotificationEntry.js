/* 
 *	Sub entry for notifications ( and comments )
 */

define(
	['Views/Entries/SubEntry', 'mustache', 'Collections/Actions'],
	function (SubEntry, Mustache, Actions)
	{
		var Notification = SubEntry.extend({
			
			toggleaction : function (token, newaction)
			{
				var current = this.$el.find('div[data-subentry-action="' + token + '"]');
				var clone = current.clone();
				
				// new Action edits
				clone.attr("data-subentry-action", newaction.token).find("i").attr("class", "").addClass("icon-" + newaction.icon);
				
				// Remove old Action
				current.before(clone).remove();	
			},
			
			markasread : function()
			{
				// Send update
				this.model.save({read: 1}, {patch: true, wait: true});
				
				// Mark stream
				if (this.model.get("stream"))
					Cloudwalkers.Session.getStreams().outdated(this.model.get("stream"));
			},

			togglecommentcontact : function()
			{
				var contact = this.model.attributes.from ? this.model.attributes.from[0] : null;
				if(contact)	Cloudwalkers.RootView.viewContact({model: contact});
			}
			
		});

		return Notification;
});