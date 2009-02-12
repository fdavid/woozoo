<?php
$urlFwk = "http://localhost/js/WZFwk_multiton/";
$urlUnitTest = "http://localhost/js/unittest/";
$urlJs = "http://localhost/js/";

if ($compressed == true) {
	$fwkScript = '<script type="text/javascript" src="'.$urlFwk.'compress/compress.js"></script>';
} else {
	$fwkScript = '<script type="text/javascript" src="'.$urlFwk.'trace/Trace.js"></script>

		<script type="text/javascript" src="'.$urlFwk.'utils/ErrorUtil.js"></script>
		<script type="text/javascript" src="'.$urlFwk.'utils/BooleanUtil.js"></script>
		<script type="text/javascript" src="'.$urlFwk.'utils/ParsingUtil.js"></script>
		<script type="text/javascript" src="'.$urlFwk.'utils/BindingUtil.js"></script>
		<script type="text/javascript" src="'.$urlFwk.'utils/FunctionUtil.js"></script>
		<script type="text/javascript" src="'.$urlFwk.'utils/SingletonUtil.js"></script>
		<script type="text/javascript" src="'.$urlFwk.'utils/MultitonUtil.js"></script>
		<script type="text/javascript" src="'.$urlFwk.'utils/UrlUtil.js"></script>
		<script type="text/javascript" src="'.$urlFwk.'utils/ItemUtil.js"></script>
		
		<script type="text/javascript" src="'.$urlFwk.'manager/ModuleManager.js"></script>
		<script type="text/javascript" src="'.$urlFwk.'manager/ConfManager.js"></script>
		<script type="text/javascript" src="'.$urlFwk.'manager/LangManager.js"></script>
		<script type="text/javascript" src="'.$urlFwk.'manager/HelperLoaderManager.js"></script>
		<script type="text/javascript" src="'.$urlFwk.'manager/UrlManager.js"></script>
		
		<script type="text/javascript" src="'.$urlFwk.'controller/Controller.js"></script>
		<script type="text/javascript" src="'.$urlFwk.'initializer/Initializer.js"></script>
		
		<script type="text/javascript" src="'.$urlFwk.'model/Model.js"></script>
		
		<script type="text/javascript" src="'.$urlFwk.'helper/Helper.js"></script>
		<script type="text/javascript" src="'.$urlFwk.'helper/ModelHelper.js"></script>
		<script type="text/javascript" src="'.$urlFwk.'helper/ControllerHelper.js"></script>
		
		<script type="text/javascript" src="'.$urlFwk.'trace/FwkTrace.js"></script>
		
		<script type="text/javascript" src="'.$urlFwk.'object/ScriptLoader.js"></script>
		<script type="text/javascript" src="'.$urlFwk.'manager/PluginManager.js"></script>';
}
?>