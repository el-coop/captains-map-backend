class CrawlerController {
	async index(req, res) {
		let type = 'website';
		let title = 'Home';
		let url = 'https://map.elcoop.io';
		let description = 'Map your life, share it with your friends.';
		let images = ['https://map.elcoop.io/api/images/globe-icon.png'];
		const user = req.objects.user;
		if (user) {
			type = 'profile';
			title = user.get('username');
			url += `/${user.get('username')}`;
		}
		const marker = req.objects.marker;

		if (marker) {
			await marker.load('media');
			description = marker.get('description');
			type = 'article';
			url += `/${marker.get('id')}`;
			images = marker.related('media').map((media) => {
				if (media.get('type') === 'image') {
					return `https://map.elcoop.io/api${media.get('path')}`;
				}
				return `https://instagram.com/p/${media.get('path')}/media/`;
			});
		}
		return res.status(200).render('crawler.html', {
			type,
			title,
			url,
			description,
			images
		});
	}
}


module.exports = new CrawlerController();
