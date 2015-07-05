function escapeHTML(html)
{
	var fn = function(tag)
	{
		var charsToReplace = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&#34;'};
		return charsToReplace[tag] || tag;
	}
	return String(html).replace(/[&<>"]/g, fn);
}


var Parser = {};
Parser.suffixString = "<h6>&lt;視界奇觀&gt;編譯整理    資料來源：<a href=\"http://wonder4.co/\">視界奇觀</a></h6><h3><span style=\"color: #ff0000;\"><strong>&lt;視界奇觀&gt; 希望能帶給大家各式有趣又有質感的內容，喜歡的話趕緊按下like，加入我們的粉絲吧！</strong></span></h3>";

Parser.beautify = function(html)
{
	var options = {
		"indent":true,
		"show-body-only": true,
		"indent-spaces": 4,
		"wrap": 0,
		"markup":true,
		"output-html": true,
		"numeric-entities":true,
		"quote-marks":true,
		"quote-nbsp":false,
		"show-body-only":true,
		"quote-ampersand":false,
		"break-before-br":true,
		"uppercase-tags":false,
		"uppercase-attributes":false,
		"bare": true,
		"clean": true,
		"hide-comments": true,
		"drop-empty-paras": true,
		"drop-font-tags":true,
		"show-info": true,
		"show-warnings": false,
		"show-errors": 0,
		"quiet": true,
		"tidy-mark":false
	};
	return tidy_html5(html, options);
}

Parser.convertCnToTw = function(data, convMethod, successCb)
{
	var url = "http://conv.nulldev.info/convert";
	$.post(url, {'method': convMethod, 'data': data}, successCb, 'json');
}

Parser.postCleaner = function(obj)
{
	// remove id & class attributes
	obj.find('*').removeAttr('class').removeAttr('id');
	obj.find('script').remove();
	obj.find('*').each(function() {
		var subObj = $(this);

		// clone attributes into array
		var attributes = $.map(this.attributes, function(item) { return item.name;});

		$.each(attributes, function(i, attr) {
			if (attr.indexOf('rel') > -1 || attr.indexOf('data-') > -1)
			{
				subObj.removeAttr(attr);
			}
		});
	});
}

Parser.getYoutubeEmbedTag = function(videoId, width, height)
{
	if (width == undefined)
		width = 640;
	if (height == undefined)
		height = 360;
	var embedUrl = 'https://www.youtube.com/embed/' + videoId + '?origin=http://wonder4.co';

	var iframeStr = '<p><iframe type="text/html" width="' + width +
		'" height="' + height +
		'" src="' + embedUrl +'" frameborder="0"/></p>';
	return iframeStr;
}

Parser.WeixinParser = function(url, data)
{
	var obj = $(data);
	content = obj.find('#js_content');

	// remove invalid tags
	content.find('ignore_js_op').remove();

	// handle img tag
	content.find("img").each(function(i) {
		var e = $(this);
		if (e.css('display') == 'none')
		{
			e.remove();
			return;
		}
		var newObj = $('<img />');
		var imgSrc = e.attr('src');
		if (!imgSrc)
			imgSrc = e.attr('data-src');
		else if (!imgSrc)
			imgSrc = e.attr('rel:bf_image_src')

		if (imgSrc)
		{
			regex = /(.*)\?(.*)/;
			var matched = imgSrc.match(regex);
			if (matched && matched.length > 1)
				imgSrc = matched[1];

			newObj.attr('src', imgSrc);
			e.replaceWith(newObj);
		}
	});

	// handle iframe tag
	content.find("iframe").each(function(i) {
		$(this).attr('src', decodeURIComponent($(this).attr('data-src')));
		console.log("data-src:" + decodeURIComponent($(this).attr('data-src')));
	});

	// remove unused style attributes
	content.find("p,strong,section").removeAttr('style');

	// remove br tags
	content.find('br').remove();
	// remove span tags
	content.find("span").contents().unwrap();
	// remove empty tags
	content.find("p:empty").remove();

	Parser.postCleaner(content);

	return Parser.beautify(content.html());
}

Parser.BuzzFeedParser = function(url, data)
{
	var obj = $(data);
	content = obj.find('#buzz_sub_buzz');
	// remove printable contents
	content.remove('.print');

	content.find('img').each(function(i) {
		var e = $(this);
		if (e.css('display') == 'none')
		{
			e.remove();
			return;
		}
		var newObj = $('<img />');
		newObj.attr('src', e.attr('rel:bf_image_src'));
		newObj.attr('style', e.attr('style'));
		newObj.width(e.width());
		newObj.height(e.height());
		e.replaceWith(newObj);

	});

	content.find("blockquote[data-instgrm-version]").each(function(i) {
		// replace blockquote as img tag
		var url = $(this).find('a').attr('href');
		var regex = /http:\/\/.*\/p\/(.*)\//;
		var shortCode = url.match(regex)[1];
		var imgUrl = 'http://instagram.com/p/' + shortCode + '/media?size=l';
		var imgObj = $('<img />');
		imgObj.attr('src', imgUrl);
		$(this).replaceWith(imgObj);
	});

	content.find('div.sub_buzz_source_via').each(function(i) {
		var linkObj = $(this).find('a');
		var href = linkObj.attr('href');
		var text = linkObj.text();
		var prefix = "圖片來源：";
		if (text.indexOf('youtube') > -1)
			prefix = "影片來源：";

		linkObj.text(prefix + text);
		linkObj.wrap('<h6></h6>');
	});

	// process youtube embed
	content.find('div.video-embed-big').each(function(i) {
		var param = $.parseJSON($(this).attr('rel:bf_bucket_data'));
		console.log('url:' + param['video']['url']);
		var regex = /http:\/\/.*\/watch\?v=(.*)/;
		var videoId = param['video']['url'].match(regex)[1];
		var iframeStr = Parser.getYoutubeEmbedTag(videoId, param['video']['width'], param['video']['height']);

		$(this).find(':first').before(iframeStr);
	});

	// remove empty tags
	content.find('img:not([src]),span:empty,div.pinit,div.share-box,script').remove();

	Parser.postCleaner(content);

	return Parser.beautify(content.html());
}


Parser.ZhihuParser = function(url, data)
{
	var content = '';
	if (url.indexOf('#answer-') > -1)
	{
		var regex = /.*#(.*)/;
		var matched = url.match(regex);
		var answerId = matched[1];
		var answerObj = $('a[name="' + answerId + '"]', data);
		content = answerObj.parent();
		answerObj.remove();
	}
	else
	{
		content = $('.zu-main-content-inner', data);
	}
	return "";
	var removedClass =
		".zm-votebar, .zm-item-meta, .zm-meta-panel, .zm-tag-editor, " +
		".panel-container, .zh-answers-title, .zm-list-avatar, " +
		".zh-question-answer-summary-wrap, .zm-item-vote-info," +
		"a[name=\"collapse\"], " +
		"#zh-question-collapsed-link, #zh-question-collapsed-wrap, #zh-question-answer-form-wrap";
	content.find(removedClass).remove();

	Parser.postCleaner(content);

	return Parser.beautify(content.html());
}

// parser dispatcher
Parser.parsePage = function(url, data)
{
	if (url.indexOf("weixin") > -1)
	{
		return Parser.WeixinParser(url, data);
	}
	else if (url.indexOf("buzzfeed") > -1)
	{
		return Parser.BuzzFeedParser(url, data);
	}
	else if (url.indexOf("zhihu") > -1)
	{
		return Parser.ZhihuParser(url, data);
	}
	else
	{
		return false;
	}
}

$(document).ready(function() {
	var resultOutline = $('#resultOutline');
	var resultContent = $('#resultContent');
	var previewContent = $('#previewContent');
	var processStatus = $('#processStatus');

	resultOutline.hide();
	$('#urlField').val();

	ZeroClipboard.config({swfPath: "js/ZeroClipboard.swf"});
	var clipboard = new ZeroClipboard(document.getElementById("copyButton"));

	clipboard.on("copy", function(event) {
		var clipboardData = event.clipboardData;
		clipboardData.setData("text/plain", htmlCodeData);
	});

	clipboard.on("aftercopy", function(event) {
		console.log("aftercopy event, data:" + event.data["text/plain"]);
		processStatus.html("Content Copied");

	});



	var htmlCodeData = "";
	$('#processButton').click(function() {
		var urlValue = $('#urlField').val();
		var convertMethodValue = $('#convertMethodField').val();

		processStatus.html("Processing..");


		function convertSuccess(data, status, xhr)
		{
			console.log("convertSuccess");
			var retcode = parseInt(data['retcode']);
			htmlCodeData = data['result'] + Parser.suffixString;
			if (!retcode)
			{
				processStatus.html("Process Fail, can't convert text encoding.");
			}

			resultContent.html("<pre id='resultHtml' class='htmlCode'></pre>");
			$('#resultHtml').html(escapeHTML(htmlCodeData));
			$("pre.htmlCode").snippet("html",
				{style: "bright", showNum:false}
			);

			resultOutline.show();
			previewContent.html(htmlCodeData);

			processStatus.html("Process Success");
		}

		var htmlCode = '';
		var fetchApiUrl = 'fetch.php';
		$.getJSON(fetchApiUrl, {url:urlValue},
			function(data) {
				if (data['result'] == false)
				{
					processStatus.html("Process Fail, can't fetch target page");
					return true;
				}

				htmlCodeData = Parser.parsePage(urlValue, data['result']);
				Parser.convertCnToTw(htmlCodeData, convertMethodValue, convertSuccess);
		})
		.fail(function() {
			processStatus.html("Process Fail, can't fetch target page");
		})

	});

	$('#collapseButton').click(function(e) {
		resultOutline.toggle();
	});

	$('#collapsePreviewButton').click(function(e) {
		previewContent.toggle();
	});
});
