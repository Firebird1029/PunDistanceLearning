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
	
	// Start Screen
	$("#showMakeScheduleScreen").click(() => {
		$("#makeScheduleScreen").removeClass("is-hidden");
		$("#addCourseBtn").click();
	});
	
	// Add Course Button
	$("#addCourseBtn").click(() => {
		// https://stackoverflow.com/questions/9549643/jquery-clone-not-cloning-event-bindings-even-with-on
		$(".oneCourseGroupBlank").clone(true, true).removeClass("oneCourseGroupBlank is-hidden").insertAfter(".oneCourseGroup:last");
	});

	// Delete Course Button
	// TODO: switch to () => but doesn't work for some reason
	$(".deleteCourseBtn").click(function () {
		$(this).closest(".oneCourseGroup").remove();
	});

	// Submit Make Schedule Form
	$("#makeScheduleForm").on("submit", () => {
		// 
	});

	function compileWebForm () {
		var courseName = $(".courseName").val(),
			courseSubject = $(".courseSubjectDropdown").find(":selected").text(),
			courseStartTime = $(".courseStartTimeDropdown").find(":selected").text(),
			courseEndTime = $(".courseEndTimeDropdown").find(":selected").text();
	}
});

var socket = io.connect();
socket.on("connectionReceived", function connectionReceived () {
	// 
});
