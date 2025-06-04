let currentFilters = {
    region: new Set(['all']),
    type: new Set(['all'])
};

function handleCheckboxClick(event, filterType) {
    event.stopPropagation();
    const checkbox = event.target;

    if (checkbox.value === 'all') {
        const checkboxes = document.querySelectorAll(`#${filterType}-dropdown input[type="checkbox"]`);
        checkboxes.forEach(cb => {
            if (cb !== checkbox) {
                cb.checked = false;
            }
        });
    } else {
        const allCheckbox = document.querySelector(`#${filterType}-dropdown input[value="all"]`);
        if (allCheckbox) {
            allCheckbox.checked = false;
        }
    }

    const filterSet = currentFilters[filterType];
    filterSet.clear();

    const selectedCheckboxes = document.querySelectorAll(`#${filterType}-dropdown input[type="checkbox"]:checked`);
    if (selectedCheckboxes.length === 0) {
        filterSet.add('all');
        document.querySelector(`#${filterType}-dropdown input[value="all"]`).checked = true;
    } else {
        selectedCheckboxes.forEach(cb => filterSet.add(cb.value));
    }

    filterTable();
}

function toggleHeaderDropdown(filterType, event) {
    event.stopPropagation();

    const dropdown = document.getElementById(`${filterType}-dropdown`);
    const allDropdowns = document.querySelectorAll('.header-dropdown');

    allDropdowns.forEach(d => {
        if (d !== dropdown) {
            d.classList.remove('active');
        }
    });

    dropdown.classList.toggle('active');

    const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = currentFilters[filterType].has(checkbox.value);
    });
}

function filterTable() {
    const filteredData = vendors.filter(item => {
        const regionMatch = currentFilters.region.has('all') ||
            item.regions.some(region =>
                region === 'worldwide' || currentFilters.region.has(region)
            );
        const typeMatch = currentFilters.type.has('all') ||
            item.types.some(type => currentFilters.type.has(type));
        return regionMatch && typeMatch;
    });

    updateTable(filteredData);
}

document.addEventListener('click', function (event) {
    if (!event.target.closest('.header-dropdown') && !event.target.closest('th')) {
        document.querySelectorAll('.header-dropdown').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    }
});

function updateTable(data) {
    const tableBody = document.querySelector('#directory-table tbody');

    if (data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="3" class="no-results">No results found matching your filters.</td>
            </tr>
        `;
        return;
    }

    let html = ''

    data.forEach(item => {
        const regionTags = item.regions.map(region => {
            const displayName = {
                'africa': 'Africa',
                'asia': 'Asia',
                'europe': 'Europe',
                'north_america': 'North America',
                'south_america': 'South America',
                'oceania': 'Oceania'
            }[region] || region;
            return displayName;
        }).join(', ');

        const typeTags = item.types.map(type => {
            const displayName = {
                'big-brand': 'Big Brand',
                'cottage': 'Cottage',
                'retailer': 'Retailer'
            }[type] || type;
            return displayName;
        }).join(', ');

        html += `
            <tr>
                <td><img src="https://www.google.com/s2/favicons?domain=${item.url}&sz=32" alt="" width="32" height="32" style="vertical-align: middle;"></td>
                <td><a href="${item.url}" target="_blank">${item.name}</a></td>
                <td>${regionTags}</td>
                <td>${typeTags}</td>
            </tr>
        `;
    });

    tableBody.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', function () {
    updateTable(vendors);
}); 