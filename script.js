// ===========================
// KILL SHEET CALCULATOR - JAVASCRIPT
// ===========================

// Constants
const PRESSURE_GRADIENT = 0.052; // psi/ft per ppg
const BBL_PER_IN2_FT = 12.0 / 9691.04; // conversion: in^2 * ft -> barrels
const PI = Math.PI;

// Global chart instance
let pressureChart = null;

// ===========================
// INITIALIZATION
// ===========================
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeChart();
    setupHWDPToggle();
});

// ===========================
// EVENT LISTENERS
// ===========================
function initializeEventListeners() {
    // Get all input elements
    const inputs = document.querySelectorAll('input[type="number"], input[type="text"]');
    
    // Add input event listeners for real-time calculation
    inputs.forEach(input => {
        input.addEventListener('input', debounce(calculateAll, 300));
        input.addEventListener('blur', validateInput);
    });
    
    // Reset button
    document.getElementById('reset-btn').addEventListener('click', resetForm);
    
    // Download PDF button
    document.getElementById('download-pdf-btn').addEventListener('click', downloadPDF);
}

// ===========================
// HWDP TOGGLE
// ===========================
function setupHWDPToggle() {
    const hwdpCheckbox = document.getElementById('hwdp_present');
    const hwdpInputs = document.getElementById('hwdp-inputs');
    
    hwdpCheckbox.addEventListener('change', function() {
        if (this.checked) {
            hwdpInputs.style.display = 'grid';
            // Add smooth animation
            hwdpInputs.style.animation = 'fadeIn 0.3s ease-out';
        } else {
            hwdpInputs.style.display = 'none';
            // Clear HWDP values
            document.getElementById('hwdp_od').value = '';
            document.getElementById('hwdp_id').value = '';
            document.getElementById('hwdp_length').value = '';
        }
        calculateAll();
    });
}

// ===========================
// INPUT VALIDATION
// ===========================
function validateInput(event) {
    const input = event.target;
    const value = parseFloat(input.value);
    
    if (input.type === 'number') {
        if (isNaN(value) || value < 0) {
            input.style.borderColor = '#ef4444';
            showTooltip(input, 'Please enter a valid positive number');
        } else {
            input.style.borderColor = '#10b981';
            hideTooltip(input);
        }
    }
}

