let booksList;

// navigation
document.addEventListener('DOMContentLoaded', () => {
    fetchBooks();
    booksList = document.getElementById('books-list');
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                showSection(targetId);
                
                // Update active state
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });

    // form submissions
    setupFormHandlers();

    updateDisplays();

    // Add the searchBooks function to the global scope for use in HTML
    window.searchBooks = searchBooks;
});

// BOOK -----------------------------------------------------
async function fetchBooks() {
        try {
          const response = await fetch('http://localhost:3000/api/books');
          if (response.ok) {
            booksList = await response.json();
            updateBookDisplay();
          } else {
            console.error('Failed to fetch books:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching books:', error);
        }
}
 // Search for a book by ID
async function searchBooks() {
    const bookId = bookSearch.value.trim();
    if (!bookId) {
      alert('Please enter a book ID to search.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/books/${bookId}`);
      if (response.ok) {
        const book = await response.json();

        booksList = [book];

        // Call updateBookDisplay to show only the searched book
        updateBookDisplay();
      } else if (response.status === 404) {
        alert('Book not found.');
      } else {
        console.error('Failed to fetch book:', response.statusText);
      }
    } catch (error) {
      console.error('Error searching for book:', error);
    }
}

async function addBook(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    // Gather form data
    const bookData = {
        title: document.getElementById('bookTitle').value,
        author_name: document.getElementById('authorName').value,
        publication_year: document.getElementById('publishDate').value,
        genre: document.getElementById('genre').value,
        available_copies: parseInt(document.getElementById('availableCopies').value, 10),
    };

    try {
        // Send data to the backend
        const response = await fetch('http://localhost:3000/api/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookData),
        });

        if (response.ok) {
            const newBook = await response.json();
            console.log('Book added successfully:', newBook);
            // Optionally refresh the book list
            updateBookDisplay();
            hideAddBookForm();
        } else {
            console.error('Failed to add book:', response.statusText);
            alert('Failed to add book. Please try again.');
        }
    } catch (error) {
        console.error('Error adding book:', error);
        alert('An error occurred while adding the book. Please try again.');
    }
}

// section Display
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId)?.classList.add('active');
}

// modal functions
function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// form handlers
function setupFormHandlers() {

    // add book form
    const addBookForm = document.getElementById('addBookForm');
    if (addBookForm) {
        addBookForm.addEventListener('submit', handleAddBook);
    }

    // add member form
    const addMemberForm = document.getElementById('addMemberForm');
    if (addMemberForm) {
        addMemberForm.addEventListener('submit', handleAddMember);
    }

    // new loan form
    const newLoanForm = document.getElementById('newLoanForm');
    if (newLoanForm) {
        newLoanForm.addEventListener('submit', handleNewLoan);
    }

    // add librarian form
    const addLibrarianForm = document.getElementById('addLibrarianForm');
    if (addLibrarianForm) {
        addLibrarianForm.addEventListener('submit', handleAddLibrarian);
    }
}

function handleAddMember(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const member = {
        id: Date.now(),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        startDate: formData.get('startDate')
    };
    
    members.push(member);
    updateMemberDisplay();
    hideModal('addMemberModal');
    event.target.reset();
}

function handleNewLoan(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const loan = {
        id: Date.now(),
        memberId: formData.get('memberId'),
        bookId: formData.get('bookId'),
        loanDate: formData.get('loanDate'),
        returnDate: formData.get('returnDate'),
        status: 'active'
    };
    
    loans.push(loan);
    updateLoanDisplay();
    event.target.reset();
}

function handleAddLibrarian(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const librarian = {
        id: Date.now(),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        hireDate: formData.get('hireDate')
    };
    
    librarians.push(librarian);
    updateLibrarianDisplay();
    hideModal('addLibrarianModal');
    event.target.reset();
}

function handleEditMember(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const id = parseInt(formData.get('id'));
    const member = members.find(member => member.id === id);
    if (member) {
        member.firstName = formData.get('firstName');
        member.lastName = formData.get('lastName');
        member.email = formData.get('email');
        member.phone = formData.get('phone');
        member.startDate = formData.get('startDate');
        updateMemberDisplay();
        hideModal('editMemberModal');
    }
}

function handleEditBook(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const id = parseInt(formData.get('id')); // Find the book in booksList
    const book = booksList.find(book => book.id === id);
    if (book) {
        // update info
        book.title = formData.get('title');
        book.author_name = formData.get('author');
        book.genre = formData.get('genre');
        book.publication_year = formData.get('publicationDate');
        book.available_copies = parseInt(formData.get('availableCopies'));
        updateBookDisplay();
        hideModal('editBookModal');
    }
}

function editLibrarian(id) {
    const librarian = librarians.find(librarian => librarian.id === id);
    if (librarian) {
        document.getElementById('editLibrarianId').value = librarian.id;
        document.getElementById('editFirstName').value = librarian.firstName;
        document.getElementById('editLastName').value = librarian.lastName;
        document.getElementById('editEmail').value = librarian.email;
        document.getElementById('editHireDate').value = librarian.hireDate;
        showModal('editLibrarianModal');
    }
}

function editMember(id) {
    const member = members.find(member => member.id === id);
    if (member) {
        document.getElementById('editMemberId').value = member.id;
        document.getElementById('editMemberFirstName').value = member.firstName;
        document.getElementById('editMemberLastName').value = member.lastName;
        document.getElementById('editMemberEmail').value = member.email;
        document.getElementById('editMemberPhone').value = member.phone;
        document.getElementById('editMemberStartDate').value = member.startDate;
        showModal('editMemberModal');
    }
}

