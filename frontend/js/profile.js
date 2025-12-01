// frontend/js/profile.js
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('profile-container');
  const token = localStorage.getItem('token');
  if (!token) {
    container.innerHTML = '<p>Vui lòng đăng nhập để xem hồ sơ.</p>';
    return;
  }

  // Try to use stored userName; backend user endpoint is not implemented, so use stored info
  const name = localStorage.getItem('userName') || '';
  const email = localStorage.getItem('userEmail') || '';

  container.innerHTML = `
    <div><strong>Họ tên:</strong> ${escapeHtml(name)}</div>
    <div style="margin-top:8px;"><strong>Email:</strong> ${escapeHtml(email || '—')}</div>
  `;

  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) btnLogout.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    window.location.href = 'index.html';
  });
});
