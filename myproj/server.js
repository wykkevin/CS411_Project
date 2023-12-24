var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql2');
var path = require('path');
const multer = require('multer');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });
const csv = require('csv-parser');

var connection = mysql.createConnection({
                host: '35.232.253.60',
                user: 'root',
                password: 'wallpaper',
                database: 'youtubeTrendingData'
});

connection.connect;

console.log('Server running at http://35.208.230.233/');

var app = express();

// set up ejs view engine 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '../public'));

/* GET home page, respond by rendering index.ejs */
app.get('/', function(req, res) {
  res.render('index', { title: 'Youtube Trending Videos' });
});
 
// this code is executed when a user clicks the form submit button
app.get('/search', function(req, res) {
  var videoTitle = req.query.title;
  var publishStartDate = req.query.start;
  var publishEndDate = req.query.end;
  var channelName = req.query.channelName;
   
  var sql = `SELECT videoId, title, channelTitle, publishedDate FROM Video NATURAL JOIN Channel 
  WHERE title like '%${videoTitle}%' and publishedDate >= '${publishStartDate}' and publishedDate <= '${publishEndDate}'
  and channelTitle like '%${channelName}%'
  ORDER BY publishedDate desc`;
  console.log(sql);
  connection.query(sql, function(err, results, fields) {
    if (err) {
      res.send(err)
      return;
    }
    var data = {
      results: results,
      videoTitle: videoTitle
    };
    res.render('search-result', data);
  });
});

app.get('/searchTrending', function(req, res) {
  var videoTitle = req.query.title;
  var publishStartDate = req.query.start;
  var publishEndDate = req.query.end;
  var channelName = req.query.channelName;
  var likesNumber = req.query.likesNumber || 0;
  var likeRatio = req.query.likeRatio || 0;
  var viewCount = req.query.viewCount || 0;
  var commentCount = req.query.commentCount || 0;
   
  var sql = `SELECT videoId, date, title, view_count, like_ratio, likes, comment_count, channelTitle FROM Video NATURAL JOIN Trending NATURAL JOIN Channel 
  WHERE title like '%${videoTitle}%' and date >= '${publishStartDate}' and date <= '${publishEndDate}'
  and channelTitle like '%${channelName}%' and likes >= ${likesNumber} and like_ratio >= ${likeRatio} and view_count >= ${viewCount} and comment_count >= ${commentCount}
  ORDER BY view_count desc, date desc`;
  console.log(sql);
  connection.query(sql, function(err, results, fields) {
    if (err) {
      res.send(err)
      return;
    }
    var data = {
      results: results,
      videoTitle: videoTitle
    };
    res.render('search-trending-result', data);
  });
});

app.post("/update", async (req, res) => {
  const videoId = req.body.videoId;
  const newTitle = req.body.title;
  const newChannelTitle = req.body.channelTitle;

  //get old data
  connection.query('SELECT title, channelTitle FROM Video NATURAL JOIN Channel WHERE videoId = ?', [videoId], (err, oldVideo, fields) => {
  if (err) {
    console.error(err);
    res.status(500).send("Error retrieving old video data");
    return;
  }
  const oldTitle = oldVideo[0].title;
  const oldChannelTitle = oldVideo[0].channelTitle;


  //perform update
  const sql = `UPDATE Video NATURAL JOIN Channel SET channelTitle = ?, title = ? WHERE videoId = ?`; 
  connection.query(sql, [newChannelTitle, newTitle, videoId], (err, results, fields) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error updating video");
      return;
    }
    console.log(sql)
    connection.query('SELECT * FROM Video NATURAL JOIN Channel WHERE videoId = ?', [videoId], (err, updatedVideo, fields) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error retrieving updated video");
        return;
      }
      var data = {
        videoData: updatedVideo[0],
        videoId: videoId,
        oldTitle: oldTitle,
        oldChannelTitle: oldChannelTitle
      };
      res.render('update-result', data);
      });
      });
    });
});

// OLD INSERT
//INCLUDED ONLY FOR DEBUGGING

