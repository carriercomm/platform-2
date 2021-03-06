/**
* to be DEPRECATED -> Reports stuff
*/
define(
	['Views/Panels/Panel', 'moment'],
	function (Panel, moment)
	{
		var Datepicker = Panel.extend({

			'title' : 'Date range',
			'icon' : 'calendar',
			'color' : 'grey',

			/*'start' : Date.today().add({
				days: -6
			}),

			'end' : Date.today().add ({ 'days' : 1 }),*/

			'events' :
			{
				'submit form' : 'submit'
			},

			'getDateRange' : function ()
			{
				return [ moment().subtract(6, 'days').zone(0).endOf('day')._d ,  moment().zone(0).endOf('day')._d  ];
			},
		 
			'render' : function ()
			{	
				this.start = moment().subtract(6, 'days').zone(0).endOf('day')._d; 
				this.end = moment().zone(0).endOf('day')._d;

				var element = this.$el;

				var data = {};

				var self = this;
				element.html (Mustache.render (Templates.datepicker, data));

				element.find('.dashboard-report-range').daterangepicker({
					ranges: {
						/*'Today': ['today', 'today'],
						'Yesterday': ['yesterday', 'yesterday'],
						*/
						'Last 2 Days': [moment().subtract(1, 'days').zone(0).endOf('day')._d, 'today'],
						'Last 5 Days': [moment().subtract(5, 'days').zone(0).endOf('day')._d, 'today'],
						'Last 7 Days': [moment().subtract(6, 'days').zone(0).endOf('day')._d, 'today'],
						'Last 10 Days': [moment().subtract(9, 'days').zone(0).endOf('day')._d, 'today'],
						/*'This Month': [Date.today().moveToFirstDayOfMonth(), Date.today().moveToLastDayOfMonth()],
						'Last Month': [Date.today().moveToFirstDayOfMonth().add({
								months: -1
							}), Date.today().moveToFirstDayOfMonth().add({
								days: -1
							})]*/
					},
					opens: (App.isRTL() ? 'right' : 'left'),
					format: 'MM/dd/yyyy',
					separator: ' to ',
					startDate: this.start,
					endDate: this.end,
					/*
					minDate: '01/01/2012',
					maxDate: '12/31/2014',
					*/
					locale: {
						applyLabel: 'Submit',
						fromLabel: 'From',
						toLabel: 'To',
						customRangeLabel: 'Custom Range',
						daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
						monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
						firstDay: 1
					},
					showWeekNumbers: true,
					buttonClasses: ['btn-danger']
				},

				function (start, end) {
					element.find('.dashboard-report-range span').html(start.toString('MMMM d, yyyy') + ' - ' + end.toString('MMMM d, yyyy'));
					self.trigger ('date:change', start, new Date (end.getTime ()).add ({ 'days' : 1 }));
				});

				element.find('.dashboard-report-range').show();

				element.find('.dashboard-report-range span').html(this.start.toString('MMMM d, yyyy') + 
					' - ' + (new Date(this.end)).add ({'days' : -1 }).toString('MMMM d, yyyy'));

				/*

				element.find( "#ui_date_picker_range_from" ).datepicker({
				  defaultDate: "+1w",
				  changeMonth: true,
				  numberOfMonths: 2,
				  dateFormat : 'dd/mm/yy',
				  onClose: function( selectedDate ) {
					self.$el.find( "#ui_date_picker_range_to" ).datepicker( "option", "minDate", selectedDate );
				  }
				});

				element.find( "#ui_date_picker_range_to" ).datepicker({
				  defaultDate: "+1w",
				  changeMonth: true,
				  numberOfMonths: 2,
				  dateFormat : 'dd/mm/yy',
				  onClose: function( selectedDate ) {
					self.$el.find( "#ui_date_picker_range_from" ).datepicker( "option", "maxDate", selectedDate );
				  }
				});

				// Recent buttons
				element.find ('.recent-range').click (function (e)
				{
					var range = $(e.currentTarget).attr ('data-range');

					var end = new Date ();
					end.setHours (0, 0, 0);

					var start = new Date (end - (range * 1000));

					self.$el.find( "#ui_date_picker_range_from" ).datepicker ('setDate', start);
					self.$el.find( "#ui_date_picker_range_to" ).datepicker ('setDate', end);

					self.trigger ('date:change', start, end);
				});
				*/

				return this;
			}

			/*,

			'submit' : function (e)
			{
				e.preventDefault ();

				var from = element.find( "#ui_date_picker_range_from" ).datepicker ('getDate');
				var to = element.find( "#ui_date_picker_range_to" ).datepicker ('getDate');

				this.trigger ('date:change', from, to);
			}
			*/

		});

		return Datepicker;
});