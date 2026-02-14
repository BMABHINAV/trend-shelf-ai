// Real-time Monitoring specific JavaScript

let activityChart;
let activityFeedInterval;
let metricsInterval;

document.addEventListener('DOMContentLoaded', function() {
    initializeRealTimeMonitoring();
    startRealTimeUpdates();
});

function initializeRealTimeMonitoring() {
    setupActivityChart();
    loadInitialData();
}

function setupActivityChart() {
    const ctx = document.getElementById('activityChart');
    if (!ctx) return;

    const hours = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
        const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
        hours.push(hour.getHours() + ':00');
    }

    activityChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: hours,
            datasets: [{
                label: 'Active Users',
                data: generateRandomData(24, 10, 50),
                borderColor: 'rgb(34, 211, 238)',
                backgroundColor: 'rgba(34, 211, 238, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Books Borrowed',
                data: generateRandomData(24, 5, 25),
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: { color: '#d1d5db' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' }
                },
                y: {
                    ticks: { color: '#d1d5db' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    labels: { color: '#d1d5db' }
                }
            }
        }
    });
}

function generateRandomData(count, min, max) {
    return Array.from({ length: count }, () => 
        Math.floor(Math.random() * (max - min + 1)) + min
    );
}

function loadInitialData() {
    // Initialize with some sample data
    updateMetrics({
        activeUsers: 42,
        booksBorrowed: 18,
        avgDuration: 35,
        alerts: 2
    });
    
    loadPopularBooks();
    addActivityFeedItem('System initialized and monitoring started', 'info');
}

function startRealTimeUpdates() {
    // Update metrics every 5 seconds
    metricsInterval = setInterval(updateRealTimeMetrics, 5000);
    
    // Add activity feed items every 10 seconds
    activityFeedInterval = setInterval(addRandomActivityFeedItem, 10000);
    
    // Update chart every 30 seconds
    setInterval(updateActivityChart, 30000);
}

function updateRealTimeMetrics() {
    // Simulate real-time metrics updates
    const metrics = {
        activeUsers: Math.floor(Math.random() * 20) + 30,
        booksBorrowed: Math.floor(Math.random() * 10) + 15,
        avgDuration: Math.floor(Math.random() * 20) + 25,
        alerts: Math.floor(Math.random() * 3)
    };
    
    updateMetrics(metrics);
}

function updateMetrics(metrics) {
    animateValue(document.getElementById('active-users'), 0, metrics.activeUsers, 1000);
    animateValue(document.getElementById('books-borrowed'), 0, metrics.booksBorrowed, 1000);
    animateValue(document.getElementById('avg-duration'), 0, metrics.avgDuration, 1000, 'm');
    animateValue(document.getElementById('alerts-count'), 0, metrics.alerts, 1000);
}

function addRandomActivityFeedItem() {
    const activities = [
        { message: 'New user registered', type: 'success' },
        { message: 'Book "The Great Gatsby" borrowed', type: 'info' },
        { message: 'High demand detected for Science Fiction', type: 'warning' },
        { message: 'System backup completed', type: 'success' },
        { message: 'New book added to inventory', type: 'info' },
        { message: 'User session expired', type: 'warning' }
    ];
    
    const activity = activities[Math.floor(Math.random() * activities.length)];
    addActivityFeedItem(activity.message, activity.type);
}

function addActivityFeedItem(message, type = 'info') {
    const activityFeed = document.getElementById('activity-feed');
    if (!activityFeed) return;
    
    const iconClass = {
        'success': 'fas fa-check-circle text-green-400',
        'warning': 'fas fa-exclamation-triangle text-yellow-400',
        'error': 'fas fa-times-circle text-red-400',
        'info': 'fas fa-info-circle text-blue-400'
    }[type] || 'fas fa-circle text-gray-400';
    
    const activityItem = document.createElement('div');
    activityItem.className = 'flex items-center p-3 bg-gray-700/30 rounded-lg animate-fade-in';
    activityItem.innerHTML = `
        <i class="${iconClass} mr-3"></i>
        <div class="flex-1">
            <p class="text-sm">${message}</p>
            <p class="text-xs text-gray-400">Just now</p>
        </div>
    `;
    
    // Add to top of feed
    activityFeed.insertBefore(activityItem, activityFeed.firstChild);
    
    // Remove old items (keep only last 10)
    while (activityFeed.children.length > 10) {
        activityFeed.removeChild(activityFeed.lastChild);
    }
}

function updateActivityChart() {
    if (!activityChart) return;
    
    // Shift data and add new point
    const activeUsersData = activityChart.data.datasets[0].data;
    const booksBorrowedData = activityChart.data.datasets[1].data;
    
    activeUsersData.shift();
    activeUsersData.push(Math.floor(Math.random() * 40) + 10);
    
    booksBorrowedData.shift();
    booksBorrowedData.push(Math.floor(Math.random() * 20) + 5);
    
    // Update time labels
    const now = new Date();
    const labels = activityChart.data.labels;
    labels.shift();
    labels.push(now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0'));
    
    activityChart.update();
}

async function loadPopularBooks() {
    try {
        const data = await apiCall('/api/get-books/?limit=5');
        const books = data.books || [];
        
        const popularBooksDiv = document.getElementById('popular-books');
        if (!popularBooksDiv) return;
        
        if (books.length === 0) {
            popularBooksDiv.innerHTML = '<p class="text-gray-400">No books data available</p>';
            return;
        }
        
        const booksHTML = books
            .sort((a, b) => b.demand - a.demand)
            .slice(0, 5)
            .map((book, index) => `
                <div class="flex justify-between items-center py-2 border-b border-gray-700/50">
                    <div class="flex-1">
                        <p class="text-sm font-medium">${book.title.substring(0, 25)}${book.title.length > 25 ? '...' : ''}</p>
                        <p class="text-xs text-gray-400">${book.author}</p>
                    </div>
                    <div class="text-right">
                        <span class="text-xs text-cyan-300">#${index + 1}</span>
                        <p class="text-xs text-gray-400">${book.demand}% demand</p>
                    </div>
                </div>
            `).join('');
        
        popularBooksDiv.innerHTML = booksHTML;
        
    } catch (error) {
        console.error('Error loading popular books:', error);
        const popularBooksDiv = document.getElementById('popular-books');
        if (popularBooksDiv) {
            popularBooksDiv.innerHTML = '<p class="text-red-400">Error loading popular books</p>';
        }
    }
}

// Update chart theme
window.updateChartTheme = function(theme) {
    const isLight = theme === 'light';
    const textColor = isLight ? '#1f2937' : '#d1d5db';
    const gridColor = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';

    if (activityChart) {
        activityChart.options.plugins.legend.labels.color = textColor;
        activityChart.options.scales.x.ticks.color = textColor;
        activityChart.options.scales.y.ticks.color = textColor;
        activityChart.options.scales.x.grid.color = gridColor;
        activityChart.options.scales.y.grid.color = gridColor;
        activityChart.update();
    }
};

// Cleanup intervals when page is unloaded
window.addEventListener('beforeunload', function() {
    if (metricsInterval) clearInterval(metricsInterval);
    if (activityFeedInterval) clearInterval(activityFeedInterval);
});

// Add CSS animation for fade-in effect
const style = document.createElement('style');
style.textContent = `
    .animate-fade-in {
        animation: fadeIn 0.5s ease-in;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);