function editBook(id) {
    const book = booksList.find(book => book.id === id);
    if (book) {
        document.getElementById('editBookId').value = book.id;
        document.getElementById('editBookTitle').value = book.title;
        document.getElementById('editBookAuthor').value = book.author_name;
        document.getElementById('editBookGenre').value = book.genre;
        document.getElementById('editBookPublicationDate').value = book.publication_year;
        document.getElementById('editBookAvailableCopies').value = book.available_copies;
        showModal('editBookModal');
    }
}

function searchMembers() {
    const searchTerm = document.getElementById('memberSearch').value.toLowerCase();
    const filteredMembers = members.filter(member =>
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm) ||
        member.email.toLowerCase().includes(searchTerm)
    );
    updateMemberDisplay(filteredMembers);
}

// display updates
function updateDisplays() {
    updateBookDisplay();
    updateMemberDisplay();
    updateLoanDisplay();
    updateLibrarianDisplay();
}

async function updateBookDisplay() {
    const bookListElement = document.querySelector('.books-list');
    if (!bookListElement) return;
    bookListElement.innerHTML = booksList.map(book => `
        <div class="list-item">
            <div>
                <h3>${book.title}</h3>
                <p>Author: ${book.author_name}</p>
                <p>Genre: ${book.genre}</p>
                <p>Available Copies: ${book.available_copies}</p>
                <p>id: ${book.book_id}</p>
            </div>
            <div>
                <button class="btn" onclick="editBook(${book.book_id})">Edit</button>
                <button class="btn btn-cancel" onclick="deleteBook(${book.book_id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function updateMemberDisplay(membersToShow = members) {
    const memberList = document.querySelector('.member-list');
    if (!memberList) return;
    
    memberList.innerHTML = membersToShow.map(member => `
        <div class="list-item">
            <div>
                <h3>${member.firstName} ${member.lastName}</h3>
                <p>Email: ${member.email}</p>
                <p>Phone: ${member.phone}</p>
            </div>
            <div>
                <button class="btn" onclick="editMember(${member.id})">Edit</button>
                <button class="btn btn-cancel" onclick="deleteMember(${member.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function updateLoanDisplay() {
    const loansList = document.querySelector('.current-loans');
    if (!loansList) return;
    
    loansList.innerHTML = loans.map(loan => `
        <div class="list-item">
            <div>
                <h3>Loan #${loan.id}</h3>
                <p>Member ID: ${loan.memberId}</p>
                <p>Book ID: ${loan.bookId}</p>
                <p>Return Date: ${loan.returnDate}</p>
            </div>
            <div>
                <button class="btn" onclick="extendLoan(${loan.id})">Extend</button>
                <button class="btn btn-add" onclick="returnLoan(${loan.id})">Return</button>
            </div>
        </div>
    `).join('');
}

function updateLibrarianDisplay() {
    const librarianList = document.querySelector('.librarian-list');
    if (!librarianList) return;
    
    librarianList.innerHTML = librarians.map(librarian => `
        <div class="list-item">
            <div>
                <h3>${librarian.firstName} ${librarian.lastName}</h3>
                <p>Email: ${librarian.email}</p>
                <p>Hire Date: ${librarian.hireDate}</p>
            </div>
            <div>
                <button class="btn" onclick="editLibrarian(${librarian.id})">Edit</button>
                <button class="btn btn-cancel" onclick="deleteLibrarian(${librarian.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// modal show/hide functions
function showAddBookForm() {
    showModal('addBookModal');
}

function hideAddBookForm() {
    hideModal('addBookModal');
}

function showAddMemberForm() {
    showModal('addMemberModal');
}

function hideAddMemberForm() {
    hideModal('addMemberModal');
}

function showAddLibrarianForm() {
    showModal('addLibrarianModal');
}

function hideAddLibrarianForm() {
    hideModal('addLibrarianModal');
}

function hideEditLibrarianForm() {
    hideModal('editLibrarianModal');
}

function hideEditBookForm() {
    hideModal('editBookModal');
}

function hideEditMemberForm() {
    hideModal('editMemberModal');
}

async function deleteBook(id) {
    if (confirm('Are you sure you want to delete this book?')) {
        try {
            // Send DELETE request to the backend API
            const response = await fetch(`http://localhost:3000/api/books/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Remove the book from the local `booksList`
                booksList = booksList.filter(book => book.id !== id);

                // Update the display after deletion
                fetchBooks();

                alert('Book successfully deleted.');
            } else if (response.status === 404) {
                alert('Book not found.');
            } else {
                console.error('Failed to delete book:', response.statusText);
                alert('An error occurred while deleting the book.');
            }
        } catch (error) {
            console.error('Error deleting book:', error);
            alert('Could not delete the book. Please try again.');
        }
    }
}

function deleteMember(id) {
    if (confirm('Are you sure you want to delete this member?')) {
        members = members.filter(member => member.id !== id);
        updateMemberDisplay();
    }
}

function deleteLibrarian(id) {
    if (confirm('Are you sure you want to delete this librarian?')) {
        librarians = librarians.filter(librarian => librarian.id !== id);
        updateLibrarianDisplay();
    }
}

function extendLoan(id) {
    const loan = loans.find(loan => loan.id === id);
    if (loan) {
        const currentReturn = new Date(loan.returnDate);
        currentReturn.setDate(currentReturn.getDate() + 14); // Extend by 14 days
        loan.returnDate = currentReturn.toISOString().split('T')[0];
        updateLoanDisplay();
    }
}

function returnLoan(id) {
    if (confirm('Confirm book return?')) {
        loans = loans.filter(loan => loan.id !== id);
        updateLoanDisplay();
    }
}