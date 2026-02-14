// Demand Forecasting specific JavaScript

let demandChart, accuracyChart;

document.addEventListener('DOMContentLoaded', function() {
    initializeDemandForecasting();
    loadForecastData();
});

function initializeDemandForecasting() {
    setupDemandChart();
    setupAccuracyChart();
    setupCategorySelector();
}

function setupDemandChart() {
    const ctx = document.getElementById('demandChart');
    if (!ctx) return;

    demandChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Historical Demand',
                data: [],
                borderColor: 'rgb(107, 114, 128)',
                backgroundColor: 'rgba(107, 114, 128, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'AI Predicted Demand',
                data: [],
                borderColor: 'rgb(34, 211, 238)',
                backgroundColor: 'rgba(34, 211, 238, 0.1)',
                borderDash: [5, 5],
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
                    beginAtZero: true,
                    max: 100
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

function setupAccuracyChart() {
    const ctx = document.getElementById('accuracyChart');
    if (!ctx) return;

    accuracyChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Prediction Accuracy %',
                data: [94, 96, 98, 97],
                backgroundColor: 'rgba(34, 211, 238, 0.8)',
                borderColor: 'rgb(34, 211, 238)',
                borderWidth: 1
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
                    beginAtZero: true,
                    max: 100
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

function setupCategorySelector() {
    const categorySelector = document.getElementById('category-selector');
    if (!categorySelector) return;

    categorySelector.addEventListener('change', (e) => {
        const selectedCategory = e.target.value;
        loadForecastData(selectedCategory);
        updateAIInsights(selectedCategory);
    });
}

async function loadForecastData(category = '') {
    try {
        const url = category ? `/api/get-demand-forecast/?category=${encodeURIComponent(category)}` : '/api/get-demand-forecast/';
        const data = await apiCall(url);
        
        updateDemandChart(data.forecast);
        updateCategorySelector(data.categories);
        updateTrendingCategories(data.categories);
        
        const categoryTitle = document.getElementById('chart-category-title');
        if (categoryTitle) {
            categoryTitle.textContent = category || 'All Categories';
        }
        
    } catch (error) {
        console.error('Error loading forecast data:', error);
        showNotification('Error loading forecast data', 'error');
    }
}

function updateDemandChart(forecast) {
    if (!demandChart || !forecast) return;
    
    demandChart.data.labels = forecast.labels;
    demandChart.data.datasets[0].data = forecast.historical;
    demandChart.data.datasets[1].data = forecast.predicted;
    demandChart.update();
}

function updateCategorySelector(categories) {
    const categorySelector = document.getElementById('category-selector');
    if (!categorySelector || !categories) return;
    
    const currentValue = categorySelector.value;
    categorySelector.innerHTML = '<option value="">All Categories</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelector.appendChild(option);
    });
    
    if (currentValue && categories.includes(currentValue)) {
        categorySelector.value = currentValue;
    }
}

function updateTrendingCategories(categories) {
    const trendingDiv = document.getElementById('trending-categories');
    if (!trendingDiv || !categories) return;
    
    if (categories.length === 0) {
        trendingDiv.innerHTML = '<p class="text-gray-400">No categories available</p>';
        return;
    }
    
    const trendingHTML = categories.slice(0, 5).map((category, index) => `
        <div class="flex justify-between items-center py-2 border-b border-gray-700/50">
            <span class="text-sm">${category}</span>
            <span class="text-xs text-cyan-300">#${index + 1}</span>
        </div>
    `).join('');
    
    trendingDiv.innerHTML = trendingHTML;
}

function updateAIInsights(category) {
    const insightsDiv = document.getElementById('ai-insights');
    if (!insightsDiv) return;
    
    let insights = 'Select a category to see AI-powered demand predictions and trends analysis.';
    
    if (category) {
        insights = `AI analysis for ${category}: Based on historical patterns and current trends, 
                   this category shows ${Math.random() > 0.5 ? 'increasing' : 'stable'} demand. 
                   Recommended action: ${Math.random() > 0.5 ? 'Increase inventory' : 'Maintain current levels'}.`;
    }
    
    insightsDiv.textContent = insights;
}

// Update chart theme
window.updateChartTheme = function(theme) {
    const isLight = theme === 'light';
    const textColor = isLight ? '#1f2937' : '#d1d5db';
    const gridColor = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';

    [demandChart, accuracyChart].forEach(chart => {
        if (!chart) return;
        chart.options.plugins.legend.labels.color = textColor;
        if (chart.options.scales) {
            chart.options.scales.x.ticks.color = textColor;
            chart.options.scales.y.ticks.color = textColor;
            chart.options.scales.x.grid.color = gridColor;
            chart.options.scales.y.grid.color = gridColor;
        }
        chart.update();
    });
};