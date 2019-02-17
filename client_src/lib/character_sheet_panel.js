'use strict';
const Panel = require('./panel.js');

class CharacterSheetPanel extends Panel {
	constructor(client, edit_mode = true, playernum) {
		super({width: 655, height: 800, title:"Character Sheet"});
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
<table class='margins'>
	<tr><td colspan=3><h2>Action Skills</h2></td></tr>
	<tr>
		<td>
			<div class='skill-header'>Management<span data-csfield="skill-mgmt"></span></div>
			<table class='skill-entry'>
				<tr>
					<td class='right-part'>Bootlicking</td>
					<td data-csfield="skill-bootlicking"></td>
				</tr>
				<tr>
					<td class='right-part'>Chutzpah</td>
					<td data-csfield="skill-chutzpah"></td>
				</tr>
				<tr>
					<td class='right-part'>Con Games</td>
					<td data-csfield="skill-congames"></td>
				</tr>
				<tr>
					<td class='right-part'>Hygiene</td>
					<td data-csfield="skill-hygiene"></td>
				</tr>
				<tr>
					<td class='right-part'>Interrogation</td>
					<td data-csfield="skill-interrogation"></td>
				</tr>
				<tr>
					<td class='right-part'>Intimidation</td>
					<td data-csfield="skill-intimidation"></td>
				</tr>
				<tr>
					<td class='right-part'>Moxie</td>
					<td data-csfield="skill-moxie"></td>
				</tr>
				<tr>
					<td class='right-part'>Oratory</td>
					<td data-csfield="skill-oratory"></td>
				</tr>
				<tr>
					<td class='right-part' data-csfield="skill-mgmt-cn1"></td>
					<td data-csfield="skill-mgmt-cv1"></td>
				</tr>
				<tr>
					<td class='right-part' data-csfield="skill-mgmt-cn2"></td>
					<td data-csfield="skill-mgmt-cv2"></td>
				</tr>
				<tr>
					<td class='right-part' data-csfield="skill-mgmt-cn3"></td>
					<td data-csfield="skill-mgmt-cv3"></td>
				</tr>
				<tr>
					<td class='right-part' data-csfield="skill-mgmt-cn4"></td>
					<td data-csfield="skill-mgmt-cv4"></td>
				</tr>
			</table>
		</td>
		<td>
			<div class='skill-header'>Stealth<span data-csfield="skill-stealth"></div>
			<table class='skill-entry'>
				<tr>
					<td class='right-part'>Concealment</td>
					<td data-csfield="skill-concealment"></td>
				</tr>
				<tr>
					<td class='right-part'>Disguise</td>
					<td data-csfield="skill-disguise"></td>
				</tr>
				<tr>
					<td class='right-part'>High Alert</td>
					<td data-csfield="skill-highalert"></td>
				</tr>
				<tr>
					<td class='right-part'>Security Systems</td>
					<td data-csfield="skill-securitysystems"></td>
				</tr>
				<tr>
					<td class='right-part'>Shadowing</td>
					<td data-csfield="skill-shadowing"></td>
				</tr>
				<tr>
					<td class='right-part'>Sleight of Hand</td>
					<td data-csfield="skill-sleightofhand"></td>
				</tr>
				<tr>
					<td class='right-part'>Sneaking</td>
					<td data-csfield="skill-sneaking"></td>
				</tr>
				<tr>
					<td class='right-part'>Surveillance</td>
					<td data-csfield="skill-surveillance"></td>
				</tr>
				<tr>
					<td class='right-part' data-csfield="skill-stealth-cn1"></td>
					<td data-csfield="skill-stealth-cv1"></td>
				</tr>
				<tr>
					<td class='right-part' data-csfield="skill-stealth-cn2"></td>
					<td data-csfield="skill-stealth-cv2"></td>
				</tr>
				<tr>
					<td class='right-part' data-csfield="skill-stealth-cn3"></td>
					<td data-csfield="skill-stealth-cv3"></td>
				</tr>
				<tr>
					<td class='right-part' data-csfield="skill-stealth-cn4"></td>
					<td data-csfield="skill-stealth-cv4"></td>
				</tr>
			</table>
		</td>
		<td>
			<div class='skill-header'>Violence<span data-csfield="skill-violence"></div>
			<table class='skill-entry'>
				<tr>
					<td class='right-part'>Agility</td>
					<td data-csfield="skill-agility"></td>
				</tr>
				<tr>
					<td class='right-part'>Energy Weapons</td>
					<td data-csfield="skill-energyweps"></td>
				</tr>
				<tr>
					<td class='right-part'>Demolition</td>
					<td data-csfield="skill-demolition"></td>
				</tr>
				<tr>
					<td class='right-part'>Field Weapons</td>
					<td data-csfield="skill-fieldweps"></td>
				</tr>
				<tr>
					<td class='right-part'>Fine Manipulation</td>
					<td data-csfield="skill-finemanip"></td>
				</tr>
				<tr>
					<td class='right-part'>Hand Weapons</td>
					<td data-csfield="skill-handweps"></td>
				</tr>
				<tr>
					<td class='right-part'>Projectile Weapons</td>
					<td data-csfield="skill-projweps"></td>
				</tr>
				<tr>
					<td class='right-part'>Thrown Weapons</td>
					<td data-csfield="skill-thrownweps"></td>
				</tr>
				<tr>
					<td class='right-part'>Unarmed Combat</td>
					<td data-csfield="skill-unarmedcombat"></td>
				</tr>
				<tr>
					<td class='right-part'>Vehicular Combat</td>
					<td data-csfield="skill-vehicularcombat"></td>
				</tr>
				<tr>
					<td class='right-part' data-csfield="skill-violence-cn1"></td>
					<td data-csfield="skill-violence-cv1"></td>
				</tr>
				<tr>
					<td class='right-part' data-csfield="skill-violence-cn2"></td>
					<td data-csfield="skill-violence-cv2"></td>
				</tr>
			</table>
		</td>
	</tr>
	<tr><td colspan=3><h2>Knowledge Skills</h2></td></tr>
	<tr>
		<td>
			<div class='skill-header'>Hardware<span data-csfield="skill-hardware"></span></div>
			<table class='skill-entry'>
				<tr>
					<td class='right-part'>Bot Ops & Maint</td>
					<td data-csfield="skill-botmaint"></td>
				</tr>
				<tr>
					<td class='right-part'>Chemical Eng.</td>
					<td data-csfield="skill-chemeng"></td>
				</tr>
				<tr>
					<td class='right-part'>Electonic Eng.</td>
					<td data-csfield="skill-electreng"></td>
				</tr>
				<tr>
					<td class='right-part'>Habitat Eng.</td>
					<td data-csfield="skill-habeng"></td>
				</tr>
				<tr>
					<td class='right-part'>Mechanical Eng.</td>
					<td data-csfield="skill-mecheng"></td>
				</tr>
				<tr>
					<td class='right-part'>Nuclear Eng.</td>
					<td data-csfield="skill-nukeeng"></td>
				</tr>
				<tr>
					<td class='right-part'>Vehicle Ops & Maint.</td>
					<td data-csfield="skill-vehiclemaint"></td>
				</tr>
				<tr>
					<td class='right-part'>Weapon & Armor Maint.</td>
					<td data-csfield="skill-weaponmaint"></td>
				</tr>
				<tr>
					<td class='right-part' data-csfield="skill-hardware-cn1"></td>
					<td data-csfield="skill-hardware-cv1"></td>
				</tr>
				<tr>
					<td class='right-part' data-csfield="skill-hardware-cn2"></td>
					<td data-csfield="skill-hardware-cv2"></td>
				</tr>
				<tr>
					<td class='right-part' data-csfield="skill-hardware-cn3"></td>
					<td data-csfield="skill-hardware-cv3"></td>
				</tr>
				<tr>
					<td class='right-part' data-csfield="skill-hardware-cn4"></td>
					<td data-csfield="skill-hardware-cv4"></td>
				</tr>
			</table>
		</td>
		<td>
			<div class='skill-header'>Software<span data-csfield="skill-software"></span></div>
			<table class='skill-entry'>
				<tr>
					<td class='right-part'>Bot Programming</td>
					<td data-csfield="skill-botcode"></td>
				</tr>
				<tr>
					<td class='right-part'>C-Bay</td>
					<td data-csfield="skill-cbay"></td>
				</tr>
				<tr>
					<td class='right-part'>Data Analysis</td>
					<td data-csfield="skill-dataanalysis"></td>
				</tr>
				<tr>
					<td class='right-part'>Data Search</td>
					<td data-csfield="skill-datasearch"></td>
				</tr>
				<tr>
					<td class='right-part'>Financial Systems</td>
					<td data-csfield="skill-financialsystems"></td>
				</tr>
				<tr>
					<td class='right-part'>Hacking</td>
					<td data-csfield="skill-hacking"></td>
				</tr>
				<tr>
					<td class='right-part'>Operating Systems</td>
					<td data-csfield="skill-oses"></td>
				</tr>
				<tr>
					<td class='right-part'>Vehicle Programming</td>
					<td data-csfield="skill-vehiclecode"></td>
				</tr>
				<tr>
					<td class='right-part' data-csfield="skill-software-cn1"></td>
					<td data-csfield="skill-software-cv1"></td>
				</tr>
				<tr>
					<td class='right-part' data-csfield="skill-software-cn2"></td>
					<td data-csfield="skill-software-cv2"></td>
				</tr>
				<tr>
					<td class='right-part' data-csfield="skill-software-cn3"></td>
					<td data-csfield="skill-software-cv3"></td>
				</tr>
				<tr>
					<td class='right-part' data-csfield="skill-software-cn4"></td>
					<td data-csfield="skill-software-cv4"></td>
				</tr>
			</table>
		</td>
		<td>
			<div class='skill-header'>Wetware<span data-csfield="skill-wetware"></span></div>
			<table class='skill-entry'>
				<tr>
					<td class='right-part'>Biosciences</td>
					<td data-csfield="skill-biosciences"></td>
				</tr>
				<tr>
					<td class='right-part'>Bioweapons</td>
					<td data-csfield="skill-bioweps"></td>
				</tr>
				<tr>
					<td class='right-part'>Cloning</td>
					<td data-csfield="skill-cloning"></td>
				</tr>
				<tr>
					<td class='right-part'>Medical</td>
					<td data-csfield="skill-medical"></td>
				</tr>
				<tr>
					<td class='right-part'>Outdoor Life</td>
					<td data-csfield="skill-outdoorlife"></td>
				</tr>
				<tr>
					<td class='right-part'>Pharmatherapy</td>
					<td data-csfield="skill-pharmatherapy"></td>
				</tr>
				<tr>
					<td class='right-part'>Psychotherapy</td>
					<td data-csfield="skill-psychotherapy"></td>
				</tr>
				<tr>
					<td class='right-part'>Suggestion</td>
					<td data-csfield="skill-suggestion"></td>
				</tr>
				<tr>
					<td class='right-part' data-csfield="skill-wetware-cn1"></td>
					<td data-csfield="skill-wetware-cv1"></td>
				</tr>
				<tr>
					<td class='right-part' data-csfield="skill-wetware-cn2"></td>
					<td data-csfield="skill-wetware-cv2"></td>
				</tr>
				<tr>
					<td class='right-part' data-csfield="skill-wetware-cn3"></td>
					<td data-csfield="skill-wetware-cv3"></td>
				</tr>
				<tr>
					<td class='right-part' data-csfield="skill-wetware-cn4"></td>
					<td data-csfield="skill-wetware-cv4"></td>
				</tr>
			</td>
		</table>
	</tr>
</table>
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
