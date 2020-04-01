"use strict"; /* eslint-env browser */ /* global */ /* eslint no-warning-comments: [1, { "terms": ["todo", "fix", "help"], "location": "anywhere" }] */
const debug = false;

// These 2 functions are in case the course name is too long
// https://stackoverflow.com/questions/14484787/wrap-text-in-javascript
function wordWrap(str, maxWidth) {
	var newLineStr = "\n", done = false, res = '', found;
	while (str.length > maxWidth) {                 
		found = false;
		// Inserts new line at first whitespace of the line
		for (var i = maxWidth - 1; i >= 0; i--) {
			if (testWhite(str.charAt(i))) {
				res = res + [str.slice(0, i), newLineStr].join('');
				str = str.slice(i + 1);
				found = true;
				break;
			}
		}
		// Inserts new line at maxWidth position, the word is too long to wrap
		if (!found) {
			res += [str.slice(0, maxWidth), newLineStr].join('');
			str = str.slice(maxWidth);
		}
	}
	return res + str;
}
function testWhite(x) {
	var white = new RegExp(/^\s$/);
	return white.test(x.charAt(0));
};

var socket = io.connect(),
	conversionTable = {0: "a", 1: "b", 2: "c", 3: "d", 4: "e", 5: "f"},
	modTimeConversion = {1: "7:30", 2: "7:45", 3: "8:00", 4: "8:15", 5: "8:30", 6: "8:45", 7: "9:00", 8: "9:15", 9: "9:30", 10: "9:45",
		11: "10:00", 12: "10:15", 13: "10:30", 14: "10:45", 15: "11:00", 16: "11:15", 17: "11:30", 18: "11:45", 19: "12:00", 20: "12:15", 21: "12:30",
		22: "12:45", 23: "1:00", 24: "1:15", 25: "1:30", 26: "1:45", 27: "2:00", 28: "2:15", 29: "2:30", 30: "2:45", 31: "3:00", 32: "3:15", 33: "3:30"},
	modTimeConversionAMPM = {1: "7:30 AM", 2: "7:45 AM", 3: "8:00 AM", 4: "8:15 AM", 5: "8:30 AM", 6: "8:45 AM", 7: "9:00 AM", 8: "9:15 AM", 9: "9:30 AM", 10: "9:45 AM",
			11: "10:00 AM", 12: "10:15 AM", 13: "10:30 AM", 14: "10:45 AM", 15: "11:00 AM", 16: "11:15 AM", 17: "11:30 AM", 18: "11:45 AM", 19: "12:00 PM",
			20: "12:15 PM", 21: "12:30 PM", 22: "12:45 PM", 23: "1:00 PM", 24: "1:15 PM", 25: "1:30 PM", 26: "1:45 PM", 27: "2:00 PM",
			28: "2:15 PM", 29: "2:30 PM", 30: "2:45 PM", 31: "3:00 PM", 32: "3:15 PM", 33: "3:30 PM"},
	DLmodTimeConversion = {1: "9:00", 2: "9:10", 3: "9:20", 4: "9:30", 5: "9:40", 6: "9:50", 7: "10:00", 8: "10:10", 9: "10:20", 10: "10:30",
		11: "10:40", 12: "10:50", 13: "11:00", 14: "11:10", 15: "11:20", 16: "11:30", 17: "11:40", 18: "11:50", 19: "12:00", 20: "12:10", 21: "12:20",
		22: "12:30", 23: "12:40", 24: "12:50", 25: "1:00", 26: "1:10", 27: "1:20", 28: "1:30", 29: "1:40", 30: "1:50", 31: "2:00", 32: "2:10", 33: "2:20"},
	masterSchedLayout = [[[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []],
	   [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []],
	   [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []],
	   [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []],
	   [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []],
	   [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []]];
// This 2D array, masterSched, represents the data that the DOM table will show. It is basically your schedule, in 2D array format.
var masterSched = _.cloneDeep(masterSchedLayout);
var colorSets = {}; // Object with all set colors of the different courses
var colors = ["#FF0C00", "#D58AEB", "#949FFF", "#8AE5EB", "#87FF9B", "#517664", "#9FD8CB", "#D6E5E3", "#CACFD6"] // Array of preset colors to use


if (localStorage.getItem("schedData") != null) {
	console.log(JSON.parse(localStorage.getItem("schedData")));
	masterSched = JSON.parse(localStorage.getItem("schedData"));
	console.log(localStorage.getItem("colorSets"));
	colorSets = JSON.parse(localStorage.getItem("colorSets"));
	$("#startScreen").addClass("is-hidden");
	displayMasterSched();
}

// Navbar Burger
// $(document).ready(function () {
	// $(".navbar-burger").click(function () {
	// 	$(".navbar-burger").toggleClass("is-active");
	// 	$(".navbar-menu").toggleClass("is-active");
	// });

// Trevor's Code
let messages = ['Remember to wash your hands for 20 seconds.', '6 feet apart!', 'Stay healthy!', 'Practice Social Distancing!' , '#Punsunite'];
$("#funMessage").text("(" + messages[Math.floor(Math.random() * messages.length)] + ")");

// Start Screen
$("#showMakeScheduleScreen").click(() => {
	$("#showMakeScheduleScreen").addClass("is-hidden");
	$("#startScreen").addClass("is-hidden");
	$("#makeScheduleScreen").removeClass("is-hidden");
	$("#addCourseBtn").click();
});

// When User Clicks Auto Sign-in Using Punahou
$("#autoSignInBtn").click(() => {
	$("#autoSignInModal").addClass("is-active");
});
$(".modal-close, .modal-background").click(() => {
	// TODO unbind onclick after #autoSignInLoginBtn clicked
	$(".modal").removeClass("is-active");
})

// Auto-Sign In DOM Code
$("#autoSignInLoginBtn").click(() => {
	// Check that both username and password are not blank
	if ($("#autoSignInUsername").val() != "" && $("#autoSignInPassword").val() != "") {
		$("#autoSignInLoginBtn").html(`<i class="fas fa-spinner fa-spin"></i>`)
		$("#autoSignInLoginBtn").animateCSS("pulse");
		socket.emit("autoSchedule", [$("#autoSignInUsername").val(), $("#autoSignInPassword").val()]);
		// DOM Stuff
		$("#waitingText").removeClass("is-hidden");
		$("#autoSignInBtn").addClass("is-hidden");
		$("#autoSignInModalCloseBtn").addClass("is-invisible");
		$("#autoSignInPassword").prop("disabled", true);
		$("#autoSignInUsername").prop("disabled", true);
		$("#autoSignInLoginBtn").prop("disabled", true);
	} else {
		$("#autoSignInLoginBtn").animateCSS("wobble");
	}
});

$("#autoSignInPassword").on("keydown", function(e) {
	if (e.keyCode == 13) {
		$("#autoSignInLoginBtn").click();
	}
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
	compileWebForm();
});

// Toggle Office Hours
$("#toggleOfficeHours").click(() => {
	$(".optionalOfficeHoursCol").toggleClass("is-hidden");
});

// Toggle Headers
$("#toggleHeaders").click(() => {
	$(".optionalHeadersRow").toggleClass("is-hidden");
});

function compileWebForm () {
	var $el, courseName, courseSubject, courseStartTime, courseEndTime;
	masterSched = _.cloneDeep(masterSchedLayout); // Reset masterSched object so we can put courses in
	var checkFill = true;
	var incompleteInput = [];
	// Loop through every grouping of form fields that represent a course.
	$(".oneCourseGroup").not(".oneCourseGroupBlank").each((index, element) => {
		$el = $(element);
		courseName = $el.find(".courseName").val(),
		courseSubject = $el.find(".courseSubjectDropdown").find(":selected").text(),
		courseStartTime = $el.find(".courseStartTimeDropdown").find(":selected").text(),
		courseEndTime = $el.find(".courseEndTimeDropdown").find(":selected").text();

		if (courseName == "") {
			checkFill = false;
			incompleteInput.push($el.find(".courseName"));
		}
		if (courseSubject == "Select:") {
			checkFill = false;
			incompleteInput.push($el.find(".courseSubjectDropdown").parent());
		}
		if (courseStartTime == "Select:") {
			checkFill = false;
			incompleteInput.push($el.find(".courseStartTimeDropdown").parent());
		}
		if (courseEndTime == "Select:") {
			checkFill = false;
			incompleteInput.push($el.find(".courseEndTimeDropdown").parent());
		}

		var startMod = +_.invert(modTimeConversion)[courseStartTime.slice(0, -3)], // Convert, for example, "10:45" to 14 (the number 14, not "14")
			// The end mod is actually one less than the user input. (7:30-8:30 is 4 mods, but selecting 8:30 on the website is a 5th mod, 8:30-8:45)
			endMod = +_.invert(modTimeConversion)[courseEndTime.slice(0, -3)];

		if (endMod <= startMod) {
			checkFill = false;
			incompleteInput.push($el.find(".courseStartTimeDropdown").parent());
			incompleteInput.push($el.find(".courseEndTimeDropdown").parent());
		}
	});
	
	if (checkFill === true) {
		// TODO add artifical loading bar LOL
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
		displayMasterSched();
		$("#makeScheduleScreen").addClass("is-hidden");
		$("#footerContainer").removeClass("is-hidden");
	} else {
		$(".courseFormField").removeClass("is-danger");
		$("#formErrorsNotice").addClass("is-invisible");
		for (var i = 0; i < incompleteInput.length; i++) {
			incompleteInput[i].addClass("is-danger");
		}
		$("#createSchedBtn").animateCSS("wobble");
		$("#formErrorsNotice").removeClass("is-invisible");
	}
}

function populateTable (courseInfo) {
	// HOLY SMOKES THIS WAS HARD
	debug && console.log("Storing " + courseInfo.name + " into masterSched...");
	
	// First, convert all the times to distance learning (DL) times
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
					masterSched[i][j] = {"name": courseInfo.name, "startMod": startMod, "endMod": endMod}; // Now store the info of the course into the 2D array masterSched
				}
			}
		}
	}
	localStorage.setItem("schedData", JSON.stringify(masterSched));
}

