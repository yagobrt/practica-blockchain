// Rellenar los datos si la sesión está iniciada
window.addEventListener('DOMContentLoaded', async () => {
  const email = localStorage.getItem('userEmail');

  if (!email) {
    alert('No hay sesión activa. Redirigiendo a registro...');
    window.location.href = 'registro.html';
    return;
  }

  try {
    // Rellenar la información del usuario
    const resInfo = await fetch(`http://localhost:3000/api/user/${encodeURIComponent(email)}`);
    if (!resInfo.ok) {
      throw new Error('Error al obtener los datos del usuario');
    }

    const user = await resInfo.json();

    document.getElementById('username').value = user.username || '';
    document.getElementById('ethAddress').value = user.wallet || '';
    document.getElementById('validationEmail').value = user.email || '';
    document.getElementById('balance').value = `${user.balance || 0} ETH`;

    // Rellenar la tabla con los préstamos
    const resLoans = await fetch(`http://localhost:3000/api/loans/${user.wallet}`)
    if (!resLoans.ok) {
      throw new Error('Error al obtener los préstamos del usuario');
    }

    const loans = await resLoans.json();

    const loansTbody = document.getElementById('loans-body');
    loansTbody.innerHTML = '';

    if (loans.length === 0) {
      const row = loansTbody.insertRow();
      const cell = row.insertCell();
      cell.colSpan = 4;
      cell.textContent = 'No tienes préstamos activos.';
      cell.style.textAlign = 'center';
    } else {
      loans.forEach(loan => {
        const row = loansTbody.insertRow();

        const nextPayCell = row.insertCell();
        nextPayCell.textContent = loan.payment_dates;

        const txCell = row.insertCell();
        if (loan.lender_address === user.wallet) {
          txCell.textContent = `(Tú) ${loan.lender_address.slice(0, 2 + 10) + "…"} → ${loan.borrower_address.slice(0, 2 + 10) + "…"}`;
        } else {
          txCell.textContent = `${loan.borrower_address.slice(0, 2 + 10) + "…"} → ${loan.lender_address.slice(0, 2 + 10) + "…"} (Tú) `;
        }

        const amountCell = row.insertCell();
        amountCell.textContent = `${loan.amount_eth} ETH`;

        const btnCell = row.insertCell();
        const btn = document.createElement('button');
        btn.className = 'link-btn';
        btn.textContent = 'Ver contrato';
        btn.addEventListener('click', () => {
          alert("Información del préstamo");
          // window.open(loan.contractUrl, '_blank');
          // Abrir el contrato en etherscan por ejemplo

        });
        btnCell.appendChild(btn);
      });
    }

    // Rellenar las tablas con las transacciones
    const resTxs = await fetch(`http://localhost:3000/api/txs/${user.wallet}`);
    if (!resTxs.ok) throw new Error('Error al obtener las transacciones del usuario');
    const txs = await resTxs.json();

    const txsTbody = document.getElementById('txs-body');
    txsTbody.innerHTML = '';

    if (txs.length === 0) {
      const row = txsTbody.insertRow();
      const cell = row.insertCell();
      cell.colSpan = 4;
      cell.textContent = 'No hay transacciones recientes.';
      cell.style.textAlign = 'center';
    } else {
      txs.forEach(tx => {
        const row = txsTbody.insertRow();

        const dateCell = row.insertCell();
        const date = new Date(tx.timeStamp * 1000).toLocaleDateString();
        dateCell.textContent = date;

        const txCell = row.insertCell();
        if (tx.from === user.wallet) {
          txCell.textContent = `(Tú) ${tx.from.slice(0, 2 + 10) + "…"} → ${tx.to.slice(0, 2 + 10) + "…"}`;
        } else {
          txCell.textContent = `${tx.from.slice(0, 2 + 10) + "…"} → ${tx.to.slice(0, 2 + 10) + "…"} (Tú) `;
        }

        const amtCell = row.insertCell();
        amtCell.textContent = `${tx.value/1e18} ETH`;
      
        const btnCell = row.insertCell();
        const btn = document.createElement('button');
        btn.className = 'link-btn';
        btn.textContent = 'Ver en la blockchain';
        const blockURL = `https://sepolia.etherscan.io/tx/${encodeURIComponent(tx.hash)}`
        btn.addEventListener('click', () => {
          window.open(blockURL, '_blank');

        });
        btnCell.appendChild(btn);
      });
    }


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

