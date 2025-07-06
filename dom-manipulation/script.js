
let quotes = [];

function loadQuotes() {
  const saved = localStorage.getItem('quotes');
  if (saved) {
    quotes = JSON.parse(saved);
  } else {
    quotes = [
      { text: "The best way to predict the future is to create it.", category: "Motivation" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" }
    ];
  }
  populateCategories();
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function showRandomQuote() {
  const selectedCategory = localStorage.getItem('selectedCategory') || 'all';
  const filtered = selectedCategory === 'all'
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) return;
  const quote = filtered[Math.floor(Math.random() * filtered.length)];
  document.getElementById('quoteDisplay').textContent = `"${quote.text}" — ${quote.category}`;
  sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();
  if (!text || !category) return alert('Please enter both quote and category.');

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  postQuoteToServer(newQuote);

  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
}

function populateCategories() {
  const select = document.getElementById('categoryFilter');
  const current = select.value;
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];

  select.innerHTML = '<option value="all">All Categories</option>';
  uniqueCategories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  select.value = current || localStorage.getItem('selectedCategory') || 'all';
}

function filterQuotes() {
  const category = document.getElementById('categoryFilter').value;
  localStorage.setItem('selectedCategory', category);
  showRandomQuote();
}

document.getElementById('newQuote').addEventListener('click', showRandomQuote);

document.addEventListener('DOMContentLoaded', () => {
  loadQuotes();
  const lastQuote = sessionStorage.getItem('lastQuote');
  if (lastQuote) {
    const quote = JSON.parse(lastQuote);
    document.getElementById('quoteDisplay').textContent = `"${quote.text}" — ${quote.category}`;
  } else {
    showRandomQuote();
  }
  setInterval(syncQuotes, 15000); // Periodically sync with server every 15 seconds
});

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        alert('Quotes imported successfully!');
      }
    } catch (err) {
      alert('Failed to import JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
}

async function fetchQuotesFromServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const data = await response.json();
    return data.slice(0, 5).map(post => ({ text: post.title, category: 'Server' }));
  } catch (err) {
    console.error('Fetch error:', err);
    return [];
  }
}

async function postQuoteToServer(quote) {
  try {
    await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quote)
    });
  } catch (err) {
    console.error('Post error:', err);
  }
}

async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  const newTexts = serverQuotes.map(q => q.text);

  const isNew = serverQuotes.some(sq => !quotes.some(lq => lq.text === sq.text));

  if (isNew) {
    const notification = document.createElement('div');
    notification.textContent = 'New quotes fetched from server.';
    notification.style.background = '#28a745';
    notification.style.color = 'white';
    notification.style.padding = '10px';
    notification.style.marginTop = '10px';
    document.body.prepend(notification);

    setTimeout(() => notification.remove(), 5000);

    quotes = [...serverQuotes, ...quotes.filter(q => !newTexts.includes(q.text))];
    saveQuotes();
    populateCategories();
    showRandomQuote();
  }
}