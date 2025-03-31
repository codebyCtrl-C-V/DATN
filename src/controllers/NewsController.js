const News = require("../models/News");
const slugify = require("slugify");

class NewsController {
  async createNews(req, res) {
    try {
      const { title, content, image } = req.body;
      const slug = slugify(title, { lower: true, strict: true });
      const news = await News.create({ title, slug, content, image });
    } catch (error) {
      console.error("Lỗi tạo tin tức:", error);
      res.status(500).json({ error: "Lỗi server" });
    }
  }

  async getNewsForHome() {
    try {
      const news = await News.findAll({
        order: [["createdAt", "DESC"]],
        limit: 3,
        raw: true,
      });

      return news;
    } catch (error) {
      console.error("Lỗi lấy tin tức:", error);
      res.status(500).json({ error: "Lỗi server" });
    }
  }
}
module.exports = new NewsController();
