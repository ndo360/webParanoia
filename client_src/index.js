'use strict';

const LoginPanel = require('./lib/login_panel.js');
const PromptPanel = require('./lib/prompt_panel.js');
const CharacterSheetPanel = require('./lib/character_sheet_panel.js');

class Client {
	constructor() {
		let wsurl = "ws" + window.location.href.substring(4); // replaces the "http" with "ws" (and also does "https" -> "wss" as well)
		this.socket = new WebSocket(wsurl); // open a connection
		this.socket.addEventListener('message', this.handle_message.bind(this));

		this.chat_window = document.getElementById("chatwindow");
		document.getElementById("main-text-input").addEventListener("keydown", this.text_input_keydown.bind(this));
		document.body.addEventListener("click", this.handle_click.bind(this));
		document.body.addEventListener("change", this.handle_change.bind(this));
		this.player_names = {"-1": "GM"};

		this.character_sheet = {};
		this.character_sheets = {}; // GM only - the one above is the player's char sheet and this one and the one below are the GM's char sheets.
		this.char_sheet_panels = {};
	}

	handle_message(e) {
		let obj = JSON.parse(e.data);
		console.log(obj);
		if(obj.show_login_panel) {
			new LoginPanel(this);
		}
		if(obj.be_gm) {
			document.body.classList.add("is-gm"); // basically you can stick various classes on elements to make them only visible if youre a gm.
		}
		if(obj.frozen != null) { // only gm gets this.
			document.getElementById("frozen-checkbox").checked = obj.frozen;
		}
		if(obj.add_player) {
			let po = obj.add_player;
			this.player_names[po.id] = po.name;
			let elem = document.createElement("div");
			elem.classList.add("player-entry");
			elem.dataset.playernum = po.id;
			elem.innerHTML = `
<div style='text-align:center;${po.name_style}' class='player-name ${po.name_class}'></div>
<div class='gm-only' style='font-size:12px;font-style:italic;text-align:center'>Player</div>
<div>
	<input type='button' class='pm-button' value='PM'>
	<input type='button' class='edit-char-button gm-only' value='Edit Character Sheet'>
	<input type='button' class='spoof-button gm-only' value='Spoof'>
	<label class='gm-only'><input type='checkbox' class='mute-checkbox'>Mute</label>
</div>
`;
			elem.querySelector('.player-name').textContent = po.name;
			document.getElementById("playerslist").appendChild(elem);
		}
		if(obj.add_npc) {
			let po = obj.add_npc;
			this.player_names[po.id] = po.name;
			let elem = document.createElement("div");
			elem.classList.add("player-entry");
			elem.dataset.playernum = po.id;
			elem.innerHTML = `
<div style='text-align:center;${po.name_style}' class='player-name ${po.name_class}'></div>
<div style='font-size:12px;font-style:italic;text-align:center'>NPC</div>
<div>
	<input type='button' class='spoof-button gm-only' value='Spoof'>
</div>
`;
			elem.querySelector('.player-name').textContent = po.name;
			document.getElementById("npcslist").appendChild(elem);
		}
		if(obj.to_chat) {
			let items = obj.to_chat;
			if(!(items instanceof Array))
				items = [items];
			this.modify_chat(() => {
				for(let item of items) {
					// wrap them in divs and toss them at the end of the chat window`
					let newdiv = document.createElement('div');
					newdiv.innerHTML = item;
					this.chat_window.appendChild(newdiv);
				}
			});
		}
		if(obj.playernum) {
			// sets our playernum so we can retrieve our name
			this.playernum = obj.playernum;
		}
		if(obj.character_sheet) {
			this.character_sheet = obj.character_sheet;
			if(this.character_sheet_panel)
				this.character_sheet_panel.update_data(this.character_sheet);
		}
		if(obj.character_sheets) {
			Object.assign(this.character_sheets, obj.character_sheets);
			// no need to update anything, there's no panels open since this is only sent on login
			// and only the GM can change the character sheets.
		}
	}

