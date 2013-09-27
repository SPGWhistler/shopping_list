/*global phantom, $ */
var url = 'http://coupons.target.com/?';
var jquery = 'http://code.jquery.com/jquery-1.10.1.min.js';
var page = require('webpage').create();
var page_stack = [];
var products = [];
/*
page.onError = function (msg, trace) {
	console.log(msg);
	trace.forEach(function (item) {
		console.log('  ', item.file, ':', item.line);
	});
};
page.onConsoleMessage = function (msg) {
	console.log(msg);
};
*/

var shutdown = function () {
	var i;
	for (i in products) {
		if (products.hasOwnProperty(i)) {
			console.log(products[i].description);
			console.log('    ' + products[i].price);
			console.log('    ' + products[i].image);
			console.log('    ' + products[i].link);
		}
	}
	phantom.exit();
};

var getPageData = function () {
	var page, curPage;
	if (!page_stack.length) {
		shutdown();
	} else {
		page = page_stack.shift();
		console.log('working on page: ' + page);
		curPage = require('webpage').create();
		/*
		curPage.onConsoleMessage = function (msg) {
			console.log(msg);
		};
		curPage.onError = function (msg, trace) {
			console.log(msg);
			trace.forEach(function (item) {
				console.log('  ', item.file, ':', item.line);
			});
		};
		*/
		curPage.open(page, function (status) {
			if (status === 'success') {
				curPage.includeJs(jquery, function () {
					var output = curPage.evaluate(function () {
						var output = [];
						$('div.coupon').each(function () {
							var desc, price, img, link;
							price = $(this).find('input[type="hidden"]:first').val().trim();
							desc = $(this).find('input[type="hidden"]:last').val().trim();
							img = $(this).find('label img').attr('src');
							link = $(this).find('label a').attr('href');
							output.push({
								description : desc,
								price : price,
								image: img,
								link: 'http://coupons.target.com' + link
							});
						});
						return output;
					});
					products = products.concat(output);
					curPage.close();
					getPageData();
				});
			} else {
				curPage.close();
				getPageData();
			}
		});
	}
};

page.open(url, function (status) {
	if (status !== 'success') {
		console.log('Unable to access network');
		phantom.exit();
	} else {
		page.includeJs(jquery, function () {
			var total_pages, i, products = [], curPage;
			total_pages = page.evaluate(function () {
				return $('div.pagination-item.current')
					.text()
					.trim()
					.match(/^page \d* of (\d*)$/)[1];
			});
			console.log('total pages: ' + total_pages);
			for (i = 1; i <= total_pages; i += 1) {
				page_stack.push(url + '&page=' + i);
			}
			getPageData();
		});
	}
});