app.post("/insert", async (req, res) => {
  const videoTitle = req.body.title;
  const videoId = Math.random().toString(36).slice(2);
  const channelId = 'UCLkAepWjdylmXSltofFvsYQ';
  const sql = "INSERT INTO Video VALUES(?, ?, 1, ?, '1900-01-01', '00:00:00', 'google.com', TRUE, TRUE, 'Placeholder description', 0, 'English', 'English', '0', 0)";
  connection.query(sql, [videoId, channelId, videoTitle], (err, results, fields) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error inserting video");
      return;
    }
    const html = `
      <h1>The following video has been inserted:</h1>
        <table>
          <tr>
            <th>Attribute</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>videoId</td>
            <td>${videoId}</td>
          </tr>
          <tr>
            <td>Title</td>
            <td>${videoTitle}</td>
        </table>
    `;
    res.send(html);
  });
});


/*
app.post("/insert", async (req, res) => {
  const videoTitle = req.body.title;
  const videoId = Math.random().toString(36).slice(2);
  const channelId = 'UCLkAepWjdylmXSltofFvsYQ';
  const sql = "INSERT INTO Video VALUES(?, ?, 1, ?, '1900-01-01', '00:00:00', 'google.com', TRUE, TRUE, 'Placeholder description', 0, 'English', 'English', '0', 0)";
  
  connection.query('DROP TABLE IF EXISTS popularVideos', (err, results, fields) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error dropping table");
      return;
    }

    console.log('popularVideos dropped successfully');

  const createTableSql = "CREATE TABLE popularVideos AS (SELECT DISTINCT videoId FROM Video NATURAL JOIN Trending WHERE likes > 100000 AND like_ratio > 0.9 AND comment_count > 10000 AND levenshtein(?, title) < 10)";
    connection.query(createTableSql, [videoTitle], (err, results, fields) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error creating table, perhaps use a better table?");
        return;
      }

      console.log('Table created successfully');

  connection.query(sql, [videoId, channelId, videoTitle], (err, results, fields) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error inserting video");
      return;
    }
    const html = `
      <h1>The following video has been inserted:</h1>
        <table>
          <tr>
            <th>Attribute</th>
            <th>Value</th>
          </tr>
          <tr>
            <td>videoId</td>
            <td>${videoId}</td>
          </tr>
          <tr>
            <td>Title</td>
            <td>${videoTitle}</td>
        </table>
    `;
    res.send(html);
  });
});
*/

app.post('/insertFromFile', upload.single('csvfile'), (req, res) => {
  const file = req.file;

  const results = [];
  const titles = [];
  fs.createReadStream(file.path)
    .pipe(csv())
    .on('data', (data) => {
      const video_id = data.video_id;
        const title = data.title;
        const publishedAt = data.publishedAt;
        const channelId = data.channelId;
        const channelTitle = data.channelTitle;
        const categoryId = data.categoryId;
        const trending_date = data.trending_date;
        const tags = data.tags;
        const view_count = data.view_count;
        const likes = data.likes;
        const dislikes = data.dislikes;
        const comment_count = data.comment_count;
        const thumbnail_link = data.thumbnail_link;
        const comments_disabled = data.comments_disabled;
        const ratings_disabled = data.ratings_disabled;
        const description = data.description;
        titles.push(title);

        // const videoId = Math.random().toString(36).slice(2);
        // const channelId2 = 'UCLkAepWjdylmXSltofFvsYQ';
        
        // const sql = `INSERT INTO Video VALUES('${videoId}', '${channelId2}', '${categoryId}', '${title}', '1900-01-01', '00:00:00', '${thumbnail_link}', ${ratings_disabled}, ${comments_disabled}, 'Placeholder description', 0, 'English', 'English', '0', 0);`;
        const sql = `CALL CompleteInsert('${channelId}', '${channelTitle}', '${video_id}', '${title}');`;
        console.log(sql)
        connection.query(sql, (err, results, fields) => {
          if (err) {
            console.error(err);
            res.status(500).send("Error inserting video");
            return;
          }
        });
    })
    .on('end', () => {
      fs.unlinkSync(file.path);
      const html = `
        <h1>The following videos have been inserted:</h1>
        <ul>
          ${titles.map(title => `<li>${title}</li>`).join('\n')}
        </ul>
      `;
      res.send(html);
    });
});

