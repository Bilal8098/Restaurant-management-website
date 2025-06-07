// helper to pad numbers to two digits
function pad(n) { return n < 10 ? '0' + n : '' + n; }

// YYYY-MM-DD from a local Date
function ymd(d) {
    return d.getFullYear() + '-' +
        pad(d.getMonth() + 1) + '-' +
        pad(d.getDate());
}

// find Monday (or shift Sunday) and return local-midnight Date
function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 = Sunday, 6 = Saturday
    const diff = d.getDate() - day; // Move back to Sunday
    const sunday = new Date(d.setDate(diff));
    return new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate());
}

let currentWeekStart = getStartOfWeek(new Date());
const refreshInterval = setInterval(loadCalendar, 5000);

async function fetchReservations() {
    try {
        let r = await fetch('https://ample-miracle-production.up.railway.app/get_reservations', { mode: 'cors' });
        let j = await r.json();
        return (j.reservations || []).map(r => ({
            ReservationID: r.reservation_id,
            UserID: r.user_id,
            TableID: r.table_id,
            startDate: r.start_date,
            endDate: r.end_date,
            Name: r.name,
            PhoneNumber: r.phone_number,
            Status: r.status
        }));
    } catch (e) {
        console.error('fetchReservations', e);
        return [];
    }
}

async function fetchTables() {
    try {
        let r = await fetch('https://ample-miracle-production.up.railway.app/get_tables', { mode: 'cors' });
        let j = await r.json();
        return (j.tables || []).map(t => ({ TableID: t.TableID }));
    } catch (e) {
        console.error('fetchTables', e);
        return [];
    }
}

function processReservations(reservations, tables, weekStart) {
    const grouped = {};
    tables.forEach(t => {
        grouped[t.TableID] = {};
        for (let i = 0; i < 7; i++) {
            const day = new Date(
                weekStart.getFullYear(),
                weekStart.getMonth(),
                weekStart.getDate() + i
            );
            grouped[t.TableID][ymd(day)] = [];
        }
    });

    reservations.forEach(r => {
        const s = new Date(r.startDate), e = new Date(r.endDate);

        let cur = new Date(s.getFullYear(), s.getMonth(), s.getDate());
        const last = new Date(e.getFullYear(), e.getMonth(), e.getDate());

        while (cur <= last) {
            const key = ymd(cur);
            if (grouped[r.TableID] && grouped[r.TableID][key]) {
                grouped[r.TableID][key].push(r);
            }
            cur.setDate(cur.getDate() + 1);
        }
    });

    return grouped;
}

function renderCalendar(weekStart, grouped, tables) {
    // build the 7 days
    const days = [];
    for (let i = 0; i < 7; i++) {
        days.push(new Date(
            weekStart.getFullYear(),
            weekStart.getMonth(),
            weekStart.getDate() + i
        ));
    }

    // render header
    document.getElementById('calendar-header').innerHTML =
        '<th>Table</th>' +
        days.map(d =>
            `<th>${d.toLocaleDateString('en-US', { weekday: 'short' })}<br>${d.getDate()}</th>`
        ).join('');

    // render body
    const tbody = document.getElementById('calendar-body');
    tbody.innerHTML = '';

    tables.sort((a, b) => a.TableID - b.TableID)
        .forEach(t => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>Table ${t.TableID}</td>`;

            days.forEach(d => {
                const cell = document.createElement('td');
                let list = (grouped[t.TableID] || {})[ymd(d)] || [];

                // sort by start time:
                list.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

                // Show first 2 reservations
                list.slice(0, 1).forEach(r => {
                    const start = new Date(r.startDate)
                        .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const end = new Date(r.endDate)
                        .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const slot = document.createElement('div');

                    slot.className = 'reservation-item';
                    slot.innerHTML = `
                        <div>🕒 ${start} - ${end}</div>
                        <div>👤 ${r.Name || '—'}</div>
                        <div>📞 ${r.PhoneNumber || '—'}</div>
                    `;
                    cell.appendChild(slot);
                });

                // Add "View All" button if there are more reservations
                if (list.length > 1) {
                    const viewAllBtn = document.createElement('button');
                    viewAllBtn.className = 'view-all-btn';
                    viewAllBtn.textContent = `View All (${list.length})`;
                    viewAllBtn.onclick = () => showModal(t.TableID, d, list);
                    cell.appendChild(viewAllBtn);
                }

                tr.appendChild(cell);
            });

            tbody.appendChild(tr);
        });
}

function updateWeekRange() {
    const end = new Date(
        currentWeekStart.getFullYear(),
        currentWeekStart.getMonth(),
        currentWeekStart.getDate() + 6
    );
    document.getElementById('week-range').textContent =
        `${currentWeekStart.toLocaleDateString()} — ${end.toLocaleDateString()}`;
}

function showModal(tableId, date, reservations) {
    const modal = document.getElementById('reservationModal');
    const modalDate = document.getElementById('modalDate');
    const modalContent = document.getElementById('modalReservations');

    modalDate.textContent = `${date.toLocaleDateString()} - Table ${tableId}`;
    modalContent.innerHTML = '';

    reservations.forEach(r => {
        const start = new Date(r.startDate)
            .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const end = new Date(r.endDate)
            .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const div = document.createElement('div');
        div.className = 'modal-reservation-item';
        div.innerHTML = `
            <div>🕒 ${start} - ${end}</div>
            <div>👤 ${r.Name || '—'}</div>
            <div>📞 ${r.PhoneNumber || '—'}</div>
            <div>Status: ${r.Status}</div>
        `;
        modalContent.appendChild(div);
    });

    modal.style.display = 'block';
}

// Event listeners
document.getElementById('prev-week').onclick = () => {
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    loadCalendar();
};

document.getElementById('next-week').onclick = () => {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    loadCalendar();
};

document.querySelector('.close').onclick = () => {
    document.getElementById('reservationModal').style.display = 'none';
};

window.onclick = (event) => {
    const modal = document.getElementById('reservationModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

async function loadCalendar() {
    updateWeekRange();
    const [reservations, tables] = await Promise.all([
        fetchReservations(),
        fetchTables()
    ]);
    const grouped = processReservations(reservations, tables, currentWeekStart);
    renderCalendar(currentWeekStart, grouped, tables);
}

// initial draw
loadCalendar();
window.addEventListener('beforeunload', () => clearInterval(refreshInterval));