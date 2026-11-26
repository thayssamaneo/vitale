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

  Map<String, dynamic> toFirestore() => {
    'name': name,
    'emergencyContact': {
      'name': emergencyContactName,
      'phone': emergencyPhone,
      'relationship': relationship,
    },
  };

  factory PatientProfile.fromFirestore(Map<String, dynamic> data) {
    final contact = data['emergencyContact'];
    if (data['name'] is! String || contact is! Map) {
      throw const FormatException('Perfil do usuário inválido no Firestore.');
    }

    final contactData = Map<String, dynamic>.from(contact);
    if (contactData['name'] is! String ||
        contactData['phone'] is! String ||
        contactData['relationship'] is! String) {
      throw const FormatException('Contato de emergência inválido.');
    }

    return PatientProfile(
      name: data['name'] as String,
      emergencyContactName: contactData['name'] as String,
      emergencyPhone: contactData['phone'] as String,
      relationship: contactData['relationship'] as String,
    );
  }
}
