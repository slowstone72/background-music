/*
	"Background Music for Multiplayer Piano"
	localizationParser.js - For parsing translations. Unused function included for archival purposes.
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

const config = require('./config.json');
const lzt = require('./lzt.json');
const fs = require('fs');

console.log('Localization parser running.');

// Define export of string fetch function:

module.exports = {
	parse: string_id => {
		return new Promise((resolve, reject) => {
			fs.exists(`./localizations/${config.default_localization}.json`, exists => {
				if (exists) {
					let localization = require(`./localizations/${config.default_localization}.json`);
					let output = localization.txt[string_id];
					if (output) {
						Object.keys(lzt).forEach(tag => {
							output = output.replace(RegExp(tag, 'g'), config[lzt[tag]]);
						});
					}
					resolve(output || '');
				} else {
					resolve('');
				}
			});
		});
	}
}