<html lang="zh-tw">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title>Wonder4 Crawler</title>
	<link href="css/bootstrap.min.css" rel="stylesheet" type="text/css" />
	<link href="css/wonder4.css" rel="stylesheet" type="text/css" />
	<link href="css/jquery.snippet.min.css" rel="stylesheet" type="text/css" />

</head>

<body>
<div id="main-container" class="container">
	<h5 style="color:#999;">Current supported targets: BuzzFeed, Weixin, Zhihu</h5>
	<form id="fetchForm" action="#">
		<div  class="form-group">
			<label for="urlField">Target URL</label>
<!--
			<input type="url" class="form-control" id="urlField" placeholder="Type URL here" value="">
			<input type="url" class="form-control" id="urlField" placeholder="Type URL here" value="http://www.buzzfeed.com/nicholaswray/listhp-thity-bith#.vlowR2v4Q">
			<input type="url" class="form-control" id="urlField" placeholder="Type URL here" value="http://www.buzzfeed.com/leonoraepstein/amazing-nail-art-designs-2000s-girls-will-love#.tgRjKLZdd">
			<input type="url" class="form-control" id="urlField" placeholder="Type URL here" value="http://mp.weixin.qq.com/s?__biz=MzA5ODA1OTgyNw%3D%3D&mid=209420687&idx=2&sn=b809aafdf0e1af88fc94de666f1af495&scene=4#rd">
			<input type="url" class="form-control" id="urlField" placeholder="Type URL here" value="http://mp.weixin.qq.com/s?__biz=MjM5NDAzMzQwMA==&mid=209586298&idx=3&sn=c48be850f334bf5000445dfe3dfc9316#rd">
			<input type="url" class="form-control" id="urlField" placeholder="Type URL here" value="http://www.zhihu.com/question/20248668#answer-913416">
-->
			<input type="url" class="form-control" id="urlField" placeholder="Type URL here">
		</div>
		<div class="form-group">
			<label for="convertMethodField">簡繁轉換模式</label>
			<select id="convertMethodField" class="form-control">
				<option value="s2t">簡體到繁體</option>
				<option value="s2tw"> 簡體到臺灣正體</option>
				<option value="s2twp" selected="selected">簡體到繁體（臺灣正體標準）並轉換爲臺灣常用詞彙</option>
			</select>
		</div>
		<button type="button" id="processButton" class="btn btn-primary">Process Now</button>
		<span id="processStatus"></span>
	</form>
	<div class="col-md-12 text-right" style="margin-bottom: 8px">
		<span id="articleInfo"></span>
		<button id="collapseButton">折疊/展開</button>
		<button id="copyButton">複製到剪貼簿</button>
	</div>
	<div id="resultOutline">
		<div id="resultContent" class="col-md-12">
			<pre id="resultHtml" class="htmlCode"></pre>
		</div>
	</div>
	<hr width="100%">
	<div class="col-md-12 text-right" style="margin-bottom: 8px">
		<button id="collapsePreviewButton">預覽 折疊/展開</button>
		<div id="previewContent"></div>
	</div>

</div> <!-- main-container -->
<blockquote id="targetContent" style="display:none;"></blockquote>

<script type="text/javascript" src="js/jquery.min.js"></script>
<script type="text/javascript" src="js/jquery.snippet.min.js"></script>
<script type="text/javascript" src="js/ZeroClipboard.min.js"></script>
<script type="text/javascript" src="js/tidy.js"></script>
<script type="text/javascript" src="js/crawler.js"></script>

</body>
