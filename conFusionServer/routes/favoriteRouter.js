const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');

const Favorites = require('../models/favorites');
const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: {_id: req.user._id}})
    .populate('user')
    .populate('dishes')
    .then(favorite => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorite);
    }, err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: {_id: req.user._id}})
    .then(favorite =>{
        if(!favorite){
            Favorites.create({ user: req.user._id})
            .then((favorite) => {
                for (var i = 0; i< req.body.length; i++) {
                    favorite.dishes.push(req.body[i]);
                }
                favorite.save()
                .then((favorite) =>{
                    console.log('Favorite Created ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                });
            }, (err) => next(err));
        }
        else {
            for (var i = 0; i< req.body.length; i++) {
                if(favorite.dishes.indexOf(req.body[i])< 0){
                    favorite.dishes.push(req.body[i]);
                }
            }   
            favorite.save()
            .then((favorite) =>{
                console.log('Favorite added ', favorite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(favorite);
            });
        }
    }, err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.remove({user: {_id: req.user._id}})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err));
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, (req,res,next) =>{
    res.statusCode = 403;
    res.end(`GET operation not supported on /favorites`);
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    Favorites.findOne({user: req.user._id})
    .then(favorite => {
        if(favorite==null){
            Favorites.create({ user: req.user._id})
            .then((favorite) => {
                favorite.dishes.push(req.params.dishId);                
                favorite.save()
                .then((favorite) =>{
                    console.log('Favorite Created ', favorite);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                });
            }, (err) => next(err));
        }
        else {
            if (favorite.dishes.indexOf(req.params.dishId)< 0){
                favorite.dishes.push(req.params.dishId);  
                favorite.save()
                .then((favorite) =>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                });
            }
            else {
                res.statusCode = 200;
                res.end("Favorite already added");
            }
        }
    }, err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) =>{
    res.statusCode = 403;
    res.end(`PUT operation not supported on /favorites`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user: {_id: req.user._id}})
    .then(favorite => {
        if (favorite==null) {
            res.statusCode = 200;
            res.end("No favorite to delete");
        }
        else {
            var index = favorite.dishes.indexOf(req.params.dishId);
            if (index>=0) {
                favorite.dishes.splice(index, 1);
                favorite.save()
                .then(favorite => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
            }
        }
    }, (err) => next(err));
});


module.exports = favoriteRouter;