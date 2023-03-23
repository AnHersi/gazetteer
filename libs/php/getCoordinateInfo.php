<?php 

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$ch = curl_init();


$url = 'https://api.opencagedata.com/geocode/v1/json?q=' . $_REQUEST['lat'] . "%2C%20" . $_REQUEST['lng'] . "&key=f100cd52d94845d1b601e694f4aca8f0&language=en&pretty=1";

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$result = curl_exec($ch);

curl_close($ch);

$decode = json_decode($result, true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['data'] = $decode['results'];

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);

?>