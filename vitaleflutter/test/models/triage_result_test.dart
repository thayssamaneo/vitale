import 'package:flutter_test/flutter_test.dart';
import 'package:vitaleflutter/models/patient_profile.dart';
import 'package:vitaleflutter/models/symptom_area.dart';
import 'package:vitaleflutter/models/triage_result.dart';

void main() {
  test('serializes selected regions and their intensity for Firestore', () {
    final area = SymptomArea.all.first;
    final result = TriageResult(
      profile: const PatientProfile(
        name: 'Rian',
        emergencyContactName: 'Ana',
        emergencyPhone: '11987654321',
        relationship: 'Filha(o)',
      ),
      selectedAreas: [area],
      severityByArea: {area.id: 'Forte'},
    );

    expect(result.toFirestore(), {
      'selectedAreas': [
        {'areaId': 'head', 'name': 'Cabeça e crânio', 'severity': 'Forte'},
      ],
    });
  });
}
