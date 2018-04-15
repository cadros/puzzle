const Uploader = (function Uploader() {
	"use strict";

	let file; 

	file = {
		loadFile : loadFile,
		readUrl : readUrl,
		uploaded : false,
	};

	return file;



	function loadFile(files) {
		if (!files || files.lingth < 0) {
			return;
		}
		file.uploaded = files[0];
	}


	function readUrl(f) {
		Promise.resolve(file.uploaded)
		.then(function() {
			let imgData = new FileReader();
			imgData.onload = (function(p) {
				return function(e) {
					p.src = e.target.result;
				};
			})(f);
			imgData.readAsDataURL(file.uploaded);
			return f;
		});
	}


})();
export default Uploader;