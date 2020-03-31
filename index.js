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
 *
 * https://www.digitalocean.com/community/tutorials/how-to-set-up-a-node-js-application-for-production-on-ubuntu-16-04
 * https://www.digitalocean.com/community/tutorials/how-to-point-to-digitalocean-nameservers-from-common-domain-registrars
 * https://www.digitalocean.com/community/tutorials/how-to-set-up-let-s-encrypt-with-nginx-server-blocks-on-ubuntu-16-04
 * https://www.digitalocean.com/community/tutorials/how-to-set-up-nginx-server-blocks-virtual-hosts-on-ubuntu-16-04
 *
 * https://github.com/segmentio/nightmare/issues/224#issuecomment-239335488
 * https://stackoverflow.com/questions/40178836/run-nightmare-by-pm2-or-something-like-that-on-the-server
 * https://devhints.io/pm2
 * https://github.com/segmentio/nightmare/issues/224#issuecomment-141575361
 * https://stackoverflow.com/questions/36719236/nightmare-js-not-working
 * https://github.com/electron/electron/issues/11755
 *
 * https://pm2.keymetrics.io/docs/usage/use-pm2-with-cloud-providers/
 * https://pm2.keymetrics.io/docs/integrations/heroku/
 * 
 */

// Load Node Dependencies & Custom Modules
var express = require("express"),
	app = express(),
	server = app.listen(process.env.PORT || (process.argv[2] || 8000), function expressServerListening () {
		debug && console.log(server.address());
	}),

	// Express Middleware
	helmet = require("helmet"),
	pugStatic = require("pug-static"),

	// Project-Specific Dependencies
	io = require("socket.io"),
	listener = io.listen(server),
	cheerio = require("cheerio"),
	Nightmare = require("nightmare"),

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
		console.log("Socket io on server side");
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
			data.push([titleCase(courseName)]);
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

// https://stackoverflow.com/questions/32589197/capitalize-first-letter-of-each-word-in-a-string-javascript/45620677
function titleCase(str) {
	var splitStr = str.toLowerCase().split(' ');
	for (var i = 0; i < splitStr.length; i++) {
		// You do not need to check if i is larger than splitStr length, as your for does that for you
		// Assign it back to the array
		splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
	}
	// Directly return the joined string
	return splitStr.join(' '); 
 }

// Pull the schedule data from the correct table
function extractDataFromTable(nightmare, callback) {
	nightmare
		.wait("a[href='https://mybackpack.punahou.edu/SeniorApps/studentParent/schedule.faces?selectedMenuId=true']")
		.click("a[href='https://mybackpack.punahou.edu/SeniorApps/studentParent/schedule.faces?selectedMenuId=true']")
		.wait("select")
		.evaluate(() => document.body.innerHTML)
		.then(response => {
			getDataFromTable(response, function(data) {
				nightmare.end();
				callback(["success", data]);
			});
			
		})
		.catch(error => {
			callback(["fail", "failedLogin"]);
		})
}

/* Pull student schedule from myBackpack using the username and password to login
 * The studentNum is the student's id number, which is used to select the correct schedule
*/
function getStudentDataViaNightmare (username, password, callback) {
	console.log(username);
	let nightmare = new Nightmare({show: false});
	nightmare
		.goto('https://mybackpack.punahou.edu/SeniorApps/facelets/registration/loginCenter.xhtml')
		.wait('body')
		.type('input[id="form:userId"]', username)
		.type('input[id="form:userPassword"]', password)
		.click('input[name="form:signIn"]')
		.wait(3000)
		.evaluate(function() {
			if (document.getElementById("form:errorMsgs") == null) {
				return true;
			} else {
				return false;
			}
		})
		.then(loggedIn => {
			if (loggedIn) {
				extractDataFromTable(nightmare, callback);
			} else {
				// Failed login
				callback(["fail", "failedLogin"]);
			}
		})
		.catch(error => {
			callback(["fail", "failedLogin"]);
		});
}
