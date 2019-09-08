'use strict';
const Player = require('./player.js');
const GM = require('./gm.js');
const Character = require('./character.js');

class Game {
	constructor() {
		this.gm_token = Math.floor(Math.random() * 1e10);
		this.characters = new Set(); // includes player characters and npcs
		this.players = new Set(); // includes player characters.
		this.users = new Set(); // includes player characters, dm, and observers.
		this.frozen = false; // prevents anyone from sending messages at all
		new GM(this);

		let computer = new Character(this, "The Computer");
		computer.name_style = "";
		computer.text_class = "computer"
	}

	create_character(char) {
		new Player(this, char)
	}

	get_character(num) {
		for(let character of this.characters) {
			if(character.id == num)
				return character;
		}
	}

	broadcast(...args) {
		for(let user of this.users) {
			user.to_chat(...args); // straight pass the arguments over.
		}
	}

	send_pm(from, to, text) {
		if(from != to && from.to_chat) { // we only send to the sender if the sender isn't also the receiver
			from.to_chat`PM to-<span class='${to.name_class}' style='${to.name_style}' data-pm=${to.id}>${to.get_formatted_name()}:</span> ${text}`;
		}
		if(from != this.gm && to != this.gm) { // we only send to the GM if the GM isnt the sender or receiver
			this.gm.to_chat`<span class='${from.name_class}' style='${from.name_style}' data-pm=${from.id}>${from.get_formatted_name()}</span>-&gt;<span class='${to.name_class}' style='${to.name_style}' data-pm=${to.id}>${to.get_formatted_name()}:</span> ${text}`;
		}
		if(to.to_chat) // send to the receiver
			to.to_chat`<span class='${from.text_class}' style='${from.text_style}'>PM from-<span class='${from.name_class}' style='${from.name_style}' data-pm=${from.id}>${from.get_formatted_name()}:</span> ${text}</span>`;
	}
}

module.exports = Game;
