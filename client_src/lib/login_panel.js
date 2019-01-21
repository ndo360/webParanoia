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
