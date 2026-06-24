// =============================
// Expense Tracker Pro
// =============================

const form = document.getElementById("transactionForm");
const transactionList = document.getElementById("transactionList");

const nameInput = document.getElementById("transactionName");
const amountInput = document.getElementById("transactionAmount");
const dateInput = document.getElementById("transactionDate");
const typeInput = document.getElementById("transactionType");
const categoryInput = document.getElementById("transactionCategory");

const searchInput = document.getElementById("searchInput");
const filterDate = document.getElementById("filterDate");
const filterCategory = document.getElementById("filterCategory");

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");

const budgetInput = document.getElementById("budgetInput");
const budgetBtn = document.getElementById("setBudgetBtn");
const budgetStatus = document.getElementById("budgetStatus");

const exportBtn = document.getElementById("exportBtn");
const reportEl = document.getElementById("monthlyReport");

const themeBtn = document.getElementById("themeBtn");

let transactions =
JSON.parse(localStorage.getItem("transactions")) || [];

let monthlyBudget =
localStorage.getItem("monthlyBudget") || 0;

let categoryChart;
let incomeExpenseChart;
let monthlyChart;

// =============================
// Add Transaction
// =============================

form.addEventListener("submit", (e) => {

    e.preventDefault();

    const transaction = {
        id: Date.now(),
        name: nameInput.value.trim(),
        amount: Number(amountInput.value),
        date: dateInput.value,
        type: typeInput.value,
        category: categoryInput.value
    };

    transactions.push(transaction);

    saveData();

    form.reset();

    render();
});

// =============================
// Delete Transaction
// =============================

function deleteTransaction(id){

    if(!confirm("Delete this transaction?")) return;

    transactions =
    transactions.filter(
        transaction => transaction.id !== id
    );

    saveData();

    render();
}

function editTransaction(id){

    const transaction =
    transactions.find(
        item => item.id === id
    );

    if(!transaction) return;

    nameInput.value =
    transaction.name;

    amountInput.value =
    transaction.amount;

    dateInput.value =
    transaction.date;

    typeInput.value =
    transaction.type;

    categoryInput.value =
    transaction.category;

    transactions =
    transactions.filter(
        item => item.id !== id
    );

    saveData();

    render();
}

// =============================
// Save Data
// =============================

function saveData(){

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

    localStorage.setItem(
        "monthlyBudget",
        monthlyBudget
    );
}

// =============================
// Dashboard
// =============================

function updateDashboard(){

    let income = 0;
    let expense = 0;

    transactions.forEach(transaction => {

        if(transaction.type === "income"){
            income += transaction.amount;
        }else{
            expense += transaction.amount;
        }

    });

    const balance = income - expense;

    incomeEl.innerText =
    `₹${income.toLocaleString()}`;

    expenseEl.innerText =
    `₹${expense.toLocaleString()}`;

    balanceEl.innerText =
    `₹${balance.toLocaleString()}`;

    checkBudget(expense);
}

function updateTotalTransactions() {
    document.getElementById("totalTransactions").innerText =
        transactions.length;
}

// =============================
// Budget Alert
// =============================

budgetBtn.addEventListener("click", () => {

    monthlyBudget =
    Number(budgetInput.value);

    saveData();

    render();
});

function checkBudget(expense){

    if(monthlyBudget <= 0){

        budgetStatus.innerHTML =
        "No budget set.";

        return;
    }

    if(expense > monthlyBudget){

        budgetStatus.innerHTML =
        `⚠️ Budget exceeded by ₹${(expense-monthlyBudget).toLocaleString()}`;

        budgetStatus.style.color = "red";

    }else{

        budgetStatus.innerHTML =
        `✅ Remaining Budget: ₹${(monthlyBudget-expense).toLocaleString()}`;

        budgetStatus.style.color = "green";
    }
}

// =============================
// Render Transactions
// =============================

