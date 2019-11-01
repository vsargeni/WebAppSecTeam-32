//npm run build
//nodemon lib/api.js
import functions = require('firebase-functions');
import bodyParser = require('body-parser');
import favicon = require('serve-favicon');
import firebase = require('firebase');
import express = require('express');
import cors = require('cors');
import http = require('http');
import path = require('path');

const api = express();
api.use('./', express.static(path.join(__dirname, './public')));
api.use(bodyParser.urlencoded({ extended: false }));
api.set('port', process.env.PORT || 4000);
api.use(favicon('./images/vm.ico'));
api.use(cors({ origin: true }));
api.use(bodyParser.json())

firebase.initializeApp({
    credential: './firebaseConfig.json',
    databaseURL: "https://redditcloneproj-ae2b4.firebaseio.com"
});

// Get a reference to the database service
const db = firebase.app().database();
const ref = firebase.app().database().ref();
const usersRef = ref.child('/users');
const subredditsRef = ref.child('/subreddits');

//Users
api.get('/users', function (req, res) {
    // tslint:disable-next-line: no-floating-promises
    usersRef.once('value', function (snapshot) {
        const users: (string | null)[] = [];
        console.log("# of Users: " + snapshot.numChildren());
        snapshot.forEach(function (childSnapshot) {
            const childKey = childSnapshot.key;
            users.push(childKey);
        });
        res.send(users);
    });
});
api.get('/users/:id', function (req, res) {
    // tslint:disable-next-line: no-floating-promises
    db.ref(`/users/${req.params.id}`).once('value').then(function (snapshot) {
        const username = (snapshot.val().name) || 'DNE';
        res.send(username);
    })
    console.log(`User ${req.params.id} fetched`);
});
api.post('users/:id', function (req, res) {
    // tslint:disable-next-line: no-floating-promises
    ref.child("users").set({
        name: req.body.name,
        online: true,
        posts: null
    });
    res.send(name);
    console.log(`User ${req.params.id} created`);
});
api.put('users/:id', function (req, res) {
    // tslint:disable-next-line: no-floating-promises
    db.ref(`/users/${req.params.id}`).update({
        name: req.body.name,
        online: true,
    })
    res.send(`User ${req.params.id} new name: ${req.body.name}`);
    console.log(`User ${req.params.id} new name: ${req.body.name}`);
});
api.delete('users/:id', function (req, res) {
    // tslint:disable-next-line: no-floating-promises
    db.ref(`/users/${req.params.id}`).update({
        name: null,
        online: null,
        posts: null
    })
    res.send(`User ${req.params.body} deleted`);
    console.log(`User ${req.params.body} deleted`);
});

//Subreddits
api.get('/subreddits', function (req, res) {
    // tslint:disable-next-line: no-floating-promises
    subredditsRef.once('value', function (snapshot) {
        const subreddits: (string | null)[] = [];
        console.log("# of Subreddits: " + snapshot.numChildren());
        snapshot.forEach(function (childSnapshot) {
            const childKey = childSnapshot.key;
            subreddits.push(childKey);
        });
        res.send(subreddits);
    });
});
api.get('/subreddits/:subreddit', function (req, res) {
    // tslint:disable-next-line: no-floating-promises
    subredditsRef.child(req.params.subreddit).once('value', function (snapshot) {
        const posts: (string | null)[] = [];
        console.log("# of Posts: " + snapshot.numChildren());
        snapshot.forEach(function (childSnapshot) {
            const childKey = childSnapshot.key;
            posts.push(childKey);
        });
        res.send(posts);
    });
});
api.post('subreddits/:subreddit', function (req, res) {
    // tslint:disable-next-line: no-floating-promises
    db.ref(`/subreddits/${req.params.subreddit}`).set({
        name: req.params.subreddit
    });
    res.send(req.params.subreddit);
    console.log(`Subreddit ${req.params.subreddit} created`);
});
api.delete('subreddits/:subreddit', function (req, res) {
    // tslint:disable-next-line: no-floating-promises
    db.ref(`/subreddits/${req.params.subreddit}`).set({
        name: null
    });
    res.send(req.params.subreddit);
    console.log(`Subreddit ${req.params.subreddit} deleted`);
});

//Posts
api.get('/subreddits/:subreddit/:post', function (req, res) {
    // tslint:disable-next-line: no-floating-promises
    db.ref(`/subreddits/${req.params.subreddit}/${req.params.post}`).once('value').then(function (snapshot) {
        const post = (snapshot.val().content && snapshot.val().title) || 'DNE';
        res.send(post);
    })
    console.log(`User ${req.params.id} fetched`);
});
api.post('subreddits/:subreddit/:post', function (req, res) {
    // tslint:disable-next-line: no-floating-promises
    db.ref(`subreddits/${req.params.subreddit}/${req.params.post}`).set({
        name: req.body.title,
        content: req.body.content
    });
    res.send(name);
    console.log(`User ${req.params.body} created`);
});
api.put('subreddits/:subreddit/:post', function (req, res) {
    // tslint:disable-next-line: no-floating-promises
    db.ref(`subreddits/${req.params.subreddit}/${req.params.post}`).set({
        content: req.body.content
    });
    res.send(`Post ${req.params.post} new title: ${req.body.title}`);
    console.log(`Post ${req.params.post} new title: ${req.body.title}`);
});
api.delete('subreddits/:subreddit/:post', function (req, res) {
    // tslint:disable-next-line: no-floating-promises
    db.ref(`subreddits/${req.params.subreddit}/${req.params.post}`).set({
        title: null,
        content: null,
    })
    res.send(`Post ${req.params.post} deleted`);
    console.log(`Post ${req.params.post} deleted`);
});

http.createServer(api).listen(api.get('port'), function () {
    console.log('App Server Running: ' + api.get('port'));
});

// Expose Express API as a single Cloud Function:
exports.api = functions.https.onRequest(api);
