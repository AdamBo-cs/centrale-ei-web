import typeorm from 'typeorm';

const Review = new typeorm.EntitySchema({
  name: 'Review',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    movieId: {
      type: 'int', // Pour savoir sur quel film on est
    },
    userId: {
      type: 'int', // Pour savoir qui a écrit le commentaire
    },
    content: {
      type: 'text', // Le texte de l'avis
    },
    createdAt: {
      type: 'datetime',
      createDate: true, // TypeORM remplira la date automatiquement !
    },
  },
});

export { Review };