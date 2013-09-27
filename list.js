/*global phantom, $ */
var url = 'http://weeklyad.target.com/buffalo-ny-14216/categories?escape=false&sort=title';
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
			console.log(products[i].description + ' ' + products[i].price);
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
						$('li.listing').each(function () {
							var desc, price;
							desc = $(this).find('p.product-description>a')
								.clone()
								.children()
								.remove()
								.end()
								.text()
								.trim();
							price = $(this).find('p.product-price').text().trim();
							output.push({
								description : desc,
								price : price
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
				return $('#top-pagination li.separator')
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
