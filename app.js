// Life Analytics - Comprehensive Application
// ============================================================================

const WISDOM_QUOTES = [
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

const ACHIEVEMENTS = [
    { id: 'first_entry', name: 'Getting Started', desc: 'Log your first day', icon: '🎯' },
    { id: 'week_streak', name: '7 Day Streak', desc: 'Track 7 days in a row', icon: '🔥' },
    { id: 'month_streak', name: '30 Day Warrior', desc: 'Track 30 days in a row', icon: '💪' },
    { id: 'perfect_sleep', name: 'Sleep Master', desc: 'Get 8 hours of sleep 7 days straight', icon: '😴' },
    { id: 'active_week', name: 'Active Lifestyle', desc: '30 min activity for 7 days', icon: '🏃' },
    { id: 'hydration_hero', name: 'Hydration Hero', desc: 'Drink 8 glasses for 7 days', icon: '💧' },
    { id: 'step_champion', name: 'Step Champion', desc: '10k steps for 7 days', icon: '👟' },
    { id: 'balanced_week', name: 'Balance Master', desc: 'Balanced time allocation for 7 days', icon: '⚖️' },
    { id: 'wellness_100', name: 'Perfect Wellness', desc: 'Score 90+ wellness for 3 days', icon: '⭐' },
    { id: 'habit_master', name: 'Habit Master', desc: 'Complete all habits for 14 days', icon: '✅' }
];

const Storage = {
    getEntries() { return JSON.parse(localStorage.getItem('lifeAnalyticsEntries') || '[]'); },
    saveEntries(entries) { localStorage.setItem('lifeAnalyticsEntries', JSON.stringify(entries)); },
    addEntry(entry) {
        const entries = this.getEntries();
        const existingIndex = entries.findIndex(e => e.date === entry.date);
        if (existingIndex >= 0) entries[existingIndex] = entry;
        else entries.push(entry);
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        this.saveEntries(entries);
        return entries;
    },
    getEntryByDate(date) { return this.getEntries().find(e => e.date === date); },
    getHabits() { return JSON.parse(localStorage.getItem('lifeAnalyticsHabits') || '[]'); },
    saveHabits(habits) { localStorage.setItem('lifeAnalyticsHabits', JSON.stringify(habits)); },
    addHabit(habit) {
        const habits = this.getHabits();
        habits.push({ id: Date.now(), name: habit.name, createdAt: new Date().toISOString() });
        this.saveHabits(habits);
        return habits;
    },
    deleteHabit(id) {
        const filtered = this.getHabits().filter(h => h.id !== id);
        this.saveHabits(filtered);
        return filtered;
    },
    getGoals() { return JSON.parse(localStorage.getItem('lifeAnalyticsGoals') || '[]'); },
    saveGoals(goals) { localStorage.setItem('lifeAnalyticsGoals', JSON.stringify(goals)); },
    addGoal(goal) {
        const goals = this.getGoals();
        goals.push({ ...goal, id: Date.now(), createdAt: new Date().toISOString() });
        this.saveGoals(goals);
        return goals;
    },
    deleteGoal(id) {
        const filtered = this.getGoals().filter(g => g.id !== id);
        this.saveGoals(filtered);
        return filtered;
    },
    getAchievements() { return JSON.parse(localStorage.getItem('lifeAnalyticsAchievements') || '[]'); },
    saveAchievements(achievements) { localStorage.setItem('lifeAnalyticsAchievements', JSON.stringify(achievements)); }
};

const Toast = {
    show(message, showUndo = false) {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        const undoBtn = document.getElementById('undo-btn');
        toastMessage.textContent = message;
        undoBtn.style.display = showUndo ? 'block' : 'none';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 4000);
    }
};

const ThemeManager = {
    init() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
        document.getElementById('theme-toggle')?.addEventListener('click', () => this.toggleTheme());
    },
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    },
    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        this.setTheme(current === 'light' ? 'dark' : 'light');
    }
};

let charts = {};
let currentPeriod = 7;

function destroyChart(chartId) {
    if (charts[chartId]) {
        charts[chartId].destroy();
        delete charts[chartId];
    }
}

