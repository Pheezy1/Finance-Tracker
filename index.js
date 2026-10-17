document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('finance-form');
    const mainCategorySelect = document.getElementById('main-category');
    const subCategoryGroup = document.getElementById('sub-category-group');
    const subCategorySelect = document.getElementById('sub-category');
    const ledgerBody = document.getElementById('ledger-body');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const totalExpensesDisplay = document.getElementById('total-expenses-display');

    let financeHistory = [];

    // Map your custom sub-category configuration relationships
    const subCategoriesMap = {
        "Bike": ["Fuel", "Oil", "Other Fixings"],
        "Food": ["Food", "Drinks"]
    };

    // PWA Mobile App Support Integration
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('Finance Service Worker Registered!'))
            .catch((err) => console.log('Worker registration failed:', err));
    }

    // Dynamic Category Change Router Logic
    mainCategorySelect.addEventListener('change', function() {
        const selectedVal = this.value;
        
        if (subCategoriesMap[selectedVal]) {
            // Populate subcategories
            subCategorySelect.innerHTML = '';
            subCategoriesMap[selectedVal].forEach(sub => {
                const opt = document.createElement('option');
                opt.value = sub;
                opt.textContent = sub;
                subCategorySelect.appendChild(opt);
            });
            // Show subcategory dropdown block
            subCategoryGroup.classList.remove('hidden');
            subCategorySelect.required = true;
        } else {
            // Hide subcategory dropdown if no sub-options exist
            subCategoryGroup.classList.add('hidden');
            subCategorySelect.innerHTML = '';
            subCategorySelect.required = false;
        }
    });

    // LocalStorage Safe Reading Wrapper
    function getLedgerData() {
        try {
            let stored = localStorage.getItem('finance_tracker_logs');
            return stored ? JSON.parse(stored) : financeHistory;
        } catch (e) {
            console.warn("Storage restriction found. Running safely in active page memory.", e);
            return financeHistory;
        }
    }

    // LocalStorage Safe Saving Wrapper
    function saveLedgerData(data) {
        financeHistory = data;
        try {
            localStorage.setItem('finance_tracker_logs', JSON.stringify(data));
        } catch (e) {
            console.warn("Writing to local memory storage failed.", e);
        }
        renderLedger();
    }

    // Main Record Insertion Processing Engine
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const amountInput = document.getElementById('amount').value;
        const mainCategory = mainCategorySelect.value;
        const subCategory = !subCategoryGroup.classList.contains('hidden') ? subCategorySelect.value : null;
        const descriptionInput = document.getElementById('description').value.trim();

        // Strict integer rounding filter for Naira fields
        const finalAmount = Math.round(parseFloat(amountInput));

        if (isNaN(finalAmount) || finalAmount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        // Compile clean dynamic Category string layout
        const displayedCategory = subCategory ? `${mainCategory} (${subCategory})` : mainCategory;
        const finalDescription = descriptionInput || 'No description provided';

        // Map clean localized Nigerian date/time signature (DD/MM/YYYY, HH:MM)
        const currentDateTime = new Date().toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        // Construct unique expense record schema mapping element parameters
        const ledgerEntry = {
            id: Date.now().toString() + Math.random().toString(16).slice(2, 6),
            timestamp: currentDateTime,
            category: displayedCategory,
            description: finalDescription,
            amount: finalAmount
        };

        let currentLedger = getLedgerData();
        currentLedger.unshift(ledgerEntry); // Prepend to show newest on top
        saveLedgerData(currentLedger);

        // Reset the form fields cleanly while maintaining application view focus
        form.reset();
        subCategoryGroup.classList.add('hidden');
        subCategorySelect.innerHTML = '';
        subCategorySelect.required = false;
    });

    // Wipe out the entire expense ledger history data structure archive
    clearAllBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to permanently delete ALL recorded expenses?")) {
            saveLedgerData([]);
        }
    });

    // Master Render Pipeline & Continuous Wallet Running Total Tracker
    function renderLedger() {
        let currentLogs = getLedgerData();
        ledgerBody.innerHTML = '';

        let aggregateExpenses = 0;

        if (currentLogs.length === 0) {
            ledgerBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#9ca3af; padding:25px;">No transactions recorded yet. Use the form to log your expenses.</td></tr>`;
            totalExpensesDisplay.textContent = "₦0";
            return;
        }

        currentLogs.forEach(entry => {
            aggregateExpenses += entry.amount;

            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${entry.timestamp}</td>
                <td style="font-weight: 600;">${entry.category}</td>
                <td style="color: #4b5563; max-width: 250px; word-break: break-word;">${entry.description}</td>
                <td style="font-weight: 700; color: #1e3a8a;">₦${entry.amount.toLocaleString('en-US', {maximumFractionDigits: 0})}</td>
                <td class="action-cell">
                    <button class="btn-secondary item-delete-trigger" data-id="${entry.id}" style="padding: 4px 8px; font-size: 0.75rem;">Delete</button>
                </td>
            `;

            // Wire targeted operational row erasure routine handles
            tr.querySelector('.item-delete-trigger').addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('data-id');
                let ledgerDataset = getLedgerData();
                let filteredDataset = ledgerDataset.filter(item => item.id !== targetId);
                saveLedgerData(filteredDataset);
            });

            ledgerBody.appendChild(tr);
        });

        // Render dynamic whole-number total tally onto dashboard counters element
        totalExpensesDisplay.textContent = '₦' + aggregateExpenses.toLocaleString('en-US', {
            maximumFractionDigits: 0
        });
    }

    // Initial table view rendering sequence on boot context screen wake
    renderLedger();
});
