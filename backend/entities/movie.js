import typeorm from 'typeorm';

const Movie = new typeorm.EntitySchema({
  name: 'Movie',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    name: {
      type: 'varchar',
    },
    date: {
      type: 'varchar',
      nullable: true, // nullable: true évite que ça plante si un vieux film n'a pas de date
    },
    image: {
      type: 'varchar',
      nullable: true, // Pour l'affiche du film
    },
    synopsis: {
      type: 'text',
      nullable: true, // Pour le long résumé en français
    },
    rating: {
      type: 'float',
      nullable: true, // Pour la note sur 10 (ex: 8.4)
    },
    banner: {
      type: 'varchar',
      nullable: true, // Pour la grande image de fond
    },
    duration: {
      type: 'int',
      nullable: true, // Pour la durée en minutes (ex: 148)
    },
    budget: {
      type: 'bigint',
      nullable: true, // Pour les gros chiffres de budget
    },
    tagline: {
      type: 'varchar',
      nullable: true, // Pour le slogan du film
    },
    original_language: {
      type: 'varchar',
      nullable: true, // Pour la langue d'origine (ex: 'en', 'fr')
    },
    director: {
      type: 'varchar',
      nullable: true,
    },
    actors: {
      type: 'varchar',
      nullable: true,
    },
    keywords: {
      type: 'text',
      nullable: true,
    },
    trailer_key: {
      type: 'varchar',
      nullable: true, // Stockera l'ID YouTube (ex: "dQw4w9WgXcQ")
    },
    revenue: {
      type: 'bigint',
      nullable: true,
    },
    status: {
      type: 'varchar',
      nullable: true,
    },
    homepage: {
      type: 'varchar',
      nullable: true,
    },
    genres: {
      type: 'varchar',
      nullable: true,
    },
  },
});

export { Movie };
