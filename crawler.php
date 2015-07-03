<?php
	$url = $_GET['url'];
	$method = $_GET['method'];
	//~ $method = "s2twp";
	//~ $url = "http://mp.weixin.qq.com/s?__biz=MzA5ODA1OTgyNw%3D%3D&mid=209420687&idx=2&sn=b809aafdf0e1af88fc94de666f1af495&scene=4#rd";
	$programPath = dirname(__FILE__)."/backend/Wonder4Parser.py";
	$program = $programPath." ".escapeshellarg($url)." ".escapeshellarg($method);;
	exec($program, $output, $retcode);

	$title = trim($output[0]);
	$date = trim($output[1]);
	$content = implode("\n", array_slice($output,2));

	echo json_encode(array("retcode" => $retcode, "title" => $title, "date" => $date, "content" => $content));
?>
