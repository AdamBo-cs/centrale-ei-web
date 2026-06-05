import cors from 'cors';
import express from 'express';
import logger from 'morgan';
import { appDataSource } from './datasource.js';
import indexRouter from './routes/index.js';
import usersRouter from './routes/users.js';
import moviesRouter from './routes/movies.js';
import reviewRouter from './routes/review.js'; // <-- AJOUTE CETTE LIGNE ICI
import { jsonErrorHandler } from './services/jsonErrorHandler.js';
import { routeNotFoundJsonHandler } from './services/routeNotFoundJsonHandler.js';
import recommendationRouter from './routes/reco_router.js';
import reviewRoutes from './routes/review.js'; // Ajuste le chemin si besoin

const startServer = async () => {
  console.log('Data Source has been initialized!');
  const app = express();

  app.use(logger('dev'));
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Register routes
  app.use('/', indexRouter);
  app.use(recommendationRouter);

  app.use('/users', usersRouter);
  app.use('/movies', moviesRouter);
  app.use('/reviews', reviewRoutes);

  // Register 404 middleware and error handler
  app.use(routeNotFoundJsonHandler); // this middleware must be registered after all routes to handle 404 correctly
  app.use(jsonErrorHandler); // this error handler must be registered after all middleware to catch all errors

  const port = parseInt(process.env.PORT || '8000');

  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
};

// 1. starts only the server
// startServer();

// 2. starts the database connection first then starts the server
appDataSource
  .initialize()
  .then(() => {
    // AJOUT TEMPORAIRE : On force l'ajout de la colonne si elle n'existe pas
    return appDataSource
      .query('ALTER TABLE user ADD COLUMN vecteur_profil TEXT NULL;')
      .then(() => {
        console.log('[SQL] Colonne vecteur_profil ajoutée avec succès !');
      })
      .catch((err) => {
        // Si la colonne existe déjà, SQLite va râler. On l'ignore proprement, c'est normal !
        console.log(
          "[SQL] La colonne existe déjà ou n'a pas pu être ajoutée :",
          err.message
        );
      });
  })
  .then(startServer) // Une fois la colonne gérée, on démarre le serveur
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });
