// Simulate database
let books = [];
let members = [];
let loans = [];
let librarians = [];

// Event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            if (link.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                showSection(link.getAttribute('href').substring(1));
                updateActiveLink(link);
            }
        });
    });

    setupFormHandlers(); // Setup form event listeners
    loadMockData(); // Load initial data
    updateDisplays(); // Update the UI displays
});

// Section display functionality
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.toggle('active', section.id === sectionId);
    });
}

// Update the active state of navigation links
function updateActiveLink(activeLink) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link === activeLink);
    });
}

// Modal control functions
function showModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Form handlers
function setupFormHandlers() {
    // Attach event listeners to forms
    const formHandlers = {
        addBookForm: handleAddBook,
        addMemberForm: handleAddMember,
        newLoanForm: handleNewLoan,
        addLibrarianForm: handleAddLibrarian
    };

    for (const [formId, handler] of Object.entries(formHandlers)) {
        const form = document.getElementById(formId);
        if (form) form.addEventListener('submit', handler);
    }
}

// Handle form submissions
function handleAddBook(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    books.push(createBookFromFormData(formData));
    updateBookDisplay();
    hideModal('addBookModal');
    event.target.reset();
}

function handleAddMember(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    members.push(createMemberFromFormData(formData));
    updateMemberDisplay();
    hideModal('addMemberModal');
    event.target.reset();
}

function handleNewLoan(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    loans.push(createLoanFromFormData(formData));
    updateLoanDisplay();
    event.target.reset();
}

function handleAddLibrarian(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    librarians.push(createLibrarianFromFormData(formData));
    updateLibrarianDisplay();
    hideModal('addLibrarianModal');
    event.target.reset();
}

// Helper functions to create entities from form data
function createBookFromFormData(formData) {
    return {
        id: Date.now(),
        title: formData.get('title'),
        author: formData.get('author'),
        genre: formData.get('genre'),
        publicationDate: formData.get('publicationDate'),
        availableCopies: parseInt(formData.get('availableCopies'))
    };
}

function createMemberFromFormData(formData) {
    return {
        id: Date.now(),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        startDate: formData.get('startDate')
    };
}

function createLoanFromFormData(formData) {
    return {
        id: Date.now(),
        memberId: formData.get('memberId'),
        bookId: formData.get('bookId'),
        loanDate: formData.get('loanDate'),
        returnDate: formData.get('returnDate'),
        status: 'active'
    };
}

function createLibrarianFromFormData(formData) {
    return {
        id: Date.now(),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        hireDate: formData.get('hireDate')
    };
}

// Edit functions for updating existing entries
function editEntity(entityType, id) {
    const entity = getEntityById(entityType, id);
    if (entity) {
        populateEditForm(entityType, entity);
        showModal(`edit${capitalizeFirstLetter(entityType)}Modal`);
    }
}

function getEntityById(entityType, id) {
    return window[entityType].find(item => item.id === id);
}

function populateEditForm(entityType, entity) {
    Object.entries(entity).forEach(([key, value]) => {
        const input = document.getElementById(`edit${capitalizeFirstLetter(entityType)}${capitalizeFirstLetter(key)}`);
        if (input) input.value = value;
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Search functions
function searchEntities(entityType) {
    const searchTerm = document.getElementById(`${entityType}Search`).value.toLowerCase();
    const filteredEntities = window[entityType].filter(entity => {
        return Object.values(entity).some(value => value.toString().toLowerCase().includes(searchTerm));
    });
    window[`update${capitalizeFirstLetter(entityType)}Display`](filteredEntities);
}

// Display functions
function updateDisplays() {
    updateBookDisplay();
    updateMemberDisplay();
    updateLoanDisplay();
    updateLibrarianDisplay();
}

function updateBookDisplay(booksToShow = books) {
    const bookList = document.querySelector('.book-list');
    if (bookList) {
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
}

function updateMemberDisplay(membersToShow = members) {
    const memberList = document.querySelector('.member-list');
    if (memberList) {
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
}

function updateLoanDisplay() {
    const loansList = document.querySelector('.current-loans');
    if (loansList) {
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
}

function updateLibrarianDisplay() {
    const librarianList = document.querySelector('.librarian-list');
    if (librarianList) {
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
}

// Modal form visibility functions
function showAddForm(entityType) {
    showModal(`add${capitalizeFirstLetter(entityType)}Modal`);
}

function hideAddForm(entityType) {
    hideModal(`add${capitalizeFirstLetter(entityType)}Modal`);
}

// Sample data for mock purposes
function loadMockData() {
    books = [
        { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", genre: "Fiction", publicationDate: "1925-04-10", availableCopies: 3 }
    ];
    members = [
        { id: 1, firstName: "Jane", lastName: "Doe", email: "janedoe@example.com", phone: "123-456-7890", startDate: "2022-01-01" }
    ];
    librarians = [
        { id: 1, firstName: "John", lastName: "Smith", email: "johnsmith@example.com", hireDate: "2020-06-15" }
    ];
    loans = [
        { id: 1, memberId: 1, bookId: 1, loanDate: "2024-11-19", returnDate: "2024-12-19", status: "active" }
    ];
}
