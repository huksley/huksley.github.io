if (!window.console || !window.console.log) {
	window.console = {};
	console.log = function (s) {
		// no-op
	};
}

if (!window.localStorage) {
	window.localStorage = {};
	localStorage.getItem = function (n) {
		// no-op
		return null;
	};

	localStorage.setItem = function (n, v) {
		// no-op
		return null;
	};
}
                            
// Read configuration for site
var config = {
	// gaTracking, location
};
// Content for site
var content = [];

$.get("http://api.wzdev.ru/grf.js", function(json, xhr) {
	console.log("Got content", json);
	window.content = json;
	for (var i = 0; i < json.length; i++) {
		window.config[json[i].name] = json[i].value;
	}
	$.event.trigger("site:config");
});

$(document).on("site:config", function () {
	console.log("Config " + config.gaTracking + ", " + config.location);
});

$(document).on("site:config", function () {
	if (config.gaTracking) {
		console.log("Sending event to Google Analytics " + config.gaTracking);

		var _gaq = _gaq || [];
		_gaq.push([ '_setAccount', config.gaTracking ]);
		_gaq.push([ '_trackPageview' ]);

		window.setTimeout(function() {
			var ga = document.createElement('script');
			ga.type = 'text/javascript';
			ga.async = true;
			ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
			var s = document.getElementsByTagName('script')[0];
			console.log("Got script: " + s);
			s.parentNode.insertBefore(ga, s);
		}, 10);
	}

	document.title = config.SiteTitle;
	$.event.trigger("site:content");
});

$(document).on("site:content", function () {
	for (var i = 0; i < content.length; i++) {
		var name = content[i].name;
		var value = content[i].value;
		var id = name;
		var el = document.getElementById(id);
		if (el) {
			console.log("Replacing " + id + " => \"" + value + "\"");
			el.innerHTML = value;
		} else {
			console.log("Can`t find: " + id);
		}

		var lel = document.getElementById(id + "-href");
		if (lel) {
			$(lel).attr("href", value);
		}
	}
});

// Using click stored language
var lang = localStorage.getItem("lang");
console.log("Language from default storage: " + lang);

// Using from navigator
if (!lang) {
	// http://stackoverflow.com/questions/1043339/javascript-for-detecting-browser-language-preference
	lang = navigator.languages ? navigator.languages[0] : (navigator.language || navigator.userLanguage);
	lang = String(lang);
	lang = lang.replace(/-.*/, "");
	console.log("Language from browser: " + lang);
}

// Using from hashtag in URL
var llang = String(window.location);
if (llang.indexOf("#switch-en") > 0 || llang.indexOf("#en") > 0) {
	lang = "en";
}
if (llang.indexOf("#switch-ru") > 0 || llang.indexOf("#ru") > 0) {
	lang = "ru";
}

// Only supporting 2 languages at the moment
var otherLang = "en";
if (lang == "en") {
	otherLang = "ru";
}

function addStylesheet(lang, otherLang) {
	// http://davidwalsh.name/add-rules-stylesheets
	var langStyle = document.createElement("style");
	langStyle.appendChild(document.createTextNode("body.grf .lang-" + otherLang + " { display: none; }"));
	langStyle.appendChild(document.createTextNode("body.grf .lang-" + lang + " { display: inline; }"));
	document.head.appendChild(langStyle);
	return langStyle;
}

var langStyle = addStylesheet(lang, otherLang);

$(document).ready(function () {
	$("#switch-ru").click(function () {
		var c = langStyle.childNodes.length;
		for (var i = 0; i < c; i++) {
			langStyle.removeChild(langStyle.childNodes[0]);
		}
		lang = "ru";
		otherLang = "en";
		langStyle = addStylesheet(lang, otherLang);
		localStorage.setItem("lang", lang);
		console.log("Switched to " + lang);
	});

	$("#switch-en").click(function () {
		var c = langStyle.childNodes.length;
		for (var i = 0; i < c; i++) {
			langStyle.removeChild(langStyle.childNodes[0]);
		}
		lang = "en";
		otherLang = "ru";
		langStyle = addStylesheet(lang, otherLang);
		localStorage.setItem("lang", lang);
		console.log("Switched to " + lang);
	});
});