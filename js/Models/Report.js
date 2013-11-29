Cloudwalkers.Models.Report = Backbone.Model.extend({
	
	/* table	time	category	text	else (numbers, bars, pie) */
	
	'initialize' : function (options)
	{
		if (typeof (options.entity) != 'undefined')
		{
			this.entity = options.entity;
		}
		else
		{
			this.entity = 'report';
		}

		if (typeof (options.type) != 'undefined')
		{
			this.type = options.type;
		}
		else
		{
			this.type = 'time';
		}

		this.isFetched = false;
		this.daterange = null;
		this.display = null;
		this.interval = null;
		this.intervalinput = null;
		this.evolution = null;
	},
	
	
	'getDetails' : function ()
	{
		var stat = this.attributes.series[0];
		var details = this[this.attributes.type + "Details"](stat);
		
		return details;
	},
	
	/**
	 *	Details by type
	 */
	  'textDetails' : function (stat)
	 {
	 
		var stream = Cloudwalkers.Session.getStream(this.get("streamid"));

		return {
			content : stat.values[0].value,
			title: stat.name,
			description : "<strong>" + stream.get("customname") + "</strong>"
		}
	 },
	 
	 'comparisonDetails' : function (stat)
	 {
	 
		var diff = stat.values[0].value - stat.values[1].value;
		if(diff > 0) diff = "+ " + diff ;
		
		var perc = Math.round(stat.values[0].value / stat.values[1].value *100) - 100;

		return {
			content : stat.values[0].value,
			title: "<strong>" + diff + "</strong> (" + perc + "%) in last " + stat.interval,
			description : stat.name
		}
	 },
	
	'refresh' : function ()
	{
		var self = this;
		$.ajax 
		(
			this.getDataURL (),
			{
				'success' : function (data)
				{
					var values;
					if (typeof (data[self.entity]) != 'undefined')
					{
						self.setInternalParameters (data[self.entity].series[0]);
					}
					else
					{
						console.log ('Information not expected:');
						console.log (data);
						
						return;
					}

					var series = [];

					for (var i = 0; i < data[self.entity].series.length; i ++)
					{
						series.push ({
							'values' : self.processValues (data[self.entity].series[i].values)
						});
					}

					self.trigger ('dataset:change', series);
				}
			}
		);
	},

	'getDataset' : function ()
	{
		console.log("DEPRECATION ALERT")
		
		//return this.dataset;
	},
	
	'getDataURL': function ()
	{
		
		
		var url = "json/" + this.get('url') + '?';
		if (this.daterange)
		{
			url += 'start=' + Math.floor(this.daterange[0].getTime () / 1000) + '&end=' + Math.floor(this.daterange[1].getTime () / 1000) + '&';
		}

		if (this.intervalinput)
		{
			url += 'interval=' + this.intervalinput;
		}

		return url;
	},

	'getDatasetType' : function ()
	{
		if (this.get ('type') == 'bars')
		{
			return 'category';
		}
		else if (this.get ('type') == 'table')
		{
			return 'table';
		}
		else if (this.get ('type') == 'time')
		{
			return 'time';
		}
		else if (this.get ('type') == 'text')
		{
			return 'text';
		}
		else
		{
			return 'category';
		}
	},

	'getWidget' : function ()
	{
		var self = this;
		var type = self.get ('type');

		if (type == 'bars')
		{
			var widget = new Cloudwalkers.Views.Widgets.Charts.Barchart ({
				'model' : self,
				'title' : (self.stream ? self.stream.name : '') + ' ' + self.get ('name'),
				'stream' : this.get('stream'),
				'report' : this
			});
		}

		else if (type == 'pie')
		{
			var widget = new Cloudwalkers.Views.Widgets.Charts.Piechart ({
				'model' : self,
				'title' : (self.stream ? self.stream.name : '') + ' ' + self.get ('name'),
				'stream' : this.get('stream'),
				'report' : this
			});
		}

		else if (type == 'table')
		{
			var widget = new Cloudwalkers.Views.Widgets.Charts.Table ({
				'model' : self,
				'title' : (self.stream ? self.stream.name : '') + ' ' + self.get ('name'),
				'stream' : this.get('stream'),
				'report' : this
			});
		}

		else if (type == 'time')
		{
			var widget = new Cloudwalkers.Views.Widgets.Charts.Intervalchart ({
				'model' : self,
				'title' : (self.stream ? self.stream.name : '') + ' ' + self.get ('name'),
				'stream' : this.get('stream'),
				'report' : this
			});
		}

		else if (type == 'comparison')
		{
			var widget = new Cloudwalkers.Views.Widgets.Charts.Comparison ({
				'model' : self,
				'title' : (self.stream ? self.stream.name : '') + ' ' + self.get ('name'),
				'stream' : this.get('stream'),
				'report' : this
			});
		}

		else if (type == 'number')
		{
			
			var widget = new Cloudwalkers.Views.Widgets.Charts.Numberstat ({
				'model' : self,
				'title' : (self.stream ? self.stream.name : '') + ' ' + self.get ('name'),
				'stream' : this.get('stream'),
				'report' : this
			});
		}

		else if (type == 'text')
		{
			var widget = new Cloudwalkers.Views.Widgets.Charts.Textstat ({
				'model' : self,
				'title' : (self.stream ? self.stream.name : '') + ' ' + self.get ('name'),
				'stream' : this.get('stream'),
				'report' : this
			});
		}

		else 
		{
			alert ('Report type not found: ' + type);
		}

		return widget;
	},
	
	'setDateRange' : function (start, end)
	{
		var self = this;
		this.daterange = [ start, end ];
		this.refresh ();
	},
	
	'getValues' : function (callback)
	{
		var self = this;

		this.getSeries (function (series)
		{
			if (series.length > 0)
			{
				callback (series[0].values);
			}
			else
			{
				callback (null);
			}
		})
	},

	'getSeries' : function (callback)
	{
		var self = this;

		this.isFetched = true;

		$.ajax 
		(
			this.getDataURL (),
			{
				'success' : function (data)
				{
					if (typeof (data[self.entity]) == 'undefined')
					{
						callback (false);
						return;
					}

					var series = [];

					for (var i = 0; i < data[self.entity].series.length; i ++)
					{
						series.push ({
							'values' : self.processValues (data[self.entity].series[i].values)
						});
					}

					self.setInternalParameters (data[self.entity].series[0]);

					callback (series);

				}
			}
		);
	},
	
	'setInterval' : function (interval)
	{
		this.intervalinput = interval;
	},

	'getDisplay' : function ()
	{
		return this.display;
	},

	'getInterval' : function ()
	{
		return this.interval;
	},

	'getEvolution' : function ()
	{
		return this.evolution;
	},

	/**
	* Get values, depreciated method to get all values 
	* of the first dataset.
	*/
	'getValues' : function (callback)
	{
		var self = this;

		this.getSeries (function (series)
		{
			if (series.length > 0)
			{
				callback (series[0].values);
			}
			else
			{
				callback (null);
			}
		})
	},

	'getSeries' : function (callback)
	{
		var self = this;

		this.isFetched = true;

		$.ajax 
		(
			this.getDataURL (),
			{
				'success' : function (data)
				{
					if (typeof (data[self.entity]) == 'undefined')
					{
						callback (false);
						return;
					}

					var series = [];

					for (var i = 0; i < data[self.entity].series.length; i ++)
					{
						series.push ({
							'values' : self.processValues (data[self.entity].series[i].values)
						});
					}

					self.setInternalParameters (data[self.entity].series[0]);

					callback (series);

				}
			}
		);
	},

	'setInternalParameters' : function (data)
	{
		var self = this;

		if (typeof (data.display) != 'undefined')
		{
			self.display = data.display;
		}

		if (typeof (data.evolution) != 'undefined')
		{
			self.evolution = data.evolution;
		}

		if (typeof (data.interval) != 'undefined')
		{
			self.interval = data.interval;
		}
	},

	'processValues' : function (inputvalues)
	{
		var values = [];
		var category;

		if (!inputvalues)
		{
			return [];
		}

		if (this.type == 'table')
		{
			// NO processing required
			return inputvalues;
		}
		else
		{
			for (var i = 0; i < inputvalues.length; i ++)
			{
				// If time related chart, show time
				if (this.type == 'time')
				{
					category = (new Date(inputvalues[i].date).getTime ());
				}

				// If categorized, show category (can be string)
				else if (this.type == 'category' || this.type == 'text')
				{
					category = inputvalues[i].category;
				}

				// Otherwise, just show counter
				else 
				{
					category = i;
				}

				values.push 
				([ 
					category,
					this.type != 'text' ? parseInt(inputvalues[i].value) : inputvalues[i].value
				])
			}
		}

		return values;
	}

});