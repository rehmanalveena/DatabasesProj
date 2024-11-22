booksList = [];
membersList = [];
librariansList = [];
loansList = [];

// navigation
document.addEventListener('DOMContentLoaded', () => {
    booksListElement = document.getElementById('books-list');
    membersListElement = document.getElementById('member-list');
    librariansListElement = document.getElementById('librarians-list');
    loansListElement = document.getElementById('loans-list');
    console.log('DOMContentLoaded fired');
    
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
    fetchMembers();
    fetchLibrarians();
    fetchLoans();
    updateDisplays();

    //console.log("HELLO");

    // Add the searchBooks function to the global scope for use in HTML
    window.searchBooks = searchBooks;
});
// DISPLAY UPDATES -----------------------------------------------------
function updateDisplays() {
    updateBookDisplay();
    // updateMemberDisplay();
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
                <p>Member ID: ${member.member_id}</p>
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
                <p>Member ID: ${loan.member_id}</p>
                <p>Book ID: ${loan.book_id}</p>
                <p>Return Date: ${loan.return_date}</p>
            </div>
            <div>
                <button class="btn" onclick="extendLoan(${loan.id})">Extend</button>
                <button class="btn btn-add" onclick="returnLoan(${loan.id})">Return</button>
            </div>
        </div>
    `).join('');
}

function updateLibrarianDisplay() {
    const librariansListElement = document.querySelector('.librarians-list');
    if (!librariansListElement) return;
    
    librariansListElement.innerHTML = librariansList.map(librarian => `
        <div class="list-item">
            <div>
                <h3>${librarian.first_name} ${librarian.last_name}</h3>
                <p>Email: ${librarian.email}</p>
                <p>Librarian ID: ${librarian.librarian_id}</p>
            </div>
            <div>
                <button class="btn" onclick="editLibrarian(${librarian.librarian_id})">Edit</button>
                <button class="btn btn-cancel" onclick="deleteLibrarian(${librarian.librarian_id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId)?.classList.add('active');
}

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
            fetchBooks();
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



// LIBRARIAN -----------------------------------------------------

