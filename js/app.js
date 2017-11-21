// define playing cards
var cards = ["diamond","paper-plane-o","anchor","bolt","leaf","bicycle","bomb","cube"];

// define global variables for counting moves, rating, startDate, if card is open, whether second card can be opened
let openedCard,	blocked, moves, found, clickedFirst, rating, startDate, time;

// create empty array
var cardsArray = [];
// duplicate cards to cardsArray
for (var i=0; i<cards.length; ++i) {
	cardsArray.push(cards[i]);
	cardsArray.push(cards[i]);
}

 // Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
   var currentIndex = array.length, temporaryValue, randomIndex;

   while (currentIndex !== 0) {
       randomIndex = Math.floor(Math.random() * currentIndex);
       currentIndex -= 1;
       temporaryValue = array[currentIndex];
       array[currentIndex] = array[randomIndex];
       array[randomIndex] = temporaryValue;
   }
   return array;
}

// initializing game, resetting values, initializing listener function
function initializeGame() {
  // shuffle array calling function shuffle()
  cardsArray = shuffle(cardsArray);
	resetVariables();
	clearTimer();
	clearRating();
  // reset deck HTML container
  $("ul.deck").empty();
  // iterate trough all shuffled cards array
	for (let i=0; i<cardsArray.length; ++i) {
		// create list element, add click listener to it and append it to deck HTML UL element
		$('<li class="card"><i class="fa fa-'+cardsArray[i]+'"></i></li>').on("click",function() {
			// check whether click shoud not be blocked (timer is still running)
			if (!blocked) {
				// start timer with first click on the deck, prevent running again after first click
				if (!clickedFirst){
					renderTimer();
				}
				// call function with 2 parameters (jQuery element of clicked LI and index of clicked item in array)
				cardClicked($(this),i);
			}
		}).appendTo($("ul.deck"));
	}
}

// handler for card click. Parameters => 1st: jQuery element of clicked LI ... 2nd: index of clicked item in array)
function cardClicked(obj,i) {
	//
	clickedFirst = true
	// add 2 classes to clicked LI element (open and show)
	obj.addClass("open").addClass("show");
	// detect if this is 1st or 2nd click
	if (openedCard) {
		//set blocker to true
		blocked = true;
		// compare 1st opened card with currently opened card
		if (cardsArray[openedCard.index] === cardsArray[i]) {
			// blocking another attempt to click the same card
			if (openedCard.index === i) {
				blocked = false;
				return false;
			};
			// turning off listener on click
			openedCard.jqObject.off("click");
			obj.off("click");
			// temporary changing color of cards to visually indicate match for 0.5s
			setTimeout(function() {
				openedCard.jqObject.removeClass("show").addClass("good");
				obj.removeClass("show").addClass("good");
			},500);
			// set timeout for 1 second after we hide 1st opened card and currently opened card by removing 2 classes from LI element (open and show)
			setTimeout(function() {
				openedCard.jqObject.removeClass("good").addClass("match");
				obj.removeClass("good").addClass("match");
				// case we have found matching double
				// reset blocker and opened card
				openedCard = null;
				blocked = false;
			},1000);
			// add 1 to the found variable and render HTML
			found = found + 1;
      renderFound();
		} else {
			// case we haven't found match
			// set timeout for 0.5 to indicate cards do not match
			setTimeout(function() {
				openedCard.jqObject.removeClass("show").addClass("nomatch");
				obj.removeClass("show").addClass("nomatch");
			},500);
			// set timeout for 1 second after we hide 1st opened card and currently opened card by removing 2 classes from LI element (open and show)
			setTimeout(function() {
				openedCard.jqObject.removeClass("open").removeClass("nomatch");
				obj.removeClass("open").removeClass("nomatch");
				// reset blocker and opened card variables due to no match
				openedCard = null;
				blocked = false;
			},1000);
		}
		// add 1 to the moves and render HTML
		moves = moves + 1;
		// renderTimer();
		renderMoves();
		//render rating
		renderRating();
	} else {
		// we have uncovered 1st card
		// set object with received function parameters => jqObject: Query element of clicked LI ... index: index of clicked item in array
		openedCard = {
			jqObject: obj,
			index: i
		};
		// set blocked to false
		blocked = false;
	}
}

function resetVariables() {
	// resetting all values, clearing up the battlefield
	openedCard = null;
	blocked = false;
	moves = 0;
	found = 0;
	startDate = new Date();
	clickedFirst = false;
}

function renderMoves() {
	// set number of moves text in HTML
	$("span.moves").text(moves);
}

function renderFound() {
	// set number of moves text in HTML
	$("span.found").text(found);
	if (found === cards.length) {
		setTimeout(function() {
			renderModal()
		},1000);
	}
}

function renderModal() {
	// stopping time, creating a modal with results and restart button
	clearInterval(time);
	$("ul.stars").clone().appendTo($("div.starlets"));
	$("div.timer").text($(".time").text().slice(5));
	$("div.moves").text(moves);
	$(".modal").show();
}

function renderRating() {
	// evaluate moves and set number of stars
	if (moves <= 13) {
		num = 3;
	} else if (moves > 13 && moves <= 18) {
		num = 2;
	} else {
		num = 1;
	}
	// reset stars HTML container
	$("ul.stars").empty();
	// fill stars container with $found number of stars
	for (var i=0; i<num; ++i) {
		$('<li><i class="fa fa-star"></i></li>').appendTo($("ul.stars"));
	}
}

// clearing a rating
function clearRating() {
	var num = 3;
	$("ul.stars").empty();
	for (var i=0; i<num; ++i) {
		$('<li><i class="fa fa-star"></i></li>').appendTo($("ul.stars"));
	}
}

// game timer function
function renderTimer() {
	let startTime = new Date().getTime();
	// updating timer
	time = setInterval(function() {
		current = new Date().getTime();
		timer = current - startTime;
		// defining correct format of seconds and minutes
		let minutes = Math.floor((timer % (1000 * 60 * 60)) / (1000 * 60));
		let seconds = Math.floor((timer % (1000 * 60)) / 1000);
		// formatting seconds to 0X to keep time format correct
		if (seconds < 10) {
			seconds = "0" + seconds;
		}
		// adding time to HTML
		$(".time").text("Time: "+minutes+":"+seconds);
  }, 1000);
}

// clearing a timer
function clearTimer() {
	clearInterval(time);
	timer = "0:00";
	$(".time").text("Time: "+timer);
}


//getting the document ready, cleanup
$(document).ready(function() {
 	initializeGame();
  // initializing whole site if restart button is clicked
 	$("div.restart").on("click", function() {
 		cardsArray = shuffle(cardsArray);
 		// render HTML
    initializeGame();
		clearTimer();
 		renderMoves();
 		renderFound();
		clearRating();
 	})
	// restarting the game via modal
	$("#init").on("click", function() {
		$(".modal").hide();
		cardsArray = shuffle(cardsArray);
		// render HTML
		initializeGame();
		clearTimer();
		renderMoves();
		renderFound();
		clearRating();
	})
	$("#end").on("click", function() {
		$(".modal").hide();
	})
});

initializeGame();
