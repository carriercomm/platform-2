/**
 *	Compose
 *	probably the most important view.
 *
**/

Cloudwalkers.Views.Compose = Backbone.View.extend({
	
	'id' : "compose",
	'className' : "modal hide fade clearfix",
	'type' : "post",
	'network' : "default",
	
	'titles' : {
		'post' : "Write Post"
	},
	
	'options' : {
		false :			["subject","link","images"],
		'twitter' :		["images"],
		'facebook' :	["subject","fullbody","link","images"],
		'linkedin' :	["subject","fullbody","link","images"],
		'tumblr' :		["subject","fullbody","link","images"],
		'google-plus' :	["subject","fullbody","link","images"],
		'youtube' :		["subject","fullbody","link","video"],
		'blog' :		["subject","fullbody","link","images"],
		'group' :		["images","link"],
		'mobile-phone':	[]
	},
	
	'events' : {
		'click li[data-streams]' : 'togglestreams',
		'click .stream-tabs div' : 'togglestream',
		'click [data-toggle]' : 'toggleoption',
		
		'blur [data-option] input' : 'monitor',
		'blur [data-option] textarea' : 'monitor',
		'keyup [data-option] textarea' : 'monitor',
		
		'click .add-file' : 'addfile',
		'click .add-snapshot' : 'addsnapshot',
		'change [data-collapsable=images] input' : 'listentofiles',
		'click .photo-booth' : 'listentobooth',
		
		'blur [data-collapsable=link] input' : 'listentolink',
		'blur input.campaign-name' : 'listentoaddcampaign',
		'click .add-campaign' : 'toggleaddcampaign',
		
		'click .end-preview' : 'endpreview',
		'click #preview' : 'preview',
		'click #save' : 'save',
		'click #post' : 'post'
	},
	
	/*'title' : "Compose message",
	'tagName' : 'form',
	'className' : 'write',
	'typestring' : "messages",
	
	'sendnow' : false,
	'files' : [],
	'options' : [],
	
	'formoptions' : {
		'facebook' : ["url", "images", "fulltext"],
		'twitter' : ["url", "images"],
		'google-plus' : ["url", "images", "fulltext"],
		'linkedin' : ["url", "images", "fulltext", "subject"],
		'mobile-phone' : [],
		'blog' : ["url", "images", "fulltext", "subject"],
		'group' : ["url", "images"],
	},
	
	'events' : 
	{
		'click li[data-stream-id]' : 'togglestream',
		'keyup [name=body].limited' : 'countchars',
		
		'submit form' : 'submit',
		'keyup textarea[name=message]' : 'updateCounter',
		'keyup input[name=title]' : 'updateCounter',
		'click #schedule-btn-toggle' : 'toggleSchedule',
		'click button[value=draft]' : 'setDraft',
		'click [name=delay]' : 'setWithinDate',
		'change select[name=schedule_day],select[name=schedule_month],select[name=schedule_year],select[name=schedule_time]' : 'resetWithin',
		'click #button-response[value=send]' : 'sendNow',
        'click .btnShortenURL' : 'shortenUrl',
        'change select[name=campaign]' : 'selectCampaign',
        'click [name=add-campaign]' : 'addCampaign',
	},*/
	
	'initialize' : function (options)
	{
		// Parameters
		if(options) $.extend(this, options);
		
		// Available Streams
		this.streams = Cloudwalkers.Session.getChannel ('outgoing').streams;
				
		// Draft message
		if(!this.draft)
		{
			// The draft message
			this.draft = new Cloudwalkers.Models.Message({"variations": [], "attachments": [], "streams": [], "body": {}});
			
			// Listen to validation
			this.listenTo(this.draft, "invalid", this.invalid);
		}
	},

	'render' : function ()
	{
		// Collect data
		var params =
		{
			// Aside
			streams:	this.streams.models,
			
			// Post
			title:		this.titles[this.type],
			campaigns:	Cloudwalkers.Session.getAccount().get("campaigns")
		};
		
		// Create view
		var view = Mustache.render(Templates.compose, params);
		this.$el.html (view);
		
		// Add Chosen
		this.$el.find(".campaign-list").chosen({width: "50%"});

		return this;
	},
	
	'monitor' : function (e)
	{
		// Stream
		var streamid = this.activestream? this.activestream.id: false;
		var input = {body: {}};
		
		// Subject
		var val = this.$el.find("[data-option=subject] input").val();
		if(!streamid || (streamid && this.draft.variation(streamid, "subject") != val)) input.subject = val;
		
		// Body (will be extended with a shadow body)
		var val = this.$el.find("[data-option=fullbody] textarea").val();
		var body = this.draft.variation(streamid, "body");
		
		if(!streamid || (streamid && body && body.html != val)) input.body.html = val;
		
		// Limit counter
		this.$el.find("[data-option=limit]").html(140 -val.length).removeClass("color-notice color-warning").addClass(val.length < 130? "": (val.length < 140? "color-notice": "color-warning"));
		
		// Update draft
		if (streamid)	this.draft.variation(streamid, input);
		else 			this.draft.set(input);
	},
	
	'toggleoption' : function (e)
	{
		var $btn = $(e.currentTarget);
		var option = $btn.data("toggle");
		
		var collapsable = $btn.parent().toggleClass("collapsed");
		
		// Summarize
		if(collapsable.hasClass("collapsed")) this["summarize" + option]();
		
	},
	
	'closealloptions' : function ()
	{
		// All open collapsables
		var collapsibles = this.$el.find("[data-collapsable]").not(".collapsed")
			.addClass("collapsed")
			.each( function(n, collapsible)
			{
				this["summarize" + $(collapsible).data("collapsable")]();
				
			}.bind(this));
	},
	
	'togglestreams' : function (e)
	{
		var $btn = $(e.currentTarget);
		var id = $btn.data("streams");
		
		var stream = Cloudwalkers.Session.getStream(id);
		var streamids = this.draft.get("streams");
		
		// Switch buttons and tabs
		if(!$btn.hasClass("active"))
		{
			this.$el.find(".stream-tabs").append('<div class="stream-tab" data-stream="'+ id +'"><i class="icon-'+ stream.get("network").icon +'"></i> '+ stream.get("defaultname") +'</div>');
			
			// Add to draft
			streamids.push(id);
			
		} else {
			this.$el.find("[data-stream="+ id +"]").remove();
			
			// Shift active stream
			if(!this.$el.find(".stream-tabs div.active").size())
			{
				var activediv = this.$el.find(".stream-tabs div").eq(0);
				var activeid = activediv.data('stream');
				
				activediv.addClass('active');
				
				// Toggle subcontents
				this.togglesubcontent(activeid? Cloudwalkers.Session.getStream(activeid): false);
			}
			
			// Remove from draft
			streamids.splice(streamids.indexOf(id), 1);
		}
		
		$btn.toggleClass("inactive active");
			
	},
	
	'togglestream' : function (e)
	{
		var $btn = $(e.currentTarget);
		var id = $btn.data("stream");
		
		var stream = id? Cloudwalkers.Session.getStream(id): false;
		
		this.$el.find(".stream-tabs div.active").removeClass('active');
		
		$btn.addClass('active');
		
		// Toggle subcontent
		this.togglesubcontent(stream);
	},
	
	'togglesubcontent' : function (stream)
	{
		this.activestream = stream;
		
		// Get the right network
		var network = stream? stream.get("network").token: false;
		var icon = stream? stream.get('network').icon: 'default';
		var options = this.options[network];
		var id = stream? stream.id: false;
		
		//var input = this.getinput(network, id);
		
		// Add network icon
		this.$el.find(".modal-body").get(0).className = "modal-body";
		this.$el.find(".modal-body").addClass(icon + "-theme");
		
		// Subject
		if (options.indexOf("subject") >= 0)
		{
			this.$el.find("[data-option=subject].hidden").removeClass("hidden");
			
			var val = network?	this.draft.variation(id, "subject"): this.draft.get("subject");
			
			if(network && !val)	this.$el.find("[data-option=subject] input").val("").attr("placeholder", this.draft.get("subject"));
			else 				this.$el.find("[data-option=subject] input").val(val);
		
		} else					this.$el.find("[data-option=subject]").addClass("hidden");

		

		// Full Body
		if (options.indexOf("fullbody") >= 0)	this.$el.find("[data-option=limit]").addClass("hidden");
		else									this.$el.find("[data-option=limit].hidden").removeClass("hidden");
		
		var val = network? this.draft.variation(id, "body"): this.draft.get("body");
		
		if(network && (!val || !val.html))
		{
			this.$el.find("[data-option=fullbody] textarea").val("").attr("placeholder", this.draft.get("body").html);
			if (this.draft.get("body").html) this.$el.find("[data-option=limit]").html(140 -this.draft.get("body").html.length);
		
		} else
		{
			if(!val.html) val.html = "";
			
			this.$el.find("[data-option=fullbody] textarea").val(val.html);
			this.$el.find("[data-option=limit]").html(140 -val.html.length);
		}
		
		// Toggle options
		this.closealloptions();
		
		this.toggleimages(options.indexOf("images") >= 0, options.indexOf("multiple") >= 0);
		
		this.togglelink(options.indexOf("link") >= 0);

	},
		
	/**
	 *	Options: Images
	**/
	
	'toggleimages' : function(visible, multiple)
	{
		// Open options
		var collapsable = this.$el.find("[data-collapsable=images]")[visible? "removeClass": "addClass"]("hidden");
		
		// Allow multiple
		/*if (multiple)	this.$el.find("[data-collapsable=images] input").attr("multiple", "multiple");
		else			this.$el.find("[data-collapsable=images] input").removeAttr("multiple");*/
		
		//if(visible && collapsable.hasClass("collapsed")) this.summarizeimages();
	},
	
	'summarizeimages' : function()
	{
		// Load thumbnail Summary
		var summary = this.$el.find("[data-collapsable=images] .summary").empty();
		
		this.draft.get("attachments").forEach(function(attachment)
		{
			if (attachment.type == "image")
				$("<li></li>").prependTo(summary).css('background-image', "url(" + attachment.data + ")");
		});
	},
	
	'addfile' : function (e) { $("[data-collapsable=images] input").click() },
	
	'listentofiles' : function (e)
	{
		// Find and iterate the file
		var files = e.target.files;
		var draft = this.draft;
		
		for (var i = 0, f; f = files[i]; i++)
		{
			// Check type
			if (!f.type.match('image.*')) continue;
			
			var reader = new FileReader();
			
			reader.onload = (function(file)
			{	return function(e)
				{
					// Add to view
					var snapshot = $("<li></li>").prependTo("ul.pictures-container").css('background-image', "url(" + e.target.result + ")");
					
					// Add to draft
					draft.attach({type: 'image', data: e.target.result});
					
			}})(f);
			
			reader.readAsDataURL(f);
		}
	},
	
	'addsnapshot' : function (e)
	{
		// Show Photo Booth
		this.$el.find(".photo-booth").removeClass("hidden");
		
		if(!this.media)
			this.media = new MediaClass({video: true});
		
		this.media.start();
	},
	
	'listentobooth' : function ()
	{
		// Emergency Break
		if(!this.media) return;
		
		var result = this.media.snapshot();
		var snapshot = $("<li></li>").prependTo("ul.snapshots-container").css('background-image', "url(" + result + ")");
		
		this.draft.attach({type: 'image', data: result});
		
		// Hide Photo Booth
		this.$el.find(".photo-booth").addClass("hidden");
	},
	
	/**
	 *	Options: Link
	**/
	
	'togglelink' : function(visible)
	{
		// Open options
		var collapsable = this.$el.find("[data-collapsable=link]")[visible? "removeClass": "addClass"]("hidden");
		
		//if(visible && collapsable.hasClass("collapsed")) this.summarizelink();
		
		return this;
	},
	
	'summarizelink' : function()
	{
		// Load Summary
		var summary = this.$el.find("[data-collapsable=link] .summary").empty();
		
		this.draft.get("attachments").forEach(function(attachment)
		{
			if (attachment.type == "link" && attachment.url) summary.html("<span>" + attachment.url + "</span>");
		});
		
		return this;
	},
	
	'listentolink' : function (e)
	{
		var result = $(e.currentTarget).val();
		
		var links = this.draft.get("attachments").filter(function(el){ if(el.type == "link") return el; });
		
		if(links.length) links[0].url = result;
		
		else this.draft.attach({type: 'link', url: result});
		
		// Close it
		this.summarizelink().$el.find("[data-collapsable=link]").addClass("collapsed");
	},
	
	/**
	 *	Options: Campaign
	**/
	
	'summarizecampaign' : function()
	{
		// Campaign value
		var campaignid = this.$el.find(".campaign-list").val();
		var summary = this.$el.find("[data-collapsable=campaign] .summary").empty();
		
		if(campaignid)
		{
			var campaign = Cloudwalkers.Session.getAccount().get("campaigns").filter(function(cmp){ if(cmp.id == campaignid) return cmp; }).shift();
			summary.html("<span>" + campaign.name + "</span>");
		}
				
		return this;
	},
	
	'toggleaddcampaign' : function()
	{
		this.$el.find(".chosen-container, .campaign-name").toggleClass("hidden");
		
		return this;
	},
	
	'listentoaddcampaign' : function (e)
	{
		var result = $(e.currentTarget).val();
		
		//this.draft.campaign();
		
		
		/*var links = this.draft.get("attachments").filter(function(el){ if(el.type == "link") return el; });
		
		if(links.length) links[0].url = result;
		
		else this.draft.attach({type: 'link', url: result});
		
		*/
		
		// Close it
		this.summarizecampaign().$el.find("[data-collapsable=campaign]").addClass("collapsed");
	},
	
	
	/**
	 *	Finalize
	**/
	
	'preview' : function()
	{
		// Animate compose view
		this.$el.addClass("preview-mode");
		
	},
	
	'endpreview' : function()
	{
		// Animate compose view
		this.$el.removeClass("preview-mode");
		
	},
	
	'save' : function()
	{
		this.draft.save({status: "draft"}, {patch: true, success: this.thankyou.bind(this)});
	},
	
	'post' : function()
	{		
		this.draft.save({status: "scheduled"}, {patch: true, success: this.thankyou.bind(this)});
	},
	
	
	
	'thankyou' : function()
	{
		this.$el.find("div").eq(0).html("<div class='thank-you'><i class='icon-thumbs-up'></i></div>");
		
		setTimeout(function(){ this.$el.modal('hide'); }.bind(this), 1000);
	},
	
	'invalid' : function(model, error)
	{
		alert(model.get("title") + " " + error);
	},
	
	
	/* Deprecated */
	
	'render_old' : function ()
	{

		// Parameters
		var data = {streams: [], input: {}, attachments: {}};
		
		// Stream data
		Cloudwalkers.Session.getChannel("outgoing").streams.each(function(stream)
		{
			data.streams.push({id: stream.id, name: stream.get("name"), token: stream.get("network").icon});
		});
		

		// Exisiting model
		if (this.model)
		{
			// Input
			data.input.subject = this.model.get("subject");
			data.input.body = this.model.get("body").html;
		
			var attachments = this.model.get("attachments");
		
			// Attachments
			if (attachments)
				$.each(attachments, function(n, item){ data.attachments[item.type] = {value: item.url}});
		}
		

		// New model
		else this.model = Cloudwalkers.Session.getAccount()[this.typestring].add({new: true});
		
		// Time selection
		setTimeout( function() { this.$el.find('#start, #end').datepicker({format: 'dd-mm-yyyy'}); }.bind(this), 100 );
		
		/*this.files = [];
		this.draft = false;
		this.sendnow = false;
		
		var account = Cloudwalkers.Session.getAccount();

		this.actionparameters = {};

		if (typeof (this.options.actionparameters) != 'undefined')
		{
			for (var i = 0; i < this.options.actionparameters.length; i ++)
			{
				this.actionparameters[this.options.actionparameters[i].token] = this.options.actionparameters[i];
			}
		}

		var self = this;

		var data = {};
		var files = [];

		var objData = {
			'streams' : this.getAvailableStreams ()
		};

		// Stream map
		var streammap = {};
		if (this.model && this.model.get ('streams'))
		{
			for (var i = 0; i < this.model.get ('streams').length; i ++)
			{
				streammap[this.model.get ('streams')[i].id] = true;
			}
		}

        data.channels = [];
        
        $.each(objData.streams.where({outgoing: 1}), function(i, stream)
        {
			stream.attributes.checked = typeof (streammap[stream.id]) != 'undefined';
			data.channels.push (stream.attributes);
        });

		data.BASE_URL = CONFIG_BASE_URL;

		var scheduledate = this.model ? this.model.scheduledate (false) : false;
		var schedulerepeat = this.model ? this.model.repeat () : false;

		// 31 days
		data.days = [];
		data.months = [];
		data.years = [];
		data.times = [];

		data.endrepeat = 
		{
			'days' : [],
			'months' : [],
			'years' : []
		};

		for (var i = 1; i <= 31; i ++)
		{
			data.days.push ({ 'day' : i, 'checked' : (scheduledate ? scheduledate.getDate () == i : false) });
			data.endrepeat.days.push ({ 'day' : i, 'checked' : (schedulerepeat && schedulerepeat.end && schedulerepeat.end.getDate () == i ) });
		}

		// 12 months
		for (i = 1; i <= 12; i ++)
		{
			data.months.push ({ 'month' : i, 'display' : Cloudwalkers.Utils.month (i), 'checked' : (scheduledate ? scheduledate.getMonth () == (i - 1) : false) });
			data.endrepeat.months.push ({ 'month' : i, 'display' : Cloudwalkers.Utils.month (i), 'checked' : (schedulerepeat && schedulerepeat.end && schedulerepeat.end.getMonth () == (i - 1) ) });
		}

		// 10 years
		var value = null;
		for (i = 0; i < 10; i ++)
		{
			value = (new Date()).getFullYear () + i;
			data.years.push ({ 'year' : value, 'checked' : (scheduledate ? scheduledate.getFullYear () == value : false ) });
			data.endrepeat.years.push ({ 'year' : value, 'checked' : (schedulerepeat && schedulerepeat.end && schedulerepeat.end.getFullYear () == value ) });
			//data.endrepeat.years.push ({ 'year' : i, 'checked' : (schedulerepeat && schedulerepeat.end && schedulerepeat.end.getFullYear () == value ) });
		}

		// Weekdays
		data.weekdays = [];

		var weekdays = [ 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday' ];
		for (var i = 0; i < weekdays.length; i ++)
		{
			var name = weekdays[i];
			var f = name.charAt(0).toUpperCase();
			name = f + name.substr(1);

			data.weekdays.push ({
				'name' : name,
				'weekday' : weekdays[i],
				'checked' : (schedulerepeat && schedulerepeat.weekdays && schedulerepeat.weekdays[weekdays[i].toUpperCase ()])
			})
		}

		// Interval
		data.repeatinterval = {
			'amount' : [],
			'unit' : []
		}

		for (var i = 0; i < 72; i ++)
		{
			data.repeatinterval.amount.push ({ 'value' : i, 'name' : i, 'selected' : schedulerepeat && schedulerepeat.interval == i });
		}

		data.repeatinterval.unit.push ({ 'value' : 'minutes', 'name' : 'Minute(s)', 'selected' : schedulerepeat && schedulerepeat.unit == 'minutes' });
		data.repeatinterval.unit.push ({ 'value' : 'hours', 'name' : 'Hour(s)', 'selected' : schedulerepeat && schedulerepeat.unit == 'hours' });
		data.repeatinterval.unit.push ({ 'value' : 'days', 'name' : 'Day(s)', 'selected' : schedulerepeat && schedulerepeat.unit == 'days' });
		data.repeatinterval.unit.push ({ 'value' : 'weeks', 'name' : 'Week(s)', 'selected' : schedulerepeat && schedulerepeat.unit == 'weeks' });
		data.repeatinterval.unit.push ({ 'value' : 'months', 'name' : 'Month(s)', 'selected' : schedulerepeat && schedulerepeat.unit == 'months' });

		// 24 hours
		var hour;
		var minutes;
		for (i = 0; i < 24; i += 0.25)
		{
			hour = Math.floor (i);
			minutes = (i - Math.floor (i)) * 60;

			if (hour < 10)
				hour = '0' + hour;

			if (minutes < 10)
				minutes = '0' + minutes;

			if (scheduledate)
			{
				scheduledate.setMinutes (Math.floor (scheduledate.getMinutes () / 15) * 15);
			}

			data.times.push ({ 'time' :  hour + ':' + minutes, 'checked' : ( scheduledate && scheduledate.getHours () == hour && scheduledate.getMinutes () == minutes ) })
		}

		// Ze buttons
		data.canSchedule = true;
		data.canSave = true;
		data.canSendNow = true;

		// Data
		if (this.model)
		{
			data.canSave = this.model.get ('status') != 'SCHEDULED';

			data.message = jQuery.extend (true, {}, this.model.attributes);

			// Check for action attributes, if availalbe we need to process them
			if (typeof (this.actionparameters.message) != 'undefined' && this.actionparameters.message.value != "")
			{
				data.message.body.plaintext = Cloudwalkers.Utilities.Parser.parseFromMessage (this.actionparameters.message.value, this.model);
				data.message.body.html = Cloudwalkers.Utilities.Parser.parseFromMessage (this.actionparameters.message.value, this.model);
			}


			// Attachments
			data.sortedattachments = {};

			if (this.model.get ('attachments'))
			{
				for (var i = 0; i < this.model.get ('attachments').length; i ++)
				{
					data.sortedattachments[this.model.get ('attachments')[i].type] = [ this.model.get ('attachments')[i] ];
				}
			}

			// Should we open the schedule?
			data.showschedule = false;
			
			if (this.model.scheduledate (false) || typeof (this.model.repeat ().interval) != 'undefined')
			{
				data.showschedule = true;
			}
		}
		
		data.campaigns = account.get("campaigns");*/
		
		// Create view
		var view = Mustache.render(Templates.write, data);
		this.$el.html (view);
		
		this.$body = this.$el.find("[name=body]");
		
		// Find actions
		this.actions = [
			{name: "Post message", classname: data.scheduled? "blue hidden": "blue", attributes: [{attr: "data-toggle", value: "collapse"}, {attr: "data-target", value: "#schedule"}]},
			{name: "Hide schedule", classname: data.scheduled? "blue": "blue hidden", attributes: [{attr: "data-toggle", value: "collapse"}, {attr: "data-target", value: "#schedule"}]},
			{name: "Send", classname: data.scheduled? "pull-right black hidden": "pull-right black", action: "ready"},
			{name: "Schedule", classname: data.scheduled? "pull-right black": "pull-right black hidden", action: "ready"},
			{name: "Save", classname: "pull-right", action: "save"}
		];
		
		/*
		self.$el.find ('[name=url]').change (function ()
		{
			self.updateCounter ();
		});

		self.afterRender ();

		if (this.model)
		{
			setTimeout (function ()
			{
				// Add the files
				var attachments = self.model.get ('attachments');
				
				if (typeof (attachments) != 'undefined')
				{
					for (var i = 0; i < attachments.length; i ++)
					{
						if (attachments[i].type == 'image')
						{
							self.addUploadedFileToList 
							({
								'name' : attachments[i].name,
								'url' : attachments[i].url,
								'delete_url' : 'bla'
							});
						}
					}
				}
			}, 100);
		}

		self.updateCounter ();

		self.$el.find('[name=schedule_random]').click (function () { self.randomTime () });

		self.$el.find ('[data-toggle-id].inactive').hide ();

		self.$el.find ('[data-toggle-target]').click (function ()
		{
			var id = $(this).attr ('data-toggle-target');
			var visible;

			if (self.$el.find ('[data-toggle-id=' + id + ']').is (':visible'))
			{
				self.$el.find ('[data-toggle-id=' + id + ']').hide ();	
				visible = false;
			}

			else
			{
				visible = true;
				self.$el.find ('[data-toggle-id=' + id + ']').show ();
			}

			$(this).toggleClass ('black', visible);
			$(this).toggleClass ('blue', !visible);

		}).each (function ()
		{
			var element = $(this);

			setTimeout (function ()
			{
				var id = element.attr ('data-toggle-target');
				var visible = self.$el.find ('[data-toggle-id=' + id + ']').is (':visible');

				element.toggleClass ('black', visible);
				element.toggleClass ('blue', !visible);
			}, 200);
		});

		self.$el.find ('.inactive[data-toggle-id]').hide ();

		setTimeout (function ()
		{
			self.trigger ('content:change');

			self.$el.find ('#schedule-btn-toggle').toggleClass ('black', self.$el.find ('.message-schedule').is (':visible'));
			self.$el.find ('#schedule-btn-toggle').toggleClass ('blue', !self.$el.find ('.message-schedule').is (':visible'));
		}, 200);*/

		return this;
	},
	
	'countchars' : function (e)
	{
		this.$body
	},
	
	/*'togglestream' : function (e)
	{
		$(e.currentTarget).toggleClass("inactive active");
		
		this.managestreams();
	},*/
	
	'managestreams' : function ()
	{
		// Parameters
		var streams = this.$el.find("[data-stream-id].active").map(function(){ return Cloudwalkers.Session.getStream($(this).data("stream-id"))}).get();
		this.options = [];
		
		$.each(streams, function(n, stream){ this.options = $.extend(this.options, this.formoptions[stream.get("network").token]) }.bind(this));
		
		// Toggle form elements
		this.toggleoptions();
	},
	
	'toggleoptions' : function ()
	{
		
		// Subject
		var subject = (this.options.indexOf("subject") >= 0);
		$('[name="subject"]')[subject? "removeClass": "addClass"]("hidden").get(0).disabled = !subject;
		
		// Body limit
		var limit = (this.options.indexOf("fulltext") < 0);
		$("#counter")[limit? "show": "hide"]();
		$("[name=body]")[limit? "addClass": "removeClass"]("limited");
		
		// Link
		$('[data-target="#url"]')[(this.options.indexOf("url") < 0)? "addClass": "removeClass"]("disabled");
		
		// Image
		$('[data-target="#images"]')[(this.options.indexOf("images") < 0)? "addClass": "removeClass"]("disabled");
	},
	
	

	
	/*'getAvailableStreams' : function ()
	{
		//var streams = Cloudwalkers.Session.getStreams ();
        var channel = Cloudwalkers.Session.getChannel("internal");
        var streams = new Cloudwalkers.Collections.Streams(channel.get("additional").outgoing);

		
		// If this is an action parameter, only show streams of the same network
		if (typeof (this.options.actionparameters) != 'undefined' && typeof (this.model) != 'undefined')
		{
			var stream = Cloudwalkers.Session.getStream (this.model.get ('stream'));

			if (stream)
			{
                // don't look at this!
				var out = new Backbone.Collection ();
				for (var i = 0; i < streams.models.length; i ++)
				{
					if (streams.models[i].get ('network').name == stream.get ('network').name)
					{
						out.add (streams.models[i]);
					}
				}

				return out;
			}
		}

		return streams;
	},*/
	
	
	'setDraft' : function ()
	{
		this.draft = true;
	},

	'sendNow' : function (e)
	{
		e.preventDefault ();
		e.stopPropagation ();

		this.sendnow = true;

		// Sure you want to send now? Or save to draft?
		if (this.$el.find ('.message-schedule').is (':visible'))
		{
			if (
				this.model && 
				confirm ('Are you sure you want to sent this scheduled message now?')
			)
			{
				this.clearScheduleDate ();
				$(e.toElement.form).trigger ('submit');
			}

			else if (confirm ('Are you sure you want to send your message right now? Your schedule details will be lost.'))
			{
				this.clearScheduleDate ();
				$(e.toElement.form).trigger ('submit');
			}
		}
		else
		{
			this.clearScheduleDate ();
			$(e.toElement.form).trigger ('submit');
		}
	},
	
	'selectCampaign' : function (e)
	{

		var value = Number(this.$el.find("select[name=campaign]").val());
		
		if(!value) this.$el.find(".new-campaign, select[name=campaign]").toggleClass("inactive");

	},
	
	'addCampaign' : function (e)
	{
		/* Black hole */
	},

	
	
	'ready' : function (popup)
	{
		
		
		// Close popup
		popup.modal('hide');
	},

	/**
	* Required input:
	* { 
	*	'url' : url, 
	* 	'delete_url' : url, 
	*	'name' : name 
	* }
	*/
	'addUploadedFileToList' : function (file)
	{
		var self = this;

		var p = $(document.createElement ('div'));

		p.addClass ('uploaded-file');

		var img = $(document.createElement ('img'));
		var a = $(document.createElement ('a'));

		img.attr ('src', file.url);

		p.append (img);

		a.html ('Delete');
		a.attr ('href', 'javascript:void(0);');

		self.files.push (file.url);

		a.click (function ()
		{
			for (var i = 0; i < self.files.length; i ++)
			{
				if (self.files[i] == file.url)
				{
					self.files.splice (i, 1);
					break;
				}
			}

			p.remove ();
			self.updateCounter ();

			jQuery.ajax
			({
				async:true, 
				cache:false, 
				data:"", 
				dataType:"json", 
				type:"get", 
				url: file.delete_url
			});
		});

		p.append (a);

		self.$el.find('.fileupload-feedback').append (p);

		self.updateCounter ();
	},

	'getValidationRules' : function ()
	{
		var self = this;
		var streams = Cloudwalkers.Session.getStreams ();
		var selectedstreams = [];

		 $.each(streams.where({outgoing: 1}), function(i, stream)
        {
			if (self.$el.find ('#channel_' + stream.id).is (':checked'))
			{
				selectedstreams.push (stream.attributes);
			}
        });


		/*for (var i = 0; i < streams.length; i ++)
		{
			if (streams[i].get ('direction').OUTGOING == 1)
			{
				if (this.$el.find ('#channel_' + streams[i].get ('id')).is (':checked'))
				{
					selectedstreams.push (streams[i].attributes);
				}
			}
		}*/

		// Fetch all the limitations
		var limitations = {};
		for (var i = 0; i < selectedstreams.length; i ++)
		{
			for (var limitation in selectedstreams[i].network.limitations)
			{
				if (typeof (limitations[limitation]) == 'undefined')
				{
					// Just go with it.
					limitations[limitation] = selectedstreams[i].network.limitations[limitation].limit;
				}

				else
				{
					var currentvalue = limitations[limitation];

					// MAXIMUM means that this is the absolute maximum, so if we have a higher value, replace it
					if (selectedstreams[i].network.limitations[limitation].type == 'MAXIMUM')
					{
						if (currentvalue > selectedstreams[i].network.limitations[limitation].limit)
						{
							limitations[limitation] = selectedstreams[i].network.limitations[limitation].limit;
						}
					} 

					// MINIMUM means that this is the absolute minimum, so if we have a lower value, replace it
					else if (selectedstreams[i].network.limitations[limitation].type == 'MINIMUM')
					{
						if (currentvalue < selectedstreams[i].network.limitations[limitation].limit)
						{
							limitations[limitation] = selectedstreams[i].network.limitations[limitation].limit;
						}
					}
					else
					{
						alert ('Unexpected limitation type: ' + selectedstreams[i].network.limitations[limitation].type);
					}
				}
			}
		}

		return limitations;
	},

	'afterRender' : function ()
	{
		var self = this;

		self.$el.find('form').find ('.channels label').click (function ()
		{
			var element = $(this);
			setTimeout (function ()
			{
				var checkbox = self.$el.find('form').find ('input[type=checkbox]#' + element.attr ('for'));

				if (checkbox.is (':checked'))
				{
					element.parent ().addClass ('active');
					element.parent ().removeClass ('inactive');
				}
				else
				{
					element.parent ().addClass ('inactive');
					element.parent ().removeClass ('active');
				}

				self.updateCounter ();
			}, 100);
		}).each (function ()
		{
			var label = $(this);

			setTimeout (function ()
			{
				var checkbox = self.$el.find('form').find ('input[type=checkbox]#' + label.attr ('for'));

				checkbox.each (function ()
				{
					var input = $(this);

					if (input.is (':checked'))
					{
						label.parent ().addClass ('active');
						label.parent ().removeClass ('inactive');
					}
					else
					{
						label.parent ().addClass ('inactive');
						label.parent ().removeClass ('active');
					}
				});
			}, 100);
		});

		self.$el.find('form').find ('.social-icon-colors input[type=checkbox]').hide ();
		self.$el.find('form').find ('.channels label').addClass ('inactive');

		self.$el.find('form').find ('h2.schedule-message-title').click (function ()
		{
			self.$el.find('form').find ('div.schedule-message-container').toggle ();
		});

		self.$el.find('form').find ('div.schedule-message-container').hide ();

		self.$el.find('form .fileupload').fileupload
		({
			dataType: 'json',
			done: function (e, data) 
			{
				$.each(data.result.files, function (index, file) 
				{
					self.addUploadedFileToList (file);
				});
			}
		});
	},

	// If return true, will create new message instead of editing old message
	'isClone' : function ()
	{
		return typeof (this.options.clone) != 'undefined' && this.options.clone;
	},

	'submit' : function (e)
	{
		e.preventDefault ();

        var self = this;

        setTimeout (function ()
        {
            var form = self.$el.find(e.currentTarget);

            if (form.find ('input[name=title]').val () == 'Add a title to post')
            {
                form.find ('input[name=title]').val ('');
            }

            if (form.find ('input[name=url]').val () == 'URL')
            {
                form.find ('input[name=url]').val ('');
            }

            var data = (form.serialize ());

            for (var i = 0; i < self.files.length; i ++)
            {
                data += '&files[]=' + escape(self.files[i]);
            }

            var url = CONFIG_BASE_URL + 'post/?account=' + Cloudwalkers.Session.getAccount ().get ('id');
            if (self.model && !self.isClone ())
            {
                url += '&id=' + self.model.get ('id');
            }

            // This is a clone. We need to send the original message
            // id so that the system can possibly take the correct measures.
            else if (self.isClone ())
            {
                data += '&original_message=' + self.model.get ('id');
            }

            if (self.draft)
            {
                data += '&draft=true';
            }

            // Reset screen.
            if (self.validate (true))
            {
                self.trigger ('popup:close');

                self.$el.html ('<p>Please wait, storing message.</p>');

                // Do the call
                jQuery.ajax
                ({
                    async:true,
                    cache:false,
                    data: data,
                    dataType:"json",
                    type:"post",
                    url: url,
                    success:function(objData)
                    {
                       if (objData.success)
                        {
                            self.$el.html ('<p>Your message has been scheduled.</p>');

                            if (typeof (self.options.redirect) == 'undefined' || !self.options.redirect)
                            {
                                if (self.draft)
                                {
                                    Cloudwalkers.RootView.alert ('Your message was saved.');
                                    self.render ();
                                }
                                else
                                {
                                    if (window.location.hash != '#schedule')
                                    {
                                        window.location = '#schedule';
                                    }
                                    else
                                    {
                                        Cloudwalkers.Router.Instance.schedule (null);
                                    }
                                }
                            
                            } else {
	                            //hack
	                            window.location.reload();
                            }

                            Cloudwalkers.Session.trigger ('message:add');

                            return true;
                        }
                        else
                        {
                            Cloudwalkers.RootView.alert (objData.error.message);
                        }
                    }
                });
            }
        }, 1);
	},

	'validate' : function (throwErrors)
	{
		if (typeof (throwErrors) == 'undefined')
		{
			throwErrors = false;
		}

		if(this.$el.find ('textarea[name=message]').val ())
		{
			var length = this.$el.find ('textarea[name=message]').val ().length;	
			this.$el.find ('.total-text-counter').html (length);
		}
		

		var rules = this.getValidationRules ();
		
		// Count links
		var links = this.$el.find ('[name=url]').val () != "" ? 1 : 0;

		// Count images
		var images = this.files.length;

		var hasErrors = false;

		// Count extra characters
		var extraCharacters = 0;
		if (typeof (rules['picture-url-length']) != 'undefined')
		{
			extraCharacters += rules['picture-url-length'] * images;
		}

		if (typeof (rules['picture-url-length']) != 'undefined')
		{
			extraCharacters += rules['url-length'] * links;
		}

		if (typeof (rules['include-title-in-max-length']) != 'undefined')
		{
			var subject = this.$el.find ('input[name=title]').val ();

			if (subject.length > 0)
			{
				extraCharacters += subject.length;

				if (typeof (rules['title-spacing-length']) != 'undefined')
				{
					extraCharacters += rules['title-spacing-length'];
				}
			}
		}

		// Has hard limit?
		if (typeof (rules['max-length']) == 'undefined' && typeof (rules['max-length-hardlimit']) != 'undefined')
		{
			rules['max-length'] = rules['max-length-hardlimit'];
		}

		// Check soft limit (sending is still allowed)
		if (typeof (rules['max-length']) != 'undefined')
		{
			rules['max-length'] -= extraCharacters;

			// Update maximum counter
			this.$el.find ('.total-max-counter').html (rules['max-length']);

			if (length > rules['max-length'])
			{
				this.$el.find ('.error').html ('You can only use ' + rules['max-length'] + ' characters');
			}			
		}

		else
		{
			this.$el.find ('.total-max-counter').html ('∞');
		}

		// And now the breaking errors
		if (typeof (rules['max-length-hardlimit']) != 'undefined')
		{
			if (length + extraCharacters > rules['max-length-hardlimit'])
			{
				if (throwErrors)
				{
					this.throwError ('You message cannot be longer than ' + rules['max-length-hardlimit'] + ' characters.');
				}

				return false;
			}
		}

		// Clear errors
		if (!hasErrors)
		{
			this.$el.find ('.error').html ('');
		}

		var date = this.getScheduleDate ();
		if (date && !this.model)
		{
			if (date < (new Date()))
			{
				if (throwErrors)
				{
					this.throwError ('Even CloudWalkers is unable to send messages to the past ¯\\_(ツ)_/¯');
				}
				return false;
			}
		}

		// Schedule repeat
		if (throwErrors)
		{
			// Schedule delay too short
			if (this.$el.find ('[name=repeat_delay_unit]').val () == 'minutes')
			{
				if (this.$el.find ('[name=repeat_delay_amount]').val () > 0
					&& this.$el.find ('[name=repeat_delay_amount]').val () < 20)
				{
					return confirm ('Are you sure you want to repeat this message within such a short time?');
				}
			}

			// See if networks are selected
			if (!this.draft)
			{
				// Count selected networks
				if (this.$el.find ('.channels input[type=checkbox]:checked').length == 0)
				{
					this.throwError ('Please select at least one stream to send too.');
					return false;
				}
			}
		}

		return true;
	},

	'throwError' : function (message)
	{
		alert (message);
	},

	'updateCounter' : function ()
	{
		return this.validate ();
	},

	'clearScheduleDate' : function ()
	{
		this.$el.find ('select[name=schedule_day]').val ('Day');
		this.$el.find ('select[name=schedule_month]').val ('Month');
		this.$el.find ('select[name=schedule_year]').val ('Year');
	},

	'setScheduleDate' : function (date)
	{
		this.$el.find ('select[name=schedule_day]').val (date.getDate ());
		this.$el.find ('select[name=schedule_month]').val (date.getMonth () + 1);
		this.$el.find ('select[name=schedule_year]').val (date.getFullYear ());

		var minutes = String(Math.floor (date.getMinutes () / 15) * 15);
		var hours = String(date.getHours ());

		if (minutes.length == 1)
		{
			minutes = '0' + minutes;
		}

		if (hours.length == 1)
		{
			hours = '0' + hours;
		}

		var value = hours + ':' + minutes;

		this.$el.find ('select[name=schedule_time]').val (value);
	},

	'setWithinDate' : function ()
	{
		var delay = this.$el.find ('[name=delay]:checked').val ();

		var date = new Date ();
		date.setSeconds (delay);

		this.setScheduleDate (date);

		var self = this;

		this.$el.find ('[name=schedule_random]').prop ('checked', false).trigger ('change');
		self.trigger ('content:change');
	},

	'getScheduleDate' : function ()
	{
		var date = new Date ();

		if (this.$el.find ('select[name=schedule_day]').val () != 'Day')
		{
			date.setDate (this.$el.find ('select[name=schedule_day]').val ());
		}
		else
		{
			return false;
		}

		if (this.$el.find ('select[name=schedule_month]').val () != 'Month')
		{
			date.setMonth (this.$el.find ('select[name=schedule_month]').val () - 1);
		}
		else
		{
			return false;
		}

		if (this.$el.find ('select[name=schedule_year]').val () != 'Year')
		{
			date.setFullYear (this.$el.find ('select[name=schedule_year]').val ());
		}
		else
		{
			return false;
		}

		if (this.$el.find ('select[name=schedule_time]').val () != 'Time' && this.$el.find ('select[name=schedule_time]').val ())
		{
			var time = this.$el.find ('select[name=schedule_time]').val ().split (':');

			if (time.length == 2)
			{
				date.setHours (time[0]);
				date.setMinutes (time[1]);
			}
		}
		else
		{
			return false;
		}

		return date;
	},

	'getSelectedDate' : function ()
	{
		var self = this;
		var date = new Date ();

		var randomdate = new Date ();
		randomdate.setFullYear (date.getFullYear (), date.getMonth (), date.getDate ());
		randomdate.setHours (0, 0, 0, 0);

		if (this.$el.find ('select[name=schedule_day]').val () != 'Day')
		{
			randomdate.setDate (this.$el.find ('select[name=schedule_day]').val ());
		}

		if (this.$el.find ('select[name=schedule_month]').val () != 'Month')
		{
			randomdate.setMonth (this.$el.find ('select[name=schedule_month]').val () - 1);
		}

		if (this.$el.find ('select[name=schedule_year]').val () != 'Year')
		{
			randomdate.setFullYear (this.$el.find ('select[name=schedule_year]').val ());
		}

		return randomdate;
	},

	'randomTime' : function ()
	{
		var randomdate = this.getSelectedDate ();

		var available_timestamps = [
			{ 'start' : 60 * 8, 'end' : 60 * 9 },
			{ 'start' : (60 * 12) + (15), 'end' : 60 * 14 },
			{ 'start' : (60 * 19), 'end' : (60 * 24) - 1 }
		];

		var index = Math.floor (Math.random() * 3);

		var daterange = available_timestamps[index];

        var now = new Date();

		var randomminute = daterange.start + (Math.random () * (daterange.end - daterange.start));
		randomdate.setMinutes (randomminute);

        // Hacky hacky no time.
        if (randomdate < now)
        {
            randomdate = new Date();
            randomdate.setHours (now.getHours () + 1);
        }

		this.setScheduleDate (randomdate);
		this.resetWithin (false);

		this.trigger ('content:change');
		
	},

	'resetWithin' : function (alsoRandom)
	{
		if (typeof (alsoRandom) == 'undefined')
		{
			alsoRandom = true;
		}

		this.$el.find ('[name=delay]').prop ('checked', false).trigger ('change');

		if (alsoRandom)
		{
			this.$el.find ('[name=schedule_random]').prop ('checked', false).trigger ('change');
		}

		var self = this;
		setTimeout (function ()
		{
			self.trigger ('content:change');
		}, 1);

		// See if year is selected
		if (this.$el.find ('select[name=schedule_year]').val () == 'Year')
		{
			this.$el.find ('select[name=schedule_year]').val ((new Date()).getFullYear ());
		}
	},

	'toggleSchedule' : function ()
	{
		if (!this.getScheduleDate ())
		{
			var date = new Date ();
			date.setMinutes (date.getMinutes () + 15);

			this.setScheduleDate (date);
		}

		this.$el.find ('.message-schedule').toggleClass ('hidden');

		this.$el.find ('#schedule-btn-toggle').toggleClass ('black', this.$el.find ('.message-schedule').is (':visible'));
		this.$el.find ('#schedule-btn-toggle').toggleClass ('blue', !this.$el.find ('.message-schedule').is (':visible'));

		this.trigger ('content:change');
	},

    'shortenUrl' : function (e)
    {
        e.preventDefault ();

        var field = this.$el.find ('[name=url]');
        var textarea = this.$el.find ('[name=message]');

        $.getJSON( 'http://wlk.rs/api/shorten?callback=?', {
            'url' : field.val (),
            'output' : 'jsonp',
            'format': "json"
        })
        .done(function( data ) {
            if (data.shortUrl)
            {
                textarea.val (textarea.val () + ' ' + data.shortUrl);
                field.val ('');
            }
            else
                Cloudwalkers.RootView.alert (data.error.message);
        });
    }
});