function getRandomWisdom() {
    return WISDOM_QUOTES[Math.floor(Math.random() * WISDOM_QUOTES.length)];
}

function displayWisdom() {
    const wisdomText = document.getElementById('wisdom-text');
    if (wisdomText) {
        wisdomText.textContent = getRandomWisdom();
        wisdomText.style.animation = 'fadeIn 0.5s ease';
        setTimeout(() => { wisdomText.style.animation = ''; }, 500);
    }
}

function calculateStreak() {
    const entries = Storage.getEntries().sort((a, b) => new Date(b.date) - new Date(a.date));
    if (entries.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < entries.length; i++) {
        const entryDate = new Date(entries[i].date);
        entryDate.setHours(0, 0, 0, 0);
        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - i);
        
        if (entryDate.getTime() === expectedDate.getTime()) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

function renderStreak() {
    const container = document.getElementById('streak-container');
    if (!container) return;
    
    const streak = calculateStreak();
    const longestStreak = parseInt(localStorage.getItem('longestStreak') || '0');
    
    if (streak > longestStreak) {
        localStorage.setItem('longestStreak', streak.toString());
    }
    
    container.innerHTML = `
        <div class="streak-card">
            <div class="streak-main">
                <div class="streak-icon">🔥</div>
                <div>
                    <div class="streak-number">${streak}</div>
                    <div class="streak-label">Day Streak</div>
                </div>
            </div>
            <div class="streak-best">Best: ${Math.max(streak, longestStreak)} days</div>
        </div>
    `;
}

function checkAchievements() {
    const entries = Storage.getEntries();
    const unlocked = Storage.getAchievements();
    const newUnlocks = [];
    
    ACHIEVEMENTS.forEach(achievement => {
        if (unlocked.includes(achievement.id)) return;
        
        let achieved = false;
        
        switch(achievement.id) {
            case 'first_entry':
                achieved = entries.length >= 1;
                break;
            case 'week_streak':
                achieved = calculateStreak() >= 7;
                break;
            case 'month_streak':
                achieved = calculateStreak() >= 30;
                break;
            case 'perfect_sleep':
                const last7Days = entries.slice(0, 7);
                achieved = last7Days.length === 7 && last7Days.every(e => e.sleep >= 7.5 && e.sleep <= 9);
                break;
            case 'active_week':
                const activeWeek = entries.slice(0, 7);
                achieved = activeWeek.length === 7 && activeWeek.every(e => e.physicalActivity >= 30);
                break;
            case 'hydration_hero':
                const hydrationWeek = entries.slice(0, 7);
                achieved = hydrationWeek.length === 7 && hydrationWeek.every(e => (e.water || 0) >= 8);
                break;
            case 'step_champion':
                const stepWeek = entries.slice(0, 7);
                achieved = stepWeek.length === 7 && stepWeek.every(e => (e.steps || 0) >= 10);
                break;
        }
        
        if (achieved) {
            newUnlocks.push(achievement.id);
            unlocked.push(achievement.id);
            Toast.show(`🎉 Achievement Unlocked: ${achievement.name}!`);
        }
    });
    
    if (newUnlocks.length > 0) {
        Storage.saveAchievements(unlocked);
    }
}

function renderAchievements() {
    const container = document.getElementById('achievements-container');
    if (!container) return;
    
    const unlocked = Storage.getAchievements();
    
    if (ACHIEVEMENTS.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = `
        <h3>Achievements</h3>
        <div class="achievements-grid">
            ${ACHIEVEMENTS.map(ach => `
                <div class="achievement-card ${unlocked.includes(ach.id) ? 'unlocked' : 'locked'}">
                    <div class="achievement-icon">${unlocked.includes(ach.id) ? ach.icon : '🔒'}</div>
                    <div class="achievement-name">${ach.name}</div>
                    <div class="achievement-desc">${ach.desc}</div>
                </div>
            `).join('')}
        </div>
    `;
}

function generateSuggestions(entry) {
    const suggestions = [];
    
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
    }
    
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
    
    const water = entry.water || 0;
    if (water < 6) {
        suggestions.push({
            type: 'bad',
            icon: '💧',
            title: 'Low Hydration',
            message: `Only ${water} glasses of water. Aim for at least 8 glasses daily.`
        });
    } else if (water >= 8) {
        suggestions.push({
            type: 'good',
            icon: '💦',
            title: 'Well Hydrated',
            message: `Excellent! You drank ${water} glasses of water. Stay hydrated!`
        });
    }
    
    const steps = entry.steps || 0;
    if (steps < 7) {
        suggestions.push({
            type: 'bad',
            icon: '👟',
            title: 'Low Step Count',
            message: `Only ${steps}k steps. Try to reach 10k steps for better health.`
        });
    } else if (steps >= 10) {
        suggestions.push({
            type: 'good',
            icon: '🚶',
            title: 'Step Goal Achieved',
            message: `Amazing! You walked ${steps}k steps today. Keep moving!`
        });
    }
    
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

function getDataForPeriod(period) {
    const entries = Storage.getEntries();
    const days = period === 'all' ? entries.length : period;
    
    return [...Array(Math.min(days, 90))].map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        const dateStr = date.toISOString().split('T')[0];
        const entry = entries.find(e => e.date === dateStr);
        return {
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            fullDate: dateStr,
            entry: entry || null,
            energy: entry?.energy || 0,
            mood: entry?.mood || 0,
            sleep: entry?.sleep || 0,
            activity: entry?.physicalActivity || 0,
            screenTime: entry?.screenTime || 0,
            water: entry?.water || 0,
            steps: entry?.steps || 0,
            stress: entry?.stress || 0,
            productivity: entry?.productivity || 0
        };
    });
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
                legend: { position: 'bottom', labels: { padding: 15, font: { size: 12, weight: '500' } } },
                tooltip: { callbacks: { label: (context) => `${context.label}: ${context.parsed}h` } }
            }
        }
    });
}

