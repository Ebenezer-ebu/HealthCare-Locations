import React, { Component } from 'react';
import GoogleMapReact from 'google-map-react';
import MapAutoComplete from '../components/MapAutoComplete';
import MapMarker from '../components/MapMarker';
import PlaceCard from '../components/PlaceCard';
import ConstraintSlider from '../components/ConstraintSlider';

import { Button, Input, Divider, message } from 'antd';
import { type } from 'os';

const NG_COOR = { lat: 1.3521, lng: 103.8198 };
type Constraints = {
    name: string;
    time: number
};

type State = {
    constraints: Array<Constraints>;
    searchResults: Array<any>;
    mapsLoaded: boolean;
    markers: Array<any>;
    map: {},
    mapsApi: {},
    nigeriaLatLng: {},
    autoCompleteService: {},
    placesService: {},
    geoCoderService: {},
    directionService: {},
}

class MapContainer extends Component<any, State> {
    constructor(props: Readonly<{}>) {
        super(props);
        this.state = {
          constraints: [{ name: '', time: 0 }],
          searchResults: [],
          mapsLoaded: false,
          markers: [],
          map: {},
          mapsApi: {},
          nigeriaLatLng: {},
          autoCompleteService: {},
          placesService: {},
          geoCoderService: {},
          directionService: {},
        };
    }
    // Update name for constraint with index === key
  updateConstraintName = ((event: { preventDefault: () => void; target: { value: any; }; }, key: React.ReactText) => {
    event.preventDefault();
    const prevConstraints = this.state.constraints;
    const constraints: Constraints[] = Object.assign([], prevConstraints);
    constraints[key].name = event.target.value;
    this.setState({ constraints });
  });

  // Updates distance (in KM) for constraint with index == key
  updateConstraintTime = ((key: React.ReactText, value: any) => {
    const prevConstraints = this.state.constraints;
    const constraints = Object.assign([], prevConstraints);
    constraints[key].time = value;
    this.setState({ constraints });
  });

  // Adds a Marker to the GoogleMaps component
  addMarker = ((lat: any, lng: any, name: any) => {
    const prevMarkers = this.state.markers;
    const markers: any[] = Object.assign([], prevMarkers);

    // If name already exists in marker list just replace lat & lng.
    let newMarker = true;
    for (let i = 0; i < markers.length; i++) {
      if (markers[i].name === name) {
        newMarker = false;
        markers[i].lat = lat;
        markers[i].lng = lng;
        message.success(`Updated "${name}" Marker`);
        break;
      }
    }

    // Name does not exist in marker list. Create new marker
    if (newMarker) {
        markers.push({ lat, lng, name });
        message.success(`Added new "${name}" Marker`);
      }
  
      this.setState({ markers });
    });

    // Runs once when the Google Maps library is ready
  // Initializes all services that we need
  apiHasLoaded = ((map: any, mapsApi: { LatLng: new (arg0: number, arg1: number) => any; places: { AutocompleteService: new () => any; PlacesService: new (arg0: any) => any; }; Geocoder: new () => any; DirectionsService: new () => any; }) => {
    this.setState({
      mapsLoaded: true,
      map,
      mapsApi,
      nigeriaLatLng: new mapsApi.LatLng(NG_COOR.lat, NG_COOR.lng),
      autoCompleteService: new mapsApi.places.AutocompleteService(),
      placesService: new mapsApi.places.PlacesService(map),
      geoCoderService: new mapsApi.Geocoder(),
      directionService: new mapsApi.DirectionsService(),
    });
  });

