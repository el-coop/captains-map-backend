class CrawlerController {
	async index(req, res) {
		let type = 'website';
		let title = 'Home';
		let url = 'https://map.elcoop.io';
		let description = 'Map your life, share it with your friends.';
		let images = ['https://map.elcoop.io/api/images/globe-icon.png'];
		if (req.objects.user) {
			type = 'profile';
			title = req.objects.user.get('username');
			url += `/${req.objects.user.get('username')}`;
		}
		if (req.objects.marker) {
			await req.objects.marker.load('media');
			description = req.objects.marker.get('description');
			type = 'article';
			url += `/${req.objects.marker.get('id')}`;
			images = req.objects.marker.related('media').map((media) => {
				if(media.get('type') === 'image'){
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
