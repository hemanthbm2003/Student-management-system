// ====== CONFIG ======
const API_BASE_URL = "http://localhost:8080";

// ====== AUTH UTILS ======
function saveAuthData(token, username, role) {
    localStorage.setItem("jwtToken", token);
    localStorage.setItem("username", username);
    localStorage.setItem("role", role);
}

function getToken() {
    return localStorage.getItem("jwtToken");
}

function clearAuthData() {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
}

function isLoggedIn() {
    return !!getToken();
}

function authHeaders(isJson = true) {
    const headers = {};
    if (isJson) {
        headers["Content-Type"] = "application/json";
    }
    const token = getToken();
    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }
    return headers;
}

// ====== GENERIC UI HELPERS ======
function showGlobalAlert(message, type = "success", timeout = 3000) {
    const alertEl = document.getElementById("globalAlert");
    if (!alertEl) return;
    alertEl.className = "alert alert-" + type;
    alertEl.textContent = message;
    alertEl.classList.remove("d-none");

    if (timeout) {
        setTimeout(() => {
            alertEl.classList.add("d-none");
        }, timeout);
    }
}

// ====== LOGIN PAGE LOGIC ======
function initLoginPage() {
    const form = document.getElementById("loginForm");
    if (!form) return; // not on login page

    const loginBtn = document.getElementById("loginBtn");
    const loginSpinner = document.getElementById("loginSpinner");
    const errorBox = document.getElementById("loginError");

    // If already logged in, go to dashboard
    if (isLoggedIn()) {
        window.location.href = "dashboard.html";
        return;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        errorBox.classList.add("d-none");

        const usernameInput = document.getElementById("username");
        const passwordInput = document.getElementById("password");

        if (!usernameInput.value.trim() || !passwordInput.value) {
            form.classList.add("was-validated");
            return;
        }

        loginBtn.disabled = true;
        loginSpinner.classList.remove("d-none");

        try {
            const response = await fetch(API_BASE_URL + "/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: usernameInput.value.trim(),
                    password: passwordInput.value
                })
            });

            if (!response.ok) {
                if (response.status === 403 || response.status === 401) {
                    errorBox.textContent = "Invalid username or password.";
                } else if (response.type === "opaque") {
                    errorBox.textContent = "Request blocked by CORS or network error.";
                } else {
                    errorBox.textContent = "Login failed (" + response.status + "). Check backend logs.";
                }
                errorBox.classList.remove("d-none");
            } else {
                const data = await response.json();
                // Expected JSON:
                // { token: "...", username: "admin", role: "ROLE_ADMIN" }
                saveAuthData(data.token, data.username, data.role);
                window.location.href = "dashboard.html";
            }
        } catch (err) {
            console.error("Login error", err);
            errorBox.textContent = "Unable to reach backend. Is Spring Boot running on port 8080?";
            errorBox.classList.remove("d-none");
        } finally {
            loginBtn.disabled = false;
            loginSpinner.classList.add("d-none");
        }
    });
}

// ====== DASHBOARD / STUDENTS LOGIC ======
let currentPage = 0;
let currentPageSize = 10;
let currentKeyword = "";
let currentSortField = "name";
let currentSortDir = "asc";

function requireAuthOnDashboard() {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
        return false;
    }

    // Fill navbar user info
    const userNameEl = document.getElementById("currentUserName");
    const userRoleEl = document.getElementById("currentUserRole");
    if (userNameEl) userNameEl.textContent = localStorage.getItem("username") || "";
    if (userRoleEl) userRoleEl.textContent = localStorage.getItem("role") || "";
    return true;
}

