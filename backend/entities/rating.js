import typeorm from 'typeorm';

const Rating = new typeorm.EntitySchema({
  name: 'Rating',
  columns: {
    id: {
      primary: true,
      type: Number,
      generated: true,
    },
    userId: {
      type: Number,
    },
    movieId: {
      type: Number,
    },
    score: {
      type: Number, // La note donnée au film
    },
  },
  uniques: [
    {
      name: 'UNIQUE_USER_MOVIE',
      columns: ['userId', 'movieId'], // Empêche les doublons de notation
    },
  ],
});

export default Rating;