app.post("/delete", async (req, res) => {
    const videoId = req.body.videoId;
    const sql = `DELETE FROM Video WHERE videoId = '${videoId}'`;
    console.log(sql)
    connection.query(sql, function(err, result){
      if (err) {
        console.error(err);
        res.status(500).send("Error deleting video. Ensure that the videoId is correct.")
        return;
      }
      const success = `
        <h1>The video with the following id has been successfully deleted:</h1>
        <table>
          <tr>
            <th>Deleted Video</th>
          </tr>
          <tr>
            <td>videoId</td>
            <td>${videoId}</td>
          </tr>
        </table>
      `;
      res.send(success);
    });
});

// Get a Video's Tags
app.get('/showVideoTags', function(req, res) {
  var videoId = req.query.videoId;
  console.log(videoId)
  var sql = `SELECT tagName FROM VideoTag WHERE videoId = '${videoId}'`;
  console.log(sql)
  connection.query(sql, function(err, results, fields) {
    if (err) {
      res.send(err)
      return;
    }
    var data = {
      results: results
    };
    res.render('VideoTags', data);
  });
});

// Top Videos or Channels
app.get('/showTopLikedLongVideos', function(req, res) {
  var sql = `SELECT DISTINCT title, sum(likes) as videoLikeCount FROM Video NATURAL JOIN Trending WHERE duration_seconds >= 600 and comment_count >= 100000 GROUP BY videoId ORDER BY videoLikeCount DESC LIMIT 50;`;
  connection.query(sql, function(err, results, fields) {
    if (err) {
      res.send(err)
      return;
    }
    var data = {
      results: results
    };
    res.render('TopLikedLongVideos', data);
  });
});

app.get('/showTopTrendedGoodChannels', function(req, res) {
  var sql = `SELECT channelId, sum(videoTrending.trendingCount) as channelTrendingCount FROM Video NATURAL JOIN (SELECT videoId, count(date) as trendingCount FROM Trending WHERE like_ratio > 0.99 and like_ratio <> 1 and view_count >=1000000 GROUP BY videoId) as videoTrending GROUP BY channelId ORDER BY channelTrendingCount DESC LIMIT 50;`;
  connection.query(sql, function(err, results, fields) {
    if (err) {
      res.send(err)
      return;
    }
    var data = {
      results: results
    };
    res.render('TopTrendedGoodChannels', data);
  });
});

app.get('/showTopTrendMakerChannels', function(req, res) {
  var sql = `SELECT channelId, channelTitle, subscribersCount, sum(videoTrending.trendingCount) as channelTrendingCount FROM Video NATURAL JOIN Channel NATURAL JOIN (SELECT videoId, count(date) as trendingCount FROM Trending GROUP BY videoId) as videoTrending GROUP BY channelId ORDER BY channelTrendingCount DESC LIMIT 50;`;
  connection.query(sql, function(err, results, fields) {
    if (err) {
      res.send(err)
      return;
    }
    var data = {
      results: results
    };
    res.render('TopTrendMakerChannels', data);
  });
});

app.get('/showTopLikedShortVideos', function(req, res) {
  var sql = `SELECT DISTINCT title, sum(likes) as videoLikeCount FROM Video NATURAL JOIN Trending WHERE duration_seconds <= 300 and comment_count >= 100000 GROUP BY videoId ORDER BY videoLikeCount DESC LIMIT 50;`;
  connection.query(sql, function(err, results, fields) {
    if (err) {
      res.send(err)
      return;
    }
    var data = {
      results: results
    };
    res.render('TopLikedShortVideos', data);
  });
});

