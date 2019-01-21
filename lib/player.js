'use strict';
const Character = require('./character.js');
const GM = require('./gm.js');
const {to_chat} = require('./utils.js');
const user_mixin = require('./user_mixin.js');

class Player extends Character {
	constructor(game, name) {
		super(game);
		game.players.add(this);
		// split the name into pieces
		let split = name.split("-");
		this.name = split[0];
		this.clearance = split[1];
		this.sector = split[2];
		this.clone_number = +split[3]; // cast it to a number;

		this.character_sheet = {}; // a blank character sheet
		this.password = "asdf";
		this.muted = false; // prevents them from any form of communication except for with the GM
		user_mixin.call(this); // adds to_chat, handle_message, etc
		for(let user of this.game.users) {
			this.send_as_player(user);
		}
	}

	send_as_npc() {} // makes the function do nothing

	send_as_player(target) {
		if(!target.socket)
			return;
		let obj = {
			add_player: {
				id: this.id,
				name: this.get_formatted_name(),
				name_class: this.name_class,
				name_style: this.name_style
			}
		}
		if(target instanceof GM) {
			obj.add_player.muted = this.muted;
		}
		target.socket.send(JSON.stringify(obj));
	}

	get_formatted_name() {
		return `${this.name}-${this.clearance}-${this.sector}-${this.clone_number}`;
	}

	can_speak() {
		if(this.to_chat) {
			if(this.muted)
				this.to_chat`<span class='gray'>You are muted!</span>`;
			if(this.game.frozen)
				this.to_chat`<span class='gray'>The game is frozen!</span>`;
		}
		return !this.muted && !this.game.frozen;
	}

	handle_message(obj) {

	}
	login() {
		this.game.broadcast`<span class='gray'>--- ${this.get_formatted_name()} has joined ---</span>`;
		this.socket.send(JSON.stringify({playernum: this.id, character_sheet: this.character_sheet}));
	}
	logout() {}
}

module.exports = Player;
