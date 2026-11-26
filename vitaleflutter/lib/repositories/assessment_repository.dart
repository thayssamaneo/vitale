import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../models/triage_result.dart';

class AssessmentRepository {
  AssessmentRepository({
    FirebaseFirestore? firestore,
    FirebaseAuth? firebaseAuth,
  }) : _firestore = firestore ?? FirebaseFirestore.instance,
       _firebaseAuth = firebaseAuth ?? FirebaseAuth.instance;

  final FirebaseFirestore _firestore;
  final FirebaseAuth _firebaseAuth;

  Future<void> save(TriageResult result) async {
    final uid = _firebaseAuth.currentUser?.uid;
    if (uid == null) {
      throw StateError('É necessário entrar para salvar a avaliação.');
    }

    await _firestore.collection('users').doc(uid).collection('assessments').add(
      {...result.toFirestore(), 'createdAt': FieldValue.serverTimestamp()},
    );
  }
}
