const express = require('express');
const favoriteRouter = express.Router();
const authenticate = require('../authenticate');
const Favorite = require('../models/favorite');
const cors = require('./cors');


favoriteRouter
  .route('/')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({
      user: req.user._id,
    })
      .populate('user')
      .populate('campsites')
      .then((favorites) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorites) => {
        if (favorites) {
          for (let i = 0; i < req.body.length; i++) {
            if (favorites.campsites.includes(req.body[i]._id)) {
              favorites.campsites.push(req.body[i]._id);
            }
          }
          favorites.save().then((favorites) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
          });
        } else {
          Favorite.create({ user: req.user._id, campsites: req.body }).then(
            (favorite) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorite);
            }
          );
        }
      })
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id }).then((favorite) => {
      if (favorite) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
      } else {
        res.setHeader('Content-Type', 'text/plain');
        res.end('You do not have any favorites to delete!');
      }
    });
  });

favoriteRouter
  .route('/:campsiteId')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(
      `GET operation not supported on /favorites/${req.params.campsiteId}`
    );
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user.__id }).then((favorites) => {
      if (favorites) {
        if (!favorites.campsites.includes(req.params.campsiteId)) {
          favorites.campsites.push(req.params.campsiteId);
          favorites.save().then((favorites) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.jaon(favorites);
          });
        } else {
          res.send('That campsite is already in the list of favorites!');
        }
      } else {
        Favorite.create({ user: req.user._id, campsites: req.body }).then(
          (favorite) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorite);
          }
        );
      }
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(
      `PUT operation not supported on /favorites/${req.params.campsiteId}`
    );
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          if (favorite.indexOf(req.params.campsiteId)) {
            favorite.splice(req.params.campsiteId, 1);
            favorite.save().then((favorite) => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json(favorite);
            });
          }
        } else {
          res.setHeader('Content-Type', 'text/plain');
          res.end('There are no favorites to delete');
        }
      })
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;
