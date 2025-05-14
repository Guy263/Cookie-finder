document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  var isLoggedIn = sessionStorage.getItem('isLoggedIn');
  var currentUser = sessionStorage.getItem('currentUser');
  
  if (!isLoggedIn) {
    // Redirect to login page if not logged in
    window.location.href = 'index.html';
    return;
  }
  
  // Update user greeting
  var userGreeting = document.getElementById('userGreeting');
  if (userGreeting && currentUser) {
    userGreeting.textContent = 'Welcome, ' + currentUser;
  }
  
  // Load and display user balance
  loadUserBalance();
  
  // Handle logout
  var logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.onclick = function() {
      sessionStorage.removeItem('isLoggedIn');
      sessionStorage.removeItem('currentUser');
      window.location.href = 'index.html';
    };
  }
  
  // Handle admin link
  var adminLink = document.getElementById('adminLink');
  if (adminLink) {
    adminLink.onclick = function(e) {
      e.preventDefault(); // Prevent default behavior
      window.location.href = 'admin.html';
    };
  }
  
  // Game selection handling
  var gameSelect = document.getElementById('gameSelect');
  var gameInfo = document.getElementById('gameInfo');
  
  if (gameSelect) {
    gameSelect.onchange = function() {
      var selectedGame = gameSelect.value;
      
      if (selectedGame === 'cod') {
        gameInfo.innerHTML = '<h4>Call of Duty Garena</h4><p>Generate game tokens and session cookies for Call of Duty Garena.</p><ul><li>Account authentication</li><li>Session management</li><li>Server selection</li></ul>';
      } else if (selectedGame === 'ml') {
        gameInfo.innerHTML = '<h4>Mobile Legends</h4><p>Generate game tokens and session cookies for Mobile Legends.</p><ul><li>Account verification</li><li>Server access</li><li>Match history tracking</li></ul>';
      }
    };
  }
  
  // Cookie selection handling
  var cookieSelect = document.getElementById('cookieSelect');
  var cookieInfo = document.getElementById('cookieInfo');
  
  if (cookieSelect) {
    cookieSelect.onchange = function() {
      var selectedCookie = cookieSelect.value;
      
      if (selectedCookie === 'cookie') {
        cookieInfo.innerHTML = '<h4>Standard Cookie</h4><p>Generate standard browser cookies for authentication.</p><ul><li>Session cookies</li><li>Persistent cookies</li><li>Secure cookies</li><li><strong>Cost: $50.00</strong></li></ul>';
      } else if (selectedCookie === 'datadome') {
        cookieInfo.innerHTML = '<h4>DataDome</h4><p>Generate DataDome cookies for bot protection bypass.</p><ul><li>Anti-bot verification</li><li>Session validation</li><li>Request authentication</li><li><strong>Cost: $10.00</strong></li></ul>';
      }
    };
  }
  
  // Generate button functionality
  var generateBtn = document.getElementById('generateBtn');
  var resultContent = document.getElementById('resultContent');
  
  if (generateBtn) {
    generateBtn.onclick = function() {
      var selectedGame = gameSelect ? gameSelect.value : '';
      var selectedCookie = cookieSelect ? cookieSelect.value : '';
      
      if (!selectedGame && !selectedCookie) {
        resultContent.innerHTML = '<p class="error-message">Please select a game or cookie type first.</p>';
        return;
      }
      
      // Set cost based on selection
      var cost = 0;
      if (selectedCookie === 'cookie') {
        cost = 80.00;
      } else if (selectedCookie === 'datadome') {
        cost = 10.00; // Updated cost for DataDome to $50
      } else {
        cost = 10.00; // Default cost for game selections
      }
      
      console.log("Selected option cost:", cost);
      
      // Check if user has enough balance
      var currentBalance = getBalance();
      console.log("Current balance:", currentBalance);
      
      if (currentBalance < cost) {
        resultContent.innerHTML = '<p class="error-message">Insufficient balance. You need $' + cost.toFixed(2) + ' to generate this.</p>';
        return;
      }
      
      // For DataDome tokens, check availability before proceeding
      if (selectedCookie === 'datadome') {
        // Check if tokens are available without consuming them yet
        var hasTokens = checkDataDomeTokenAvailability();
        if (!hasTokens) {
          resultContent.innerHTML = '<p class="error-message">No DataDome tokens available for your account. Please contact admin.</p>';
          return;
        }
      } else if (selectedCookie === 'cookie') {
        // Check if premium keys are available
        var hasPremiumKeys = checkPremiumKeyAvailability();
        if (!hasPremiumKeys) {
          resultContent.innerHTML = '<p class="error-message">No Premium keys available. Please contact admin.</p>';
          return;
        }
      }
      
      // Show loading state
      resultContent.innerHTML = '<p class="loading-message">Generating... Please wait</p>';
      
      // Simulate API call with timeout
      setTimeout(function() {
        console.log("About to deduct balance:", cost);
        
        try {
          // Deduct balance - using the correct function name
          var newBalance = deductBalance(cost);
          console.log("New balance after deduction:", newBalance);
          
          // Generate content based on selection
          var generatedContent = '';
          var usedKey = '';
          
          if (selectedCookie === 'datadome') {
            // Get and remove DataDome token from user's stored tokens
            var result = getUserDataDomeToken(currentUser);
            if (!result.token) {
              resultContent.innerHTML = '<p class="error-message">No DataDome token available for your account. Please contact admin.</p>';
              // Refund the balance since no token was provided
              refundBalance(cost);
              return;
            }
            generatedContent = result.token;
            usedKey = result.token;
          } else if (selectedCookie === 'cookie') {
            // Use the generateStandardCookie function for standard cookies
            var result = generateStandardCookie();
            if (!result.key) {
              resultContent.innerHTML = '<p class="error-message">No Premium key available. Please contact admin.</p>';
              // Refund the balance since no token was provided
              refundBalance(cost);
              return;
            }
            generatedContent = result.key;
            usedKey = result.key;
          } else {
            var result = generateGenericToken(selectedGame);
            if (!result.token) {
              resultContent.innerHTML = '<p class="error-message">Failed to generate token. Please try again later.</p>';
              // Refund the balance since no token was provided
              refundBalance(cost);
              return;
            }
            generatedContent = result.token;
            usedKey = result.token;
          }
          
          // Log the usage for admin tracking
          logKeyUsage(currentUser, selectedCookie || selectedGame, usedKey, cost);
          
          // Show success message with the generated content
          resultContent.innerHTML = '<div class="success-message">Successfully generated! $' + 
            cost.toFixed(2) + ' has been deducted from your balance.</div><pre>' +
            generatedContent + '</pre>';
            
          // Force refresh the balance display
          loadUserBalance();
        } catch (error) {
          console.error("Error deducting balance:", error);
          resultContent.innerHTML = '<p class="error-message">Error processing your request: ' + error.message + '</p>';
        }
      }, 1500);
    };
  }
  
  // Refresh button functionality
  var refreshBtn = document.getElementById('refreshBtn');
  
  if (refreshBtn) {
    refreshBtn.onclick = function() {
      if (gameSelect) gameSelect.selectedIndex = 0;
      if (cookieSelect) cookieSelect.selectedIndex = 0;
      
      if (gameInfo) gameInfo.innerHTML = '<p>Select a game to see available tools</p>';
      if (cookieInfo) cookieInfo.innerHTML = '<p>Select a cookie type to see options</p>';
      
      if (resultContent) {
        resultContent.innerHTML = '<p class="placeholder-text">Generated content will appear here</p>';
      }
    };
  }
  
  // Copy button functionality
  var copyBtn = document.getElementById('copyBtn');
  
  if (copyBtn) {
    copyBtn.onclick = function() {
      var content = resultContent.textContent;
      
      if (content && !content.includes('Generated content will appear here')) {
        navigator.clipboard.writeText(content)
          .then(function() {
            var originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            
            setTimeout(function() {
              copyBtn.innerHTML = originalText;
            }, 2000);
          })
          .catch(function(err) {
            console.error('Failed to copy: ', err);
          });
      }
    };
  }
  
  // Add click event to sidebar menu items
  var menuItems = document.querySelectorAll('.sidebar nav ul li');
  for (var i = 0; i < menuItems.length; i++) {
    menuItems[i].onclick = function() {
      for (var j = 0; j < menuItems.length; j++) {
        menuItems[j].classList.remove('active');
      }
      this.classList.add('active');
    };
  }
  
  // Make all navigation links clickable
  var navLinks = document.querySelectorAll('a');
  navLinks.forEach(function(link) {
    // Remove any event listeners that might be preventing clicks
    link.onclick = null;
    
    // If it's a special link with an ID, we can add specific behavior
    if (link.id === 'adminLink') {
      link.onclick = function(e) {
        e.preventDefault();
        window.location.href = 'admin.html';
      };
    }
  });
  
  // Helper functions
  // Function to generate generic token for game selections
