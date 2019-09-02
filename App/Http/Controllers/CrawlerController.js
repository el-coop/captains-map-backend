class CrawlerController {
	async index(req, res) {
		let type = 'website';
		let title = 'Home';
		let url = 'https://map.elcoop.io';
		let description = 'Map your life, share it with your friends.';
		let image = 'https://map.elcoop.io/api/images/globe-icon.png';
		if (req.objects.user) {
			type = 'profile';
			title = req.objects.user.username;
			url += `/${req.objects.user.username}`;
		}
		if (req.objects.marker) {
			await req.objects.marker.load('media');
			description = req.objects.marker.description;
			type = 'article';
			url += `/${req.objects.marker.id}`;
			if (req.objects.marker.$media.at(0).type === 'image') {
				image = `https://map.elcoop.io/api${req.objects.marker.$media.at(0).path}`;
			} else {
				image = `https://instagram.com/p/${req.objects.marker.$media.at(0).path}/media/`;

			}
		}
		return res.status(200).render('crawler.html', {
			type,
			title,
			url,
			description,
			image
		});
	}
}


module.exports = new CrawlerController();
