<?php 

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$ch = curl_init();

$url = "https://api.openweathermap.org/data/2.5/weather?lat=" . $_REQUEST['lat'] . "&lon=" . $_REQUEST['lng'] . "&appid=dd8bf318c366bffd33dd749a42a0a937";

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$result = curl_exec($ch);

curl_close($ch);

$decode = json_decode($result, true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['data'] = $decode;

header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);

?>