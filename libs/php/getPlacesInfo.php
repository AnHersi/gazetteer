<?php 

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$ch = curl_init();

$url = "https://api.opentripmap.com/0.1/en/places/bbox?lon_min=" . $_REQUEST['lon_min'] . "&lon_max=" . $_REQUEST['lon_max'] . "&lat_min=" . $_REQUEST['lat_min'] . "&lat_max=" . $_REQUEST['lat_max'] . "&kinds=beaches,museums,burial_places,industrial_facilities&format=json&apikey=5ae2e3f221c38a28845f05b64d076157b0ab537fa8d19462878ddb03";

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