function showTooltip(element, message) {
    // Remove existing tooltip
    hideTooltip(element);
    
    const tooltip = document.createElement('div');
    tooltip.className = 'validation-tooltip';
    tooltip.textContent = message;
    tooltip.style.cssText = `
        position: absolute;
        background: #ef4444;
        color: white;
        padding: 0.5rem 0.75rem;
        border-radius: 6px;
        font-size: 0.85rem;
        margin-top: 0.25rem;
        z-index: 1000;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    
    element.parentElement.style.position = 'relative';
    element.parentElement.appendChild(tooltip);
    
    setTimeout(() => hideTooltip(element), 3000);
}

function hideTooltip(element) {
    const tooltip = element.parentElement.querySelector('.validation-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// ===========================
// UTILITY FUNCTIONS
// ===========================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function getInputValue(id, defaultValue = 0) {
    const element = document.getElementById(id);
    if (!element) return defaultValue;
    const value = parseFloat(element.value);
    return isNaN(value) || value < 0 ? defaultValue : value;
}

function setResultValue(id, value, decimals = 2) {
    const element = document.getElementById(id);
    if (element) {
        if (isNaN(value) || !isFinite(value)) {
            element.textContent = '--';
        } else {
            element.textContent = value.toFixed(decimals);
        }
    }
}

// ===========================
// MAIN CALCULATION FUNCTION
// ===========================
function calculateAll() {
    try {
        // Get all input values
        const inputs = getInputValues();
        
        // Validate critical inputs
        if (!validateCriticalInputs(inputs)) {
            clearResults();
            return;
        }
        
        // Perform calculations
        const results = performCalculations(inputs);
        
        // Display results
        displayResults(results);
        
        // Update pressure schedule table
        updatePressureSchedule(results);
        
        // Update chart
        updateChart(results);
        
    } catch (error) {
        console.error('Calculation error:', error);
        clearResults();
    }
}

// ===========================
// GET INPUT VALUES
// ===========================
function getInputValues() {
    return {
        // Well data
        hole_diameter: getInputValue('hole_diameter'),
        hole_depth: getInputValue('hole_depth'),
        current_mud_weight: getInputValue('current_mud_weight'),
        
        // Pressures
        sidpp: getInputValue('sidpp'),
        sicp: getInputValue('sicp'),
        pit_gain: getInputValue('pit_gain'),
        normal_circulating_pressure: getInputValue('normal_circulating_pressure'),
        user_stroke_pressure: getInputValue('user_stroke_pressure'),
        
        // Pump data
        pump_capacity: getInputValue('pump_capacity'),
        strokes_per_min: getInputValue('strokes_per_min'),
        
        // Casing data
        casing_id: getInputValue('casing_id'),
        casing_od: getInputValue('casing_od'),
        casing_setting_depth: getInputValue('casing_setting_depth'),
        
        // Drill collar data
        dc_od: getInputValue('dc_od'),
        dc_id: getInputValue('dc_id'),
        dc_length: getInputValue('dc_length'),
        
        // Drill pipe data
        dp_od: getInputValue('dp_od'),
        dp_id: getInputValue('dp_id'),
        dp_nominal_weight: getInputValue('dp_nominal_weight'),
        
        // HWDP data
        hwdp_present: document.getElementById('hwdp_present').checked,
        hwdp_od: getInputValue('hwdp_od'),
        hwdp_id: getInputValue('hwdp_id'),
        hwdp_length: getInputValue('hwdp_length')
    };
}

// ===========================
// VALIDATE CRITICAL INPUTS
// ===========================
function validateCriticalInputs(inputs) {
    return inputs.hole_depth > 0 && 
           inputs.pump_capacity > 0 && 
           inputs.current_mud_weight > 0;
}

// ===========================
// PERFORM CALCULATIONS
// ===========================
function performCalculations(inputs) {
    const results = {};
    
    // Kill Mud Weight (ppg)
    // Formula: KMW = CMW + (SIDPP / (0.052 × TVD))
    results.kill_mud_weight = inputs.current_mud_weight + 
        (inputs.sidpp / (PRESSURE_GRADIENT * inputs.hole_depth));
    
    // Initial Circulating Pressure (ICP)
    // Formula: ICP = SIDPP + Slow Pump Pressure
    results.icp = inputs.sidpp + inputs.user_stroke_pressure;
    
    // Final Circulating Pressure (FCP)
    // Formula: FCP = Slow Pump Pressure × (KMW / CMW)
    results.fcp = inputs.current_mud_weight > 0 
        ? inputs.user_stroke_pressure * (results.kill_mud_weight / inputs.current_mud_weight)
        : 0;
    
    // Drill Pipe Internal Capacity (bbl)
    // Formula: Capacity = Length × π × (ID²/4) × (12/9691.04)
    results.drill_pipe_capacity = inputs.hole_depth * 
        (PI * Math.pow(inputs.dp_id, 2) / 4.0) * BBL_PER_IN2_FT;
    
    // Drill Collar Internal Capacity (bbl)
    results.drill_collar_capacity = inputs.dc_length * 
        (PI * Math.pow(inputs.dc_id, 2) / 4.0) * BBL_PER_IN2_FT;
    
    // HWDP Internal Capacity (bbl)
    results.hwdp_internal_capacity = inputs.hwdp_present 
        ? inputs.hwdp_length * (PI * Math.pow(inputs.hwdp_id, 2) / 4.0) * BBL_PER_IN2_FT
        : 0;
    
    // Total Drill String Internal Capacity (bbl)
    results.drill_string_capacity = results.drill_pipe_capacity + 
        results.drill_collar_capacity + results.hwdp_internal_capacity;
    
    // Drill String Internal Volume (same as capacity)
    results.drill_string_volume = results.drill_string_capacity;
    
    // Surface-to-Bit Strokes
    // Formula: Strokes = Volume / Pump Capacity
    results.surface_to_bit_strokes = inputs.pump_capacity > 0 
        ? results.drill_string_volume / inputs.pump_capacity
        : 0;
    
    // Open-hole depth
    results.open_hole_depth = Math.max(inputs.hole_depth - inputs.casing_setting_depth, 0);
    
    // Open-hole DP length
    const def_length = inputs.dc_length + (inputs.hwdp_present ? inputs.hwdp_length : 0);
    results.open_hole_dp_length = Math.max(results.open_hole_depth - def_length, 0);
    
    // Total DP length
    results.total_dp_length = results.open_hole_dp_length + inputs.casing_setting_depth + 
        (inputs.hwdp_present ? inputs.hwdp_length : 0);
    
    // Annulus Capacities
    // Open hole annulus around DC
    results.ann_open_dc = inputs.dc_length * 
        (PI * (Math.pow(inputs.hole_diameter, 2) - Math.pow(inputs.dc_od, 2)) / 4.0) * BBL_PER_IN2_FT;
    
    // Open hole annulus around HWDP
    results.ann_open_hwdp = inputs.hwdp_present 
        ? inputs.hwdp_length * (PI * (Math.pow(inputs.hole_diameter, 2) - Math.pow(inputs.hwdp_od, 2)) / 4.0) * BBL_PER_IN2_FT
        : 0;
    
    // Open hole annulus around DP
    results.ann_open_dp = results.open_hole_dp_length * 
        (PI * (Math.pow(inputs.hole_diameter, 2) - Math.pow(inputs.dp_od, 2)) / 4.0) * BBL_PER_IN2_FT;
    
    // Cased hole annulus around DP
    const dp_length_cased_hole = Math.min(inputs.casing_setting_depth, inputs.hole_depth);
    results.ann_cased_dp = dp_length_cased_hole * 
        (PI * (Math.pow(inputs.casing_id, 2) - Math.pow(inputs.dp_od, 2)) / 4.0) * BBL_PER_IN2_FT;
    
    // Total Annular Capacity
    results.total_annular_capacity = results.ann_open_dc + results.ann_open_dp + 
        results.ann_cased_dp + results.ann_open_hwdp;
    
    // Bit-to-Surface Strokes (annulus)
    results.bit_to_surface_strokes = inputs.pump_capacity > 0 
        ? results.total_annular_capacity / inputs.pump_capacity
        : 0;
    
    // Total Strokes
    results.total_strokes = results.surface_to_bit_strokes + results.bit_to_surface_strokes;
    
    // Time Calculations
    if (inputs.strokes_per_min > 0 && inputs.pump_capacity > 0) {
        results.time_surface_to_bit = results.drill_string_volume / 
            (inputs.strokes_per_min * inputs.pump_capacity);
        results.bit_to_surface_time = results.total_annular_capacity / 
            (inputs.strokes_per_min * inputs.pump_capacity);
    } else {
        results.time_surface_to_bit = 0;
        results.bit_to_surface_time = 0;
    }
    
    results.total_pumping_time = results.time_surface_to_bit + results.bit_to_surface_time;
    
    // Pressure Drop per 100 Strokes
    results.pressure_drop_per_100_strokes = results.surface_to_bit_strokes > 0 
        ? ((results.icp - results.fcp) / results.surface_to_bit_strokes) * 100.0
        : 0;
    
    return results;
}

// ===========================
// DISPLAY RESULTS
// ===========================
function displayResults(results) {
    // Kill Parameters
    setResultValue('kill_mud_weight', results.kill_mud_weight, 2);
    setResultValue('icp', results.icp, 2);
    setResultValue('fcp', results.fcp, 2);
    setResultValue('pressure_drop_100', results.pressure_drop_per_100_strokes, 3);
    
    // Volume & Stroke Calculations
    setResultValue('drill_string_volume', results.drill_string_volume, 3);
    setResultValue('surface_to_bit_strokes', results.surface_to_bit_strokes, 1);
    setResultValue('total_annular_capacity', results.total_annular_capacity, 3);
    setResultValue('bit_to_surface_strokes', results.bit_to_surface_strokes, 1);
    setResultValue('total_strokes', results.total_strokes, 1);
    setResultValue('open_hole_depth', results.open_hole_depth, 2);
    setResultValue('open_hole_dp_length', results.open_hole_dp_length, 2);
    setResultValue('total_dp_length', results.total_dp_length, 2);
    
    // Time Calculations
    setResultValue('time_surface_to_bit', results.time_surface_to_bit, 2);
    setResultValue('bit_to_surface_time', results.bit_to_surface_time, 2);
    setResultValue('total_pumping_time', results.total_pumping_time, 2);
}

// ===========================
// CLEAR RESULTS
// ===========================
function clearResults() {
    const resultElements = document.querySelectorAll('.result-value span:first-child');
    resultElements.forEach(el => el.textContent = '--');
}

// ===========================
// UPDATE PRESSURE SCHEDULE TABLE
// ===========================
function updatePressureSchedule(results) {
    const tbody = document.getElementById('pressure-schedule-body');
    tbody.innerHTML = '';
    
    if (results.surface_to_bit_strokes <= 0) return;
    
    const pressure_drop_per_stroke = (results.icp - results.fcp) / results.surface_to_bit_strokes;
    const numRows = 10;
    const strokeIncrement = results.surface_to_bit_strokes / numRows;
    
    for (let i = 0; i <= numRows; i++) {
        const strokes = i * strokeIncrement;
        let pressure = results.icp - (pressure_drop_per_stroke * strokes);
        
        // Clamp at FCP
        if (pressure < results.fcp) {
            pressure = results.fcp;
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${strokes.toFixed(0)}</td>
            <td><input type="number" value="${pressure.toFixed(2)}" step="0.01" readonly></td>
        `;
        
        // Add animation
        row.style.animation = 'fadeIn 0.3s ease-out';
        row.style.animationDelay = `${i * 0.05}s`;
        row.style.opacity = '0';
        row.style.animationFillMode = 'forwards';
        
        tbody.appendChild(row);
    }
}

