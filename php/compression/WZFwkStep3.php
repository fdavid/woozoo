<?php
// adapt these 2 paths to your files.
$src = '../../compress/WZFwk.cp.js';
$out = '../../compress/compress.js';


require 'class.JavaScriptPacker.php';
if (file_exists($src)) {
	//$script = file_get_contents($src);
	$script = file_get_contents($src);
	$copyright = file_get_contents("copyright.txt");
	
	//$script = str_replace(array('_184', '_185'), array('$super', '$super'), $script);
	
	//var ControllerHelper=Class.create(Helper,{initialize:function(_184){
	$lines = explode("\n", $script);
	
	for ($i = 0; $i < count($lines); $i++) {
		if (eregi("var ControllerHelper=Class.create\(Helper,{initialize:function\(([_0-9a-z]+)\){", $lines[$i], $result)) {
			$script = str_replace($result[1], '$super', $script);
		}
		if (eregi("var ModelHelper=Class.create\(Helper,{initialize:function\(([_0-9a-z]+)\){", $lines[$i], $result)) {
			$script = str_replace($result[1], '$super', $script);
			break;
		}
	}
	
	
	$t1 = microtime(true);
	
	$packer = new JavaScriptPacker($script, 'Normal', true, false);
	$packed = $packer->pack();
	
	$t2 = microtime(true);
	$time = sprintf('%.4f', ($t2 - $t1) );
	echo 'script ', $src, ' packed in ' , $out, ', in ', $time, ' s.', "\n";
	
	file_put_contents($out, $copyright."\n\r".$packed);
	@unlink("../../compress/WZFwk.js");
	@unlink("../../compress/WZFwk.cp.js");
}
?>