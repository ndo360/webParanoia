function escape_html(str) {
	return str.replace(/[&<>"']/gi, (chr) => {
		if(chr == '&') return '&amp;';
		if(chr == '<') return '&lt;';
		if(chr == '>') return '&gt;';
		if(chr == '"') return '&quot;';
		if(chr == "'") return '&#039;';
	});
}

// a special function that works with the tagged template literal syntax
// use it like this:
// let str = format_html`<span class='warning'> The ${some_obj} explodes!</span>`
// the stuff in ${} is escaped
function format_html(strs, ...tags) {
	let out_str = '';
	for(let i = 0; i < strs.length; i++) {
		let pre_tag = strs[i];
		out_str += pre_tag;
		if(i < strs.length - 1)
			out_str += escape_html(""+tags[i]);
	}
	return out_str;
}

// sends something to one or more clients
function to_chat(a, ...b) {
	if(a instanceof Array && a.length && (typeof a[0] != "string")) { // handles to_chat([client1, client2], "some message")
		for(var item of a) {
			to_chat(item, ...b);
		}
	} else if(a instanceof Array) { // handles to_chat`<span class='warning'>The ${obj} explodes!</span>`(client)
		var formatted = module.exports.format_html(a, ...b);
		return (...items) => {
			to_chat(items, formatted);
		};
	} else { // handles to_chat(client, "some message")
		a.to_chat(b.join(""));
	}
}

module.exports = {escape_html, format_html, to_chat};
