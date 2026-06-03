import express from 'express';
import { Movie } from '../entities/movie.js';
import { appDataSource } from '../datasource.js';

const router = express.Router();

router.get('/', function (req, res) {
  console.log('test du GET /movies');
  res.send('test');
  //   res.json([]);
});

router.post('/new', function (req, res) {
  const MovieRepository = appDataSource.getRepository(Movie);
  const newMovie = MovieRepository.create({
    date: req.body.date,
    name: req.body.name,
  });
  MovieRepository.insert(newMovie)
    .then(function () {
      res.status(201).json({
        message: 'Movie successfully created',
      });
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).json({ message: 'Error while creating the user' });
    });
});

router.get('/:id', function (req, res) {
  const idDuFilm = req.params.id;
  const MovieRepository = appDataSource.getRepository(Movie);

  MovieRepository.findOneBy({ id: idDuFilm })
    .then(function (filmTrouve) {
      if (filmTrouve) {
        res.status(200);
        res.json(filmTrouve);
      } else {
        res.status(404);
        res.json({ message: "Film introuvable" });
      }
    })
    .catch(function (error) {
      console.error(error);
      res.status(500);
      res.json({ message: "Erreur serveur" });
    });
});


router.delete('/:id', function (req, res) {
  appDataSource
    .getRepository(Movie)
    .delete({ id: req.params.id })
    .then(function () {
      res.status(200).json({ message: 'Movie successfully deleted' });
    })
    .catch(function () {
      res.status(500).json({ message: 'Error while deleting the movie' });
    });
});

export default router;