function createWeeklyChart() {
    const canvas = document.getElementById('weeklyChart');
    if (!canvas) return;
    
    destroyChart('weeklyChart');
    
    const data = getDataForPeriod(7);
    
    charts.weeklyChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: data.map(d => d.date),
            datasets: [{
                label: 'Energy',
                data: data.map(d => d.energy),
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
            scales: { y: { beginAtZero: true, max: 5, ticks: { stepSize: 1 } } },
            plugins: { legend: { display: false } }
        }
    });
}

function createTrendCharts() {
    const data = getDataForPeriod(currentPeriod);
    const entries = Storage.getEntries();
    
    // Energy & Mood
    const energyCanvas = document.getElementById('energyMoodChart');
    if (energyCanvas) {
        destroyChart('energyMoodChart');
        charts.energyMoodChart = new Chart(energyCanvas, {
            type: 'line',
            data: {
                labels: data.map(d => d.date),
                datasets: [
                    {
                        label: 'Energy',
                        data: data.map(d => d.energy),
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Mood',
                        data: data.map(d => d.mood),
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
                scales: { y: { beginAtZero: true, max: 5, ticks: { stepSize: 1 } } }
            }
        });
    }
    
    // Sleep & Activity
    const sleepCanvas = document.getElementById('sleepActivityChart');
    if (sleepCanvas) {
        destroyChart('sleepActivityChart');
        charts.sleepActivityChart = new Chart(sleepCanvas, {
            type: 'bar',
            data: {
                labels: data.map(d => d.date),
                datasets: [
                    { label: 'Sleep (hours)', data: data.map(d => d.sleep), backgroundColor: '#3b82f6', borderRadius: 6 },
                    { label: 'Activity (min)', data: data.map(d => d.activity), backgroundColor: '#f59e0b', borderRadius: 6 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: true }
        });
    }
    
    // Screen Time
    const screenCanvas = document.getElementById('screenTimeChart');
    if (screenCanvas) {
        destroyChart('screenTimeChart');
        charts.screenTimeChart = new Chart(screenCanvas, {
            type: 'line',
            data: {
                labels: data.map(d => d.date),
                datasets: [{
                    label: 'Screen Time (hours)',
                    data: data.map(d => d.screenTime),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: { responsive: true, maintainAspectRatio: true }
        });
    }
    
    // Food Quality
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
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }
    
    // Balance Chart
    const balanceCanvas = document.getElementById('balanceChart');
    if (balanceCanvas && entries.length > 0) {
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
                    backgroundColor: ['rgba(102, 126, 234, 0.6)', 'rgba(16, 185, 129, 0.6)', 'rgba(245, 158, 11, 0.6)', 'rgba(59, 130, 246, 0.6)'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom' } } }
        });
    }
    
    // Wellness Score
    const wellnessCanvas = document.getElementById('wellnessChart');
    if (wellnessCanvas) {
        destroyChart('wellnessChart');
        const wellnessScores = data.map(d => {
            if (!d.entry) return 0;
            const sleepScore = Math.min(d.sleep / 8, 1) * 20;
            const activityScore = Math.min(d.activity / 30, 1) * 20;
            const energyScore = (d.energy / 5) * 20;
            const moodScore = (d.mood / 5) * 20;
            const screenPenalty = Math.max(0, 20 - (d.screenTime * 2));
            return sleepScore + activityScore + energyScore + moodScore + screenPenalty;
        });
        charts.wellnessChart = new Chart(wellnessCanvas, {
            type: 'bar',
            data: {
                labels: data.map(d => d.date),
                datasets: [{
                    label: 'Wellness Score',
                    data: wellnessScores,
                    backgroundColor: wellnessScores.map(score => score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'),
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: { y: { beginAtZero: true, max: 100, ticks: { stepSize: 20 } } },
                plugins: { legend: { display: false } }
            }
        });
    }
    
    // Hydration & Steps
    const hydrationCanvas = document.getElementById('hydrationChart');
    if (hydrationCanvas) {
        destroyChart('hydrationChart');
        charts.hydrationChart = new Chart(hydrationCanvas, {
            type: 'bar',
            data: {
                labels: data.map(d => d.date),
                datasets: [
                    { label: 'Water (glasses)', data: data.map(d => d.water), backgroundColor: '#3b82f6', borderRadius: 6 },
                    { label: 'Steps (k)', data: data.map(d => d.steps), backgroundColor: '#10b981', borderRadius: 6 }
                ]
            },
            options: { responsive: true, maintainAspectRatio: true }
        });
    }
    
    // Stress vs Productivity
    const stressCanvas = document.getElementById('stressProductivityChart');
    if (stressCanvas) {
        destroyChart('stressProductivityChart');
        charts.stressProductivityChart = new Chart(stressCanvas, {
            type: 'line',
            data: {
                labels: data.map(d => d.date),
                datasets: [
                    {
                        label: 'Stress',
                        data: data.map(d => d.stress),
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Productivity',
                        data: data.map(d => d.productivity),
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
                scales: { y: { beginAtZero: true, max: 5, ticks: { stepSize: 1 } } }
            }
        });
    }
}

function renderDashboard() {
    const dateDisplay = document.getElementById('current-date');
    if (dateDisplay) {
        const today = new Date();
        dateDisplay.textContent = today.toLocaleDateString('en-US', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
    }
    
    displayWisdom();
    renderStreak();
    
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
        document.getElementById('achievements-container').innerHTML = '';
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
    renderAchievements();
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

function initializeForm() {
    const form = document.getElementById('daily-form');
    const today = new Date().toISOString().split('T')[0];
    
    document.getElementById('date').value = today;
    
    const entry = Storage.getEntryByDate(today);
    if (entry) loadFormData(entry);
    
    setupRangeInput('sleep', 'sleep-value', (val) => `${parseFloat(val).toFixed(1)}h`);
    setupRangeInput('activity', 'activity-value', (val) => `${val} min`);
    setupRangeInput('screen', 'screen-value', (val) => `${parseFloat(val).toFixed(1)}h`);
    setupRangeInput('water', 'water-value', (val) => `${val}`);
    setupRangeInput('steps', 'steps-value', (val) => `${val}k`);
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
    document.getElementById('water').value = entry.water || 8;
    document.getElementById('steps').value = entry.steps || 10;
    document.getElementById('work-time').value = entry.workTime || 0;
    document.getElementById('personal-time').value = entry.personalTime || 0;
    document.getElementById('social-time').value = entry.socialTime || 0;
    document.getElementById('rest-time').value = entry.restTime || 0;
    
    ['sleep', 'activity', 'screen', 'water', 'steps', 'work-time', 'personal-time', 'social-time', 'rest-time'].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.dispatchEvent(new Event('input'));
    });
    
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.food === entry.foodType) btn.classList.add('active');
    });
    
    ['energy', 'mood', 'stress', 'productivity'].forEach(type => {
        document.querySelectorAll(`#${type}-rating .rating-btn`).forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.rating) === entry[type]) btn.classList.add('active');
        });
    });
    
    const diaryTextarea = document.getElementById('diary');
    if (diaryTextarea && entry.diary) diaryTextarea.value = entry.diary;
    
    if (entry.habits) {
        entry.habits.forEach(habit => {
            const checkbox = document.querySelector(`input[data-habit-id="${habit.id}"]`);
            if (checkbox) checkbox.checked = habit.completed;
        });
    }
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const foodTypeBtn = document.querySelector('.option-btn.active');
    const energyBtn = document.querySelector('#energy-rating .rating-btn.active');
    const moodBtn = document.querySelector('#mood-rating .rating-btn.active');
    const stressBtn = document.querySelector('#stress-rating .rating-btn.active');
    const productivityBtn = document.querySelector('#productivity-rating .rating-btn.active');
    
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
        water: parseInt(document.getElementById('water').value),
        steps: parseInt(document.getElementById('steps').value),
        energy: energyBtn ? parseInt(energyBtn.dataset.rating) : 3,
        mood: moodBtn ? parseInt(moodBtn.dataset.rating) : 3,
        stress: stressBtn ? parseInt(stressBtn.dataset.rating) : 3,
        productivity: productivityBtn ? parseInt(productivityBtn.dataset.rating) : 3,
        workTime: parseFloat(document.getElementById('work-time').value),
        personalTime: parseFloat(document.getElementById('personal-time').value),
        socialTime: parseFloat(document.getElementById('social-time').value),
        restTime: parseFloat(document.getElementById('rest-time').value),
        diary: document.getElementById('diary').value,
        habits: habitData,
        timestamp: new Date().toISOString()
    };
    
    Storage.addEntry(entry);
    checkAchievements();
    
    Toast.show('Entry saved successfully', true);
    
    setTimeout(() => { switchView('dashboard'); }, 500);
}

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
            Storage.deleteHabit(habitId);
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
    
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    cancelBtn.addEventListener('click', () => modal.classList.remove('active'));
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const habitName = document.getElementById('habit-name').value.trim();
        
        if (habitName) {
            Storage.addHabit({ name: habitName });
            Toast.show('Habit added successfully', true);
            renderHabitsForm();
            modal.classList.remove('active');
        }
    });
}

