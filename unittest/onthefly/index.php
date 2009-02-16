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

	<script type="text/javascript">
		var initializer = new Initializer(); 
		initializer.init('<?php echo $urlUnitTest; ?>onthefly/conf.xml', 
		{
			mvcFile: '<?php echo $urlUnitTest; ?>onthefly/mvc.xml',
			baseUrl: '<?php echo $urlJs; ?>'
		});
		
		
	</script>
</head>
<body>
	<button id="buttonLoad">Click here to load the module</button><br />
	<button id="buttonUnLoad">Click here to unload the module that will reload</button>
	<button id="buttonUnLoad2">Click here to unload the module that will normally not reload</button>
	
	<div id="module2Container"></div>
	
</body>
</html>