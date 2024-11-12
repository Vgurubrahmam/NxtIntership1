import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Modal, StyleSheet, TouchableOpacity } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import Toast from 'react-native-toast-message'; 
interface CourseData {
  id: number;
  course_name: string;
  professor: string;
  start_date: string;
  end_date: string;
}

export function HelloWave() {
  const [data, setData] = useState<CourseData[]>([]);
  const [deleted, setDeleted] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [addCourseModal, setAddCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const [newCourse, setNewCourse] = useState<CourseData>({
    id: 0,
    course_name: "",
    professor: "",
    start_date: "",
    end_date: ""
  });

  const openAddCourseModal = () => {
    setNewCourse({
      id: 0,
      course_name: "",
      professor: "",
      start_date: "",
      end_date: ""
    });
    setAddCourseModal(true);
  };

  const closeAddCourseModal = () => {
    setAddCourseModal(false);
  };

  useEffect(() => {
    fetch("http://localhost:8000/courses")
      .then((res) => res.json())
      .then((response) => {
        if (Array.isArray(response.courses)) {
          setData(response.courses);
        } else {
          console.error("Expected an array but received:", response);
          setData([]);
        }
      })
      .catch((err) => console.error(err));
  }, [deleted]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  const openModal = (course: CourseData) => {
    setSelectedCourse(course);
    setModalVisible(true);
  };

  const closeModal = () => {
    setSelectedCourse(null);
    setModalVisible(false);
  };

  const handleSave = async (id: number | null) => {
    if (selectedCourse && selectedCourse.id !== 0) {
      // Update existing course
      try {
        await fetch(`http://localhost:8000/update-course/${selectedCourse.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            course_name: selectedCourse.course_name,
            professor: selectedCourse.professor,
            start_date: selectedCourse.start_date,
            end_date: selectedCourse.end_date
          })
        });
        Toast.show({
          type: 'success',
          position: 'top',
          text1: 'Course Updated!',
          text2: 'Your course details have been updated successfully.',
        });
      } catch (err) {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Update Failed!',
          text2: 'There was an error updating the course.',
        });
      } finally {
        closeModal();
        setDeleted((prev) => !prev);
      }
    } else {
      // Add new course
      try {
        await fetch("http://localhost:8000/add-course", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(newCourse)
        });
        Toast.show({
          type: 'success',
          position: 'top',
          text1: 'Course Added!',
          text2: 'Your new course has been added successfully.',
        });
      } catch (err) {
        Toast.show({
          type: 'error',
          position: 'top',
          text1: 'Add Failed!',
          text2: 'There was an error adding the course.',
        });
      } finally {
        closeAddCourseModal();
        setDeleted(prev => !prev);
      }
    }
  };

  const handleDeleteCourse = async (id: number) => {
    try {
      await fetch(`http://localhost:8000/delete-course/${id}`, {
        method: "DELETE"
      });
      setDeleted((prev) => !prev);
      Toast.show({
        type: 'success',
        position: 'top',
        text1: 'Course Deleted!',
        text2: 'The course has been deleted successfully.',
      });
    } catch (error) {
      console.log("Error:", error);
      Toast.show({
        type: 'error',
        position: 'top',
        text1: 'Delete Failed!',
        text2: 'There was an error deleting the course.',
      });
    }
  };

  return (
    <View>
      <TouchableOpacity style={styles.addBtn} onPress={openAddCourseModal}>
        <Text style={{color:"white",fontWeight:"bold"}}>Add Course</Text>
      </TouchableOpacity>
      <View style={styles.tableContainer}>
        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.tableHeader]}>ID</Text>
          <Text style={[styles.tableCell, styles.tableHeader]}>Course Name</Text>
          <Text style={[styles.tableCell, styles.tableHeader]}>Professor</Text>
          <Text style={[styles.tableCell, styles.tableHeader]}>Start Date</Text>
          <Text style={[styles.tableCell, styles.tableHeader]}>End Date</Text>
          <Text style={[styles.tableCell, styles.tableHeader]}>Update</Text>
          <Text style={[styles.tableCell, styles.tableHeader]}>Delete</Text>
        </View>

        {data.map((item) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={styles.tableCell}>{item.id}</Text>
            <Text style={styles.tableCell}>{item.course_name}</Text>
            <Text style={styles.tableCell}>{item.professor}</Text>
            <Text style={styles.tableCell}>{formatDate(item.start_date)}</Text>
            <Text style={styles.tableCell}>{formatDate(item.end_date)}</Text>
            <TouchableOpacity onPress={() => openModal(item)} style={styles.tableCell}>
             <Ionicons name="pencil-sharp" size={20} color={'black'} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.tableCell} onPress={() => handleDeleteCourse(item.id)}>
              <Ionicons name="trash" size={20} color={'black'} />
            </TouchableOpacity>
          </View>
        ))}

        {selectedCourse && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={closeModal}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Edit Course</Text>
                <TextInput
                  style={styles.input}
                  value={selectedCourse.course_name}
                  placeholder="Course Name"
                  onChangeText={(text) =>
                    setSelectedCourse((prevCourse) => prevCourse && { ...prevCourse, course_name: text })
                  }
                />
                <TextInput
                  style={styles.input}
                  value={selectedCourse.professor}
                  placeholder="Professor"
                  onChangeText={(text) =>
                    setSelectedCourse((prevCourse) => prevCourse && { ...prevCourse, professor: text })
                  }
                />
                <TextInput
                  style={styles.input}
                  value={formatDate(selectedCourse.start_date)}
                  placeholder="Start Date (DD/MM/YYYY)"
                  onChangeText={(text) =>
                    setSelectedCourse((prevCourse) => prevCourse && { ...prevCourse, start_date: text })
                  }
                />
                <TextInput
                  style={styles.input}
                  value={formatDate(selectedCourse.end_date)}
                  placeholder="End Date (DD/MM/YYYY)"
                  onChangeText={(text) =>
                    setSelectedCourse((prevCourse) => prevCourse && { ...prevCourse, end_date: text })
                  }
                />
                <Button title="Save" onPress={() => handleSave(selectedCourse.id)} />
                <Button title="Cancel" onPress={closeModal} color="red" />
              </View>
            </View>
          </Modal>
        )}

        <Modal
          animationType="slide"
          transparent={true}
          visible={addCourseModal}
          onRequestClose={closeAddCourseModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Add Course</Text>
              <TextInput
                style={styles.input}
                value={newCourse.course_name}
                placeholder="Course Name"
                onChangeText={(text) =>
                  setNewCourse((prevCourse) => ({ ...prevCourse, course_name: text }))
                }
              />
              <TextInput
                style={styles.input}
                value={newCourse.professor}
                placeholder="Professor"
                onChangeText={(text) =>
                  setNewCourse((prevCourse) => ({ ...prevCourse, professor: text }))
                }
              />
              <TextInput
                style={styles.input}
                value={newCourse.start_date}
                placeholder="Start Date"
                onChangeText={(text) =>
                  setNewCourse((prevCourse) => ({ ...prevCourse, start_date: text }))
                }
              />
              <TextInput
                style={styles.input}
                value={newCourse.end_date}
                placeholder="End Date"
                onChangeText={(text) =>
                  setNewCourse((prevCourse) => ({ ...prevCourse, end_date: text }))
                }
              />
              <Button title="Add Course" onPress={() => handleSave(null)} />
              <Button title="Cancel" onPress={closeAddCourseModal} color="red" />
            </View>
          </View>
        </Modal>

        <Toast /> {/* Render Toast for notifications */}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  tableContainer: {
    paddingTop: 20,
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    marginLeft:"auto",
    justifyContent:"center",
    alignItems:"center"
  },
  tableHeader: {
    fontWeight: 'bold',
  },
  addBtn: {
    backgroundColor: 'gray',
    color: '#fff',
    padding: 10,
    textAlign: 'center',
    borderRadius: 5,
    marginBottom: 10,
    width:100,
    marginLeft:"auto",
    marginRight:"auto",
    fontWeight:"bold"
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    width: '80%',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
  },
});