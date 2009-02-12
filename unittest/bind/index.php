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
		initializer.init('<?php echo $urlUnitTest; ?>bind/conf.xml', 
		{
			mvcFile: '<?php echo $urlUnitTest; ?>bind/module_1/mvc.xml',
			baseUrl: '<?php echo $urlJs; ?>'
		});
	</script>
</head>
<body>
	<button id="button">Click here to change text input above values to 42</button><br />
	Input 1 : <input type="text" value="" id="input1"/> <br>
	Input 2 : <input type="text" value="" id="input2"/> <br>
	<br>
	Typing here should change both the input 1 and 2 :
	<br>
	<input type="text" value="" id="inputRef" />
</body>
</html>