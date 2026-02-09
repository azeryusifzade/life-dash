// Life Analytics - Complete Application with Enhanced Analytics
// ============================================================================

// ============================================================================
// Wisdom Quotes
// ============================================================================

const wisdomQuotes = [
    "Small daily improvements are the key to staggering long-term results.",
    "What you do today can improve all your tomorrows.",
    "Success is the sum of small efforts repeated day in and day out.",
    "The secret of getting ahead is getting started.",
    "Your health is an investment, not an expense.",
    "Sleep is the best meditation.",
    "Take care of your body. It's the only place you have to live.",
    "Progress, not perfection.",
    "Every day is a new beginning. Take a deep breath and start again.",
    "The only bad workout is the one that didn't happen.",
    "Be stronger than your excuses.",
    "Your body hears everything your mind says. Stay positive.",
    "Consistency is what transforms average into excellence.",
    "Small steps in the right direction can turn out to be the biggest step of your life.",
    "Energy and persistence conquer all things.",
    "The groundwork of all happiness is health.",
    "Discipline is choosing between what you want now and what you want most.",
    "You don't have to be great to start, but you have to start to be great.",
    "The only person you should try to be better than is the person you were yesterday.",
    "Your future self is watching you right now through memories."
];

function getRandomWisdom() {
    return wisdomQuotes[Math.floor(Math.random() * wisdomQuotes.length)];
}

function displayWisdom() {
    const wisdomText = document.getElementById('wisdom-text');
    if (wisdomText) {
        wisdomText.textContent = getRandomWisdom();
        wisdomText.style.animation = 'fadeIn 0.5s ease';
        setTimeout(() => {
            wisdomText.style.animation = '';
        }, 500);
    }
}

// ============================================================================
// Storage Management
// ============================================================================

const Storage = {
    getEntries() {
        const data = localStorage.getItem('lifeAnalyticsEntries');
        return data ? JSON.parse(data) : [];
    },
    
    saveEntries(entries) {
        localStorage.setItem('lifeAnalyticsEntries', JSON.stringify(entries));
    },
    
    addEntry(entry) {
        const entries = this.getEntries();
        const existingIndex = entries.findIndex(e => e.date === entry.date);
        
        if (existingIndex >= 0) {
            entries[existingIndex] = entry;
        } else {
            entries.push(entry);
        }
        
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        this.saveEntries(entries);
        return entries;
    },
    
    getEntryByDate(date) {
        const entries = this.getEntries();
        return entries.find(e => e.date === date);
    },
    
    getHabits() {
        const data = localStorage.getItem('lifeAnalyticsHabits');
        return data ? JSON.parse(data) : [];
    },
    
    saveHabits(habits) {
        localStorage.setItem('lifeAnalyticsHabits', JSON.stringify(habits));
    },
    
    addHabit(habit) {
        const habits = this.getHabits();
        habits.push({
            id: Date.now(),
            name: habit.name,
            createdAt: new Date().toISOString()
        });
        this.saveHabits(habits);
        return habits;
    },
    
    deleteHabit(id) {
        const habits = this.getHabits();
        const filtered = habits.filter(h => h.id !== id);
        this.saveHabits(filtered);
        return filtered;
    }
};

// ============================================================================
// Undo System
// ============================================================================

const UndoSystem = {
    lastAction: null,
    
    saveAction(action, data) {
        this.lastAction = { action, data, timestamp: Date.now() };
    },
    
    canUndo() {
        return this.lastAction !== null && 
               (Date.now() - this.lastAction.timestamp) < 10000;
    },
    
    performUndo() {
        if (!this.canUndo()) return false;
        
        const { action, data } = this.lastAction;
        
        switch(action) {
            case 'save_entry':
                const entries = Storage.getEntries();
                const filtered = entries.filter(e => e.date !== data.date);
                Storage.saveEntries(filtered);
                break;
                
            case 'add_habit':
                Storage.deleteHabit(data.id);
                break;
                
            case 'delete_habit':
                const habits = Storage.getHabits();
                habits.push(data);
                Storage.saveHabits(habits);
                break;
        }
        
        this.lastAction = null;
        return true;
    }
};

// ============================================================================
// Toast Notifications
// ============================================================================

const Toast = {
    show(message, showUndo = false) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        const undoBtn = document.getElementById('undo-btn');
        
        toastMessage.textContent = message;
        undoBtn.style.display = showUndo ? 'block' : 'none';
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    },
    
    hide() {
        const toast = document.getElementById('toast');
        toast.classList.remove('show');
    }
};

// ============================================================================
// Theme Management
// ============================================================================

const ThemeManager = {
    init() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
        
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleTheme());
        }
    },
    
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    },
    
    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = current === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }
};

