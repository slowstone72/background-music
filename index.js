/*
	"Background Music for Multiplayer Piano"
	index.js - Launcher for handling config.json & launching app.js
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

// Dependencies ++
const log = require('./log.js');
const editjsonfile = require('edit-json-file');
const fs = require('fs');
// Dependencies --

const modulePrefix = '[LAUNCHER]';

log.add(`${modulePrefix} Running.`);


// Define defaults ++
const valid_tags = { // this is a list of tags in localization files and their corresponding key in the configuration file so that localization files can use the data stored in the configuration...
	'%pname%': 'projectName',
	'%version%': 'version'
}
const valid_keys = { // this is a list of keys and their values which should be stored in configuration file:
	'defaultLocalization': 'english', // The default localization file present in the 'localizations' directory which the interface and logging output of this program will use.
	'firstTimeRun': true, // Whether or not this program is being run for the first time. This shouldn't be edited manually, unless some kind of tutorial mode is required again, or something similar.
	'detailedLogging': false, // Whether or not this program will record detailed information in its logging output. This shouldn't be edited manually unless troubleshooting is required.
	'configReady': false, // If you NEED the user to modify the configuration file before the program can work properly, you can set the default value of this key to false.
	'cmdPrefix': '?',
	'recordChatLogs': true,
	'doCursorAnimation': true,
	'servers': {
		'wss://multiplayerpiano.com':[
			'test/background',
			'test1',
			'test2',
			'test3'
		]
	}
}
const valid_dirs = [
	'logs',
	'midi'
];
// Define defaults --

/* Notes:
 Configuration file keys should usually be formattedLikeThis
 Directory names shouldn't contain spaces or uppercase letters.
 Directories shouldn't usually contain other directories unless necessary.
 If you need to modify this launcher program, scroll to the bottom of the file.
 In this template however, this launcher program just creates any missing directories and files and requests 'app.js', which should be your main program code.
 I've added comments to everything to somewhat explain it.
 In your project, you should probably replace this comment block with your own comments if needed. */

// Manage directories ++
valid_dirs.forEach(dir => { // Check the directories which are in the valid directories list and create any missing ones:
	fs.exists(`./${dir}`, (exists) => {
		if (!exists) {
			fs.mkdir(`./${dir}`, function(err) {
				if (err) {
					log.add(`${modulePrefix} ERROR: Failed to create directory '${dir}'!`, err);
					process.exit()
				} else {
					log.add(`${modulePrefix} Created directory: '${dir}'`);
				}
			});
		}
	});
});
// Manage directories --

// Manage lzt.json ++
/*log.add(`${modulePrefix} -----------------------------------------`)
log.add(`${modulePrefix} > Checking localization tags file integrity...`)
log.add(`${modulePrefix} -----------------------------------------`)
const lzt = editjsonfile('./lzt.json') // load localization_tags.json
lzt_change_made = false
Object.keys(valid_tags).forEach(tag => { // Check the tags currently in the localization tags file for missing tags and add those missing tags:
	if (!Object.keys(lzt.data).includes(tag)) {
		lzt_change_made = true
		log.add(`${modulePrefix} [lzt.json] > Adding missing tag '${tag}' with value: ${JSON.stringify(valid_tags[tag])}`)
		lzt.set(tag, valid_tags[tag])
	}
})
Object.keys(lzt.data).forEach(tag => { // Check the tags currently in the localization tags file for unknown tags and remove those unknown tags:
	if (!Object.keys(valid_tags).includes(tag)) {
		lzt_change_made = true
		log.add(`${modulePrefix} [lzt.json] > Removing unknown tag '${tag}'`)
		delete lzt.data[tag]
	}
})
log.add(`${modulePrefix} [lzt.json] >> Using the following options:`)
Object.keys(lzt.data).forEach(tag => { // Print out the key values being used:
		log.add(`${modulePrefix} [lzt.json] - ${tag}: ${JSON.stringify(lzt.data[tag])}`)
})
log.add(`${modulePrefix} -----------------------------------------`)
if (lzt_change_made) { // If changes have been made to the localization tags file, record those changes: (there's no need to rewrite the file if no changes have been made)
	log.add(`${modulePrefix} > Localization tags file check completed. Recording changes now.`)
	lzt.save()
} else {
	log.add(`${modulePrefix} > Localization tags file integrity check completed. All is well - continuing.`)
}
log.add(`${modulePrefix} -----------------------------------------`) */
// Manage lzt.json --