async function fetchStudents() {
    const tbody = document.getElementById("studentsTableBody");
    const pageInfoEl = document.getElementById("pageInfo");
    const paginationEl = document.getElementById("paginationContainer");

    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center py-4">
                Loading students...
            </td>
        </tr>
    `;

    const params = new URLSearchParams();
    params.append("page", currentPage);
    params.append("size", currentPageSize);
    params.append("sortField", currentSortField);
    params.append("sortDir", currentSortDir);
    if (currentKeyword && currentKeyword.trim().length > 0) {
        params.append("keyword", currentKeyword.trim());
    }

    try {
        const response = await fetch(API_BASE_URL + "/api/students?" + params.toString(), {
            method: "GET",
            headers: authHeaders(false)
        });

        if (response.status === 401 || response.status === 403) {
            showGlobalAlert("Your session expired or you're not authorized. Please login again.", "danger", 5000);
            clearAuthData();
            setTimeout(() => (window.location.href = "login.html"), 1500);
            return;
        }

        if (!response.ok) {
            throw new Error("Failed to fetch students: " + response.status);
        }

        const data = await response.json();
        // Expecting:
        // {
        //   content: [...],
        //   pageNumber, pageSize, totalElements, totalPages, last
        // }

        const students = data.content || data.students || [];
        if (!Array.isArray(students) || students.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-4 text-muted">
                        No students found.
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = "";
            students.forEach((s) => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${s.id ?? ""}</td>
                    <td>${s.name ?? ""}</td>
                    <td>${s.email ?? ""}</td>
                    <td>${s.department ?? ""}</td>
                    <td>${s.gender ?? ""}</td>
                    <td>${s.phone ?? ""}</td>
                    <td class="text-end">
                        <button class="btn btn-sm btn-outline-primary me-1" data-action="edit" data-id="${s.id}">Edit</button>
                        <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${s.id}">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }

        // Page info & pagination
        const pageNumber = data.pageNumber ?? currentPage;
        const pageSize = data.pageSize ?? currentPageSize;
        const totalElements = data.totalElements ?? students.length;
        const totalPages = data.totalPages ?? 1;

        currentPage = pageNumber;
        currentPageSize = pageSize;

        if (pageInfoEl) {
            const start = totalElements === 0 ? 0 : pageNumber * pageSize + 1;
            const end = Math.min(totalElements, (pageNumber + 1) * pageSize);
            pageInfoEl.textContent = `Showing ${start}-${end} of ${totalElements} students`;
        }

        if (paginationEl) {
            paginationEl.innerHTML = "";
            // Previous
            const prevLi = document.createElement("li");
            prevLi.className = "page-item" + (pageNumber === 0 ? " disabled" : "");
            prevLi.innerHTML = `<a class="page-link" href="#" data-page="${pageNumber - 1}">&laquo;</a>`;
            paginationEl.appendChild(prevLi);

            // Page numbers (simple, first 5 pages around current)
            const maxToShow = 5;
            const startPage = Math.max(0, pageNumber - Math.floor(maxToShow / 2));
            const endPage = Math.min(totalPages - 1, startPage + maxToShow - 1);

            for (let p = startPage; p <= endPage; p++) {
                const li = document.createElement("li");
                li.className = "page-item" + (p === pageNumber ? " active" : "");
                li.innerHTML = `<a class="page-link" href="#" data-page="${p}">${p + 1}</a>`;
                paginationEl.appendChild(li);
            }

            // Next
            const nextLi = document.createElement("li");
            nextLi.className = "page-item" + (pageNumber >= totalPages - 1 ? " disabled" : "");
            nextLi.innerHTML = `<a class="page-link" href="#" data-page="${pageNumber + 1}">&raquo;</a>`;
            paginationEl.appendChild(nextLi);
        }

    } catch (err) {
        console.error(err);
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-danger">
                    Failed to load students. Check console & backend.
                </td>
            </tr>
        `;
    }
}

