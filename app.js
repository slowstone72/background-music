/*
	"Background Music for Multiplayer Piano"
	app.js - Main program.
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

const fs = require('fs');
const log = require('./log.js');
const config = require('./config.json');
const mppClient = require('./mppClient.js');
const midiPlayer = require('midi-player-js');
const editJsonFile = require ('edit-json-file');

const modulePrefix = '[APP]';

log.add(`${modulePrefix} Running.`);

const userDB = editJsonFile('userdb.json');
userDB.save();

const months = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November'
];

const MPPKeys = ['a-1', 'as-1', 'b-1', 'c0', 'cs0', 'd0', 'ds0', 'e0', 'f0', 'fs0', 'g0', 'gs0', 'a0', 'as0', 'b0', 'c1', 'cs1', 'd1', 'ds1', 'e1', 'f1', 'fs1', 'g1', 'gs1', 'a1', 'as1', 'b1', 'c2', 'cs2', 'd2', 'ds2', 'e2', 'f2', 'fs2', 'g2', 'gs2', 'a2', 'as2', 'b2', 'c3', 'cs3', 'd3', 'ds3', 'e3', 'f3', 'fs3', 'g3', 'gs3', 'a3', 'as3', 'b3', 'c4', 'cs4', 'd4', 'ds4', 'e4', 'f4', 'fs4', 'g4', 'gs4', 'a4', 'as4', 'b4', 'c5', 'cs5', 'd5', 'ds5', 'e5', 'f5', 'fs5', 'g5', 'gs5', 'a5', 'as5', 'b5', 'c6', 'cs6', 'd6', 'ds6', 'e6', 'f6', 'fs6', 'g6', 'gs6', 'a6', 'as6', 'b6', 'c7'];
const convKeys = ['A0', 'Bb0', 'B0', 'C1', 'Db1', 'D1', 'Eb1', 'E1', 'F1', 'Gb1', 'G1', 'Ab1', 'A1', 'Bb1', 'B1', 'C2', 'Db2', 'D2', 'Eb2', 'E2', 'F2', 'Gb2', 'G2', 'Ab2', 'A2', 'Bb2', 'B2', 'C3', 'Db3', 'D3', 'Eb3', 'E3', 'F3', 'Gb3', 'G3', 'Ab3', 'A3', 'Bb3', 'B3', 'C4', 'Db4', 'D4', 'Eb4', 'E4', 'F4', 'Gb4', 'G4', 'Ab4', 'A4', 'Bb4', 'B4', 'C5', 'Db5', 'D5', 'Eb5', 'E5', 'F5', 'Gb5', 'G5', 'Ab5', 'A5', 'Bb5', 'B5', 'C6', 'Db6', 'D6', 'Eb6', 'E6', 'F6', 'Gb6', 'G6', 'Ab6', 'A6', 'Bb6', 'B6', 'C7', 'Db7', 'D7', 'Eb7', 'E7', 'F7', 'Gb7', 'G7', 'Ab7', 'A7', 'Bb7', 'B7', 'C8'];

takenChannels = [];
instanceCounter = 0;

const newInstance = (channel, server) => {
	instanceCounter++;
	let bot = {
		client: new mppClient(server),
		chat: {
			send: msg => {
				msg.match(/.{0,511}/g).forEach((x, i) => {
					if (x === '') return;
					if (i !== 0) x = '' + x;
					bot.temp.chatBuffer.push('\u034f'+x);
				});
			}
		},
		fun: {}, // functions
		temp: {
			instance: instanceCounter,
			desiredChannel: channel,
			echoDelay: 40,
			chatBuffer: [],
			secondsSinceLastNote: 0,
			secondsSinceLastMIDI: 0,
			playBackgroundMusic: true,
			midiInterruptionCount: 0,
			doCursorAnimation: config.doCursorAnimation,
			cursorAnimInfo: {
				x: 50,
				y: 80,
				yIncrement: 0.01,
				xIncrement: 0.01
			}
		} // any temporary information we store
	}

	let sendChat = bot.chat.send;

	bot.client.start();



	bot.client.on('hi', () => {
		if (!bot.temp.connectedOnce) {
			bot.temp.connectedOnce = true;
			log.add(`${modulePrefix} [${bot.temp.instance}] ${bot.fun.getTimestamp()}`);
			log.add(`${modulePrefix} [${bot.temp.instance}] Connected to MPP server @ ${server}`);
			log.add(`${modulePrefix} [${bot.temp.instance}] Starting in channel: ${bot.temp.desiredChannel}`);
			bot.client.setChannel(bot.temp.desiredChannel);
			// bot.client.sendArray([{ m: 'userset', set: { name: 'Background Music', color: '#8a91ff' }}]);
			bot.temp.chatBufferInt = setInterval(() => {
				if (bot.temp.chatBuffer) bot.client.sendArray([{m:'a', message: bot.temp.chatBuffer.shift() }]);
			}, 3000);
			bot.temp.cursorAnimInfo.xyControl = setInterval(() => {
				if (bot.temp.doCursorAnimation) {
					bot.temp.cursorAnimInfo.left ? bot.temp.cursorAnimInfo.x -= bot.temp.cursorAnimInfo.xIncrement : bot.temp.cursorAnimInfo.x += bot.temp.cursorAnimInfo.xIncrement;
					if (bot.temp.cursorAnimInfo.x > 99) bot.temp.cursorAnimInfo.left = true;
					if (bot.temp.cursorAnimInfo.x < 0) bot.temp.cursorAnimInfo.left = false;
					bot.temp.cursorAnimInfo.down ? bot.temp.cursorAnimInfo.y -= bot.temp.cursorAnimInfo.yIncrement : bot.temp.cursorAnimInfo.y += bot.temp.cursorAnimInfo.yIncrement;
					if (bot.temp.cursorAnimInfo.y > 99) bot.temp.cursorAnimInfo.down = true;
					if (bot.temp.cursorAnimInfo.y < 0) bot.temp.cursorAnimInfo.down = false;
				}
			}, 50);
			bot.temp.cursorAnimInfo.randomControl = setInterval(() => {
				bot.temp.cursorAnimInfo.yIncrement = 0.6;
				bot.temp.cursorAnimInfo.xIncrement = 0.6;
				setTimeout(() => {
					bot.temp.cursorAnimInfo.yIncrement = 0.1;
					bot.temp.cursorAnimInfo.xIncrement = 0.1;
				}, 600);
				if (Math.random() > 0.7) bot.temp.cursorAnimInfo.left = !bot.temp.cursorAnimInfo.left;
				if (Math.random() > 0.7) bot.temp.cursorAnimInfo.down = !bot.temp.cursorAnimInfo.down;
			}, 5000);
			bot.temp.cursorAnimInfo.sendControl = setInterval(() => {
				if (bot.temp.doCursorAnimation) bot.client.sendArray([{m: 'm', x: bot.temp.cursorAnimInfo.x, y:  bot.temp.cursorAnimInfo.y}]);
			}, 50);
			bot.client.on('n', (msg) => {
				if (msg.p.id !== bot.client.getOwnParticipant().id) {
					bot.temp.secondsSinceLastNote = 0;
					if (bot.temp.playingMIDI) {
						bot.temp.midiInterruptionCount++;
						if (bot.temp.midiInterruptionCount > 10) {
							bot.fun.reset();
						}
					}
				} 
			});
			bot.client.on('participant added', msg => {
				if (bot.client.channel.id === 'test/background' && msg.id !== bot.client.getOwnParticipant()._id) {
					sendChat(`Hello${Object.keys(userDB.data).includes(msg.id) ? ' again' : ''}, ${msg.name}. ${Object.keys(userDB.data).includes(msg.id) && userDB.data[msg.id].in ? 'You\'ve already opted in to background music in your channels. Send /opt-out to chat to opt out.' : 'Opt in to background music for your channels. Send /opt-in to chat.'}`);
					if (!Object.keys(userDB.data).includes(msg.id)) userDB.set(msg.id, {'in': false}); userDB.save();
				}
			});
			bot.client.on('a', msg => {
				if (!Object.keys(userDB.data).includes(msg.p._id) && msg.p._id !== bot.client.getOwnParticipant()._id) userDB.set(msg.p._id, {'in': false}); userDB.save();
				if (msg.a.toLowerCase() === '/opt-in') {
					if (!userDB.data[msg.p._id].in) {
						userDB.data[msg.p._id].in = true;
						userDB.save();
						sendChat('You\'ve opted in to background music in your channels. I\'ll visit you next time you hold the crown in a channel. See you around!');
					} else {
						sendChat('You\'ve already opted in to background music in your channels. Send /opt-out to chat to opt out.');
					}
				}
				if (msg.a.toLowerCase() === '/opt-out') {
					if (userDB.data[msg.p._id].in) {
						userDB.data[msg.p._id].in = false;
						userDB.save();
						sendChat('You\'ve opted out of background music in your channels. Thanks for trying it out!');
					} else {
						sendChat('You haven\'t opted in to background music in your channels yet. Send /opt-in to chat to opt in.');
					}
				}
				if (msg.a.toLowerCase() === '/test') {
					bot.fun.findChannel();
				}
			});
		}
	});

	bot.temp.mainInt = setInterval(() => {
		if (bot.client.channel) {
			if (!bot.temp.playingMIDI) {
				bot.temp.secondsSinceLastNote ++;
				if (bot.temp.secondsSinceLastNote >= 12 && bot.temp.playBackgroundMusic) bot.fun.playMIDI();
			}
			if (bot.client.channel.id !== bot.temp.desiredChannel) {
				bot.client.setChannel(bot.temp.desiredChannel);
				log.add(`${modulePrefix} [${bot.temp.instance}] In '${bot.client.channel.id}', attempting to move to '${bot.temp.desiredChannel}'`);
			}
		}
	}, 1000);

	bot.temp.secondaryInt = setInterval(() => {
		if (bot.client.channel.crown) {
			if (!Object.keys(userDB.data).includes(bot.client.channel.crown.userId) || !userDB.data[bot.client.channel.crown.userId].in) bot.fun.findChannel();
		}
	}, 10000);

	const conv = key => {
		return MPPKeys[convKeys.indexOf(key)] || key;
	}

	bot.temp.midiplayer = new midiPlayer.Player();
	bot.temp.midiplayer.on('midiEvent', async event => {
		for (let i = 0; i < bot.temp.midiEcho + 1; i++) {
			if (event.channel === 10) return;
			if (event.name === 'Set Tempo') {
				bot.temp.midiplayer.setTempo(event.data);
			}
			if (event.name === 'Note off' || (event.name === 'Note on' && event.velocity === 0)) {
				bot.client.stopNote(conv(event.noteName));
			} else if (event.name === 'Note on') {
				bot.client.startNote(conv(event.noteName), 1); //event.velocity / 100);
			}
			// await timer(10);
		}
	});

	bot.temp.midiplayer.on('endOfFile', () => {
		bot.fun.reset();
	});

	bot.fun.suffixOf=(f) => {let n=f%10,r=f%100;return 1==n&&11!=r?f+'st':2==n&&12!=r?f+'nd':3==n&&13!=r?f+'rd':f+'th'};
	bot.fun.getTimestamp=(e) => {let t=e||new Date;return`${t.getHours()%12||12}:${t.getMinutes()} ${t.getHours()>=12?'PM':'AM'} on the ${bot.fun.suffixOf(t.getDate())} of ${months[t.getMonth()-1]} ${t.getYear()+1900} (UTC+${t.getTimezoneOffset()/60})`};
	bot.fun.rando=(r) => {return Array.isArray(r)||(r=Array.from(arguments)),r[Math.floor(Math.random()*r.length)]}; // from Fishing
	bot.fun.reset = () => {
		bot.temp.playingMIDI = false;
		bot.temp.secondsSinceLastMIDI = 0;
		bot.temp.secondsSinceLastNote = 0;
		bot.temp.midiInterruptionCount = 0;
		bot.temp.midiEcho = 0;
		bot.temp.echoDelay = 10;
		bot.temp.midiplayer.stop();
	}
	bot.fun.playMIDI = () => {
		bot.fun.reset();
		bot.temp.playingMIDI = true;
		let files = [];
		fs.readdirSync(__dirname + '/midi').forEach(file => {
			if (file.toLowerCase().includes('.mid')) {
				files.push(file);
			}
		});
		let file = files[Math.floor(Math.random() * files.length)];
		log.add(`${modulePrefix} ${bot.temp.instance} ${bot.client.channel.id}: playing: '${file}'`);
		bot.temp.midiplayer.loadFile('./midi/' + file);
		bot.temp.midiplayer.play();
	}
	bot.fun.findChannel = () => {
		bot.client.sendArray([{'m': '+ls'}]);
		let channelNames = [];
		let channels = [];
		let handler = (ls) => {
			for (let i in ls.u) {
				channels.push(ls.u[i]);
				channelNames.push(ls.u[i]);
			}
		}
		bot.client.on('ls', handler);
		setTimeout(() => {
			bot.client.sendArray([{'m': '-ls'}]);
			bot.client.off('ls', handler);
			let eligibleChannels = [];
			for (let i = 0; i < channels.length; i++) {
				/* console.log(channels[i].id);
				console.log(channels.length); */
				if (!channels[i].settings.crownSolo && channels[i].crown && Object.keys(userDB.data).includes(channels[i].crown.userId)) {
					/* console.log(Object.keys(userDB.data).includes(channels[i].crown.userId));
					console.log(channels[i].crown.userId !== bot.client.getOwnParticipant()._id);
					console.log(channels[i].id !== bot.temp.desiredChannel);
					console.log(!channels[i].settings.crownSolo);
					console.log(!takenChannels.includes(channels[i].id)); */
					if (userDB.data[channels[i].crown.userId].in && channels[i].crown.userId !== bot.client.getOwnParticipant()._id && channels[i].id !== bot.temp.desiredChannel && !takenChannels.includes(channels[i].id)) eligibleChannels.push(channels[i].id);
				}
			}
			console.log(eligibleChannels);
			console.log(takenChannels);
			if (takenChannels.includes(bot.temp.desiredChannel)) takenChannels.splice(takenChannels.indexOf(bot.temp.desiredChannel), takenChannels.indexOf(bot.temp.desiredChannel));
			if (eligibleChannels.length > 0 && bot.temp.desiredChannel !== 'test/background') bot.temp.desiredChannel = bot.fun.rando(eligibleChannels); if (!takenChannels.includes(bot.temp.desiredChannel)) takenChannels.push(bot.temp.desiredChannel);
		}, 6000);
	}
	
}
const timer = ms => new Promise(res => setTimeout(res, ms));

async function join () {
	for (let i1 = 0; i1 < Object.keys(config.servers).length; i1++) {
		for (let i = 0; i < config.servers[Object.keys(config.servers)[i1]].length; i++) {
			let ch = config.servers[Object.keys(config.servers)[i1]][i];
			let ws = Object.keys(config.servers)[i1];
			newInstance(ch, ws);
			await timer(3000);
		}
	}
}

join();