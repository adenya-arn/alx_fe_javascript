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

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
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
  createAddQuoteForm();
  const lastQuote = sessionStorage.getItem('lastQuote');
  if (lastQuote) {
    const quote = JSON.parse(lastQuote);
    document.getElementById('quoteDisplay').textContent = `"${quote.text}" — ${quote.category}`;
  } else {
    showRandomQuote();
  }
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

function syncQuotesWithServer() {
  fetch('https://jsonplaceholder.typicode.com/posts') // Simulated server fetch
    .then(res => res.json())
    .then(data => {
      const newQuotes = data.slice(0, 5).map(post => ({
        text: post.title,
        category: 'Server'
      }));
      quotes = [...newQuotes, ...quotes];
      saveQuotes();
      populateCategories();
      alert('Quotes synced with server!');
    })
    .catch(err => {
      alert('Failed to sync with server.');
      console.error(err);
    });
}

function createAddQuoteForm() {
  const formDiv = document.createElement('div');

  const inputText = document.createElement('input');
  inputText.id = 'newQuoteText';
  inputText.placeholder = 'Enter a new quote';
  formDiv.appendChild(inputText);

  const inputCategory = document.createElement('input');
  inputCategory.id = 'newQuoteCategory';
  inputCategory.placeholder = 'Enter quote category';
  formDiv.appendChild(inputCategory);

  const addBtn = document.createElement('button');
  addBtn.textContent = 'Add Quote';
  addBtn.onclick = addQuote;
  formDiv.appendChild(addBtn);

  document.body.appendChild(formDiv);
}
const fetchQuotesFromServer = syncQuotesWithServer;