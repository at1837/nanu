import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    date: { type: String, required: true },
    slot: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    service: { type: String, required: true },
  },
  { timestamps: true }
);

const Book = mongoose.models.Book || mongoose.model('Book', bookSchema);
export { Book };
