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
    const nickInput = document.getElementById('nameReg');
    nickInput.value = `User${Math.floor(Math.random() * 10000)}`;
  });
});

// Register new user
document.getElementById('register-form').addEventListener('submit', async (e) => {
  const wallet = document.getElementById('ethReg').value.trim();
  const username = document.getElementById('nameReg').value.trim();
  const password = document.getElementById('passReg').value;
  const email = document.getElementById('emailReg').value.trim();

  try {
    const res = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username, wallet, email, password})
    });

    const data = await res.json();

    if (res.status == 201) {
      alert('Registro exitoso. Redirigiendo...');
      // Wait so user reads the message
      setTimeout(() => {
        window.location.href = 'area_cliente.html';
      }, 1000);
    } else {
      alert(`Error: ${data.error || 'No se pudo registrar el usuario'}`);
    }
  } catch (err) {
    console.error(err);
    alert(`Error al conectar con el servidor\n${err}`);
  }
});

