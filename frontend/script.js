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



    // --------------------------LIBRARIAN CRUD-------------------------------------------
    // --------------------------LIBRARIAN CRUD-------------------------------------------
const librariansList = document.getElementById('librarians-list'); // List of librarians
const addLibrarianForm = document.getElementById('add-librarian-form'); // Form for adding librarians
const editLibrarianForm = document.getElementById('edit-librarian-form'); // Form for editing librarians

// Fetch librarians
async function fetchLibrarians() {
    try {
        const response = await fetch('http://localhost:3000/api/librarians');
        if (response.ok) {
            const librarians = await response.json();

            librariansList.innerHTML = '';
            librarians.forEach(librarian => {
                const listItem = document.createElement('li');
                listItem.classList.add('librarian-item');

                listItem.innerHTML = `
                    <strong>Name:</strong> ${librarian.name} <br>
                    <strong>Email:</strong> ${librarian.email} <br>
                    <strong>Phone:</strong> ${librarian.phone} <br>
                    <button onclick="populateEditForm(${librarian.id}, '${librarian.name}', '${librarian.email}', '${librarian.phone}')">Edit</button>
                    <button onclick="deleteLibrarian(${librarian.id})">Delete</button>
                `;

                librariansList.appendChild(listItem);
            });
        } else {
            console.error('Failed to fetch librarians:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching librarians:', error);
    }
}

// Add a new librarian
async function addLibrarian(event) {
    event.preventDefault();

    const formData = new FormData(addLibrarianForm);
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');

    try {
        const response = await fetch('http://localhost:3000/api/librarians', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone }),
        });

        if (response.ok) {
            alert('Librarian added!');
            addLibrarianForm.reset(); // Clear the form
            fetchLibrarians(); // Refresh the list
        } else {
            console.error('Failed to add librarian:', response.statusText);
        }
    } catch (error) {
        console.error('Error adding librarian:', error);
    }
}

// Populate the edit form with librarian details
function populateEditForm(id, name, email, phone) {
    editLibrarianForm.querySelector('input[name="id"]').value = id;
    editLibrarianForm.querySelector('input[name="name"]').value = name;
    editLibrarianForm.querySelector('input[name="email"]').value = email;
    editLibrarianForm.querySelector('input[name="phone"]').value = phone;

    // Show the edit form
    editLibrarianForm.style.display = 'block';
}

// Update an existing librarian
async function updateLibrarian(event) {
    event.preventDefault();

    const formData = new FormData(editLibrarianForm);
    const id = formData.get('id');
    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');

    try {
        const response = await fetch(`http://localhost:3000/api/librarians/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone }),
        });

        if (response.ok) {
            alert('Librarian updated!');
            editLibrarianForm.reset(); // Clear the form
            editLibrarianForm.style.display = 'none'; // Hide the edit form
            fetchLibrarians(); // Refresh the list
        } else {
            console.error('Failed to update librarian:', response.statusText);
        }
    } catch (error) {
        console.error('Error updating librarian:', error);
    }
}

// Delete a librarian
async function deleteLibrarian(id) {
    if (!confirm('Are you sure you want to delete this librarian?')) return;

    try {
        const response = await fetch(`http://localhost:3000/api/librarians/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            alert('Librarian deleted!');
            fetchLibrarians(); // Refresh the list
        } else {
            console.error('Failed to delete librarian:', response.statusText);
        }
    } catch (error) {
        console.error('Error deleting librarian:', error);
    }
}

// Show the Add Librarian Modal
function showAddLibrarianForm() {
    const modal = document.getElementById('addLibrarianModal');
    modal.style.display = 'block'; // Make the modal visible
}

// Hide the Add Librarian Modal
function hideAddLibrarianForm() {
    const modal = document.getElementById('addLibrarianModal');
    modal.style.display = 'none'; // Hide the modal
    document.getElementById('addLibrarianForm').reset(); // Reset the form fields
}

// Attach event listeners
addLibrarianForm.addEventListener('submit', addLibrarian);
editLibrarianForm.addEventListener('submit', updateLibrarian);

// Add deleteLibrarian and populateEditForm to the global scope
window.deleteLibrarian = deleteLibrarian;
window.populateEditForm = populateEditForm;

// Fetch librarians on page load
fetchLibrarians();

  });
  