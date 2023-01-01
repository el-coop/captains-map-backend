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
			title = user.username;
			url += `/${user.username}`;
		}
		const marker = req.objects.marker;

		if (marker) {
			const media = await marker.getMedia();
			description = marker.description;
			type = 'article';
			url += `/${marker.id}`;
			images = media.map((media) => {
				if (media.type === 'image') {
					return `https://map.elcoop.io/api${media.path}`;
				}
				return `https://instagram.com/p/${media.path}/media/`;
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


export default new CrawlerController();
