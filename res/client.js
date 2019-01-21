(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{"./lib/character_sheet_panel.js":2,"./lib/login_panel.js":3,"./lib/prompt_panel.js":5}],2:[function(require,module,exports){
'use strict';
const Panel = require('./panel.js');

class CharacterSheetPanel extends Panel {
	constructor(client, edit_mode = true, playernum) {
		super({width: 540, height: 600, title:"Character Sheet"});
		this.client = client;
		this.playernum = playernum;
		this.content_obj.innerHTML =`
<div><input type='button' class='save-button' value = "Save and Send Sheet"></div>
<h1 class="charname">Gen-R-ICC-1</h1>
<div class='left-part'>
	<div class='margins'><b>Service Group: </b><span data-csfield="service_group"></span></div>
	<div class='margins'><b>Firm: </b><span data-csfield="firm"></span></div>
	<div class='margins'><b>Gender: </b><span data-csfield="gender"></span></div>
	<div class='margins'><b>Tics: </b><span data-csfield="tics" class='fullwidth'></span></div>
	<table class='margins'>
		<tr>
			<td><b>MBD: </b></td>
			<td><label><input type='checkbox' data-csfield="mbd1">Team Leader</label></td>
			<td><label><input type='checkbox' data-csfield="mbd3">Loyalty Officer</label></td>
			<td><label><input type='checkbox' data-csfield="mbd5">Hygiene Officer</label></td>
		</tr>
		<tr>
			<td></td>
			<td><label><input type='checkbox' data-csfield="mbd2">C&RO</label></td>
			<td><label><input type='checkbox' data-csfield="mbd4">Equipment Guy</label></td>
			<td><label><input type='checkbox' data-csfield="mbd6">Happiness Officer</label></td>
		</tr>
		<tr>
			<td></td>
			<td colspan=3><input type='checkbox' data-csfield="mbd_custom"><span data-csfield="mbd_custom_name"></span></td>
		</tr>
	</table>
</div>
`;
		for(let elem of this.$$('[data-csfield]')) {
			if(elem.tagName == "INPUT") {
				if(elem.type == "checkbox") {
					if(!edit_mode)
						elem.addEventListener("click", (e)=>{e.preventDefault(); return false;}); // prevent click events. The checkbox is nearly unreadable if it's grey, so doing this instead
				} else {
					elem.readonly = !edit_mode;
				}
			} else {
				elem.contentEditable = edit_mode;
			}
		}

		if(edit_mode) {
			this.$('.save-button').addEventListener("click", () => {
				let data = this.get_data();
				client.socket.send(JSON.stringify({update_character_sheet: {for: this.playernum, data}}));
				this.client.character_sheets[this.playernum] = data;
			});
		} else {
			this.$('.save-button').style.display = "none"; // ree get rid of that button
		}
	}

	update_name(name) {
		this.$('.charname').textContent = name;
	}
	update_data(data) {
		if(!data)
			return; // ooh it's blank.
		for(let elem of this.$$('[data-csfield]')) {
			let key = elem.dataset.csfield;
			if(elem.tagName == "INPUT") {
				if(elem.type == "checkbox") { //checkboxes use checked instead of value
					elem.checked = data[key];
				} else {
					elem.value = string_wrapper(data[key]);
				}
			} else {
				elem.innerHTML = string_wrapper(data[key]);
			}
		}
	}
	get_data() { // literally the same as update_data but the assignments are swapped.
		let data = {};
		for(let elem of this.$$('[data-csfield]')) {
			let key = elem.dataset.csfield;
			if(elem.tagName == "INPUT") {
				if(elem.type == "checkbox") {
					data[key] = elem.checked;
				} else {
					data[key] = elem.value;
				}
			} else {
				data[key] = elem.innerHTML;
			}
		}
		return data;
	}
}

function string_wrapper(obj) { // prevents things like "undefined" and "null" showing up.
	if(obj == null)
		return "";
	else
		return ""+obj;
}

module.exports = CharacterSheetPanel;

},{"./panel.js":4}],3:[function(require,module,exports){
'use strict';
const Panel = require('./panel.js');

class LoginPanel extends Panel {
	constructor(client) {
		super({width: 240, height: 288, title: "Login", can_close: false});
		this.client = client;
		this.content_obj.innerHTML = `
<form>
<div style='display:inline-block;text-align:left'>
	<div class='available_players'></div>
	<label><input type='radio' class='observe-checkbox' name='login-type' value='observe' checked>Observe</label>
</div><br></form>
<input type='password' class='password-field' placeholder="Password (default is 'asdf')" disabled><br>
<div style='color:red' class='login-fail-reason'></div>
<input type='button' class='login-button' value='Login'></input>
`;
		this.$('.login-button').addEventListener("click", () => {
			let selected_elem = this.$('input:checked');
			console.log(selected_elem);
			if(selected_elem.dataset.playernum) {
				let sel_player = +selected_elem.dataset.playernum;
				let password = this.$('.password-field').value;
				console.log("GO!");
				this.client.socket.send(JSON.stringify({password, sel_player, login: true}));
			}
		});
		this.content_obj.addEventListener("change", (e) => { // handle observed changes
			console.log(e);
			this.$('.password-field').disabled = this.$('.observe-checkbox').checked;
		});
		this.handle_message = this.handle_message.bind(this);
		this.client.socket.addEventListener("message", this.handle_message);
	}

	handle_message(e) {
		let obj = JSON.parse(e.data);
		if(obj.avail_players) {
			let curr_playernum = this.$(`.available_players input[checked]`);
			curr_playernum = curr_playernum && +curr_playernum.dataset.playernum; // get the currently selected player if theres a checked element
			this.$(`.available_players`).innerHTML = ""; // clear it.
			for(let [key, val] of Object.entries(obj.avail_players)) {
				let label = document.createElement("label");
				label.textContent = val;
				label.style.display = "block"; // so that they each are on different lines
				let radiobutton = document.createElement("input");
				radiobutton.type = "radio";
				radiobutton.dataset.playernum = key;
				radiobutton.name = "login-type";
				label.prepend(radiobutton); // add it before the text
				this.$(`.available_players`).appendChild(label);
				if(+key == curr_playernum) {
					radiobutton.checked = true;
					curr_playernum = null; // mark that we've resolved this and don't need to check the observe.
				}
			}
			if(curr_playernum) { // there was a player checked, but it's gone now, so go back to observe
				this.$(`.observe-checkbox`).checked = true;
			}
		}
		if(obj.login_fail) {
			this.$('.login-fail-reason').textContent = obj.login_fail;
		}
		if(obj.login_success) {
			this.close();
		}
	}

	close() {
		this.client.socket.removeEventListener("message", this.handle_message);
		super.close(...arguments);
	}
}

module.exports = LoginPanel;

},{"./panel.js":4}],4:[function(require,module,exports){
'use strict';

class Panel {
	constructor({width=400, height=400, title="", can_close = true} = {}) {
		var left = document.documentElement.clientWidth / 2 - width / 2;
		var top = document.documentElement.clientHeight / 2 - height / 2;
		this.container_obj = document.createElement('div');
		Object.assign(this.container_obj.style, {width:width+"px", height:height+"px", left:left+"px", top:top+"px"});
		this.container_obj.classList.add('uiframe-container');
		this.panel_obj = document.createElement('div');
		this.panel_obj.classList.add('uiframe');
		this.panel_obj.tabIndex = -1;
		this.header_obj = document.createElement('div');
		this.header_obj.classList.add('uiframe-header');
		this.title_node = document.createTextNode(title);
		this.header_obj.appendChild(this.title_node);
		this.content_obj = document.createElement('div');
		this.content_obj.classList.add('uiframe-content');
		this.panel_obj.appendChild(this.header_obj);
		this.panel_obj.appendChild(this.content_obj);
		this.container_obj.appendChild(this.panel_obj);
		document.getElementById('uiframes-container').appendChild(this.container_obj);

		this.header_obj.addEventListener("mousedown", this._start_drag.bind(this));
		this.container_obj.addEventListener("mousedown", this._start_resize.bind(this));
		this.container_obj.addEventListener("mousemove", this._container_mousemove.bind(this));
		this.container_obj.addEventListener("mouseout", this._container_mouseout.bind(this));

		this.can_close = can_close;

		if(can_close) {
			this.close_button = document.createElement('div');
			this.close_button.classList.add('uiframe-close-button');
			this.header_obj.appendChild(this.close_button);

			this.close_button.addEventListener("click", () => {
				this.close();
			});
			this.close_button.addEventListener("mousedown", (e) => {
				e.preventDefault();
			});
		}
	}

	_start_drag(e) {
		if(e.defaultPrevented)
			return;
		if(e.target != this.header_obj) {
			return;
		}
		var pad = (this.container_obj.offsetWidth - this.panel_obj.offsetWidth)/2;
		e.preventDefault();
		this.panel_obj.focus();
		var lastclientx = e.clientX;
		var lastclienty = e.clientY;
		var mousemove = (e) => {
			var dx = e.clientX - lastclientx;
			var dy = e.clientY - lastclienty;
			lastclientx = e.clientX;
			lastclienty = e.clientY;
			var {left:oldleft, top:oldtop} = this.container_obj.getBoundingClientRect();
			this.container_obj.style.left = Math.min(document.documentElement.clientWidth-160-pad, Math.max(-pad,oldleft + dx)) + "px";
			this.container_obj.style.top = Math.min(document.documentElement.clientHeight-35-pad, Math.max(-pad,oldtop + dy)) + "px";
		};
		var mouseup = () => {
			document.removeEventListener("mousemove", mousemove);
			document.removeEventListener("mouseup", mouseup);
		};
		document.addEventListener("mousemove", mousemove);
		document.addEventListener("mouseup", mouseup);
	}

	_resize_meta(e) { // figure out which edge the mouse cursor is on and return an object with the appropriate flags
		var pad = (this.container_obj.offsetWidth - this.panel_obj.offsetWidth)/2;
		var width = this.panel_obj.offsetWidth;
		var height = this.panel_obj.offsetHeight;
		var out = {drag_right: false, drag_left: false, drag_up: false, drag_down: false, cursor: "default"};
		if(e.target == this.container_obj) {
			if(e.offsetX < pad)
				out.drag_left = true;
			if(e.offsetY < pad)
				out.drag_up = true;
			if(e.offsetX > (width + pad))
				out.drag_right = true;
			if(e.offsetY > (height + pad))
				out.drag_down = true;
			if((out.drag_left && out.drag_down) || (out.drag_up && out.drag_right)) {
				out.cursor = "nesw-resize";
			} else if((out.drag_left && out.drag_up) || (out.drag_down && out.drag_right)) {
				out.cursor = "nwse-resize";
			} else if(out.drag_left || out.drag_right) {
				out.cursor = "ew-resize";
			} else if(out.drag_up || out.drag_down) {
				out.cursor = "ns-resize";
			}
		}
		out.can_resize = out.drag_right || out.drag_left || out.drag_up || out.drag_down;
		return out;
	}

	_start_resize(e) {
		// bring the panel to the front
		if(this.container_obj != document.getElementById('uiframes-container').lastChild)
			document.getElementById('uiframes-container').appendChild(this.container_obj);

		// figure out which edges we're resizing
		var resize_meta = this._resize_meta(e);
		if(!resize_meta.can_resize) // oof we're not resizing
			return;
		// figure out how much space is around the edges
		var pad = (this.container_obj.offsetWidth - this.panel_obj.offsetWidth)/2;
		e.preventDefault();
		this.panel_obj.focus();
		var lastclientx = e.clientX;
		var lastclienty = e.clientY;
		// now start dragging
		var mousemove = (e) => {
			var dx = e.clientX - lastclientx;
			var dy = e.clientY - lastclienty;
			lastclientx = e.clientX;
			lastclienty = e.clientY; // figure out how much we moved
			var {left:oldleft, top:oldtop} = this.container_obj.getBoundingClientRect();
			if(resize_meta.drag_left) { // and now resize ourselves
				this.container_obj.style.left = Math.min(document.documentElement.clientWidth-160-pad,Math.max(-pad,oldleft + dx)) + "px";
				this.container_obj.style.width = Math.max(160,this.panel_obj.clientWidth - dx) + "px";
			} else if(resize_meta.drag_right) {
				this.container_obj.style.width = Math.max(160,this.panel_obj.clientWidth + dx) + "px";
			}
			if(resize_meta.drag_up) {
				this.container_obj.style.top = Math.min(document.documentElement.clientHeight-35-pad,Math.max(-pad,oldtop + dy)) + "px";
				this.container_obj.style.height = Math.max(35,this.panel_obj.clientHeight - dy) + "px";
			} else if(resize_meta.drag_down) {
				this.container_obj.style.height = Math.max(35,this.panel_obj.clientHeight + dy) + "px";
			}
		};
		var mouseup = () => {
			document.removeEventListener("mousemove", mousemove);
			document.removeEventListener("mouseup", mouseup);
		};
		document.addEventListener("mousemove", mousemove);
		document.addEventListener("mouseup", mouseup);
	}

	_container_mousemove(e) {
		var resize_meta = this._resize_meta(e);
		this.container_obj.style.cursor = resize_meta.cursor;
	}
	_container_mouseout() {
		this.container_obj.style.cursor = "default";
	}

	get title() {
		return this.title_node.textContent;
	}

	set title(val) {
		this.title_node.textContent = val;
	}

	close() {
		document.getElementById('uiframes-container').removeChild(this.container_obj); // remove ourselves!
		if(this.close_promise_resolve)
			this.close_promise_resolve();
	}

	wait_until_close() {
		if(this.close_promise)
			return this.close_promise;
		return this.close_promise = new Promise(resolve => {
			this.close_promise_resolve = resolve;
		});
	}

	// convenience functions
	$(sel) {
		return this.content_obj.querySelector(sel);
	}
	$$(sel) {
		return this.content_obj.querySelectorAll(sel);
	}
}

module.exports = Panel;

},{}],5:[function(require,module,exports){
'use strict';
const Panel = require('./panel.js');

class PromptPanel extends Panel {
	constructor(title) {
		super({width: 400, height: 100, title});
		this.content_obj.innerHTML = `
<input style='width:90%' type='text' class='prompt-value'></input>
<input type='button' class='confirm-button' value='OK'>
`;
		this.return_val = null;
		this.$('.confirm-button').addEventListener("click", () => {
			this.return_val = this.$('.prompt-value').value;
			this.close();
		});
		this.$('.prompt-value').addEventListener("keydown", (e) => {
			if(e.which == 13) { // enter
				e.preventDefault();
				this.return_val = this.$('.prompt-value').value;
				this.close();
			}
		});
		this.$('.prompt-value').focus();
	}

	async value_promise() {
		await this.wait_until_close();
		return this.return_val;
	}
}

module.exports = PromptPanel;

},{"./panel.js":4}]},{},[1])

//# sourceMappingURL=client.js.map
