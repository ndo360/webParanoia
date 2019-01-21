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
