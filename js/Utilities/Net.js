Cloudwalkers.Net = 
{
    'get' : function (method, get, callback)
    {
        var url = Cloudwalkers.Session.api + '/' + method + (get? '?' + jQuery.param (get): '');

        $.ajax (
        {
            type:"get",
            url: url,
            cache : false,
            success:function(objData)
            {
                callback (objData);
            }
        });
    },

	'put' : function (method, get, data, callback)
	{
		var url = Cloudwalkers.Session.api + '/' + method;

		if (typeof (get) != 'undefined' && get)
		{
			url += '?' + jQuery.param (get);
		}

		jQuery.ajax
		({
			data: JSON.stringify (data), 
			dataType:"json", 
			type:"put", 
			url: url, 
			processData : false,
			cache : false,
			success:function(objData)
			{
				callback (objData);
			}
		});
	},

	'post' : function (method, get, data, callback)
	{
		var url = Cloudwalkers.Session.api + '/' + method;

		if (typeof (get) != 'undefined' && get)
		{
			url += '?' + jQuery.param (get);
		}

		jQuery.ajax
		({
			data: JSON.stringify (data), 
			dataType:"json", 
			type:"post", 
			url: url, 
			processData : false,
			cache : false,
			success:function(objData)
			{
				callback (objData);
			}
		});
	},

	'remove' : function (method, get, callback)
	{
		var url = Cloudwalkers.Session.api + '/' + method;

		if (typeof (get) != 'undefined' && get)
		{
			url += '?' + jQuery.param (get);
		}

		jQuery.ajax
		({
			dataType:"json", 
			type:"delete", 
			url: url, 
			cache : false,
			success:function(objData)
			{
				callback (objData);
			}
		});
	}
}