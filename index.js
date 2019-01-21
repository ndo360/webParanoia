'use strict';
const http = require('http');
const serveStatic = require('serve-static');
const finalhandler = require('finalhandler');
const WebSocket = require('ws');
const querystring = require('querystring');
const url = require('url');

const Game = require('./lib/game.js');

let the_game = new Game(); // the one game instance. I suppose this could be expanded to allow multiple games on one server (and multiple GMs).
global.the_game = the_game;

let serve = serveStatic('./res', {'index': ['index.html']});

function http_handler(req, res) {
	let done = finalhandler(req, res); // basically a shitty error handler
	serve(req, res, done); // serve the files
}
let http_server = http.createServer(http_handler);
http_server.listen(11778);

let wss = new WebSocket.Server({server: http_server});
wss.on('connection', (ws, req) => {
	ws.on('error', err => {
		console.error(err);
	});
	let player = null;
	let game = the_game;
	// parse the URL

	let url_obj = url.parse(req.url, true);
	if(url_obj.query.gm) {
		// they're a GM! Time to apply the thing to them
		if(url_obj.query.gm != game.gm_token) {
			ws.send(JSON.stringify({to_chat: "<span style='color:red'>The GM token provided in the URL is invalid! Make sure to use the URL provided when starting the server</span>"}));
			ws.terminate();
			return;
		}
		if(game.gm.socket) {
			ws.send(JSON.stringify({to_chat: "<span style='color:red'>There is already a GM logged in.</span>"}));
			ws.terminate();
			return;
		}
		player = game.gm;
		player.socket = ws;
		player.login();

	} else {
		ws.send(JSON.stringify({show_login_panel: true}));
		// send the list of available players to them so they can choose
		let avail_players = {};
		for(let player of game.players) {
			if(player.socket)
				continue;
			avail_players[player.id] = player.get_formatted_name();
		}
		ws.send(JSON.stringify({avail_players}));
	}


	// handle messages
	ws.on('message', msg => {
		try {
			let obj = JSON.parse(msg);
			console.log(obj);
			if(player) {
				player.handle_message(obj);
			} else {
				// they're not logged in yet! let's do something about that
				if(obj.login) {
					for(let candidate of game.players) {
						if(candidate.id != obj.sel_player) // check if it's the one we want
							continue;
						// now check the password with the shittiest password authentication scheme ever! Remember, this is a game, not your bank account.
						if(candidate.password != obj.password) {
							ws.send(JSON.stringify({login_fail: "Your password is incorrect!"}));
							break;
						}
						if(candidate.socket) {
							ws.send(JSON.stringify({login_fail: "This character is already taken!"}));
							break;
						}
						player = candidate;
					}
					if(player) {
						ws.send(JSON.stringify({login_success: true}));
						player.socket = ws;
						player.login();
					}
				}
			}
		} catch (e) {
			console.error(e);
		}
	});
	ws.on("close", msg => {
		if(player) {
			player.socket = null;
			player.logout();
		}
	});
});

let gm_url = `http://localhost:11778/?gm=${the_game.gm_token}`
console.log(`Server started! Navigate to ${gm_url} to login as the GM.`);
let browse_command = (process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open');
require('child_process').exec(browse_command + ' ' + gm_url);