// ============================================================================
// Chart Management
// ============================================================================

let charts = {};

function destroyChart(chartId) {
    if (charts[chartId]) {
        charts[chartId].destroy();
        delete charts[chartId];
    }
}

function createTimeChart(entry) {
    const canvas = document.getElementById('timeChart');
    if (!canvas) return;
    
    destroyChart('timeChart');
    
    const data = [
        { name: 'Work', value: entry.workTime, color: '#667eea' },
        { name: 'Personal', value: entry.personalTime, color: '#10b981' },
        { name: 'Social', value: entry.socialTime, color: '#f59e0b' },
        { name: 'Rest', value: entry.restTime, color: '#3b82f6' }
    ].filter(item => item.value > 0);
    
    if (data.length === 0) {
        canvas.style.display = 'none';
        return;
    }
    
    canvas.style.display = 'block';
    
    charts.timeChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: data.map(d => d.name),
            datasets: [{
                data: data.map(d => d.value),
                backgroundColor: data.map(d => d.color),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: { size: 12, weight: '500' }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.label}: ${context.parsed}h`
                    }
                }
            }
        }
    });
}

function createWeeklyChart() {
    const canvas = document.getElementById('weeklyChart');
    if (!canvas) return;
    
    destroyChart('weeklyChart');
    
    const entries = Storage.getEntries();
    const last7Days = getLast7DaysData(entries);
    
    charts.weeklyChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: last7Days.map(d => d.date),
            datasets: [{
                label: 'Energy',
                data: last7Days.map(d => d.energy),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: { 
                    beginAtZero: true, 
                    max: 5,
                    ticks: { stepSize: 1 }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function createTrendCharts() {
    const entries = Storage.getEntries();
    const last7Days = getLast7DaysData(entries);
    
    // Energy & Mood Chart
    const energyCanvas = document.getElementById('energyMoodChart');
    if (energyCanvas) {
        destroyChart('energyMoodChart');
        charts.energyMoodChart = new Chart(energyCanvas, {
            type: 'line',
            data: {
                labels: last7Days.map(d => d.date),
                datasets: [
                    {
                        label: 'Energy',
                        data: last7Days.map(d => d.energy),
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Mood',
                        data: last7Days.map(d => d.mood),
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: { 
                        beginAtZero: true, 
                        max: 5,
                        ticks: { stepSize: 1 }
                    }
                },
                plugins: {
                    legend: { 
                        labels: { 
                            font: { size: 12, weight: '500' } 
                        } 
                    }
                }
            }
        });
    }
    
    // Sleep & Activity Chart
    const sleepCanvas = document.getElementById('sleepActivityChart');
    if (sleepCanvas) {
        destroyChart('sleepActivityChart');
        charts.sleepActivityChart = new Chart(sleepCanvas, {
            type: 'bar',
            data: {
                labels: last7Days.map(d => d.date),
                datasets: [
                    {
                        label: 'Sleep (hours)',
                        data: last7Days.map(d => d.sleep),
                        backgroundColor: '#3b82f6',
                        borderRadius: 6
                    },
                    {
                        label: 'Activity (min)',
                        data: last7Days.map(d => d.activity),
                        backgroundColor: '#f59e0b',
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { 
                        labels: { 
                            font: { size: 12, weight: '500' } 
                        } 
                    }
                }
            }
        });
    }
    
    // Screen Time Chart
    const screenCanvas = document.getElementById('screenTimeChart');
    if (screenCanvas) {
        destroyChart('screenTimeChart');
        charts.screenTimeChart = new Chart(screenCanvas, {
            type: 'line',
            data: {
                labels: last7Days.map(d => d.date),
                datasets: [{
                    label: 'Screen Time (hours)',
                    data: last7Days.map(d => d.screenTime),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { 
                        labels: { 
                            font: { size: 12, weight: '500' } 
                        } 
                    }
                }
            }
        });
    }

    // Food Quality Pie Chart
    const foodCanvas = document.getElementById('foodQualityChart');
    if (foodCanvas && entries.length > 0) {
        destroyChart('foodQualityChart');
        
        const foodCounts = entries.reduce((acc, e) => {
            acc[e.foodType] = (acc[e.foodType] || 0) + 1;
            return acc;
        }, {});
        
        charts.foodQualityChart = new Chart(foodCanvas, {
            type: 'doughnut',
            data: {
                labels: Object.keys(foodCounts).map(k => k === 'healthy' ? 'Healthy' : k === 'fast-food' ? 'Fast Food' : 'Skipped'),
                datasets: [{
                    data: Object.values(foodCounts),
                    backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: { size: 12, weight: '500' }
                        }
                    }
                }
            }
        });
    }

    // Daily Balance Chart
    const balanceCanvas = document.getElementById('balanceChart');
    if (balanceCanvas) {
        destroyChart('balanceChart');
        
        const avgData = {
            work: entries.reduce((sum, e) => sum + (e.workTime || 0), 0) / entries.length || 0,
            personal: entries.reduce((sum, e) => sum + (e.personalTime || 0), 0) / entries.length || 0,
            social: entries.reduce((sum, e) => sum + (e.socialTime || 0), 0) / entries.length || 0,
            rest: entries.reduce((sum, e) => sum + (e.restTime || 0), 0) / entries.length || 0
        };
        
        charts.balanceChart = new Chart(balanceCanvas, {
            type: 'polarArea',
            data: {
                labels: ['Work', 'Personal', 'Social', 'Rest'],
                datasets: [{
                    data: [avgData.work, avgData.personal, avgData.social, avgData.rest],
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.6)',
                        'rgba(16, 185, 129, 0.6)',
                        'rgba(245, 158, 11, 0.6)',
                        'rgba(59, 130, 246, 0.6)'
                    ],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { size: 12, weight: '500' }
                        }
                    }
                }
            }
        });
    }

    // Productivity Score Chart
    const productivityCanvas = document.getElementById('productivityChart');
    if (productivityCanvas) {
        destroyChart('productivityChart');
        
        const productivityScores = last7Days.map(d => {
            const entry = entries.find(e => new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === d.date);
            if (!entry) return 0;
            
            // Calculate productivity score based on multiple factors
            const sleepScore = Math.min(entry.sleep / 8, 1) * 20;
            const activityScore = Math.min(entry.activity / 30, 1) * 20;
            const energyScore = (entry.energy / 5) * 20;
            const moodScore = (entry.mood / 5) * 20;
            const screenPenalty = Math.max(0, 20 - (entry.screenTime * 2));
            
            return sleepScore + activityScore + energyScore + moodScore + screenPenalty;
        });
        
        charts.productivityChart = new Chart(productivityCanvas, {
            type: 'bar',
            data: {
                labels: last7Days.map(d => d.date),
                datasets: [{
                    label: 'Productivity Score',
                    data: productivityScores,
                    backgroundColor: productivityScores.map(score => 
                        score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
                    ),
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { stepSize: 20 }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
}

function getLast7DaysData(entries) {
    return [...Array(7)].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const dateStr = date.toISOString().split('T')[0];
        const entry = entries.find(e => e.date === dateStr);
        return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            energy: entry?.energy || 0,
            mood: entry?.mood || 0,
            sleep: entry?.sleep || 0,
            activity: entry?.physicalActivity || 0,
            screenTime: entry?.screenTime || 0
        };
    });
}

// ============================================================================
// Personal Suggestions
// ============================================================================

function generateSuggestions(entry) {
    const suggestions = [];
    
    // Sleep analysis
    if (entry.sleep < 6) {
        suggestions.push({
            type: 'bad',
            icon: '😴',
            title: 'Insufficient Sleep',
            message: `You only slept ${entry.sleep} hours. Aim for 7-9 hours for optimal health and energy.`
        });
    } else if (entry.sleep >= 7 && entry.sleep <= 9) {
        suggestions.push({
            type: 'good',
            icon: '✨',
            title: 'Great Sleep',
            message: `Excellent! ${entry.sleep} hours is within the recommended range. Keep it up!`
        });
    } else if (entry.sleep > 9) {
        suggestions.push({
            type: 'neutral',
            icon: '💤',
            title: 'Extra Sleep',
            message: `You slept ${entry.sleep} hours. While rest is important, oversleeping may indicate other issues.`
        });
    }
    
    // Physical activity
    if (entry.physicalActivity < 20) {
        suggestions.push({
            type: 'bad',
            icon: '🏃',
            title: 'Low Activity',
            message: `Only ${entry.physicalActivity} minutes of activity. Try to get at least 30 minutes daily.`
        });
    } else if (entry.physicalActivity >= 30) {
        suggestions.push({
            type: 'good',
            icon: '💪',
            title: 'Active Day',
            message: `Great job! ${entry.physicalActivity} minutes of activity contributes to better health.`
        });
    }
    
    // Screen time
    if (entry.screenTime > 6) {
        suggestions.push({
            type: 'bad',
            icon: '📱',
            title: 'High Screen Time',
            message: `${entry.screenTime} hours is quite high. Consider reducing screen time for better sleep and focus.`
        });
    } else if (entry.screenTime <= 4) {
        suggestions.push({
            type: 'good',
            icon: '👁️',
            title: 'Healthy Screen Time',
            message: `Good balance! ${entry.screenTime} hours of screen time is manageable.`
        });
    }
    
    // Food quality
    if (entry.foodType === 'fast-food') {
        suggestions.push({
            type: 'bad',
            icon: '🍔',
            title: 'Fast Food Alert',
            message: 'Try to include more whole foods in your diet for better energy and health.'
        });
    } else if (entry.foodType === 'healthy') {
        suggestions.push({
            type: 'good',
            icon: '🥗',
            title: 'Healthy Eating',
            message: 'Excellent food choices! Nutritious meals fuel your body and mind.'
        });
    } else if (entry.foodType === 'skipped') {
        suggestions.push({
            type: 'bad',
            icon: '⚠️',
            title: 'Skipped Meals',
            message: 'Regular meals are important for maintaining energy and metabolism.'
        });
    }
    
    // Energy and mood correlation
    if (entry.energy <= 2 || entry.mood <= 2) {
        suggestions.push({
            type: 'bad',
            icon: '😔',
            title: 'Low Energy/Mood',
            message: 'Consider reviewing your sleep, diet, and activity levels. Small changes can make a big difference.'
        });
    } else if (entry.energy >= 4 && entry.mood >= 4) {
        suggestions.push({
            type: 'good',
            icon: '😊',
            title: 'Feeling Great',
            message: 'Your energy and mood are excellent! Keep up whatever you\'re doing right.'
        });
    }
    
    // Work-life balance
    const totalTime = (entry.workTime || 0) + (entry.personalTime || 0) + (entry.socialTime || 0) + (entry.restTime || 0);
    if (totalTime > 0) {
        const workPercent = ((entry.workTime || 0) / totalTime) * 100;
        if (workPercent > 60) {
            suggestions.push({
                type: 'bad',
                icon: '⚖️',
                title: 'Work-Life Imbalance',
                message: 'Work is taking up most of your time. Remember to balance with rest and personal activities.'
            });
        } else if (workPercent >= 30 && workPercent <= 50) {
            suggestions.push({
                type: 'good',
                icon: '🎯',
                title: 'Good Balance',
                message: 'You have a healthy work-life balance. This supports long-term wellbeing.'
            });
        }
    }
    
    return suggestions;
}

function renderSuggestions() {
    const container = document.getElementById('suggestions-container');
    if (!container) return;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const entry = Storage.getEntryByDate(todayStr);
    
    if (!entry) {
        container.innerHTML = '';
        return;
    }
    
    const suggestions = generateSuggestions(entry);
    
    if (suggestions.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = `
        <h3 class="suggestions-title">Personal Suggestions</h3>
        <div class="suggestions-grid">
            ${suggestions.map(s => `
                <div class="suggestion-card ${s.type}">
                    <div class="suggestion-icon">${s.icon}</div>
                    <div class="suggestion-content">
                        <h4 class="suggestion-title">${s.title}</h4>
                        <p class="suggestion-message">${s.message}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// ============================================================================
// Correlation Analysis
// ============================================================================

function calculateCorrelation(x, y) {
    const n = x.length;
    if (n === 0) return 0;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    if (denominator === 0) return 0;
    return numerator / denominator;
}

function analyzeCorrelations() {
    const entries = Storage.getEntries();
    
    if (entries.length < 7) {
        return [{
            title: 'Not Enough Data',
            description: 'Track at least 7 days to see meaningful patterns and correlations.',
            strength: 'weak',
            correlation: 0
        }];
    }
    
    const correlations = [];
    
    const sleepData = entries.map(e => e.sleep);
    const energyData = entries.map(e => e.energy);
    const sleepEnergyCorr = calculateCorrelation(sleepData, energyData);
    
    if (Math.abs(sleepEnergyCorr) > 0.3) {
        const avgSleep = sleepData.reduce((a, b) => a + b, 0) / sleepData.length;
        correlations.push({
            title: 'Sleep Quality → Energy Levels',
            description: `Your sleep and energy levels show a ${sleepEnergyCorr > 0 ? 'positive' : 'negative'} correlation (${(sleepEnergyCorr * 100).toFixed(0)}%). ${
                sleepEnergyCorr > 0.5 ? 
                `Getting ${avgSleep >= 7 ? 'adequate' : 'more'} sleep significantly boosts your energy.` :
                'Consider optimizing your sleep schedule for better energy levels.'
            }`,
            strength: Math.abs(sleepEnergyCorr) > 0.7 ? 'strong' : Math.abs(sleepEnergyCorr) > 0.5 ? 'moderate' : 'weak',
            correlation: sleepEnergyCorr,
            avgValue: avgSleep.toFixed(1) + 'h'
        });
    }
    
    const activityData = entries.map(e => e.physicalActivity);
    const moodData = entries.map(e => e.mood);
    const activityMoodCorr = calculateCorrelation(activityData, moodData);
    
    if (Math.abs(activityMoodCorr) > 0.3) {
        const avgActivity = activityData.reduce((a, b) => a + b, 0) / activityData.length;
        correlations.push({
            title: 'Physical Activity → Mood',
            description: `Physical activity and mood show a ${activityMoodCorr > 0 ? 'positive' : 'negative'} relationship (${(activityMoodCorr * 100).toFixed(0)}%). ${
                activityMoodCorr > 0.5 ?
                `Days with ${avgActivity >= 30 ? 'regular' : 'more'} exercise tend to have better moods.` :
                'Consider incorporating more movement into your routine.'
            }`,
            strength: Math.abs(activityMoodCorr) > 0.7 ? 'strong' : Math.abs(activityMoodCorr) > 0.5 ? 'moderate' : 'weak',
            correlation: activityMoodCorr,
            avgValue: Math.round(avgActivity) + ' min'
        });
    }
    
    const screenData = entries.map(e => e.screenTime);
    const screenSleepCorr = calculateCorrelation(screenData, sleepData);
    
    if (Math.abs(screenSleepCorr) > 0.3) {
        const avgScreen = screenData.reduce((a, b) => a + b, 0) / screenData.length;
        correlations.push({
            title: 'Screen Time → Sleep Quality',
            description: `Screen time and sleep show a ${screenSleepCorr < 0 ? 'negative' : 'positive'} correlation (${(screenSleepCorr * 100).toFixed(0)}%). ${
                screenSleepCorr < -0.3 ?
                `High screen time (avg ${avgScreen.toFixed(1)}h) may be affecting your sleep quality.` :
                'Monitor screen time before bed for better sleep.'
            }`,
            strength: Math.abs(screenSleepCorr) > 0.7 ? 'strong' : Math.abs(screenSleepCorr) > 0.5 ? 'moderate' : 'weak',
            correlation: screenSleepCorr,
            avgValue: avgScreen.toFixed(1) + 'h'
        });
    }
    
    const workData = entries.map(e => e.workTime || 0);
    const restData = entries.map(e => e.restTime || 0);
    const workRestRatio = workData.reduce((a, b) => a + b, 0) / (restData.reduce((a, b) => a + b, 0) || 1);
    
    if (workRestRatio > 2 || workRestRatio < 0.5) {
        correlations.push({
            title: 'Work-Life Balance',
            description: `Your work-to-rest ratio is ${workRestRatio.toFixed(1)}:1. ${
                workRestRatio > 2 ?
                'Consider allocating more time for rest and recovery.' :
                workRestRatio < 0.5 ?
                'You have good rest time. Ensure work productivity is optimal.' :
                'Your balance looks healthy.'
            }`,
            strength: workRestRatio > 3 || workRestRatio < 0.3 ? 'strong' : 'moderate',
            correlation: 0,
            avgValue: workRestRatio.toFixed(1) + ':1'
        });
    }
    
    if (correlations.length === 0) {
        correlations.push({
            title: 'Keep Tracking',
            description: 'No strong patterns detected yet. Continue tracking to discover meaningful insights about your habits and wellbeing.',
            strength: 'weak',
            correlation: 0
        });
    }
    
    return correlations;
}

function renderCorrelations() {
    const container = document.getElementById('correlations-container');
    if (!container) return;
    
    const correlations = analyzeCorrelations();
    
    if (correlations.length === 0 || correlations[0].title === 'Not Enough Data') {
        container.innerHTML = `
            <div class="no-correlations">
                <h3>Not Enough Data</h3>
                <p>Track at least 7 days to discover patterns and correlations in your data.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = correlations.map(corr => `
        <div class="correlation-card">
            <div class="correlation-header">
                <div>
                    <h3 class="correlation-title">${corr.title}</h3>
                    <span class="correlation-badge ${corr.strength}">${corr.strength}</span>
                </div>
            </div>
            <p class="correlation-description">${corr.description}</p>
            ${corr.avgValue ? `
                <div class="correlation-stats">
                    <div class="correlation-stat">
                        <div class="correlation-stat-value">${(corr.correlation * 100).toFixed(0)}%</div>
                        <div class="correlation-stat-label">Correlation</div>
                    </div>
                    <div class="correlation-stat">
                        <div class="correlation-stat-value">${corr.avgValue}</div>
                        <div class="correlation-stat-label">Average</div>
                    </div>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// ============================================================================
// Dashboard Rendering
// ============================================================================

function renderDashboard() {
    const dateDisplay = document.getElementById('current-date');
    if (dateDisplay) {
        const today = new Date();
        dateDisplay.textContent = today.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }
    
    displayWisdom();
    
    const todayStr = new Date().toISOString().split('T')[0];
    const entry = Storage.getEntryByDate(todayStr);
    
    if (!entry) {
        document.getElementById('today-summary').innerHTML = `
            <div class="no-data">
                <h3>No Entry for Today</h3>
                <p>Start tracking your day to see insights and analytics</p>
            </div>
        `;
        document.getElementById('quick-stats').innerHTML = '';
        document.getElementById('habits-summary').innerHTML = '';
        document.getElementById('suggestions-container').innerHTML = '';
        return;
    }
    
    const statsHtml = `
        <div class="stat-card">
            <div class="stat-label">Energy Level</div>
            <div class="stat-value">${entry.energy}<span class="stat-unit">/5</span></div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Mood</div>
            <div class="stat-value">${entry.mood}<span class="stat-unit">/5</span></div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Sleep</div>
            <div class="stat-value">${entry.sleep}<span class="stat-unit">h</span></div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Activity</div>
            <div class="stat-value">${entry.physicalActivity}<span class="stat-unit">min</span></div>
        </div>
    `;
    
    document.getElementById('quick-stats').innerHTML = statsHtml;
    
    renderSuggestions();
    createTimeChart(entry);
    createWeeklyChart();
    renderHabitsSummary(entry);
}

function renderHabitsSummary(entry) {
    const container = document.getElementById('habits-summary');
    if (!container) return;
    
    const habits = Storage.getHabits();
    
    if (habits.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    const completedHabits = entry.habits ? entry.habits.filter(h => h.completed).length : 0;
    const totalHabits = habits.length;
    const percentage = totalHabits > 0 ? (completedHabits / totalHabits * 100) : 0;
    
    container.innerHTML = `
        <h3>Today's Habits</h3>
        <div class="habit-progress">
            <div class="habit-progress-bar">
                <div class="habit-progress-fill" style="width: ${percentage}%"></div>
            </div>
            <div class="habit-progress-text">${completedHabits}/${totalHabits}</div>
        </div>
    `;
}

// ============================================================================
// Form Management
// ============================================================================

function initializeForm() {
    const form = document.getElementById('daily-form');
    const today = new Date().toISOString().split('T')[0];
    
    document.getElementById('date').value = today;
    
    const entry = Storage.getEntryByDate(today);
    if (entry) {
        loadFormData(entry);
    }
    
    setupRangeInput('sleep', 'sleep-value', (val) => `${parseFloat(val).toFixed(1)}h`);
    setupRangeInput('activity', 'activity-value', (val) => `${val} min`);
    setupRangeInput('screen', 'screen-value', (val) => `${parseFloat(val).toFixed(1)}h`);
    setupRangeInput('work-time', 'work-value', (val) => `${parseFloat(val).toFixed(1)}h`);
    setupRangeInput('personal-time', 'personal-value', (val) => `${parseFloat(val).toFixed(1)}h`);
    setupRangeInput('social-time', 'social-value', (val) => `${parseFloat(val).toFixed(1)}h`);
    setupRangeInput('rest-time', 'rest-value', (val) => `${parseFloat(val).toFixed(1)}h`);
    
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.parentElement.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    document.querySelectorAll('.rating-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.parentElement.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    renderHabitsForm();
    form.addEventListener('submit', handleFormSubmit);
}

function setupRangeInput(inputId, displayId, formatter) {
    const input = document.getElementById(inputId);
    const display = document.getElementById(displayId);
    
    if (input && display) {
        const updateDisplay = () => {
            display.textContent = formatter(input.value);
        };
        
        input.addEventListener('input', updateDisplay);
        updateDisplay();
    }
}

function loadFormData(entry) {
    document.getElementById('sleep').value = entry.sleep;
    document.getElementById('activity').value = entry.physicalActivity;
    document.getElementById('screen').value = entry.screenTime;
    document.getElementById('work-time').value = entry.workTime || 0;
    document.getElementById('personal-time').value = entry.personalTime || 0;
    document.getElementById('social-time').value = entry.socialTime || 0;
    document.getElementById('rest-time').value = entry.restTime || 0;
    
    ['sleep', 'activity', 'screen', 'work-time', 'personal-time', 'social-time', 'rest-time'].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.dispatchEvent(new Event('input'));
    });
    
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.food === entry.foodType) {
            btn.classList.add('active');
        }
    });
    
    document.querySelectorAll('#energy-rating .rating-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.rating) === entry.energy) {
            btn.classList.add('active');
        }
    });
    
    document.querySelectorAll('#mood-rating .rating-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.rating) === entry.mood) {
            btn.classList.add('active');
        }
    });
    
    const diaryTextarea = document.getElementById('diary');
    if (diaryTextarea && entry.diary) {
        diaryTextarea.value = entry.diary;
    }
    
    if (entry.habits) {
        entry.habits.forEach(habit => {
            const checkbox = document.querySelector(`input[data-habit-id="${habit.id}"]`);
            if (checkbox) {
                checkbox.checked = habit.completed;
            }
        });
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const foodTypeBtn = document.querySelector('.option-btn.active');
    const energyBtn = document.querySelector('#energy-rating .rating-btn.active');
    const moodBtn = document.querySelector('#mood-rating .rating-btn.active');
    
    const habits = Storage.getHabits();
    const habitData = habits.map(habit => ({
        id: habit.id,
        name: habit.name,
        completed: document.querySelector(`input[data-habit-id="${habit.id}"]`)?.checked || false
    }));
    
    const entry = {
        date: document.getElementById('date').value,
        sleep: parseFloat(document.getElementById('sleep').value),
        foodType: foodTypeBtn ? foodTypeBtn.dataset.food : 'healthy',
        physicalActivity: parseInt(document.getElementById('activity').value),
        screenTime: parseFloat(document.getElementById('screen').value),
        energy: energyBtn ? parseInt(energyBtn.dataset.rating) : 3,
        mood: moodBtn ? parseInt(moodBtn.dataset.rating) : 3,
        workTime: parseFloat(document.getElementById('work-time').value),
        personalTime: parseFloat(document.getElementById('personal-time').value),
        socialTime: parseFloat(document.getElementById('social-time').value),
        restTime: parseFloat(document.getElementById('rest-time').value),
        diary: document.getElementById('diary').value,
        habits: habitData,
        timestamp: new Date().toISOString()
    };
    
    Storage.addEntry(entry);
    UndoSystem.saveAction('save_entry', entry);
    
    Toast.show('Entry saved successfully', true);
    
    setTimeout(() => {
        switchView('dashboard');
    }, 500);
}