async function fetchLibrarians() {
    try {
      const response = await fetch(`http://localhost:3000/api/librarians`);
      if (response.ok) {
        const data = await response.json();
        librariansList = Array.isArray(data) ? data : data.librarians || [];
        
        updateLibrarianDisplay();
      } else {
        console.error('Failed to fetch librarians:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching librarians:', error);
    }
}

async function searchLibrarians() {
    const librarianId = librarianSearch.value.trim();
    if (!librarianId) {
      alert('Please enter a librarian ID to search.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/librarians/${librarianId}`);
      if (response.ok) {
        const librarian = await response.json();

        librariansList = [librarian];

        updateLibrarianDisplay();
      } else if (response.status === 404) {
        alert('librarian not found.');
      } else {
        console.error('Failed to fetch librarian:', response.statusText);
      }
    } catch (error) {
      console.error('Error searching for librarian:', error);
    }
}

async function addLibrarian(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    // Gather form data
    const librarianData = {
        first_name: document.getElementById('librarian_first_name').value,
        last_name: document.getElementById('librarian_last_name').value,
        email: document.getElementById('librarian_email').value,
        hire_date: document.getElementById('librarian_hire_date').value
    };

    console.log(librarianData);

    try {
        // Send data to the backend
        const response = await fetch('http://localhost:3000/api/librarians', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(librarianData),
        });

        if (response.ok) {
            const newLibrarian = await response.json();
            console.log('librarian added successfully:', newLibrarian);
            // Optionally refresh the librarian list
            fetchLibrarians();
            hideAddLibrarianForm();
        } else {
            console.error('Failed to add librarian:', response.statusText);
            alert('Failed to add librarian. Please try again.');
        }
    } catch (error) {
        console.error('Error adding librarian:', error);
        alert('An error occurred while adding the librarian. Please try again.');
    }
}

async function deleteLibrarian(id) {
    if (confirm('Are you sure you want to delete this librarian?')) {
        try {
            // Send DELETE request to the backend API
            const response = await fetch(`http://localhost:3000/api/librarians/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Remove the book from the local `booksList`
                librariansList = librariansList.filter(librarian => librarian.id !== id);

                // Update the display after deletion
                fetchLibrarians();

                alert('librarian successfully deleted.');
            } else if (response.status === 404) {
                alert('librarian not found.');
            } else {
                console.error('Failed to delete librarian:', response.statusText);
                alert('An error occurred while deleting the librarian.');
            }
        } catch (error) {
            console.error('Error deleting librarian:', error);
            alert('Could not delete the librarian. Please try again.');
        }
    }
}

async function handleEditLibrarian(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    const librarianId = document.getElementById('editLibrarianId').value;

    // Gather form data
    const librarianData = {
        first_name: document.getElementById('editLibrarianFirstName').value,
        last_name: document.getElementById('editLibrarianLastName').value,
        email: document.getElementById('editLibrarianEmail').value,
        hire_date: document.getElementById('editLibrarianHireDate').value
    };

    try {
        // Send data to the backend
        const response = await fetch(`http://localhost:3000/api/librarians/${librarianId}`, {
            method: 'PUT', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(librarianData),
        });

        if (response.ok) {
            const updatedLibrarian = await response.json();
            console.log('Librarian edited successfully:', updatedLibrarian);
            // Optionally refresh the librarian list
            fetchLibrarians();
            hideModal('editLibrarianModal');
        } else {
            console.error('Failed to edit librarian:', librarianId);
            alert('Failed to edit librarian. Please try again.');
        }
    } catch (error) {
        console.error('Error editing librarian:', error);
        alert('An error occurred while editing the librarian. Please try again.');
    }
}

function editLibrarian(id) {
    console.log("id is ", id);
    const librarian = librariansList.find(librarian => librarian.librarian_id === id);
    if (librarian) {
        document.getElementById('editLibrarianId').value = librarian.librarian_id;
        document.getElementById('editLibrarianFirstName').value = librarian.first_name;
        document.getElementById('editLibrarianLastName').value = librarian.last_name;
        document.getElementById('editLibrarianEmail').value = librarian.email;
        document.getElementById('editLibrarianHireDate').value = librarian.hire_date;
        showModal('editLibrarianModal');
    }
}

// MEMBERS -----------------------------------------------------
async function fetchMembers() {
    try {
      const response = await fetch('http://localhost:3000/api/members');
      if (response.ok) {
        membersList = await response.json();
        updateMemberDisplay();
      } else {
        console.error('Failed to fetch members:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    }
}

async function handleEditMember(event) {
    event.preventDefault(); // Prevent the default form submission behavior
    const formData = new FormData(event.target);
    const memberId = formData.get('id'); // Get the member ID from the form
    console.log("memberId", memberId);
    const memberData = {
        first_name: document.getElementById('editMemberFirstName').value,
        last_name: document.getElementById('editMemberLastName').value,
        email: document.getElementById('editMemberEmail').value,
        phone_number: document.getElementById('editMemberPhone').value,
        membership_start_date: document.getElementById('editMemberStartDate').value
    };

    try {
        // Send data to the backend using a PUT request
        const response = await fetch(`http://localhost:3000/api/members/${memberId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(memberData),
        });

        if (response.ok) {
            const updatedMember = await response.json();
            console.log('Member edited successfully:', updatedMember);
            
            // Optionally update the members array with the edited member
            const index = membersList.findIndex(member => member.id === parseInt(memberId));
            if (index !== -1) {
                membersList[index] = updatedMember; // Replace the old member with the updated one
            }
            
            // Update the display
            fetchMembers();
            hideModal('editMemberModal');
        } else {
            console.error('Failed to edit member:', memberId);
            alert('Failed to edit member. Please try again.');
        }
    } catch (error) {
        console.error('Error editing member:', error);
        alert('An error occurred while editing the member. Please try again.');
    }
}

async function addMember(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    // Gather form data
    const memberData = {
        first_name: document.getElementById('firstName').value,
        last_name: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone_number: document.getElementById('phone').value,
        membership_start_date: document.getElementById('startDate').value,
    };

    try {
        // Send data to the backend
        const response = await fetch('http://localhost:3000/api/members', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(memberData),
        });

        if (response.ok) {
            const newMember = await response.json();
            console.log('Member added successfully: ', newMember);

            fetchMembers();
            hideModal('addMemberModal');
        } else {
            console.error('Failed to add member:', response.statusText);
            alert('Failed to add member. Please try again.');
        }
    } catch (error) {
        console.error('Error adding member:', error);
        alert('An error occurred while adding the member. Please try again.');
    }
}

function editMember(id) {
    const member = membersList.find(member => member.member_id === id);
    console.log(member);
    if (member) {
        document.getElementById('editMemberId').value = member.member_id;
        document.getElementById('editMemberFirstName').value = member.first_name;
        document.getElementById('editMemberLastName').value = member.last_name;
        document.getElementById('editMemberEmail').value = member.email;
        document.getElementById('editMemberPhone').value = member.phone_number;
        document.getElementById('editMemberStartDate').value = member.membership_start_date;
        showModal('editMemberModal');
    }
}

async function searchMembers() {
    const memberId = document.getElementById('memberSearch').value.trim();
    if (!memberId) {
        alert('Please enter a member ID to search.');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/members/${memberId}`);
        if (response.ok) {
            const member = await response.json();

            // Replace the current members list with the search result
            membersList = [member];

            updateMemberDisplay();
        } else if (response.status === 404) {
            alert('Member not found.');
        } else {
            console.error('Failed to fetch member:', response.statusText);
        }
    } catch (error) {
        console.error('Error searching for member:', error);
    }
}

async function deleteMember(id) {
    console.log("to delete: ", id);
    if (confirm('Are you sure you want to delete this member?')) {
        try {
            // Send DELETE request to the backend API
            const response = await fetch(`http://localhost:3000/api/members/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Remove the member from the local `members` list
                membersList = membersList.filter(member => member.id !== id);

                // Update the display after deletion
                fetchMembers();

                alert('Member successfully deleted.');
            } else if (response.status === 404) {
                alert('Member not found.');
            } else {
                console.error('Failed to delete member:', response.statusText);
                alert('An error occurred while deleting the member.');
            }
        } catch (error) {
            console.error('Error deleting member:', error);
            alert('Could not delete the member. Please try again.');
        }
    }
}


// LOAN -----------------------------------------------------

async function fetchLoans() {
    try {
      const response = await fetch(`http://localhost:3000/api/loans`);
      if (response.ok) {
        const data = await response.json();
        loansList = Array.isArray(data) ? data : data.loans || [];
        
        updateLibrarianDisplay();
      } else {
        console.error('Failed to fetch loans:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching loans:', error);
    }
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

// MODAL -------------------------------------------------------
function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// FORM HANDLERS -------------------------------------------------------
function setupFormHandlers() {

    // add book form
    const addBookForm = document.getElementById('addBookForm');
    if (addBookForm) {
        addBookForm.addEventListener('submit', addBook);
    }

    // add member form
    const addMemberForm = document.getElementById('addMemberForm');
    if (addMemberForm) {
        addMemberForm.addEventListener('submit', addMember);
    }

    // new loan form
    const newLoanForm = document.getElementById('newLoanForm');
    if (newLoanForm) {
        newLoanForm.addEventListener('submit', handleNewLoan);
    }

    // add librarian form
    const addLibrarianForm = document.getElementById('addLibrarianForm');
    if (addLibrarianForm) {
        addLibrarianForm.addEventListener('submit', addLibrarian);
    }
}

// MODAL ------------------------------------------
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

function showEditLibrarianForm() {
    showModal('editLibrarianModal');
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