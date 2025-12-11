document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    if (password !== passwordConfirm) {
      alert('パスワードが一致しません');
      return;
    }

    try {
      const res = await fetch('/api/users/signup', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      
      alert('登録に成功しました');
      window.location.href = 'index.html';

    } catch (err) {
      alert('登録に失敗しました: ' + (err.message || err));
    }
  });
});