// ============================================================================
// Custom Habits Management
// ============================================================================

function renderHabitsForm() {
    const container = document.getElementById('habits-container');
    if (!container) return;
    
    const habits = Storage.getHabits();
    
    if (habits.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.875rem;">No habits added yet. Click "Add Habit" to create your first habit.</p>';
        return;
    }
    
    container.innerHTML = habits.map(habit => `
        <div class="habit-item">
            <input type="checkbox" class="habit-checkbox" data-habit-id="${habit.id}">
            <span class="habit-name">${habit.name}</span>
            <button type="button" class="habit-delete" data-habit-id="${habit.id}">×</button>
        </div>
    `).join('');
    
    container.querySelectorAll('.habit-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            this.closest('.habit-item').classList.toggle('completed', this.checked);
        });
    });
    
    container.querySelectorAll('.habit-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const habitId = parseInt(this.dataset.habitId);
            const habit = habits.find(h => h.id === habitId);
            Storage.deleteHabit(habitId);
            UndoSystem.saveAction('delete_habit', habit);
            Toast.show('Habit deleted', true);
            renderHabitsForm();
        });
    });
}

function initializeHabitModal() {
    const modal = document.getElementById('habit-modal');
    const addBtn = document.getElementById('add-habit-btn');
    const closeBtn = document.getElementById('close-habit-modal');
    const cancelBtn = document.getElementById('cancel-habit');
    const form = document.getElementById('add-habit-form');
    
    addBtn.addEventListener('click', () => {
        modal.classList.add('active');
        document.getElementById('habit-name').value = '';
    });
    
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const habitName = document.getElementById('habit-name').value.trim();
        
        if (habitName) {
            const newHabit = Storage.addHabit({ name: habitName });
            const addedHabit = newHabit[newHabit.length - 1];
            UndoSystem.saveAction('add_habit', addedHabit);
            Toast.show('Habit added successfully', true);
            renderHabitsForm();
            modal.classList.remove('active');
        }
    });
}

