import { Schema as _Schema, model } from 'mongoose';

const Schema = _Schema;

const bookSchema = new Schema({
  _id: {
    type: _Schema.Types.ObjectId,
  },

  name: {
    type: String,
    unique: true,
    required: [true, 'book name is required...'],
  },

  description: {
    type: String,
    required: [true, 'leave some description about the book..'],
  },

  bookImage: {
    type: String,
    required: [true, 'book image is required...'],
  },

  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

export default model('Book', bookSchema);
