const ImageFile = (function img() {
	"use strict";

	let publicData; 

	publicData = {
		render : render,
		renderAsUrl: renderAsUrl,
		getImgGrid : getImgGrid
	};

	return publicData;



	function getImgGrid(img, grid) {
		return {
			w: img.width / grid,
			h: img.height / grid
		};
	}

	function render(file, imgHolder) {
		Promise.resolve(file)
		.then(function() {
			let img = document.createElement("img");
			img.src = file;
			clean(imgHolder);
			imgHolder.appendChild(img);
		});
	}

	function renderAsUrl(imgData, imgHolder) {
		Promise.resolve(imgData)
		.then(function(r) {
			clean(imgHolder);
			imgHolder.appendChild(r);
		});
	}

	function clean(div) {
		div.innerHTML = "";
	}

})();
export default ImageFile;