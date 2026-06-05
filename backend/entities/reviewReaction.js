import typeorm from 'typeorm';

const ReviewReaction = new typeorm.EntitySchema({
  name: 'ReviewReaction',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    reviewId: {
      type: 'int', // Le commentaire ciblé
    },
    userId: {
      type: 'int', // L'utilisateur qui a cliqué sur like/dislike
    },
    type: {
      type: 'varchar', // Stockera soit 'like', soit 'dislike'
    },
  },
});

export { ReviewReaction };