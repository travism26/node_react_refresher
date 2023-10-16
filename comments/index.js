const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

// curl http://localhost:4001/posts/123/comments
app.get('/posts/:id/comments', (req, res) => {
    console.log('Recieved get request');
    res.send(commentsByPostId[req.params.id] || []);
});

/**
 * curl --header "Content-Type: application/json" \
--request POST \
--data '{ "content": "hello world" }' \
http://localhost:4001/posts/123/comments
 */
app.post('/posts/:id/comments', async (req, res) => {
    console.log('Recieved POST request');
    const commentId = randomBytes(4).toString('hex');
    const { content } = req.body;

    const comments = commentsByPostId[req.params.id] || [];

    comments.push({ id: commentId, content, status: 'pending' });
    commentsByPostId[req.params.id] = comments;

    await axios.post('http://localhost:4005/events', {
        type: 'CommentCreated',
        data: {
            id: commentId,
            content,
            postId: req.params.id,
            status: 'pending'
        }
    });

    res.status(201).send(comments);
});

app.post('/events', async (req, res) => {
    console.log('Received Event', req.body.type);

    const { type, data } = req.body;

    if (type === 'CommentModerated') {
        const { postId, id, status, content } = data;

        const comments = commentsByPostId[postId];
        const comment = comments.find((comment) => {
            return comment.id === id;
        });
        comment.status = status;
        await axios.post('http://localhost:4005/events', {
            type: 'CommentUpdated',
            data: {
                id,
                status,
                postId,
                content
            }
        });
    }
    res.send({});
});

app.listen(4001, () => {
    console.log('listening on 4001');
});
