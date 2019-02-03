'use strict';
const Panel = require('./panel.js');

class AdvancedSpoofPanel extends Panel {
	constructor(client) {
		super({width: 400, height: 140, title: "Advanced Spoofing"});
		this.client = client;
		this.content_obj.innerHTML = `
<div><select class='spoof_from'></select> -> <select class='spoof_to'><option value='' selected>ALL</option></select></div>
<input style='width:90%' type='text' class='prompt-value'></input>
<input type='button' class='confirm-button' value='Send'>
`;
		for(let playernum of Object.keys(client.player_names)) {
			if(playernum == "-1")
				continue;
			let player_name = client.player_names[playernum];
			let elema = document.createElement("option");
			elema.value = playernum;
			elema.textContent = player_name;
			let elemb = document.createElement("option");
			elemb.value = playernum;
			elemb.textContent = player_name;
			this.$('.spoof_from').appendChild(elema);
			this.$('.spoof_to').appendChild(elemb);
		}
		this.return_val = null;
		this.$('.confirm-button').addEventListener("click", () => {
			this.send();
		});
		this.$('.prompt-value').addEventListener("keydown", (e) => {
			if(e.which == 13) { // enter
				e.preventDefault();
				this.send();
			}
		});
		this.$('.prompt-value').focus();
	}

	send() {
		let text = this.$('.prompt-value').value;
		let from = this.$('.spoof_from').value;
		let to = this.$('.spoof_to').value;
		from = from == "" ? null : +from;
		to = to == "" ? null : +to;
		this.client.socket.send(JSON.stringify({spoof: {victim: from, pm_to: to, text: text}}));
		this.$('.prompt-value').value = "";
	}
}

module.exports = AdvancedSpoofPanel;
