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
        order: [["updatedAt", "DESC"]],
        limit: 3,
        raw: true,
      });

      return news;
    } catch (error) {
      console.error("Lỗi lấy tin tức:", error);
      res.status(500).json({ error: "Lỗi server" });
    }
  }

  async getAllNews(req, res) {
    try {
      const {page} = req.query; 
      const limit = 5;
      const offset = (page - 1) * limit;

      const totalNews = await News.count();

      const news = await News.findAll({
        limit: limit,
        offset: offset,
        order: [["updatedAt", "DESC"]],
        raw: true,
      });

      const totalPages = Math.ceil(totalNews / limit);

      res.render("news/newsList", {
        news,
        currentPage: page,
        totalPages,
      });
    } catch (error) {
      console.error("Lỗi lấy tin tức:", error);
      res.status(500).json({ error: "Lỗi server" });
    }
  }

  async getNews(req, res) {
    try {
      const { slug } = req.params;
      const news = await News.findOne({ where: { slug }, raw: true });
      if (!news) {
        return res.status(404).send("Not found");
      }

      res.render("news/newsInfo", { news });
    } catch (error) {
      console.error("Lỗi lấy tin tức:", error);
      res.status(500).send("Lỗi server");
    }
  }
}
module.exports = new NewsController();
