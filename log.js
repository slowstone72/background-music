/*
	"Background Music for Multiplayer Piano"
	log.js - For logging sessions. Unused function included for archival purposes.
	2022.11.07 - 2024.12.31

	Callum Fisher <cf.fisher.bham@gmail.com>

	This is free and unencumbered software released into the public domain.

	Anyone is free to copy, modify, publish, use, compile, sell, or
	distribute this software, either in source code form or as a compiled
	binary, for any purpose, commercial or non-commercial, and by any
	means.

	In jurisdictions that recognize copyright laws, the author or authors
	of this software dedicate any and all copyright interest in the
	software to the public domain. We make this dedication for the benefit
	of the public at large and to the detriment of our heirs and
	successors. We intend this dedication to be an overt act of
	relinquishment in perpetuity of all present and future rights to this
	software under copyright law.

	THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
	IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
	OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
	ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
	OTHER DEALINGS IN THE SOFTWARE.

	For more information, please refer to <https://unlicense.org>
*/

// Fetch dependencies:

const fs = require('fs');

// Announce start up:

console.log('Session Logger running.');

// Define export of log function:

module.exports = {
	initializationdate: new Date(),
	sessionlog: new Date(),
	add: txt => {
		console.log(txt);
		this.sessionlog += `\n${txt}`;
	}
}

// Handle finishing up logging:

let writing = false;

const exitHandler = (options, err) => {

	if (writing) return; // sometimes both of these exit events are fired, so this stops the following code from being triggered twice

	writing = true;

	module.exports.sessionlog += `\n!! PROCESS EXITING !!`;
	
	fs.writeFileSync(`./logs/${module.exports.initializationdate.getFullYear()}-${module.exports.initializationdate.getMonth()+1} Day ${module.exports.initializationdate.getDate()} ${module.exports.initializationdate.getHours()}-${module.exports.initializationdate.getMinutes()}-${module.exports.initializationdate.getSeconds()}.txt`, module.exports.sessionlog);
	
	console.log(`${module_prefix} !! LOG FILE WRITTEN !! GOODBYE !!`);
	process.exit();

}

process.on('exit', exitHandler.bind(null, {
	cleanup: true
}));

process.on('SIGINT', exitHandler.bind(null, {
	exit: true
}));
