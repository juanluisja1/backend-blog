// app.js
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');
const sanitize = require('sanitize'); // Sanitize user input
const cors = require('cors'); // Enable CORS
const app = express();
const port = 3000;
let sql;
app.use(bodyParser.json());
// app.use(express.json());

app.use(cors({  
  origin: ['https://juanluisja.live/blog/',`http://localhost:${port}`]
}));

// app.use(function (req, res, next) {
//   req.header("content-type", "html/text");
//   res.setHeader("Content-Type", "application/json");
//   res.header("Access-Control-Allow-Origin", "*");
//   console.log('Time:', Date.now())
//   next();
// });



// // Serve the HTML file blogs
// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/index.html');
// });

// // API to fetch comments for a post
// app.get('api/get-comments/'+1, (req, res) => {
//   const postId = req.params.postId;
//   // Implement code to fetch comments from the database for the given postId
// });

// // API to add a new comment
// app.post('/api/comments/:postId', (req, res) => {
//   const postId = req.params.postId;
//   const commentText = req.body.comment;

//   // Implement code to insert a new comment into the database for the given postId

//   res.redirect('/');
// });

// // API to add a new post
/**
 * @Params Body{title,content, author_id} 
 * @return 200 if success, body{title, author_id}
*/

app.post('/post', (req, res) => {
  
    try {
        
        console.log(req.body.title);
        const { title, content, author_id } = req.body;
        sql = `INSERT INTO posts (title, content, author_id) VALUES (?, ?, ?)`;
        db.run(sql, [title, content, author_id],err => {
          if (err) {
            return res.status(300).json({message: err.message});
          }
          console.log('Post created successfully, by author_id: ', author_id, title);
        });
        return res.status(200).json({ message: 'Post created successfully' })
        } catch (error) {
      console.error(error.message);
      return res.status(400).json({ error: error.message })
    }

});

// /select users.username, posts.title from users LEFT JOIN posts ON users.id = posts.author_id ORDER BY users.id;

// endpoint get all posts with author name and comments

app.get('/posts', (req, res) => {
  try {
    sql = `SELECT users.username,  posts.title, posts.content, comments.comment, posts.author_id, users.id from users JOIN posts ON users.id = posts.author_id JOIN comments ON comments.author_id = posts.author_id  ORDER BY posts.timestamp`;
    db.all(sql, [], (err, rows) => {
      if (err) {
        return res.status(300).json({message: err.message});
      }
      console.log('all posts with their respectives comments', rows);
      return res.status(200).json({ message: 'Posts fetched successfully', data: rows })
    });
  } catch (error) {
    console.error(error.message);
    return res.status(400).json({ error: error.message })
  }
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

