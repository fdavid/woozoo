<?php
class Dynamic {

	private $_mvcFile;
	
	private $_confFiles;
	private $_confFilesId;
	private $_filesToConcate;
	private $_baseUrl;
	private $_compressedName;
	private $_jsExt;
	private $_usePacker;
	private $_useCache;
	
	private $_contents = "";
	private $_md5;
	
	function __construct($mvcFile, $baseUrl, $compressedName, $jsExt, $usePacker, $useCache) {
		$this->_mvcFile = $mvcFile;
		$this->_confFiles = array();
		$this->_confFilesId = array();
		$this->_filesToConcate = array();
		$this->_baseUrl = $baseUrl;
		$this->_jsExt = $jsExt;
		$this->_compressedName = $compressedName;
		$this->_contents = "";
		$this->_usePacker = $usePacker;
		
		$this->_useCache = $useCache;
		$this->_md5 = $this->_getMD5();
	}

	public function run() {
		
		$eTag = '"'.$this->_md5.'"';
		header('Etag: '.$eTag);
		
		if ($this->_useCache == "true" && $this->_existInCache()) {
			if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && $eTag == $_SERVER['HTTP_IF_NONE_MATCH']) {   
				header("Last-Modified: " . gmdate("D, d M Y H:i:s", $this->_getLastModifiedFromCache()) . " GMT");
				header("HTTP/1.0 304 Not Modified");
				header('Content-Length: 0');
				exit();
			} else {
				$this->_contents = $this->_getFromCache();
			}	
			return;
		}
		$this->_readMvcFile();

		$this->_readConfFiles();
		
		$this->_concats();
		
