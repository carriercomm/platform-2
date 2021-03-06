define(
	['Views/Panels/Panel', 'mustache'],
	function (Panel, Mustache)
	{
		var StatSummary = Panel.extend ({

			className : 'stats-summary',
			
			columns :  {
				"contacts" : {'title': 'Total Contacts', "func": "parsecontacts"},
				"score-trending" : {"title": "Popularity score", "func": "parsescore"},
				"outgoing" : {"title": "Messages sent", "func": "parsesent"},
				"coworkers" : {"title": "Co-workers activity", "func": "parseactivity"},

				"contacts-network" : {"title": "Total Contacts", "func": "parsecontactsnetwork"},
				"score-trending-network" : {"title": "Popularity score", "func": "parsescorenetwork"},
				"outgoing-network" : {"title": "Messages sent", "func": "parsesentnetwork"},

				"besttime" : {"title": "Best time to post", "func": "parsebesttime"}
			},

			options : {},
			
			initialize : function(options)
			{
				if (options){
				 	$.extend(this, options);
				 	$.extend(this.options, options);
				}
				
				// Which collection to focus on
				this.collection = this.parentview.collection;
				this.listenTo(this.collection, 'sync:data', this.fill);
			},
			
			render : function ()
			{
				// Parameters
				var params = {columns: []};

				for (var n in this.columnviews)
				{
					params.columns.push(this.columns[this.columnviews[n]]);	
				}

				for (var m in params.columns)
				{	
					if((!params.columns[m].title) && (params.columns[m].title))
						params.columns[m].title = trans(params.columns[m].title)

				}
				// Build view
				this.$el.html (Mustache.render (Templates.statsummary, params));

				return this;
			},
			
			fill : function()
			{
				
				this.$el.find("[data-type]").each(function(i, el){
					
					var func = $(el).data("type");
					$(el).find(".stats-summary-counter").html(this[func]().counter);
					
				}.bind(this));
			},
			
			/**
			 *	Column data
			 **/
			 
			parsecontacts : function ()
			{
				// Get most recent stat
				var stat = this.collection.latest();
				return { counter: stat.pluck("contacts")};
			},
			
			parsescore : function ()
			{
			
				stat = this.collection.latest();
				var total = stat.pluck("notifications") + stat.pluck("activities");
				
				return 	{counter: total};
			},
			
			parsesent : function ()
			{
				// Get most recent stat
				var statl = this.collection.latest();
				var statf = this.collection.first();
				
				var total = statl.pluck("messages") - statf.pluck("messages");
				return { counter: total };
			},
			
			parseactivity : function ()
			{

				//$.each(Cloudwalkers.Session.getStreams().models, function(index, model) { console.log(model.id, model.get("token"))});

				// Get most recent stat
				var id = Cloudwalkers.Session.getStream("coworkers").id;
				var total = this.activitymsgs(this.collection.latest(),id) - this.activitymsgs(this.collection.first(),id);
				
				return {counter: total >= 0 ? total : 0};
			},

			activitymsgs : function(statistic, id){

				var streams = statistic.get("streams");
				var messages;
				
				var stream = $.grep(streams, function(s){
				 	return s.id == id; 
				});

				if(stream.length)
					messages = _.isNumber(stream[0].messages) ? stream[0].messages : stream[0].messages;
				else
					messages = 0

				return messages;
			},


			// *** Network specific plucks ***

			parsecontactsnetwork : function ()
			{
				// Get most recent stat
				var stat = this.collection.latest();
				return { counter: stat.pluck("contacts", this.parentview.streamid)};
			},
			
			parsescorenetwork : function ()
			{
				stat = this.collection.latest();
				var total = stat.pluck("notifications", this.parentview.streamid) + stat.pluck("activities", this.parentview.streamid);
				
				return 	{counter: total};
			},
			
			parsesentnetwork : function ()
			{
				// Get most recent stat
				var statl = this.collection.latest();
				var statf = this.collection.first();
				
				var total = statl.pluck("messages", this.parentview.streamid) - statf.pluck("messages", this.parentview.streamid);
				return { counter: total };
			},

			parsebesttime : function(){

				var besttimes = this.collection.clone().parsebesttime(this.parentview.streamid);

			    if (besttimes.length === 0)
			        return null;
			    
			    var modeMap = {},
			        maxEl = besttimes[0].time,
			        maxCount = 1;

			    for(var i = 0; i < besttimes.length; i++)
			    {	
			        var el = besttimes[i].time;
			        if(el < 0)	continue;

			        if (modeMap[el] == null)
			            modeMap[el] = 1;
			        else
			            modeMap[el]++;

			        if (modeMap[el] > maxCount)
			        {
			            maxEl = el;
			            maxCount = modeMap[el];
			        }
			        else if (modeMap[el] == maxCount)
			        {
			            maxEl = el;
			            maxCount = modeMap[el];
			        }
			    }
			   
			    if(maxEl >= 0)
			    	return {counter: maxEl+'h - '+ (maxEl+1) +'h'};
			    else
			    	return {counter:'--'};
			}
		});

		return StatSummary;
});