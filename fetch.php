<?php
    $url = $_GET['url'];
    $data = file_get_contents(($url));
    if ($data === FALSE)
    {
        echo json_encode(array("result" => FALSE));
        return;
    }
    echo json_encode(array("result" => $data));
?>