		if ($this->_usePacker == "true") {
			$this->_pack();
		}
		if ($this->_useCache == "true") {
			$this->_writeInCache();
		}
	}
	
	public function out() {
		header("Content-type: application/x-javascript");
		echo $this->_contents;
	}
	
	protected function _getFromCache() {
		return @file_get_contents("cache/".$this->_md5.".cache");
	}
	
	protected function _getLastModifiedFromCache() {
		return @filemtime("cache/".$this->_md5.".cache");
	}
	
	protected function _existInCache() {
		return @file_exists("cache/".$this->_md5.".cache");
	}
	
	protected function _writeInCache() {
		$fileName = $this->_md5.".cache";
		@file_put_contents("cache/".$fileName, $this->_contents);
	}
	
	private function _getMD5() {
		return md5($this->_mvcFile);
	}
	
	private function _pack() {
		$packer = new JavaScriptPacker($this->_contents, 'Normal', true, false);
		$this->_contents = $packer->pack();
	}

	private function _readMvcFile() {
		$reader = new XMLReader();
		$res = $reader->open($this->_mvcFile);
		if (!$res) {
			return false;
		}
		
		$list = array();
		while($reader->read()){
		    if ($reader->nodeType == XMLREADER::ELEMENT && $reader->localName == "item") {
		    	if ($reader->getAttribute('executeAtInit') == 'true') {
		    		$this->_confFiles[] = $this->_getUrl($reader->getAttribute('file'));
		    		$this->_confFilesId[] = $reader->getAttribute('id');
		    	}
		    	$id = $reader->getAttribute('id');
		    	$file = $reader->getAttribute('file');
		    	$executeAtInit = $reader->getAttribute('executeAtInit');
		    	$requireId = $reader->getAttribute('requireId');
		    	$list[] = array('id' => $id, 'file' => $file, 'executeAtInit' => $executeAtInit, 'requireId' => $requireId);
		    }
		} 
		$reader->close();
		$this->createMvcProperties($list);
		return true;
	}
	
	private function createMvcProperties($list) {
		$txt 	 = "\n\rvar MvcProperties = [\n";
		for ($i = 0; $i < count($list); $i++) {
			$txt .= "	{id:'".$list[$i]['id']."', file:'".$list[$i]['file']."', executeAtInit:".$list[$i]['executeAtInit'].", requireId:'".$list[$i]['requireId']."'}";
			if ($i != count($list) - 1) {
				$txt .= ",\n";
			} else {
				$txt .= "\n";
			}
		}
		$txt 	.= "];\n";
		@file_put_contents("temp/MvcProperties.js", $txt);
		$this->_filesToConcate[] = "temp/MvcProperties.js";
		//echo $txt;
	}
	
	private function _readConfFiles() {
		for ($i = 0; $i < count($this->_confFiles); $i++) {
			$this->_readConfFile($this->_confFiles[$i], $this->_confFilesId[$i]);
		}
	}
	
	private function _readConfFile($confFile, $id) {
		
		$reader = new XMLReader();
		$res = $reader->open($confFile);
		if ($res) {
			$reader->read();
			if ($reader->getAttribute('dynamicLoad') == "true") {
				$folder = $reader->getAttribute('folder');
				$version = $reader->getAttribute('version');
				if ($reader->getAttribute('compressed') == "true") {
					$fileToConcate = $this->_getUrl($folder.$this->_compressedName.".".$this->_jsExt);
					$this->_filesToConcate[] = $fileToConcate."?v=".$version;
				} else {
					$fileToConcate = $this->_getUrl($folder.$reader->getAttribute('model').".".$this->_jsExt);
					$this->_filesToConcate[] = $fileToConcate."?v=".$version;
				
					$fileToConcate = $this->_getUrl($folder.$reader->getAttribute('controller').".".$this->_jsExt);
					$this->_filesToConcate[] = $fileToConcate."?v=".$version;
				}
				$this->createConfJsProperties($reader, $id);
			}
		}
		$reader->close();
	}
	
	private function createConfJsProperties($reader, $moduleId) {
		$model = 		$reader->getAttribute('model');
		$controller = 	$reader->getAttribute('controller');
		$view = 		$reader->getAttribute('view');
		$folder = 		$reader->getAttribute('folder');
		$type = 		$reader->getAttribute('type');
		$version = 		$reader->getAttribute('version');
	
		$txt 	 = "\n\rvar ".$moduleId."Properties = {\n";
		$txt 	.= "	model: '".$model."',\n";
		$txt 	.= "	controller: '".$controller."',\n";
		$txt 	.= "	view: '".$view."',\n";
		$txt 	.= "	folder: '".$folder."', \n";
		$txt 	.= "	type: '".$type."', \n";
		
		$binds = array();
		$bindListeners = array();
		$plugins = array();
		
		while($reader->read()){
		    if ($reader->nodeType == XMLREADER::ELEMENT) {
		    	if ($reader->localName == "bind") {
					$id = 			$reader->getAttribute('id');
		    		$attribute = 	$reader->getAttribute('attribute');
		    		$propertie = 	$reader->getAttribute('propertie');
		    		$style = 		$reader->getAttribute('style');
		    		$readOnly = 	$reader->getAttribute('readOnly');
		    		$writeOnly = 	$reader->getAttribute('writeOnly');
		    		$optional = 	$reader->getAttribute('optional');
		    		
		    		if ($optional != "true" && $optional != "false") {
		    			$optional = "false";
		    		}
		    		if ($writeOnly != "true" && $writeOnly != "false") {
		    			$writeOnly = "false";
		    		}
		    		if ($readOnly != "true" && $readOnly != "false") {
		    			$readOnly = "false";
		    		}
		    		$binds[] = array('id' => $id, 'attribute' => $attribute, 'style' => $style, 'propertie' => $propertie, 'readOnly' => $readOnly, 'writeOnly' => $writeOnly, 'optional' => $optional);
		    	} else if ($reader->localName == "bindAsListener") {
		    		$id = 		$reader->getAttribute('id');
		    		$event = 	$reader->getAttribute('event');
		    		$handler = 	$reader->getAttribute('handler');
		    		$optional = $reader->getAttribute('optional');
		    		
		    		if ($optional != "true" && $optional != "false") {
		    			$optional = "false";
		    		}
		    		
		    		$bindListeners[] = array('id' => $id, 'event' => $event, 'handler' => $handler, 'optional' => $optional);
		    	} else if ($reader->localName == "plugin") {
		    		$id = 		$reader->getAttribute('id');
		    		$plugins[] = array('id' => $id);
		    	}
		    }
		} 
		
		$txt 	.= "	bind: 		[\n";
		for ($i = 0; $i < count($binds); $i++) {
			$bind = $binds[$i];
			$txt 	.= "			{id:'".$bind['id']."', ";
			if ($bind['attribute'] != "") {
				$txt 	.= "attribute:'".$bind['attribute']."'";
			} else {
				$txt 	.= ", propertie:'".$bind['propertie']."'";
			}
			if ($bind['readOnly'] == "true")
				$txt 	.= ", readOnly:".$bind['readOnly'];
			if ($bind['writeOnly'] == "true")
				$txt 	.= ", writeOnly:".$bind['writeOnly'];
			if ($bind['optional'] == "true")
				$txt 	.= ", optional:".$bind['optional'];
			$txt 	.= "}";
			if ($i != count($binds)-1) {
				$txt 	.= ",\n";
			} else {
				$txt 	.= "\n";
			}
		}
		$txt 	.= "			],\n";
		
		$txt 	.= "	bindListener: 	[\n";
		for ($i = 0; $i < count($bindListeners); $i++) {
			$bindListener = $bindListeners[$i];
			$txt 	.= "			{id:'".$bindListener['id']."', event:'".$bindListener['event']."', handler:'".$bindListener['handler']."'";
			if ($bindListener['optional'] == "true")
				$txt 	.= ", optional:".$bindListener['optional'];
			$txt 	.= "}";
			if ($i != count($bindListeners)-1) {
				$txt 	.= ",\n";
			} else {
				$txt 	.= "\n";
			}
		}
		$txt 	.= "			],\n";
		
			
		$txt 	.= "	plugin: 	[\n";
	
		$txt 	.= "			]\n";
		
		
		
		
		$txt 	.= "};\n\r";
		
		@file_put_contents("temp/".$moduleId."Properties.js", $txt);
		$this->_filesToConcate[] = "temp/".$moduleId."Properties.js";
	}
	
	private function _concats() {
		for ($i = 0; $i < count($this->_filesToConcate); $i++) {
			if ($content = @file_get_contents($this->_filesToConcate[$i])) {
				$this->_contents .= $content."\n\r";
			}
		}
	}
	
	private function _getUrl($url) {
		return $this->_baseUrl.$url;
	}

}
?>