function renderTransactions(){

    const search =
    searchInput.value.toLowerCase();

    const selectedDate =
    filterDate.value;

    const selectedCategory =
    filterCategory.value;

    transactionList.innerHTML = "";

    const filteredTransactions =
    transactions.filter(transaction => {

        const matchesSearch =
        transaction.name
        .toLowerCase()
        .includes(search);

        const matchesDate =
        selectedDate === "" ||
        transaction.date === selectedDate;

        const matchesCategory =
        selectedCategory === "all" ||
        transaction.category === selectedCategory;

        return (
            matchesSearch &&
            matchesDate &&
            matchesCategory
        );
    });

    filteredTransactions
    .sort((a,b)=>b.id-a.id)
    .forEach(transaction => {

        const div =
        document.createElement("div");

        div.className =
        `transaction ${transaction.type}`;

        div.innerHTML = `

            <div class="transaction-details">

                <span class="transaction-name">
                    ${transaction.name}
                </span>

                <span class="transaction-meta">
                    ${transaction.category}
                    •
                    ${transaction.date}
                </span>

            </div>

            <div class="transaction-amount">

                ${
                    transaction.type === "income"
                    ? "+"
                    : "-"
                }

                ₹${transaction.amount.toLocaleString()}

            </div>

            <div class="actions">

                <button
                    class="edit-btn"
                    onclick="editTransaction(${transaction.id})"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteTransaction(${transaction.id})"
                >
                    Delete
                </button>

            </div>
        `;

        transactionList.appendChild(div);

    });
}

updateGoal();
monthlyComparison();
generateInsights();
updateTotalTransactions();

// =============================
// Charts
// =============================

function renderCharts(){

    const categoryTotals = {};

    let income = 0;
    let expense = 0;

    const monthlyTotals = {};

    transactions.forEach(transaction => {

        if(transaction.type === "expense"){

            categoryTotals[
                transaction.category
            ] =
            (categoryTotals[
                transaction.category
            ] || 0)
            +
            transaction.amount;

            expense += transaction.amount;

        }else{

            income += transaction.amount;
        }

        const month =
        transaction.date.slice(0,7);

        monthlyTotals[month] =
        (monthlyTotals[month] || 0)
        +
        transaction.amount;
    });

    if(categoryChart){
        categoryChart.destroy();
    }

    if(incomeExpenseChart){
        incomeExpenseChart.destroy();
    }

    if(monthlyChart){
        monthlyChart.destroy();
    }

    // Pie Chart

    categoryChart =
    new Chart(
        document.getElementById("categoryChart"),
        {
            type:"pie",
            data:{
                labels:Object.keys(categoryTotals),
                datasets:[{
                    data:Object.values(categoryTotals)
                }]
            }
        }
    );

    // Income vs Expense

    incomeExpenseChart =
    new Chart(
        document.getElementById("incomeExpenseChart"),
        {
            type:"bar",
            data:{
                labels:["Income","Expense"],
                datasets:[{
                    label:"Amount",
                    data:[income,expense]
                }]
            }
        }
    );

    // Monthly Trend

    monthlyChart =
    new Chart(
        document.getElementById("monthlyChart"),
        {
            type:"line",
            data:{
                labels:Object.keys(monthlyTotals),
                datasets:[{
                    label:"Monthly Spending",
                    data:Object.values(monthlyTotals)
                }]
            }
        }
    );
}

// =============================
// Monthly Report
// =============================

function generateReport(){

    let income = 0;
    let expense = 0;

    transactions.forEach(transaction => {

        if(transaction.type === "income"){
            income += transaction.amount;
        }else{
            expense += transaction.amount;
        }
    });

    reportEl.innerHTML = `

        <strong>Total Income:</strong>
        ₹${income.toLocaleString()}
        <br>

        <strong>Total Expense:</strong>
        ₹${expense.toLocaleString()}
        <br>

        <strong>Savings:</strong>
        ₹${(income-expense).toLocaleString()}
        <br>

        <strong>Total Transactions:</strong>
        ${transactions.length}
    `;
}

