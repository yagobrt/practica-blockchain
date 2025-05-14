// Rellenar los datos si la sesión está iniciada
window.addEventListener('DOMContentLoaded', async () => {
  const email = localStorage.getItem('userEmail');

  if (!email) {
    alert('No hay sesión activa. Redirigiendo a registro...');
    window.location.href = 'registro.html';
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/user/${encodeURIComponent(email)}`);
    if (!res.ok) {
      throw new Error('Error al obtener los datos del usuario');
    }

    const user = await res.json();

    document.getElementById('username').value = user.username || '';
    document.getElementById('ethAddress').value = user.wallet || '';
    document.getElementById('validationEmail').value = user.email || '';
    document.getElementById('balance').value = `${user.balance || 0} ETH`;

    // TODO: Rellenar las tablas con las transacciones

  } catch (err) {
    console.error(err);
    alert(`No se pudo cargar la información del usuario.\n${err}`);
  }
});


// Save field handler
document.querySelectorAll('.save-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.closest('.input-group').querySelector('input');
    console.log(`Guardando ${input.id}: ${input.value}`);
    // Aquí iría la llamada fetch() al backend para persistir
  });
});

// View contract handler
document.querySelectorAll('.view-contract').forEach(btn => {
  btn.addEventListener('click', () => {
    alert('Abriendo contrato en Etherscan u otra vista');
  });
});

// New loan navigation
document.getElementById('new-loan').addEventListener('click', () => {
  window.location.href = 'nuevo_prestamo.html';
});

