define (
	['backbone', 'gritter', 'Views/Navigation', 'Views/Modals/Compose', 'Views/Modals/Contact', 'Views/Modals/SimpleCompose'],
	function (Backbone, gritter, NavigationView, ComposeModal, ContactModal, SimpleComposeModal)
	{
		var Root = Backbone.View.extend({

			view : null,
			header : null,
			footer : null,

			initialize : function ()
			{
				var self = this;

				this.navigation = new NavigationView (this);
				this.navigation.fit();

				$(window).on("resize", this.resize.bind(this));
				
				this.resize();
			},

			render : function ()
			{
				// Emergency break
				if(!this.view) return null;
				
				// Do some rendering
				$('#inner-content').html (this.view.render ().el);
				
				// Tell your view
				this.view.$el.trigger("rendered");
				
				// Deprecated!
				if(this.view.finish) this.view.finish();
				
				this.navigation.handleSidebarMenu();
			},

			setView : function (view)
			{
				if (this.view) this.view.remove();
				Cloudwalkers.Session.trigger('destroy:view');
				
				this.view = view;	
					
				this.render();
				
				Cloudwalkers.Session.manage();
			},
			
			resize : function()
			{
				// Trigger resize and catch height
				var height = this.height(true);
				this.trigger("resize", height);
				
				$("#inner-content").css("min-height", height-42 + "px");
			},
			
			height : function (strict)
			{
				var view = $(window).height(); 
				var document = $(document).height();
				
				return (strict)?
					(document > view? document: view): view;
			},
						
			popup : function (view)
			{
				var self = this;
				var tmpl = Templates.uipopup;				
				var modal = $(tmpl).modal();

				modal.find ('.modalcontainer').html (view.render ().el);

				view.on ('popup:close', function () { modal.modal ('hide')});

				view.on ('content:change', function () { self.trigger ('content:change')});
			},
			
			compose : function (options)
			{
				// Create Compose view
				if(options)		options.type = "post";
				else			options = {type: "post"};
				
				var view = new ComposeModal(options);
				
				view.render().$el.modal({backdrop: 'static'});

				return view;
			},

			viewContact : function(contact)
			{	
				if(!contact)	contact = 0;
				var options = {contact : contact};

				var view = new ContactModal (options);
				view.render().$el.modal();
			},

			writeNote : function(model)
			{	
				var options = {
					'id' : "compose",
					'className' : "modal hide note",
					'thanks' : true,
					'parent' : model //context -> message, contact, account
				}

				var view = new SimpleComposeModal(options);

				view.render().$el.modal();

				return view;
			},

			confirm : function (message, callback, cancelcallback)
			{
				var data = {};

				data.message = message;
				data.options = [
					{
						'token' : 'confirm',
						'label' : this.translateString('yes'),
						'description' : 'Confirm your action'
					}
				];

				// Mustache Translate
				data.translate_close = this.translateString('close')

				var tmpl = Mustache.render (Templates.uiconfirm, data);

				var element = $(tmpl);
				var modal = element.modal();

				element.find ('[data-response=confirm]').click (function ()
				{
					callback ();
					modal.modal ('hide');
				});

				element.find ('[data-dismiss=modal]').click (function ()
				{
					if(cancelcallback)	cancelcallback ();
				});
			},

			alert : function (message, callback)
			{
				var data = {};

				data.message = message;

				// Mustache Translate
				data.translate_close = this.translateString('close')

				var tmpl = Mustache.render (Templates.uiconfirm, data);

				var element = $(tmpl);
				var modal = element.modal();

				element.find ('[data-response=confirm]').click (function ()
				{
					callback ();
					modal.modal ('hide');
				});
			},
			
			growl : function (title, message)
			{
				$.gritter.add({title: title, text: message, time: 4000});
			},
			
			information : function (title, message, target)
			{
				if(!target) target = "#inner-content .container-fluid";
				
				$(target).prepend("<div class='alert alert-info'><button type='button' class='close' data-dismiss='alert'>&times;</button><strong>" + title + "</strong> " + message + "</div>");
			},

			dialog : function (message, options, callback)
			{
				var data = {};

				data.message = message;
				data.options = options;

				// Mustache Translate
				data.translate_close = this.translateString('close')

				var tmpl = Mustache.render (Templates.uidialog, data);

				var element = $(tmpl);
				var modal = element.modal();

				var addevent = function (option)
				{
					element.find ('[data-response=' + option.token + ']').click (function ()
					{
						callback (option);
						modal.modal ('hide');
					});
				}

				for (var i = 0; i < options.length; i ++)
				{
					addevent (options[i]);
				}
			},

			imagePopups : function ()
			{
				$('a.image-popup-viewer').colorbox ();
			},

			/*resync : function(view)
			{	
				var returnto = view;

				setTimeout(function(){
					Cloudwalkers.Router.Instance.navigate('#resync');

					var view = new ResyncView({returnto: returnto});
					this.setView(view);

				}.bind(this));		
			},*/

			translateString : function(translatedata)
			{	
				// Translate String
				return Cloudwalkers.Session.translate(translatedata);
			}

		});
		
		return Root;
	}
);