import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import stations from './stations.json';

interface RecStationsProps {
  userLat: string;
  userLong: string;
}

interface StationResult {
  name: string;
  distance: number;
  walkingTime: number;
}

// calculate distance to station
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// calculate walking time
const getWalkingTime = (distanceInKm: number) => {
  const speed = 5.0; 
  const timeInHours = distanceInKm / speed;
  return Math.ceil(timeInHours * 60); // Convert to minutes and round up
};

const RecStations = ({ userLat, userLong }: RecStationsProps) => {
  const [northStation, setNorthStation] = useState<StationResult | null>(null);
  const [southStation, setSouthStation] = useState<StationResult | null>(null);

  useEffect(() => {
    const lat = parseFloat(userLat);
    const long = parseFloat(userLong);

    if (isNaN(lat) || isNaN(long)) {
        setNorthStation(null);
        setSouthStation(null);
        return;
    }

    // filter and sort stations
    let closestN: StationResult | null = null;
    let closestS: StationResult | null = null;
    let minDistN = Infinity;
    let minDistS = Infinity;

    stations.forEach((station) => {
        const dist = getDistance(lat, long, station.lat, station.long);

        const stationData = {
            name: station.name,
            distance: dist,
            walkingTime: getWalkingTime(dist)
        };

      if (station.lat > lat) {
        // Station is North (and east?) of user
        if (dist < minDistN) {
            minDistN = dist;
            closestN = stationData;}
      } else {
        // Station is South (and west?) of user
        if (dist < minDistS) {
          minDistS = dist;
          closestS = stationData;
        }
      }
    });

    setNorthStation(closestN || null);
    setSouthStation(closestS || null);

  }, [userLat, userLong]);

  const renderStationInfo = (label: string, data: StationResult | null) => {
    if (!data) {
        return (
            <View style={styles.infoBlock}>
                <Text style={styles.label}>{label}</Text>
                <Text style={styles.placeholder}>Enter location to find station</Text>
            </View>
        );
    }
    return (
        <View style={styles.infoBlock}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.stationName}>{data.name}</Text>
            <Text style={styles.details}>
                Distance: {data.distance.toFixed(2)} km
            </Text>
            <Text style={styles.details}>
                Walk Time: ~{data.walkingTime} mins
            </Text>
        </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderStationInfo("North Recommended Station:", northStation)}
      <View style={styles.separator} />
      {renderStationInfo("South Recommended Station:", southStation)}
      {/* <Text style={{color: 'red', marginTop: 20}}>
      DEBUG SYSTEM:
      Input Lat: {userLat}
      Input Long: {userLong}
      </Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoBlock: {
    alignItems: 'center',
    marginVertical: 10,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  stationName: {
    fontSize: 18,
    color: '#2c3e50',
    fontWeight: '600',
  },
  details: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  placeholder: {
    fontStyle: 'italic',
    color: '#bdc3c7',
  },
  separator: {
    height: 1,
    width: '80%',
    backgroundColor: '#eee',
    marginVertical: 10,
  }
});

export default RecStations;