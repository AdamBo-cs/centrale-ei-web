import typeorm from 'typeorm';

const User = new typeorm.EntitySchema({
  name: 'User',
  columns: {
    id: {
      primary: true,
      type: Number,
      generated: true,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      nullable: true,
    },
    firstname: { type: String },
    lastname: { type: String },
    theme: {
      type: String,
      default: 'light', // Préférence visuelle par défaut
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    vecteur_profil: {
      type: 'text',
      nullable: true, // Sera "null" tant que l'utilisateur n'a noté aucun film
    },
  },
});

export default User;