// Function to generate generic token for game selections
function generateGenericToken(gameType) {
  var currentUser = sessionStorage.getItem('currentUser');
  if (!currentUser) return { token: null };
  
  try {
    var users = JSON.parse(localStorage.getItem('userDatabase')) || [];
    var userIndex = users.findIndex(u => u.username === currentUser);
    
    if (userIndex === -1) return { token: null };
    
    var user = users[userIndex];
    
    // Generate a unique token based on game type instead of using DataDome tokens
    var timestamp = new Date().getTime();
    var randomPart = Math.random().toString(36).substring(2, 10);
    var token = `${gameType}_${timestamp}_${randomPart}`;
    
    return { token: token, source: 'generated', removed: false };
  } catch (error) {
    console.error('Error generating token:', error);
    return { token: null };
  }
}

// Updated function to use the most recently added premium key from admin panel
function generateStandardCookie() {
  // First, try to get the most recently added premium key from localStorage
  var lastAddedPremiumKey = localStorage.getItem('lastAddedPremiumKey');
  
  if (lastAddedPremiumKey && lastAddedPremiumKey.trim() !== '') {
    console.log("Using most recently added premium key");
    
    // Find the user who has this premium key and remove it
    try {
      var users = JSON.parse(localStorage.getItem('userDatabase')) || [];
      var keyRemoved = false;
      
      for (var i = 0; i < users.length; i++) {
        var user = users[i];
        
        if (user.premium) {
          if (Array.isArray(user.premium)) {
            var keyIndex = user.premium.indexOf(lastAddedPremiumKey);
            if (keyIndex !== -1) {
              // Remove the key from the array
              user.premium.splice(keyIndex, 1);
              keyRemoved = true;
              break;
            }
          } else if (typeof user.premium === 'string' && user.premium === lastAddedPremiumKey) {
            // Convert to empty array
            user.premium = [];
            keyRemoved = true;
            break;
          }
        }
      }
      
      if (keyRemoved) {
        // Save the updated user database
        localStorage.setItem('userDatabase', JSON.stringify(users));
        // Clear the lastAddedPremiumKey since we've used it
        localStorage.removeItem('lastAddedPremiumKey');
      }
      
      return { key: lastAddedPremiumKey, source: 'localStorage', removed: keyRemoved };
    } catch (error) {
      console.error('Error removing premium key:', error);
      return { key: lastAddedPremiumKey, source: 'localStorage', removed: false };
    }
  }
  
  // If no premium key was found in localStorage, try to find one in the user database
  var currentUser = sessionStorage.getItem('currentUser');
  if (!currentUser) return { key: null };
  
  try {
    // Get all users to find premium keys
    var users = JSON.parse(localStorage.getItem('userDatabase')) || [];
    
    // First check if the current user has premium keys
    var userIndex = users.findIndex(u => u.username === currentUser);
    
    if (userIndex !== -1 && users[userIndex].premium) {
      var user = users[userIndex];
      
      if (Array.isArray(user.premium) && user.premium.length > 0) {
        // Get the first premium key and remove it
        var key = user.premium.shift();
        
        // Save the updated user database
        localStorage.setItem('userDatabase', JSON.stringify(users));
        
        return { key: key, source: 'user', removed: true };
      } else if (typeof user.premium === 'string' && user.premium.trim() !== '') {
        // Get the premium key and clear it
        var key = user.premium;
        user.premium = [];
        
        // Save the updated user database
        localStorage.setItem('userDatabase', JSON.stringify(users));
        
        return { key: key, source: 'user', removed: true };
      }
    }
    
    // If current user doesn't have premium keys, look for any premium key in the database
    for (var i = 0; i < users.length; i++) {
      var user = users[i];
      
      if (user.premium) {
        if (Array.isArray(user.premium) && user.premium.length > 0) {
          // Get the first premium key and remove it
          var key = user.premium.shift();
          
          // Save the updated user database
          localStorage.setItem('userDatabase', JSON.stringify(users));
          
          return { key: key, source: 'otherUser', removed: true };
        } else if (typeof user.premium === 'string' && user.premium.trim() !== '') {
          // Get the premium key and clear it
          var key = user.premium;
          user.premium = [];
          
          // Save the updated user database
          localStorage.setItem('userDatabase', JSON.stringify(users));
          
          return { key: key, source: 'otherUser', removed: true };
        }
      }
    }
    
    // Return null instead of falling back to DataDome token
    return { key: null };
  } catch (error) {
    console.error('Error getting premium key:', error);
    return { key: null };
  }
}

