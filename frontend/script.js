const express = require('express');
const router = express.Router();

// to simulate a database
let books = [];
let members = [];
let loans = [];
let librarians = [];

// navigation
document.addEventListener('DOMContentLoaded', () => {
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
    
    // load initial data
    loadMockData();
    updateDisplays();
});

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

function handleAddBook(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const book = {
        id: Date.now(),
        title: formData.get('title'),
        author: formData.get('author'),
        genre: formData.get('genre'),
        publicationDate: formData.get('publicationDate'),
        availableCopies: parseInt(formData.get('availableCopies'))
    };
    
    books.push(book);
    updateBookDisplay();
    hideModal('addBookModal');
    event.target.reset();
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
// Function to fetch librarians from the backend
function loadLibrarians() {
    fetch('/api/librarians')
        .then(response => response.json())
        .then(data => {
            if (data && data.length) {
                librarians = data; // Update the local librarians list
                updateLibrarianDisplay(); // Update the UI
            } else {
                console.log('No librarians found');
                alert('No librarians data available.');
            }
        })
        .catch(error => {
            console.error('Error fetching librarians:', error);
            alert('Error fetching librarian data.');
        });
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
    const id = parseInt(formData.get('id'));
    const book = books.find(book => book.id === id);
    if (book) {
        book.title = formData.get('title');
        book.author = formData.get('author');
        book.genre = formData.get('genre');
        book.publicationDate = formData.get('publicationDate');
        book.availableCopies = parseInt(formData.get('availableCopies'));
        updateBookDisplay();
        hideModal('editBookModal');
    }
}

// edit forms

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
// Function to handle editing a librarian



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
    const book = books.find(book => book.id === id);
    if (book) {
        document.getElementById('editBookId').value = book.id;
        document.getElementById('editBookTitle').value = book.title;
        document.getElementById('editBookAuthor').value = book.author;
        document.getElementById('editBookGenre').value = book.genre;
        document.getElementById('editBookPublicationDate').value = book.publicationDate;
        document.getElementById('editBookAvailableCopies').value = book.availableCopies;
        showModal('editBookModal');
    }
}

// search functions
function searchBooks() {
    const searchTerm = document.getElementById('bookSearch').value.toLowerCase();
    const filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(searchTerm) ||
        book.author.toLowerCase().includes(searchTerm)
    );
    updateBookDisplay(filteredBooks);
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

function updateBookDisplay(booksToShow = books) {
    const bookList = document.querySelector('.book-list');
    if (!bookList) return;
    
    bookList.innerHTML = booksToShow.map(book => `
        <div class="list-item">
            <div>
                <h3>${book.title}</h3>
                <p>Author: ${book.author}</p>
                <p>Genre: ${book.genre}</p>
                <p>Available Copies: ${book.availableCopies}</p>
            </div>
            <div>
                <button class="btn" onclick="editBook(${book.id})">Edit</button>
                <button class="btn btn-cancel" onclick="deleteBook(${book.id})">Delete</button>
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

// sample data
function loadMockData() {
    
    books = [
        {
            id: 1,
            title: "The Great Gatsby",
            author: "F. Scott Fitzgerald",
            genre: "Fiction",
            publicationDate: "1925-04-10",
            availableCopies: 3
        },
    ];

    members = [
        {
            id: 1,
            firstName: "John",
            lastName: "Smith",
            email: "john.smith@gmail.com",
            phone: "123-456-7890",
            startDate: "2024-01-01"
        },
    ];

    loans = [
        {
            id: 1,
            memberId: 1,
            bookId: 1,
            loanDate: "2024-01-15",
            returnDate: "2024-02-15",
            status: "active"
        },
    ];

    librarians = [
        {
            id: 1,
            firstName: "Jane",
            lastName: "Smith",
            email: "jane@library.com",
            hireDate: "2023-06-01"
        },
    ];
}

function deleteBook(id) {
    if (confirm('Are you sure you want to delete this book?')) {
        books = books.filter(book => book.id !== id);
        updateBookDisplay();
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