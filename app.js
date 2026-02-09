// Life Dashboard App - Main JavaScript

// ============================================================================
// Constants and Data
// ============================================================================

const LIFE_TIPS = [
    "Small habits create big changes.",
    "A 5-minute break boosts focus.",
    "Plan your day in the morning to save energy.",
    "Drink water first thing in the morning.",
    "Move your body for just 10 minutes daily.",
    "Deep breaths calm the mind instantly.",
    "Gratitude shifts perspective powerfully.",
    "Sleep is the foundation of everything.",
    "One task at a time beats multitasking.",
    "Nature time restores mental energy.",
    "Limit decisions to preserve willpower.",
    "Morning sunlight regulates your rhythm.",
    "Progress over perfection, always.",
    "Saying 'no' protects your energy.",
    "Track to understand, understand to improve.",
    "Rest is productive, not lazy.",
    "Your body keeps the score—listen to it.",
    "Consistency beats intensity every time.",
    "Energy management > time management.",
    "Small wins compound into transformation."
];

// ============================================================================
// Storage Management
// ============================================================================

const Storage = {
    getEntries() {
        const data = localStorage.getItem('lifeDashboardEntries');
        return data ? JSON.parse(data) : [];
    },
    
    saveEntries(entries) {
        localStorage.setItem('lifeDashboardEntries', JSON.stringify(entries));
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
    }
};

// ============================================================================
// Advice Generator
// ============================================================================