function renderGoals() {
    const container = document.getElementById('goals-container');
    if (!container) return;
    
    const goals = Storage.getGoals();
    const entries = Storage.getEntries();
    
    if (goals.length === 0) {
        container.innerHTML = '<div class="no-data"><h3>No Goals Set</h3><p>Create your first goal to start tracking progress</p></div>';
        return;
    }
    
    container.innerHTML = goals.map(goal => {
        const relevantEntries = entries.slice(0, goal.duration);
        const completedDays = relevantEntries.filter(entry => {
            const value = entry[goal.type];
            if (goal.type === 'screen') return value <= goal.target;
            return value >= goal.target;
        }).length;
        const progress = (completedDays / goal.duration) * 100;
        
        return `
            <div class="goal-card">
                <div class="goal-header">
                    <h4>${goal.name}</h4>
                    <button class="goal-delete" data-goal-id="${goal.id}">×</button>
                </div>
                <div class="goal-meta">Target: ${goal.target} | Duration: ${goal.duration} days</div>
                <div class="goal-progress">
                    <div class="goal-progress-bar">
                        <div class="goal-progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="goal-progress-text">${completedDays}/${goal.duration} days</div>
                </div>
            </div>
        `;
    }).join('');
    
    container.querySelectorAll('.goal-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const goalId = parseInt(this.dataset.goalId);
            Storage.deleteGoal(goalId);
            Toast.show('Goal deleted');
            renderGoals();
        });
    });
}

