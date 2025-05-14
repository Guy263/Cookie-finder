// Initialize balance in localStorage if it doesn't exist
if (localStorage.getItem('userBalance') === null) {
  localStorage.setItem('userBalance', '100.00'); // Default starting balance
}

// Function to get current balance
function getBalance() {
  return parseFloat(localStorage.getItem('userBalance') || '0.00');
}

// Function to deduct from balance
function deductBalance(amount) {
  console.log("Deducting amount:", amount);
  
  // Ensure amount is a number
  amount = parseFloat(amount);
  if (isNaN(amount)) {
    console.error("Invalid amount to deduct:", amount);
    return getBalance().toFixed(2);
  }
  
  var currentBalance = getBalance();
  console.log("Current balance before deduction:", currentBalance);
  
  var newBalance = Math.max(0, currentBalance - amount).toFixed(2);
  console.log("New balance after deduction:", newBalance);
  
  // Store as string
  localStorage.setItem('userBalance', newBalance);
  
  // Update balance display if it exists
  updateBalanceDisplay(newBalance);
  
  return newBalance;
}

// Function to add to balance
function addBalance(amount) {
  // Ensure amount is a number
  amount = parseFloat(amount);
  if (isNaN(amount)) {
    console.error("Invalid amount to add:", amount);
    return getBalance().toFixed(2);
  }
  
  var currentBalance = getBalance();
  var newBalance = (currentBalance + amount).toFixed(2);
  localStorage.setItem('userBalance', newBalance);
  
  // Update balance display
  updateBalanceDisplay(newBalance);
  
  return newBalance;
}

// Helper function to update balance display
function updateBalanceDisplay(balance) {
  var balanceDisplay = document.getElementById('userBalance');
  if (balanceDisplay) {
    balanceDisplay.textContent = 'Balance: $' + balance;
    console.log("Updated balance display to:", balanceDisplay.textContent);
  } else {
    console.log("Balance display element not found");
  }
}

// Update balance display when page loads
document.addEventListener('DOMContentLoaded', function() {
  updateBalanceDisplay(getBalance().toFixed(2));
  console.log("DOM loaded, current balance in localStorage:", localStorage.getItem('userBalance'));
});
