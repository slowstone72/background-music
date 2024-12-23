/*
>> Node.js Application Framework
>> log.js

>> If this file has been modified from the original source material please check (/) this box: [] (just to keep things organized and consistent) */

// Dependencies ++
const fs = require("fs")
// Dependencies --

const module_prefix = "[SESSIONLOGGER]"

console.log(`${module_prefix} Running.`)

module.exports = {
	initializationdate: new Date(),
	sessionlog: new Date(),
	add: function(txt) {
		console.log(txt);
		this.sessionlog += `\n${txt}`
	}
}

// Manage finishing up logging:
var writing = false;

function exitHandler(options, err) {
	if (!writing) { // sometimes both of these exit events are fired, so this stops the following code from being triggered twice
		writing = true;
		module.exports.sessionlog += `\n!! PROCESS EXITING !!`
		fs.writeFileSync(`./logs/${module.exports.initializationdate.getFullYear()}-${module.exports.initializationdate.getMonth()+1} Day ${module.exports.initializationdate.getDate()} ${module.exports.initializationdate.getHours()}-${module.exports.initializationdate.getMinutes()}-${module.exports.initializationdate.getSeconds()}.txt`, module.exports.sessionlog);
		console.log(`${module_prefix} !! LOG FILE WRITTEN !! GOODBYE !!`)
		process.exit()
	}
}


//process.on('exit', exitHandler.bind(null,{cleanup:true}))
//process.on('SIGINT', exitHandler.bind(null, {exit:true}))