function initializeGoalModal() {
    const modal = document.getElementById('goal-modal');
    const addBtn = document.getElementById('add-goal-btn');
    const closeBtn = document.getElementById('close-goal-modal');
    const cancelBtn = document.getElementById('cancel-goal');
    const form = document.getElementById('add-goal-form');
    
    if (!addBtn || !modal) return;
    
    addBtn.addEventListener('click', () => {
        modal.classList.add('active');
    });
    
    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    if (cancelBtn) cancelBtn.addEventListener('click', () => modal.classList.remove('active'));
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const goal = {
                name: document.getElementById('goal-name').value,
                type: document.getElementById('goal-type').value,
                target: parseFloat(document.getElementById('goal-target').value),
                duration: parseInt(document.getElementById('goal-duration').value)
            };
            
            Storage.addGoal(goal);
            Toast.show('Goal created successfully');
            renderGoals();
            modal.classList.remove('active');
            form.reset();
        });
    }
}

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
    const avgWater = Math.round(entries.reduce((sum, e) => sum + (e.water || 0), 0) / entries.length);
    const avgSteps = Math.round(entries.reduce((sum, e) => sum + (e.steps || 0), 0) / entries.length);
    
    const bestDay = entries.reduce((best, e) => (e.energy + e.mood > best.energy + best.mood) ? e : best);
    const mostProductive = entries.reduce((best, e) => ((e.productivity || 0) > (best.productivity || 0)) ? e : best);
    
    document.getElementById('stats-summary').innerHTML = `
        <h3>Summary Statistics (${currentPeriod === 'all' ? 'All Time' : currentPeriod + ' Days'})</h3>
        <div class="summary-item"><span class="summary-label">Average Energy</span><span class="summary-value">${avgEnergy}/5</span></div>
        <div class="summary-item"><span class="summary-label">Average Mood</span><span class="summary-value">${avgMood}/5</span></div>
        <div class="summary-item"><span class="summary-label">Average Sleep</span><span class="summary-value">${avgSleep}h</span></div>
        <div class="summary-item"><span class="summary-label">Average Activity</span><span class="summary-value">${avgActivity} min</span></div>
        <div class="summary-item"><span class="summary-label">Average Water</span><span class="summary-value">${avgWater} glasses</span></div>
        <div class="summary-item"><span class="summary-label">Average Steps</span><span class="summary-value">${avgSteps}k</span></div>
        <div class="summary-item"><span class="summary-label">Total Entries</span><span class="summary-value">${entries.length}</span></div>
        <div class="summary-item"><span class="summary-label">Best Day</span><span class="summary-value">${new Date(bestDay.date).toLocaleDateString()}</span></div>
        <div class="summary-item"><span class="summary-label">Most Productive</span><span class="summary-value">${new Date(mostProductive.date).toLocaleDateString()}</span></div>
    `;
}

