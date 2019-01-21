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
