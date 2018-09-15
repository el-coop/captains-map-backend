class CrawlerController {
	async index(req, res) {
		return res.status(200).render('crawler.html');
	}
}


module.exports = new CrawlerController();