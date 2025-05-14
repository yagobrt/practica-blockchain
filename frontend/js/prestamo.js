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
    e.target.parentElement.remove();  // eliminar <li> padre :contentReference[oaicite:11]{index=11}
  }
});

