// Dashboard specific JavaScript

let compositionChart;

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    loadDashboardData();
});

function initializeDashboard() {
    setupCompositionChart();
}

function setupCompositionChart() {
    const ctx = document.getElementById('compositionChart');
    if (!ctx) return;

    compositionChart = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
                    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#d1d5db',
                        usePointStyle: true,
                        padding: 20
                    }
                },
                datalabels: {
                    color: '#fff',
                    formatter: (value, context) => {
                        const total = context.chart.data.datasets[0].data.reduce((acc, current) => acc + current, 0);
                        const percentage = Math.round((value / total) * 100);
                        return percentage > 5 ? percentage + '%' : '';
                    },
                    font: {
                        weight: 'bold',
                        size: 12
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

async function loadDashboardData() {
    try {
        const data = await apiCall('/api/get-dashboard-data/');
        
        // Update KPIs
        updateKPIs(data.kpis);
        
        // Update composition chart
        updateCompositionChart(data.composition);
        
        // Update spotlight book
        updateSpotlightBook(data.spotlight_book);
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Error loading dashboard data', 'error');
    }
}

function updateKPIs(kpis) {
    animateValue(document.getElementById('kpi-accuracy'), 0, kpis.accuracy, 1500, '%');
    animateValue(document.getElementById('kpi-turnover'), 0, kpis.turnover, 1500, '%');
    animateValue(document.getElementById('kpi-equity'), 0, kpis.equity, 1500, '%');
    animateValue(document.getElementById('kpi-satisfaction'), 0, kpis.satisfaction, 1500, '%');
}

function updateCompositionChart(composition) {
    if (!compositionChart) return;
    
    compositionChart.data.labels = composition.labels;
    compositionChart.data.datasets[0].data = composition.data;
    compositionChart.update();
}

function updateSpotlightBook(book) {
    const spotlightContent = document.getElementById('book-spotlight-content');
    if (!spotlightContent) return;
    
    if (book) {
        spotlightContent.innerHTML = `
            <div class="book-cover-placeholder mb-4">
                <i class="fas fa-book-open fa-3x text-cyan-300"></i>
            </div>
            <h4 class="text-lg font-bold">${book.title}</h4>
            <p class="text-sm text-gray-400 mb-4">${book.author}</p>
            <p class="text-xs text-left p-3 glassmorphism rounded-md">
                <strong>AI Analysis:</strong> 
                <span>This title shows strong engagement within the ${book.category} genre. 
                Its borrowing velocity suggests a high potential for sustained interest.</span>
            </p>
            <div class="flex justify-around w-full mt-4">
                <div>
                    <p class="text-xs text-gray-400">Demand</p>
                    <p class="font-bold">${book.demand}%</p>
                </div>
                <div>
                    <p class="text-xs text-gray-400">Action</p>
                    <p class="font-bold">${book.action}</p>
                </div>
            </div>
        `;
    } else {
        spotlightContent.innerHTML = `
            <div class="book-cover-placeholder mb-4 text-gray-500">
                <i class="fas fa-book-open fa-3x"></i>
            </div>
            <p class="text-gray-400">Upload a file to see AI insights.</p>
        `;
    }
}

// Update chart theme
window.updateChartTheme = function(theme) {
    const isLight = theme === 'light';
    const textColor = isLight ? '#1f2937' : '#d1d5db';
    const gridColor = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';

    if (compositionChart) {
        compositionChart.options.plugins.legend.labels.color = textColor;
        compositionChart.update();
    }
};

// Refresh dashboard data every 30 seconds
setInterval(loadDashboardData, 30000);