// Reset Master Schedule DOM
function resetMasterSched () {
	for (var i = 0; i < masterSched.length; i++) {
		for (var j = 0; j < masterSched[i].length; j++) {
			$("td." + conversionTable[i] + "Col.mod" + j)
				.css("backgroundColor", "")
				.removeClass("noBorder")
				.data("courseName", "").data("backgroundColorAlpha", "")
				.find(".schedModTextContainer").text("");
		}
	}
	$(".optionalOfficeHoursCol").addClass("is-hidden");
	$("th.schedModTimeHeader").removeClass(".no-border");
	$(".oneColorPickerGroup").not(".oneColorPickerGroupBlank").remove();
}

// Display Master Sched
// TODO -- comment everything
// TODO ERROR IMPORTANT - MOD 32 (LAST MOD) DOESN'T SHOW UP!!!!
function displayMasterSched () {
	debug && console.log("Displaying master sched...");
	$("#tableScreen").removeClass("is-hidden");
	$("#rightSidebarBtns, #changeColorsText").removeClass("is-hidden");
	resetMasterSched();
	var middleMod; // The middle mod between the start and end mod. Will be explained later inside the function.
	// i is the column, j is the row of the DOM schedule table that corresponds with masterSched
	for (var i = 0; i < masterSched.length; i++) {
		for (var j = 0; j < masterSched[i].length; j++) {
			if (typeof masterSched[i][j].name != "undefined") {
				// If the course info object exists for this iteration of masterSched, then there is a course during this time
				// TODO comment this
				$("td." + conversionTable[i] + "Col.mod" + j).addClass("noBorder");
				$("td." + conversionTable[i] + "Col.mod" + j).data("courseName", masterSched[i][j].name);
				if (!colorSets.hasOwnProperty([masterSched[i][j].name])) {
					colorSets[masterSched[i][j].name] = colors.pop();
					// $("#rightSidebar").append(`<div class='box' data-course='${masterSched[i][j].name}'><input class='colorPicker' 
					// value="${colorSets[masterSched[i][j].name]}"></div>`);
					$(".oneColorPickerGroupBlank").clone(true, true).removeClass("oneColorPickerGroupBlank is-hidden").insertAfter(".oneColorPickerGroup:last");
					$(".oneColorPickerGroup:last").find(".box").data("courseColor", masterSched[i][j].name);
					$(".oneColorPickerGroup:last").find(".colorPickerCourseName").text(masterSched[i][j].name);
					$(".oneColorPickerGroup:last").find(".colorPickerContainer").append(`<input class="colorPicker" value="${colorSets[masterSched[i][j].name]}">`);
					new jscolor($(".oneColorPickerGroup:last").find(".colorPicker").get(0));
					$(".colorPicker").on("change", function(event) {
						colorSets[$(this).closest(".box").data("courseColor")] = $(this).val();
						localStorage.setItem("colorSets", JSON.stringify(colorSets));
						animateMasterSched();
					});
				} else {
					if (masterSched[i][j].name !== $(".oneColorPickerGroup:last").find(".colorPickerCourseName").text()) {
						$(".oneColorPickerGroupBlank").clone(true, true).removeClass("oneColorPickerGroupBlank is-hidden").insertAfter(".oneColorPickerGroup:last");
						$(".oneColorPickerGroup:last").find(".box").data("courseColor", masterSched[i][j].name);
						$(".oneColorPickerGroup:last").find(".colorPickerCourseName").text(masterSched[i][j].name);
						$(".oneColorPickerGroup:last").find(".colorPickerContainer").append(`<input class="colorPicker" value="${colorSets[masterSched[i][j].name]}">`);
						new jscolor($(".oneColorPickerGroup:last").find(".colorPicker").get(0));
						$(".colorPicker").on("change", function(event) {
							colorSets[$(this).closest(".box").data("courseColor")] = $(this).val();
							localStorage.setItem("colorSets", JSON.stringify(colorSets));
							animateMasterSched();
						});
					}
				}
				$("td." + conversionTable[i] + "Col.mod" + j).data("backgroundColorAlpha", "1");

				// Algorithm: So basically, the name of the course must be displayed in the vertical center of a course "block".
				// We need to calculate a way to determine which mod and which cell of the DOM table is the center of the course "block".
				middleMod = masterSched[i][j].startMod + Math.floor((masterSched[i][j].endMod - masterSched[i][j].startMod) / 2);
				if (j === middleMod) {
					// If this mod is the middle mod, then add text to it
					// $("td." + conversionTable[i] + "Col.mod" + j).find(".schedModTextContainer").text(masterSched[i][j].name);
					$("td." + conversionTable[i] + "Col.mod" + j).find(".schedModTextContainer").html(wordWrap(masterSched[i][j].name, +$(".schedMod").eq(0).css("width").slice(0, -2)/9).replace(/(?:\r\n|\r|\n)/g, '<br>'));
					// TODO text half-"block" lower!
					// TODO test if 12 char word wrap is accurate for pun laptop!
					$("td." + conversionTable[i] + "Col.mod" + j).data("backgroundColorAlpha", "1");
				}
			}
		}
	}
	animateMasterSched();
	debug && console.log("Finished displaying master sched.");
}

