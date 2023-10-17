const express = require('express');
const { randomBytes } = require('crypto');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const posts = {};
// curl http://localhost:4000/posts
app.get('/posts', (req, res) => {
    console.log('Recieved get request');
    res.send(posts);
});

/**
 * How to make a curl call
curl --header "Content-Type: application/json" \
--request POST \
--data '{ "title": "hello" }' \
http://localhost:4000/posts
 */
app.post('/posts', async (req, res) => {
    const id = randomBytes(4).toString('hex');
    const { title } = req.body;
    console.log('Recieved post request' + title);
    posts[id] = {
        id,
        title
    };
    await axios.post('http://event-bus-srv:4005/events', {
        type: 'PostCreated',
        data: {
            id,
            title
        }
    });

    res.status(201).send(posts[id]);
});

app.post('/events', (req, res) => {
    console.log('Received Event', req.body.type);
    res.send({});
});

app.listen(4000, () => {
    console.log('V55');
    console.log('Listening on 4000');
});