	handle_click(e) {
		let input = e.target.closest("input");
		let playernum_elem = e.target.closest("[data-playernum]");
		let playernum = playernum_elem ? playernum_elem.dataset.playernum : null;
		if(input) {
			if(input.dataset.dice) {
				let maxval = +input.dataset.dice;
				document.getElementById("dice-output").value = Math.floor(Math.random()*maxval) + 1;
			}
			if(input.classList.contains("pm-button") && playernum) {
				new PromptPanel(`PM to ${this.player_names[playernum]}`).value_promise().then((val) => {
					if(!val)
						return;
					this.socket.send(JSON.stringify({pm: {to: playernum, text: val}}));
				});
			}
			if(input.classList.contains("spoof-button") && playernum) {
				new PromptPanel(`Spoofing ${this.player_names[playernum]}`).value_promise().then((val) => {
					if(!val)
						return;
					this.socket.send(JSON.stringify({spoof: {victim: playernum, text: val}}));
				});
			}
			if(input.classList.contains("char-sheet-button") && !this.char_sheet_panel) {
				this.char_sheet_panel = new CharacterSheetPanel(this, false);
				this.char_sheet_panel.update_data(this.character_sheet);
				this.char_sheet_panel.update_name(this.player_names[this.playernum]);
				this.char_sheet_panel.wait_until_close().then(() => {
					this.char_sheet_panel = null;
				});
			}
			if(input.classList.contains("edit-char-button") && playernum && !this.char_sheet_panels[playernum]) {
				this.char_sheet_panels[playernum] = new CharacterSheetPanel(this, true, playernum);
				this.char_sheet_panels[playernum].update_data(this.character_sheets[playernum]);
				this.char_sheet_panels[playernum].update_name(this.player_names[playernum]);
				this.char_sheet_panels[playernum].wait_until_close().then(() => {
					this.char_sheet_panels[playernum] = null;
				});
			}
		}
		let pm_link = e.target.closest("[data-pm]");
		if(pm_link) {
			new PromptPanel(`PM reply`).value_promise().then((val) => {
				if(!val)
					return;
				this.socket.send(JSON.stringify({pm: {to: pm_link.dataset.pm, text: val}}));
			});
		}
	}
	handle_change(e) {
		let input = e.target.closest("input");
		let playernum_elem = e.target.closest("[data-playernum]");
		let playernum = playernum_elem ? playernum_elem.dataset.playernum : null;
		if(input) {
			if(input.id == "frozen-checkbox") {
				this.socket.send(JSON.stringify({frozen: !!input.checked}));
			}
			if(input.classList.contains("mute-checkbox") && playernum) {
				if(input.checked)
					this.socket.send(JSON.stringify({mute_player: playernum}));
				else
					this.socket.send(JSON.stringify({unmute_player: playernum}));
			}
		}
	}

	text_input_keydown(e) {
		let text_input = document.getElementById("main-text-input");
		if(e.which == 13) { // enter
			let text = text_input.value;
			text_input.value = "";
			this.socket.send(JSON.stringify({chat: text}));
			e.preventDefault();
		}
	}

	modify_chat(callback) { // wrap your chat modifications with this function so that the scroll gets updated properly
		let do_scroll = false;
		if(Math.ceil(this.chat_window.scrollTop + this.chat_window.clientHeight) >= Math.floor(this.chat_window.scrollHeight)) // check if the thing is scrolled all the way down
			do_scroll = true; // makes it keep itself scrolled down
		callback(); // now the chat window gets modified
		// and now we scroll all the way down if it was that way before
		if(do_scroll)
			this.chat_window.scrollTop = this.chat_window.scrollHeight - this.chat_window.clientHeight;
	}
}

window.addEventListener("DOMContentLoaded", () => {
	// alrighty let's connect
	window.client = new Client();
});
