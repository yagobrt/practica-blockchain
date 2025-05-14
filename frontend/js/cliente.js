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
document.querySelector('.new-loan-btn').addEventListener('click', () => {
  window.location.href = 'nuevo_prestamo.html';
});

