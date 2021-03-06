/**
 *	Editor
 *	Document your functions before writing them.
 *
**/

define(
	['Views/BaseView', 'mustache'],
	function (BaseView, Mustache)
	{
		var Editor = BaseView.extend({
	
			id : "editor",
			oldUrl : "",
			urldata : {},
			currenturl : false,
			
			urlprocessing : false,
			limit : null,
			content : '',
			charlength : 0,
			contentlimitation : 0,
			pos : 0,
			urls : {},

			posmap : [],	
			
			// Should be outside Editor, should be in compose
			restrictedstreams : {'twitter' :140, 'linkedin' : 700},
			//'restrictedstreams' : ['twitter', 'default'],
			
			events : {
				
				// Triggers
				'update:content' : 'render',
				'update:limit' : 'renderlimit',
				'append:content' : 'append',
				
				
				// Listen to $contenteditable
				//'keyup #compose-content' : 'listentochange',
				//'paste #compose-content' : 'listentopaste',
				//'blur #compose-content' : 'endchange',

				'click #swaplink' : 'swaplink',

				/* Oembed data types */
				'click [data-type="title"] .addcontent' : 'addoecontent',
				'click [data-type="content"] .addcontent' : 'addoecontent',
				'click [data-type="image"] i' : 'addoeimg',

				'mouseup #compose-content': 'savepos'

			},
			
			//editableClick: etch.editableInit,


			// regex magic
			xtrimmable : /<[^>]*>|&nbsp;|\s/g,
			// needs improvement
			xurlbasic : /http|[w]{3}/g,
			//'xurlbasic' : /http|[w]{3}/g,
			
			xurlpattern : /(^|\s|\r|\n|\u00a0)((https?:\/\/|[w]{3})?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)(\s|\r|\n|\u00a0)/g,
			xurlendpattern : /(^|\s|\r|\n)((https?:\/\/|[w]{3})?[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/g,
			//'xurlpattern' : /(https?:\/\/[^\s]+)/g,
			
			initialize : function (options)
			{	
				// Parameters
				if(options) $.extend(this, options);

				// URL Shortener
				this.listenTo(Cloudwalkers.Session.UrlShortener, "sync", this.shortenurl);
				this.listenTo(this.parent, "update:stream", function(data){ this.togglecontent(data, true) }.bind(this));
				this.listenTo(this.parent, "update:campaign", this.campaignupdated);
				this.listenTo(this.parent, "replace:content", this.replacecontent);
				
				// Chars limit
				this.on("change:charlength", this.monitorlimit);
				this.on("change:editor", this.listentochange);
				this.on("paste:content", this.listentopaste);
				this.on("blur:content", this.endchange);

				this.loadListeners(this, ['request:og', 'ready:og']);

				this.on('update:limit', this.updatelimit)
				//this.on("change:charlength", this.greyout);

				//Temp hack for browser check - Chrome as default
				if(navigator.userAgent.match(/(firefox(?=\/))\/?\s*(\d+)/i))
					this.isfirefox = true;
				else if(!navigator.userAgent.match(/(chrome(?=\/))\/?\s*(\d+)/i))
					this.isexplorer = true;
				
			},

			render : function(content){
				
				// Data basics
				if(content !== undefined) this.content = content;

				var maxchars = Math.min.apply(Math, _.values(this.restrictedstreams));
				this.restrictedstreams['default'] = maxchars;

				// Do the render
				this.$el.html (Mustache.render (Templates.editor, {limit: maxchars}));
				this.limit = maxchars;
				
				this.$contenteditable = this.$el.find('#compose-content').eq(0);
				this.contenteditable  = this.$contenteditable.get(0);

				//Selection & range base
				this.document = this.contenteditable.ownerDocument || this.contenteditable.document;
				this.win = document.defaultView || document.parentWindow;

				// Add content
				this.$contenteditable.html(this.content);
				if(this.content) this.listentochange();

				this.$loadercontainer = this.$el.find ('#out-loading');
				this.trigger("rendered");

				return this;
			},

			
			/* Editor Listener */
			
			listentopaste : function(e){

				e.preventDefault();
				
				if(e.originalEvent || e.originalEvent.clipboardData){
					var text = e.originalEvent.clipboardData.getData("text/plain");

					document.execCommand("insertHTML", false, text);
				}   

			    this.listentochange(e);
			},

			//Testing hack
			applystyle : function(){

				var sel = this.win.getSelection();
				
		 		//Apply the styling
		        this.contenteditable.designMode = "on";
		        
		        document.execCommand('backColor', false, this.limit? "#fcc": "#fff");
		        
		        this.contenteditable.designMode = "off";
			},

			applyselection : function(e){
				this.greyout(this.limit - this.$contenteditable.text().length, e);

			},

			listentochange : function(e, reload) {

				var newurls;

				//Testing hack
				//if(e && e.keyCode == 17)	this.applyselection(e);
				//if(e && e.keyCode == 18)	this.applystyle();
				
				
				// Did anything change?
				if(this.content !== this.$contenteditable.text() || reload)
				{	
					this.pos = this.cursorpos();
					
					// Check for URL
					//if(!this.urlprocessing && this.$contenteditable.text().match(this.xurlbasic))
					//	this.filterurl();
					newurls = this.listentourl(e, this.$contenteditable.text());

					if(newurls)	this.processurls(newurls);

					// Check for charlimit
					//if (this.charlength != this.$contenteditable.text().length)
					//	this.trigger("change:charlength");
				}
				
				// Content
				this.content = this.$contenteditable.text();
				
				//Default text styling
				if(this.isdefault && !reload){
					this.$contenteditable.removeClass("withdefault");
					this.isdefault = false;
				}

				this.trigger("change:charlength");

				if(reload)	this.clearselections();
			},
			
			endchange : function (e)
			{

				if (this.$contenteditable.html().match(this.xurlendpattern))
				{
					var newurls = this.listentourl(null, this.$contenteditable.text(), true);

					if(newurls)	this.processurls(newurls);
				}
			},
			
			listentourl : function(e, content, forceEnd){

				var sel = this.win.getSelection(); 
				var	range = this.document.createRange();
				var	index;
				var	urlnodes;
				var	nodetext;
				var	startoffset;
				var	endoffset;
				
				if(e && e.type == 'keyup' && e.keyCode != 32)	return;
				if(e && e.type == 'paste')						forceEnd = true;

				//Contenteditable scope
				range.selectNodeContents(this.$contenteditable.get(0));

				//Search for an url
				urlnodes = this.parsenodes(range.startContainer.childNodes, forceEnd);
				
				//Found unprocessed urls?
				if(!urlnodes.length)	return;
				
				$.each(urlnodes, function(n, urlnode)
				{	
					//Get the node with the URL
					//node = range.startContainer.childNodes[index];
					nodetext = urlnode.node.textContent.replace(/&nbsp;/gi,'');
					urlnode.url = urlnode.url.trim();
					
					//URL offset inside node
					startoffset = nodetext.indexOf(urlnode.url);
					
					endoffset = startoffset + urlnode.url.length;
					if(startoffset < 0) startoffset = 0;
					
					//Apply range
					range.setStart(urlnode.node, startoffset);
					range.setEnd(urlnode.node, endoffset);
					sel.removeAllRanges();
			        sel.addRange(range);

					//Apply Magic
					this.contenteditable.designMode = "on";       	
					
					document.execCommand('createLink', false, urlnode.url);		

					this.contenteditable.designMode = "off";
					
					//Cursor placement change (move to function)
					var endurltext = document.createTextNode('\u200B');
					//var endurltext = document.createTextNode(' \u200B\u200B');
					range.insertNode(endurltext);

					this.$contenteditable.find('a').after(endurltext);
					range.setStartAfter(endurltext);	
					
					sel.removeAllRanges();
			        sel.addRange(range);

			      	//The tag creation changes the dom
			        if(urlnodes[n+1])
			        	urlnodes[n+1].node = urlnode.node.nextSibling;

				}.bind(this));
				

		 		return _.pluck(urlnodes, 'url');
			},
			
			parsenodes : function(childnodes, forceEnd)
			{	
				var urlnodes = [];
				var urlnode;
				//Each line/node -> saves from processing lines without urls
				$.each(childnodes, function(i, node){

					var urls = false;
					var text = node.textContent;	

					if(forceEnd && node.nodeType != 3)
						return true;	

					if(text)	urls = text.match(forceEnd? this.xurlendpattern: this.xurlpattern);
				
					// Resolve url at end of string
					//if(childnodes.length == i+1) url = text.match(this.xurlendpattern);


					// Found url(s)
					if(urls && urls.length){

						//Get the urls's nodes
						$.each(urls, function(u, url){
							if(node.nodeType == 3)
								urlnodes.push({node: node, url: url})
							else{
								urlnode = this.getnode(node, null, url);
								if(urlnode && url)
									urlnodes.push({node: urlnode, url: url})
							}
						}.bind(this))		
						
						return true; 
					}

				}.bind(this));
				
				//Nodes with urls to process
				return urlnodes;
			},

			//Finds a node with a cursor position or url
			getnode : function(parentnode, pos, url){
				
				var foundnode;
				
				$.each(parentnode.childNodes, function(n, node)
				{	
					if(url){
						if (node.nodeType == 3) {
							if(node.childNodes.length){
								foundnode = this.getnode(node, null, type);
							}else if(node.textContent.indexOf(url.trim()) > -1){
								foundnode = node;
								return false;
							}			
						}
					}else{
						var nodelength = node.textContent.length;
						if (nodelength >= pos) {
							
							if(node.childNodes.length){
								this.getnode(node, pos);
								return false;
							}
							else{
								this.currentnode = {node : node, offset : pos};
								return false;
							}					
						}
						else return pos -= nodelength;
					}

				}.bind(this));

				return foundnode;
			},

			processurls : function(newurls){

				//Block the url from being edited
				this.$contenteditable.find('a').attr('contenteditable', false);

				if(!this.campaign)
				{
					var campaignid = this.draft.get("campaign");
					var campaigns = Cloudwalkers.Session.getAccount().get("campaigns");
					var campaign = campaigns.filter(function(el){ if(el.id == campaignid) return el; })

					this.campaign = campaign.length ? campaign[0].name : null
				}

				// Trim & request shortened
				if (newurls && !this.urlprocessing){
					this.urlprocessing = true;

					this.parseurls(newurls, this.campaign);
				}
			},

			//Update : Are we updating campaings?
			parseurls : function(urls, campaign, update)
			{
				var options = {
					error : this.releaseurlprocessing
				};

				urls.forEach( function(url) { 
					
					//Only make calls for new urls
					if(!update && this.urls[url]){
						this.shortenurl(this.urls[url]);
						return;
					}

					options.q 	= url;							
					options.campaign = campaign;

					Cloudwalkers.Session.UrlShortener.fetch(options);
				}.bind(this));
			},

			shortenurl : function(model)
			{	
				this.releaseurlprocessing();
				
				var properties = ['description', 'og:description', 'og:image', 'og:video', 'og:title'];

				var self = this;
				var	longurl = model.get('url');
				var	shorturl = model.get('shortUrl');
				var	url = shorturl;

				//Save the url
				if(!this.urls[longurl])	this.urls[longurl] = model.clone();
				
				var urltag = " <short contenteditable='false' data-long='"+ longurl +"' data-short='"+ shorturl +"'>"+ shorturl +"<i class='icon-link' id='swaplink'></i></short>";

				this.$contenteditable.find("a[href='"+ longurl +"']").replaceWith(urltag);
				
				this.trigger('change:content');

				var oembed = '<div><a href="'+ longurl +'" class="oembed"></a></div>';	            

				this.$el.find('#out').empty().html(oembed);

				this.$el.find(".oembed").oembed(null, null, this.embed).each(function(){

					self.$el.find('#out').removeClass('expanded');
					self.trigger('request:og');
					
					this.def.done(function(data){
						
						self.trigger('ready:og');

						if(data)
						{	
							if(data == 'youtube')
								self.$el.find('#out').addClass('expanded');
							else if(_.isObject(data)){
								$.each(data, function(property, value){					
									if(properties.indexOf(property) >= 0)
										self.$el.find('#out').addClass('expanded');
								})
							}
						}
							
					});


				});

				//Update counter
				this.trigger("change:charlength");
				
			},
			
			releaseurlprocessing : function (){ this.urlprocessing = false; },
			
			//Swaps between full url & shortened url
			swaplink : function(e)
			{
				var tag = $(e.currentTarget).get(0).parentElement;
				var sizebefore = this.$contenteditable.text().length;

				var longurl = $(tag).data('long');
				var shorturl = $(tag).data('short');
				var content = $(tag).get(0).textContent.trim();
				var newurl = shorturl == content ? longurl : shorturl;

				var urltag = "<short contenteditable='false' data-long='"+ longurl +"' data-short='"+ shorturl +"'>"+ newurl +"<i class='icon-link' id='swaplink'></i></short>";
					
				$(tag).replaceWith(urltag);

				var sizeafter = this.$contenteditable.text().length;
				var sizespan = sizeafter - sizebefore;
				var linkpos;

				//Set cursor position
				if(shorturl == content)		linkpos = this.$contenteditable.text().indexOf(longurl);
				else						linkpos = this.$contenteditable.text().indexOf(shorturl);

				if(this.pos >= linkpos)		this.cursorpos(this.pos + sizespan)
				else						this.cursorpos(this.pos)

				this.pos = this.cursorpos();
				
				this.trigger('change:content');
				this.trigger('change:charlength');
			},

			campaignupdated : function(campaign)
			{
				var urls = this.urls;

				if(urls.length)
					this.parseurls(urls, campaign, true)
			},
			
			addoetitle : function(e){
				var text = e.currentTarget.innerText;
				//add tittle
			},

			addoecontent : function(e)
			{	
				var text = e.currentTarget.parentElement.textContent;
				var content = this.$contenteditable.html();
				content = content+'<br/>'+text;
				
				this.$contenteditable.html(content);
				this.trigger("change:content");
			},	

			addoeimg : function(e){

				var imgurl = this.$el.find('[data-type="image"] img').get(0).src;
				this.trigger("imageadded", {type: 'image', url: imgurl, name: imgurl});
			},

			clearselections : function()
			{
				if (window.getSelection) {
				  	if (window.getSelection().empty) {  // Chrome
				    	window.getSelection().empty();
				  	} else if (window.getSelection().removeAllRanges) {  // Firefox
				  		//window.getSelection().removeAllRanges();
				  	}
				} else if (document.selection) {  // IE?
				  	document.selection.empty();
				}
			},

			monitorlimit : function()
			{	
				//Update charlength
				this.charlength = this.$contenteditable.text().length;

				//We don't need any further processing
				if(!this.limit)	return;
				
				// Update counter
				var extrachars = this.limit - this.charlength;
				this.updatecounter(extrachars);

				// Ignore if positive
				//if(extrachars < 0)
				//	this.greyout(extrachars);	
						
			},

			updatecounter : function(chars){
				var limit = this.$el.find('.limit-counter');
				
				if(chars >= 20) limit.removeClass().addClass('limit-counter');
				if(chars < 20)	limit.removeClass().addClass('limit-counter').addClass('color-notice');
				if(chars < 0)	limit.removeClass().addClass('limit-counter').addClass('color-warning');
					
				limit.empty().html(chars);
			},

			updatelimit : function(extrachars, update)
			{	
				this.contentlimitation = extrachars;

				if(update)
					this.limit = this.restrictedstreams[this.network]? this.restrictedstreams[this.network] - this.contentlimitation: null;	
			},	

			/* Charlimit functions */	

			greyout : function(charlen, e){ 

				var sel = this.win.getSelection();
				var range = this.document.createRange();
				var here = this.cursorpos();
				var endnode;
				var enddata;
				var insidelinks = 0;
				var links = this.$contenteditable.find('short');

				//Are we deleting text?
				if(this.content.length >= this.$contenteditable.text().length)	
					this.removegrey();

				//Select the extrachars
				range.selectNodeContents(this.$contenteditable.get(0));

				endnode = this.cursorpos(this.$contenteditable.text().length, true);
				enddata = this.cursorpos(this.limit, true);
				
				if(enddata.node){
								
					// Is there a link inside the range?
					//if(insidelinks = range.toString().match(this.xurlendpattern))
					//	insidelinks = insidelinks.length;

					if(e) return;

					links.removeClass("red");

					//Range starts inside a link
					if(this.isurl(enddata.node)){
						//console.log("isurl", $(enddata.node.parentNode));
						$(enddata.node.parentNode).addClass("red");
						enddata.node = enddata.node.parentNode.nextSibling;
						enddata.offset = 0;
						insidelinks ++;
					}

					range.setStart(enddata.node, enddata.offset);
					range.setEnd(endnode.node, endnode.offset);

					sel.removeAllRanges();
			        sel.addRange(range);

					$.each(links, function(l, link){
						if(sel.containsNode(link))
							insidelinks ++;
					});

					//console.log("-----------------------");
			    }

		        //Apply the styling
		        this.contenteditable.designMode = "on";
		        
		        document.execCommand('backColor', false, this.limit? "#fcc": "#fff");
		        
		        this.contenteditable.designMode = "off";

		        
		        
		        if(insidelinks){

		        	while(insidelinks > 0){
		        		$(links[links.length - insidelinks]).addClass("red");
		        		insidelinks --;
		        	}
		        }
		        this.cursorpos(this.$contenteditable.text().length)
		        this.mergechars();
		        this.cursorpos(here);

			},

			isurl : function(u)
			{	
				result = false;

				$.each(this.urls, function(i, url){
					if(url.get("shortUrl") == u.textContent || i == u.textContent){
						result = true;
						return false;
					}	
				});

				return result;
			},

			/*'lastnode' : function()
			{
				var sel = this.win.getSelection();
				var range = this.document.createRange();
			},*/

			removegrey : function(collapse){

				var sel = this.win.getSelection();
				var range = this.document.createRange();

				if(!this.$contenteditable.find('span').length)	return;

				range.selectNodeContents(this.$contenteditable.get(0));
				sel.removeAllRanges();
		    	sel.addRange(range);

				this.contenteditable.designMode = "on";
		    
		        document.execCommand('removeFormat', false, null);
		        
		        this.contenteditable.designMode = "off";

		        //sel.collapse(this.$contenteditable.find('span').get(0),1);
			},

			mergechars : function(){

				$.each(this.$contenteditable.find('span'), function(n, span)
				{	
					$(span).html($(span).text());

				}.bind(this));
			},
			
			/* Cursor and tags */
			
			//Save position on click
			savepos : function(e){
				var tagname = e.target.tagName;

				if(tagname != 'I' && tagname !='SHORT')
					this.pos = this.cursorpos();
			},
			
			cursorpos : function (pos, getoffset)
			{	
				
				var sel, range, preCaretRange, nodelength;
				
				// Get cursor position
				if (pos === undefined)
				{
					pos = 0;
			
				    if (this.win.getSelection() && this.win.getSelection().rangeCount)
				    {	
						range = this.win.getSelection().getRangeAt(0);
						preCaretRange = range.cloneRange();
						preCaretRange.selectNodeContents(this.contenteditable);
						preCaretRange.setEnd(range.endContainer, range.endOffset);
						
						pos = preCaretRange.toString().length;
						
					}
					/*else if((sel = doc.selection) && sel.type != "Control")
					{
						range = sel.createRange();
						preCaretRange = document.body.createTextRange();
						preCaretRange.moveToElementText(this.contenteditable);
						preCaretRange.setEndPoint("EndToEnd", range);
						pos = preCaretRange.text.length;
					}*/
					//console.log("get",pos);
				}
				
				// Set cursor position
				else {	
					
					this.getnode(this.$contenteditable[0], pos);

					var nodedata = this.currentnode;
					
					if(getoffset)
						return {node: nodedata.node, offset : nodedata.offset}
					
					range = this.document.createRange();
					sel = this.win.getSelection();

					range.setStart(nodedata.node, nodedata.offset);
					range.collapse(true);
					sel.removeAllRanges();
					sel.addRange(range);
					//console.log("set",pos);*/
				}
				
				return pos;
			},

			replacecontent : function(content)
			{
				this.$contenteditable.empty().html(content);
				this.trigger("change:content");
			},
			
			togglecontent : function(data, setdefault)
			{	
				var network;
				var stream;
				var val;

				if(data){
					stream 	= _.isNumber(data.id) ? data.id : null;
					val 	= _.isObject(data.data) ? data.data.html : null;
					network = stream? Cloudwalkers.Session.getStream(stream).get("network").token : null;
				}
				
				this.network = network ? network : 'default'; //Keep track of what network we are viewing
				
				//Tab with the default's text 
				if(network && !val)
				{	
					this.$contenteditable.empty().html(this.draft.get("body").html);
					this.$contenteditable.addClass("withdefault");
					this.isdefault = true;
				}

				//Tab without any specific content (on default tab)
				else if(!stream)
				{		
					this.$contenteditable.empty().html(this.draft.get("body").html);
					this.$contenteditable.removeClass("withdefault");
				}

				//Tab with specific content
				else
				{					
					if(!val) val = "";
					this.$contenteditable.empty().html(val);
					this.$contenteditable.removeClass("withdefault");
				}

				this.limit = this.restrictedstreams[this.network]? this.restrictedstreams[this.network] - this.contentlimitation: null;
				
				$.each(this.$contenteditable.find('a'), function(i, anchor)
				{
					anchor.innerText = anchor.innerText.trim();
					//Not needed anymore? Better trimming from backend.
					//$(anchor).attr('contenteditable', 'false').after("&nbsp;");
				});

				//this.updatecounter(this.restrictedstreams[this.network] - this.$contenteditable.text().length);
				this.removegrey(true);
				this.listentochange(null, true);
			}
		});

		return Editor;
});