/*global phantom, $ */
exports.products = [];
exports.getAds = function () {
	var url, jquery, page, page_stack, products, shutdown, getPageData;
	url = 'http://weeklyad.target.com/buffalo-ny-14216/categories?escape=false&sort=title';
	jquery = 'http://code.jquery.com/jquery-1.10.1.min.js';
	page = require('webpage').create();
	page_stack = [];
	products = [];
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

	shutdown = function () {
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

	getPageData = function () {
		var page, curPage;
		if (!page_stack.length) {
			//shutdown();
			exports.products = products;
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
								var desc, price, img, link;
								desc = $(this).find('p.product-description>a')
									.clone()
									.children()
									.remove()
									.end()
									.text()
									.trim();
								price = $(this).find('p.product-price').text().trim();
								img = $(this).find('div.image-wrapper a img').attr('src');
								link = $(this).find('div.image-wrapper a').attr('href');
								output.push({
									description : desc,
									price : price,
									image: img,
									link: 'http://weeklyad.target.com' + link
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
				var total_pages, i;
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
};
