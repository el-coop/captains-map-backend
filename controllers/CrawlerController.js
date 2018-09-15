class CrawlerController {
	async index(req, res) {
		let type = 'website';
		let title = 'Home';
		let url = 'https://map.elcoop.io';
		if (req.objects.user) {
			type = 'profile';
			title = req.objects.user.username;
			url += `/${req.objects.user.username}`
		}
		return res.status(200).render('crawler.html', {
			type,
			title,
			url
		});
	}
}


module.exports = new CrawlerController();