// ============================================================================
// Trends View
// ============================================================================

function renderTrends() {
    const entries = Storage.getEntries();
    
    if (entries.length === 0) {
        document.getElementById('stats-summary').innerHTML = `
            <div class="no-data">
                <h3>No Data Yet</h3>
                <p>Start tracking to see your trends and patterns.</p>
            </div>
        `;
        return;
    }
    
    createTrendCharts();
    
    const avgEnergy = (entries.reduce((sum, e) => sum + e.energy, 0) / entries.length).toFixed(1);
    const avgMood = (entries.reduce((sum, e) => sum + e.mood, 0) / entries.length).toFixed(1);
    const avgSleep = (entries.reduce((sum, e) => sum + e.sleep, 0) / entries.length).toFixed(1);
    const avgActivity = Math.round(entries.reduce((sum, e) => sum + e.physicalActivity, 0) / entries.length);
    
    const bestDay = entries.reduce((best, e) => (e.energy + e.mood > best.energy + best.mood) ? e : best);
    const mostProductive = entries.reduce((best, e) => ((e.workTime || 0) > (best.workTime || 0)) ? e : best);
    
    document.getElementById('stats-summary').innerHTML = `
        <h3>Summary Statistics</h3>
        <div class="summary-item">
            <span class="summary-label">Average Energy</span>
            <span class="summary-value">${avgEnergy}/5</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Average Mood</span>
            <span class="summary-value">${avgMood}/5</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Average Sleep</span>
            <span class="summary-value">${avgSleep}h</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Average Activity</span>
            <span class="summary-value">${avgActivity} min</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Total Entries</span>
            <span class="summary-value">${entries.length}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Best Day</span>
            <span class="summary-value">${new Date(bestDay.date).toLocaleDateString()}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Most Productive</span>
            <span class="summary-value">${new Date(mostProductive.date).toLocaleDateString()}</span>
        </div>
    `;
}

