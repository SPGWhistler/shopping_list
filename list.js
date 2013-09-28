/*global phantom */
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
					products.concat(ads[i].products);
					ads.splice(i, 1);
				}
			}
		}
	} else {
		console.log('total products: ' + products.length);
		phantom.exit();
	}
}, 500);
