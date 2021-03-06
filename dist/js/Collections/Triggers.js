define(
	['Collections/BaseCollection',  'Models/Trigger'],
	function (BaseCollection, Trigger)
	{
		var Triggers = BaseCollection.extend({

			model : Trigger,
			typestring : "triggers",

			parse : function (response)
			{	
				return response.account.triggers;
			},
			
			url : function()
			{	
				var url = [Cloudwalkers.Session.api];
				
				if(this.parent)				url.push(this.parent.typestring, this.parent.id, this.typestring);
				else if(this.typestring)	url.push(this.typestring);		
						
				return url.join("/");
			},

		});

		return Triggers;
});