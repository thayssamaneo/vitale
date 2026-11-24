class PatientProfile {
  const PatientProfile({
    required this.name,
    required this.emergencyContactName,
    required this.emergencyPhone,
    required this.relationship,
  });

  final String name;
  final String emergencyContactName;
  final String emergencyPhone;
  final String relationship;
}
