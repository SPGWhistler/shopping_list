/*global phantom */
var fs = require('fs');
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

var handleResults = function () {
	var j;
	console.log('total products: ' + products.length);
	for (j in products) {
		if (products.hasOwnProperty(j)) {
			console.log(products[j].description);
		}
	}
	phantom.exit();
};

if (fs.exists(cache_file)) {
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