function generateAdvice(entry) {
    const advice = [];
    
    if (entry.sleep < 6) {
        advice.push("💤 You slept less than 6 hours — prioritize rest tonight or take a short nap.");
    } else if (entry.sleep >= 8) {
        advice.push("✨ Great sleep! Your body and mind are well-rested.");
    }
    
    if (entry.foodType === 'skipped') {
        advice.push("🍽️ You skipped meals — fuel your body with nutritious food for better energy.");
    } else if (entry.foodType === 'fast-food') {
        advice.push("🥗 Try adding more whole foods tomorrow for sustained energy.");
    } else if (entry.foodType === 'healthy') {
        advice.push("🌟 Healthy eating choice! Your body thanks you.");
    }
    
    if (entry.physicalActivity < 15) {
        advice.push("🚶 Low activity today — even a 10-minute walk can boost mood and energy.");
    } else if (entry.physicalActivity >= 30) {
        advice.push("💪 Excellent physical activity! Movement is medicine.");
    }
    
    if (entry.screenTime > 6) {
        advice.push("📱 High screen time — try the 20-20-20 rule: every 20 min, look 20 feet away for 20 sec.");
    }
    
    if (entry.energy <= 2) {
        advice.push("⚡ Low energy detected — consider rest, hydration, or a short walk.");
    } else if (entry.energy >= 4) {
        advice.push("🔥 High energy day! Great momentum.");
    }
    
    if (entry.mood <= 2) {
        advice.push("💙 Tough day emotionally — be kind to yourself. Tomorrow is a fresh start.");
    } else if (entry.mood >= 4) {
        advice.push("😊 Positive mood! Notice what contributed to feeling good today.");
    }
    
    const totalTime = entry.workTime + entry.personalTime + entry.socialTime + entry.restTime;
    if (totalTime > 16) {
        advice.push("⏰ Time allocation exceeds 24 hours — review and adjust your estimates.");
    } else if (entry.restTime < 2) {
        advice.push("🧘 Consider adding more rest/leisure time for better balance.");
    }
    
    return advice.length > 0 ? advice : ["🌱 Keep tracking to discover your patterns and optimize your wellbeing."];
}

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
        { name: 'Work', value: entry.workTime, color: '#FF6B6B' },
        { name: 'Personal', value: entry.personalTime, color: '#4ECDC4' },
        { name: 'Social', value: entry.socialTime, color: '#FFE66D' },
        { name: 'Rest', value: entry.restTime, color: '#A8E6CF' }
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
                borderWidth: 0
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
                        font: { size: 13, weight: '600' }
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
                        borderColor: '#FF6B6B',
                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Mood',
                        data: last7Days.map(d => d.mood),
                        borderColor: '#4ECDC4',
                        backgroundColor: 'rgba(78, 205, 196, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    y: { beginAtZero: true, max: 5 }
                },
                plugins: {
                    legend: { labels: { font: { size: 13, weight: '600' } } }
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
                        backgroundColor: '#A8E6CF',
                        borderRadius: 8
                    },
                    {
                        label: 'Activity (min)',
                        data: last7Days.map(d => d.activity),
                        backgroundColor: '#FFE66D',
                        borderRadius: 8
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { labels: { font: { size: 13, weight: '600' } } }
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
                    borderColor: '#764ba2',
                    backgroundColor: 'rgba(118, 75, 162, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { labels: { font: { size: 13, weight: '600' } } }
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
// Dashboard Rendering
// ============================================================================

function renderDashboard() {
    const today = new Date().toISOString().split('T')[0];
    const entry = Storage.getEntryByDate(today);
    
    // Set daily tip
    const dailyTip = LIFE_TIPS[Math.floor(Math.random() * LIFE_TIPS.length)];
    document.getElementById('daily-tip').textContent = dailyTip;
    
    if (!entry) {
        document.getElementById('today-summary').innerHTML = `
            <div class="no-data">
                <div class="no-data-icon">📊</div>
                <h3>No Entry Yet Today</h3>
                <p>Start tracking your day to unlock insights and advice.</p>
                <button class="no-data-btn" onclick="switchView('input')">Track Today</button>
            </div>
        `;
        document.getElementById('quick-stats').innerHTML = '';
        document.getElementById('time-chart-container').style.display = 'none';
        document.getElementById('insights-card').style.display = 'none';
        return;
    }
    
    // Quick Stats
    const stats = [
        { icon: '⚡', label: 'Energy', value: entry.energy, max: 5, color: '#FF6B6B' },
        { icon: '❤️', label: 'Mood', value: entry.mood, max: 5, color: '#4ECDC4' },
        { icon: '😴', label: 'Sleep', value: `${entry.sleep}h`, color: '#A8E6CF' },
        { icon: '🏃', label: 'Activity', value: `${entry.physicalActivity}m`, color: '#FFE66D' }
    ];
    
    document.getElementById('quick-stats').innerHTML = stats.map(stat => `
        <div class="stat-card">
            <div class="stat-header">
                <span class="stat-icon">${stat.icon}</span>
                <span>${stat.label}</span>
            </div>
            <div class="stat-value">
                ${stat.value}${stat.max ? `<span class="stat-max">/${stat.max}</span>` : ''}
            </div>
        </div>
    `).join('');
    
    // Time Chart
    document.getElementById('time-chart-container').style.display = 'block';
    createTimeChart(entry);
    
    // Insights
    const insights = generateAdvice(entry);
    document.getElementById('insights-card').style.display = 'block';
    document.getElementById('insights-card').innerHTML = `
        <h3>🧠 Personal Insights</h3>
        <ul class="insights-list">
            ${insights.map(insight => `<li>${insight}</li>`).join('')}
        </ul>
    `;
}

// ============================================================================
// Form Management
// ============================================================================

function initializeForm() {
    const form = document.getElementById('daily-form');
    const today = new Date().toISOString().split('T')[0];
    
    // Set today's date
    document.getElementById('date').value = today;
    
    // Load existing entry if available
    const entry = Storage.getEntryByDate(today);
    if (entry) {
        loadFormData(entry);
    }
    
    // Range input updates
    setupRangeInput('sleep', 'sleep-value', (val) => `${val}h`);
    setupRangeInput('activity', 'activity-value', (val) => `${val} min`);
    setupRangeInput('screen', 'screen-value', (val) => `${val}h`);
    setupRangeInput('work-time', 'work-value', (val) => `${val}h`);
    setupRangeInput('personal-time', 'personal-value', (val) => `${val}h`);
    setupRangeInput('social-time', 'social-value', (val) => `${val}h`);
    setupRangeInput('rest-time', 'rest-value', (val) => `${val}h`);
    
    // Food type buttons
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Rating buttons - Energy
    document.querySelectorAll('.rating-group .rating-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.parentElement.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Form submission
    form.addEventListener('submit', handleFormSubmit);
}

function setupRangeInput(inputId, displayId, formatter) {
    const input = document.getElementById(inputId);
    const display = document.getElementById(displayId);
    
    if (input && display) {
        input.addEventListener('input', function() {
            display.textContent = formatter(this.value);
            updateRangeBackground(this);
        });
        updateRangeBackground(input);
    }
}

function updateRangeBackground(input) {
    const value = ((input.value - input.min) / (input.max - input.min)) * 100;
    input.style.background = `linear-gradient(to right, #667eea 0%, #667eea ${value}%, #E2E8F0 ${value}%, #E2E8F0 100%)`;
}

function loadFormData(entry) {
    document.getElementById('sleep').value = entry.sleep;
    document.getElementById('activity').value = entry.physicalActivity;
    document.getElementById('screen').value = entry.screenTime;
    document.getElementById('work-time').value = entry.workTime || 0;
    document.getElementById('personal-time').value = entry.personalTime || 0;
    document.getElementById('social-time').value = entry.socialTime || 0;
    document.getElementById('rest-time').value = entry.restTime || 0;
    
    // Update displays
    document.getElementById('sleep-value').textContent = `${entry.sleep}h`;
    document.getElementById('activity-value').textContent = `${entry.physicalActivity} min`;
    document.getElementById('screen-value').textContent = `${entry.screenTime}h`;
    document.getElementById('work-value').textContent = `${entry.workTime || 0}h`;
    document.getElementById('personal-value').textContent = `${entry.personalTime || 0}h`;
    document.getElementById('social-value').textContent = `${entry.socialTime || 0}h`;
    document.getElementById('rest-value').textContent = `${entry.restTime || 0}h`;
    
    // Food type
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.food === entry.foodType) {
            btn.classList.add('active');
        }
    });
    
    // Energy rating
    document.querySelectorAll('.rating-group .rating-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.rating) === entry.energy) {
            btn.classList.add('active');
        }
    });
    
    // Mood rating
    document.querySelectorAll('#mood-rating .rating-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.rating) === entry.mood) {
            btn.classList.add('active');
        }
    });
    
    // Update range backgrounds
    ['sleep', 'activity', 'screen', 'work-time', 'personal-time', 'social-time', 'rest-time'].forEach(id => {
        updateRangeBackground(document.getElementById(id));
    });
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const foodTypeBtn = document.querySelector('.option-btn.active');
    const energyBtn = document.querySelector('.rating-group .rating-btn.active');
    const moodBtn = document.querySelector('#mood-rating .rating-btn.active');
    
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
        timestamp: new Date().toISOString()
    };
    
    Storage.addEntry(entry);
    
    // Show success message
    alert('✅ Entry saved successfully!');
    
    // Switch to dashboard
    switchView('dashboard');
}