// Manage config.json ++
log.add(`${modulePrefix} -----------------------------------------`);
log.add(`${modulePrefix} > Checking configuration file integrity...`);
log.add(`${modulePrefix} -----------------------------------------`);
const config = editjsonfile('./config.json'); // load config.json
configChangeMade = false;
if (config.data.firstTimeRun === undefined) { // If the First Time Run key doesn't exist, then it's most likely the first time this program has been executed. Alternatively, it's may be that this program's saved data has been reset.
	configChangeMade = true;
	config.set('firstTimeRun', true);
} else if (config.data.firstTimeRun) {
	configChangeMade = true;
	config.set('firstTimeRun', false);
}
Object.keys(valid_keys).forEach(key => { // Check the keys currently in the configuration file for missing keys and add those missing keys:
	if (!Object.keys(config.data).includes(key)) {
		configChangeMade = true;
		log.add(`${modulePrefix} [config.json] > Adding missing key '${key}' with value: ${JSON.stringify(valid_keys[key])}`);
		config.set(key, valid_keys[key]);
	}
});
Object.keys(config.data).forEach(key => { // Check the keys currently in the configuration file for unknown keys and remove those unknown keys:
	if (!Object.keys(valid_keys).includes(key)) {
		configChangeMade = true;
		log.add(`${modulePrefix} [config.json] > Removing unknown key '${key}'`);
		delete config.data[key];
	}
});
if (config.data.detailedLogging) {
	log.add(`${modulePrefix} [config.json] >> Using the following options:`)
	Object.keys(config.data).forEach(key => { // Print out the key values being used:
			log.add(`${modulePrefix} [config.json] - ${key}: ${JSON.stringify(config.data[key])}`);
	});
}
log.add(`${modulePrefix} -----------------------------------------`);
if (configChangeMade) { // If changes have been made to the configuration file, record those changes: (there's no need to rewrite the file if no changes have been made)
	log.add(`${modulePrefix} > Configuration file integrity check completed. Recording changes now.`);
	config.save();
} else {
	log.add(`${modulePrefix} > Configuration file integrity check completed. All is well - continuing.`);
}
log.add(`${modulePrefix} -----------------------------------------`);
// Manage config.json --




// Manage localizations file ++
/*fs.exists(`./localizations/${config.data.defaultLocalization}.json`, function(exists) { // check for localization file presence:
	if (!exists) {
		log.add(`${modulePrefix} !! SELECTED LOCALIZATION FILE NOT FOUND !! Program will use default messages.`) // print a warning if the default localization file isn't found
	} else {
		log.add(`${modulePrefix} Default localization file was found. Program output switching to localization file text.`)
	}
})
const localization = require(`./localizations/${config.data.defaultLocalization}.json`) || {} // <---- Load the localization file or a blank json object if the localization file isn't present.
const lzp = require('./localizationParser.js')											  	   // Note that the localization file is only loaded in this way here because we're fetching separate metadata from it directly.
if (config.data.detailedLoggingOutput) { // if detailed logging is enabled:					   // The localization parser module is for all other text, and so loads the localization file separately just for that purpose.
	lzp.parse('lzinfo').then(function(data) { // parse the 'lzinfo' text in the localization file.
		log.add(`${modulePrefix} ${data || 'localization file info:'}`) // Print the output. Different localization files will have different values for the 'lzinfo' property, so that's the base of the framework for separate language localizations.
		log.add(`${modulePrefix} - ${localization.md.authors || 'n/a'}`) // Print the authors list from the 'md' (metadata) property of the localization file.
		log.add(`${modulePrefix} - ${localization.md.name || 'n/a'}`) // Print the localization name (E.G English, French..) from the 'md' (metadata) property of the localization file.
		log.add(`${modulePrefix} - ${localization.md.date || 'n/a'}`) // Print the date of the localization file from the 'md' (metadata) property of the localization file.
	}) 																// Note: this is the only time data should be pulled directly from a localization file, all other text (in the 'txt' property) is handled through the localization parser module.
}
lzp.parse('welcome').then(function(data) {
	log.add(`${modulePrefix} ${data || 'Done'}`)
})
*/
// Manage localizations file --




// Initialize:
if (config.get('configReady')) {
	require('./app.js');
} else {
	log.add(`${modulePrefix} !!! Review the configuration in config.json and change configReady to 'true' !!!`);
}