// Animation For Master Sched
function animateMasterSched () {
	var alphaColor;
	for (var i = 0; i < masterSched.length; i++) {
		for (var j = 0; j < masterSched[i].length; j++) {
			alphaColor = $("td." + conversionTable[i] + "Col.mod" + (j)).data("backgroundColorAlpha") || 0;
			if (colorSets.hasOwnProperty(masterSched[i][j].name)) {
				var rgb = hexToRgb(colorSets[masterSched[i][j].name]);
				// console.log(colorSets);
				localStorage.setItem("colorSets", JSON.stringify(colorSets));
				$("td." + conversionTable[i] + "Col.mod" + (j)).css("backgroundColor", `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alphaColor})`);
			}

			// if (!border) {
			// 	$("td." + conversionTable[i] + "Col.mod" + j).addClass(".no-border");
			// 	$("th.schedModTimeHeader").addClass(".no-border");
			// }
		}
	}
	// backgroundColorAlpha
}

function hexToRgb(hex) {
	// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function(m, r, g, b) {
		return r + r + g + g + b + b;
	});

	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
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
	$(".oneCourseGroup:last").find(".courseEndTimeDropdown").val("1:00 PM");

	$("#addCourseBtn").click();
	$(".oneCourseGroup:last").find(".courseName").val("Photography II");
	$(".oneCourseGroup:last").find(".courseSubjectDropdown").val("Art");
	$(".oneCourseGroup:last").find(".courseStartTimeDropdown").val("2:30 PM");
	$(".oneCourseGroup:last").find(".courseEndTimeDropdown").val("3:30 PM");

	$("#createSchedBtn").click();
}
// });

