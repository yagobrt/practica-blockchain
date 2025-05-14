// Rellenar la wallet del usuario
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

    document.getElementById('loan-giver').value = user.wallet || '';

  } catch (err) {
    console.error(err);
    alert('No se pudo cargar la información del usuario.');
  }
});
// Añadir y eliminar fechas de pago
document.getElementById('add-date').addEventListener('click', () => {
  const ul = document.getElementById('payment-dates');
  const newDate = prompt('Introduce nueva fecha (YYYY-MM-DD):');
  if (newDate) {
    const li = document.createElement('li');
    li.className = 'loan-form__date-item';
    li.innerHTML = `${newDate} <button type="button" aria-label="Eliminar fecha">&times;</button>`;
    ul.appendChild(li);
  }
});

// Delegación para eliminar
document.getElementById('payment-dates').addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') {
    e.target.parentElement.remove();
  }
});

