/* Filter Panel Styles */
.filter-panel {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #111;
    width: 350px;
    max-width: 90%;
    max-height: 90vh;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    z-index: 100;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
}

.filter-panel.show {
    opacity: 1;
    visibility: visible;
}

.filter-header {
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
}

.filter-header h3 {
    margin: 0;
    flex: 1;
    font-weight: 400;
    font-size: 18px;
}

.filter-badge {
    background-color: rgba(255, 255, 255, 0.2);
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    margin-right: 10px;
}

.filter-badge.active {
    background-color: white;
    color: black;
}

.filter-close {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    opacity: 0.7;
    line-height: 1;
}

.filter-body {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
}

.filter-section {
    margin-bottom: 25px;
}

.filter-section:last-child {
    margin-bottom: 0;
}

.filter-section h4 {
    margin: 0 0 15px;
    font-weight: 400;
    font-size: 16px;
    color: rgba(255, 255, 255, 0.8);
}

.filter-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
}

.filter-option {
    display: flex;
    align-items: center;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.filter-option:hover {
    color: white;
}

.filter-option input {
    margin-right: 8px;
}

.filter-footer {
    padding: 15px 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
}

.filter-reset {
    background-color: transparent;
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
}

.filter-reset:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.filter-apply {
    background-color: white;
    border: none;
    color: black;
    padding: 8px 20px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease;
}

.filter-apply:hover {
    background-color: #f0f0f0;
    transform: translateY(-2px);
}

.filter-toggle-button {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: white;
    border: none;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    z-index: 99;
    transition: all 0.2s ease;
}

.filter-toggle-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.4);
}

.filter-toggle-button svg {
    stroke: black;
}

.filter-toggle-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    width: 22px;
    height: 22px;
    background-color: #333;
    color: white;
    border-radius: 50%;
    font-size: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    opacity: 0;
    transition: opacity 0.2s ease;
}

.filter-toggle-badge.active {
    opacity: 1;
}

.filter-notification {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 12px 20px;
    border-radius: 30px;
    font-size: 14px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    z-index: 98;
    animation: fadeIn 0.3s ease;
}

.filter-notification.fade-out {
    animation: fadeOut 0.3s ease forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translate(-50%, 20px);
    }
    to {
        opacity: 1;
        transform: translate(-50%, 0);
    }
}

@keyframes fadeOut {
    from {
        opacity: 1;
        transform: translate(-50%, 0);
    }
    to {
        opacity: 0;
        transform: translate(-50%, 20px);
    }
}

@media (max-width: 480px) {
    .filter-options {
        grid-template-columns: 1fr;
    }
    
    .filter-toggle-button {
        bottom: 20px;
        right: 20px;
        width: 45px;
        height: 45px;
    }
}