   // With the constraints, find locations with Health care 
   handleSearch = (() => {
    const { markers, constraints, placesService, directionService, mapsApi } = this.state;
    if (markers.length === 0) {
      message.warn('Add a constraint and try again!');
      return;
    }
    const filteredResults: { name: any; rating: any; address: any; openNow: boolean; priceLevel: any; photoUrl: string; distanceText: any; timeText: any; }[] = [];
    const marker = markers[0];
    const timeLimit = constraints[0].time;
    const markerLatLng = new mapsApi.LatLng(marker.lat, marker.lng);

    const placesRequest = {
        location: markerLatLng,
        type: ['hospital', 'pharmacy'], // List of types: https://developers.google.com/places/supported_types
        query: 'hospital',
        rankBy: mapsApi.places.RankBy.DISTANCE, 
    };

    // First, search for hospitals.
    placesService.textSearch(placesRequest, ((response: string | any[]) => {
        // Only look at the nearest top 5.
        const responseLimit = Math.min(5, response.length);
        for (let i = 0; i < responseLimit; i++) {
          const hospitalCare = response[i];
          const { rating, name } = hospitalCare;
          const address = hospitalCare.formatted_address; // e.g 80 mandai Lake Rd,
          const priceLevel = hospitalCare.price_level; // 1, 2, 3...
          let photoUrl = '';
          let openNow = false;
          if (hospitalCare.opening_hours) {
            openNow = hospitalCare.opening_hours.open_now; // e.g true/false
          }
          if (hospitalCare.photos && hospitalCare.photos.length > 0) {
            photoUrl = hospitalCare.photos[0].getUrl();
          }
          
          // Second, For each hospitalCare, check if it is within acceptable travelling distance
        const directionRequest = {
            origin: markerLatLng,
            destination: address, // Address of hospital
            travelMode: 'DRIVING',
          }
          directionService.route(directionRequest, ((result: { routes: { legs: any[]; }[]; }, status: string) => {
            if (status !== 'OK') { return }
            const travellingRoute = result.routes[0].legs[0]; // { duration: { text: 1mins, value: 600 } }
            const travellingTimeInMinutes = travellingRoute.duration.value / 60;
            if (travellingTimeInMinutes < timeLimit) {
              const distanceText = travellingRoute.distance.text; // 6.4km
              const timeText = travellingRoute.duration.text; // 11 mins
              filteredResults.push({
                name,
                rating,
                address,
                openNow,
                priceLevel,
                photoUrl,
                distanceText,
                timeText,
              });
            }
            // Finally, Add results to state
            this.setState({ searchResults: filteredResults });
          }));
        }
      }));
    });
  
    render() {
        const { constraints, mapsLoaded, nigeriaLatLng, markers, searchResults } = this.state;
        const { autoCompleteService, geoCoderService } = this.state; // Google Maps Services
        return (
          <div className="w-100 d-flex py-4 flex-wrap justify-content-center">
            <h1 className="w-100 fw-md">24 Hours Health Care</h1>
            {/* Constraints section */}
            <section className="col-4">
              {mapsLoaded ?
                <div>
                  {constraints.map((constraint: { name: any; time: any; }, key: string | number | undefined) => {
                    const { name, time } = constraint;
                    return (
                      <div key={key} className="mb-4">
                        <div className="d-flex mb-2">
                          <Input className="col-4 mr-2" placeholder="Name" onChange={(event) => this.updateConstraintName(event, key)} />
                          <MapAutoComplete
                            autoCompleteService={autoCompleteService}
                            geoCoderService={geoCoderService}
                            nigeriaLatLng={nigeriaLatLng}
                            markerName={name}
                            addMarker={this.addMarker}
                          /> 
                        </div>
                        <ConstraintSlider
                          iconType="car"
                          value={time}
                          onChange={(value: any) => this.updateConstraintTime(key, value)}
                          text="Minutes away by car"
                        />

                        <Divider />
                      </div>
                    );
                  })}
                </div>
                : null
              }
            </section>
    
            {/* Maps Section */}
            <section className="col-8 h-lg">
            <GoogleMapReact
            bootstrapURLKeys={{
            key: 'AIzaSyDd0ZWRTMUEqE2OMBPsHtjfWdYTr5wqspk',
            libraries: ['places', 'directions']
          }}
          defaultZoom={11} // Supports DP, e.g 11.5
          defaultCenter={{ lat: NG_COOR.lat, lng: NG_COOR.lng }}  
          yesIWantToUseGoogleMapApiInternals={true}
          onGoogleApiLoaded={({ map, maps }) => this.apiHasLoaded(map, maps)}
        >
          {/* Pin markers on the Map*/}
          {markers.map((marker: { name: any; lat: any; lng: any; }, key: any) => {
              const { name, lat, lng } = marker;
              return (
                <MapMarker key={key} name={name} lat={lat} lng={lng} />
              );
            })}
        </GoogleMapReact>
      </section>
   {/* Search Button */}
    <Button className="mt-4 fw-md" type="primary" size="large" onClick={this.handleSearch}>Search!</Button>

    {/* Results section */}
    {searchResults.length > 0 ?
  <>
    <Divider />
    <section className="col-12">
      <div className="d-flex flex-column justify-content-center">
        <h1 className="mb-4 fw-md">Tadah! Ice-Creams!</h1>
        <div className="d-flex flex-wrap">
          {searchResults.map((result: any, key: any) => (
            <PlaceCard info={result} key={key} />
          ))}
            </div>
            </div>
            </section>
        </>
        : null}
        </div>
        )
    }
}

export default MapContainer;