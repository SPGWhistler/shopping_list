/*global phantom, $ */
var url = 'http://www.topsmarkets.com/WeeklyAd/Store/232/';
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
						$('div.ItemRight[id^="AdItem"]').each(function () {
							var desc, price, img, link;
							img = $(this).find('div.leftCol img:first').attr('src');
							link = window.location.href;
							desc = $(this).find('div.rightCol').text().trim().replace(/(\r\n|\n|\r)/gm, "").replace(/\s{2,}/gm, " ").trim();
							price = $(this).find('div.rightCol p.Pricing').text().trim().replace(/(\r\n|\n|\r|)/gm, "").replace(/\s{2,}/gm, " ").trim();
							output.push({
								description : desc,
								price : price,
								image: img,
								link: link
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
			var pages, i;
			pages = page.evaluate(function () {
				var pages = [];
				$('#pages_top>ul>li>ul>li>a').each(function () {
					pages.push($(this).attr('href'));
				});
				return pages;
			});
			for (i in pages) {
				if (pages.hasOwnProperty(i)) {
					page_stack.push(pages[i]);
				}
			}
			console.log('total pages: ' + page_stack.length);
			getPageData();
		});
	}
});
