Cloudwalkers.Models.StatisticDataset = Backbone.Model.extend({

	'initialize' : function (options)
	{
		if (typeof (options.entity) != 'undefined')
		{
			this.entity = options.entity;
		}
		else
		{
			this.entity = 'statistics';
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
		this.evolution = null;
	},

	'setDateRange' : function (start, end)
	{
		var self = this;

		this.daterange = [ start, end ];

		$.ajax 
		(
			self.get('dataurl') + '?start=' + Math.floor(start.getTime () / 1000) + '&end=' + Math.floor(end.getTime () / 1000),
			{
				'success' : function (data)
				{
					//console.log (data);
					var values;
					if (typeof (data[self.entity]) != 'undefined' 
						&& typeof(data[self.entity].values) != 'undefined')
					{
						self.setInternalParameters (data);
						values = self.processValues (data[self.entity].values);
					}
					else
					{
						console.log ('Information not expected:');
						console.log (data);
						values = false;
					}


					//console.log (values);

					//var data = [ [[0, 0], [1, 1]] ];
					self.trigger ('dataset:change', values);

				}
			}
		);
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

	'getValues' : function (callback)
	{
		var self = this;

		this.isFetched = true;

		var url = self.get('dataurl');
		if (this.daterange)
		{
			url += '?start=' + Math.floor(this.daterange[0].getTime () / 1000) + '&end=' + Math.floor(this.daterange[1].getTime () / 1000)
		}

		$.ajax 
		(
			url,
			{
				'success' : function (data)
				{
					if (typeof (data[self.entity]) == 'undefined')
					{
						callback (false);
						return;
					}


					//console.log (values);
					var values = self.processValues (data[self.entity].values);

					self.setInternalParameters (data);

					//var data = [ [[0, 0], [1, 1]] ];
					callback (values);

				}
			}
		);
	},

	'setInternalParameters' : function (data)
	{
		var self = this;
		//console.log (values);
		//console.log (data[self.entity].display);
		if (typeof (data[self.entity].display) != 'undefined')
		{
			self.display = data[self.entity].display;
		}

		if (typeof (data[self.entity].evolution) != 'undefined')
		{
			self.evolution = data[self.entity].evolution;
		}

		if (typeof (data[self.entity].interval) != 'undefined')
		{
			self.interval = data[self.entity].interval;
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
				else if (this.type == 'category')
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
					parseInt(inputvalues[i].value)
				])

				//console.log (data.statistics.values[i].value);
			}
		}

		return values;
	}

});