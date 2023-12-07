const updateDynamicCache = (cacheName, req, res) =>{
    if(res.ok){
        return caches.open(cacheName).then((cache)=>{
            cache.put(req, res.clone());
            return res.clone();
        })
    }else{
        return res;
    }
}

const updateStaticCache = (cacheName, res, APP_SHELL_INMUTABLE) =>{
    if(!APP_SHELL_INMUTABLE.includes(req.url)){
        return fetch(req).then((response)=>{
            return updateDynamicCache(cacheName, req, response);
        })
    }
}

const apiIncidenceManager = (cacheName, req) =>{
    //Only network
    //todas aquellas apis que obligatoriamente necesitan internet
    if(req.url.indexOf('/api/notification/') >= 0 ||
    req.url.indexOf('api/auth') >= 0)
        return fetch(req);
    //network with cache fallback / update
    if(req.clone().method === 'POST'){
        if(self.registration.sync && !navigator.onLine){
            return req.clone().text().then((body)=>{
                return saveIncidence(JSON.parse(body))
            });
        }else{
            return fetch(req);
        }
    }else{
        return fetch(req).then(response=>{
            if(response.ok){
                updateDynamicCache(cacheName, req, response.clone());
                return response.clone();
            }else{
                return caches.match(req);
            }
        }).catch((err)=> caches.match(req));
    }
}