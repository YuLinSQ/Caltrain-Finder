import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, View, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

// 511.org API Configuration
const API_KEY = '245c6a13-c63a-40b8-b374-ff00bcd0697b';
const AGENCY = 'CT';

// NB = Northbound, SB = Southbound
const STATION_IDS: { [key: string]: { NB: string, SB: string } } = {
  'San Francisco 4th & King': { NB: '70011', SB: '70012' },
  '22nd Street': { NB: '70021', SB: '70022' },
  'Bayshore': { NB: '70031', SB: '70032' },
  'South San Francisco': { NB: '70041', SB: '70042' },
  'San Bruno': { NB: '70051', SB: '70052' },
  'Millbrae': { NB: '70061', SB: '70062' },
  'Broadway': { NB: '70071', SB: '70072' },
  'Burlingame': { NB: '70081', SB: '70082' },
  'San Mateo': { NB: '70091', SB: '70092' },
  'Hayward Park': { NB: '70101', SB: '70102' },
  'Hillsdale': { NB: '70111', SB: '70112' },
  'Belmont': { NB: '70121', SB: '70122' },
  'San Carlos': { NB: '70131', SB: '70132' },
  'Redwood City': { NB: '70141', SB: '70142' },
  'Menlo Park': { NB: '70161', SB: '70162' },
  'Palo Alto': { NB: '70171', SB: '70172' },
  'California Avenue': { NB: '70191', SB: '70192' },
  'San Antonio': { NB: '70201', SB: '70202' },
  'Mountain View': { NB: '70211', SB: '70212' },
  'Sunnyvale': { NB: '70221', SB: '70222' },
  'Lawrence': { NB: '70231', SB: '70232' },
  'Santa Clara': { NB: '70241', SB: '70242' },
  'College Park': { NB: '70251', SB: '70252' },
  'San Jose Diridon': { NB: '70261', SB: '70262' },
  'Tamien': { NB: '70271', SB: '70272' },
  'Capitol': { NB: '70281', SB: '70282' },
  'Blossom Hill': { NB: '70291', SB: '70292' },
  'Morgan Hill': { NB: '70301', SB: '70302' },
  'San Martin': { NB: '70311', SB: '70312' },
  'Gilroy': { NB: '70321', SB: '70322' },
};
// Note: College Park, Capitol, Morgan Hill, San Martin, and Gilroy are commuter only/weekday rushhour stations
// Note: Broadway is a weekend-only/limited-service station

const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

//FramedVehicleJourneyRef for Train #
interface TrainData {
  MonitoredVehicleJourney: {
    DestinationName: string;
    LineRef: string; //"Limited", "Local"
    DirectionRef: string; // "North" or "South"
    FramedVehicleJourneyRef: {
      DatedVehicleJourneyRef: string; // Train Number
    };
    MonitoredCall: {
      ExpectedArrivalTime: string;
    };
  };
}

const StationInfo = ({ stationName }: { stationName: string }) => {
  const [trains, setTrains] = useState<TrainData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset states
    setLoading(true);
    setError(null);
    setTrains([]);

    const stationIds = STATION_IDS[stationName];

    // prevent infinite loading and show error
    if (!stationIds) {
      console.warn(`Station name "${stationName}" not found in dictionary.`);
      setError(`Station "${stationName}" not found.`);
      setLoading(false); // Turns off the spinner!
      return;
    }

    const fetchTrainData = async () => {
      setLoading(true);
      setError(null);
      
      // station Ids
      const stationIds = STATION_IDS[stationName];
      if (!stationIds) return;

      try {
        console.log(`Fetching NB (${stationIds.NB}) and SB (${stationIds.SB}) for ${stationName}`);

        // fetching data ...
        const urls = [
          `https://api.511.org/transit/StopMonitoring?api_key=${API_KEY}&agency=${AGENCY}&stopCode=${stationIds.NB}&format=json`,
          `https://api.511.org/transit/StopMonitoring?api_key=${API_KEY}&agency=${AGENCY}&stopCode=${stationIds.SB}&format=json`
        ];

        // Wait for both requests to finish (parallel-promise.all)
        const responses = await Promise.all(urls.map(url => fetch(url)));
        const jsonResults = await Promise.all(responses.map(res => res.json()));

        // Extract results
        let allTrains: TrainData[] = [];
        jsonResults.forEach(data => {
          const stops = data?.ServiceDelivery?.StopMonitoringDelivery?.MonitoredStopVisit;
          if (stops) {
            // note: API sometimes returns a single object instead of an array if there is only 1 train
            const stopsArray = Array.isArray(stops) ? stops : [stops];
            allTrains = [...allTrains, ...stopsArray];
          }
        });

        // sort trains by Time
        allTrains.sort((a, b) => {
          const timeA = new Date(a.MonitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime).getTime();
          const timeB = new Date(b.MonitoredVehicleJourney.MonitoredCall.ExpectedArrivalTime).getTime();
          return timeA - timeB;
        });

        setTrains(allTrains);

      } catch (err) {
        console.error("API Error:", err);
        setError('Failed to load train data.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainData();
    // refresh every 60 secs
    const interval = setInterval(fetchTrainData, 60000);
    return () => clearInterval(interval);

  }, [stationName]); // refetch data when stationName changes

  const renderTrainItem = ({ item }: { item: TrainData }) => {
    const journey = item.MonitoredVehicleJourney;
    const destination = journey.DestinationName;
    const arrivalTime = journey.MonitoredCall.ExpectedArrivalTime;
    const lineName = journey.LineRef;
    const trainNumber = journey.FramedVehicleJourneyRef?.DatedVehicleJourneyRef || "N/A";

    // Visual color based on destination
    const isNorthbound = destination.toLowerCase().includes('francisco');
    const directionColor = isNorthbound ? '#e1f5fe' : '#fff3e0';
    const directionTextColor = isNorthbound ? '#0277bd' : '#ef6c00';

    return (
      <View style={styles.trainItem}>
        <View style={styles.leftInfo}>
            <Text style={styles.destinationText}>{destination}</Text>
            
            {/* Train Number & Type Row */}
            <View style={styles.detailRow}>
                <View style={[styles.badge, { backgroundColor: directionColor }]}>
                    <Text style={[styles.badgeText, { color: directionTextColor }]}>
                        #{trainNumber}
                    </Text>
                </View>
                <Text style={styles.lineText}>{lineName}</Text>
            </View>
        </View>

        <View style={styles.rightInfo}>
            <Text style={styles.timeText}>{formatTime(arrivalTime)}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
           <Text style={styles.titleText}>{stationName}</Text>
           <Text style={styles.subText}>Live Departure Board</Text>
        </View>

        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={{ marginTop: 10 }}>Loading schedule...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContent}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : trains.length === 0 ? (
          <View style={styles.centerContent}>
            <Text style={{ fontSize: 16, color: '#666' }}>No upcoming trains found.</Text>
          </View>
        ) : (
          <FlatList
            data={trains}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderTrainItem}
            contentContainerStyle={styles.listContent}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  listContent: {
    padding: 16,
  },
  trainItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 12,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leftInfo: {
      flex: 1,
  },
  rightInfo: {
      alignItems: 'flex-end',
      minWidth: 80,
  },
  detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 6,
  },
  badge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      marginRight: 8,
  },
  badgeText: {
      fontSize: 12,
      fontWeight: 'bold',
  },
  titleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  destinationText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  lineText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  timeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
});

export default StationInfo;