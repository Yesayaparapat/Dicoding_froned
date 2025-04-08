const STORAGE_KEY = "BOOKSHELF_APPS";
const RENDER_EVENT = "render-bookshelf";
const SEARCH_EVENT = "search-bookshelf";

let books = [];
let searchedBooks = [];
let isSearching = false;
let editedBookId = null;

const isStorageAvailable = () => {
  try {
    localStorage.setItem("test", "test");
    localStorage.removeItem("test");
    return true;
  } catch (e) {
    return false;
  }
};

const saveData = () => {
  if (isStorageAvailable()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  }
};

const loadData = () => {
  if (isStorageAvailable()) {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    if (serializedData) {
      books = JSON.parse(serializedData);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
};

const createBook = (id, title, author, year, isComplete) => {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
};

const findBookById = (bookId) => {
  return books.find((book) => book.id === bookId);
};

const findBookIndexById = (bookId) => {
  return books.findIndex((book) => book.id === bookId);
};

const addBook = () => {
  const titleInput = document.getElementById("inputBookTitle");
  const authorInput = document.getElementById("inputBookAuthor");
  const yearInput = document.getElementById("inputBookYear");
  const isCompleteCheckbox = document.getElementById("inputBookIsComplete");

  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const year = parseInt(yearInput.value);
  const isComplete = isCompleteCheckbox.checked;

  if (!title || !author || isNaN(year)) {
    alert("Mohon isi semua data buku dengan benar!");
    return;
  }

  const id = editedBookId !== null ? editedBookId : `${+new Date()}`;

  const book = createBook(id, title, author, year, isComplete);

  if (editedBookId !== null) {
    const bookIndex = findBookIndexById(id);
    if (bookIndex !== -1) {
      books[bookIndex] = book;
      editedBookId = null;

      document.getElementById("bookSubmit").innerText = "Masukkan Buku ke rak";
    }
  } else {
    books.push(book);
  }

  titleInput.value = "";
  authorInput.value = "";
  yearInput.value = "";
  isCompleteCheckbox.checked = false;

  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
};

const moveBook = (bookId) => {
  const bookIndex = findBookIndexById(bookId);

  if (bookIndex !== -1) {
    books[bookIndex].isComplete = !books[bookIndex].isComplete;
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
  }
};

const deleteBook = (bookId) => {
  const bookIndex = findBookIndexById(bookId);

  if (bookIndex !== -1) {
    const confirmDelete = confirm(
      `Apakah Anda yakin ingin menghapus buku "${books[bookIndex].title}"?`
    );

    if (confirmDelete) {
      books.splice(bookIndex, 1);
      saveData();
      document.dispatchEvent(new Event(RENDER_EVENT));
    }
  }
};

const editBook = (bookId) => {
  const book = findBookById(bookId);

  if (book) {
    document.getElementById("inputBookTitle").value = book.title;
    document.getElementById("inputBookAuthor").value = book.author;
    document.getElementById("inputBookYear").value = parseInt(book.year);
    document.getElementById("inputBookIsComplete").checked = book.isComplete;

    document.getElementById("bookSubmit").innerText = "Edit Buku";
    editedBookId = bookId;

    document.getElementById("bookForm").scrollIntoView({ behavior: "smooth" });
  }
};

const searchBooks = () => {
  const searchTerm = document
    .getElementById("searchBookTitle")
    .value.toLowerCase();

  if (searchTerm.trim() === "") {
    isSearching = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    return;
  }

  isSearching = true;
  searchedBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm)
  );

  document.dispatchEvent(new Event(SEARCH_EVENT));
};

const createBookElement = (book) => {
  const bookItem = document.createElement("div");
  bookItem.classList.add("book_item");
  bookItem.setAttribute("data-bookid", book.id);
  bookItem.setAttribute("data-testid", "bookItem");

  const titleElement = document.createElement("h3");
  titleElement.setAttribute("data-testid", "bookItemTitle");
  titleElement.innerText = book.title;

  const authorElement = document.createElement("p");
  authorElement.setAttribute("data-testid", "bookItemAuthor");
  authorElement.innerText = `Penulis: ${book.author}`;

  const yearElement = document.createElement("p");
  yearElement.setAttribute("data-testid", "bookItemYear");
  yearElement.innerText = `Tahun: ${book.year}`;

  const actionContainer = document.createElement("div");
  actionContainer.classList.add("action");

  const toggleButton = document.createElement("button");
  toggleButton.classList.add("green");
  toggleButton.setAttribute("data-testid", "bookItemIsCompleteButton");
  toggleButton.innerText = book.isComplete
    ? "Belum selesai dibaca"
    : "Selesai dibaca";
  toggleButton.addEventListener("click", () => {
    moveBook(book.id);
  });

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("red");
  deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
  deleteButton.innerText = "Hapus buku";
  deleteButton.addEventListener("click", () => {
    deleteBook(book.id);
  });

  const editButton = document.createElement("button");
  editButton.classList.add("blue");
  editButton.setAttribute("data-testid", "bookItemEditButton");
  editButton.innerText = "Edit buku";
  editButton.addEventListener("click", () => {
    editBook(book.id);
  });

  actionContainer.append(toggleButton, deleteButton, editButton);
  bookItem.append(titleElement, authorElement, yearElement, actionContainer);

  return bookItem;
};

const renderBooks = () => {
  const incompleteBookshelfList = document.getElementById(
    "incompleteBookshelfList"
  );
  incompleteBookshelfList.innerHTML = "";

  const completeBookshelfList = document.getElementById(
    "completeBookshelfList"
  );
  completeBookshelfList.innerHTML = "";

  const booksToRender = isSearching ? searchedBooks : books;

  for (const book of booksToRender) {
    const bookElement = createBookElement(book);

    if (book.isComplete) {
      completeBookshelfList.append(bookElement);
    } else {
      incompleteBookshelfList.append(bookElement);
    }
  }

  if (booksToRender.length === 0 && isSearching) {
    const noBookMessage = document.createElement("p");
    noBookMessage.classList.add("no-book-message");
    noBookMessage.innerText = "Tidak ada buku yang sesuai dengan pencarian";

    incompleteBookshelfList.append(noBookMessage.cloneNode(true));
    completeBookshelfList.append(noBookMessage);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  loadData();

  const bookForm = document.getElementById("bookForm");
  bookForm.addEventListener("submit", (e) => {
    e.preventDefault();
    addBook();
  });

  const searchForm = document.getElementById("searchBook");
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    searchBooks();
  });

  const searchInput = document.getElementById("searchBookTitle");
  searchInput.addEventListener("input", () => {
    searchBooks();
  });

  const isCompleteCheckbox = document.getElementById("inputBookIsComplete");
  const bookSubmitSpan = document.querySelector("#bookSubmit > span");

  isCompleteCheckbox.addEventListener("change", () => {
    bookSubmitSpan.innerText = isCompleteCheckbox.checked
      ? "Selesai dibaca"
      : "Belum selesai dibaca";
  });

  document.addEventListener(RENDER_EVENT, () => {
    renderBooks();
  });

  document.addEventListener(SEARCH_EVENT, () => {
    renderBooks();
  });
});