// ===========================
// CHART INITIALIZATION
// ===========================
function initializeChart() {
    const ctx = document.getElementById('pressureChart').getContext('2d');
    
    pressureChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Drillpipe Pressure',
                data: [],
                borderColor: '#0ea5e9',
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                borderWidth: 3,
                tension: 0.1,
                fill: true,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: '#0ea5e9',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#0f172a'
                    }
                },
                title: {
                    display: true,
                    text: 'Drillpipe Pressure vs Strokes',
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    color: '#1e3a8a'
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            return `Pressure: ${context.parsed.y.toFixed(2)} psi`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Strokes',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#475569'
                    },
                    grid: {
                        color: 'rgba(203, 213, 225, 0.5)'
                    },
                    ticks: {
                        color: '#475569',
                        font: {
                            size: 12
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Pressure (psi)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#475569'
                    },
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(203, 213, 225, 0.5)'
                    },
                    ticks: {
                        color: '#475569',
                        font: {
                            size: 12
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// ===========================
// UPDATE CHART
// ===========================
function updateChart(results) {
    if (!pressureChart) return;
    
    if (results.surface_to_bit_strokes <= 0) {
        pressureChart.data.labels = [];
        pressureChart.data.datasets[0].data = [];
        pressureChart.update();
        return;
    }
    
    const pressure_drop_per_stroke = (results.icp - results.fcp) / results.surface_to_bit_strokes;
    const maxStrokes = Math.max(1400, Math.ceil(results.total_strokes));
    const step = 100;
    
    const labels = [];
    const data = [];
    
    for (let strokes = 0; strokes <= maxStrokes; strokes += step) {
        labels.push(strokes);
        
        let pressure = results.icp - (pressure_drop_per_stroke * strokes);
        if (pressure < results.fcp) {
            pressure = results.fcp;
        }
        
        data.push(pressure);
    }
    
    pressureChart.data.labels = labels;
    pressureChart.data.datasets[0].data = data;
    pressureChart.update('active');
}

// ===========================
// RESET FORM
// ===========================
function resetForm() {
    if (confirm('Are you sure you want to reset all fields?')) {
        // Reset all inputs
        document.querySelectorAll('input[type="number"], input[type="text"]').forEach(input => {
            input.value = '';
            input.style.borderColor = '';
        });
        
        // Uncheck HWDP
        document.getElementById('hwdp_present').checked = false;
        document.getElementById('hwdp-inputs').style.display = 'none';
        
        // Clear results
        clearResults();
        
        // Clear table
        document.getElementById('pressure-schedule-body').innerHTML = '';
        
        // Clear chart
        if (pressureChart) {
            pressureChart.data.labels = [];
            pressureChart.data.datasets[0].data = [];
            pressureChart.update();
        }
        
        // Show success message
        showNotification('Form reset successfully!', 'success');
    }
}

// ===========================
// DOWNLOAD PDF
// ===========================
function downloadPDF() {
    const element = document.getElementById('killsheet-content');
    const opt = {
        margin: 0.5,
        filename: `kill-sheet-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    // Show loading state
    const btn = document.getElementById('download-pdf-btn');
    const originalText = btn.textContent;
    btn.textContent = 'Generating PDF...';
    btn.disabled = true;
    
    html2pdf().set(opt).from(element).save().then(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        showNotification('PDF downloaded successfully!', 'success');
    }).catch(error => {
        console.error('PDF generation error:', error);
        btn.textContent = originalText;
        btn.disabled = false;
        showNotification('Error generating PDF. Please try again.', 'error');
    });
}

// ===========================
// NOTIFICATION SYSTEM
// ===========================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#0ea5e9'};
        color: white;
        border-radius: 10px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
