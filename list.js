/*global phantom */
var args = require('system').args;
var fs = require('fs');
var filter = require('./filter').filter;
var aldi = require('./aldi_weeklyad');
var tops = require('./tops_weeklyad');
var target_weekly = require('./target_weeklyad');
var target_coupons = require('./target_coupons');
var ads = [
	aldi,
	tops,
	target_weekly,
	target_coupons
];
var products = [];
var i;
var cache_file = 'cache.json';
var html_file = 'output.html';
var options = {
	force_refresh: false
};

//Parse arguments
if (args.length > 1) {
	args.forEach(function (arg) {
		switch (arg) {
		case "-f":
			options.force_refresh = true;
			break;
		case "-h":
		case "?":
		case "-?":
		case "--help":
			console.log('Available Options:');
			console.log('-f    Force a cache refresh');
			phantom.exit();
			break;
		}
	});
}

var handleResults = function () {
	var j, newProducts = [], html;
	newProducts = filter(products);
	html = "<html><head>";
	html += "<style>";
	html += ".product { border: 1px solid black; }";
	html += "</style>";
	html += "</head>";
	html += "<body>";
	for (j in newProducts) {
		if (newProducts.hasOwnProperty(j)) {
			html += "<div class='product'>";
			html += "<div class='desc'>" + newProducts[j].description + "</div>";
			html += "<div class='price'>" + newProducts[j].price + "</div>";
			html += "<div class='image'>";
			html += "<a href='" + newProducts[j].link + "'>";
			html += "<img src='" + newProducts[j].image + "' />";
			html += "</a>";
			html += "</div>";
			html += "</div>";
		}
	}
	html += "<div>Total Products: " + products.length + "</div>";
	html += "<div>Filtered Products: " + newProducts.length + "</div>";
	html += "</body></html>";
	fs.write(html_file, html, 'w');
	phantom.exit();
};

if (fs.exists(cache_file) && options.force_refresh === false) {
	//Cache file exists, and we are not forcing a refresh
	products = JSON.parse(fs.read(cache_file));
	handleResults();
} else {
	//Cache file does not exist, or we are forced to do a refresh
	for (i in ads) {
		if (ads.hasOwnProperty(i)) {
			ads[i].getAds();
		}
	}

	setInterval(function () {
		var i;
		if (ads.length) {
			for (i in ads) {
				if (ads.hasOwnProperty(i)) {
					if (ads[i].products.length) {
						console.log(ads[i].products.length);
						products = products.concat(ads[i].products);
						ads.splice(i, 1);
					}
				}
			}
		} else {
			fs.write(cache_file, JSON.stringify(products), 'w');
			handleResults();
		}
	}, 500);
}
