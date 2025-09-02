// Love Calculator App - Main JavaScript File

class LoveCalculator {
    constructor() {
        this.form = document.getElementById('loveForm');
        this.resultCard = document.getElementById('resultCard');
        this.recentSection = document.getElementById('recentCalculations');
        this.recentList = document.getElementById('recentList');
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadFromURL();
        this.loadRecentCalculations();
    }

    bindEvents() {
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculateLove();
        });

        // Reset button
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetForm();
        });

        // Share buttons
        document.getElementById('copyLinkBtn').addEventListener('click', () => {
            this.copyShareLink();
        });

        document.getElementById('whatsappBtn').addEventListener('click', () => {
            this.shareWhatsApp();
        });

        document.getElementById('facebookBtn').addEventListener('click', () => {
            this.shareFacebook();
        });

        // Real-time validation
        ['nameA', 'nameB', 'dobA', 'dobB'].forEach(id => {
            const input = document.getElementById(id);
            input.addEventListener('input', () => this.validateField(input));
            input.addEventListener('blur', () => this.validateField(input));
        });
    }

    // FNV-1a Hash Implementation (32-bit)
    fnv1aHash(str) {
        let hash = 0x811c9dc5; // FNV offset basis
        for (let i = 0; i < str.length; i++) {
            hash ^= str.charCodeAt(i);
            hash = Math.imul(hash, 0x01000193); // FNV prime
        }
        return hash >>> 0; // Convert to unsigned 32-bit
    }

    // Normalize name input
    normalizeName(name) {
        return name.toLowerCase().trim().replace(/\s+/g, ' ');
    }

    // Validate name format
    isValidName(name) {
        const nameRegex = /^[a-zA-Z\s'-]{2,}$/;
        return nameRegex.test(name.trim());
    }

    // Validate date
    isValidDate(dateString) {
        if (!dateString) return true; // Optional field
        const date = new Date(dateString);
        const now = new Date();
        const minDate = new Date('1900-01-01');
        return date instanceof Date && !isNaN(date) && date <= now && date >= minDate;
    }

    // Field validation
    validateField(input) {
        const errorElement = document.getElementById(`${input.id}-error`);
        let isValid = true;
        let errorMessage = '';

        if (input.id === 'nameA' || input.id === 'nameB') {
            const value = input.value.trim();
            if (!value) {
                errorMessage = 'Please enter both names (min 2 letters).';
                isValid = false;
            } else if (!this.isValidName(value)) {
                errorMessage = 'Names can include letters, spaces, apostrophes, and hyphens only.';
                isValid = false;
            }
        } else if (input.id === 'dobA' || input.id === 'dobB') {
            if (input.value && !this.isValidDate(input.value)) {
                errorMessage = 'Please enter a valid date.';
                isValid = false;
            }
        }

        errorElement.textContent = errorMessage;
        input.classList.toggle('invalid', !isValid);
        return isValid;
    }

    // Validate entire form
    validateForm() {
        const nameA = document.getElementById('nameA');
        const nameB = document.getElementById('nameB');
        const dobA = document.getElementById('dobA');
        const dobB = document.getElementById('dobB');

        const validations = [
            this.validateField(nameA),
            this.validateField(nameB),
            this.validateField(dobA),
            this.validateField(dobB)
        ];

        return validations.every(valid => valid);
    }

    // Calculate love score using deterministic algorithm
    calculateLoveScore(nameA, nameB, dobA = '', dobB = '') {
        // Normalize inputs
        const normA = this.normalizeName(nameA);
        const normB = this.normalizeName(nameB);
        
        // Create seed string
        const seed = `${normA}|${normB}|${dobA}|${dobB}`;
        
        // Generate hash
        const hash = this.fnv1aHash(seed);
        
        // Convert to base score (1-100)
        let baseScore = (Math.abs(hash) % 100) + 1;
        
        // Add birthdate bonus if both dates provided
        let bonus = 0;
        if (dobA && dobB) {
            const dateA = new Date(dobA);
            const dateB = new Date(dobB);
            const daySum = dateA.getDate() + dateB.getDate();
            const monthSum = dateA.getMonth() + dateB.getMonth();
            bonus = (daySum + monthSum) % 8;
        }
        
        // Final score (clamped to 1-100)
        const finalScore = Math.min(100, baseScore + bonus);
        
        return finalScore;
    }

    // Get message based on score range
    getScoreMessage(score) {
        const messages = {
            low: "Opposites attract—focus on communication and shared moments.",
            medium: "There's a spark! Build trust and discover common interests.",
            good: "Solid potential—keep investing time and empathy.",
            great: "Great match! Nurture it with honesty and quality time.",
            perfect: "Soulmate vibes! Protect and cherish the connection."
        };

        if (score <= 25) return messages.low;
        if (score <= 50) return messages.medium;
        if (score <= 75) return messages.good;
        if (score <= 90) return messages.great;
        return messages.perfect;
    }

    // Get random tips
    getRandomTips() {
        const tips = [
            "Plan a small activity together",
            "Practice active listening",
            "Celebrate small wins",
            "Be clear about expectations",
            "Share your dreams and goals",
            "Create new memories together",
            "Show appreciation daily",
            "Communicate openly and honestly"
        ];
        
        // Return 2-3 random tips
        const shuffled = tips.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 2 + Math.floor(Math.random() * 2));
    }

    // Main calculation function
    calculateLove() {
        if (!this.validateForm()) {
            return;
        }

        const nameA = document.getElementById('nameA').value.trim();
        const nameB = document.getElementById('nameB').value.trim();
        const dobA = document.getElementById('dobA').value;
        const dobB = document.getElementById('dobB').value;

        // Calculate score
        const score = this.calculateLoveScore(nameA, nameB, dobA, dobB);
        const message = this.getScoreMessage(score);
        const tips = this.getRandomTips();

        // Display results
        this.displayResult(nameA, nameB, score, message, tips);

        // Update URL
        this.updateURL(nameA, nameB, dobA, dobB);

        // Save to recent calculations
        this.saveRecentCalculation(nameA, nameB, dobA, dobB, score);

        // Add confetti for high scores
        if (score >= 90) {
            this.showConfetti();
        }
    }

    // Display calculation result
    displayResult(nameA, nameB, score, message, tips) {
        document.getElementById('scoreValue').textContent = score;
        document.getElementById('scoreMessage').textContent = message;
        
        const tipsHtml = tips.map(tip => `<p>💡 ${tip}</p>`).join('');
        document.getElementById('scoreTips').innerHTML = `<strong>Tips for ${nameA} & ${nameB}:</strong><br>${tipsHtml}`;
        
        this.resultCard.classList.remove('hidden');
        this.resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Show romantic heart confetti animation
    showConfetti() {
        const heartColors = ['#E63946', '#FF6B81', '#FFC1CC', '#FF1744', '#F06292'];
        const heartShapes = ['💕', '💖', '💗', '💘', '💝', '💞', '💟', '❤️', '💓', '💔'];
        
        // Create heart confetti
        for (let i = 0; i < 60; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.className = 'heart-confetti';
                heart.textContent = heartShapes[Math.floor(Math.random() * heartShapes.length)];
                heart.style.left = Math.random() * 100 + 'vw';
                heart.style.color = heartColors[Math.floor(Math.random() * heartColors.length)];
                heart.style.fontSize = (Math.random() * 1.5 + 0.8) + 'rem';
                heart.style.animationDelay = Math.random() * 2 + 's';
                heart.style.animationDuration = (Math.random() * 2 + 3) + 's';
                document.body.appendChild(heart);
                
                setTimeout(() => heart.remove(), 5000);
            }, i * 40);
        }
        
        // Add sparkle effect
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.className = 'sparkle-confetti';
                sparkle.textContent = '✨';
                sparkle.style.left = Math.random() * 100 + 'vw';
                sparkle.style.animationDelay = Math.random() * 1.5 + 's';
                document.body.appendChild(sparkle);
                
                setTimeout(() => sparkle.remove(), 4000);
            }, i * 60);
        }
    }

    // Update URL with parameters
    updateURL(nameA, nameB, dobA, dobB) {
        const params = new URLSearchParams();
        params.set('a', nameA);
        params.set('b', nameB);
        if (dobA) params.set('da', dobA);
        if (dobB) params.set('db', dobB);
        
        const newURL = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState({}, '', newURL);
    }

    // Load data from URL parameters
    loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        const nameA = params.get('a');
        const nameB = params.get('b');
        const dobA = params.get('da');
        const dobB = params.get('db');

        if (nameA && nameB) {
            document.getElementById('nameA').value = nameA;
            document.getElementById('nameB').value = nameB;
            if (dobA) document.getElementById('dobA').value = dobA;
            if (dobB) document.getElementById('dobB').value = dobB;
            
            // Auto-calculate if valid
            setTimeout(() => {
                if (this.validateForm()) {
                    this.calculateLove();
                }
            }, 100);
        }
    }

    // Save calculation to localStorage
    saveRecentCalculation(nameA, nameB, dobA, dobB, score) {
        let recent = JSON.parse(localStorage.getItem('loveCalculatorRecent') || '[]');
        
        const calculation = {
            nameA,
            nameB,
            dobA,
            dobB,
            score,
            timestamp: Date.now()
        };
        
        // Remove duplicate if exists
        recent = recent.filter(item => 
            !(item.nameA === nameA && item.nameB === nameB && 
              item.dobA === dobA && item.dobB === dobB)
        );
        
        // Add to beginning
        recent.unshift(calculation);
        
        // Keep only last 5
        recent = recent.slice(0, 5);
        
        localStorage.setItem('loveCalculatorRecent', JSON.stringify(recent));
        this.loadRecentCalculations();
    }

    // Load and display recent calculations
    loadRecentCalculations() {
        const recent = JSON.parse(localStorage.getItem('loveCalculatorRecent') || '[]');
        
        if (recent.length === 0) {
            this.recentSection.classList.add('hidden');
            return;
        }
        
        this.recentSection.classList.remove('hidden');
        
        const html = recent.map(item => `
            <div class="recent-item" onclick="loveCalc.loadRecentItem('${item.nameA}', '${item.nameB}', '${item.dobA}', '${item.dobB}')">
                <span class="recent-names">${item.nameA} & ${item.nameB}</span>
                <span class="recent-score">${item.score}%</span>
            </div>
        `).join('');
        
        this.recentList.innerHTML = html;
    }

    // Load a recent calculation
    loadRecentItem(nameA, nameB, dobA, dobB) {
        document.getElementById('nameA').value = nameA;
        document.getElementById('nameB').value = nameB;
        document.getElementById('dobA').value = dobA || '';
        document.getElementById('dobB').value = dobB || '';
        
        this.calculateLove();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Reset form
    resetForm() {
        this.form.reset();
        this.resultCard.classList.add('hidden');
        
        // Clear errors
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        document.querySelectorAll('.form-input').forEach(el => el.classList.remove('invalid'));
        
        // Clear URL
        window.history.replaceState({}, '', window.location.pathname);
        
        // Focus first input
        document.getElementById('nameA').focus();
    }

    // Copy share link
    async copyShareLink() {
        const url = window.location.href;
        
        try {
            await navigator.clipboard.writeText(url);
            this.showToast('Link copied to clipboard!');
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('Link copied to clipboard!');
        }
    }

    // Share on WhatsApp
    shareWhatsApp() {
        const nameA = document.getElementById('nameA').value;
        const nameB = document.getElementById('nameB').value;
        const score = document.getElementById('scoreValue').textContent;
        
        const text = `${nameA} and ${nameB} have a ${score}% love compatibility! Check your compatibility at ${window.location.href}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        
        window.open(whatsappUrl, '_blank');
    }

    // Share on Facebook
    shareFacebook() {
        const url = window.location.href;
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        
        window.open(facebookUrl, '_blank', 'width=600,height=400');
    }

    // Show toast notification
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Add toast animations to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize app when DOM is loaded
let loveCalc;
document.addEventListener('DOMContentLoaded', () => {
    loveCalc = new LoveCalculator();
});

// Service Worker Registration (optional, for offline support)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}
