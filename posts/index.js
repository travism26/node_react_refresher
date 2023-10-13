const express = require('express');
const { randomBytes } = require('crypto');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const posts = {};
// curl http://localhost:4000/posts
app.get('/posts', (req, res) => {
    res.send(posts);
});

/**
 * How to make a curl call
curl --header "Content-Type: application/json" \
--request POST \
--data '{ "title": "hello" }' \
http://localhost:4000/posts
 */
app.post('/posts', (req, res) => {
    const id = randomBytes(4).toString('hex');
    const { title } = req.body;
    posts[id] = {
        id,
        title
    };
    res.status(201).send(posts[id]);
});

app.listen(4000, () => {
    console.log('Listening on 4000');
});
