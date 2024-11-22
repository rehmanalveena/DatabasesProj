booksList = [];
// let membersList;

// navigation
document.addEventListener('DOMContentLoaded', () => {
    booksListElement = document.getElementById('books-list');
    //membersList = document.getElementById('members-list');

    console.log('DOMContentLoaded fired');
    if (booksListElement) {
        console.log('booksList element found');
    } else {
        console.error('booksList element not found');
    }
    
    // NAV BAR FUNCTIONS
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

    fetchBooks();
    console.log("fetch books called");
    updateDisplays();
    console.log("updateDisplays called");

    console.log("HELLO");

    // Add the searchBooks function to the global scope for use in HTML
    window.searchBooks = searchBooks;
});

// BOOK -----------------------------------------------------
async function fetchBooks() {
        try {
          const response = await fetch('http://localhost:3000/api/books');
          if (response.ok) {
            const data = await response.json();
            booksList = Array.isArray(data) ? data : data.books || [];
            updateBookDisplay();
          } else {
            console.error('Failed to fetch books:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching books:', error);
        }
}

async function fetchMembers() {
    try {
      const response = await fetch('http://localhost:3000/api/members');
      if (response.ok) {
        booksList = await response.json();
        updateMemberDisplay();
      } else {
        console.error('Failed to fetch members:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
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
    console.log("just called");
    // Gather form data
    const bookData = {
        title: document.getElementById('bookTitle').value,
        author_name: document.getElementById('authorName').value,
        publication_year: document.getElementById('publishDate').value,
        genre: document.getElementById('genre').value,
        available_copies: parseInt(document.getElementById('availableCopies').value, 10),
    };

    console.log("gathered form data", bookData);

    try {
        console.log("entered try catch");
        // Send data to the backend
        const response = await fetch('http://localhost:3000/api/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookData),
        });
        console.log("sent to backend");

        if (response.ok) {
            console.log("response okay");
            const newBook = await response.json();
            console.log('Book added successfully:', newBook);
            // Optionally refresh the book list
            fetchBooks();
            console.log("fetching books and displaying");
            hideAddBookForm();
        } else {
            console.error('Failed to add book:', response.statusText);
            alert('Failed to add book. Please try again.');
        }
        console.log("finished");
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
        addBookForm.addEventListener('submit', addBook);
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

async function handleEditBook(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    const bookId = document.getElementById('editBookId').value;

    // Gather form data
    const bookData = {
        title: document.getElementById('editBookTitle').value,
        author_name: document.getElementById('editBookAuthor').value,
        publication_year: document.getElementById('editBookPublicationDate').value,
        genre: document.getElementById('editBookGenre').value,
        available_copies: parseInt(document.getElementById('editBookAvailableCopies').value, 10),
    };

    try {
        // Send data to the backend
        const response = await fetch(`http://localhost:3000/api/books/${bookId}`, {
            method: 'PUT', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookData),
        });

        if (response.ok) {
            const updatedBook = await response.json();
            console.log('Book edited successfully:', updatedBook);
            // Optionally refresh the book list
            fetchBooks();
            hideModal('editBookModal');
        } else {
            console.error('Failed to edit book:', bookId);
            alert('Failed to edit book. Please try again.');
        }
    } catch (error) {
        console.error('Error editing book:', error);
        alert('An error occurred while editing the book. Please try again.');
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
    const book = booksList.find(book => book.book_id === id);
    if (book) {
        document.getElementById('editBookId').value = book.book_id;
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
    // updateMemberDisplay();
    // updateLoanDisplay();
    // updateLibrarianDisplay();
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
                <p>Book ID: ${book.book_id}</p>
            </div>
            <div>
                <button class="btn" onclick="editBook(${book.book_id})">Edit</button>
                <button class="btn btn-cancel" onclick="deleteBook(${book.book_id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function updateMemberDisplay() {
    const memberListElement = document.querySelector('.member-list');
    if (!memberListElement) return;
    
    memberListElement.innerHTML = membersList.map(member => `
        <div class="list-item">
            <div>
                <h3>${member.first_name} ${member.last_name}</h3>
                <p>Email: ${member.email}</p>
                <p>Phone: ${member.phone_number}</p>
            </div>
            <div>
                <button class="btn" onclick="editMember(${member.member_id})">Edit</button>
                <button class="btn btn-cancel" onclick="deleteMember(${member.member_id})">Delete</button>
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