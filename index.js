"use strict"; /* eslint-env node */ /* global */ /* eslint no-warning-comments: [1, { "terms": ["todo", "fix", "help"], "location": "anywhere" }] */
var debug = false;

/*
 * Notes
 *
 * Resources:
 * https://bulma.io/documentation/
 * https://pugjs.org/api/getting-started.html
 * http://html2jade.vida.io/
 * https://fontawesome.com/icons
 */

// Load Node Dependencies & Custom Modules
var express = require("express"),
	app = express(),
	server = app.listen(process.env.PORT || (process.argv[2] || 8000), function expressServerListening () {
		console.log(server.address());
	}),

	// Express Middleware
	helmet = require("helmet"),
	pugStatic = require("pug-static"),

	// Project-Specific Dependencies
	io = require("socket.io"),
	listener = io.listen(server),

	Nightmare = require("nightmare"),
	nightmare = Nightmare({show: true}),
	cheerio = require("cheerio"),

	// Utilities & Custom Modules
	utils = require("./utils.js");

// Setup Express Middleware
app.set("view engine", "pug");
app.use(helmet());
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/dist"));
app.use(pugStatic(__dirname + "/views"));
app.use((req, res, next) => {
	res.status(404).render("404.pug");
});

// var router = require("./routes/routes.js");
// app.use("/", router);

// Socket.io Control
listener.sockets.on("connection", function connectionDetected (socket) {
	socket.on("refreshRequest", function processRefreshRequest (options) {
		socket.emit("refreshResponse", {});
	});
	socket.on("autoSchedule", function studentDataRequest(loginInfo) {
		getStudentDataViaNightmare(loginInfo[0], loginInfo[1], function(data) {
			socket.emit("studentSchedData", data);
		})
	});
});


// Use cheerio to process schedule data and find breaks
function getDataFromTable(html, callback) {
	var $ = cheerio.load(html);
	var $table = $("table.dataTableOdd > tbody > tr > td > table.dataTable > tbody"); // Table that stores course info
	var len = $table.children().length; // Amount of courses
	var data = [];
	for (var i = 1; i < len; i++) {
		var courseName = $(`table.dataTableOdd > tbody > tr > td > table.dataTable > tbody > tr:nth-child(${i + 1}) > td:nth-child(1)`).text().replace(/(\r\n|\n|\r)/gm,"");
		// Do not include any unecessary classes such as chapel
		if (courseName != "CLASS DEANS\' EMAIL" && courseName != "CITIZENSHIP CITIZENSHIP" && courseName != "AP-12" 
		&& courseName != "AP-11" && courseName != "AP-10" && courseName != "AP-9" && courseName != "ASSEM 12" 
		&& courseName != "ASSEM 11" && courseName != "ASSEM 10" && courseName != "ASSEM 9" && courseName != "CHAPEL 12" 
		&& courseName != "CHAPEL 11" && courseName != "CHAPEL 10" && courseName != "CHAPEL 9") {
			// Create a new array that stores the course name and time.
			data.push([courseName]);
			for (var j = 0; j < 6; j++) {
				var courseMeetingTime = $(`table.dataTableOdd > tbody > tr > td > table.dataTable > tbody > tr:nth-child(${i + 1}) > td:nth-child(${6 + j})`).text().split("-");
				// Check if the time is already in the array or if the meeting time is a break
				if (courseMeetingTime.length > 1 && parseInt(courseMeetingTime[0]) != data[data.length - 1][data[data.length - 1].length - 1][0]) {
					data[data.length - 1].push([parseInt(courseMeetingTime[0]), parseInt(courseMeetingTime[1])]);
				}
			}
		}
	}
	callback(data);
}

// Pull the schedule data from the correct table
function extractDataFromTable(callback) {
	nightmare
		.wait("a[href='https://mybackpack.punahou.edu/SeniorApps/studentParent/schedule.faces?selectedMenuId=true']")
		.click("a[href='https://mybackpack.punahou.edu/SeniorApps/studentParent/schedule.faces?selectedMenuId=true']")
		.wait("select")
		.evaluate(() => document.body.innerHTML)
		.then(response => {
			getDataFromTable(response, function(data) {
				nightmare.end();
				callback(data);
			});
			
		})
		.catch(error => {
			console.error("Error: ", error);
		})
}

/* Pull student schedule from myBackpack using the username and password to login
 * The studentNum is the student's id number, which is used to select the correct schedule
*/
function getStudentDataViaNightmare (username, password, callback) {
	nightmare = Nightmare({show: false});
	nightmare
		.goto('https://mybackpack.punahou.edu/SeniorApps/facelets/registration/loginCenter.xhtml')
		.wait('body')
		.type('input[id="form:userId"]', username)
		.type('input[id="form:userPassword"]', password)
		.click('input[name="form:signIn"]')
		.wait(1000)
		.evaluate(function() {
			if (document.getElementById("form:errorMsgs") == null) {
				return true;
			} else {
				return false;
			}
		})
		.then(loggedIn => {
			if (loggedIn) {
				extractDataFromTable(callback);
			} else {
				// Failed login
				callback("failedLogin");
			}
		})
		.catch(error => {
			console.error("Error: ", error);
		});
}