// Socket IO Retrieving Student Data
socket.on("studentSchedData", function receivedSchedData (data) {
	console.log(data);
	if (data[0] === "success") {
		// Populate fields on screen
		for (var i = 0; i < data[1].length; i++) {
			if (data[1][i][0].indexOf(data[1][i][0].substring(0, 4)) !== data[1][i][0].lastIndexOf(data[1][i][0].substring(0, 4))) {
				$(".oneCourseGroup:last").find(".courseName").val(data[1][i][0].substring(0, data[1][i][0].lastIndexOf(data[1][i][0].substring(0, 4))));
			} else {
				$(".oneCourseGroup:last").find(".courseName").val(data[1][i][0]);
			}
			// We can't pull the subject from myBackpack

			// If start and end time mods are given, then populate those fields
			if (data[1][i][1]) {
				if (data[1][i][1].length >= 2) {
					$(".oneCourseGroup:last").find(".courseStartTimeDropdown").val(modTimeConversionAMPM[ data[1][i][1][0] ]);
					$(".oneCourseGroup:last").find(".courseEndTimeDropdown").val(modTimeConversionAMPM[ data[1][i][1][1] + 1 ]); // 2:15 --> 2:30
				}
			}
			// If there's still another course to add, click "add course"
			if (i < data[1].length - 1) {
				$("#addCourseBtn").click();
			}
		}

		// Hide modal
		$(".modal").removeClass("is-active");
		// $("#signInInfoText").addClass("is-hidden");
		$("#signInInfoText").text("Import successful! Please fill out what subject each class is in.\
			Also, classes with Large and Small will be duplicated below, just choose your small section time.").animateCSS("flash");
	} else {
		// Login failed, hide modal and tell user it failed
		$(".modal").removeClass("is-active");
		$("#signInInfoText").text("The import failed :( Super sorry about that! Please enter your schedule information below:").animateCSS("flash");
	}
});


