document.addEventListener("DOMContentLoaded", async function () {
  const searchInput = document.querySelector(".search-box");
  const tableBody = document.getElementById("data-body");
  const suggestionsBox = document.querySelector(".suggestions");

  let allNames = [];

  try {
    const res = await fetch("http://localhost:3001/api/fdp");
    const data = await res.json();

    const namesSet = new Set();

    data.forEach(row => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row["Staff Name"]}</td>
        <td>${row["FDP/Industry Visit"]}</td>
        <td>${row["Event Title"]}</td>
        <td>${row["Days"]}</td>
        <td>${row["Date From"].slice(0, 10)} to ${row["Date To"].slice(0, 10)}</td>
        <td>${row["Mode"]}</td>
        <td>${row["Place"]}</td>
        <td>${row["Upload Image"]}</td>
      `;
      tableBody.appendChild(tr);
      namesSet.add(row["Staff Name"]);
    });

    allNames = Array.from(namesSet);

    const filterTable = () => {
      const searchValue = searchInput.value.toLowerCase();

      [...tableBody.rows].forEach(row => {
        const rowName = row.cells[0].textContent.toLowerCase();
        const matchesSearch = rowName.includes(searchValue);
        row.style.display = matchesSearch ? "" : "none";
      });
    };

    const showSuggestions = (value) => {
      suggestionsBox.innerHTML = "";

      if (!value) return;

      const filtered = allNames.filter(name =>
        name.toLowerCase().includes(value.toLowerCase())
      );

      filtered.forEach(name => {
        const div = document.createElement("div");
        div.classList.add("suggestion-item");
        div.textContent = name;

        div.addEventListener("click", () => {
          searchInput.value = name;
          suggestionsBox.innerHTML = "";
          filterTable();
        });

        suggestionsBox.appendChild(div);
      });
    };

    searchInput.addEventListener("input", () => {
      const value = searchInput.value.trim();
      showSuggestions(value);
      filterTable();
    });

    document.addEventListener("click", (e) => {
      if (!suggestionsBox.contains(e.target) && e.target !== searchInput) {
        suggestionsBox.innerHTML = "";
      }
    });

  } catch (err) {
    console.error("Error fetching data:", err);
  }
});

function exportToExcel() {
  const table = document.getElementById("data-table");
  const rows = Array.from(table.querySelectorAll("thead tr, tbody tr"));

  let csvContent = "";

  rows.forEach(row => {
    if (row.parentElement.tagName === "TBODY" && row.style.display === "none") return;

    const cols = Array.from(row.querySelectorAll("th, td"));
    const rowData = cols.map(col => `"${col.innerText}"`).join(",");
    csvContent += rowData + "\r\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "fdp_records_filtered_export.csv");
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