// Function to get DataDome token for a user
function getUserDataDomeToken(username) {
  if (!username) {
    username = sessionStorage.getItem('currentUser');
    if (!username) return { token: null };
  }
  
  try {
    const users = JSON.parse(localStorage.getItem('userDatabase') || '[]');
    const userIndex = users.findIndex(u => u.username === username);
    
    if (userIndex === -1) {
      console.error('User not found:', username);
      return { token: null };
    }
    
    const user = users[userIndex];
    
    // Check if user has DataDome tokens
    if (!user.datadome || 
        (Array.isArray(user.datadome) && user.datadome.length === 0) ||
        (typeof user.datadome === 'string' && user.datadome.trim() === '')) {
      console.warn('No DataDome tokens found for user:', username);
      return { token: null };
    }
    
    // Convert to array format if it's a string (legacy format)
    if (typeof user.datadome === 'string') {
      user.datadome = [user.datadome];
    }
    
    // Get the first token and remove it from the array
    var token = user.datadome.shift();
    
    // Save the updated user database
    localStorage.setItem('userDatabase', JSON.stringify(users));
    
    return { token: token, source: 'datadome', removed: true };
  } catch (error) {
    console.error('Error getting DataDome token:', error);
    return { token: null };
  }
}

 
 // Function to check if DataDome tokens are available without consuming them
 function checkDataDomeTokenAvailability() {
   var currentUser = sessionStorage.getItem('currentUser');
   if (!currentUser) return false;
   
   try {
     var users = JSON.parse(localStorage.getItem('userDatabase')) || [];
     var user = users.find(u => u.username === currentUser);
     
     if (!user) return false;
     
     // Check if user has DataDome tokens
     if (!user.datadome) return false;
     
     // Check if it's an array with elements or a non-empty string
     if (Array.isArray(user.datadome)) {
       return user.datadome.length > 0;
     } else {
       return typeof user.datadome === 'string' && user.datadome.trim() !== '';
     }
   } catch (error) {
     console.error('Error checking DataDome token availability:', error);
     return false;
   }
 }
 
 // Function to check if Premium keys are available without consuming them
 function checkPremiumKeyAvailability() {
   // First check if there's a recently added premium key
   var lastAddedPremiumKey = localStorage.getItem('lastAddedPremiumKey');
   if (lastAddedPremiumKey && lastAddedPremiumKey.trim() !== '') {
     return true;
   }
   
   var currentUser = sessionStorage.getItem('currentUser');
   if (!currentUser) return false;
   
   try {
     var users = JSON.parse(localStorage.getItem('userDatabase')) || [];
     
     // Check if current user has premium keys
     var user = users.find(u => u.username === currentUser);
     if (user && user.premium) {
       if (Array.isArray(user.premium) && user.premium.length > 0) {
         return true;
       } else if (typeof user.premium === 'string' && user.premium.trim() !== '') {
         return true;
       }
     }
     
     // Check if any user has premium keys
     for (var i = 0; i < users.length; i++) {
       var user = users[i];
       if (user.premium) {
         if (Array.isArray(user.premium) && user.premium.length > 0) {
           return true;
         } else if (typeof user.premium === 'string' && user.premium.trim() !== '') {
           return true;
         }
       }
     }
     
     // Fall back to checking if current user has DataDome tokens
     user = users.find(u => u.username === currentUser);
     if (user && user.datadome) {
       if (Array.isArray(user.datadome) && user.datadome.length > 0) {
         return true;
       } else if (typeof user.datadome === 'string' && user.datadome.trim() !== '') {
         return true;
       }
     }
     
     return false;
   } catch (error) {
     console.error('Error checking premium key availability:', error);
     return false;
   }
 }

  
  // Function to load and display user balance
  function loadUserBalance() {
    var balanceDisplay = document.getElementById('userBalance');
    if (balanceDisplay) {
      var balance = getBalance();
      balanceDisplay.textContent = 'Balance: $' + balance.toFixed(2);
    }
  }
      
  // Function to get user balance from the user database
  function getBalance() {
    var currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) return 0;
    
    try {
      var users = JSON.parse(localStorage.getItem('userDatabase')) || [];
      var user = users.find(u => u.username === currentUser);
      
      if (user && typeof user.balance !== 'undefined') {
        return parseFloat(user.balance);
      } else {
        console.warn('User found but balance not set');
        return 0;
      }
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  }
  
  // Function to deduct balance from user
  function deductBalance(amount) {
    var currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) throw new Error('User not logged in');
    
    try {
      var users = JSON.parse(localStorage.getItem('userDatabase')) || [];
      var userIndex = users.findIndex(u => u.username === currentUser);
      
      if (userIndex === -1) throw new Error('User not found');
      
      // Initialize balance if it doesn't exist
      if (typeof users[userIndex].balance === 'undefined') {
        users[userIndex].balance = 0;
      }
      
      // Check if user has enough balance
      if (users[userIndex].balance < amount) {
        throw new Error('Insufficient balance');
      }
      
      // Deduct the amount
      users[userIndex].balance = parseFloat((users[userIndex].balance - amount).toFixed(2));
      
      // Save updated users to localStorage
      localStorage.setItem('userDatabase', JSON.stringify(users));
      
      // Update balance display
      var balanceDisplay = document.getElementById('userBalance');
      if (balanceDisplay) {
        balanceDisplay.textContent = 'Balance: $' + users[userIndex].balance.toFixed(2);
      }
      
      return users[userIndex].balance;
    }
    catch (error) {
      console.error('Error deducting balance:', error);
      throw error;
    }
  }
      
  // Function to refund balance in case of error
  function refundBalance(amount) {
    var currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) return;
    
    try {
      var users = JSON.parse(localStorage.getItem('userDatabase')) || [];
      var userIndex = users.findIndex(u => u.username === currentUser);
      
      if (userIndex === -1) return;
      
      // Add the amount back
      if (typeof users[userIndex].balance === 'undefined') {
        users[userIndex].balance = 0;
      }
      
      users[userIndex].balance = parseFloat((users[userIndex].balance + amount).toFixed(2));
      
      // Save updated users to localStorage
      localStorage.setItem('userDatabase', JSON.stringify(users));
      
      // Update balance display
      var balanceDisplay = document.getElementById('userBalance');
      if (balanceDisplay) {
        balanceDisplay.textContent = 'Balance: $' + users[userIndex].balance.toFixed(2);
      }
      
      return users[userIndex].balance;
    }
    catch (error) {
      console.error('Error refunding balance:', error);
    }
  }
  
  // Function to log key usage for admin tracking
  function logKeyUsage(username, keyType, keyValue, cost) {
    if (!username || !keyType || !keyValue) return;
    
    try {
      // Get existing logs or initialize new array
      var usageLogs = JSON.parse(localStorage.getItem('keyUsageLogs')) || [];
      
      // Add new log entry
      usageLogs.push({
        username: username,
        keyType: keyType,
        keyValue: keyValue,
        cost: cost,
        timestamp: new Date().toISOString()
      });
      
      // Save logs back to localStorage
      localStorage.setItem('keyUsageLogs', JSON.stringify(usageLogs));
      
      console.log('Key usage logged successfully');
    } catch (error) {
      console.error('Error logging key usage:', error);
    }
  }
  
  // Make balance functions available globally
  window.getBalance = getBalance;
  window.deductBalance = deductBalance;
  window.refundBalance = refundBalance;
  window.checkDataDomeTokenAvailability = checkDataDomeTokenAvailability;
  window.logKeyUsage = logKeyUsage; // Add this line
  
  console.log("Dashboard.js loaded with balance management functions");
});
