document.addEventListener("DOMContentLoaded", async function () {
  const searchInput = document.querySelector(".search-box");
  const filterDropdown = document.querySelector(".filter-dropdown");
  const tableBody = document.getElementById("data-body");

  try {
    const res = await fetch("http://localhost:3001/api/fdp");
    const data = await res.json();

    const namesSet = new Set(["ALL"]);

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

    namesSet.forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      filterDropdown.appendChild(option);
    });

    const filterTable = () => {
      const searchValue = searchInput.value.toLowerCase();
      const selectedName = filterDropdown.value;

      [...tableBody.rows].forEach(row => {
        const rowName = row.cells[0].textContent.toLowerCase();
        const matchesSearch = rowName.includes(searchValue);
        const matchesDropdown = selectedName === "ALL" || rowName === selectedName.toLowerCase();
        row.style.display = (matchesSearch && matchesDropdown) ? "" : "none";
      });
    };

    searchInput.addEventListener("input", filterTable);
    filterDropdown.addEventListener("change", filterTable);
  } catch (err) {
    console.error("Error fetching data:", err);
  }
});

// Export to Excel Function - FILTER AWARE
function exportToExcel() {
  const table = document.getElementById("data-table");
  const rows = Array.from(table.querySelectorAll("thead tr, tbody tr")); // include thead

  let csvContent = "";

  rows.forEach(row => {
    // Skip hidden rows in tbody
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
