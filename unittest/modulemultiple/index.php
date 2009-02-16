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
		initializer.init('<?php echo $urlUnitTest; ?>modulemultiple/conf.xml', 
		{
			mvcFile: '<?php echo $urlUnitTest; ?>modulemultiple/mvc.xml',
			baseUrl: '<?php echo $urlJs; ?>',
			useUrl: true
		});
	</script>
</head>
<body>
	<button id="buttonAdd">Click here to add a new button</button>
	<br><br>
	<div id="buttonsContainer">
		<button id="button_1">Button 1</button>
		<button id="button_2">Button 2</button>
		<button id="button_3">Button 3</button>
		<button id="button_4">Button 4</button>
		<button id="button_5">Button 5</button>
		<button id="button_6">Button 6</button>
	</div>
</body>
</html>