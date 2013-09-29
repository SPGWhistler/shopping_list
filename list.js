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
	var j, newProducts = [];
	newProducts = filter(products);
	for (j in newProducts) {
		if (newProducts.hasOwnProperty(j)) {
			console.log(newProducts[j].description);
			console.log('     ' + newProducts[j].price);
			console.log('     ' + newProducts[j].link);
			console.log('     ' + newProducts[j].image);
		}
	}
	console.log('total products: ' + products.length);
	console.log('filtered products: ' + newProducts.length);
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
