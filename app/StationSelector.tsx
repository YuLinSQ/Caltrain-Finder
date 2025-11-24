import React, { useState } from 'react';
import { Text, StyleSheet, View, Modal, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';

interface StationSelectorProps {
  selectedStation: string;
  onSelectStation: (station: string) => void;
}

const StationSelector = ({ selectedStation, onSelectStation }: StationSelectorProps) => {
  const stations = [
    "San Francisco 4th & King", "22nd Street", "Bayshore", "South San Francisco",
    "San Bruno", "Millbrae", "Broadway", "Burlingame", "San Mateo", "Hayward Park",
    "Hillsdale", "Belmont", "San Carlos", "Redwood City", "Menlo Park", "Palo Alto",
    "California Avenue", "San Antonio", "Mountain View", "Sunnyvale", "Lawrence",
    "Santa Clara", "College Park", "San Jose Diridon", "Tamien", "Capitol",
    "Blossom Hill", "Morgan Hill", "San Martin", "Gilroy"
  ];

  // We keep the UI state (is the modal open?) inside the component
  const [modalVisible, setModalVisible] = useState(false);

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => {
        onSelectStation(item); // 2. Pass data back to parent
        setModalVisible(false);
      }}
    >
      <Text style={styles.itemText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}> 
      <Text style={styles.label}>Select a Caltrain Station:</Text>

      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setModalVisible(true)}
      >
        {/* 3. Display the prop value */}
        <Text style={styles.dropdownButtonText}>
            {selectedStation || "Choose a Station..."}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Choose Station</Text>
            
            <FlatList
              data={stations}
              renderItem={renderItem}
              keyExtractor={(item) => item}
              style={styles.list}
            />

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // NOTE: I changed container flex:1 to width: '100%' so it fits inside Index better
  container: {
    width: '100%', 
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dropdownButtonText: {
    fontSize: 16,
  },
  arrow: {
    fontSize: 16,
    color: '#666',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '85%',
    maxHeight: '60%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  list: {
    width: '100%',
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
  },
  itemText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default StationSelector;