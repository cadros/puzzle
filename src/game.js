import Uploader from './uploader';
import ImageFile from './image';

const canvasPuzzle = (function canvasPuzzle(grid) {
	"use strict";

	let dragging = false;
	let game = {}, pieces = [];
	let context, board, image = new Image(), imgButt, imgPreview, dropBox, startButt, mouseX, mouseY, dragX, dragY, selectedPiece, levelBox, gameLevel, gameLevelUp, gameLevelDown, winBoard, gameWIN = 0, $doc = document;

	board = $doc.getElementById("canvasPuzzle");
	context = board.getContext("2d");
	imgButt = $doc.getElementById("customImage");
	startButt = $doc.getElementById("shuffle");
	levelBox = $doc.getElementById("gameLevel");
	gameLevelUp = $doc.getElementById("gameLevelUp");
	gameLevelDown = $doc.getElementById("gameLevelDown");
	dropBox = $doc.getElementById("dropBox");
	imgPreview = $doc.getElementById("imgPreview");


	Promise.all([
		check()
	])
	.then(setImgEvents)
	.then(loadImg)
	.then(setLevel)
	.then(startGame)
	.catch(function(er) {
		throw new Error(er.stack || er);
	});


	game.state = gameWIN;
	game.grid = 9;
	game.level = gameLevel || 0;
	game.img = "puzzle.jpg";
	game.uploadButton = imgButt;
	game.preview = imgPreview;
	game.canvaEvent = board;

	return game;


	function check() {
		if (!context) {
			let nogame = $doc.createElement("div"), errorMess;
			errorMess = $doc.createTextNode("No games in your browser");
			nogame.className = "nogame";
			nogame.appendChild = errorMess;
			return;
		}
	}

	function getLevel() {
		return parseInt(window.sessionStorage.getItem("level")) || 0;
	}

	function setLevel(level) {
		if (level === undefined) {
			game.level = getLevel();
			levelBox.innerHTML = game.level;

			if (game.level == 10) {
				disableButt(gameLevelUp);
			}
			if (game.level == 0) {
				disableButt(gameLevelDown);
			}
			return;
		}

		game.level = parseInt(level);
		window.sessionStorage.setItem("level", game.level);
		levelBox.innerHTML = game.level;	
	}

	function updateLevel(e) {
		let set = getLevel();

		if (e.target.id == "gameLevelUp") {
			set += 5;
			if (set == 10) {
				disableButt(e.target);
			}
			if (set > 10) {
				return;
			}
			game.level = set;
			levelBox.innerHTML = game.level;
			enableButt(gameLevelDown);

		} else {
			set -= 5;
			if (set == 0) {
				disableButt(e.target);
			}
			if (set < 0) {
				return;
			}			
			game.level = set;
			levelBox.innerHTML = game.level;
			enableButt(gameLevelUp);
		}

		setLevel(game.level);
	}


	function startGame() {
		setEvents("mousedown", onPress);
		setEvents("mouseup", onRelease);
		setEvents("mousemove", onMove);

		setEvents("click", startOver, startButt);
		setEvents("click", updateLevel, gameLevelUp);
		setEvents("click", updateLevel, gameLevelDown);
	}


	/**
	 * Get Image
	 */
	function setImgEvents() {
		setEvents("change", onImgSelect, game.uploadButton);
		setEvents("drop", onImgDrop, dropBox);
		setEvents('dragover dragenter drop', cancelDefault, dropBox);
		setEvents("dragenter", highlight, dropBox);
		setEvents("mouseleave drop", unHighlight, dropBox);
	}


	function loadImg() {
		let boardDisplaySize;
		
		image.onload = function() {
			game.piece = ImageFile.getImgGrid(image, game.grid);
			board.width = image.width;
			board.height = image.height;
			clearBoard();
			paintBoard();

			boardDisplaySize = board.getBoundingClientRect();
			board.displayWidth = boardDisplaySize.width;
			board.displayHeight = boardDisplaySize.height;

			game.piece.displayWidth = board.displayWidth / game.grid;
			game.piece.displayHeight = board.displayHeight / game.grid;
		};

		if (!Uploader.uploaded) {
			image.src = game.img;
			ImageFile.render(game.img, game.preview);			
		}
	}


	function onImgSelect(e) {
		customImg(e.target.files);
	}

	function onImgDrop(e) {
		let data = e.dataTransfer;
		customImg(data.files);
	}

	function customImg(file) {
		Uploader.loadFile(file);
		Uploader.readUrl(image); // reading file for image.src
		let previewCopy = new Image();
		Uploader.readUrl(previewCopy);
		ImageFile.renderAsUrl(previewCopy, game.preview);

		loadImg();
	}

	function paintBoard() {
		let square;
		clearBoard();

		for (let x = 0; x < game.grid; x++) {
			for (let y = 0; y < game.grid; y++) {
				square = Square(
					x*game.piece.w,
					y*game.piece.h,
					x*game.piece.w + game.piece.w, // w
					y*game.piece.h + game.piece.h // h
				);
				pieces.push(square);
			}
		}
		winBoard = pieces.slice(0); // copy of initial state to be checked against final
		shuffle(pieces, game.level);
		drawImg();
	}

	
	/**
	 * Geometry
	 */
	function Square(l,t,r,b) {
		return {
			left:l,
			right:r,
			top:t,
			bottom:b,
			w: r-l,
			h: b-t
		};
	}

	function drawImg() {
		let shape;
		for (let x = 0; x < game.grid; x++) {
			for (let y = 0; y < game.grid; y++) {
				shape = pieces[x*game.grid+y]; // [0... end-1]

				context.drawImage(image, shape.left, shape.top, shape.w, shape.h, /*dist coord*/ x*game.piece.w, y*game.piece.h, game.piece.w, game.piece.h);
				context.strokeStyle = "#fff";
				context.strokeRect(x*game.piece.w, y*game.piece.h, game.piece.w, game.piece.h);
			}
		}
	}



	/**
	 * Actions
	 */
	function shuffle(pieces, level) {
		level = level < 10 ? level+1 :  pieces.length; // level 10 shuffles whole board

		let original, replace, countDown = level || pieces.length;

		while(0 !== countDown) {
			replace = Math.floor(Math.random()*pieces.length);
			countDown -= 1;

			swap(pieces[countDown], pieces[replace]);
		}
	}

	function swap(selected, target) {
		let a,b,swap = selected;
		a = pieces.indexOf(selected);
		b = pieces.indexOf(target);
		pieces[a] = target;
		pieces[b] = swap;
	}

	function animateBoard() {
		board.classList.add("fly");
	}

	function champAlert(holder) {
		let div = $doc.createElement("div");
		let message = $doc.createTextNode("WIN!");
		div.className = "winAlert";
		div.appendChild(message);
		holder.appendChild(div);
	}

	function removeChampAlert() {
		let alert = $doc.getElementsByClassName("winAlert");
		if (alert.length > 0) {
			alert[0].remove();
		}
	}

	function startOver() {
		removeChampAlert();
		paintBoard();
	}

	function clearBoard() {
		pieces.splice(pieces, pieces.length);
	}

	function dimPreview() {
		game.preview.classList.add("dim");
	}

	function highlight(e) {
		e = e.target || e;
		e.classList.add("highlight");
	}

	function unHighlight(e) {
		e = e.target || e;
		e.classList.remove("highlight");
	}



	/**
	 * Board events
	 */
	function onPress(e) {
		dragging = true;
		let i;
		if (dragging) {
			mouseX = e.offsetX;
			mouseY = e.offsetY;
			dragX = Math.floor(mouseX / game.piece.displayWidth);  
			dragY = Math.floor(mouseY / game.piece.displayHeight);

			i = dragX * game.grid + dragY;
			selectedPiece = pieces[i];
		}
	}

	function onRelease(e) {
		let i;
		if (selectedPiece) {
			mouseX = e.offsetX;  
			mouseY = e.offsetY; 
			dragX = Math.floor(mouseX / game.piece.displayWidth);  
			dragY = Math.floor(mouseY / game.piece.displayHeight); 

			i = dragX * game.grid + dragY;            
			let target = pieces[i];

			swap(selectedPiece, target);
			onWIN();
		} 
		drawImg();
		dragging = false;
	}

	function onMove() {
		dragging = false;
	}

	function onWIN() {
		if (sameArray(pieces,winBoard)) {
			animateBoard();
			champAlert(board.parentElement);
			dimPreview();
		}
	}
 

	/**
	 * Utils
	 */
	function setEvents(events,handler,el) {
		let target = el || game.canvaEvent;
		events = events.split(" ");
		for (var i=0; i<events.length; i++) {			
			target.addEventListener(events[i],handler,false);
		}
	}

	function removeEvents(events,handler,el) {
		let target = el || game.canvaEvent;
		events = events.split(" ");
		for (var i=0; i<events.length; i++) {
			target.removeEventListener(events[i],handler,false);
		}
	}

	function cancelDefault(e) {
		e.preventDefault();
		e.stopPropagation();
	}

	function sameArray(a, b) {
		if ((a && !b) || (!a && b) || (!a && !b) || (a.length !== b.length)) {
			return false;
		}

		let same = a.some(function (element, index) { 
			return element !== b[index];
		});
		return !same;
	}

	function disableButt(butt) {
		butt.style = "opacity:.6;cursor:auto";
	}

	function enableButt(butt) {
		butt.style = "opacity:1;cursor:pointer";
	}

})();