function initStudentModal() {
    const addBtn = document.getElementById("addStudentBtn");
    const form = document.getElementById("studentForm");
    if (!addBtn || !form) return;

    const modalEl = document.getElementById("studentModal");
    const modal = new bootstrap.Modal(modalEl);
    const titleEl = document.getElementById("studentModalTitle");
    const saveSpinner = document.getElementById("studentSaveSpinner");
    const saveText = document.getElementById("studentSaveBtnText");

    // Open modal for add
    addBtn.addEventListener("click", () => {
        form.reset();
        document.getElementById("studentId").value = "";
        titleEl.textContent = "Add Student";
        saveText.textContent = "Create";
        modal.show();
    });

    // Handle edit/delete click on table
    document.getElementById("studentsTableBody").addEventListener("click", async (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        const id = btn.getAttribute("data-id");
        const action = btn.getAttribute("data-action");
        if (!id || !action) return;

        if (action === "edit") {
            // Load student details and open modal
            try {
                const response = await fetch(API_BASE_URL + "/api/students/" + id, {
                    method: "GET",
                    headers: authHeaders(false)
                });
                if (!response.ok) throw new Error("Failed to load student");
                const s = await response.json();

                document.getElementById("studentId").value = s.id ?? "";
                document.getElementById("studentName").value = s.name ?? "";
                document.getElementById("studentEmail").value = s.email ?? "";
                document.getElementById("studentDepartment").value = s.department ?? "";
                document.getElementById("studentGender").value = s.gender ?? "";
                document.getElementById("studentPhone").value = s.phone ?? "";
                if (s.dateOfBirth) {
                    // Expect yyyy-MM-dd or ISO
                    const dob = s.dateOfBirth.toString().substring(0, 10);
                    document.getElementById("studentDob").value = dob;
                } else {
                    document.getElementById("studentDob").value = "";
                }

                titleEl.textContent = "Edit Student";
                saveText.textContent = "Update";
                modal.show();
            } catch (err) {
                console.error(err);
                showGlobalAlert("Failed to load student details.", "danger");
            }
        } else if (action === "delete") {
            if (!confirm("Are you sure you want to delete this student?")) return;
            try {
                const response = await fetch(API_BASE_URL + "/api/students/" + id, {
                    method: "DELETE",
                    headers: authHeaders(false)
                });
                if (!response.ok) {
                    throw new Error("Delete failed: " + response.status);
                }
                showGlobalAlert("Student deleted.", "success");
                fetchStudents();
            } catch (err) {
                console.error(err);
                showGlobalAlert("Failed to delete student.", "danger");
            }
        }
    });

    // Submit (create / update)
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const id = document.getElementById("studentId").value;
        const name = document.getElementById("studentName").value.trim();
        const email = document.getElementById("studentEmail").value.trim();

        if (!name || !email) {
            form.classList.add("was-validated");
            return;
        }

        const payload = {
            name,
            email,
            department: document.getElementById("studentDepartment").value.trim(),
            gender: document.getElementById("studentGender").value,
            phone: document.getElementById("studentPhone").value.trim(),
            dateOfBirth: document.getElementById("studentDob").value || null
        };

        saveSpinner.classList.remove("d-none");
        saveText.textContent = "Saving...";

        try {
            let url = API_BASE_URL + "/api/students";
            let method = "POST";
            if (id) {
                url = API_BASE_URL + "/api/students/" + id;
                method = "PUT";
            }

            const response = await fetch(url, {
                method,
                headers: authHeaders(true),
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error("Save failed: " + response.status);
            }

            modal.hide();
            showGlobalAlert(id ? "Student updated." : "Student created.", "success");
            fetchStudents();
        } catch (err) {
            console.error(err);
            showGlobalAlert("Failed to save student. Check console & backend.", "danger", 5000);
        } finally {
            saveSpinner.classList.add("d-none");
            saveText.textContent = id ? "Update" : "Create";
        }
    });
}

function initFilters() {
    const searchInput = document.getElementById("searchInput");
    const clearBtn = document.getElementById("clearSearchBtn");
    const sortFieldSelect = document.getElementById("sortFieldSelect");
    const sortDirSelect = document.getElementById("sortDirSelect");
    const pageSizeSelect = document.getElementById("pageSizeSelect");
    const paginationEl = document.getElementById("paginationContainer");

    if (!searchInput) return;

    // Search on enter
    searchInput.addEventListener("keyup", (e) => {
        if (e.key === "Enter") {
            currentKeyword = searchInput.value;
            currentPage = 0;
            fetchStudents();
        }
    });

    // Clear search
    clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        currentKeyword = "";
        currentPage = 0;
        fetchStudents();
    });

    sortFieldSelect.addEventListener("change", () => {
        currentSortField = sortFieldSelect.value;
        currentPage = 0;
        fetchStudents();
    });

    sortDirSelect.addEventListener("change", () => {
        currentSortDir = sortDirSelect.value;
        currentPage = 0;
        fetchStudents();
    });

    pageSizeSelect.addEventListener("change", () => {
        currentPageSize = parseInt(pageSizeSelect.value, 10) || 10;
        currentPage = 0;
        fetchStudents();
    });

    // Pagination clicks
    paginationEl.addEventListener("click", (e) => {
        const link = e.target.closest("a[data-page]");
        if (!link) return;
        e.preventDefault();
        const page = parseInt(link.getAttribute("data-page"), 10);
        if (!isNaN(page) && page >= 0) {
            currentPage = page;
            fetchStudents();
        }
    });
}

function initLogout() {
    const btn = document.getElementById("logoutBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
        clearAuthData();
        window.location.href = "login.html";
    });
}

function initDashboardPage() {
    const table = document.getElementById("studentsTable");
    if (!table) return; // not on dashboard

    if (!requireAuthOnDashboard()) return;

    initLogout();
    initFilters();
    initStudentModal();
    fetchStudents();
}

// ====== ENTRY POINT ======
document.addEventListener("DOMContentLoaded", () => {
    initLoginPage();
    initDashboardPage();
});
