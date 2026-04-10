/**
 * Main Form Controller
 * Ensures the DOM is fully loaded and manages all semantic HTML5 interactions.
 */
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Element Selectors
    const form = document.getElementById('registrationForm');
    const usernameInput = document.getElementById('username');
    const pwdInput = document.getElementById('pwd');
    const confirmPwdInput = document.getElementById('pwd-confirm');
    const meter = document.getElementById('strength-meter');
    const strengthText = document.getElementById('strength-text');
    const submitBtn = document.getElementById('submitBtn');
    const phoneNum = document.getElementById('phone-number');
    
    // Create the character counter element dynamically (or select if in HTML)
    // We will place it near the strength text
    const charCounter = document.createElement('small');
    charCounter.style.display = 'block';
    charCounter.style.color = '#64748b';
    strengthText.parentNode.insertBefore(charCounter, strengthText.nextSibling);

    const allInputs = document.querySelectorAll('input:not([type="color"])');

    /**
     * 2. Password Match Validation
     * Uses the Constraint Validation API to set custom error messages.
     */

    usernameInput.addEventListener('input', () => {
        const taken = ["admin", "user", "test"];
        const isMatch = taken.includes(usernameInput.value.toLowerCase());
        if (isMatch && usernameInput.value !== "") {
            usernameInput.setCustomValidity("Username is already taken");
        } else {
            usernameInput.setCustomValidity("");
        }
    });

    function validateMatch() {
        const isMatch = pwdInput.value === confirmPwdInput.value;
        if (!isMatch && confirmPwdInput.value !== "") {
            confirmPwdInput.setCustomValidity("Passwords do not match");
        } else {
            confirmPwdInput.setCustomValidity("");
        }
    }

    phoneNum.addEventListener('input', () => {
        const val = phoneNum.value;
        const pattern = /^\(?([0-9]{3})\)?[-.\\s]?([0-9]{3})[-.\\s]?([0-9]{4})$/;
        
        if (!pattern.test(val)) {
            phoneNum.setCustomValidity("Invalid phone number.");
        } else {
            phoneNum.setCustomValidity("");
        }
    });

    /**
     * 3. Password Strength, Checklist, and Character Counter
     * This is the "Single Source of Truth" for the password field.
     */
    pwdInput.addEventListener('input', () => {
        validateMatch();
        const val = pwdInput.value;
        
        // --- Character Counter Logic ---
        const length = val.length;
        charCounter.textContent = `Characters: ${length} / 8 (minimum)`;
        charCounter.style.color = length >= 8 ? "#22c55e" : "#64748b";

        // --- Requirement Checklist Logic ---
        const requirements = {
            length: length >= 8,
            number: /[0-9]/.test(val),
            lowercase: /[a-z]/.test(val),
            uppercase: /[A-Z]/.test(val)
        };

        Object.keys(requirements).forEach(rule => {
            const element = document.getElementById(`req-${rule}`);
            if (element) {
                element.classList.toggle('valid', requirements[rule]);
                element.classList.toggle('invalid', !requirements[rule]);
            }
        });

        // --- Strength Meter Logic ---
        const strength = Object.values(requirements).filter(Boolean).length;
        meter.value = strength;
        
        const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
        strengthText.textContent = `Strength: ${labels[strength]}`;
        strengthText.style.color = strength < 3 ? "#ef4444" : "#22c55e";
    });

    confirmPwdInput.addEventListener('input', validateMatch);

    /**
     * 4. Password Visibility Toggle
     * Switches input type between 'password' and 'text'.
     */
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const isPassword = input.type === 'password';
            
            input.type = isPassword ? 'text' : 'password';
            button.textContent = isPassword ? 'Hide' : 'Show';
        });
    });

    /**
     * 5. Real-time Field Validation (Blur)
     * Provides instant visual feedback when a user leaves a field.
     */
    allInputs.forEach(input => {
        input.addEventListener('input', () => {
            const errorSpan = document.getElementById(`${input.id}-error`);
            const isValid = input.checkValidity();
            const inputField = document.getElementById(input.id);
            
            input.classList.toggle('invalid', !isValid);
            input.classList.toggle('valid', isValid);

            if (errorSpan) {
                errorSpan.textContent = isValid ? '' : input.validationMessage;
                errorSpan.style.display = isValid ? 'none' : 'block';
                inputField.style.outlineColor = isValid ? '#22c55e' : '#ef4444';
            }
        });
    });

    /**
     * 6. Asynchronous Form Submission
     * Prevents page reload and handles data via the Fetch API.
     */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!form.checkValidity()) {
            alert("Please correct the errors in the form before submitting.");
            return;
        }

        // UI Feedback: Disable button to prevent double-submission
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Processing...";

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert("Account created successfully!");
                form.reset();
                
                // Manual UI Reset for custom elements
                meter.value = 0;
                charCounter.textContent = "";
                strengthText.textContent = "Strength: Very Weak";
                document.querySelectorAll('.checklist li').forEach(li => {
                    li.classList.remove('valid');
                    li.classList.add('invalid');
                });
            } else {
                throw new Error("Server error");
            }
        } catch (err) {
            console.error("Submission Error:", err);
            alert("Oops! Submission failed. Please try again later.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    console.log("Semantic Form Controller initialized.");
});