// =============================
// Export CSV
// =============================

exportBtn.addEventListener("click", () => {

    let csv =
    "Name,Amount,Type,Category,Date\n";

    transactions.forEach(transaction => {

        csv +=
        `${transaction.name},${transaction.amount},${transaction.type},${transaction.category},${transaction.date}\n`;
    });

    const blob =
    new Blob(
        [csv],
        {type:"text/csv"}
    );

    const url =
    URL.createObjectURL(blob);

    const a =
    document.createElement("a");

    a.href = url;

    a.download =
    "expense-report.csv";

    a.click();

    URL.revokeObjectURL(url);
});

// =============================
// Search & Filter
// =============================

searchInput.addEventListener(
    "input",
    renderTransactions
);

filterDate.addEventListener(
    "change",
    renderTransactions
);

filterCategory.addEventListener(
    "change",
    renderTransactions
);

// =============================
// Main Render
// =============================

function render(){

    updateDashboard();

    updateTotalTransactions();

    renderTransactions();

    renderCharts();

    generateReport();

    updateGoal();

    monthlyComparison();

    generateInsights();
}

budgetInput.value =
monthlyBudget || "";

render();

const resetBtn =
document.getElementById("resetBtn");

resetBtn.addEventListener("click", () => {

    const confirmReset =
    confirm(
        "This will permanently delete all transactions, reports, charts, and budget data. Continue?"
    );

    if(!confirmReset) return;

    transactions = [];

    monthlyBudget = 0;

    localStorage.removeItem("transactions");
    localStorage.removeItem("monthlyBudget");

    budgetInput.value = "";

    render();

    alert("All data has been cleared successfully.");
});

let savingsGoal =
localStorage.getItem("goal") || 0;
goalInput.value = savingsGoal;

const goalInput =
document.getElementById("goalInput");

const saveGoalBtn =
document.getElementById("saveGoalBtn");

saveGoalBtn.addEventListener(
    "click",
    ()=>{

        savingsGoal =
        Number(goalInput.value);

        localStorage.setItem(
            "goal",
            savingsGoal
        );

        render();
    }
);

function updateGoal(){

    let income = 0;
    let expense = 0;

    transactions.forEach(t=>{

        if(t.type==="income"){
            income+=t.amount;
        }else{
            expense+=t.amount;
        }

    });

    const savings =
    income-expense;

    const percent =
    Math.min(
        (savings/savingsGoal)*100,
        100
    );

    document.getElementById(
        "goalProgress"
    ).style.width =
    `${percent}%`;

    document.getElementById(
        "goalText"
    ).innerHTML =
    `₹${savings} / ₹${savingsGoal}`;
}

function monthlyComparison(){

    const now =
    new Date();

    const currentMonth =
    now.toISOString().slice(0,7);

    const previousMonth =
    new Date(
        now.getFullYear(),
        now.getMonth()-1,
        1
    ).toISOString().slice(0,7);

    let current = 0;
    let previous = 0;

    transactions.forEach(t=>{

        if(t.type==="expense"){

            if(
                t.date.startsWith(
                    currentMonth
                )
            ){
                current+=t.amount;
            }

            if(
                t.date.startsWith(
                    previousMonth
                )
            ){
                previous+=t.amount;
            }
        }
    });

    document.getElementById(
        "comparisonBox"
    ).innerHTML =

    `
    Current Month: ₹${current}<br>
    Previous Month: ₹${previous}
    `;
}

function generateInsights(){

    let highest = {};

    transactions.forEach(t=>{

        if(t.type==="expense"){

            highest[t.category] =
            (highest[t.category]||0)
            + t.amount;
        }
    });

    let category = "None";
    let amount = 0;

    Object.entries(highest)
    .forEach(([key,val])=>{

        if(val>amount){

            category=key;
            amount=val;
        }
    });

    document.getElementById(
        "insights"
    ).innerHTML =

    `
    📌 Highest Spending Category:
    ${category} (₹${amount})
    `;
}