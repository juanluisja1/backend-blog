// app.js
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');
//const sanitize = require('sanitize'); // Sanitize user input
const cors = require('cors'); // Enable CORS
const helmet = require("helmet"); // middleware for express
const fs = require ("fs");
const https = require("https");
const app = express();
const port = 3000;
let sql;
app.use(bodyParser.json());
// app.use(express.json());
///etc/nginx/sites-enabled
// app.use(cors({  
//    origin: '*' // ['https://juanluisja.live/blog/',`http://localhost:${port}`]
// }));

//origin: ['http://127.0.0.1:5500','https://juanluisja.live/blog/'],

app.use(cors({
  origin: ['https://juanluisja.live','https://juanluisja.live/blog/'],
}));
// app.use(function (req, res, next) {
//   req.header("content-type", "html/text");
//   res.setHeader("Content-Type", "application/json");
//   res.header("Access-Control-Allow-Origin", "*");
//   console.log('Time:', Date.now())
//   next();
// });

app.use(helmet());


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

app.post('/post', async (req, res) => {
  try {
      const { title, content, author_id } = req.body;
      sql = `INSERT INTO posts (title, content, author_id) VALUES (?, ?, ?)`;

      await db.run(sql, [title, content, author_id]);

      console.log('Post created successfully, by author_id:', author_id, title);
      return res.status(200).json({ message: 'Post created successfully' });
  } catch (error) {
      console.error('Error creating post:', error.message);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// app.post('/post', (req, res) => {

//     try {
        
//         console.log(req.body.title);
//         const { title, content, author_id } = req.body;
//         sql = `INSERT INTO posts (title, content, author_id) VALUES (?, ?, ?)`;
//         db.run(sql, [title, content, author_id],err => {
//           if (err) {
//             return res.status(300).json({message: err.message});
//           }
//           console.log('Post created successfully, by author_id: ', author_id, title);
//         });
//         return res.status(200).json({ message: 'Post created successfully' })
//         } catch (error) {
//       console.error(error.message);
//       return res.status(400).json({ error: error.message })
//     }

// });


// // API to add a comment to a post
/**
 * @Params Body{title,content, author_id} 
 * @return 200 if success, body{title, author_id}
*/

app.post('/post_comment', (req, res) => {
  
  // let req.username
 //helper to get user id if exist other wise return a id

  try {
      /**
       * id INTEGER PRIMARY KEY,
        comment TEXT NOT NULL,
        post_id INTEGER,
        author_id INTEGER,
       */
      console.log(req.body.comment);
      const { comment, post_id, author_id } = req.body;
      sql = `INSERT INTO comments (comment, post_id, author_id) VALUES (?, ?, ?)`;
      db.run(sql, [comment, post_id, author_id],err => {
        if (err) {
          return res.status(300).json({message: err.message});
        }
        console.log('Comment created successfully, by author_id: ', author_id, comment);
      });
      return res.status(200).json({ message: 'Post created successfully' })
      } catch (error) {
    console.error(error.message);
    return res.status(400).json({ error: error.message })
  }

});

//helper route to check and obtain author_id

/**
 * @param req.username
 * @return (req.author_id)
 */
app.get('/get_user_id', (req, res) => {
  // Extract the username from the request query or parameters, depending on how it's sent
  const username = req.username || req.params.username || req.query.username;

  console.log(`check the parameters:${req.body.username}`);
  if (!username) {
    return res.status(400).json({ message: 'Username is missing in the request.' });
  }

  try {
    const sql = 'SELECT * FROM users WHERE username = ?';

    db.get(sql, [username], (err, row) => {
      if (err) {
        return res.status(404).json({
           message: err.message,
           data: {user_id:3,
              username: "john_doe",
              email: "john_doe@none.com"
              }
           });
      }

      if (row) {
        // User found, return the user ID
        console.log('user was founded!')
        return res.status(200).json({
          message: 'User found successfully',
          data: {
            user_id: row.id,
            username: row.username,
            email: row.email
          }
        });
      } else {
        // User not found
        return res.status(304).json({ 
          message: 'User not found, jhon_doe',
          data:{
            user_id: 3,
            username: "john_doe",
            email: "john_doe@none.com"
          }
        }); //jhon_doe by default
      }
    });
  } catch (error) {
    return res.status(400).json({ error: 'not founded'});
  }
});


// /select users.username, posts.title from users LEFT JOIN posts ON users.id = posts.author_id ORDER BY users.id;

// endpoint get all posts with author name and comments

app.get('/posts', (req, res) => {
  try {
    sql = `SELECT
    posts.id AS post_id,
    posts.title AS post_title,
    posts.content AS post_content,
    posts.timestamp AS post_timestamp,
    users.username AS author_username,
    comments.id AS comment_id,
    comment_users.username AS comment_author_username,
    comments.comment AS comment_text,
    comments.timestamp AS comment_timestamp
FROM posts
JOIN users ON posts.author_id = users.id
LEFT JOIN comments ON posts.id = comments.post_id
LEFT JOIN users AS comment_users ON comments.author_id = comment_users.id
ORDER BY post_id, comment_id;`;
    db.all(sql, [], (err, rows) => {
      if (err) {
        return res.status(300).json({message: err.message});
      }
      // Create an empty object to store the structured JSON response.
        const response = {};
          rows.forEach(row => {
            //console.log(row)
            if (!response[row.post_id]) {
                response[row.post_id] = {
                    post_id: row.post_id,
                    post_title: row.post_title,
                    post_content: row.post_content,
                    post_timestamp: row.post_timestamp,
                    author_username: row.author_username,
                    comments: []
                };
            }

            if (row.comment_id !== null) {
                // Comment exists, add it to the comments array of the corresponding post.
                response[row.post_id].comments.push({
                  //(author_id) REFERENCES users(id)
                    comment_id: row.comment_id,
                    comment_author: row.comment_author_username,
                    comment_text: row.comment_text,
                    comment_timestamp: row.comment_timestamp
                });
            }
        });

        return res.status(200).json({message:'success', data:response});
      // console.log('all posts with their respectives comments', rows);
      // return res.status(200).json({ message: 'Posts fetched successfully', data: rows })

    });
  } catch (error) {
    console.error(error.message);
    return res.status(400).json({ error: error.message })
  }
})

/*


# Set the path to your log file
LOG_PATH="/var/log/certbot-renewal.log"

# crontab logs
/var/log/certbot-CronJob_errors.log

# Log the current date and time
echo "Renewal script started at $(date)" >> "$LOG_PATH"

CERT_PATH="/etc/ssl/certs/nginx.crt"
KEY_PATH="/etc/ssl/private/nginx.key"
*/

// https.createServer({
//   key: fs.readFileSync("/etc/ssl/certs/nginx.crt");
//   cert: fs.readFileSync("/etc/ssl/private/nginx.key");
// },app).listen

/**

cert = /etc/letsencrypt/live/blog.juanluisja.live-0001/cert.pem
privkey = /etc/letsencrypt/live/blog.juanluisja.live-0001/privkey.pem

 */



//https
https.createServer({
  key: fs.readFileSync("/etc/letsencrypt/live/blog.juanluisja.live-0001/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/blog.juanluisja.live-0001/cert.pem"),
}, app).listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

//http
// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

