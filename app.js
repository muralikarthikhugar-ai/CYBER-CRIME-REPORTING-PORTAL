// 1. CONFIGURATION
const SUPABASE_URL = "https://vbnnrgalrecuayjabxld.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZibm5yZ2FscmVjdWF5amFieGxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5NDgxNzUsImV4cCI6MjA4ODUyNDE3NX0.a9EFSx9CEisEKXSQ6kcqomxdOxpS7CfCpIijIKys3bk";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentOfficer = null;
let selectedID = null;

// 2. GATEKEEPER & INITIALIZATION (FEATURE 10)
async function initAdmin() {
    const { data: { user } } = await _supabase.auth.getUser();
    
    // If no session, show the login overlay
    if (!user) {
        document.getElementById('adminAuth').style.display = 'flex';
        return;
    }

    // Verify Officer Role (Feature 7)
    const { data: profile } = await _supabase.from('profiles').select('*').eq('id', user.id).single();
    
    if (profile && (profile.role === 'district_admin' || profile.role === 'super_admin')) {
        showDashboard(profile);
    } else {
        alert("ACCESS DENIED: Not an authorized officer account.");
        await _supabase.auth.signOut();
        location.reload();
    }
}

// 3. OFFICER SIGN IN
async function adminSignIn() {
    const email = document.getElementById('admEmail').value;
    const pass = document.getElementById('admPass').value;
    
    const { data, error } = await _supabase.auth.signInWithPassword({ email, password: pass });
    if (error) return alert("Login Failed: " + error.message);
    
    initAdmin(); // Re-run init to verify role and show dashboard
}

// 4. UI DASHBOARD CONTROL
function showDashboard(profile) {
    currentOfficer = profile;
    document.getElementById('adminAuth').style.display = 'none';
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('dashboard').style.display = 'block';

    // Set Header Info
    document.getElementById('adminName').innerText = profile.full_name;
    document.getElementById('adminJurisdiction').innerText = 
        profile.role === 'super_admin' ? 'State Command Center' : profile.district;

    // Show Super Admin Filter if applicable (Feature 5)
    if (profile.role === 'super_admin') {
        document.getElementById('superAdminTools').classList.remove('hidden');
        document.getElementById('superAdminTools').style.display = 'flex';
    }

    loadComplaints();
}

// 5. DATA LOADING & ANALYTICS (FEATURE 5 & 8)
async function loadComplaints() {
    const filter = document.getElementById('globalDistrictFilter')?.value || "ALL";
    let query = _supabase.from('complaints').select('*');

    // Jurisdiction Logic
    if (currentOfficer.role === 'district_admin') {
        query = query.eq('district', currentOfficer.district);
    } else if (filter !== 'ALL') {
        query = query.eq('district', filter);
    }

    const { data: complaints, error } = await query.order('created_at', { ascending: false });
    if (error) return console.error("Data Load Error:", error);

    // Update Dashboard Stats (Feature 8)
    document.getElementById('statTotal').innerText = complaints.length;
    document.getElementById('statResolved').innerText = complaints.filter(c => c.status === 'Resolved').length;
    document.getElementById('statPending').innerText = complaints.filter(c => c.status === 'Pending').length;

    // Render Table
    const tbody = document.getElementById('adminTableBody');
    tbody.innerHTML = "";

    if (complaints.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-10 text-center text-gray-400 italic">No incidents reported in this sector.</td></tr>`;
        return;
    }

    complaints.forEach(item => {
        const statusColor = item.status === 'Resolved' ? 'text-green-600' : 'text-orange-500';
        tbody.innerHTML += `
            <tr onclick='openModal(${JSON.stringify(item)})' class="hover:bg-blue-50 border-b transition-colors cursor-pointer group">
                <td class="p-5 font-bold text-blue-900 group-hover:underline">${item.complaint_id}</td>
                <td class="p-5 font-bold text-slate-700">${item.user_name}</td>
                <td class="p-5 italic text-red-500 font-medium">${item.crime_type}</td>
                <td class="p-5 text-[10px] font-black uppercase text-slate-400">${item.district}</td>
                <td class="p-5 text-[10px] font-black uppercase ${statusColor} italic">${item.status}</td>
            </tr>`;
    });
}

// 6. DEEP-VIEW MODAL CONTROL
function openModal(item) {
    selectedID = item.complaint_id;
    document.getElementById('modalID').innerText = item.complaint_id;
    document.getElementById('modalName').innerText = item.user_name;
    document.getElementById('modalMobile').innerText = item.mobile;
    document.getElementById('modalDist').innerText = item.district;
    document.getElementById('modalDesc').innerText = item.details;
    
    // Handle Evidence Image
    const img = document.getElementById('modalImg');
    const noImg = document.getElementById('noImg');
    if (item.evidence_url && item.evidence_url !== "None" && item.evidence_url !== "No link") {
        img.src = item.evidence_url;
        img.style.display = 'block';
        noImg.style.display = 'none';
    } else {
        img.style.display = 'none';
        noImg.style.display = 'block';
    }

    document.getElementById('detailModal').style.display = 'flex';
    document.getElementById('detailModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('detailModal').style.display = 'none';
    document.getElementById('detailModal').classList.add('hidden');
}

// 7. STATUS UPDATE LOGIC
async function updateStatusFromModal(newStatus) {
    const { error } = await _supabase.from('complaints').update({ status: newStatus }).eq('complaint_id', selectedID);
    
    if (error) {
        alert("Action Failed: " + error.message);
    } else {
        closeModal();
        loadComplaints(); // Refresh table and stats
    }
}

// 8. SESSION MANAGEMENT
function handleLogout() {
    _supabase.auth.signOut().then(() => {
        window.location.href = "auth.html";
    });
}