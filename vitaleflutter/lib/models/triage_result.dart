import 'patient_profile.dart';
import 'symptom_area.dart';

class TriageResult {
  const TriageResult({required this.profile, required this.selectedAreas});

  final PatientProfile profile;
  final List<SymptomArea> selectedAreas;
}
