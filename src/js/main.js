/**
 * Require dependencies
 */
require.config({
	baseUrl: '/js/',
	paths: {
		'jquery': 'lib/jquery/dist/jquery.min',
		'jqueryui': 'lib/jquery-ui/jquery-ui.min',
		'underscore': 'lib/underscore/underscore',
		'backbone': 'lib/backbone/backbone',
		'bootstrap': 'lib/bootstrap/dist/js/bootstrap.min',
		'bootstrap-modal': 'lib/bootstrap-modal/js/bootstrap-modal',
		'bootstrap-modalmanager': 'lib/bootstrap-modal/js/bootstrap-modalmanager',
		'mustache': 'lib/mustache/mustache',
		'moment': 'lib/moment/moment',
		'datepicker': 'lib/bootstrap-datepicker/js/bootstrap-datepicker',
		'timepicker': 'lib/bootstrap-timepicker/js/bootstrap-timepicker.min',
		'calheatmap': 'lib/cal-heatmap/cal-heatmap.min',
		'chosen': 'lib/chosen/chosen.jquery.min',
		'd3': 'lib/d3/d3.min',
		'crossdomain': 'lib/backbone.crossdomain/Backbone.CrossDomain',
		'polyglot': 'lib/polyglot/lib/polyglot',
		'slimscroll': 'lib/slimscroll/jquery.slimscroll.min',
		'gritter': 'lib/jquery.gritter/js/jquery.gritter.min',
		'async' : 'lib/requirejs-plugins/src/async',
		'goog': 'lib/requirejs-plugins/src/goog',
        'propertyParser' : 'lib/requirejs-plugins/src/propertyParser',
        'colorbox' : 'lib/colorbox/jquery.colorbox-min',
        'plot' : 'lib/flot/jquery.flot',
        'pie' : 'lib/flot/jquery.flot.pie',
        'resize' : 'lib/flot/jquery.flot.resize',
        'stack' : 'lib/flot/jquery.flot.stack',
        'crosshair' : 'lib/flot/jquery.flot.crosshair',
        'time' : 'lib/flot/jquery.flot.time'
	},
	shim: {
		'bootstrap': {
			deps: ['jquery'],
			exports: 'bootstrap'
		},
		'underscore': {
			exports: '_'
		},
		'plot': {
			deps: ['jquery'],
			exports: 'plot'
		},
		'pie': {
			deps: ['plot'],
			exports: 'pie'
		},
		'resize': {
			deps: ['plot'],
			exports: 'resize'
		},
		'stack': {
			deps: ['plot'],
			exports: 'stack'
		},
		'time': {
			deps: ['plot'],
			exports: 'time'
		},
		'crosshair': {
			deps: ['plot'],
			exports: 'crosshair'
		},
		'jqueryui': {
			deps: ['jquery'],
			exports: 'jqueryui'
		},
		'backbone': {
			deps: ['underscore', 'jquery', 'mustache', 'jqueryui', 'pie', 'resize', 'stack', 'time', 'crosshair'],
			exports: 'backbone'
		},
		'crossdomain': {
			deps: ['backbone'],
			exports: 'crossdomain'
		},
		'calheatmap': {
			deps: ['d3'],
			exports: 'calheatmap'
		},
		'd3': {
			exports: 'd3'
		}
	},
	urlArgs: "bust=" +  (new Date()).getTime()
});

// Set up global Cloudwalkers & translation global reference
var Cloudwalkers;
var trans;

require(
	['backbone', 'bootstrap', 'Cloudwalkers'],
	function(Backbone, bootstrap, Cwd)
	{
		$(document).ready(function()
		{			
			Store = new StorageClassLocal();		

			//MIGRATION -> easy way to instance the global before anything, may be wrong
			Cloudwalkers = Cwd;
			Cloudwalkers.init();
		});
	}
);

/**
 *	Add css dynamic load
 */
function css (url)
{
	// Check if already added
	if($('head').find ('link[href="' + url + '"]').size ()) return null;

	// Build element
	var $link = $('<link />', {type: "text/css", rel: "stylesheet", href: url});
	
	// Append css
	$('head').append ($link);
}

/**
 *	Cloudwalkers level Exceptions
 */
function AuthorizationError (message)
{
	this.name = "Not Authorized";
	this.message = (message || "Not authorized for the current user (no matching authorization token)")
	this.stack = (new Error()).stack;
}

AuthorizationError.prototype = new Error();
AuthorizationError.prototype.constructor = AuthorizationError;

/**
 * Origin function
 */
var origin = function ()
{
	return (window.location.origin)? window.location.origin : window.location.protocol + "//" + window.location.hostname;
}