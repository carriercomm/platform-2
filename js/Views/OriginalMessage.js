Cloudwalkers.Views.OriginalMessage = Cloudwalkers.Views.Message.extend({

	'template' : 'originalmessage',
	'className' : 'originalmessage-view',

	'events' : 
	{
		'click .original-message-action.action' : 'messageAction',
		'click .original-message-children' : 'showchildren'
	}

});