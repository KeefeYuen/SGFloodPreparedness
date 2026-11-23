import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";

import BottomNav from "../components/BottomNav";

import { auth, db } from "../FireBaseConfig";
import { ref, get, set } from "firebase/database";

const contacts = [
  {
    title: "Police Emergency",
    number: "999",
    description: "For immediate police assistance",
  },
  {
    title: "Ambulance & Fire Service (SCDF)",
    number: "995",
    description: "For medical emergencies and fires",
  },
  {
    title: "Non-Emergency Ambulance",
    number: "1777",
    description: "For non-emergency ambulance services",
  },
  {
    title: "Police Hotline (Non-Emergency)",
    number: "1800 255 0000",
    description: "For non-emergency police matters",
  },
];

export default function EContactScreen({ navigation }) {
  const [customContacts, setCustomContacts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [contactName, setContactName] = useState("");
  const [contactNumber, setContactNumber] = useState("");

  const [loading, setLoading] = useState(true);

  // Load saved contacts from Firebase
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          setLoading(false);
          return;
        }

        const contactsRef = ref(db, `users/${user.uid}/emergencyContacts`);

        const snapshot = await get(contactsRef);

        if (snapshot.exists()) {
          const data = snapshot.val();

          const savedContacts = Object.values(data);

          setCustomContacts(savedContacts);
        } else {
          setCustomContacts([]);
        }
      } catch (error) {
        console.log("Error loading emergency contacts:", error);

        Alert.alert("Error", "Could not load your emergency contacts.");
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, []);

  // Save contacts to Firebase
  const saveContactsToFirebase = async (updatedContacts) => {
    try {
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Not logged in", "Please log in to save your contacts.");
        return false;
      }

      const contactsRef = ref(db, `users/${user.uid}/emergencyContacts`);

      await set(contactsRef, updatedContacts);

      return true;
    } catch (error) {
      console.log("Error saving emergency contacts:", error);

      Alert.alert("Error", "Could not save your emergency contacts.");

      return false;
    }
  };

  // Add a new contact
  const addContact = async () => {
    if (!contactName.trim() || !contactNumber.trim()) {
      Alert.alert(
        "Missing Information",
        "Please enter both a contact name and phone number.",
      );
      return;
    }

    // Only allow numbers
    if (!/^[0-9]+$/.test(contactNumber.trim())) {
      Alert.alert("Invalid Phone Number", "Please enter numbers only.");
      return;
    }

    if (contactNumber.trim().length !== 8) {
      Alert.alert(
        "Invalid Phone Number",
        "Please enter an 8-digit phone number.",
      );
      return;
    }

    const newContact = {
      title: contactName.trim(),
      number: contactNumber.trim(),
      description: "Personal emergency contact",
      custom: true,
    };

    const updatedContacts = [...customContacts, newContact];
    const saved = await saveContactsToFirebase(updatedContacts);

    if (!saved) {
      return;
    }

    setCustomContacts(updatedContacts);

    setContactName("");
    setContactNumber("");
    setModalVisible(false);
  };

  // Delete a contact
  const deleteContact = (index) => {
    Alert.alert(
      "Delete Contact",
      "Are you sure you want to delete this contact?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedContacts = customContacts.filter(
              (_, i) => i !== index,
            );

            const saved = await saveContactsToFirebase(updatedContacts);

            if (!saved) {
              return;
            }

            setCustomContacts(updatedContacts);
          },
        },
      ],
    );
  };

  // Call a contact
  const callContact = (number) => {
    Linking.openURL(`tel:${number.replace(/\s/g, "")}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>Loading contacts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Emergency Contacts</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.addButtonText}>+ Add Contact</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {customContacts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>My Contacts</Text>

            {customContacts.map((contact, index) => (
              <View key={`custom-${index}`} style={styles.card}>
                <View style={styles.contactInfo}>
                  <Text style={styles.title}>{contact.title}</Text>

                  <Text style={styles.description}>{contact.description}</Text>
                </View>

                <View style={styles.actionContainer}>
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => callContact(contact.number)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.number}>{contact.number}</Text>

                    <Text style={styles.callText}>Call</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => deleteContact(index)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Official Emergency Contacts */}
        <Text style={styles.sectionTitle}>Emergency Services</Text>

        {contacts.map((contact, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.contactInfo}>
              <Text style={styles.title}>{contact.title}</Text>

              <Text style={styles.description}>{contact.description}</Text>
            </View>

            <TouchableOpacity
              style={styles.callButton}
              onPress={() => callContact(contact.number)}
              activeOpacity={0.7}
            >
              <Text style={styles.number}>{contact.number}</Text>

              <Text style={styles.callText}>Call</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Add Contact Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Emergency Contact</Text>

            <TextInput
              style={styles.input}
              placeholder="Contact Name"
              value={contactName}
              onChangeText={setContactName}
            />

            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={contactNumber}
              onChangeText={(text) =>
                setContactNumber(text.replace(/[^0-9]/g, ""))
              }
              keyboardType="phone-pad"
              maxLength={8}
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={addContact}
              activeOpacity={0.7}
            >
              <Text style={styles.saveButtonText}>Save Contact</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                setContactName("");
                setContactNumber("");
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomNav navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    padding: 20,
    paddingTop: 60,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },

  heading: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },

  addButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },

  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  list: {
    paddingBottom: 100,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 5,
  },

  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#5CD6C3",
    borderRadius: 10,
    backgroundColor: "#D4FAF0",
  },

  contactInfo: {
    flex: 1,
    paddingRight: 10,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
    color: "#222",
  },

  description: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },

  actionContainer: {
    alignItems: "center",
  },

  callButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F2FFFB",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  number: {
    fontSize: 14,
    fontWeight: "700",
    color: "#007AFF",
  },

  callText: {
    fontSize: 12,
    color: "#007AFF",
    marginTop: 3,
  },

  deleteText: {
    color: "#d00",
    fontSize: 12,
    marginTop: 8,
  },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: 20,
  },

  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },

  saveButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },

  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  cancelText: {
    textAlign: "center",
    color: "#666",
    marginTop: 15,
    fontSize: 15,
  },
});
