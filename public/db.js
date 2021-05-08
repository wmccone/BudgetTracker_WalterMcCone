let db;
// Create a new db request for a database.
const request = indexedDB.open('IndexedBudget');

function checkDatabase() {

  // Open a transaction on the StoredBudget db
  let transaction = db.transaction(['StoredBudget'], 'readwrite');

  // access the StoredBudget object
  const store = transaction.objectStore('StoredBudget');

  // Get all records from store and set to a variable
  const getData = store.getAll();

  // If the request was successful add the items back into the store when we are back online
  getData.onsuccess = function () {
 
    if (getData.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getData.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((res) => {
          // If our returned response is not empty
          if (res.length !== 0) {
            // Open another transaction to StoredBudget with the ability to read and write
            transaction = db.transaction(['StoredBudget'], 'readwrite');

            // Assign the current store to a variable
            const currentStore = transaction.objectStore('StoredBudget');

            // Clear existing entries because our bulk add was successful
            currentStore.clear();
          }
        });
    }
  };
}

//Checks if the app is online before adding anything
request.onsuccess = function (e) {
  db = e.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

const saveRecord = (record) => {
  // Create a transaction on the StoredBudget db with readwrite access
  const transaction = db.transaction(['StoredBudget'], 'readwrite');

  // Access the StoredBudget object store and add the record to it
  const store = transaction.objectStore('StoredBudget');
  store.add(record);
};

// Listen for app to come back online
window.addEventListener('online', checkDatabase);
