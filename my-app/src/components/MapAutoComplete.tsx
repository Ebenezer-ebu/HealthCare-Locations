import React, { Component } from 'react';
import { AutoComplete } from 'antd';

class MapAutoComplete extends Component {
  constructor(props: Readonly<{}>) {
    super(props);
    this.state = {
      suggestionts: [],
      dataSource: [],
      nigeriaLatLng: this.props.nigeriaLatLng,
      autoCompleteService: this.props.autoCompleteService,
      geoCoderService: this.props.geoCoderService,
    }
  }

  // Runs after clicking away from the input field or pressing 'enter'.
  // Geocode the location selected to be created as a marker.
  onSelect = ((value: any) => {
    this.state.geoCoderService.geocode({ address: value }, ((response: { geometry: { location: any; }; }[]) => {
      const { location } = response[0].geometry;
      this.props.addMarker(location.lat(), location.lng(), this.props.markerName);
    }))
  });


  // Runs a search on the current value as the user types in the AutoComplete field.
  handleSearch = ((value: string | any[]) => {
    const { autoCompleteService, nigeriaLatLng } = this.state;
    // Search only if there is a string
    if (value.length > 0) {
      const searchQuery = {
        input: value,
        location: nigeriaLatLng, // Search in Nigeria
        radius: 30000, // With a 30km radius
      };
      autoCompleteService.getQueryPredictions(searchQuery, ((response: any[]) => {
        // The name of each GoogleMaps suggestion object is in the "description" field
        if (response) {
          const dataSource = response.map((resp) => resp.description);
          this.setState({ dataSource, suggestions: response });
        }
      }));
    }
  });

  render() {
    const { dataSource }  = this.state;
    return (
      <AutoComplete
        className="w-100"
        dataSource={dataSource}
        onSelect={this.onSelect}
        onSearch={this.handleSearch}
        placeholder="Address"
      />
    );
  }
}

export default MapAutoComplete;