app.get('/showTopDislikedShortVideos', function(req, res) {
  var sql = `SELECT DISTINCT title, sum(dislikes) as videoDislikeCount FROM Video NATURAL JOIN Trending WHERE duration_seconds <= 300 and comment_count >= 100000 GROUP BY videoId ORDER BY videoDislikeCount DESC LIMIT 50;`;
  connection.query(sql, function(err, results, fields) {
    if (err) {
      res.send(err)
      return;
    }
    var data = {
      results: results
    };
    res.render('TopDislikedShortVideos', data);
  });
});

app.get('/showTopDislikedLongVideos', function(req, res) {
  var sql = `SELECT DISTINCT title, sum(dislikes) as videoDislikeCount FROM Video NATURAL JOIN Trending WHERE duration_seconds >= 1000 GROUP BY videoId ORDER BY videoDislikeCount DESC LIMIT 50;`;
  connection.query(sql, function(err, results, fields) {
    if (err) {
      res.send(err)
      return;
    }
    var data = {
      results: results
    };
    res.render('TopDislikedLongVideos', data);
  });
});

app.get('/showMostViewedVideos', function(req, res) {
  var sql = `SELECT DISTINCT title, sum(view_count) as videoViewCount FROM Video NATURAL JOIN Trending WHERE view_count > 1000 GROUP BY videoId ORDER BY videoViewCount DESC LIMIT 100;`;
  connection.query(sql, function(err, results, fields) {
    if (err) {
      res.send(err)
      return;
    }
    var data = {
      results: results
    };
    res.render('MostViewedVideos', data);
  });
});

app.get('/showVideosWithMostInteraction', function(req, res) {
  var sql = `SELECT DISTINCT title, sum(view_count) as videoViewCount, sum(likes) as videoLikeCount, sum(dislikes) as videoDislikeCount, sum(comment_count) as commentCount, sum(like_ratio) as likeRatio FROM Video NATURAL JOIN Trending WHERE view_count > 1000 GROUP BY videoId ORDER BY videoViewCount DESC LIMIT 100;`;
  connection.query(sql, function(err, results, fields) {
    if (err) {
      res.send(err)
      return;
    }
    var data = {
      results: results
    };
    res.render('VideosWithMostInteraction', data);
  });
});

app.get('/showOverallPopularChannels', function(req, res) {
  var sql = `SELECT channelId, channelTitle, subscribersCount, sum(videoTrending.trendingCount) as channelTrendingCount FROM Video NATURAL JOIN Channel NATURAL JOIN (SELECT videoId, count(date) as trendingCount FROM Trending WHERE like_ratio > 0.99 and view_count >= 1000000 GROUP BY videoId) as videoTrending GROUP BY channelId ORDER BY channelTrendingCount DESC LIMIT 50;`;
  connection.query(sql, function(err, results, fields) {
    if (err) {
      res.send(err)
      return;
    }
    var data = {
      results: results
    };
    res.render('OverallPopularChannels', data);
  });
});

app.get('/showTrendingCategories', function(req, res) {
  var sql = `SELECT id, categoryName, count(categoryName) as categoryCount, sum(videoTrending.trendingCount) as categoryTrendingCount FROM Video NATURAL JOIN Category NATURAL JOIN (SELECT videoId, count(likes) as likeCount, count(date) as trendingCount FROM Trending WHERE like_ratio > 0.75 and view_count >= 1000000 GROUP BY videoId) as videoTrending GROUP BY id ORDER BY categoryTrendingCount DESC LIMIT 25;`;
  connection.query(sql, function(err, results, fields) {
    if (err) {
      res.send(err)
      return;
    }
    var data = {
      results: results
    };
    res.render('TrendingCategories', data);
  });
});

app.get('/showTopVideosInPastYear', function(req, res) {
  var sql = `SELECT DISTINCT title, sum(likes) as videoLikeCount FROM Video NATURAL JOIN Trending WHERE publishedDate > 2022-12-31 and comment_count >= 100000 GROUP BY videoId ORDER BY videoLikeCount DESC LIMIT 50;`;
  connection.query(sql, function(err, results, fields) {
    if (err) {
      res.send(err)
      return;
    }
    var data = {
      results: results
    };
    res.render('TopVideosInPastYear', data);
  });
});


app.listen(80, function () {
    console.log('Node app is running on port 80');
});
