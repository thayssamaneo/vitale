import 'package:flutter_test/flutter_test.dart';
import 'package:vitaleflutter/models/patient_profile.dart';

void main() {
  const profile = PatientProfile(
    name: 'Rian',
    emergencyContactName: 'Ana',
    emergencyPhone: '(11) 98765-4321',
    relationship: 'Filha(o)',
  );

  test('serializes the emergency contact inside the user profile', () {
    expect(profile.toFirestore(), {
      'name': 'Rian',
      'emergencyContact': {
        'name': 'Ana',
        'phone': '(11) 98765-4321',
        'relationship': 'Filha(o)',
      },
    });
  });

  test('rejects a malformed Firestore profile', () {
    expect(
      () => PatientProfile.fromFirestore({'name': 'Rian'}),
      throwsFormatException,
    );
  });
}
