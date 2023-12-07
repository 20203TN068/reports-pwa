(() => {
    'use strict';
    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.clear();
      changeView('');
    }
  })();
  
  $(document).ready(function () {
    if (!fullname) fullname = localStorage.getItem('fullname');
    if (!role) role = localStorage.getItem('activeRole');
    $('#fullname').text(fullname);
    $('#fullname2').text(fullname);
    $('#role').text(role);
  });
  