function renderReports() {
    const entries = Storage.getEntries();
    
    if (entries.length === 0) {
        document.getElementById('overview-report').innerHTML = '<p>No data available</p>';
        document.getElementById('health-score-report').innerHTML = '<p>No data available</p>';
        document.getElementById('goal-progress-report').innerHTML = '<p>No data available</p>';
        document.getElementById('best-worst-report').innerHTML = '<p>No data available</p>';
        return;
    }
    
    // Overview Report
    const totalDays = entries.length;
    const streak = calculateStreak();
    document.getElementById('overview-report').innerHTML = `
        <div class="report-stat">Total Days Tracked: <strong>${totalDays}</strong></div>
        <div class="report-stat">Current Streak: <strong>${streak} days</strong></div>
        <div class="report-stat">Data Range: <strong>${new Date(entries[entries.length - 1].date).toLocaleDateString()} - ${new Date(entries[0].date).toLocaleDateString()}</strong></div>
    `;
    
    // Health Score
    const avgWellness = entries.reduce((sum, e) => {
        const sleepScore = Math.min(e.sleep / 8, 1) * 20;
        const activityScore = Math.min(e.physicalActivity / 30, 1) * 20;
        const energyScore = (e.energy / 5) * 20;
        const moodScore = (e.mood / 5) * 20;
        const screenPenalty = Math.max(0, 20 - (e.screenTime * 2));
        return sum + sleepScore + activityScore + energyScore + moodScore + screenPenalty;
    }, 0) / entries.length;
    
    let healthGrade = 'Poor';
    if (avgWellness >= 80) healthGrade = 'Excellent';
    else if (avgWellness >= 60) healthGrade = 'Good';
    else if (avgWellness >= 40) healthGrade = 'Fair';
    
    document.getElementById('health-score-report').innerHTML = `
        <div class="health-score-display">
            <div class="health-score-number">${avgWellness.toFixed(0)}</div>
            <div class="health-score-grade">${healthGrade}</div>
        </div>
        <div class="report-stat">Keep improving your wellness score by maintaining healthy habits!</div>
    `;
    
    // Goal Progress
    const goals = Storage.getGoals();
    if (goals.length > 0) {
        const completedGoals = goals.filter(goal => {
            const relevantEntries = entries.slice(0, goal.duration);
            const completedDays = relevantEntries.filter(entry => {
                const value = entry[goal.type];
                if (goal.type === 'screen') return value <= goal.target;
                return value >= goal.target;
            }).length;
            return completedDays >= goal.duration;
        }).length;
        
        document.getElementById('goal-progress-report').innerHTML = `
            <div class="report-stat">Active Goals: <strong>${goals.length}</strong></div>
            <div class="report-stat">Completed Goals: <strong>${completedGoals}</strong></div>
            <div class="report-stat">Success Rate: <strong>${((completedGoals / goals.length) * 100).toFixed(0)}%</strong></div>
        `;
    } else {
        document.getElementById('goal-progress-report').innerHTML = '<p>No goals set yet. Create your first goal!</p>';
    }
    
    // Best/Worst Days
    const sortedByWellness = entries.map(e => {
        const sleepScore = Math.min(e.sleep / 8, 1) * 20;
        const activityScore = Math.min(e.physicalActivity / 30, 1) * 20;
        const energyScore = (e.energy / 5) * 20;
        const moodScore = (e.mood / 5) * 20;
        const screenPenalty = Math.max(0, 20 - (e.screenTime * 2));
        const wellness = sleepScore + activityScore + energyScore + moodScore + screenPenalty;
        return { ...e, wellness };
    }).sort((a, b) => b.wellness - a.wellness);
    
    const bestDays = sortedByWellness.slice(0, 3);
    const worstDays = sortedByWellness.slice(-3).reverse();
    
    document.getElementById('best-worst-report').innerHTML = `
        <div class="mb-3">
            <h5>🌟 Best Days</h5>
            ${bestDays.map(d => `<div class="report-stat">${new Date(d.date).toLocaleDateString()}: ${d.wellness.toFixed(0)} wellness score</div>`).join('')}
        </div>
        <div>
            <h5>📉 Days to Improve</h5>
            ${worstDays.map(d => `<div class="report-stat">${new Date(d.date).toLocaleDateString()}: ${d.wellness.toFixed(0)} wellness score</div>`).join('')}
        </div>
    `;
}

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
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });
    
    document.getElementById('modal-date').textContent = formattedDate;
    
    document.getElementById('modal-stats').innerHTML = `
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-label">Energy</div><div class="stat-value">${entry.energy}<span class="stat-unit">/5</span></div></div>
            <div class="stat-card"><div class="stat-label">Mood</div><div class="stat-value">${entry.mood}<span class="stat-unit">/5</span></div></div>
            <div class="stat-card"><div class="stat-label">Sleep</div><div class="stat-value">${entry.sleep}<span class="stat-unit">h</span></div></div>
            <div class="stat-card"><div class="stat-label">Activity</div><div class="stat-value">${entry.physicalActivity}<span class="stat-unit">min</span></div></div>
        </div>
    `;
    
    const diarySection = document.getElementById('modal-diary');
    if (entry.diary && entry.diary.trim()) {
        diarySection.innerHTML = `<h4>Daily Notes</h4><p>${entry.diary}</p>`;
        diarySection.style.display = 'block';
    } else {
        diarySection.style.display = 'none';
    }
    
    const editBtn = document.getElementById('edit-day-btn');
    if (editBtn) {
        editBtn.onclick = () => {
            modal.classList.remove('active');
            document.getElementById('date').value = date;
            loadFormData(entry);
            switchView('input');
        };
    }
    
    modal.classList.add('active');
}

