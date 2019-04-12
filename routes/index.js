const express = require('express');
const router  = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');

router.get('/book/:id', (req, res, next) => {
  let bookId = req.params.id;
  if (!/^[0-9a-fA-F]{24}$/.test(bookId)) { 
    return res.status(404).render('not-found');
  }
  Book.findOne({'_id': bookId})
    // this is very important! this brings the associated 
    // author info from the authors collection
    // to the promise resolution
    .populate('author')
    .then(book => {
      console.log(book)

      if (!book) {
          return res.status(404).render('not-found');
      }
      res.render("book-detail", { book })
    })
    .catch(next)
});

router.post('/reviews/add', (req, res, next) => {
  const { user, comments } = req.body;
  Book.update({ _id: req.query.book_id }, { $push: { reviews: { user, comments }}})
  .then(book => {
    res.redirect('/books')
  })
  .catch((error) => {
    console.log(error)
  })
});

// this serves the new book form
router.get('/books/add', (req, res, next) => {
  res.render("book-add");
});

// this serves the book edition form
router.get('/books/edit', (req, res, next) => {
  // here we find the book via its id provided in the format ?book_id=value
  Book.findOne({_id: req.query.book_id})
  .then((book) => {
    // here we render the book info (provided from mongo via mongoose) 
    // in the book edition form
    res.render("book-edit", {book});
  })
  .catch((error) => {
    console.log(error);
  })
});

// this is the book edit endpoint, where we pass the book id in order to find it
router.post('/books/edit', (req, res, next) => {
  // please note we provide the {new: true} param so we get the updated 
  // record and that we find the book record via its id
  Book.findByIdAndUpdate(req.body._id, req.body, {new: true})
  .then((book) => {
    // res.render("book-edit", {book});

    // after updating the book we redirect the user to the all books endpoint
    // serving a list of all the books already updated
    res.redirect("/books")
  })
  .catch((error) => {
    console.log(error);
  })
});

// here we add a new book to the database using mongoose
router.post('/books/add', (req, res, next) => {
  // this is all the provided info fromn the form
  const { title, author, description, rating } = req.body;

  // here we instantiate a new Book with the provided values via the form
  const newBook = new Book({ title, author, description, rating })
  newBook.save()
    .then((book) => {

      // after saving the book in the database, we redirect the user
      // to the all books listing
      res.redirect('/books');
    })
    .catch((error) => {
      console.log(error);
    })
});

// this endpoint serves you all the books
router.get("/books", (req, res) => {
  Book
    // use a regular expression should you wanted to add a filter in the UI
    //.find({title: /^a/})
    .find()
    .sort({title: 1})
    .then(books => {
      res.render("list-books", {books})
    })
})

module.exports = router;
