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
  e.preventDefault();
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

    const data = res.json();

    if (res.status == 201) {
      // Guardar la dirección para que permanezca iniciada la sesión
      localStorage.setItem("userEmail", email);
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


// Login
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('emailLogin').value.trim();
  const password = document.getElementById('passLogin').value;

  try {
    const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({email, password})
    });

    const data = await res.json();

    if (res.status == 201) {
      // Guardar la dirección para que permanezca iniciada la sesión
      localStorage.setItem("userEmail", email);
      alert('Inicio de sesión exitoso. Redirigiendo...');
      // Wait so user reads the message
      setTimeout(() => {
        window.location.href = 'area_cliente.html';
      }, 1000);
    } else {
      alert(`Error: ${data.error || 'No se pudo iniciar sesión'}`);
    }
  } catch (err) {
    console.error(err);
    alert(`Error al conectar con el servidor\n${err}`);
  }
});
