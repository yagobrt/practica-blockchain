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

// Mantener las fechas ordenadas
function ordenarFechas() {
  const ul = document.getElementById('payment-dates');
  const lis = Array.from(ul.querySelectorAll('li'));

  const ordenadas = lis.sort((a, b) => {
    const dateA = a.querySelector('input[type="datetime-local"]').value;
    const dateB = b.querySelector('input[type="datetime-local"]').value;
    return new Date(dateA) - new Date(dateB);
  });

  // Limpiar y reinsertar
  ul.innerHTML = '';
  ordenadas.forEach(li => ul.appendChild(li));
}

// Añadir y eliminar fechas de pago
document.getElementById('add-date').addEventListener('click', () => {
  const ul = document.getElementById('payment-dates');
  const li = document.createElement('li');
  // li.className = 'loan-form__date-item';

  const newDate = document.createElement('input');
  newDate.type = 'datetime-local';
  newDate.required = true;
  newDate.classList.add('input-field');

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.classList.add('btn', 'remove-date-btn');
  removeBtn.setAttribute('aria-label', 'Eliminar fecha');
  removeBtn.innerHTML = '&times;';
  removeBtn.addEventListener('click', () => {
    ul.removeChild(li);
    ordenarFechas();
  });
  li.appendChild(newDate);
  li.appendChild(removeBtn);
  ul.appendChild(li);

  ordenarFechas();
});

// Delegación para eliminar
document.getElementById('payment-dates').addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') {
    e.target.parentElement.remove();
  }
});

// Nuevo préstamo
document.getElementById('loan-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const lender = document.getElementById('loan-giver').value;
  const borrower = document.getElementById('loan-recipient').value;
  const amount = document.getElementById('loan-amount').value;
  const rate = document.getElementById('loan-interest').value;
  const dates = Array.from(document.getElementById('payment-dates').querySelectorAll('input[type="datetime-local"]'))
    .map(input => input.value)
    .filter(date => date); // eliminar vacíos

  // Comprobar que hay fechas
  if (dates.length == 0) {
    alert('Introduce al menos una fecha.');
    return;
  }
  // Comprobar que las fechas no son pasadas
  const now = new Date();
  const hasPastDate = dates.some(dateStr => new Date(dateStr) < now);
  if (hasPastDate) {
    alert('No puedes introducir fechas en el pasado.');
    return;
  }


  try {
    const res = await fetch('http://localhost:3000/api/loan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        borrower,
        lender,
        amount,
        rate,
        datesJson: JSON.stringify(dates)
      })
    });
    const data = res.json();

    if (res.status == 201) {
      alert('Registro exitoso. Redirigiendo...');
      // Wait so user reads the message
      setTimeout(() => {
        window.location.href = 'area_cliente.html';
      }, 1000);
    } else {
      alert(`Error: ${data.error || 'No se pudo registrar el préstamo'}`);
    }

  } catch (err) {
    console.error(err);
    alert(`Error al conectar con el servidor\n${err}`);
  }
});

// Volver atrás
document.querySelectorAll('.loan-form__btn--cancel').forEach(btn => {
  btn.addEventListener('click', () => {
    alert("Volviendo al area de cliente...");
    window.location.href = 'area_cliente.html';
    return;
  })
});
