Cloudwalkers.Views.Entry = Backbone.View.extend({
	
	'tagName' : 'li',
	'template': 'messageentry',
	'notifications' : [],
	'parameters' : {},
	'tokenmap' : {
		'favorite' : 'favourites',
		'retweet' : 'retweets',
		'like' : 'likes'
	},

	'loadedlists' : [],
	
	'events' : 
	{
		'remove' : 'destroy',
		'click [data-notifications]' : 'loadNotifications',
		'click [data-youtube]' : 'loadYoutube',
		'click *[data-action]' : 'action',
		'click' : 'toggle',
	},
	
	'initialize' : function (options)
	{
		// HACK!
		this.parameters = {};
		
		if(options) $.extend(this, options);

		this.loadmylisteners();
	},

	'loadmylisteners' : function()
	{
		this.listenTo(this.model, 'change', this.render);
		this.listenTo(this.model, 'action:toggle', this.toggleaction);
		this.listenTo(this.model, 'destroyed', this.remove);
	},

	'render' : function ()
	{	
		// Parameters
		$.extend(this.parameters, this.model.attributes);
		
		if(this.type == "full" && this.model.get("objectType")) this.parameters.actions = this.model.filterActions();
		
		if(this.template == 'newmessagetimeline')
			this.formatactions(this.parameters);
		
		// Apply role permissions to template data
		Cloudwalkers.Session.censuretemplate(this.parameters);

		// Visualize
		for(n in this.parameters.actions)
			this.parameters.actions[n].name_translated = this.translateString(this.parameters.actions[n].name)

		if(this.parameters.actions && !this.parameters.actions.length)
			this.parameters.hasactions = false;
		else
			this.parameters.hasactions = true;

		for(n in this.parameters.statistics)
			this.parameters.statistics[n].name_translated = this.translateString(this.parameters.statistics[n].name)
		
		this.mustacheTranslateRender(this.parameters);
		
		this.parameters.hasnotes = this.model.hasnotes();
		
		this.$el.html (Mustache.render (Templates[this.template], this.parameters)); //this.model.filterData(this.type, this.parameters)
		
		if(this.$el.find("[data-date]")) this.time();
		
		if(this.checkunread && this.model.get("objectType")) this.checkUnread();

		if (Cloudwalkers.Session.isAuthorized('ACCOUNT_NOTES_VIEW')){

			//Load default note
			this.$el.find('.note-list').html('<li>'+Mustache.render (Templates.messagenote)+'</li>');
				
			//Load note composer
			this.loadnoteui();
		}

		if(this.parameters.hasactions)
			this.renderactions();

		if(this.model.get("status") && this.model.get("status") == 'FAILED'){
			this.$el.addClass('failed');
			this.model.attributes.failed = 'failed';
		}
		
		return this;
	},

	'loadsentiment' : function()
	{	
		var stats = this.parameters.stats;
		var sentiment;

		if(!stats)	return;
		else		sentiment = _.isObject(stats)? stats['sentiment-fake']: null;

		if(sentiment){
			sentiment = Math.floor(sentiment/2) < 5? Math.floor(sentiment/2): 4;
			var sentimentwidget = new Cloudwalkers.Views.Widgets.Sentiment({sentiment: sentiment});

			this.$el.find('.sentiment-wrap').append(sentimentwidget.render().el)
		}
	},
			
	'renderactions' : function()
	{	
		this.actions = new Cloudwalkers.Views.Actions({message: this.model});
		
		this.$el.find('.message-actions').html(this.actions.render().el)

		this.loadedlists = [];

		// Temporary ugly hack to update actions on timeline
		if(this.template == 'messagetimeline'){
			this.actions.on('actions:update', this.updatetimelineactions.bind(this));
		}
	},

	'updatetimelineactions' : function()
	{
		var notescount = this.actions.message.notes.length;
		
		if(notescount)
			this.$el.find('.interaction > .notescount').html(notescount);

	},
	
	'action' : function (element)
	{	
		// Action token
		var action = $(element.currentTarget).data ('action');
		
		if(action == 'note' || action == 'action-list')
		{	
			// Goddamn ugly hack for old timeline
			if(this.template == 'messagetimeline'){
				var composenote = Cloudwalkers.RootView.writeNote(this.model);
				this.listenTo(composenote.note, 'sync', this.noteadded);
			}

			var token = $(element.currentTarget).data ('token');

			this.toggleactions(action, token, element);
		}
		else if(action == 'note-edit')
		{
			this.editnote();
		}
		else if(action == 'tag-showedit')
		{
			this.showtagedit();
		}
		else if(action == 'tag-add')
		{
			var tag = $(element.currentTarget).siblings( "input" ).val();
			if(tag) {
				this.submittag(tag);
				$(element.currentTarget).siblings( "input" ).val('');
			}
		}
		else if(action == 'viewcontact')
		{

			//We are inside viewcontact modal
			if(this.parent)	return;

			var contact = this.model.attributes.from ? this.model.attributes.from[0] : null;
			if(contact)	Cloudwalkers.RootView.viewContact({model: contact});
			
		}
		else
			this.model.trigger("action", action);
	},

	'formatactions' : function(model)
	{
		var actions = model.actions;
		var stats = model.statistics;
		var actionstats = [];

		if(!stats)	return;

		$.each(actions, function(n, action){	

			if(action.token == 'comment' && model.canHaveChildren)
				actionstats.push({token: action.token, action: {icon: 'comment', value: model.children_count}});
			else
			{
				var stat = stats.filter(function(el){ return el.token == this.tokenmap[action.token] }.bind(this));

				actionstats.push(stat.length? {token: action.token, action: stat[0]}: {token: action.token, action:action});
			}
			

		}.bind(this));
		
		model.actionstats = actionstats;
	},

	'editnote' : function()
	{	
		var composenote = new Cloudwalkers.Views.SimpleCompose({model: this.model});

		//Prevent auto re-render on save
		this.stopListening(this.model);

		this.listenTo(composenote, 'edit:cancel', this.canceledit);
		this.listenTo(composenote, 'save:success', this.saved);

		this.$el.find('.message-body').addClass('note-content').html(composenote.render().el);
		this.$el.find('.message-actions').addClass('hidden');

		// Anything to hide
		this.$el.find('.toggle-note-actions').toggle();
	},

	'showtagedit' : function()
	{	
		this.$el.find('.message-tags').toggleClass("enabled");
		this.$el.find('.message-tags .edit').toggleClass("inactive");
	},

	'canceledit' : function(collapse)
	{	
		this.loadmylisteners();
		this.$el.find('.message-actions').removeClass('hidden');

		if(collapse){
			this.toggleactions('note', 'note');
			this.$el.find('.note-content .modal-body textarea').val('');
		}
		else{
			this.$el.find('.message-body').removeClass('note-content').html(this.model.get("text"));
			
			// Anything to show
			this.$el.find('.toggle-note-actions').toggle();
		}
	},

	'saved' : function()
	{
		setTimeout(function(){
			this.canceledit();
			this.loadmylisteners();
		}.bind(this),200)
	},

	'toggleactions' : function(action, token, element)
	{	
		if(element && $(element.currentTarget).hasClass('noresults'))	return;

		//var other = action == 'action-list'? token: 'action-list';
		//Buttons
		var clickedbutton = this.$el.find('[data-action='+action+'][data-token='+token+']');
		/*var otherbutton = this.$el.find('[data-action='+other+']');
		var inactivebuttons = this.$el.find('.actionvalue.inactive');*/
		
		if(!clickedbutton.hasClass('inactive'))
			this.processaction('open', action, token)

		else if(clickedbutton.hasClass('inactive'))
			this.processaction('close')
		

		//container & list
		/*var container = this.$el.find('.message-notes');
		var list = this.$el.find('.action-list');

		// Only for write note
		other = this.$el.find('.'+other);
		
		if(!container.is(':visible') && !clickedbutton.hasClass('inactive'))	// Check
		{	
			this.$el.find('.message-notes').slideDown(); 	//slide container
			list.slideDown();							 	//render list
			clickedbutton.addClass('inactive');				//update button
		}
		else if(container.is(':visible') && !clickedbutton.hasClass('inactive'))
		{	
			other.slideUp('fast');
			inactivebuttons.removeClass('inactive');
			list.slideDown();
			clickedbutton.addClass('inactive');
		}
		else if(container.is(':visible') && clickedbutton.hasClass('inactive'))
		{
			this.$el.find('.message-notes').slideUp();
			clickedbutton.removeClass('inactive');
			other.slideUp();
			list.slideUp();
		}
		
		if(action == 'action-list' && !this.loadednotes)
			this.fetchnotes();*/

	},

	'processaction' : function(operation, action, token)
	{	
		var clickedbutton = this.$el.find('[data-action='+action+'][data-token='+token+']');
		var inactivebuttons = this.$el.find('.actionvalue.inactive');
		var inactivebuttonss = this.$el.find('.actionname.inactive');
		var lists = this.$el.find('.action-list');
		var notecontent = this.$el.find('.note-content');

		var delay = false;

		//Is there a delay needed in the animation?
		if(lists.is(':visible') || notecontent.is(':visible'))
			delay = true;

		// Buttons
		inactivebuttons.removeClass('inactive');
		inactivebuttonss.removeClass('inactive');

		//Lists or other things
		this.$el.find('.action-list').slideUp('fast');
		this.$el.find('.note-content').slideUp('fast');

		if(operation == 'close')
			return;

		// Expand lists & stuff //

		setTimeout(function()
		{
			clickedbutton.addClass('inactive');	

			if(action == 'action-list')
				this.expandlist(token);

			// Composenote
			else if(action == 'note')
				notecontent.slideDown();

		}.bind(this),delay? 200: 1);

	},

	'expandlist' : function(token)
	{
		var list = token+'list';
		
		//Check if list has been fetched already
		if(this.loadedlists.indexOf(list) < 0)
			return this.fetchactions(token)		
		
		this.$el.find('.action-list.'+token+'-list').slideDown();

	},

	'fetchactions' : function(token)
	{	
		//Temporarily, only notes or notifications
		var collection = token == 'note'? this.model.notes: this.model.notifications;

		collection.parentmodel = this.model;
		collection.parenttype = 'message';
		this.listenTo(collection,'seed', this.fillactions.bind(this, token));

		collection.touch(this.model, {records: 999});

		this.loadedlists.push(token+'list');
	},

	'fillactions' : function(token, actions, update)
	{	
		// Create the list div
		var listclass = token+'-list';

		if(!actions.length)
			return this.$el.find('.action-list li').html('No actions found')

		this.$el.find('.'+listclass).remove();
		
		var container = this.$el.find('.action-lists').append('<ul class="action-list '+listclass+'"></ul>');

		// Fill it
		for(n in actions)
		{	
			this.addaction(actions[n], token);
		}

		//container.slideDown();
	},

	'addaction' : function(action, token)
	{	
		var options = {model: action, template: token == 'note'? 'messagenote': 'timelinecomment'}
		var listclass = token+'-list';
		var action;

		if(this.newaction)	options.isnew = true;

		if(token == 'note')
			action = new Cloudwalkers.Views.Widgets.NoteEntry(options);
		else
			action = new Cloudwalkers.Views.Notification(options);

		this.$el.find('.'+listclass).append(action.render().el);

		this.newaction = false;
	},
	
	'toggleaction' : function (token, newaction)
	{
		if(!newaction)	return;

		var current = this.$el.find('[data-action="' + token + '"]');
		var clone = current.clone().attr("data-action", newaction.token);
		
		// new Action edits
		if(current.is("a"))	clone.html("<i class='icon-" + newaction.icon + "'></i> " + newaction.name);
		else 				clone.find("i").attr("class", "").addClass("icon-" + newaction.icon);
		
		// Remove old Action
		current.before(clone).remove();
	},
	
	'toggle' : function() { this.trigger("toggle", this); },
	
	'checkUnread' : function()
	{
		if(!this.model.get("read")) this.$el.addClass("unread");
		else						this.$el.removeClass("unread");
	},
	
	'loadNotifications' : function()
	{
		
		// Collapse if open
		if(this.$el.find(".timeline-comments li").size())
			
			return this.$el.find(".timeline-comments li").remove();
		
		
		/*// Does collection exist?
		if(!this.model.notifications)
			this.model.notifications = new Cloudwalkers.Collections.Notifications();
		
		console.log(this.model.notifications)*/
		
		// Load notifications
		this.listenTo(this.model.notifications, 'seed', this.fillNotifications);
		
		this.model.notifications.touch(this.model, {records: 50, markasread: true});
		
	},
	
	'fillNotifications' : function (list)
	{		
		// Clean load
		$.each(this.notifications, function(n, entry){ entry.remove()});
		this.notifications = [];
		
		// Create array if collection
		if(list.models) list = list.models;
		
		// Clear comments list
		var $container = this.$el.find(".timeline-comments").eq(0).html("");

		// Add models to view
		for (n in list)
		{
			var view = new Cloudwalkers.Views.Notification ({model: list[n], template: 'timelinecomment'});
			this.notifications.push (view);
			
			$container.append(view.render().el);
		}
	},
	
	'loadYoutube' : function ()
	{		
		// Get container
		var $container = this.$el.find(".timeline-video").eq(0);
		var url = $container.data("youtube");
		
		// Activate container
		$container.attr("data-youtube", "").removeClass("inactive");

		// Add youtube to view
		$container.html (Mustache.render (Templates.youtube, {url: url}));
	},

	//Note textarea
	'loadnoteui' : function()
	{	
		var composenote = new Cloudwalkers.Views.SimpleCompose({parent: this.model, persistent: true});
		this.composenote = composenote;

		this.listenTo(composenote.model, 'sync', this.noteadded);
		this.listenTo(composenote, 'edit:cancel', this.canceledit.bind(this, true));

		this.$el.find('.note-content').append(composenote.render().el);		
	},

	'fetchnotes' : function()
	{		
		this.model.notes.parentmodel = this.model;
		this.model.notes.parenttype = 'message';
		this.listenTo(this.model.notes,'seed', this.fillnotes);

		this.model.notes.touch(this.model);

		this.loadednotes = true;
	},

	//Notes list
	'fillnotes' : function(notes)
	{	
		if(!notes.length)	this.$el.find('.note-list li').html(this.translateString("no_notes_found"))
		else				this.$el.find('.note-list').empty();

		for(n in notes)
		{	
			this.addnote(notes[n]);
		}
	},

	'addnote' : function(newnote)
	{	
		var options = {model: newnote, template: 'messagenote'}
		var note;

		if(this.newnote)	options.isnew = true;

		note = new Cloudwalkers.Views.Widgets.NoteEntry(options);
		this.$el.find('.note-list').append(note.render().el);

		this.newnote = false;
	},

	'noteadded' : function(note)
	{	
		//this.addnote(note, true);
		this.toggleactions('action-list', 'note');
		this.newnote = true;
		this.fetchactions('note');
		
		this.trigger('note:added');

		this.composenote.remove();
		this.loadnoteui();
	},

	/* Tags */
	'loadtagui' : function()
	{
		this.fetchtags();
	},

	'fetchtags' : function()
	{	
		var tags = new Cloudwalkers.Collections.Tags();	
		tags.parentmodel = this.model;
		tags.parenttype = 'message';
		this.listenTo(tags,"seed", this.rendertag);

		tags.touch(this.model);
		this.loadedtags = true;
	},
	'rendertag' : function(tags){

				
		if(!tags.length)	this.$el.find('.tag-list').html(this.translateString("no_tags_found"));
		else				this.$el.find('.tag-list').empty();
		this.$el.find('.tag-list').empty();
		for(n in tags)
		{
			this.addtag(tags[n]);
		}
	},
	'submittag' : function(newtag)
	{	
		// Update Tags - POST
		this.tag = new Cloudwalkers.Models.Tag();

		if(this.model)
			this.tag.parent = this.model;

		this.tag.save({'name': newtag}, {success: this.addtag.bind(this)});
	},
	'addtag' : function(newtag)
	{
		var options = {model: newtag, parent: this.model, template: 'messagetag'}
		var tag;

		tag = new Cloudwalkers.Views.Widgets.TagEntry(options);
		this.$el.find('.tag-list').append(tag.render().el);
	},
	'entertag' : function(e)
	{
		if ( e.which === 13 ) {
			var tag = $(e.target).val();
			if(tag) {
				this.submittag(tag);
				$(e.target).val('');
			}
	    }
	},
	
	/*'action' : function (element)
	{
		if ($(element.currentTarget).is ('[data-action]'))
		{
			var actiontoken = $(element.currentTarget).attr ('data-action');
		}
		else if ($(element.target).is ('[data-action]'))
		{
			var actiontoken = $(element.target).attr ('data-action');	
		}
		else
		{
			var actiontoken = $(element.target).parent ('[data-action]').attr ('data-action');	
		}
		
		action = this.model.getAction (actiontoken);

		if (action == null)
		{
			console.log ('No action found: ' + actiontoken);
			return;
		}

		var targetmodel = this.model;
		if (typeof (action.target) != 'undefined')
		{
			targetmodel = action.target;

			if (typeof (action.originalaction) != 'undefined')
			{
				action = action.originalaction;
			}
		}

		if (typeof (action.callback) != 'undefined')
		{
			action.callback (targetmodel);
		}
		else
		{
			if (action)
			{
				if (action.type == 'dialog')
				{
					var view = new Cloudwalkers.Views.ActionParameters ({
						'message' : targetmodel,
						'action' : action
					});
					Cloudwalkers.RootView.popup (view);
				}
				else if (action.type == 'simple')
				{
					targetmodel.act (action, {}, function (){});
				}

				else if (action.type == 'write')
				{
					Cloudwalkers.RootView.writeDialog 
					(
						targetmodel,
						action
					);
				}
			}
		}
	},*/
	
	'time' : function ()
	{
		var now = new Date;
		var date = new Date(this.$el.find("[data-date]").attr("data-date"));
		var diff = Math.round((now.getTime()-date.getTime()) *.001);
		var human;
		
		if(diff < 60)			human = "now";
		else if(diff < 3600)	human = Math.round(diff/60) + "m";
		else if(diff < 86400)	human = Math.round(diff/3600) + "h";
		else if(diff < 2592000)	human = Math.round(diff/86400) + "d";
		else					human = Math.round(diff/2592000) + "mo";
		
		this.$el.find("[data-date]").html(human);
		
		this.tm = setTimeout(this.time.bind(this), 60000);
	},
	
	'destroy' : function ()
    {
		// To-do:
		//this.model.notifications.trigger("destroy");
		
		window.clearTimeout(this.tm);
    },

    'translateString' : function(translatedata)
	{	
		// Translate String
		return Cloudwalkers.Session.polyglot.t(translatedata);
	},

	'mustacheTranslateRender' : function(translatelocation)
	{
		// Translate array
		this.original  = [
			"comments",
			"notes"
		];

		this.translated = [];

		for(k in this.original)
		{
			this.translated[k] = this.translateString(this.original[k]);
			translatelocation["translate_" + this.original[k]] = this.translated[k];
		}
	},

});