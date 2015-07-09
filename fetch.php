<?php
/* gets the data from a URL */
function get_data($url)
{
	$ch = curl_init();
	$timeout = 5;
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
	$data = curl_exec($ch);
	curl_close($ch);
	return $data;
}
	$url = trim($_GET['url']);
	//$data = file_get_contents($url);
	$data = get_data($url);
	if ($data === FALSE)
	{
		echo json_encode(array("result" => $data, "url" => $url));
		return;
	}
	echo json_encode(array("result" => $data));
?>
