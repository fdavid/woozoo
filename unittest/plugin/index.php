<?php $compressed = false; ?>
<?php include_once("../env.php"); ?>
<html>
<head>
	<!-- 
	<script type="text/javascript" src="<?php echo $urlFwk; ?>libs/firebug/1.23.js"></script>
	 -->

	<script type="text/javascript" src="<?php echo $urlFwk; ?>libs/prototype/1.6.0.3.js"></script>
	<script type="text/javascript" src="<?php echo $urlFwk; ?>libs/prototype/extends.js"></script>
	<script type="text/javascript" src="<?php echo $urlFwk; ?>libs/rsh/rsh.js"></script>
	
	<?php echo $fwkScript; ?>

	<script id="Cookie" type="text/javascript" src="<?php echo $urlPlugin; ?>cookie-1.0/Cookie.js"></script>

	<script type="text/javascript">
		var initializer = new Initializer(); 
		initializer.init('<?php echo $urlUnitTest; ?>plugin/conf.xml', 
		{
			mvcFile: '<?php echo $urlUnitTest; ?>plugin/module_1/mvc.xml',
			baseUrl: '<?php echo $urlJs; ?>'
		});
		
		PluginManager.getInstance().declarePlugin('RGBColor', 'rgbcolor-1.0/RGBColor.js', 'RGBColor');
		PluginManager.getInstance().declarePlugin('Scriptaculous', 'scriptaculous-js-1.8.1/scriptaculous.js?load=', 'Scriptaculous');
		PluginManager.getInstance().declarePlugin('Effect', 'scriptaculous-js-1.8.1/effects.js', 'Effect');
	</script>
</head>
<body>
	<button id="loadPluginScriptaculous">load Scripaculous</button>
	<button id="loadPluginEffect">load Effect</button>
	<button id="loadPluginScriptaculousEffect">load Effect and Scriptaculous</button>
</body>
</html>