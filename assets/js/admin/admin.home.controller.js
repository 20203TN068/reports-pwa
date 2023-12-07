(() => {
  'use strict';
  const token = localStorage.getItem('token');
  if (!token) {
    localStorage.clear();
    changeView('');
  }
})();

const incidencesDB = new PouchDB('incidences');

const acceptIncidence = async (id) => {
  try {
    const response = await axiosClient.post('incidences/status', {
      id,
      status: {
        id: 4
      }
    });
    if(response['changed']){
      toastMessage('Estado cambiado correctamente').showToast();
      getIncidences();
    }
  } catch (error) {
    toastMessage('Error al cambiar el estado').showToast();
    console.log(error)
  }
} 

const rejectIncidence = async (id) => {
  try {
    const response = await axiosClient.post('incidences/status', {
      id,
      status: {
        id: 6
      }
    });
    if(response['changed']){
      toastMessage('Estado cambiado correctamente').showToast();
      getIncidences();
    }
  } catch (error) {
    toastMessage('Error al cambiar el estado').showToast();
    console.log(error)
  }
} 

const getIncidences = async () => {
  let content = ``;
  try {
    const user = parseJWT();
    const response = await axiosClient.get(`/incidences/pending/${user.id}`);
    for (const [index, incidence] of response?.incidences.entries()) {
      const incidenceDate = new Date(incidence.incidenceDate);
      const day = String(incidenceDate.getDay()).padStart(2, '0');
      const month = String(incidenceDate.getMonth() +1).padStart(2, '0');
      const year = incidenceDate.getFullYear();
      const {rows} = await incidencesDB.allDocs({ include_docs: true});
      
      content += `
        <tr>
            <th scope="row">${index + 1}</th>
            <td>${incidence.title}</td>
            <td>${incidence.description}</td>
            <td>${incidence.type}</td>
            <td>
              ${incidence.person.name} ${incidence.person.surname} ${incidence.person.lastname ?? ''}
            </td>
            <td>${incidence.user.area.name}</td>
            <td>${day}/${month}/${year}</td>
            <td>
              <span class="badge rounded-pill bg-${
                Number(incidence.status.id) === 3 ? 'warning' : 'primary'
              }">${incidence.status.description}</span>
            </td>
            <td>
              ${
                rows.find(row => row.doc.id === incidence.id)
                ?
                `<button type="button" class="mb-2 btn btn-success btn-sm disabled">ACEPTAR</button>
                <button type="button" class="btn btn-danger" btn-sm disabled>RECHAZAR</button>`
                : `<button type="button" class="mb-2 btn btn-success btn-sm" onclick="acceptIncidence(${incidence.id})">ACEPTAR</button>
                  <button type="button" class="btn btn-danger btn-sm" onclick="rejectIncidence(${incidence.id})">RECHAZAR</button>`
              }
            </td>
        </tr>
        `;
    }
    document.getElementById('incidencesBody').innerHTML = content;
    const table = document.getElementById('incidencesTable');
    new DataTable(table, {
      columnDefs: [{ orderable: false, targets: 5 }],
      language: {
        url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json',
      },
    });
  } catch (error) {
    toastMessage('Error al consultar las incidencias').showToast();
    console.log(error)
  }
};

$(document).ready(function () {
  if (!fullname) fullname = localStorage.getItem('fullname');
  if (!role) role = localStorage.getItem('activeRole');
  $('#fullname').text(fullname);
  $('#fullname2').text(fullname);
  $('#role').text(role);
  getIncidences();
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'RELOAD_PAGE_AFTER_SYNC')
      window.location.reload(true);
  });
});
