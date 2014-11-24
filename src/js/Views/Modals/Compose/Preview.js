define(
	['backbone', 'mustache'],
	function (Backbone, Mustache)
	{
		var Preview = Backbone.View.extend({
	
			id : "preview",
			networkclasses : {'facebook' : 'fb', 'twitter' : 'twt', 'google-plus' : 'gp', 'linkedin' : 'li'},
			events : {
				'click #viewsummary' : 'togglesummary'
			},
			
			initialize : function(options)
			{
				if (options) $.extend(this, options); 

				//Get the preview data
				$.extend(this.model.attributes, this.model.getvariation(this.streamid));
				this.model.attributes.profile = Cloudwalkers.Session.getStream(this.streamid).get("profile");

				this.network = Cloudwalkers.Session.getStream(this.streamid).get("network").token;
			},

			render : function ()
			{	
				// Create container view
				var view = Mustache.render(Templates.preview, {networkclass: this.networkclasses[this.network]});
				var template = "template.html";
				
				this.$el.html (view);
				
				this.fill();

				return this;
			},
			
			fill : function ()
			{
				var img;

				this.previewdata = {
					body : this.model.get('body') || "",
					profile : this.model.get('profile')
				};

				// Random load times
				this.fakeload((Math.random()*1.2)+0.4);
				
				// Process possible link information
				if (this.parent.$el.find("#out").hasClass('expanded'))
					this.previewdata.linkdata = this.processlink();

				// Has attached image?
				if (this.model.hasAttachement("image"))
				{
					var img = this.model.hasAttachement("image");

					this.previewdata.image = img.data || img.url;
					this.$el.find("#network").addClass("img"); 

					// hide the linkdata
					if(this.previewdata.linkdata)
						this.$el.find("#network").removeClass("link");
				}

				else if (this.previewdata.linkdata) {

					this.previewdata.image = this.previewdata.linkdata.img;
					this.$el.find("#network").addClass("img"); 
				}
				
				// Render preview (opacity:0)
				var view = Mustache.render(Templates.previewtemplate, this.previewdata);
				this.$el.find("#pv-main").append(view);

				// Loading time
				if(this.previewdata.image)	
					setTimeout(function(){
						this.processimage(img);
					}.bind(this), 100);
			},

			processlink : function ()
			{
				var linkdata = {
					img : this.parent.$el.find("#out [data-type=image] img").get(0).src,
					title : this.parent.$el.find("#out [data-type=title]").text(),
					content : this.parent.$el.find("#out [data-type=content]").text()
				}

				this.$el.find("#network").addClass("link");

				return linkdata;
			},

			processimage : function() 
			{
				var height = this.$el.find('.pv-img img').eq(0).height();
				
				if(height >= 250){
					var margin = (height - 250) / 2;
					this.$el.find('.pv-img img').css('margin-top', margin*-1)
				}
			},

			fakeload : function(time)
			{
				$dis = this.$el;

				//Trigger loading
				$dis.find("#pv-main").addClass("pv-load");
				$dis.find(".progress-bar").css('-webkit-transition','width '+time+'s ease-out');

				setTimeout(function(){
					$dis.find("#pv-main").removeClass("pv-load").addClass("pv-loaded");
				},time*1000);
			},

			mergedata : function(model, variation)
			{
				if(variation.length === 0){
					return model;
				}

				var dataclone = {};

				$.extend(dataclone, model);
				$.extend(dataclone, variation)

				return dataclone;
			},

			togglesummary : function(){
				this.$el.find('.pv-url-content').toggle();
			}

			/* Not working yet
			'parseforurls' : function(content){

				var newcontent;
				var url_pattern = /(\()((?:ht|f)tps?:\/\/[a-z0-9\-._~!$&'()*+,;=:\/?#[\]@%]+)(\))|(\[)((?:ht|f)tps?:\/\/[a-z0-9\-._~!$&'()*+,;=:\/?#[\]@%]+)(\])|(\{)((?:ht|f)tps?:\/\/[a-z0-9\-._~!$&'()*+,;=:\/?#[\]@%]+)(\})|(<|&(?:lt|#60|#x3c);)((?:ht|f)tps?:\/\/[a-z0-9\-._~!$&'()*+,;=:\/?#[\]@%]+)(>|&(?:gt|#62|#x3e);)|((?:^|[^=\s'"\]])\s*['"]?|[^=\s]\s+)(\b(?:ht|f)tps?:\/\/[a-z0-9\-._~!$'()*+,;=:\/?#[\]@%]+(?:(?!&(?:gt|#0*62|#x0*3e);|&(?:amp|apos|quot|#0*3[49]|#x0*2[27]);[.!&',:?;]?(?:[^a-z0-9\-._~!$&'()*+,;=:\/?#[\]@%]|$))&[a-z0-9\-._~!$'()*+,;=:\/?#[\]@%]*)*[a-z0-9\-_~$()*+=\/#[\]@%])/img;
				var urls = content.match(url_pattern);
				
				if(!urls)	return content;
				
				$.each(urls, function(key, url){
					
					while(url.indexOf("ht") != 0)
						url = url.substr(1);

					newcontent = content.replace(url, '<a href="'+url+'">'+url+'</a>');
				});

				return newcontent;
			}*/
		});

		return Preview;
	}
);