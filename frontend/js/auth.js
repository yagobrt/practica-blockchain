// Toggle visibility for any .eye-btn
document.querySelectorAll('.eye-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const input = document.getElementById(targetId);
    input.type = input.type === 'password' ? 'text' : 'password';
  });
});

// Nickname generator button
document.querySelectorAll('.nick-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const nickInput = document.getElementById('nick');
    nickInput.value = `User${Math.floor(Math.random() * 10000)}`;
  });
});

