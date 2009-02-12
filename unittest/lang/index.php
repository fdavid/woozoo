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
		initializer.init('<?php echo $urlUnitTest; ?>lang/conf.xml', 
		{
			mvcFile: '<?php echo $urlUnitTest; ?>lang/module_1/mvc.xml',
			baseUrl: '<?php echo $urlJs; ?>',
			useLang: true
		});
		
		LangManager.getInstance().add("MY_KEY", "value (en_EN)", "en_EN");
		LangManager.getInstance().add("MY_KEY", "value (fr_FR)", "fr_FR");

	</script>
</head>
<body>
	<button id="button">Click here to change langage to english</button><br />
	div1 : <div id="div1">sdsdsd</div> <br>
	input1 : <input type="text" id="input1" value=""/> <br>
	
	<br>
	<br>
	Bind to static value :<br>
	div2 : <div id="div2">sdsdsd</div> <br>
	input2 : <input type="text" id="input2" value=""/> <br>
</body>
</html>