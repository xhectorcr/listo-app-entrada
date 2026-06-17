const API_BASE_URL = "https://listo-backend-1.onrender.com/api"; // Ajustado para producción

const PIN_LENGTH = 6;
let currentPin = "";

const dots = document.querySelectorAll(".dot");
const numBtns = document.querySelectorAll(".num-btn");
const btnClear = document.getElementById("btn-clear");
const btnDelete = document.getElementById("btn-delete");
const statusMessage = document.getElementById("status-message");
const loader = document.getElementById("loader");

// Initialize Sound Effects
const beepSound = new Audio("data:audio/wav;base64,UklGRlIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTEAAAAcHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0dHR0="); // Placeholder short beep

function updateDisplay() {
    dots.forEach((dot, index) => {
        if (index < currentPin.length) {
            dot.classList.add("active");
            dot.classList.remove("error", "success");
        } else {
            dot.classList.remove("active", "error", "success");
        }
    });
}

function showMessage(msg, type) {
    statusMessage.textContent = msg;
    statusMessage.className = `status-message show ${type}`;
    
    if (type === "error") {
        dots.forEach(dot => dot.classList.add("error"));
        setTimeout(() => {
            currentPin = "";
            updateDisplay();
            statusMessage.classList.remove("show");
        }, 1500);
    }
}

async function validatePin() {
    if (currentPin.length !== PIN_LENGTH) return;
    
    loader.classList.add("active");
    statusMessage.classList.remove("show");

    try {
        const response = await fetch(`${API_BASE_URL}/usuario/validar-acceso`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pinTemporal: currentPin })
        });

        const data = await response.json();

        loader.classList.remove("active");

        if (data.success) {
            // Success State
            dots.forEach(dot => {
                dot.classList.remove("active");
                dot.classList.add("success");
            });
            showMessage(`¡Bienvenido ${data.data.nombre}!`, "success");
            
            // Create Success Overlay
            const overlay = document.createElement("div");
            overlay.className = "success-overlay show";
            overlay.innerHTML = `
                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
                </svg>
                <h2>Acceso Permitido</h2>
                <p>Puede ingresar a la tienda</p>
            `;
            document.querySelector(".lock-container").appendChild(overlay);

            // Reset after 3 seconds
            setTimeout(() => {
                overlay.remove();
                currentPin = "";
                updateDisplay();
                statusMessage.classList.remove("show");
            }, 3000);
        } else {
            showMessage(data.message || "PIN Incorrecto", "error");
        }

    } catch (error) {
        loader.classList.remove("active");
        showMessage("Error de conexión", "error");
        console.error(error);
    }
}

numBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        if (currentPin.length < PIN_LENGTH) {
            currentPin += btn.dataset.val;
            beepSound.currentTime = 0;
            beepSound.play().catch(e => {}); // Ignore autoplay policies errors
            updateDisplay();

            if (currentPin.length === PIN_LENGTH) {
                validatePin();
            }
        }
    });
});

btnDelete.addEventListener("click", () => {
    if (currentPin.length > 0) {
        currentPin = currentPin.slice(0, -1);
        updateDisplay();
    }
});

btnClear.addEventListener("click", () => {
    currentPin = "";
    updateDisplay();
});

// Keyboard support
document.addEventListener("keydown", (e) => {
    if (e.key >= "0" && e.key <= "9") {
        if (currentPin.length < PIN_LENGTH) {
            currentPin += e.key;
            updateDisplay();
            if (currentPin.length === PIN_LENGTH) validatePin();
        }
    } else if (e.key === "Backspace") {
        currentPin = currentPin.slice(0, -1);
        updateDisplay();
    } else if (e.key === "Escape") {
        currentPin = "";
        updateDisplay();
    }
});
