"use strict"; /* eslint-env browser */ /* global */ /* eslint no-warning-comments: [1, { "terms": ["todo", "fix", "help"], "location": "anywhere" }] */
const debug = true;

// Navbar Burger
$(document).ready(function () {
	if (debug) {
		$("#makeScheduleScreen").removeClass("is-hidden");
	}

	// $(".navbar-burger").click(function () {
	// 	$(".navbar-burger").toggleClass("is-active");
	// 	$(".navbar-menu").toggleClass("is-active");
	// });
	
	$("#addCourseBtn").click(() => {
		$(".makeSchedFormOneCourseGroup:last").clone().insertAfter(".makeSchedFormOneCourseGroup:last");
	});
});

var socket = io.connect();
socket.on("connectionReceived", function connectionReceived () {
	// 
});
