/*global phantom, $ */
var patterns = [
	"^(?=.*apples )((?!candy).)*$",
	"^.*strawberries.*$",
	"^.*paper towel.*$",
	"^.*toilet paper.*$",
	"^.*diapers.*$",
	"^.*bananas.*$"
];
exports.filter = function (list) {
	var newList = [];
	list.forEach(function (arg) {
		patterns.some(function (pat) {
			var re = new RegExp(pat, "gmi");
			if (arg.description.search(re) !== -1) {
				newList.push(arg);
				return true;
			}
			return false;
		});
	});
	return newList;
};
