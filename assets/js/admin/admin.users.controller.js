(() => {
  'use strict';
  const token = localStorage.getItem('token');
  if (!token) {
    localStorage.clear();
    changeView('');
  }
})();

const getusers = async () => {
  let content = ``;
  try {
    const response = await axiosClient.get(`/user/`);
    for (const [index, user] of response?.users.entries()) {
      content += `
        <tr>
            <th scope="row">${index + 1}</th>
            <td>${user.username}</td>
            <td>${
              user.person.name +
              ' ' +
              user.person.surname +
              ' ' +
              user.person.lastname
            }</td>
            <td>Área</td>
            <td>
            <span class="badge rounded-pill bg-${
              Number(user.status.id) === 1 ? 'primary' : 'secondary'
            }">${user.status.description}</span>
            
            </td>
            <td>
                buttons
            </td>
        </tr>
        `;
    }
    document.getElementById('usersBody').innerHTML = content;
    const table = document.getElementById('usersTable');
    new DataTable(table, {
      columnDefs: [{ orderable: false, targets: 5 }],
      language: {
        url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json',
      },
    });
  } catch (error) {
    toastMessage('Error').showToast();
  }
};

$(document).ready(function () {
  if (!fullname) fullname = localStorage.getItem('fullname');
  if (!role) role = localStorage.getItem('activeRole');
  $('#fullname').text(fullname);
  $('#fullname2').text(fullname);
  $('#role').text(role);
  getusers();
});
