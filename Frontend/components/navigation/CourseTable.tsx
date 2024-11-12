import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Table = () => {
  // Sample table data
  const tableData = [
    { id: 1, name: 'John Doe', age: 28, city: 'New York' },
    { id: 2, name: 'Jane Smith', age: 34, city: 'Los Angeles' },
    { id: 3, name: 'Sam Johnson', age: 21, city: 'Chicago' },
  ];

  return (
    <View style={styles.tableContainer}>
      {/* Table Header */}
      <View style={styles.tableRow}>
        <Text style={[styles.tableCell, styles.tableHeader]}>ID</Text>
        <Text style={[styles.tableCell, styles.tableHeader]}>Name</Text>
        <Text style={[styles.tableCell, styles.tableHeader]}>Age</Text>
        <Text style={[styles.tableCell, styles.tableHeader]}>City</Text>
        <Text style={[styles.tableCell, styles.tableHeader]}>Update</Text>
        <Text style={[styles.tableCell, styles.tableHeader]}>Delete</Text>

      </View>

      {/* Table Rows */}
      {tableData.map((item) => (
        <View key={item.id} style={styles.tableRow}>
          <Text style={styles.tableCell}>{item.id}</Text>
          <Text style={styles.tableCell}>{item.name}</Text>
          <Text style={styles.tableCell}>{item.age}</Text>
          <Text style={styles.tableCell}>{item.city}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tableContainer: {
    padding: 16,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 8,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
  },
  tableHeader: {
    fontWeight: 'bold',
    color: '#333',
  },
});

export default Table;
