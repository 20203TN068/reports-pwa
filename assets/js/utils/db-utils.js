const incidencesDB = new PouchDB('incidences');

// self es practicamente un this
// guardar la incidencia en la bd del navegador cuando estemos offline
const saveIncidence = (incidence) =>{
    incidence._id = new Date().toISOString();
    return incidencesDB.put(incidence)
    .then((result)=>{
        self.registration.sync.register('incidence-post');
        const response = {
            registered: true,
            offline: true
        };
        return new Response(JSON.stringify(response));
    }).catch((err)=>{
        console.log(err);
        const response = {
            registered: false,
            offline: true
        };
        return new Response(JSON.stringify(response));
    })
}

// subir todos los datos a la api y borra los datos del navegador para no almacenar info que no sirve
const savePostIncidences = () =>{
    const incidences = [];
    //devuelve una promesa con los docs de la bd
    return incidencesDB.allDocs({include_docs: true})
    .then(async(docs)=>{
        const { rows } = docs;
        // forof tiene mejor rendimiento / foreach
        for (const row of rows) {
            const { doc } = row; //equivalente al incidence que registré
            const response = await fetch(`http://206.189.234.55:3001/api/incidences/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(doc),
            })
            const data = await response.json();
            if(data['changed']){
                incidences.push(incidencesDB.remove(doc));
                return incidencesDB.remove(doc);
            }
        }
        const message = self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
                client.postMessage({type: 'RELOAD_PAGE_AFTER_SYNC'});
            });
        });
        return Promise.all([...incidences, getAllIncidencesPending()]);
    });
};