// ============================================================================
// Calendar View
// ============================================================================

let currentCalendarDate = new Date();

function renderCalendar() {
    const monthYear = currentCalendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    document.getElementById('current-month').textContent = monthYear;
    
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const entries = Storage.getEntries();
    const today = new Date().toISOString().split('T')[0];
    
    let html = '';
    
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i;
        html += `<div class="calendar-day other-month">${day}</div>`;
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];
        const entry = entries.find(e => e.date === dateStr);
        
        let classes = ['calendar-day'];
        
        if (dateStr === today) classes.push('today');
        
        if (entry) {
            classes.push('has-data');
            
            const avgScore = (entry.energy + entry.mood) / 2;
            if (avgScore >= 4) classes.push('high-energy');
            else if (avgScore >= 3) classes.push('medium-energy');
            else classes.push('low-energy');
        }
        
        html += `<div class="${classes.join(' ')}" data-date="${dateStr}">${day}</div>`;
    }
    
    const remainingDays = 42 - (startingDayOfWeek + daysInMonth);
    for (let day = 1; day <= remainingDays; day++) {
        html += `<div class="calendar-day other-month">${day}</div>`;
    }
    
    document.getElementById('calendar-days').innerHTML = html;
    
    document.querySelectorAll('.calendar-day.has-data').forEach(day => {
        day.addEventListener('click', function() {
            showDayModal(this.dataset.date);
        });
    });
}

