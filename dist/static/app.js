// CAS Analysis Dashboard - Frontend JavaScript
class CASAnalyticsDashboard {
    constructor() {
        this.data = null;
        this.charts = {};
        this.init();
    }

    async init() {
        try {
            await this.loadDashboardData();
            this.updateKPIs();
            this.createCharts();
            this.updateLastUpdated();
            
            // Set up refresh functionality
            this.setupRefresh();
            
            console.log('CAS Analytics Dashboard initialized successfully');
        } catch (error) {
            console.error('Failed to initialize dashboard:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    async loadDashboardData() {
        try {
            const response = await axios.get('/api/dashboard/analytics');
            this.data = response.data;
            console.log('Dashboard data loaded:', this.data);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            throw error;
        }
    }

    updateKPIs() {
        if (!this.data || !this.data.ytd) return;

        const { ytd } = this.data;
        
        // Update KPI values
        const ytdRevenueEl = document.getElementById('ytdRevenue');
        const totalHoursEl = document.getElementById('totalHours');
        const effectiveRateEl = document.getElementById('effectiveRate');
        const profitMarginEl = document.getElementById('profitMargin');

        if (ytdRevenueEl) ytdRevenueEl.textContent = this.formatCurrency(ytd.revenue);
        if (totalHoursEl) totalHoursEl.textContent = ytd.hours.toLocaleString();
        if (effectiveRateEl) effectiveRateEl.textContent = this.formatCurrency(ytd.effectiveRate);
        if (profitMarginEl) profitMarginEl.textContent = `${ytd.profitMargin}%`;
    }

    createCharts() {
        if (!this.data || !this.data.monthly) return;

        this.createRevenueChart();
        this.createProfitChart();
    }

    createRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        const { monthly } = this.data;
        
        if (this.charts.revenue) {
            this.charts.revenue.destroy();
        }

        this.charts.revenue = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthly.map(m => m.month),
                datasets: [{
                    label: 'Revenue',
                    data: monthly.map(m => m.revenue),
                    backgroundColor: 'rgba(59, 130, 246, 0.8)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    createProfitChart() {
        const ctx = document.getElementById('profitChart');
        if (!ctx) return;

        const { monthly } = this.data;
        
        if (this.charts.profit) {
            this.charts.profit.destroy();
        }

        const profitMargins = monthly.map(m => {
            return m.revenue > 0 ? ((m.profit / m.revenue) * 100) : 0;
        });

        this.charts.profit = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthly.map(m => m.month),
                datasets: [{
                    label: 'Profit Margin %',
                    data: profitMargins,
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    setupRefresh() {
        const refreshBtn = document.querySelector('button:has(.fa-sync)');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                refreshBtn.disabled = true;
                refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Refreshing...';
                
                try {
                    await this.loadDashboardData();
                    this.updateKPIs();
                    this.createCharts();
                    this.updateLastUpdated();
                    
                    // Show success feedback
                    this.showSuccess('Dashboard refreshed successfully');
                } catch (error) {
                    console.error('Refresh failed:', error);
                    this.showError('Failed to refresh dashboard data');
                } finally {
                    refreshBtn.disabled = false;
                    refreshBtn.innerHTML = '<i class="fas fa-sync mr-2"></i>Refresh';
                }
            });
        }
    }

    updateLastUpdated() {
        const lastUpdatedEl = document.getElementById('lastUpdated');
        if (lastUpdatedEl) {
            lastUpdatedEl.textContent = new Date().toLocaleString();
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>
                <span>${message}</span>
                <button class="ml-4 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Health check function
async function checkHealth() {
    try {
        const response = await axios.get('/api/health');
        console.log('Health check:', response.data);
        return response.data;
    } catch (error) {
        console.error('Health check failed:', error);
        return null;
    }
}

// Check WorkflowMax integration status
async function checkWorkflowMaxStatus() {
    try {
        const response = await axios.get('/api/workflowmax/status');
        console.log('WorkflowMax status:', response.data);
        return response.data;
    } catch (error) {
        console.error('WorkflowMax status check failed:', error);
        return null;
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    window.dashboard = new CASAnalyticsDashboard();
    
    // Perform health check
    checkHealth();
    
    // Check WorkflowMax status
    checkWorkflowMaxStatus();
    
    console.log('CAS Analytics Dashboard loaded');
});

// Export for global access
window.CASAnalyticsDashboard = CASAnalyticsDashboard;