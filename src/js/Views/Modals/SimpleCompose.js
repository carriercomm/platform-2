define(
	['Views/BaseView', 'mustache',  'Models/Note', 'Models/Message'],
	function (BaseView, Mustache, Note, Message)
	{
		var SimpleCompose = BaseView.extend({

			// This view defaults to note

			template : 'simplecompose', // Can be overriden
			events : {
				'click #post' : 'post',
				'click #cancel' : 'cancel'
			},

			initialize : function(options)
			{	
				// Parameters
				if(options) $.extend(this, options);

				if(!this.model)	this.model = new Note();

				if(this.parent)
					this.model.parent = this.parent;
			},

			render : function()
			{	
				// Add default text
				var params = {};
				var view;

				if(this.model.get("text"))	params.text = this.model.get("text");
				
				//If it's a modal
				if(this.thanks)	params.modal = true;

				view = Mustache.render(Templates[this.template], params);

				this.$el.html (view);
				this.$el.attr('tabindex', '-1');
				this.$el.attr('role', 'dialog');
				this.$el.attr('aria-hidden', 'true');

				if(this.model.get("text"))	//we are editing
					this.$el.find('h3').remove();

				// Inject custom loadercontainer
				if(!this.$loadercontainer)
					this.$loadercontainer = this.$el.find ('.modal-footer');

				this.loadListeners(this.model, ['request', 'sync']);

				this.trigger("rendered");

				return this;	
			},

			post : function()
			{	
				var text = this.$el.find('textarea').val();
				var typestring = this.model.typestring;

				if(typestring)	this['post'+typestring](text);
			},

			postnotes : function(text)
			{	
				this.model.save({'text': text}, {patch: this.model.id? true: false, success: this.thanks? this.thankyou.bind(this): this.saved.bind(this)});
			},

			postmessages : function(text)
			{
				var content = {'html' : text, 'plaintext' : text};
				this.model.set('body', content);

				this.model.save({'body': this.model.get('body'), status:'draft'}, {success: this.thanks? this.thankyou.bind(this): this.trigger.bind(this,'save:success')});
			},

			cancel : function()
			{	
				this.trigger('edit:cancel');
				if(!this.persistent){
					this.$el.find('button.close').click();
					this.remove();
				}		
			},

			saved : function()
			{	
				setTimeout(function(){
					this.trigger('save:success');
				}.bind(this), 200)
			},

			thankyou : function()
			{	
				var thanks = Mustache.render(Templates.thankyou);
				
				setTimeout(function()
				{
					// Animate compose view
					this.$el.addClass('thanks');

					// Add preview view to Compose
					this.$el.find('section').html(thanks);
					setTimeout(function(){ this.$el.modal('hide'); }.bind(this), 1000);

					if(this.close){
						setTimeout(function(){
							if(this.type == 'draft'){
								this.model = new Message();
							} else {
								this.model = new Note();
							}
								
							this.render();
						}.bind(this), 2000);
					}

				}.bind(this),200);	

				// Trigger to update #notes view
				Cloudwalkers.RootView.trigger("added:note", this.model);			
			},

			clean : function()
			{
				this.$el.find('textarea').val('');
			}

		});

		return SimpleCompose;
	}
);