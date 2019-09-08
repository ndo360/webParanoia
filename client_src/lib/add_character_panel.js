'use strict';
const Panel = require('./panel.js');
const character_templates = require('../../data/character_templates.json')

class AddCharacterPanel extends Panel {
    constructor(client) {
        super({ width: 400, height: 140, title: "Add Character" });
        this.client = client;
        this.content_obj.innerHTML = `
<div><select class='charsheet_list'><option value='all' selected>ALL</option></select></div>
<input type='button' class='confirm-button' value='Load'>
`;
        this.populate_list();
        this.return_val = null;
        this.$('.confirm-button').addEventListener("click", () => {
            this.send();
        });
    }

    populate_list() {
        for (let i = 0; i < character_templates.characters.length; i++) {
            let elem = document.createElement("option");
            elem.value = character_templates.characters[i].name;
            elem.textContent = elem.value; //TODO: Make this code suck less?
            this.$('.charsheet_list').appendChild(elem);
        }
    }

    send() {
        let character = this.$('.charsheet_list').value;
        if (character == 'all') //I'm sorry //TODO: Make this code suck less?
            for (let i = 0; i < character_templates.characters.length; i++) {
                let all_chars = character_templates.characters[i].name;
                this.client.socket.send(JSON.stringify({add_character: all_chars}));
            }
        else
            this.client.socket.send(JSON.stringify({add_character: character}));
    }
}

module.exports = AddCharacterPanel;