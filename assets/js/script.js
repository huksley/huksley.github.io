if (!window.console || !window.console.log) {
	window.console = {};
	console.log = function (s) {
		// no-op
	}
}

if (!window.localStorage) {
	window.localStorage = {};
	localStorage.getItem = function (n) {
		// no-op
		return null;
	}
	localStorage.setItem = function (n, v) {
		// no-op
		return null;
	}
}

// internet
// var javascriptKey = "U2FsdGVkX19G57C2sP5BZosD2b0PreenKwYpc/Nu1i3ADGe3zT67i9Mvuxx9GBL6Oe9SDFbbqCmEIhx8YMdAOQ==";
// local
var javascriptKey = "U2FsdGVkX1+5Avf/T6m1aYs4KPH1JOhbfXFOuhgzg2/bxbd5pmyQFl8A/ZhGBAWVXEHlx0vJdAKl1xJFOguIzA==";
var loc = String(window.location);
if (loc.indexOf("#") > 0) {
	loc = loc.substring(0, loc.indexOf("#"));
}
console.log("Location: " + loc);
javascriptKey = CryptoJS.AES.decrypt(javascriptKey, loc);
javascriptKey = javascriptKey.toString(CryptoJS.enc.Utf8);
Parse.initialize("K6BVY3jjA1T6Q2ZOH7qc88grIPhkKW0WdRzD7qKf", javascriptKey);

var ipinfo = {};
$.get("http://ipinfo.io", function(response) {
	ipinfo = response;
	console.log("Got ipinfo ", ipinfo);
	Parse.Events.trigger("client:ipinfo");
}, "jsonp");

Parse.Events.on("client:ipinfo", function () {
	console.log("Sending track event to Parse.com");
	Parse.Analytics.track("index", ipinfo);
});

// Read configuration for site
var config = {
	// gaTracking, location
};
var Config = Parse.Object.extend("Config");
var query = new Parse.Query(Config);
query.equalTo("location", String(loc)).find({
  success: function(l) {
  	// console.log(l);
  	if (l && l.length && l[0].attributes) {
  		config = l[0].attributes;
  		Parse.Events.trigger("site:config");
  	} else {
  		console.log("No config for: " + loc);
  	}
  },
  error: function(err) {
  	console.log("Error retrieving config from parse.com: " + err);
  }
});

Parse.Events.on("site:config", function () {
	console.log("Config " + config.gaTracking + ", " + config.location);
});

Parse.Events.on("site:config", function () {
	if (config.gaTracking) {
		console.log("Sending event to Google Analytics " + config.gaTracking);

		var _gaq = _gaq || [];
		_gaq.push([ '_setAccount', config.gaTracking ]);
		_gaq.push([ '_trackPageview' ]);

  		(function() {
			var ga = document.createElement('script'); 
			ga.type = 'text/javascript'; 
			ga.async = true;
			ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
			var s = document.getElementsByTagName('script')[0];
			s.parentNode.insertBefore(ga, s);
		})();
	}
});

// http://stackoverflow.com/questions/1043339/javascript-for-detecting-browser-language-preference
var lang = localStorage.getItem("lang");
console.log("Language from default storage: " + lang);

if (!lang) {
	lang = navigator.languages? navigator.languages[0] : (navigator.language || navigator.userLanguage);
	lang = String(lang);
	lang = lang.replace(/-.*/, "");
	console.log("Language from browser: " + lang);
}


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