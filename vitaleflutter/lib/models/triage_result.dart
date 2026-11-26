import 'patient_profile.dart';
import 'symptom_area.dart';

class TriageResult {
  const TriageResult({
    required this.profile,
    required this.selectedAreas,
    required this.severityByArea,
  });

  final PatientProfile profile;
  final List<SymptomArea> selectedAreas;
  final Map<String, String> severityByArea;

  Map<String, dynamic> toFirestore() => {
    'selectedAreas': selectedAreas
        .map(
          (area) => {
            'areaId': area.id,
            'name': area.name,
            'severity': severityByArea[area.id] ?? 'Moderada',
          },
        )
        .toList(growable: false),
  };
}