let currentCalendarDate = new Date();

function switchView(viewName) {
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    
    const view = document.getElementById(`${viewName}-view`);
    if (view) view.classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    
    const activeBtn = document.querySelector(`[data-view="${viewName}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    
    switch(viewName) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'trends':
            requestAnimationFrame(() => renderTrends());
            break;
        case 'calendar':
            renderCalendar();
            break;
        case 'goals':
            renderGoals();
            break;
        case 'reports':
            renderReports();
            break;
    }
}

function initializeSettings() {
    const settingsBtn = document.getElementById('settings-btn');
    const modal = document.getElementById('settings-modal');
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const importFile = document.getElementById('import-file');
    const clearBtn = document.getElementById('clear-data-btn');
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            modal.classList.add('active');
            updateAppStats();
        });
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const data = {
                entries: Storage.getEntries(),
                habits: Storage.getHabits(),
                goals: Storage.getGoals(),
                achievements: Storage.getAchievements(),
                exportDate: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `life-analytics-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            Toast.show('Data exported successfully!');
        });
    }
    
    if (importBtn && importFile) {
        importBtn.addEventListener('click', () => importFile.click());
        
        importFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    if (data.entries) Storage.saveEntries(data.entries);
                    if (data.habits) Storage.saveHabits(data.habits);
                    if (data.goals) Storage.saveGoals(data.goals);
                    if (data.achievements) Storage.saveAchievements(data.achievements);
                    
                    Toast.show('Data imported successfully!');
                    modal.classList.remove('active');
                    switchView('dashboard');
                } catch (error) {
                    Toast.show('Error importing data. Please check the file format.');
                }
            };
            reader.readAsText(file);
            importFile.value = '';
        });
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete ALL data? This cannot be undone!')) {
                localStorage.clear();
                Toast.show('All data cleared');
                modal.classList.remove('active');
                switchView('dashboard');
            }
        });
    }
}

