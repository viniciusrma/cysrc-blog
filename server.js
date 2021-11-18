const express = require("express");
const articleRouter = require("./routes/articles");
const app = express();
const matter = require("gray-matter");

app.set("view engine", "ejs");

app.use("/public/images/", express.static("./public/images"));

app.use("/articles", articleRouter);
app.get("/", (req, res) => {
  const posts = matter.read("./views/blog/test.md");

  res.render("index", {
    title: "Blog de cibersegurança",
    posts: posts.data,
  });
});

app.listen(3000);
