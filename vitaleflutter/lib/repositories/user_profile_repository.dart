import 'package:cloud_firestore/cloud_firestore.dart';

import '../models/patient_profile.dart';

class UserProfileRepository {
  UserProfileRepository({FirebaseFirestore? firestore})
    : _firestore = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _firestore;

  Future<void> save(String uid, PatientProfile profile) async {
    final document = _firestore.collection('users').doc(uid);
    final existing = await document.get();
    final profileData = profile.toFirestore();

    if (existing.exists) {
      await document.set({
        ...profileData,
        'updatedAt': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));
      return;
    }

    await document.set({
      ...profileData,
      'createdAt': FieldValue.serverTimestamp(),
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  Future<PatientProfile?> getByUid(String uid) async {
    final snapshot = await _firestore.collection('users').doc(uid).get();
    final data = snapshot.data();
    if (!snapshot.exists || data == null) {
      return null;
    }
    return PatientProfile.fromFirestore(data);
  }
}
