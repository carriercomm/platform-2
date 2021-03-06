/**
* to be DEPRECATED -> Reports stuff
*/
define(	
	['Views/Panels/Panel', 'mustache'],
	function (Panel, Mustache)
	{
		var CombinedStatistics = Panel.extend ({

			'size': 'full',
			'currentReport' : null,
			'element' : null,

			'render' : function ()
			{
				var self = this;
				var data = {};
				var el = this.$el;

				this.element = el;

				data.reports = [];
				data.stream = this.options.stream;

				for (var i = 0; i < this.options.reports.length; i ++)
				{
					data.reports.push (this.options.reports[i].attributes);
				}

				data.intervals = [
					{
						'name' : 'Days',
						'token' : 'day'
					},
					{
						'name' : '7 days',
						'token' : '7days'
					},
					{
						'name' : '28 days',
						'token' : '28days'
					}
				];

				el.html (Mustache.render (Templates.combinedstatistics, data));

				// Change report events
				function attachReportEvent (report)
				{
					
					el.find ('[data-report-id="' + report.get ('uniqueid') + '"]').click (function ()
					{
						self.setReport (report);
					});
				}

				function attachIntervalEvent (interval)
				{
					el.find ('[data-interval-id="' + interval.token + '"]').click (function ()
					{
						el.find ('.interval-value').html (interval.name);

						// Calculate date interval

						// First one is ignored.
						var units = 11;

						var days = 1;
						if (interval.token == 'day')
						{
							days = units;
						}
						else if (interval.token == '7days')
						{
							days = 7 * units;
						}
						else if (interval.token == '28days')
						{
							days = 28 * units;
						}

						var now = new Date();
						var today = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

						var start = new Date (today.getTime () - (60 * 60 * 24 * days * 1000));
						var end = today;

						for (var i = 0; i < self.options.reports.length; i ++)
						{
							
							self.options.reports[i].intervalinput = interval.token;//getDataset ().setInterval (interval.token);

							// Also set date range.
							self.options.reports[i].daterange = [ start, end ];//.getDataset ().setDateRange (start, end);
							
							self.options.reports[i].refresh ();
							
						}

						if (self.currentReport)
						{
							self.currentReport.getDataset ().refresh ();
						}
					});
				}

				for (var j = 0; j < this.options.reports.length; j ++)
				{
					attachReportEvent (this.options.reports[j]);
				}

				for (var k = 0; k < data.intervals.length; k ++)
				{
					attachIntervalEvent (data.intervals[k]);
				}

				el.find ('[data-interval-id="' + data.intervals[0].token + '"]').click ();

		        if (this.options.reports.length > 0)
		        {
				    this.setReport (this.options.reports[0]);
		        }
		        else
		        {
		            this.$el.find ('.statistic-container').html ('<p>There is currently no information available.</p>');
		            this.$el.find ('.statistic-title').html ('Combined statistics');
		            this.$el.find ('.statistic-description').html ('');
		        }

				return this;
			},

			'setReport' : function (report)
			{
				this.element.find ('.report-value').html (report.get ('name'));

				this.currentReport = report;

				var div = $('<div></div>');
				this.$el.find ('.statistic-container').html (div);

				this.$el.find ('.statistic-title').html (report.get ('name'));
				this.$el.find ('.statistic-description').html (report.get ('description'));

				report.getWidget ().innerRender (div);
			}

		});

		return CombinedStatistics;
});

