const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let bookSchema = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId
  },

  name: {
    type: String,
    unique: true,
    required: [true, 'book name is required...']
  },

  description: {
    type: String,
    required: [true, 'leave some description about the book..']
  },

  bookImage: {
    type: String,
    required: [true, 'book image is required...']
  },

  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },

  date: {
    type: Date,
    default: Date.now
  }
});


module.exports = mongoose.model('Book', bookSchema);