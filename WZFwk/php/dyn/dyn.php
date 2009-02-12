<?php
include('Dynamic.php');
include('../compression/class.JavaScriptPacker.php');

//$t1 = microtime(true);
	
if (isset($_GET['mvc'], $_GET['baseUrl'], $_GET['compressedName'], $_GET['jsExt'], $_GET['usePacker'], $_GET['useCache'])) {

	$dyn = new Dynamic($_GET['mvc'], $_GET['baseUrl'], $_GET['compressedName'], $_GET['jsExt'], $_GET['usePacker'], $_GET['useCache']);
	$dyn->run();
	$dyn->out();
	
}

//$t2 = microtime(true);
//$time = sprintf('%.4f', ($t2 - $t1) );
//echo ' in ', $time, ' s.', "\n";
?>