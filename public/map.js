 // Map initialization 
    var map = L.map('map').setView([28.3949, 84.1240], 8);



    const mapLink =
        '<a href="http://www.esri.com/">Esri</a>';
    wholink =
        'i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    L.tileLayer(
        'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '&copy; ' + mapLink + ', ' + wholink,
        maxZoom: 19,
    }).addTo(map);

    L.control.locate().addTo(map);
    
    

    map.on('locationfound', (resp) => {
    
    console.log('Lat: ', resp.latitude, 'Long: ', resp.longitude)
    
    const data = { lat:resp.latitude, long: resp.longitude};
    
          const options = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          };
          
          const response = fetch("http://localhost:3000/api/post", options);
    });
    
  
    
