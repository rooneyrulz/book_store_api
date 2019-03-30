const express = require("express");
const router = express.Router();

//Importing models
const User = require("../../models/userSchema");
const Book = require("../../models/bookSchema");


//@ Description     > Getting all of the users
//@ Route           > /users/
//@ Access Control  > Public
router.get('/', (req, res, next) => {
  return User.find()
  .sort({ date: -1 })
  .select(' -password -__v ')
  .exec()
  .then(users => {
    if (users.length < 1) {
      return res.status(409).json({
        msg: `no users found...`
      });
    }

    let usersList = users.map(user => {
      return {...user._doc};
    });

    return res.status(200).json({
      users: usersList
    });

  })
  .catch(err => {
    throw err.message;
  });
});





//@ Description     > Getting users by id
//@ Route           > /users/:id
//@ Access Control  > Public
router.get('/:id', (req, res, next) => {
  const userId = req.params.id;

  return User.findOne({ _id: userId })
  .select(' -password -__v ')
  .exec()
  .then(user => {
    if (!user) {
      return res.status(409).json({
        msg: `no user exist with this id...`
      });
    }

    return res.status(200).json({
      user: {...user._doc}
    });
  })
  .catch(err => {
    throw err.message;
  });
});




//@ Description     > Deleting users
//@ Route           > /users/:id
//@ Access Control  > Private
router.delete('/:id', (req, res, next) => {
  const userId = req.params.id;

  return Book.find({ author: userId })
  .exec()
  .then(books => {
    if (books.length >= 1) {
      return Book.deleteMany({ author: userId }).exec();
    }

    next();
  })
  .then(books => {
    return User.findOne({ _id: userId }).exec();
  })
  .then(user => {
    if (!user) {
      return res.status(409).json({
        msg: `no author found...`
      });
    }

    return User.deleteOne({ _id: userId }).exec();
  })
  .then(user => {
    return res.status(200).json({
      success: true
    });
  })
  .catch(err => {
    throw err.message;
  });
});


module.exports = router;