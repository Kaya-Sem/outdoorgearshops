let currentFilters = {
    region: new Set(),
    type: new Set(),
};

function handleCheckboxClick(event, filterType) {
    event.stopPropagation();
    const checkbox = event.target;
    const filterSet = currentFilters[filterType];

    if (checkbox.checked) {
        filterSet.add(checkbox.value);
    } else {
        filterSet.delete(checkbox.value);
    }

    filterTable();
}

function toggleHeaderDropdown(filterType, event) {
    event.stopPropagation();

    const dropdown = document.getElementById(`${filterType}-dropdown`);
    const allDropdowns = document.querySelectorAll(".header-dropdown");

    allDropdowns.forEach((d) => {
        if (d !== dropdown) {
            d.classList.remove("active");
        }
    });

    dropdown.classList.toggle("active");

    const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
        checkbox.checked = currentFilters[filterType].has(checkbox.value);
    });
}

function filterTable() {
    const filteredData = vendors.filter((item) => {
        // If no region filters are selected, show all items
        const regionMatch = currentFilters.region.size === 0 ||
            item.shipsTo.some((region) =>
                region === Regions.WORLDWIDE ||
                currentFilters.region.has(region.toLowerCase())
            );

        // If no type filters are selected, show all items
        const typeMatch = currentFilters.type.size === 0 ||
            item.types.some((type) => currentFilters.type.has(type));

        return regionMatch && typeMatch;
    });

    updateTable(filteredData);
}

document.addEventListener("click", function (event) {
    if (
        !event.target.closest(".header-dropdown") && !event.target.closest("th")
    ) {
        document.querySelectorAll(".header-dropdown").forEach((dropdown) => {
            dropdown.classList.remove("active");
        });
    }
});

function updateTable(data) {
    const tableBody = document.querySelector("#directory-table tbody");

    if (data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="no-results">No results found matching your filters.</td>
            </tr>
        `;
        return;
    }

    // Create a reverse lookup for Regions and Types for display
    const regionDisplayMap = {};
    for (const key in Regions) {
        regionDisplayMap[Regions[key].toLowerCase()] = Regions[key];
    }

    // Add region to flag emoji mapping
    const regionFlags = {
        "europe": "🇪🇺",
        "ukraine": "🇺🇦",
        "united states": "🇺🇸",
        "south america": "🇧🇷",
        "worldwide": "🌍",
        "great britain": "🇬🇧",
        "asia": "🌏",
        "africa": "🌍",
    };

    const typeDisplayMap = {};
    for (const key in Types) {
        typeDisplayMap[Types[key].toLowerCase()] = Types[key];
    }

    let html = "";

    data.forEach((item) => {
        const primaryRegion =
            (Array.isArray(item.shipsFrom) && item.shipsFrom.length > 0)
                ? item.shipsFrom[0].toLowerCase()
                : "";
        const flagEmoji = primaryRegion
            ? regionFlags[primaryRegion] || "🌐"
            : "❓";
        const tooltipText = primaryRegion
            ? `Ships from ${regionDisplayMap[primaryRegion] || primaryRegion}`
            : "Unknown shipping origin";

        const regionTags = (Array.isArray(item.shipsTo) ? item.shipsTo : [])
            .map((region) => {
                return regionDisplayMap[region.toLowerCase()] || region;
            }).join(", ");

        const typeTags = (Array.isArray(item.types) ? item.types : []).map(
            (type) => {
                return typeDisplayMap[type.toLowerCase()] || type;
            },
        ).join(", ");

        html += `
            <tr>
                <td><img src="https://www.google.com/s2/favicons?domain=${item.url}&sz=32" alt="" width="32" height="32" style="vertical-align: middle;"></td>
                <td><span class="flag-emoji" title="${tooltipText}">${flagEmoji}</span> <a href="${item.url}" target="_blank">${item.name}</a></td>
                <td>${regionTags}</td>
                <td>${typeTags}</td>
            </tr>
        `;
    });

    tableBody.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", function () {
    console.log(vendors);
    updateTable(vendors);
});
