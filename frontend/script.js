document.addEventListener('DOMContentLoaded', () => {
    // Get the container element where books will be displayed
    const booksList = document.getElementById('books-list');
  
    // Fetch books from the backend API
    async function fetchBooks() {
      try {
        const response = await fetch('http://localhost:3000/api/books');
        if (response.ok) {
          const books = await response.json();
          
          // Clear the list before adding new books
          booksList.innerHTML = '';
          
          // Iterate through the books and create list items for each
          books.forEach(book => {
            const listItem = document.createElement('li');
            listItem.classList.add('book-item');
            
            // Format the publication year to a more readable format
            const formattedDate = new Date(book.publication_year).toLocaleDateString();
  
            // Add the book details to the list item
            listItem.innerHTML = `
              <strong>Title:</strong> ${book.title} <br>
              <strong>Author:</strong> ${book.author_name} <br>
              <strong>Publication Year:</strong> ${formattedDate} <br>
              <strong>Genre:</strong> ${book.genre} <br>
              <strong>Available Copies:</strong> ${book.available_copies}
            `;
            
            // Append the list item to the books list
            booksList.appendChild(listItem);
          });
        } else {
          console.error('Failed to fetch books:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    }

    // Search for a book by ID
  async function searchBooks() {
    const bookId = bookSearchInput.value.trim();
    if (!bookId) {
      alert('Please enter a book ID to search.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/books/${bookId}`);
      if (response.ok) {
        const book = await response.json();

        // Clear the list before displaying the searched book
        booksList.innerHTML = '';

        // Format the publication year to a more readable format
        const formattedDate = new Date(book.publication_year).toLocaleDateString();

        // Create a list item for the book
        const listItem = document.createElement('li');
        listItem.classList.add('book-item');

        // Add the book details to the list item
        listItem.innerHTML = `
          <strong>Title:</strong> ${book.title} <br>
          <strong>Author:</strong> ${book.author_name} <br>
          <strong>Publication Year:</strong> ${formattedDate} <br>
          <strong>Genre:</strong> ${book.genre} <br>
          <strong>Available Copies:</strong> ${book.available_copies}
        `;

        // Append the list item to the books list
        booksList.appendChild(listItem);
      } else if (response.status === 404) {
        alert('Book not found.');
      } else {
        console.error('Failed to fetch book:', response.statusText);
      }
    } catch (error) {
      console.error('Error searching for book:', error);
    }
  }

  // Add the searchBooks function to the global scope for use in HTML
  window.searchBooks = searchBooks;
  
    // Call the fetchBooks function to populate the list when the page loads
    fetchBooks();
  });
  