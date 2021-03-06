define(
	['backbone', 'Models/Contact', 'Models/Account'],
	function (Backbone, Contact, Account)
	{
		var Note = Backbone.Model.extend({

			typestring : 'notes',
			type_settings : {
				'CONTACT': {'icon': "user", 'model': "Contact", 'typestring': "contacts"},
				'MESSAGE': {'icon': "inbox", 'model': "Message", 'typestring': "messages"},
				'ACCOUNT': {'icon': "edit", 'model': "Account", 'typestring': "accounts"}
			},

			initialize : function()
			{	
				this.on('action', this.action);
			},

			parse : function (response) 
			{	
				// A new object
				if (typeof response == "number") return {id: response};
				
				response = response.note? response.note : response;
				
				if(response.date)
				{
					response.fulldate = moment(response.date).format("DD MMM YYYY HH:mm");
					response.dateonly = moment(response.date).format("DD MMM YYYY");
					response.time = moment(response.date).format("HH:mm");

					response.type_icon = this.type_settings[response.model.objectType].icon;
					//Easy type check for templates
					response[response.model.objectType] = true;

					// Hack!
					if(response.model) response.objectType = "note";
				}

				response.intro = response.text? response.text.substr(0, 72): " ";

				return response;
			},
			
			sync : function (method, model, options)
			{
				this.endpoint = (options.endpoint)? "/" + options.endpoint: false;
				
				// Hack
				if(method == "update") return false;
				
				return Backbone.sync(method, model, options);
			},
			
			loaded : function(param)
			{
				return this.get(param? param: "objectType") !== undefined;
			},
			
			attachParent : function (type, id)
			{	
				var object;
				var Message = require('Models/Message');
				
				type	= this.type_settings[type].model;
				object 	= Cloudwalkers.Session["get" + type](id);

				if(!object || !object.get('objectType'))
				{	
					if(type == 'Message')	object = new Message({id: id});
					if(type == 'Contact')	object = new Contact({id: id});
					if(type == 'Account')	object = new Account({id: id});

					object.fetch();
				}
				
				return object;
			},

			url : function()
			{	
				var url = [Cloudwalkers.Session.api];

				if(this.id)										url.push(this.typestring, this.id);
				else if(!this.parent)							url.push(this.typestring);
				//Account
				else if(this.parent.typestring != 'contacts')	url.push(this.parent.typestring, this.parent.id, this.typestring);
				//Contacts
				else if(this.parent.typestring == 'contacts'){
					
					url.push('accounts/' + Cloudwalkers.Session.getAccount().id + '/contacts');
					url.push(this.parent.id);
					url.push(this.typestring)
				}

				url = url.join("/");

				return this.parameters? url + "?" + $.param(this.parameters) : url;
			},

			action : function(token)
			{
				if(token == 'delete'){
					this.deletenote();
				}
			},

			deletenote : function()
			{
				var self = this;

				Cloudwalkers.RootView.confirm 
				(
					'Are you sure you want to remove this note?', 
					function () 
					{
		                self.destroy ({success:function(){
			                    
			                // Hack
							self.trigger ("destroy");
							self.trigger ("destroyed");
			                    
		                }});

					}
				);
			}
		});

		return Note;

});