// ============================================================================
// Trends View
// ============================================================================

function renderTrends() {
    const entries = Storage.getEntries();
    
    if (entries.length === 0) {
        document.getElementById('stats-summary').innerHTML = `
            <div class="no-data">
                <div class="no-data-icon">📈</div>
                <h3>No Data Yet</h3>
                <p>Start tracking to see your trends and patterns.</p>
            </div>
        `;
        return;
    }
    
    createTrendCharts();
    
    // Calculate summary statistics
    const avgEnergy = (entries.reduce((sum, e) => sum + e.energy, 0) / entries.length).toFixed(1);
    const avgMood = (entries.reduce((sum, e) => sum + e.mood, 0) / entries.length).toFixed(1);
    const avgSleep = (entries.reduce((sum, e) => sum + e.sleep, 0) / entries.length).toFixed(1);
    const avgActivity = Math.round(entries.reduce((sum, e) => sum + e.physicalActivity, 0) / entries.length);
    
    const bestDay = entries.reduce((best, e) => (e.energy + e.mood > best.energy + best.mood) ? e : best);
    const worstDay = entries.reduce((worst, e) => (e.energy + e.mood < worst.energy + worst.mood) ? e : worst);
    
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
            <span class="summary-label">Challenging Day</span>
            <span class="summary-value">${new Date(worstDay.date).toLocaleDateString()}</span>
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
    
    // Previous month's trailing days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i;
        html += `<div class="calendar-day other-month">${day}</div>`;
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split('T')[0];
        const entry = entries.find(e => e.date === dateStr);
        
        let classes = ['calendar-day'];
        let content = `<div>${day}</div>`;
        
        if (dateStr === today) classes.push('today');
        
        if (entry) {
            classes.push('has-data');
            
            const avgScore = (entry.energy + entry.mood) / 2;
            if (avgScore >= 4) classes.push('high-energy');
            else if (avgScore >= 3) classes.push('medium-energy');
            else classes.push('low-energy');
            
            const moodEmojis = ['😞', '😕', '😐', '😊', '😄'];
            content += `<div class="mood-indicator">${moodEmojis[entry.mood - 1] || '😐'}</div>`;
        }
        
        html += `
            <div class="${classes.join(' ')}" data-date="${dateStr}">
                ${content}
            </div>
        `;
    }
    
    // Next month's leading days
    const remainingDays = 42 - (startingDayOfWeek + daysInMonth);
    for (let day = 1; day <= remainingDays; day++) {
        html += `<div class="calendar-day other-month">${day}</div>`;
    }
    
    document.getElementById('calendar-days').innerHTML = html;
    
    // Add click handlers
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
                <div class="stat-header">
                    <span class="stat-icon">⚡</span>
                    <span>Energy</span>
                </div>
                <div class="stat-value">${entry.energy}<span class="stat-max">/5</span></div>
            </div>
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-icon">❤️</span>
                    <span>Mood</span>
                </div>
                <div class="stat-value">${entry.mood}<span class="stat-max">/5</span></div>
            </div>
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-icon">😴</span>
                    <span>Sleep</span>
                </div>
                <div class="stat-value">${entry.sleep}h</div>
            </div>
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-icon">🏃</span>
                    <span>Activity</span>
                </div>
                <div class="stat-value">${entry.physicalActivity}m</div>
            </div>
        </div>
    `;
    
    const insights = generateAdvice(entry);
    document.getElementById('modal-insights').innerHTML = `
        <div class="insights-card">
            <h3>🧠 Insights for this day</h3>
            <ul class="insights-list">
                ${insights.map(insight => `<li>${insight}</li>`).join('')}
            </ul>
        </div>
    `;
    
    modal.classList.add('active');
}

// ============================================================================
// Navigation
// ============================================================================

function switchView(viewName) {
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Show selected view
    const view = document.getElementById(`${viewName}-view`);
    if (view) {
        view.classList.add('active');
    }
    
    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[data-view="${viewName}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Render view-specific content
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
    }
}

// ============================================================================
// Initialization
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchView(this.dataset.view);
        });
    });
    
    // Initialize form
    initializeForm();
    
    // Calendar navigation
    document.getElementById('prev-month').addEventListener('click', function() {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendar();
    });
    
    document.getElementById('next-month').addEventListener('click', function() {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendar();
    });
    
    // Modal close
    document.querySelector('.close-modal').addEventListener('click', function() {
        document.getElementById('day-modal').classList.remove('active');
    });
    
    document.getElementById('day-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });
    
    // Initial render
    renderDashboard();
});