function createPDF() {
	$("#makePDFButton").html(`<i class="fas fa-spinner fa-spin"></i>`);
	$("#makePDFButton").attr("disabled", "disabled");
	// https://github.com/niklasvh/html2canvas/issues/1878
	html2canvas(document.getElementById("scheduleTable"), {
		scale: 4,
		scrollX: 0,
		scrollY: -window.scrollY
	}).then(canvas => {
		saveAs(canvas.toDataURL(), "schedule.png");
		$("#makePDFButton").html("Download Schedule");
		$("#makePDFButton").removeAttr("disabled", "disabled");
	});
}
	
function saveAs(uri, filename) {

	var link = document.createElement('a');

	if (typeof link.download === 'string') {

		link.href = uri;
		link.download = filename;

		//Firefox requires the link to be in the body
		document.body.appendChild(link);

		//simulate click
		link.click();

		//remove the link when done
		document.body.removeChild(link);

	} else {

		window.open(uri);

	}
}


// Lots of animate
$("#makePDFButton").click(function() {
	createPDF();
});
$("#makePDFButton").hover(function() {
	$("#makePDFButton").animateCSS("pulse");
});
$("#autoSignInBtn").hover(function() {
	$("#autoSignInBtn").animateCSS("pulse");
});
$("#createSchedBtn").hover(function() {
	$("#createSchedBtn").animateCSS("tada");
});
$("#showMakeScheduleScreen").hover(function() {
	$("#showMakeScheduleScreen").animateCSS("heartBeat");
});
$("#addCourseBtn").hover(function() {
	$("#addCourseBtn").animateCSS("pulse");
});
$("#makePDFButton").hover(function() {
	$("#makePDFButton").animateCSS("pulse");
});