function showDayModal(date) {
    const entry = Storage.getEntryByDate(date);
    if (!entry) return;
    
    const modal = document.getElementById('day-modal');
    const formattedDate = new Date(date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    document.getElementById('modal-date').textContent = formattedDate;
    
    document.getElementById('modal-stats').innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Energy</div>
                <div class="stat-value">${entry.energy}<span class="stat-unit">/5</span></div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Mood</div>
                <div class="stat-value">${entry.mood}<span class="stat-unit">/5</span></div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Sleep</div>
                <div class="stat-value">${entry.sleep}<span class="stat-unit">h</span></div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Activity</div>
                <div class="stat-value">${entry.physicalActivity}<span class="stat-unit">min</span></div>
            </div>
        </div>
    `;
    
    const diarySection = document.getElementById('modal-diary');
    if (entry.diary && entry.diary.trim()) {
        diarySection.innerHTML = `
            <h4>Daily Notes</h4>
            <p>${entry.diary}</p>
        `;
        diarySection.style.display = 'block';
    } else {
        diarySection.style.display = 'none';
    }
    
    modal.classList.add('active');
}

// ============================================================================
// Navigation
// ============================================================================

function switchView(viewName) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    const view = document.getElementById(`${viewName}-view`);
    if (view) {
        view.classList.add('active');
    }
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[data-view="${viewName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    switch(viewName) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'trends':
            renderTrends();
            break;
        case 'calendar':
            renderCalendar();
            break;
        case 'correlations':
            renderCorrelations();
            break;
    }
}

// ============================================================================
// Initialization
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    ThemeManager.init();
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchView(this.dataset.view);
        });
    });
    
    initializeForm();
    initializeHabitModal();
    
    document.getElementById('undo-btn').addEventListener('click', function() {
        if (UndoSystem.performUndo()) {
            Toast.show('Action undone');
            const activeView = document.querySelector('.nav-btn.active');
            if (activeView) {
                switchView(activeView.dataset.view);
            }
        }
    });
    
    const newWisdomBtn = document.getElementById('new-wisdom');
    if (newWisdomBtn) {
        newWisdomBtn.addEventListener('click', displayWisdom);
    }
    
    document.getElementById('prev-month').addEventListener('click', function() {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendar();
    });
    
    document.getElementById('next-month').addEventListener('click', function() {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendar();
    });
    
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
    
    renderDashboard();
});