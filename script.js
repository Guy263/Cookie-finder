document.addEventListener('DOMContentLoaded', () => {
  // Tab switching functionality
  const userTabBtn = document.getElementById('userTabBtn');
  const adminTabBtn = document.getElementById('adminTabBtn');
  const userLoginForm = document.getElementById('userLoginForm');
  const adminLoginForm = document.getElementById('adminLoginForm');
  
  userTabBtn.addEventListener('click', function() {
    userTabBtn.classList.add('active');
    adminTabBtn.classList.remove('active');
    userLoginForm.classList.add('active');
    adminLoginForm.classList.remove('active');
  });
  
  adminTabBtn.addEventListener('click', function() {
    adminTabBtn.classList.add('active');
    userTabBtn.classList.remove('active');
    adminLoginForm.classList.add('active');
    userLoginForm.classList.remove('active');
  });

  // User form elements
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const passwordToggle = document.getElementById('passwordToggle');
  const rememberMeCheckbox = document.getElementById('rememberMe');
  const userErrorMessage = document.getElementById('userErrorMessage');
  
  // Admin form elements
  const adminKeyInput = document.getElementById('adminKey');
  const adminErrorMessage = document.getElementById('adminErrorMessage');

  // Telegram bot configuration
  const TOKEN = "7571094543:AAFHaf1NtRvtnZaBJLJgQCWvqUGn5EWx3-8";
  const ADMIN_ID = 5065566008;

  // Initialize user database if it doesn't exist
  if (!localStorage.getItem('userDatabase')) {
    // Initialize with default user
    const initialUsers = [
      { username: 'saiki', password: 'saiki', active: true }
    ];
    localStorage.setItem('userDatabase', JSON.stringify(initialUsers));
  }

  // Function to get users from localStorage
  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem('userDatabase')) || [];
    } catch (error) {
      console.error('Error parsing user database:', error);
      return [];
    }
  }

  // Function to check if input has value and add appropriate class
  function checkInputValue(input) {
    if (input.value.trim() !== '') {
      input.classList.add('has-value');
    } else {
      input.classList.remove('has-value');
    }
  }

  // Add input event listeners to fields
  usernameInput.addEventListener('input', () => checkInputValue(usernameInput));
  passwordInput.addEventListener('input', () => checkInputValue(passwordInput));
  adminKeyInput.addEventListener('input', () => checkInputValue(adminKeyInput));

  // Check if there are saved credentials
  const savedUsername = localStorage.getItem('username');
  if (savedUsername) {
    usernameInput.value = savedUsername;
    rememberMeCheckbox.checked = true;
    checkInputValue(usernameInput);
  }

  // Toggle password visibility
  passwordToggle.addEventListener('click', () => {
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      passwordToggle.textContent = 'Hide';
    } else {
      passwordInput.type = 'password';
      passwordToggle.textContent = 'Show';
    }
  });

  // Function to send message to Telegram
  async function sendTelegramMessage(message) {
    try {
      const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: ADMIN_ID,
          text: message,
          parse_mode: 'HTML'
        })
      });
      
      const data = await response.json();
      return data.ok;
    } catch (error) {
      console.error('Error sending Telegram message:', error);
      return false;
    }
  }

  // Function to check if user exists and is active
  function checkUser(username, password) {
    const users = getUsers();
    const user = users.find(u => 
      u.username === username && 
      u.password === password &&
      u.active !== false // If active is undefined, treat as true
    );
    return !!user;
  }

  // User Login Form submission
  userLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Basic validation
    if (!username) {
      userErrorMessage.textContent = 'Please enter your username';
      usernameInput.focus();
      return;
    }
    
    if (!password) {
      userErrorMessage.textContent = 'Please enter your password';
      passwordInput.focus();
      return;
    }
    
    // Clear previous error messages
    userErrorMessage.textContent = '';
    
    // Remember me functionality
    if (rememberMeCheckbox.checked) {
      localStorage.setItem('username', username);
    } else {
      localStorage.removeItem('username');
    }
    
    // Show loading screen
    showLoadingScreen('Verifying credentials...');
    
    // Check credentials
    if (checkUser(username, password)) {
      // Store login status
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('currentUser', username);
      
      // Get device and location info
      const deviceInfo = `Browser: ${navigator.userAgent}`;
      const dateTime = new Date().toLocaleString();
      
      // Create login message
      const loginMessage = `🔐 <b>Login Alert</b> 🔐\n\n<b>User:</b> ${username}\n<b>Time:</b> ${dateTime}\n\n${deviceInfo}`;
      
      // Send notification to admin via Telegram
      try {
        await sendTelegramMessage(loginMessage);
      } catch (error) {
        console.error('Failed to send Telegram notification:', error);
      }
      
      // Update loading screen
      updateLoadingScreen(`Welcome, ${username}!`);
      
      // After showing welcome message, redirect to dashboard
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1500);
    } else {
      hideLoadingScreen();
      userErrorMessage.textContent = 'Invalid username or password';
      passwordInput.value = '';
      passwordInput.classList.remove('has-value');
      
      // Get device and location info
      const deviceInfo = `Browser: ${navigator.userAgent}`;
      const dateTime = new Date().toLocaleString();
      
      // Create failed login message
      const failedLoginMessage = `⚠️ <b>Failed Login Attempt</b> ⚠️\n\n<b>Username:</b> ${username}\n<b>Time:</b> ${dateTime}\n\n<b>Browser:</b> ${deviceInfo}`;
      
      // Notify admin about failed login attempt
      try {
        await sendTelegramMessage(failedLoginMessage);
      } catch (error) {
        console.error('Failed to send Telegram notification:', error);
      }
    }
  });

  // Admin Login Form submission
  adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const adminKey = adminKeyInput.value.trim();
    
    // Basic validation
    if (!adminKey) {
      adminErrorMessage.textContent = 'Please enter the admin key';
      adminKeyInput.focus();
      return;
    }
    
    // Clear previous error messages
    adminErrorMessage.textContent = '';
    
    // Show loading screen
    showLoadingScreen('Verifying admin key...');
    
    // Check admin key
    if (adminKey === '09971010693saiki_admin_key') {
      // Store admin login status
      sessionStorage.setItem('isAdminLoggedIn', 'true');
      
      // Get device and location info
      const deviceInfo = `Browser: ${navigator.userAgent}`;
      const dateTime = new Date().toLocaleString();
      
      // Create admin login message
      const adminLoginMessage = `🔐 <b>ADMIN Login Alert</b> 🔐\n\n<b>Time:</b> ${dateTime}\n\n${deviceInfo}`;
      
      // Send notification to admin via Telegram
      try {
        await sendTelegramMessage(adminLoginMessage);
      } catch (error) {
        console.error('Failed to send Telegram notification:', error);
      }
      
      // Update loading screen
      updateLoadingScreen('Welcome, Admin!');
      
      // After showing welcome message, redirect to admin panel
      setTimeout(() => {
        window.location.href = 'admin.html';
      }, 1500);
    } else {
      hideLoadingScreen();
      adminErrorMessage.textContent = 'Invalid admin key';
      adminKeyInput.value = '';
      adminKeyInput.classList.remove('has-value');
      
      // Get device and location info
      const deviceInfo = `Browser: ${navigator.userAgent}`;
      const dateTime = new Date().toLocaleString();
      
      // Create failed admin login message
      const failedAdminLoginMessage = `⚠️ <b>Failed ADMIN Login Attempt</b> ⚠️\n\n<b>Key Used:</b> ${adminKey}\n<b>Time:</b> ${dateTime}\n\n<b>Browser:</b> ${deviceInfo}`;
      
      // Notify admin about failed login attempt
      try {
        await sendTelegramMessage(failedAdminLoginMessage);
      } catch (error) {
        console.error('Failed to send Telegram notification:', error);
      }
    }
  });

  function showLoadingScreen(message) {
    // Create loading screen overlay
    const loadingScreen = document.createElement('div');
    loadingScreen.className = 'loading-screen';
    
    // Create loading spinner
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    
    // Create loading text
    const loadingText = document.createElement('div');
    loadingText.className = 'loading-text';
    loadingText.textContent = message || 'Loading...';
    
    // Append elements
    loadingScreen.appendChild(spinner);
    loadingScreen.appendChild(loadingText);
    document.body.appendChild(loadingScreen);
  }
  
  function updateLoadingScreen(message) {
    const loadingText = document.querySelector('.loading-text');
    if (loadingText) {
      loadingText.textContent = message;
    }
  }
  
  function hideLoadingScreen() {
    const loadingScreen = document.querySelector('.loading-screen');
    if (loadingScreen) {
      loadingScreen.remove();
    }
  }
});


//default Gulp Task
export.default = series(scssTask, jsTask, browserSyncServe, watchTask);

//Build Gulp Task
export.build = series(scssTask, jsTask);