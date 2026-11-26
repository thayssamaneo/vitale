import '../models/patient_profile.dart';

class RegistrationController {
  String? validateEmail(String? value) {
    final email = value?.trim() ?? '';
    if (!RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch(email)) {
      return 'Digite um e-mail válido.';
    }
    return null;
  }

  String? validatePassword(String? value) {
    if (value == null || value.length < 8) {
      return 'Use uma senha com pelo menos 8 caracteres.';
    }
    return null;
  }

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
