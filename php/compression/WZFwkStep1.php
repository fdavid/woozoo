<?php
$mainFolder = "../../";

// Dont change bellow


$i=0;
$toFile = "compress/WZFwk.js";
$jsFileList = array();

// utils first

$jsFileList[$i++]['name'] = "trace/Trace.js";
$jsFileList[$i++]['name'] = "utils/ErrorUtil.js";
$jsFileList[$i++]['name'] = "utils/BooleanUtil.js";
$jsFileList[$i++]['name'] = "utils/ParsingUtil.js";
$jsFileList[$i++]['name'] = "utils/BindingUtil.js";
$jsFileList[$i++]['name'] = "utils/FunctionUtil.js";
$jsFileList[$i++]['name'] = "utils/SingletonUtil.js";
$jsFileList[$i++]['name'] = "utils/MultitonUtil.js";
$jsFileList[$i++]['name'] = "utils/UrlUtil.js";
$jsFileList[$i++]['name'] = "utils/ItemUtil.js";

$jsFileList[$i++]['name'] = "manager/ModuleManager.js";

$jsFileList[$i++]['name'] = "manager/ConfManager.js";
$jsFileList[$i++]['name'] = "manager/LangManager.js";
$jsFileList[$i++]['name'] = "manager/HelperLoaderManager.js";
$jsFileList[$i++]['name'] = "manager/UrlManager.js";

$jsFileList[$i++]['name'] = "controller/Controller.js";

$jsFileList[$i++]['name'] = "initializer/Initializer.js";

$jsFileList[$i++]['name'] = "model/Model.js";

$jsFileList[$i++]['name'] = "helper/Helper.js";
$jsFileList[$i++]['name'] = "helper/ControllerHelper.js";
$jsFileList[$i++]['name'] = "helper/ModelHelper.js";

$jsFileList[$i++]['name'] = "trace/FwkTrace.js";

$jsFileList[$i++]['name'] = "object/ScriptLoader.js";

$jsFileList[$i++]['name'] = "manager/PluginManager.js";

header('Content-type: text/plain');

$removeFwkTrace = false;

$result = "";
for ($i = 0; $i < sizeof($jsFileList); $i++) {
	if ($res = file_get_contents($mainFolder.$jsFileList[$i]['name'])) {
		
		$lines = explode("\n", $res);
		$isInitialize = false;
		$isFwkTrace = false;
		$properties = array();
		$methods = array();
		$linesToRemove = array();
		
		for ($j = 0; $j < count($lines); $j++) {
			// detecting methods starting by _
			if (eregi("_([a-z0-9 ]+)[ ]*:[ ]*function[ ]*\(", $lines[$j], $results)) {
				$methods[] = trim("_".$results[1]);
			}
			// detecting constructor
			if (eregi("initialize[ ]*:[ ]*function[ ]*\(", $lines[$j])) {
				$isInitialize = true;
			}
			// detecting end of constructor
			if ($isInitialize && eregi("},", $lines[$j])) {
				$isInitialize = false;
			}
			// detecting properties in constructor
			if ($isInitialize && eregi("([_]+)([a-z0-9 ]+)[ ]*=", $lines[$j], $results)) {
				$properties[] = trim($results[1].$results[2]);
			}
			
			
			if ($removeFwkTrace && eregi("^[ \t]*FwkTrace.write", $lines[$j], $results)) {
				$linesToRemove[] = $j;
			}
			
			// //== IF (NO_FWK_TRACE) ==//
			if ($removeFwkTrace && eregi("//== IF \(NO_FWK_TRACE\) ==//", $lines[$j], $results)) {
				$isFwkTrace = true;
			}
			if ($removeFwkTrace && $isFwkTrace && eregi("//== ENDIF \(NO_FWK_TRACE\) ==//", $lines[$j], $results)) {
				$linesToRemove[] = $j;
				$isFwkTrace = false;
			}
			if ($removeFwkTrace && $isFwkTrace) {
				$linesToRemove[] = $j;
			}
			
		}
		
		if (count($linesToRemove) > 0) {
			$reverseLines = array();
			for ($j = 0; $j < count($lines) ; $j++) {
				$bool = false;
				for ($k = count($linesToRemove) - 1; $k >= 0; $k--) {
					if ($j == $linesToRemove[$k]) {
						$bool = true;
						break;
					}
				}
				if ($bool == false) {
					$reverseLines[] = $lines[$j];
				}
			}
			$res = "";
			for ($j = 0; $j < count($reverseLines) ; $j++) {
				$res .=  $reverseLines[$j]."\n";
			}
		}
		
		if (count($methods) > 0) {
			usort($methods, "Ascii_Sort"); 
			for ($j = 0; $j < count($methods); $j++) {
				$res = str_replace($methods[$j], 'W'.$j."", $res);
			}
		}
		if (count($properties) > 0) {
			usort($properties, "Ascii_Sort"); 
			for ($j = 0; $j < count($properties); $j++) {
				$res = str_replace(array("this.".$properties[$j], "This.".$properties[$j]), array("this.Z".$j, "This.Z".$j), $res);
			}
		}
		$result .= $res."\n\n";
	}
}

function Ascii_Sort($val_1, $val_2)
{
	$retVal = 0;
	$firstVal = strlen($val_1);
	$secondVal = strlen($val_2);
	
	if($firstVal > $secondVal)
	{
		$retVal = -1;
	}
	else if($firstVal < $secondVal)
	{
		$retVal = 1;
	}
	return $retVal;
} 


echo $result; 
file_put_contents($mainFolder.$toFile, $result);
?>