function updateAppStats() {
    const statsContainer = document.getElementById('app-stats');
    if (!statsContainer) return;
    
    const entries = Storage.getEntries();
    const habits = Storage.getHabits();
    const goals = Storage.getGoals();
    const achievements = Storage.getAchievements();
    
    const dataSize = new Blob([JSON.stringify({entries, habits, goals, achievements})]).size;
    const dataSizeKB = (dataSize / 1024).toFixed(2);
    
    statsContainer.innerHTML = `
        <div class="report-stat">Total Entries: <strong>${entries.length}</strong></div>
        <div class="report-stat">Habits Tracked: <strong>${habits.length}</strong></div>
        <div class="report-stat">Active Goals: <strong>${goals.length}</strong></div>
        <div class="report-stat">Achievements Unlocked: <strong>${achievements.length}/${ACHIEVEMENTS.length}</strong></div>
        <div class="report-stat">Data Size: <strong>${dataSizeKB} KB</strong></div>
    `;
}

document.addEventListener('DOMContentLoaded', function() {
    ThemeManager.init();
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchView(this.dataset.view);
        });
    });
    
    initializeForm();
    initializeHabitModal();
    initializeGoalModal();
    initializeSettings();
    
    const newWisdomBtn = document.getElementById('new-wisdom');
    if (newWisdomBtn) newWisdomBtn.addEventListener('click', displayWisdom);
    
    document.getElementById('prev-month')?.addEventListener('click', function() {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendar();
    });
    
    document.getElementById('next-month')?.addEventListener('click', function() {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendar();
    });
    
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentPeriod = this.dataset.period === 'all' ? 'all' : parseInt(this.dataset.period);
            renderTrends();
        });
    });
    
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });
    
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) this.classList.remove('active');
        });
    });
    
    renderDashboard();
});