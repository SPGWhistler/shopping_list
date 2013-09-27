/*global phantom, $ */
var url = 'http://weeklyads.aldi.us/aldi/default.aspx?action=entry&pretailerid=-97994&siteid=1337&mode=html&StoreID=2623432';
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
	console.log(products.length);
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
						$('div.pagerollovers>div').each(function () {
							var desc, price, img, link;
							desc = $(this).find('div.popupcontent>div.popdivtext>span.title').text().trim();
							price = $(this).find('div.popupcontent>div.popdivtext>span.deal').text().trim();
							img = $(this).find('div.popupcontent>div.popdivthumb>img').attr('src');
							link = $(this).find('div.popupcontent>ul.buttons>li.moredetails>a').attr('href');
							output.push({
								description : desc,
								price : price,
								image: img,
								link: 'http://weeklyads.aldi.us/aldi/' + link
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

phantom.addCookie({
	'name' : 'DisplayMode',
	'value' : 'preferred=html',
	'domain' : 'weeklyads.aldi.us',
	'path' : '/',
	'expires' : (new Date()).getTime() + (1000 * 60 * 60)
});

page.open(url, function (status) {
	if (status !== 'success') {
		console.log('Unable to access network');
		phantom.exit();
	} else {
		page.includeJs(jquery, function () {
			var pages, i;
			pages = page.evaluate(function () {
				var pages = [];
				$('div.article.adcover>a').each(function () {
					pages.push($(this).attr('href'));
				});
				return pages;
			});
			for (i in pages) {
				if (pages.hasOwnProperty(i)) {
					page_stack.push('http://weeklyads.aldi.us/aldi/' + pages[i]);
				}
			}
			console.log('total pages: ' + page_stack.length);
			getPageData();
		});
	}
});
