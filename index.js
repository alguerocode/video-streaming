const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  console.log("SERVER STARTED AT PORT: " + PORT);
});

// serve html page
app.get("/", (req, res) => {
  try {
    res.sendFile(__dirname + "/public/index.html");
  } catch (err) {
    res.status(500).send("internal server error occurred");
  }
});

// serving video streaming
app.get("/video", (req, res) => {
  const range = req.headers.range;
  if (!range) res.status(400).send("Range must be provided");

  const videoPath = path.join(__dirname, "public", "video.mp4");
  const videoSize = fs.statSync(videoPath).size;

  const chunkSize = 10 ** 6; // 10 powered by 6 equal 1000000bytes = 1mb

  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + chunkSize, videoSize - 1);
  const contentLength = end - start + 1;

  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  res.writeHead(206, headers);
  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
});

// serving poster image;
app.get("/:file_name", (req, res) => {
  try {
    res.sendFile(__dirname + "/public/" + req.params.file_name);
  } catch (err) {
    res.status(500).send("internal server error occurred");
  }
});
