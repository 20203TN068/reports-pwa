(() => {
  'use strict';
  const token = localStorage.getItem('token');
  if (!token) {
    localStorage.clear();
    changeView('');
  }
})();

let payload = {
  title:"",
  type:"",
  description:"",
  incidenceDate:"",
  status: {id: 4},
  annexes:[],
  location:{
    lat:0,
    lng:0,
  },
};

const camera = new Camera($('#player')[0]);
const incidencesDB = new PouchDB('docentIncidences');
const cancelIncidence = (id) => {};
const editIncidence = (id) => {};

const currentLocation = () => {
  if(navigator.geolocation){
    toastMessage('Cargando mapa...').showToast();
    navigator.geolocation.getCurrentPosition((pos)=>{
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      payload.location = {
        lat,
        lng,
      };
      showMapWithLocation(lat,lng);
    });
  }
};

const showMapWithLocation = (lat,lng) => {
  let content = `
    <iframe
      width="100%" height="250"
      frameborder="0" scrolling="no" marginheight="0" marginwidth="0"
      src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=es&amp;q=${lat},${lng}+(Prueba)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
    >
    </iframe>
  `;
  document.getElementById('modal-map').innerHTML = content;
};

const initilizeCamera = () => {
  toastMessage("Cargando camara...").showToast();
  $("#modal-camera").css('display','block');
  camera.powerOn();
};

const takeAPhoto = () => {
  const photo = camera.takeAPhoto();
  payload = {...payload, annexes: [photo]};
  camera.powerOff();

};

// Registrar incidencia
// datos para ingresar docent/admin
//const axiosClient = axios.create({
//  baseURL: 'http://206.189.234.55:3001/api',
//});
// http://url que nos dio el profe/incidences/save -> endpoint URL archivo de axios
/*
  payload tienen que enviar al endpoint para que se registre
  {
    title,
    description,
    type,
    status,
    incidenceDate //yyyy-MM-dd hh:mm:ss
    annexes: [
      {
        name: "",
        mimeType: "png",
        file: ""
      }
    ],
    location
  }
*/

const registerIncidence = async () => {
  try {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const incidenceDate = document.getElementById('incidenceDate').value;
    const type = document.getElementById('type').value;

    const incidence = {
      title,
      incidenceDate,
      userId: payload.area[0].id, 
      description,
      type,
      location: {
        lat: payload.location.lat,
        lng: payload.location.lng,
      },
      annexes: payload.annexes.map(image => ({
        name: image.name,
        mimeType: 'png',
        file: image.file,
      })),
    };

    const response = await axios.post('/incidences/save', incidence);

    if (response.data.registered) {
      console.log('Incidencia guardada exitosamente');
    } else {
      console.log('No se pudo guardar la incidencia');
    }
  } catch (error) {
    console.error('Hubo un error al intentar guardar la incidencia', error);
  }
};

const getAllIncidencesByEmployee = async () => {
  try {
    const table = $('#incidencesTable').DataTable();
    table.destroy();
    const user = parseJWT();
    const response = await axiosClient.get(`/incidences/${user.id}`);
    const incidences = document.getElementById('ownIncidences');
    let content = ``;
    incidences.innerHTML = ``;
    const { rows } = await incidencesDB.allDocs({ include_docs: true });
    for (const [i, incidence] of response?.incidences.entries()) {
      const date = new Date(incidence.incidenceDate);
      const day = String(date.getDate()).padStart(2, '0'); // Ensure two-digit day
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure two-digit month (months are zero-based)
      const year = date.getFullYear();
      content += `
        <tr>
          <th scope="row">${i + 1}</th>
          <td>${
            incidence.person.name +
            ' ' +
            incidence.person.surname +
            ' ' +
            (incidence.person.lastname ?? '')
          }</td>
          <td>${incidence.user.area.name}</td>
          <td>${day}-${month}-${year}</td>
          <td><span class="badge bg-info">${
            incidence.status.description
          }</span></td>
          <td>
            <button onclick="editIncidence(${i})" class="btn btn-warning btn-sm">EDITAR</button>
            <button onclick="cancelIncidence(${i})" class="btn btn-danger btn-sm">CANCELAR</button>
          </td>
        </tr>
        `;
    }
    incidences.innerHTML = content;
    new DataTable($('#incidencesTable'), {
      columnDefs: [{ orderable: false, targets: 4 }],
      language: {
        url: 'https://cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json',
      },
    });
  } catch (error) {
    console.log(error);
  }
};

$(document).ready(function () {
  if (!fullname) fullname = localStorage.getItem('fullname');
  if (!role) role = localStorage.getItem('activeRole');
  $('#fullname').text(fullname);
  $('#fullname2').text(fullname);
  $('#role').text(role);
  getAllIncidencesByEmployee();
});