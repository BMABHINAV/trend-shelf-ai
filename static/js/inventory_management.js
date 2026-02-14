// Inventory Management specific JavaScript

let currentBooks = [];
let filteredBooks = [];
let currentPage = 1;
const itemsPerPage = 20;

document.addEventListener('DOMContentLoaded', function() {
    initializeInventoryManagement();
    loadInventoryData();
});

function initializeInventoryManagement() {
    setupFilters();
    setupSearch();
}

function setupFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const actionFilter = document.getElementById('action-filter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    
    if (actionFilter) {
        actionFilter.addEventListener('change', applyFilters);
    }
}

function setupSearch() {
    const searchInput = document.getElementById('inventory-search');
    if (!searchInput) return;
    
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            applyFilters();
        }, 300);
    });
}

async function loadInventoryData() {
    try {
        const data = await apiCall('/api/get-books/');
        currentBooks = data.books || [];
        
        updateCategoryFilter();
        applyFilters();
        updateActionSummary();
        updateHighDemandBooks();
        updateAIRecommendations();
        
    } catch (error) {
        console.error('Error loading inventory data:', error);
        showNotification('Error loading inventory data', 'error');
        
        const tableBody = document.getElementById('inventory-table-body');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center p-4 text-red-400">
                        Error loading data. Please try again.
                    </td>
                </tr>
            `;
        }
    }
}

function updateCategoryFilter() {
    const categoryFilter = document.getElementById('category-filter');
    if (!categoryFilter) return;
    
    const categories = [...new Set(currentBooks.map(book => book.category))];
    const currentValue = categoryFilter.value;
    
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    if (currentValue && categories.includes(currentValue)) {
        categoryFilter.value = currentValue;
    }
}

function applyFilters() {
    const searchTerm = document.getElementById('inventory-search')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('category-filter')?.value || '';
    const actionFilter = document.getElementById('action-filter')?.value || '';
    
    filteredBooks = currentBooks.filter(book => {
        const matchesSearch = !searchTerm || 
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm);
        
        const matchesCategory = !categoryFilter || book.category === categoryFilter;
        const matchesAction = !actionFilter || book.action === actionFilter;
        
        return matchesSearch && matchesCategory && matchesAction;
    });
    
    currentPage = 1;
    renderInventoryTable();
    renderPagination();
}

function renderInventoryTable() {
    const tableBody = document.getElementById('inventory-table-body');
    if (!tableBody) return;
    
    if (filteredBooks.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center p-4 text-gray-500">
                    No books found matching your criteria.
                </td>
            </tr>
        `;
        return;
    }
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const booksToShow = filteredBooks.slice(startIndex, endIndex);
    
    const tableHTML = booksToShow.map(book => {
        const tagClass = getActionTagClass(book.action);
        return `
            <tr class="table-row border-b border-transparent hover:bg-gray-700/20">
                <td class="p-3 font-semibold">${book.title}</td>
                <td class="p-3 text-gray-400">${book.author}</td>
                <td class="p-3">${book.category}</td>
                <td class="p-3 font-medium">${book.demand}%</td>
                <td class="p-3">
                    <span class="tag ${tagClass}">${book.action}</span>
                </td>
                <td class="p-3">
                    <button class="text-blue-400 hover:text-blue-300 mr-2" onclick="viewBookDetails(${book.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="text-green-400 hover:text-green-300" onclick="updateBookAction(${book.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    tableBody.innerHTML = tableHTML;
}

function getActionTagClass(action) {
    switch(action) {
        case 'Acquire': return 'tag-acquire';
        case 'Transfer': return 'tag-transfer';
        case 'Deaccession': return 'tag-deaccession';
        default: return 'tag-hold';
    }
}

function renderPagination() {
    const paginationDiv = document.getElementById('pagination');
    if (!paginationDiv) return;
    
    const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
    
    if (totalPages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `
            <button onclick="changePage(${currentPage - 1})" 
                    class="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
    }
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPage;
        paginationHTML += `
            <button onclick="changePage(${i})" 
                    class="px-3 py-1 ${isActive ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'} rounded">
                ${i}
            </button>
        `;
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `
            <button onclick="changePage(${currentPage + 1})" 
                    class="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
    }
    
    paginationDiv.innerHTML = paginationHTML;
}

function changePage(page) {
    currentPage = page;
    renderInventoryTable();
    renderPagination();
}

function updateActionSummary() {
    const actionCounts = currentBooks.reduce((acc, book) => {
        acc[book.action] = (acc[book.action] || 0) + 1;
        return acc;
    }, {});
    
    document.getElementById('acquire-count').textContent = actionCounts.Acquire || 0;
    document.getElementById('hold-count').textContent = actionCounts.Hold || 0;
    document.getElementById('transfer-count').textContent = actionCounts.Transfer || 0;
    document.getElementById('deaccession-count').textContent = actionCounts.Deaccession || 0;
}

function updateHighDemandBooks() {
    const highDemandDiv = document.getElementById('high-demand-books');
    if (!highDemandDiv) return;
    
    const highDemandBooks = currentBooks
        .filter(book => book.demand >= 90)
        .sort((a, b) => b.demand - a.demand)
        .slice(0, 5);
    
    if (highDemandBooks.length === 0) {
        highDemandDiv.innerHTML = '<p class="text-gray-400">No high demand books found</p>';
        return;
    }
    
    const booksHTML = highDemandBooks.map(book => `
        <div class="flex justify-between items-center py-2 border-b border-gray-700/50">
            <div>
                <p class="text-sm font-medium">${book.title.substring(0, 30)}${book.title.length > 30 ? '...' : ''}</p>
                <p class="text-xs text-gray-400">${book.author}</p>
            </div>
            <span class="text-sm font-bold text-green-400">${book.demand}%</span>
        </div>
    `).join('');
    
    highDemandDiv.innerHTML = booksHTML;
}

function updateAIRecommendations() {
    const recommendationsDiv = document.getElementById('ai-recommendations');
    if (!recommendationsDiv) return;
    
    const recommendations = [
        'Focus on acquiring Science Fiction titles - showing 15% increase in demand',
        'Consider transferring low-demand Classic literature to other branches',
        'Romance category shows seasonal peak - increase inventory by 20%',
        'Children\'s books have consistent demand - maintain current levels'
    ];
    
    const recommendationsHTML = recommendations.map(rec => `
        <div class="py-2 border-b border-gray-700/50">
            <p class="text-xs text-gray-300">
                <i class="fas fa-lightbulb text-yellow-400 mr-2"></i>
                ${rec}
            </p>
        </div>
    `).join('');
    
    recommendationsDiv.innerHTML = recommendationsHTML;
}

// Global functions for button actions
window.viewBookDetails = function(bookId) {
    const book = currentBooks.find(b => b.id === bookId);
    if (!book) return;
    
    alert(`Book Details:\n\nTitle: ${book.title}\nAuthor: ${book.author}\nCategory: ${book.category}\nDemand: ${book.demand}%\nRecommendation: ${book.action}`);
};

window.updateBookAction = function(bookId) {
    const book = currentBooks.find(b => b.id === bookId);
    if (!book) return;
    
    const newAction = prompt(`Current action: ${book.action}\n\nEnter new action (Acquire, Hold, Transfer, Deaccession):`, book.action);
    
    if (newAction && ['Acquire', 'Hold', 'Transfer', 'Deaccession'].includes(newAction)) {
        // In a real application, you would make an API call to update the book
        book.action = newAction;
        renderInventoryTable();
        updateActionSummary();
        showNotification(`Updated action for "${book.title}" to ${newAction}`, 'success');
    }
};

window.changePage = changePage;