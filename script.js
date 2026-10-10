const form = document.getElementById("sessionForm");
const scheduleBody = document.getElementById("scheduleBody");
const message = document.getElementById("message");

let sessions = [];

try {
    sessions = JSON.parse(
        localStorage.getItem("labSessions") || "[]"
    );

    if (!Array.isArray(sessions)) {
        sessions = [];
    }
} catch {
    sessions = [];
}

function hasConflict(newSession, existingSession) {
    if (newSession.time !== existingSession.time) {
        return false;
    }

    const sameLab =
        newSession.lab.toLowerCase() ===
        existingSession.lab.toLowerCase();

    const sameInstructor =
        newSession.instructor.toLowerCase() ===
        existingSession.instructor.toLowerCase();

    const sameEquipment =
        newSession.equipment.toLowerCase() ===
        existingSession.equipment.toLowerCase();

    return sameLab || sameInstructor || sameEquipment;
}

function renderSchedule() {
    scheduleBody.replaceChildren();

    let conflictCount = 0;

    sessions.forEach((session, index) => {
        const conflicts = sessions.some((other, otherIndex) =>
            otherIndex !== index && hasConflict(session, other)
        );

        if (conflicts) {
            conflictCount++;
        }

        const row = document.createElement("tr");

        [
            session.experiment,
            session.group,
            session.lab,
            session.equipment,
            session.instructor,
            session.time
        ].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";
        deleteButton.type = "button";

        deleteButton.addEventListener("click", () => {
            sessions.splice(index, 1);
            saveSessions();
            renderSchedule();

            message.textContent = "Session deleted.";
        });

        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        if (conflicts) {
            row.style.backgroundColor = "#fee2e2";
            row.title = "This session has a resource conflict.";
        }

        scheduleBody.appendChild(row);
    });

    document.getElementById("experimentCount").textContent =
        new Set(sessions.map(s => s.experiment.toLowerCase())).size;

    document.getElementById("sessionCount").textContent =
        sessions.length;

    document.getElementById("conflictCount").textContent =
        conflictCount;

    document.getElementById("emptyMessage").hidden =
        sessions.length > 0;
}

function saveSessions() {
    localStorage.setItem("labSessions", JSON.stringify(sessions));
}

form.addEventListener("submit", event => {
    event.preventDefault();

    const newSession = {
        experiment: document.getElementById("experiment").value.trim(),
        group: document.getElementById("group").value.trim(),
        lab: document.getElementById("lab").value.trim(),
        equipment: document.getElementById("equipment").value.trim(),
        instructor: document.getElementById("instructor").value.trim(),
        time: document.getElementById("time").value
    };

    if (Object.values(newSession).some(value => !value)) {
        message.textContent = "Please fill in all fields.";
        return;
    }

    const conflicts = sessions.filter(session =>
        hasConflict(newSession, session)
    );

    sessions.push(newSession);
    saveSessions();
    renderSchedule();
    form.reset();

    if (conflicts.length > 0) {
        message.textContent =
            "Warning: Resource conflict detected. The session was added for review.";
        message.style.color = "#b91c1c";
    } else {
        message.textContent =
            "Session added successfully!";
        message.style.color = "#047857";
    }
});

renderSchedule();