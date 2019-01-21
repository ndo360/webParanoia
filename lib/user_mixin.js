const _ = require('underscore');
const {to_chat} = require('./utils.js');

module.exports = function user_mixin() {
	this.game.users.add(this);
	this.socket = null; // the current websocket
	this.chat_history = [];

	this.login = _.wrap(this.login, function login(prev) {
		// replay their chat history if they have any
		this.socket.send(JSON.stringify({to_chat: this.chat_history}));
		prev.call(this); // do the original logic
		for(let player of this.game.players) { // send the panel on the right with all the players
			player.send_as_player(this);
		}
	});

	this.to_chat = function(a, ...b) {
		if(typeof a != "string") { // handles if you treat this like tagged template literal
			// format it
			return to_chat(a, ...b)(this); // sends the template literal over and they'll call this function again with an actual string.
		}
		// now to send it
		if(this.socket)
			this.socket.send(JSON.stringify({to_chat: a}));
		this.chat_history.push(a); // save the message
	};

	this.handle_message = _.wrap(this.handle_message, function handle_message(prev, obj) {
		prev.call(this, obj);
		if(obj.chat) {
			if(this.can_speak()) {
				this.speak(obj.chat)
			}
		}
		if(obj.pm && obj.pm.text) {
			if(obj.pm.to == -1) {
				if(!this.game.frozen) {
					this.game.send_pm(this, this.game.gm, obj.pm.text);
				} else {
					this.to_chat`<span class='gray'>The game is frozen!</span>`;
				}
			} else {
				let target = this.game.get_character(obj.pm.to);
				if(target && this.can_speak()) {
					this.game.send_pm(this, target, obj.pm.text);
				}
			}
		}
	});
}
