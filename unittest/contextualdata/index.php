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
		initializer.init('<?php echo $urlUnitTest; ?>contextualdata/conf.xml', 
		{
			mvcFile: '<?php echo $urlUnitTest; ?>contextualdata/mvc.xml',
			baseUrl: '<?php echo $urlJs; ?>'
		});
		
		
	</script>
</head>
<body>
	<button id="buttonExchange1">Click here to exchange data</button><br />

</body>
</html>