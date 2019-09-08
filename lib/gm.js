'use strict';
const user_mixin = require('./user_mixin.js');
const _ = require('underscore');

class GM {
	constructor(game) {
		this.game = game;
		game.gm = this;
		user_mixin.call(this);
		this.id = -1;
		this.name_class = "gmText";
		this.name_style = "";
		this.text_style = "";
		this.text_class = "";
	}

	can_speak() {
		return true; // the GM can always speak
	}
	speak(text) {
		if (text[0] == "#") {
			text = text.substring(1);
			let computer = this.game.get_character(this.game.computer_id);
			computer.speak(text);
		}
		else {
			this.game.broadcast`<span class='gmText' data-pm="-1">GM:</span> <b>${text}</b>`;
		}
		
	}
	get_formatted_name() {
		return "GM";
	}

	handle_message(obj) {
		if(obj.frozen != null && this.game.frozen != obj.frozen) {
			this.game.frozen = !!obj.frozen;
			this.game.broadcast`<span class='gray'>The GM has ${this.game.frozen ? "frozen" : "unfrozen"} the game</span>`;
		}
		if(obj.mute_player) {
			let player = this.game.get_character(obj.mute_player);
			if(player && !player.muted) {
				player.muted = true;
				player.to_chat`<span class='gray'>The GM has muted you!</span>`;
			}
		}
		if(obj.unmute_player) {
			let player = this.game.get_character(obj.unmute_player);
			if(player && player.muted) {
				player.muted = false;
				player.to_chat`<span class='gray'>The GM has unmuted you.</span>`;
			}
		}
		if(obj.spoof) {
			let victim = this.game.get_character(obj.spoof.victim);
			let pm_to = this.game.get_character(obj.spoof.pm_to);
			if(victim) {
				if(pm_to)
					this.game.send_pm(victim, pm_to, obj.spoof.text);
				else
					victim.speak(obj.spoof.text);
			}
		}
		if(obj.update_character_sheet) {
			let victim = this.game.get_character(obj.update_character_sheet.for);
			let new_sheet = obj.update_character_sheet.data;
			if(victim) {
				if(victim.socket)
					victim.socket.send(JSON.stringify({character_sheet: new_sheet}));
				victim.character_sheet = new_sheet;
				victim.to_chat`<span class='gray'>Your character sheet has been updated!</span>`;
			}
		}
		if(obj.add_character) {
			let new_char = obj.add_character;
			this.game.create_character(new_char);
		}
	}
	login() {
		let character_sheets = {};
		for(let player of this.game.players) {
			character_sheets[player.id] = player.character_sheet
		}
		this.socket.send(JSON.stringify({
			be_gm: true,
			frozen: this.game.frozen,
			character_sheets
		}));
		for(let npc of this.game.characters) {
			npc.send_as_npc(this);
		}
	}
	logout() {
		this.game.broadcast`<span class='gray'>The GM has lost connection - the game is now frozen.</span>`;
		this.game.frozen = true;
	}
}

module.exports = GM;
