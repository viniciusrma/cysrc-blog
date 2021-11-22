const express = require("express");
const articleRouter = require("./routes/articles");
const app = express();
const matter = require("gray-matter");
const fs = require("fs");
const postUrl = "./views/blog";

app.set("view engine", "ejs");

app.use("/public/images/", express.static("./public/images"));

app.use("/articles", articleRouter);

app.get("/blog", (req, res) => {
  const posts = fs.readdirSync(postUrl).filter((file) => file.endsWith(".md"));

  res.render("index", {
    title: "CySource's Blog",
    posts: posts,
    matter: matter,
  });
});

app.get("/blog/:article", (req, res) => {
  // read the markdown file
  const file = matter.read("views/blog/" + req.params.article + ".md");

  // use markdown-it to convert content to HTML
  var md = require("markdown-it")({
    html: true,
    linkify: true,
    typography: true,
  }).use(
    require("markdown-it-video", {
      // <-- this use(package_name) is required
      youtube: { width: 560, height: 315 },
      vimeo: { width: 500, height: 281 },
      vine: { width: 600, height: 600, embed: "simple" },
      prezi: { width: 550, height: 400 },
    })
  );

  let content = file.content;
  var result = md.render(content);

  console.log(result);

  res.render("article-content", {
    post: result,
    title: file.data.title,
    matter: matter,

    description: file.data.description,
    author: file.data.author,
    day: file.data.day,
    month: file.data.month,
    year: file.data.year,
    date: file.data.date
  });
});

app.listen(3000);
