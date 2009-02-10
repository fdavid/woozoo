<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title>WZFwk compression tool</title>
	<link href="../../trace/debug.css" rel="stylesheet" type="text/css" />
</head>
<body>
	<h1>WZFwk compression tool</h1>
	<div id="debug">
		<h2>Compressing the framework</h2>
		1. Execute this file <a href="WZFwkStep1.php">here</a><br>
		2. Lanch cmd<br><br>
		3. Execute the custom_rhino_charset<br>
		<code>
			cmd> cd C:\Program Files\EasyPHP\www\navx_projects_4\Dynamite\js\WZFwk_multiton\libs\shrinksafe (change only this line)<br>
			cmd> java -jar custom_rhino_charset.jar -c ../../compress/WZFwk.js > ../../compress/WZFwk.cp.js 2>&1
		</code>
		<br>
		4. Execute this file <a href="WZFwkStep3.php">here</a>
		<br>
		<br>
		<br>
		<h2>Compressing your own module</h2>
	</div>
</body>
</html>