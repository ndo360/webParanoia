'use strict';

const char_colors = ["#EA7619", "#EAE819", "#9F90D0", "#5BB6D8", "#DBAE7C", "#82C860", "#E9EE97", "#F28EA8", "#EA7619", "#EA1919", "#71F991", "#EA7619", "#EAE819", "#9F90D0", "#5BB6D8", "#DBAE7C", "#82C860", "#E9EE97", "#F28EA8", "#EA7619", "#EA1919", "#71F991", "#EA7619", "#EAE819", "#9F90D0", "#5BB6D8", "#DBAE7C", "#82C860", "#E9EE97", "#F28EA8", "#EA7619", "#EA1919", "#71F991"];

let player_id_ctr = 0;

class Character {
	constructor(game, name = "A generic character") {
		this.game = game;
		game.characters.add(this);
		this.name = name;
		this.use_definite_article = false; // whether to use "the" as opposed to "a"
		this.id = ++player_id_ctr; // used for networking stuff

		this.name_class = "";
		this.name_style = `color:${char_colors[this.id % char_colors.length]}`;
		this.text_style = "";
		this.text_class = "";
		this.send_as_npc(this.game.gm);
	}

	send_as_npc(target) { // send but only if its an npc
		if(!target.socket)
			return;
		let obj = {
			add_npc: {
				id: this.id,
				name: this.get_formatted_name(),
				name_class: this.name_class,
				name_style: this.name_style
			}
		};
		target.socket.send(JSON.stringify(obj));
	}

	get_formatted_name() { // overriden in the player character subclass to have the FLUFF
		if(this.use_definite_article)
			return this.name.replace(/^(an? | |some )/i, "the "); // fancy regex to replace the thing
		return this.name;
	}

	speak(text) {
		let backtick_idx = text.indexOf('`');
		if(backtick_idx != -1) {
			this.game.send_pm(this, this.game.gm, text.substring(backtick_idx + 1));
			text = text.substring(0, backtick_idx);
		}
		if(!text.length)
			return;
		let inline_prefix = ""; // stuff that gets the character's color
		let inline_suffix = "";
		let outline_suffix = ""; // stuff that doesn't
		if(`“”"‘’'`.includes(text[0])) { // IC speech
			text = text.substring(1);
			if(text.length >= 1) {
				text = text[0].toUpperCase() + text.substring(1); // capitalize
			}
			let verb = "says";
			if(text.endsWith("!"))
				verb = "shouts";
			if(text.endsWith("!!"))
				verb = "screams";
			outline_suffix = ` ${verb}, “${text}”`;

		} else if(text[0] == `/` || text[0] == `*`) {
			text = text.substring(1);
			if(text.length >= 1) {
				text = text[0].toLowerCase() + text.substring(1); // de-capitalize
			}
			inline_prefix = "* ";
			inline_suffix = ` ${text} *`
		} else if(text[0] == `\\`) {
			text = text.substring(1);
			outline_suffix = ` . o O ( ${text} )`;
		} else {
			inline_suffix = ':';
			outline_suffix = " " + text;
		}
		this.game.broadcast`<span class='${this.text_class}' style='${this.text_style}'><span class='${this.name_class}' style='${this.name_style}'>${inline_prefix}<span data-pm=${this.id}>${this.get_formatted_name()}</span>${inline_suffix}</span>${outline_suffix}</span>`;
	}
}

module.exports = Character;
