"use strict"; /* eslint-env browser */ /* global */ /* eslint no-warning-comments: [1, { "terms": ["todo", "fix", "help"], "location": "anywhere" }] */
const debug = true;

var conversionTable = {0: "a", 1: "b", 2: "c", 3: "d", 4: "e", 5: "f"},
	masterSchedLayout = [[[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []],
	   [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []],
	   [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []],
	   [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []],
	   [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []],
	   [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []]];
// This 2D array, masterSched, represents the data that the DOM table will show. It is basically your schedule, in 2D array format.
var masterSched = _.cloneDeep(masterSchedLayout);

// Brandon's TODO
// Fix 404 (just reload to homepage)
// Show the headers of possible sync classes

// Navbar Burger
// $(document).ready(function () {
	// $(".navbar-burger").click(function () {
	// 	$(".navbar-burger").toggleClass("is-active");
	// 	$(".navbar-menu").toggleClass("is-active");
	// });
	
// Start Screen
$("#showMakeScheduleScreen").click(() => {
	$("#startScreen").addClass("is-hidden");
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
$("#makeScheduleForm").on("submit", (e) => {
	e.preventDefault();
	// TODO -- validate form!! need to validate form cuz i need all fields filled out! make sure nothing overlapping etc.
	compileWebForm();
});

function compileWebForm () {
	var $el, courseName, courseSubject, courseStartTime, courseEndTime;
	// Loop through every grouping of form fields that represent a course.
	$(".oneCourseGroup").not(".oneCourseGroupBlank").each((index, element) => {
		$el = $(element);
		courseName = $el.find(".courseName").val(),
		courseSubject = $el.find(".courseSubjectDropdown").find(":selected").text(),
		courseStartTime = $el.find(".courseStartTimeDropdown").find(":selected").text(),
		courseEndTime = $el.find(".courseEndTimeDropdown").find(":selected").text();
		// Send an object of information about the course to the function populateTable which populates the DOM table.
		// By the way, need to .slice(0, -3) to remove " AM" or " PM" from the start and end times.
		populateTable({"name": courseName, "subject": courseSubject, "start": courseStartTime.slice(0, -3), "end": courseEndTime.slice(0, -3)});
	});
	// TODO add artifical loading bar LOL
	displayMasterSched();
}

function populateTable (courseInfo) {
	// HOLY SMOKES THIS WAS HARD
	
	// First, convert all the times to distance learning (DL) times
	var modTimeConversion = {1: "7:30", 2: "7:45", 3: "8:00", 4: "8:15", 5: "8:30", 6: "8:45", 7: "9:00", 8: "9:15", 9: "9:30", 10: "9:45",
	11: "10:00", 12: "10:15", 13: "10:30", 14: "10:45", 15: "11:00", 16: "11:15", 17: "11:30", 18: "11:45", 19: "12:00", 20: "12:15", 21: "12:30",
		22: "12:45", 23: "1:00", 24: "1:15", 25: "1:30", 26: "1:45", 27: "2:00", 28: "2:15", 29: "2:30", 30: "2:45", 31: "3:00", 32: "3:15", 33: "3:30"};
	var DLmodTimeConversion = {1: "9:00", 2: "9:10", 3: "9:20", 4: "9:30", 5: "9:40", 6: "9:50", 7: "10:00", 8: "10:10", 9: "10:20", 10: "10:30",
	11: "10:40", 12: "10:50", 13: "11:00", 14: "11:10", 15: "11:20", 16: "11:30", 17: "11:40", 18: "11:50", 19: "12:00", 20: "12:10", 21: "12:20",
	22: "12:30", 23: "12:40", 24: "12:50", 25: "1:00", 26: "1:10", 27: "1:20", 28: "1:30", 29: "1:40", 30: "1:50", 31: "2:00", 32: "2:10", 33: "2:20"};
	var startMod = +_.invert(modTimeConversion)[courseInfo.start], // Convert, for example, "10:45" to 14 (the number 14, not "14")
		// The end mod is actually one less than the user input. (7:30-8:30 is 4 mods, but selecting 8:30 on the website is a 5th mod, 8:30-8:45)
		endMod = +_.invert(modTimeConversion)[courseInfo.end] - 1;
	// var DLstartTime = DLmodTimeConversion[startMod],
	// 	DLendTime = DLmodTimeConversion[endMod];
	debug && console.log(courseInfo, startMod, endMod);

	// Next, figure out which courses belong to which letter days.
	var classToLetterDayKey = {"World Languages": 0, "Art": 0, "Social Studies": 1, "DT (Design Technology)": 1, "Math": 2, "Music": 2,
		"S+Well": 3, "Theatre": 3, "English": 4, "PE": 4, "Science": 5, "JROTC": 5};

	// Now, fill out the 2D array masterSched with the data of your schedule. This is where all the distance learning day/time conversion happens.
	for (var i = 0; i < masterSched.length; i++) {
		for (var j = 0; j < masterSched[i].length; j++) {
			// Check if this course (each course will be put through the outer function populateTable) belongs in this "column" (i) of masterSched
			if (i === classToLetterDayKey[courseInfo.subject]) {
				// This course belongs in this column i. For example, Physics will be matched with i value 5 using classToLetterDayKey.
				if (j >= startMod && j <= endMod) {
					masterSched[i][j] = courseInfo.name; // Now store the name of the course into the 2D array masterSched
				}
			}
		}
	}
}

// Reset Master Schedule DOM
function resetMasterSched () {
	for (var i = 0; i < masterSched.length; i++) {
		for (var j = 0; j < masterSched[i].length; j++) {
			$("td." + conversionTable[i] + "Col.mod" + (j + 1)).css("backgroundColor", "").text("");
		}
	}
}

// Display Master Sched
// TODO -- comment everything
function displayMasterSched () {
	resetMasterSched();
	var text;
	// i is the column, j is the row of the DOM schedule table that corresponds with masterSched
	for (var i = 0; i < masterSched.length; i++) {
		for (var j = 0; j < masterSched[i].length; j++) {
			if (masterSched[i][j].length > 0) {
				// comment this TODO
				$("td." + conversionTable[i] + "Col.mod" + (j + 1)).text(masterSched[i][j]); // TODO delete this after dev!
				$("td." + conversionTable[i] + "Col.mod" + (j + 1)).data("courseName", masterSched[i][j]);
				$("td." + conversionTable[i] + "Col.mod" + (j + 1)).data("backgroundColorAlpha", "1");
			}
		}
	}
	animateMasterSched();
}

// Animation For Master Sched
// TODO -- animation CSS transition delay not working??
function animateMasterSched () {
	var alphaColor;
	for (var i = 0; i < masterSched.length; i++) {
		for (var j = 0; j < masterSched[i].length; j++) {
			alphaColor = $("td." + conversionTable[i] + "Col.mod" + (j + 1)).data("backgroundColorAlpha") || 0;
			$("td." + conversionTable[i] + "Col.mod" + (j + 1)).css("backgroundColor", "rgba(227, 182, 14, " + alphaColor + ")");
		}
	}
	// backgroundColorAlpha
}

// Debug Code
if (debug) {
	// $("#makeScheduleScreen").removeClass("is-hidden");
	$("#showMakeScheduleScreen").click();
	$("#tableScreen").removeClass("is-hidden");

	// Create Some Example Courses
	$(".oneCourseGroup:last").find(".courseName").val("Calc BC");
	$(".oneCourseGroup:last").find(".courseSubjectDropdown").val("Math");
	$(".oneCourseGroup:last").find(".courseStartTimeDropdown").val("7:30 AM");
	$(".oneCourseGroup:last").find(".courseEndTimeDropdown").val("8:30 AM");

	$("#addCourseBtn").click();
	$(".oneCourseGroup:last").find(".courseName").val("Sci Fi");
	$(".oneCourseGroup:last").find(".courseSubjectDropdown").val("English");
	$(".oneCourseGroup:last").find(".courseStartTimeDropdown").val("11:30 AM");
	$(".oneCourseGroup:last").find(".courseEndTimeDropdown").val("12:30 PM");

	$("#addCourseBtn").click();
	$(".oneCourseGroup:last").find(".courseName").val("Photography II");
	$(".oneCourseGroup:last").find(".courseSubjectDropdown").val("Art");
	$(".oneCourseGroup:last").find(".courseStartTimeDropdown").val("2:30 PM");
	$(".oneCourseGroup:last").find(".courseEndTimeDropdown").val("3:30 PM");

}
// });

// Socket.IO Code
var socket = io.connect();
socket.on("studentSchedData", function receivedSchedData(data) {
	console.log(data);
});

// When User Clicks Auto Sign-in Using Punahou
// TODO -- turn into modal
$("#autoSignIn").click(function() {
	// Check that both username and password are not blank
	if ($("#username").val() != "" && $("#password").val() != "") {
		console.log($("#username").val());
		socket.emit("autoSchedule", [$("#username").val(), $("#password").val()]);
		// Empty input fields
		$("#password").val("");
		$("#username").val("");
	}
});


function createPDF() {
	const filename  = 'table.pdf';
	// var quality = 1;
	html2canvas(document.querySelector("#scheduleTable")).then(canvas => {
		console.log(canvas)
	});
	// let pdf = new jsPDF('p', 'mm', 'a4');
	// pdf.addImage(, 'PNG', 0, 0, 211, 298);
	// pdf.save(filename);
}
	// var doc = new jsPDF('p', 'pt');
	// var elem = document.getElementById("scheduleTable");
	// var res = doc.autoTableHtmlToJson(elem);
	// console.log(res.data);
	// doc.autoTable({
	// 	html: '#scheduleTable',
	// 	columnStyles: {
	// 		0: {cellWidth: 50},
	// 		1: {cellWidth: 75},
	// 		2: {cellWidth: 75},
	// 		3: {cellWidth: 75},
	// 		4: {cellWidth: 75},
	// 		5: {cellWidth: 75},
	// 		6: {cellWidth: 75}
	// 	}
	// });
	// doc.save("table.pdf");
// }