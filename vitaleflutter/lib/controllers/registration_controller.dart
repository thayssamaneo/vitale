import '../models/patient_profile.dart';

class RegistrationController {
  String? validateName(String? value) {
    if (value == null || value.trim().length < 2) {
      return 'Digite pelo menos 2 caracteres.';
    }
    return null;
  }

  String? validatePhone(String? value) {
    final digits = value?.replaceAll(RegExp(r'\D'), '') ?? '';
    if (digits.length < 10 || digits.length > 13) {
      return 'Digite um telefone válido com DDD.';
    }
    return null;
  }

  PatientProfile createProfile({
    required String name,
    required String emergencyContactName,
    required String emergencyPhone,
    required String relationship,
  }) {
    return PatientProfile(
      name: name.trim(),
      emergencyContactName: emergencyContactName.trim(),
      emergencyPhone: emergencyPhone.trim(),
      relationship: relationship,
    );
  }
}
