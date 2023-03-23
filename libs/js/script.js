

$(document).ready(function() {
    navigator.geolocation.getCurrentPosition(success, error, {enableHighAccuracy: true});

    function success(position) {
        setupMap([position.coords.latitude, position.coords.longitude]);
    }

    function error(error) { setupMap([51, 0])}

    function setupMap(center) {
        let map = L.map('map', {maxZoom: 12}).setView(center, 5);

        let churchIcon = L.ExtraMarkers.icon({
            icon: 'fa-church',
            markerColor: 'green',
            shape: 'square',
            prefix: 'fa'
          });

        let beachIcon = L.ExtraMarkers.icon({
            icon: 'fa-umbrella-beach',
            markerColor: 'yellow',
            shape: 'square',
            prefix: 'fa'
          });

        let museumIcon = L.ExtraMarkers.icon({
            icon: 'fa-landmark',
            markerColor: 'brown',
            shape: 'square',
            prefix: 'fa'
          });

          let graveIcon = L.ExtraMarkers.icon({
            icon: 'fa-monument',
            markerColor: 'blue',
            shape: 'penta',
            prefix: 'fa'
          });

          let factoryIcon = L.ExtraMarkers.icon({
            icon: 'fa-industry',
            markerColor: 'purple',
            shape: 'square',
            prefix: 'fa'
          });

          let webcamIcon = L.ExtraMarkers.icon({
            icon: 'fa-video',
            markerColor: 'blue-dark',
            shape: 'square',
            prefix: 'fa'
          });

        $.ajax({
            url: 'libs/assets/countryBorders.geo.json',
            method: 'GET',
            dataType: 'json',
            success: function(result) {
                let countries = [];
                result.features.forEach(feature => countries.push(feature.properties.name));
                countries.sort();
                countries.forEach(country => {
                    country !== 'Somaliland' ? $('#country-select').append(`<option value="${country}">${country}</option>`) : null;
                })
            },
            error: function(error) {
                //console.log(error);
            }
        })

        let osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        var esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        });
        
        let jawg = L.tileLayer('https://{s}.tile.jawg.io/jawg-terrain/{z}/{x}/{y}{r}.png?access-token={accessToken}', {
        attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: 0,
        maxZoom: 12,
        subdomains: 'abcd', 
        accessToken: 'VjmxvGnuMceZhb8XQFy0NFj8RBrNhuby57ZIx7cxjggV6hXwmDBfx7aDdfWX3v5M'
        }).addTo(map);

        let markers = L.markerClusterGroup();

        let industryMarkers = L.markerClusterGroup();
        let beachMarkers = L.markerClusterGroup();
        let burialMarkers = L.markerClusterGroup();
        let museumMarkers = L.markerClusterGroup();
        let webcamMarkers = L.markerClusterGroup();

        L.easyButton('fa-info', function(btn, map) {
            $('#info-modal').modal('show');
            let whiteBackground = "https://i.stack.imgur.com/7JjU3.jpg";
            $('.close').on('click', () => {
                $('#info-modal').modal('hide');
                $('.flag img').attr('src', whiteBackground);
                $('#info-value-name').html('');
                $('#info-value-location').html('');
                $('#info-value-population').html('');
                $('#info-value-language').html('');
                $('#info-value-capital').html('');
                $('#info-value-drive_side').html('');
                $('#info-value-currency').html('');
            })

            let name = $('#country-select').val();
            name = name.split(" ").join("%20");

            $.ajax({
                url: 'libs/php/getCountryExtraInfo.php',
                method: 'POST',
                dataType: 'json',
                data: {
                    name: name
                },
                success: function(result) {
                    let languages = Object.values(result['data'][0]['languages']).join(', ');
                    let drive_side = result['data'][0]['car']['side'];
                    let currency = Object.values(result['data'][0]['currencies'])[0];
                    name = $('#country-select').val();
                    
                    $('#info-modal .modal-title').text(name);
                    $('.flag img').attr('src', result['data'][0]['flags']['svg']);
                    $('#info-value-name').html(result['data'][0]['name']['common'])
                    $('#info-value-location').html(result['data'][0]['subregion']);
                    $('#info-value-population').html((result['data'][0]['population']).toLocaleString());
                    $('#info-value-language').html(languages);
                    $('#info-value-capital').html(result['data'][0]['capital']);
                    $('#info-value-drive_side').html(drive_side.charAt(0).toUpperCase() + drive_side.substring(1));
                    $('#info-value-currency').html(currency.name);
                },
                error: function(error) {
                    //console.log(error);
                }
            })
        }).addTo(map);

        L.easyButton('<iconify-icon class="easyIcon" icon="cil:newspaper"></iconify-icon>', function(btn, map) {
            if ($('#modal') == null) return;

            $('#modal-title').html('');
            $('#modal-body').html('');

            $('#modal').addClass('active');
            $('#overlay').addClass('active');
            $('#modal-close').on('click', closeModal);
            $('#overlay').on('click', closeModal);

            $('#modal').css("width", "60%");
            $('#modal-body').css("align-items", "flex-start");

            if (window.innerWidth < 768) {
                $('#modal').css("width", "85%");
            } 

            function closeModal() {
                if ($('#modal') == null) return;
                $('#modal-title').html('');
                $('#modal-body').html('');
                $('#modal').removeClass('active');
                $('#overlay').removeClass('active');
            }

            let name = $('#country-select').val();
            name = name.split(" ").join("%20");

            $.ajax({
                url: 'libs/php/getHeadlines.php',
                method: 'POST',
                dataType: 'json',
                data: {
                    name: name
                },
                success: function(result) {
                    result.data.hits.forEach(article => {
                        article.created_at = new Date(article.created_at);
                        $('#modal-title').html('Headlines');
                        $('#modal-body').append('<div class="modal-block"><a class="modal-link" href="' + article.url +'" target="_blank"><div class="modal-headline">' + article.title + '</div></a><div class="block-footer"><div class="modal-author">' + article.author + '</div><div class="modal-date">' + article.created_at.toString().substring(0, 25) + '</div></div> </div>');
                        $('#modal-body').append('<span class="modal-divider"></span>');
                    })
                    
                    $('#modal').on('scroll', () => {
                        let modal = document.getElementById('modal');
                        if (modal.scrollTop > 0) {
                            $('#modal-header').css({"box-shadow" : "0px 3px 10px rgba(0, 0, 0, 0.1)", "position" : "sticky", "top" : "0px"});
                        }
                        if (modal.scrollTop == 0) {
                            $('#modal-header').css({"box-shadow" : "none"});
                        }
                    })
                },
                error: function(error) {
                    //console.log(error);
                }
            })
        }).addTo(map);

        let lat, lng;

        L.easyButton('<iconify-icon class="easyIcon" icon="material-symbols:weather-snowy-outline"></iconify-icon>', function(btn, map) {
            $('#weather-modal').modal('show');
            $('.close').on('click', () => {
                $('#weather-modal').modal('hide');
            })

            $.ajax({
                url: 'libs/php/getWeather.php',
                method: 'POST',
                dataType: 'json',
                data: {
                    lat: lat,
                    lng: lng
                },
                success: function(result) {
                    //console.log(result);

                    let weather = result['data']['weather'][0]['main'];
                    let wind = Math.round(result['data']['wind']['speed']) + 'mph';
                    let weatherDesc = result['data']['weather'][0]['description'];
                    let icon = result['data']['weather'][0]['icon'];
                    let temperature = result['data']['main']['temp'];
                    let temp_max = result['data']['main']['temp_max'];
                    let temp_min = result['data']['main']['temp_min'];
                    let humidity = result['data']['main']['humidity'];
                    let sunrise = result['data']['sys']['sunrise'];
                    let sunset = result['data']['sys']['sunset'];

                    sunrise = new Date(sunrise * 1000);
                    sunset = new Date(sunset * 1000);

                    sunrise = sunrise.toTimeString().substring(0, 5);
                    sunset = sunset.toTimeString().substring(0, 5);

                    temperature = Math.round(temperature - 273.15);
                    temp_max = Math.round(temp_max - 273.15);
                    temp_min = Math.round(temp_min - 273.15);
                    weatherDesc = weatherDesc.charAt(0).toUpperCase() + weatherDesc.substring(1);

                    $('.modal-header h1').text(result.data.name);
                    $('#weather-icon').attr('src', `https://openweathermap.org/img/wn/${icon}@2x.png`);
                    $('#weather-temp').html(temperature + '&deg;');
                    $('#weather-desc').text(weatherDesc);
                    $('.high-value').html(temp_max + '&deg;');
                    $('.low-value').html(temp_min + '&deg;');
                    $('.wind-value').text(wind);
                    $('.humidity-value').text(humidity);
                    $('.sunrise-value').text(sunrise);
                    $('.sunset-value').text(sunset);
                    
                },
                error: function(error) {
                    //console.log(error);
                }
            })

            $.ajax({
                url: 'libs/php/getForecastWeather.php',
                method: 'POST',
                dataType: 'json',
                data: {
                    lat: lat,
                    lng, lng
                },
                success: function (result) {
                    let time1 = result.data.list[0].dt_txt;
                    let time2 = result.data.list[1].dt_txt;
                    let time3 = result.data.list[2].dt_txt;
                    let time4 = result.data.list[3].dt_txt;
                    let time5 = result.data.list[4].dt_txt;
                    let icon1 = result.data.list[0].weather[0].icon;
                    let icon2 = result.data.list[1].weather[0].icon;
                    let icon3 = result.data.list[2].weather[0].icon;
                    let icon4 = result.data.list[3].weather[0].icon;
                    let icon5 = result.data.list[4].weather[0].icon;
                    let temp1 = result.data.list[0].main.temp;
                    let temp2 = result.data.list[1].main.temp;
                    let temp3 = result.data.list[2].main.temp;
                    let temp4 = result.data.list[3].main.temp;
                    let temp5 = result.data.list[4].main.temp;

                    temp1 = Math.round(temp1 - 273.15);
                    temp2 = Math.round(temp2 - 273.15);
                    temp3 = Math.round(temp3 - 273.15);
                    temp4 = Math.round(temp4 - 273.15);
                    temp5 = Math.round(temp5 - 273.15);

                    time1 = time1.substring(11, 13);
                    time2 = time2.substring(11, 13);
                    time3 = time3.substring(11, 13);
                    time4 = time4.substring(11, 13);
                    time5 = time5.substring(11, 13);

                    $('.weather-forecast-time-1').text(time1);
                    $('.weather-forecast-time-2').text(time2);
                    $('.weather-forecast-time-3').text(time3);
                    $('.weather-forecast-time-4').text(time4);
                    $('.weather-forecast-time-5').text(time5);

                    $('.weather-forecast-icon-1').attr('src', `https://openweathermap.org/img/wn/${icon1}@2x.png`);
                    $('.weather-forecast-icon-2').attr('src', `https://openweathermap.org/img/wn/${icon2}@2x.png`);
                    $('.weather-forecast-icon-3').attr('src', `https://openweathermap.org/img/wn/${icon3}@2x.png`);
                    $('.weather-forecast-icon-4').attr('src', `https://openweathermap.org/img/wn/${icon4}@2x.png`);
                    $('.weather-forecast-icon-5').attr('src', `https://openweathermap.org/img/wn/${icon5}@2x.png`);

                    $('.weather-forecast-temp-1').html(temp1 + '&deg;');
                    $('.weather-forecast-temp-2').html(temp2 + '&deg;');
                    $('.weather-forecast-temp-3').html(temp3 + '&deg;');
                    $('.weather-forecast-temp-4').html(temp4 + '&deg;');
                    $('.weather-forecast-temp-5').html(temp5 + '&deg;');

                },
                error: function(error) {
                    //console.log(error);
                }
            })
        }).addTo(map);

        L.easyButton('fa-wikipedia-w', function(btn, map) {
            $('#wikipedia-modal').modal('show');
            let whiteBackground = "https://i.stack.imgur.com/7JjU3.jpg";
            
            $('.close').on('click', () => {
                $('#wikipedia-modal').modal('hide');
                $('.wikipedia-image').attr('src', whiteBackground);
                $('#wikipedia-extract').html('');
                $('.modal-title').html('');

            })

            let name = $('#country-select').val();
            name = name.split(" ").join("%20");

            $.ajax({
                url: 'libs/php/getWikipediaExtract.php',
                method: 'POST',
                dataType: 'json',
                data: {
                    name: name
                },
                success: function(result) {
                    let extract = Object.values(result.data.query.pages)[0].extract;
                    let name = $('#country-select').val();
                    name = name.split(" ").join("+");
                    $.ajax({
                        url: 'libs/php/getImages.php',
                        method: 'POST',
                        dataType: 'json',
                        data: {
                            name: name
                        },
                        success: function(result) {
                            name = $('#country-select').val();
                            $('.modal-title').html(name);
                            $('.wikipedia-image').attr('src', result.data.hits[0].largeImageURL);
                            $('#wikipedia-extract').html(extract.substring(0, 300) + '...');
                            $('#more-button').on('click touch', () => {
                                name = $('#country-select').val();
                                window.open(
                                    `https://en.wikipedia.org/wiki/${name.split(" ").join("_")}`,
                                    '_blank'
                                );
                            })
                        },
                        error: function(result) {
                            //console.log(error);
                        } 
                    })
                },
                error: function(error) {
                    //console.log(error);
                }
            })
        }).addTo(map);

        $.ajax({
            url: 'libs/php/getCoordinateInfo.php',
            method: 'POST',
            dataType: 'json',
            data: {
                lat: center[0],
                lng: center[1]
            },
            success: function(result) {
                let iso_code = result['data'][0]['components']['ISO_3166-1_alpha-3'];
                let name = result['data'][0]['components']['country'];

                $('#country-select').val(name);
                selectCountry();

                fetch("libs/assets/countryBorders.geo.json")
                    .then(response => response.json())
                    .then(json => {
                        let geojson = json;
                        let layer = L.geoJSON(geojson, {
                            filter: function(feature) {
                                if (feature.properties.iso_a3 === iso_code) return true
                            },
                            style: {
                                "color": "blue",
                                "fillColor": "blue",
                                "weight": 2,
                                "opacity": 0.9,
                                "fillOpacity": 0.1
                            }
                        }).addTo(map);
                    });
            },
            error: function(error) {
                //console.log(error);
            }
        })

        if (window.innerWidth < 768) {
            $('#select-container').css("width", "40%")
        }

        $(window).on('resize', () => {
            if (window.innerWidth < 768) {
                $('#modal').css("width", "85%");
                $('#select-container').css("width", "40%")
            } else {
                $('#modal').css("width", "40%");
                $('#select-container').css("width", "20%")
            }
        })
        
        map.on('click', (event) => {
            lat = event.latlng.lat;
            lng = event.latlng.lng;

            $.ajax({
                url: 'libs/php/getCoordinateInfo.php',
                method: 'POST',
                dataType: 'json',
                data: {
                    lat: event.latlng.lat,
                    lng: event.latlng.lng
                },
                success: function(result) {
                    let iso_code = result['data'][0]['components']['ISO_3166-1_alpha-3']; 
                    let iso_code_2 =  result['data'][0]['components']['ISO_3166-1_alpha-2']; 

                    if (iso_code) {
                        $('#country-select').val(result['data'][0]['components']['country']);

                        map.eachLayer(function (layer) {
                            if (!layer._url) {
                                map.removeLayer(layer);
                            }
                        });

                        markers.clearLayers();
                        industryMarkers.clearLayers();
                        beachMarkers.clearLayers();
                        burialMarkers.clearLayers();
                        museumMarkers.clearLayers();
                        webcamMarkers.clearLayers();
            
                        $.ajax({
                            url: 'libs/assets/countryBorders.geo.json',
                            method: 'GET',
                            dataType: 'json',
                            success: function(result) {
                                let layer = L.geoJSON(result, {
                                    filter: function(feature) {
                                        if (feature.properties.iso_a3 === iso_code) return true
                                    },
                                    style: {
                                        "color": "blue",
                                        "fillColor": "blue",
                                        "weight": 2,
                                        "opacity": 0.9,
                                        "fillOpacity": 0.1
                                    }
                                }).addTo(map);
                                
                                map.fitBounds(layer.getBounds());
            
                                $.ajax({
                                    url: 'libs/php/getPlacesInfo.php',
                                    method: 'POST',
                                    dataType: 'json',
                                    data: {
                                        lon_min: layer.getBounds()._southWest.lng,
                                        lon_max: layer.getBounds()._northEast.lng,
                                        lat_min: layer.getBounds()._southWest.lat,
                                        lat_max: layer.getBounds()._northEast.lat,
                                    },
                                    success: function(result) {
                                        let data = [];
                                        for (let i=0; i<15; i++) {
                                            let random = Math.floor(Math.random() * result.data.length);
                                            data.push(result.data[random]);
                                        }
                                        data.forEach(item => {
                                            let kind = item.kinds.includes('religion') ? "religion" : item.kinds.includes('beaches') ? "beach" : item.kinds.includes('museums') ? "museum" : item.kinds.includes('burial_places') ? "burial" : "industry";
                                            let marker = L.marker([item.point.lat, item.point.lon], {icon: kind == 'religion' ? churchIcon : kind == 'beach' ? beachIcon : kind == 'museum' ? museumIcon : kind == 'burial' ? graveIcon : factoryIcon});
                                            kind == 'religion' ? markers.addLayer(marker) : kind == 'beach' ? beachMarkers.addLayer(marker) : kind == 'museum' ? museumMarkers.addLayer(marker) : kind == 'burial' ? burialMarkers.addLayer(marker) : industryMarkers.addLayer(marker);
                                            $(marker).on('click', () => {
                                                $.ajax({
                                                    url: "libs/php/getExtraInfo.php",
                                                    method: 'POST',
                                                    dataType: 'json',
                                                    data: {
                                                        xid: item.xid
                                                    },
                                                    success: function(result) {
                                                        let prefix = result.data.kinds.includes('religion') ? 'Church in ' : result.data.kinds.includes('beaches') ? "Beach in " : result.data.kinds.includes('museums') ? "Museum in " : result.data.kinds.includes('burial_places') ? 'Burial place in ' : 'Industrial facility in ';
                                                        marker.bindPopup(result.data.name ? result.data.name : result.data.address.city ? prefix + result.data.address.city : result.data.address.village ? prefix + result.data.address.village : prefix + result.data.address.country).openPopup();
                                                        if (result.data.preview && result.data.wikipedia_extracts.text) {
                                                            marker.bindPopup(`<div class="popup-body">
                                                            <div class="popup-title">
                                                                <img src="${result.data.preview.source}">
                                                                <h4 class="popup-title">${result.data.name}</h4>
                                                            </div>
                                                            <p class="popup-description">${result.data.wikipedia_extracts.text.length > 200 ? result.data.wikipedia_extracts.text.substring(0, 200) + '...' : result.data.wikipedia_extracts.text}</p>
                                                            <button id="more-button">More info</button>
                                                        </div>`).openPopup();
                                                        $('#more-button').on('click touch', () => {
                                                            window.open(
                                                                `${result.data.wikipedia}`,
                                                                '_blank'
                                                                );
                                                        })
                                                        }
                                                    },
                                                    error: function(error) {/*console.log(error)*/}
                                                })
                                            })  
                                        })
                                    },
                                    error: function(error) {
                                        //console.log(error);
                                    }
                                })
                                map.addLayer(markers);
                                map.addLayer(industryMarkers);
                                map.addLayer(beachMarkers);
                                map.addLayer(museumMarkers);
                                map.addLayer(burialMarkers);

                                $.ajax({
                                    url: 'libs/php/getWebcams.php',
                                    method: 'POST',
                                    dataType: 'json',
                                    data: {
                                        iso_code: iso_code_2
                                    },
                                    success: function(result) {
                                        result.data.result.webcams.forEach(webcam => {
                                            let marker = L.marker([webcam.location.latitude, webcam.location.longitude], {icon: webcamIcon});
                                            webcamMarkers.addLayer(marker);
                                            $(marker).on('mouseover', () => {
                                                let lastUpdate = new Date(webcam.image.update * 1000);
                                                lastUpdate = lastUpdate.toString().substring(0, 25);
                                                marker.bindPopup(`<div class="d-flex flex-column align-items-center"><iframe class="webcam-iframe" src="${webcam.player.day.embed}" allowfullscreen="true" style="width: 200px; height: 110px;"></iframe><span>${lastUpdate}</span></div>`).openPopup();
                                            });
                                            $(marker).on('mouseout', () => {
                                                marker.closePopup();
                                            })
                                            $(marker).on('click', () => {
                                                $('#webcam-modal').modal('show');
                                                $('.webcam-iframe').remove();
                                                $('.iframe-container').append(`<iframe class="webcam-iframe" src="${webcam.player.day.embed}" allowfullscreen="true"></iframe>`)
                                                $('.close').on('click', () => {
                                                    $('#webcam-modal').modal('hide');
                                                })

                                                $('.webcam-title').html(webcam.title);
                                                $('.webcam-location').html('<iconify-icon class="webcam-location-icon" icon="mdi:place-outline"></iconify-icon>' + webcam.location.city + ', ' + webcam.location.region);
                                                $('.webcam-views').html('<iconify-icon class="webcam-views-icon" icon="ic:outline-remove-red-eye"></iconify-icon>' + webcam.statistics.views);
                                            })

                                            $('.webcam-select').on('change', () => {
                                                $('.webcam-iframe').remove();
                                                let value = $('.webcam-select').val();
                                                if (webcam.player.day.embed && value == '24 hours') {
                                                    $('.iframe-container').append(`<iframe class="webcam-iframe" src="${webcam.player.day.embed}" allowfullscreen="true"></iframe>`)
                                                } else if (webcam.player.month.embed && value == '30 days') {
                                                    $('.iframe-container').append(`<iframe class="webcam-iframe" src="${webcam.player.month.embed}" allowfullscreen="true"></iframe>`)
                                                } else if (webcam.player.year.embed && value == '12 months') {
                                                    $('.iframe-container').append(`<iframe class="webcam-iframe" src="${webcam.player.year.embed}" allowfullscreen="true"></iframe>`)
                                                } else if (webcam.player.lifetime.embed && value == 'lifetime') {
                                                    $('.iframe-container').append(`<iframe class="webcam-iframe" src="${webcam.player.lifetime.embed}" allowfullscreen="true"></iframe>`)
                                                }
                                            })
                                        })
                                    },
                                    error: function(error) {
                                        //console.log(error);
                                    }
                                })

                                map.addLayer(webcamMarkers);
                            },
                            error: function(error) {
                                //console.log(error);
                            }
                        })
                        map.flyTo([event.latlng.lat, event.latlng.lng]);
                    }
                },
                error: function(error) {
                    //console.log(error);
                }
            });
        });

        $('#country-select').on('change', selectCountry);

        function selectCountry() {
            let name = $('#country-select').val();
            name = name.split(" ").join("%20");

            if (name !== "Select%20country") {
                $.ajax({
                    url: 'libs/php/getCountryInfo.php',
                    method: 'POST',
                    dataType: 'json',
                    data: {
                        name: JSON.stringify(name)
                    },
                    success: function(result) {
                        let iso_code = result['data']['results'][0]['components']['ISO_3166-1_alpha-3'];  
                        let iso_code_2 = result['data']['results'][0]['components']['ISO_3166-1_alpha-2'];  
                        let coordinates = result['data']['results'][0]['geometry'];

                        lat = coordinates.lat;
                        lng = coordinates.lng;

                        map.eachLayer(function (layer) {
                            if (!layer._url) {
                                map.removeLayer(layer);
                            }
                        });

                        markers.clearLayers();
                        industryMarkers.clearLayers();
                        beachMarkers.clearLayers();
                        burialMarkers.clearLayers();
                        museumMarkers.clearLayers();
                        webcamMarkers.clearLayers();

                        $.ajax({
                            url: 'libs/assets/countryBorders.geo.json',
                            method: 'GET',
                            dataType: 'json',
                            success: function(result) {
                                let layer = L.geoJSON(result, {
                                    filter: function(feature) {
                                        if (feature.properties.iso_a3 === iso_code) return true
                                    },
                                    style: {
                                        "color": "blue",
                                        "fillColor": "blue",
                                        "weight": 2,
                                        "opacity": 0.9,
                                        "fillOpacity": 0.1
                                    }
                                }).addTo(map);
                                
                                map.fitBounds(layer.getBounds());
            
                                $.ajax({
                                    url: 'libs/php/getPlacesInfo.php',
                                    method: 'POST',
                                    dataType: 'json',
                                    data: {
                                        lon_min: layer.getBounds()._southWest.lng,
                                        lon_max: layer.getBounds()._northEast.lng,
                                        lat_min: layer.getBounds()._southWest.lat,
                                        lat_max: layer.getBounds()._northEast.lat,
                                    },
                                    success: function(result) {
                                        if (!result.data.error) {
                                            let data = [];
                                            for (let i=0; i<15; i++) {
                                                let random = Math.floor(Math.random() * 500);
                                                data.push(result.data[random]);
                                            }
                                            data.forEach(item => {
                                                let kind = item.kinds.includes('religion') ? "religion" : item.kinds.includes('beaches') ? "beach" : item.kinds.includes('museums') ? "museum" : item.kinds.includes('burial_places') ? "burial" : "industry";
                                                let marker = L.marker([item.point.lat, item.point.lon], {icon: kind == 'religion' ? churchIcon : kind == 'beach' ? beachIcon : kind == 'museum' ? museumIcon : kind == 'burial' ? graveIcon : factoryIcon});
                                                kind == 'religion' ? markers.addLayer(marker) : kind == 'beach' ? beachMarkers.addLayer(marker) : kind == 'museum' ? museumMarkers.addLayer(marker) : kind == 'burial' ? burialMarkers.addLayer(marker) : industryMarkers.addLayer(marker);
                                                $(marker).on('click', () => {
                                                    $.ajax({
                                                        url: "libs/php/getExtraInfo.php",
                                                        method: 'POST',
                                                        dataType: 'json',
                                                        data: {
                                                            xid: item.xid
                                                        },
                                                        success: function(result) {
                                                            let prefix = result.data.kinds.includes('religion') ? 'Church in ' : result.data.kinds.includes('beaches') ? "Beach in " : result.data.kinds.includes('museums') ? "Museum in " : result.data.kinds.includes('burial_places') ? 'Burial place in ' : 'Industrial facility in ';
                                                            marker.bindPopup(result.data.name ? result.data.name : result.data.address.city ? prefix + result.data.address.city : result.data.address.village ? prefix + result.data.address.village : prefix + result.data.address.country).openPopup();
                                                            if (result.data.preview && result.data.wikipedia_extracts.text) {
                                                                marker.bindPopup(`<div class="popup-body">
                                                                <div class="popup-title">
                                                                    <img src="${result.data.preview.source}">
                                                                    <h4 class="popup-title">${result.data.name}</h4>
                                                                </div>
                                                                <p class="popup-description">${result.data.wikipedia_extracts.text.length > 200 ? result.data.wikipedia_extracts.text.substring(0, 200) + '...' : result.data.wikipedia_extracts.text}</p>
                                                                <button id="more-button">More info</button>
                                                            </div>`).openPopup();
                                                            $('#more-button').on('click touch', () => {
                                                                window.open(
                                                                    `${result.data.wikipedia}`,
                                                                    '_blank'
                                                                    );
                                                            })
                                                            }
                                                        },
                                                        error: function(error) {/*console.log(error)*/}
                                                    })
                                                })  
                                            })
                                        }
                                    },
                                    error: function(error) {
                                        //console.log(error);
                                    }
                                })
                                map.addLayer(markers);
                                map.addLayer(industryMarkers);
                                map.addLayer(beachMarkers);
                                map.addLayer(museumMarkers);
                                map.addLayer(burialMarkers);

                                $.ajax({
                                    url: 'libs/php/getWebcams.php',
                                    method: 'POST',
                                    dataType: 'json',
                                    data: {
                                        iso_code: iso_code_2
                                    },
                                    success: function(result) {
                                        result.data.result.webcams.forEach(webcam => {
                                            let marker = L.marker([webcam.location.latitude, webcam.location.longitude], {icon: webcamIcon});
                                            webcamMarkers.addLayer(marker);
                                            $(marker).on('mouseover', () => {
                                                let lastUpdate = new Date(webcam.image.update * 1000);
                                                lastUpdate = lastUpdate.toString().substring(0, 25);
                                                marker.bindPopup(`<div class="d-flex flex-column align-items-center"><iframe class="webcam-iframe" src="${webcam.player.day.embed}" allowfullscreen="true" style="width: 200px; height: 110px;"></iframe><span>${lastUpdate}</span></div>`).openPopup();
                                            });
                                            $(marker).on('mouseout', () => {
                                                marker.closePopup();
                                            })
                                            $(marker).on('click', () => {
                                                $('#webcam-modal').modal('show');
                                                $('.webcam-iframe').remove();
                                                $('.iframe-container').append(`<iframe class="webcam-iframe" src="${webcam.player.day.embed}" allowfullscreen="true"></iframe>`)
                                                $('.close').on('click', () => {
                                                    $('#webcam-modal').modal('hide');
                                                })

                                                $('.webcam-title').html(webcam.title);
                                                $('.webcam-location').html('<iconify-icon class="webcam-location-icon" icon="mdi:place-outline"></iconify-icon>' + webcam.location.city + ', ' + webcam.location.region);
                                                $('.webcam-views').html('<iconify-icon class="webcam-views-icon" icon="ic:outline-remove-red-eye"></iconify-icon>' + webcam.statistics.views);
                                            })
                                        })
                                    },
                                    error: function(error) {
                                        //console.log(error);
                                    }
                                })
                                map.addLayer(webcamMarkers);
                            },
                            error: function(error) {
                                //console.log(error);
                            }
                        })
                        map.flyTo([coordinates.lat, coordinates.lng]);
                    },
                    error: function(error) {
                        //console.log(error);
                    }
                })
            }
        }

        let baseMaps = {
            "OpenStreetMap": osm,
            "Jawg": jawg,
            "Esri": esri
        };

        let overlayMaps = {
            "Industry": industryMarkers,
            "Museums": museumMarkers,
            "Burials/Monuments": burialMarkers,
            "Churches": markers,
            "Webcams": webcamMarkers,
            "Beaches": beachMarkers
        }

        let layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);
    }
    
    setTimeout(() => {
        $('#preloader').hide();
    }, 3500)
});